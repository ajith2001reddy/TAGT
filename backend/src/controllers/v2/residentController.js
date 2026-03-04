import mongoose from "mongoose";
import User from "../../models/User.js";
import Payment from "../../models/Payment.js";
import Room from "../../models/rooms.js";
import { buildPropertyFilter } from "../../utils/tenantScope.js";
import { createResidentWorkflow, sendWelcomeEmailSafe } from "../../services/residentService.js";
/**
 * List residents for a property
 */
export const listResidents = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const filter = req.user.role === "resident"
            ? { _id: req.user._id }
            : { role: "resident", ...scope };

        const residents = await User.find(filter)
            .populate("roomId", "roomNumber rent")
            .lean();

        return res.json({ success: true, data: residents });
    } catch (err) {
        next(err);
    }
};

/**
 * Create a new resident using the service workflow
 */
export const createResident = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const propertyId = req.body.propertyId || req.user.propertyId;
        if (!propertyId) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "propertyId is required" });
        }

        // 🔐 SECURITY: Ensure owner owns this property
        if (req.user.role === "owner" && !req.user.propertyIds?.some(id => id.toString() === propertyId.toString())) {
            await session.abortTransaction();
            return res.status(403).json({ success: false, message: "Unauthorized property access" });
        }

        const { resident, tempPassword } = await createResidentWorkflow({
            ...req.body,
            propertyId
        }, session);

        await session.commitTransaction();

        // Async welcome email (fire-and-forget)
        sendWelcomeEmailSafe(resident, propertyId);

        return res.status(201).json({ success: true, data: resident });
    } catch (err) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: err.message });
    } finally {
        session.endSession();
    }
};

/**
 * Move resident to a different room
 */
export const moveResidentRoom = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const { newRoomId } = req.body;
        const scope = buildPropertyFilter(req.user);
        const pm = scope.propertyId ? { propertyId: scope.propertyId } : {};

        const resident = await User.findOne({ _id: id, role: "resident", ...pm }).session(session);
        if (!resident) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Resident not found" });
        }

        if (resident.roomId) {
            await Room.findByIdAndUpdate(resident.roomId, { $inc: { occupiedBeds: -1 } }).session(session);
        }

        const newRoom = await Room.findOne({ _id: newRoomId, ...pm }).session(session);
        if (!newRoom) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Target room not found" });
        }

        if (newRoom.occupiedBeds >= newRoom.totalBeds) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Target room is full" });
        }

        newRoom.occupiedBeds += 1;
        await newRoom.save({ session });

        resident.roomId = newRoom._id;
        await resident.save({ session });

        await session.commitTransaction();
        return res.json({ success: true, data: resident });
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
};

/**
 * Deactivate a resident (checkout)
 */
export const deactivateResident = async (req, res, next) => {
    try {
        const { id } = req.params;
        const scope = buildPropertyFilter(req.user);
        const pm = scope.propertyId ? { propertyId: scope.propertyId } : {};

        const resident = await User.findOneAndUpdate(
            { _id: id, role: "resident", ...pm },
            { isActive: false, roomId: null },
            { new: true }
        );

        if (!resident) return res.status(404).json({ success: false, message: "Resident not found" });

        if (resident.roomId) {
            await Room.findByIdAndUpdate(resident.roomId, { $inc: { occupiedBeds: -1 } });
        }

        return res.json({ success: true, data: resident });
    } catch (err) {
        next(err);
    }
};

/**
 * Add a note to a resident's profile
 */
export const addResidentNote = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const pm = scope.propertyId ? { propertyId: scope.propertyId } : {};
        const { note } = req.body;

        if (!note?.trim()) return res.status(400).json({ success: false, message: "note is required" });

        const resident = await User.findOneAndUpdate(
            { _id: req.params.id, role: "resident", ...pm },
            { $push: { notes: { text: note.trim(), addedBy: req.user._id, addedAt: new Date() } } },
            { new: true }
        );

        if (!resident) return res.status(404).json({ success: false, message: "Resident not found" });
        return res.json({ success: true, data: resident.notes });
    } catch (err) {
        next(err);
    }
};

/**
 * Get detailed history (payments) for a resident
 */
export const getResidentHistory = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const pm = scope.propertyId ? { propertyId: scope.propertyId } : {};
        const { id } = req.params;

        const resident = await User.findOne({ _id: id, role: "resident", ...pm }, "name email roomId")
            .populate("roomId", "roomNumber rent")
            .lean();

        if (!resident) return res.status(404).json({ success: false, message: "Resident not found" });

        const payments = await Payment.find({ resident: id, ...pm })
            .sort({ month: -1 })
            .lean();

        return res.json({ success: true, data: { resident, payments } });
    } catch (err) {
        next(err);
    }
};
