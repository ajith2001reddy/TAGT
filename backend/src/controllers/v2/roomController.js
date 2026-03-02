import mongoose from "mongoose";
import Room from "../../models/rooms.js";
import Bed from "../../models/Bed.js";
import logger from "../../utils/logger.js";
import { buildPropertyFilter } from "../../utils/tenantScope.js";

/**
 * List all rooms for a property
 */
export const listRooms = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const filter = scope.propertyId ? { propertyId: scope.propertyId } : {};

        const rooms = await Room.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        return res.json({ success: true, data: rooms });
    } catch (err) {
        logger.error(`LIST ROOMS ERROR: ${err.message}`);
        next(err);
    }
};

/**
 * Create a new room and its beds
 */
export const createRoom = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { roomNumber, rent, totalBeds, note, maintenanceMode, maintenanceNote } = req.body;
        const propertyId = req.body.propertyId || req.user.propertyId;

        if (!propertyId) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "propertyId is required" });
        }

        // 🔐 SECURITY: Ensure owner owns this property
        if (req.user.role === "owner" && !req.user.propertyIds?.includes(propertyId)) {
            await session.abortTransaction();
            return res.status(403).json({ success: false, message: "Unauthorized property access" });
        }

        if (!roomNumber || !rent || !totalBeds) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Room number, rent, and total beds are required" });
        }

        // Check if room number exists for this property
        const exists = await Room.findOne({ roomNumber, propertyId }).session(session);
        if (exists) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Room number already exists in this property" });
        }

        const [room] = await Room.create([{
            propertyId,
            roomNumber,
            rent: Number(rent),
            totalBeds: Number(totalBeds),
            occupiedBeds: 0,
            maintenanceMode: Boolean(maintenanceMode),
            maintenanceNote: maintenanceNote || "",
            note: note || ""
        }], { session });

        // Generate Beds
        const beds = [];
        for (let i = 1; i <= Number(totalBeds); i++) {
            beds.push({
                propertyId,
                roomId: room._id,
                bedNumber: `Bed ${String(i).padStart(2, '0')}`,
                status: "available"
            });
        }

        const createdBeds = await Bed.insertMany(beds, { session });

        // Update Room with Bed IDs
        room.beds = createdBeds.map(b => b._id);
        await room.save({ session });

        await session.commitTransaction();
        logger.info(`Room created: ${room.roomNumber} with ${totalBeds} beds`);

        return res.status(201).json({ success: true, data: room });
    } catch (err) {
        await session.abortTransaction();
        logger.error(`CREATE ROOM ERROR: ${err.message}`);
        next(err);
    } finally {
        session.endSession();
    }
};

/**
 * Update room details
 */
export const updateRoom = async (req, res, next) => {
    try {
        const { id } = req.params;
        const scope = buildPropertyFilter(req.user);

        const filter = { _id: id, ...(scope.propertyId ? { propertyId: scope.propertyId } : {}) };

        const update = {
            ...(req.body.roomNumber !== undefined ? { roomNumber: req.body.roomNumber } : {}),
            ...(req.body.rent !== undefined ? { rent: Number(req.body.rent) } : {}),
            ...(req.body.totalBeds !== undefined ? { totalBeds: Number(req.body.totalBeds) } : {}),
            ...(req.body.maintenanceMode !== undefined ? { maintenanceMode: Boolean(req.body.maintenanceMode) } : {}),
            ...(req.body.maintenanceNote !== undefined ? { maintenanceNote: req.body.maintenanceNote } : {}),
            ...(req.body.note !== undefined ? { note: req.body.note } : {})
        };

        const room = await Room.findOneAndUpdate(filter, update, { new: true });

        if (!room) return res.status(404).json({ success: false, message: "Room not found" });

        return res.json({ success: true, data: room });
    } catch (err) {
        logger.error(`UPDATE ROOM ERROR: ${err.message}`);
        next(err);
    }
};

/**
 * Get Room Stats for the property
 */
export const getRoomStats = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const propertyMatch = scope.propertyId ? { propertyId: scope.propertyId } : {};

        const [rooms, statsAgg] = await Promise.all([
            Room.countDocuments(propertyMatch),
            Room.aggregate([
                { $match: propertyMatch },
                {
                    $group: {
                        _id: null,
                        totalBeds: { $sum: "$totalBeds" },
                        occupiedBeds: { $sum: "$occupiedBeds" },
                        totalRent: { $sum: "$rent" }
                    }
                }
            ])
        ]);

        const stats = statsAgg[0] || { totalBeds: 0, occupiedBeds: 0, totalRent: 0 };
        const averageRent = rooms > 0 ? Math.round(stats.totalRent / rooms) : 0;

        return res.json({
            success: true,
            data: {
                totalRooms: rooms,
                totalBeds: stats.totalBeds,
                occupiedBeds: stats.occupiedBeds,
                averageRent
            }
        });
    } catch (err) {
        next(err);
    }
};
