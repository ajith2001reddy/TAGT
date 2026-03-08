import mongoose from "mongoose";
import propertyService from "../../services/propertyService.js";
import User from "../../models/User.js";
import Room from "../../models/rooms.js";
import Bed from "../../models/Bed.js";
import logger from "../../utils/logger.js";
import { buildPropertyFilter } from "../../utils/tenantScope.js";

/**
 * Assign a resident to a bed (Atomic update)
 */
export const assignResidentToBed = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params; // bedId
        const { residentId } = req.body;

        const bed = await Bed.findById(id).session(session);
        if (!bed) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Bed not found" });
        }

        // 🔐 SECURITY: Ensure owner owns this property
        if (req.user.role === "owner" && !req.user.propertyIds?.some(pid => pid.toString() === bed.propertyId.toString())) {
            await session.abortTransaction();
            return res.status(403).json({ success: false, message: "Unauthorized property access" });
        }

        if (bed.status === "occupied" && bed.residentId?.toString() !== residentId) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Bed is already occupied" });
        }

        // 1. Find User (Resident)
        const user = await User.findById(residentId).session(session);
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const oldRoomId = user.roomId?.toString();
        const oldBedId = user.bedId?.toString();
        const newRoomId = bed.roomId.toString();
        const newBedId = bed._id.toString();

        // 2. Handle Logic for "Leaving" the old setup
        if (oldBedId && oldBedId !== newBedId) {
            // Mark the old bed as available
            await Bed.findByIdAndUpdate(oldBedId, { status: "available", residentId: null }).session(session);
        }

        if (oldRoomId && oldRoomId !== newRoomId) {
            // Decrement occupancy for the room they are leaving
            await Room.findByIdAndUpdate(oldRoomId, { $inc: { occupiedBeds: -1 } }).session(session);
        }

        // 3. Handle Logic for "Entering" the new setup
        // Only increment the new room counter if they weren't already counted in it
        if (oldRoomId !== newRoomId) {
            await Room.findByIdAndUpdate(newRoomId, { $inc: { occupiedBeds: 1 } }).session(session);
        }

        // 4. Update the Bed to Occupied
        bed.status = "occupied";
        bed.residentId = residentId;
        await bed.save({ session });

        // 5. Update the User profile
        user.roomId = bed.roomId;
        user.bedId = bed._id;
        user.propertyId = bed.propertyId;
        await user.save({ session });

        await session.commitTransaction();

        logger.info(`[MOVE] Resident ${user.name} moved to Room ${newRoomId} Bed ${newBedId}`);
        return res.json({ success: true, message: "Resident assigned successfully", data: { bed, user } });
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
};

/**
 * List all beds for a property or room
 */
export const listBeds = async (req, res, next) => {
    try {
        const { propertyId: requestedPropertyId, roomId } = req.query;
        const scope = buildPropertyFilter(req.user, requestedPropertyId);
        const filter = { ...scope };
        if (roomId) filter.roomId = roomId;

        const bedsResult = await Bed.find(filter)
            .populate("residentId", "name email isActive isDeleted");

        // 🔄 SELF-HEALING: Verify bed occupancy
        const syncedBeds = await Promise.all(bedsResult.map(async (bed) => {
            if (bed.status === "occupied" && (!bed.residentId || bed.residentId.isActive === false || bed.residentId.isDeleted === true)) {
                logger.info(`[SYNC] Freeing Ghost Bed: Room ${bed.roomId} Bed ${bed.bedNumber}`);
                bed.status = "available";
                bed.residentId = null;
                await bed.save();
            }
            return bed.toObject();
        }));

        return res.json({ success: true, data: syncedBeds });
    } catch (err) {
        next(err);
    }
};

/**
 * Create beds for a room
 */
export const createBeds = async (req, res, next) => {
    try {
        const { propertyId, roomId, count } = req.body;

        if (!propertyId || !roomId || !count) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // 🔐 SECURITY: Ensure owner owns this property
        if (req.user.role === "owner" && !req.user.propertyIds?.some(id => id.toString() === propertyId.toString())) {
            return res.status(403).json({ success: false, message: "Unauthorized property access" });
        }

        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ success: false, message: "Room not found" });

        const beds = [];
        const existingCount = await Bed.countDocuments({ roomId });

        for (let i = 1; i <= count; i++) {
            beds.push({
                propertyId,
                roomId,
                bedNumber: `Bed ${existingCount + i}`,
                status: "available"
            });
        }

        const createdBeds = await Bed.insertMany(beds);

        // Update room with new bed IDs
        await Room.findByIdAndUpdate(roomId, {
            $push: { beds: { $each: createdBeds.map(b => b._id) } },
            $inc: { totalBeds: count }
        });

        return res.status(201).json({ success: true, data: createdBeds });
    } catch (err) {
        next(err);
    }
};

/**
 * Update bed status
 */
export const updateBedStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, residentId } = req.body;

        const bed = await propertyService.update(id, { status, residentId });
        if (!bed) return res.status(404).json({ success: false, message: "Bed not found" });

        return res.json({ success: true, data: bed });
    } catch (err) {
        next(err);
    }
};
