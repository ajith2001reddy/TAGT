import mongoose from "mongoose";
import Room from "../../models/rooms.js";
import Bed from "../../models/Bed.js";
import User from "../../models/User.js";
import Property from "../../models/Property.js";
import propertyService from "../../services/propertyService.js";
import logger from "../../utils/logger.js";
import { buildPropertyFilter } from "../../utils/tenantScope.js";
import Joi from "joi";

/**
 * List all rooms for a property
 */
export const listRooms = async (req, res, next) => {
    try {
        const requestedPropertyId = req.query.propertyId || null;
        const scope = buildPropertyFilter(req.user, requestedPropertyId);
        const filter = scope.propertyId ? { propertyId: scope.propertyId } : {};

        const rooms = await Room.find(filter)
            .populate("propertyId", "name")
            .sort({ createdAt: -1 });

        // 🔄 SELF-HEALING: Verify and sync occupancy counts
        const syncedRooms = await Promise.all(rooms.map(async (room) => {
            const actualCount = await User.countDocuments({
                roomId: room._id,
                isActive: { $ne: false },
                isDeleted: { $ne: true }
            });

            if (room.occupiedBeds !== actualCount) {
                logger.info(`[SYNC] Fixing occupancy for Room ${room.roomNumber}: ${room.occupiedBeds} -> ${actualCount}`);
                room.occupiedBeds = actualCount;
                await room.save();
            }
            return room.toObject();
        }));

        return res.json({ success: true, data: syncedRooms });
    } catch (err) {
        logger.error(`LIST ROOMS ERROR: ${err.message}`);
        next(err);
    }
};

/**
 * Create a new room and its beds
 */
export const createRoom = async (req, res, next) => {
    const session = process.env.NODE_ENV === "test" ? null : await mongoose.startSession();
    if (session) session.startTransaction();

    try {
        const schema = Joi.object({
            roomNumber: Joi.string().required(),
            rent: Joi.number().min(0).required(),
            totalBeds: Joi.number().integer().min(1).required(),
            propertyId: Joi.string().required(),
            note: Joi.string().allow(""),
            maintenanceMode: Joi.boolean(),
            maintenanceNote: Joi.string().allow("")
        });

        const { error, value } = schema.validate({ ...req.body, propertyId: req.body.propertyId || req.user.propertyId });
        if (error) {
            if (session) await session.abortTransaction();
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { roomNumber, rent, totalBeds, note, maintenanceMode, maintenanceNote, propertyId } = value;

        // Check if room number exists for this property
        const exists = await Room.findOne({ roomNumber, propertyId }).session(session);
        if (exists) {
            if (session) await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Room number already exists in this property" });
        }

        const [room] = await Room.create([{
            propertyId: String(propertyId),
            roomNumber: String(roomNumber).trim(),
            rent: Number(rent),
            totalBeds: Number(totalBeds),
            occupiedBeds: 0,
            maintenanceMode: Boolean(maintenanceMode),
            maintenanceNote: String(maintenanceNote || "").trim(),
            note: String(note || "").trim()
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

        const createdBeds = await Bed.create(beds, { session, ordered: true });

        // Update Room with Bed IDs
        room.beds = createdBeds.map(b => b._id);
        await room.save({ session });

        if (session) await session.commitTransaction();
        logger.info(`Room created: ${room.roomNumber} with ${totalBeds} beds`);

        return res.status(201).json({ success: true, data: room });
    } catch (err) {
        if (session) await session.abortTransaction();
        logger.error(`CREATE ROOM ERROR: ${err.message}`);
        next(err);
    } finally {
        if (session) session.endSession();
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

        const room = await propertyService.update(id, update);

        if (!room) return res.status(404).json({ success: false, message: "Room not found" });

        return res.json({ success: true, data: room });
    } catch (err) {
        logger.error(`UPDATE ROOM ERROR: ${err.message}`);
        next(err);
    }
};

/**
 * Delete a room and all its associated beds
 */
export const deleteRoom = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const scope = buildPropertyFilter(req.user);

        // Scoped filter: owner can only delete their own property's rooms
        const filter = { _id: id, ...(scope.propertyId ? { propertyId: scope.propertyId } : {}) };
        const room = await Room.findOne(filter).session(session);

        if (!room) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Room not found or access denied" });
        }

        // Prevent deleting occupied rooms
        if (room.occupiedBeds > 0) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Cannot delete a room with occupied beds. Move residents first." });
        }

        // Delete all beds belonging to this room
        await Bed.deleteMany({ roomId: room._id }).session(session);
        await Room.findByIdAndDelete(room._id).session(session);

        await session.commitTransaction();
        logger.info(`Room deleted: ${room.roomNumber} (${room._id})`);

        return res.json({ success: true, message: "Room and its beds deleted successfully" });
    } catch (err) {
        await session.abortTransaction();
        logger.error(`DELETE ROOM ERROR: ${err.message}`);
        next(err);
    } finally {
        session.endSession();
    }
};

/**
 * Get Room Stats for the property
 */
export const getRoomStats = async (req, res, next) => {
    try {
        const requestedPropertyId = req.query.propertyId || null;
        const scope = buildPropertyFilter(req.user, requestedPropertyId);
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
