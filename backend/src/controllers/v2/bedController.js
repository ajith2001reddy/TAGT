import mongoose from "mongoose";
import Bed from "../../models/Bed.js";
import Room from "../../models/rooms.js";
import User from "../../models/User.js";

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

        // 1. Update Bed
        bed.status = "occupied";
        bed.residentId = residentId;
        await bed.save({ session });

        // 2. Update User (Resident)
        const user = await User.findById(residentId).session(session);
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Update user's room and bed info
        user.roomId = bed.roomId;
        user.bedId = bed._id;
        user.propertyId = bed.propertyId;
        await user.save({ session });

        // 3. Update Room (increment occupied count)
        const wasOccupied = bed.status === "occupied" && bed.residentId;
        if (!wasOccupied) {
            await Room.findByIdAndUpdate(bed.roomId, { $inc: { occupiedBeds: 1 } }).session(session);
        }

        await session.commitTransaction();

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
        const { propertyId, roomId } = req.query;
        const filter = {};

        if (propertyId) filter.propertyId = propertyId;
        if (roomId) filter.roomId = roomId;

        const beds = await Bed.find(filter)
            .populate("residentId", "name email")
            .lean();

        return res.json({ success: true, data: beds });
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

        const bed = await Bed.findById(id);
        if (!bed) return res.status(404).json({ success: false, message: "Bed not found" });

        if (status) bed.status = status;
        if (residentId !== undefined) bed.residentId = residentId;

        await bed.save();

        return res.json({ success: true, data: bed });
    } catch (err) {
        next(err);
    }
};
