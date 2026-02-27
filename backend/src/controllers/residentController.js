import logger from "../utils/logger.js";
import mongoose from "mongoose";

import User from "../models/User.js";
import Room from "../models/rooms.js";
import Payment from "../models/Payment.js";
import Request from "../models/Request.js";

export const getAllResidents = async (req, res, next) => {
    try {
        const residents = await User.find({ role: "resident" })
            .populate("roomId", "roomNumber totalBeds occupiedBeds rent")
            .sort({ createdAt: -1 })
            .lean();

        return res.json({ success: true, residents });
    } catch (err) {
        logger.error(`GET RESIDENTS ERROR: ${err.message}`);
        next(err);
    }
};

export const getResidentProfile = async (req, res, next) => {
    try {
        const resident = await User.findOne({ _id: req.params.id, role: "resident" })
            .populate("roomId", "roomNumber rent")
            .lean();

        if (!resident) {
            return res.status(404).json({ success: false, message: "Resident not found" });
        }

        const [paymentSummary, requestSummary] = await Promise.all([
            Payment.aggregate([
                { $match: { resident: resident._id } },
                { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$amount" } } }
            ]),
            Request.aggregate([
                { $match: { resident: resident._id } },
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ])
        ]);

        return res.json({ success: true, resident, paymentSummary, requestSummary });
    } catch (err) {
        logger.error(`GET RESIDENT PROFILE ERROR: ${err.message}`);
        next(err);
    }
};

export const addResident = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { name, email, password, roomNumber, roomId, rent } = req.body;

        if (!name || !email || !password) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Name, email, and password are required" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail }).session(session);
        if (existingUser) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        let roomDoc = null;
        let finalRent = 0;

        if (roomNumber) {
            roomDoc = await Room.findOne({ roomNumber: String(roomNumber) }).session(session);
            if (!roomDoc) {
                await session.abortTransaction();
                return res.status(400).json({ success: false, message: `Room "${roomNumber}" not found` });
            }
        } else if (roomId && mongoose.Types.ObjectId.isValid(roomId)) {
            roomDoc = await Room.findById(roomId).session(session);
            if (!roomDoc) {
                await session.abortTransaction();
                return res.status(400).json({ success: false, message: "Invalid room selected" });
            }
        }

        if (roomDoc) {
            if (roomDoc.maintenanceMode) {
                await session.abortTransaction();
                return res.status(400).json({ success: false, message: "Room is currently in maintenance mode" });
            }
            if (roomDoc.occupiedBeds >= roomDoc.totalBeds) {
                await session.abortTransaction();
                return res.status(400).json({ success: false, message: "No beds available in this room" });
            }
            finalRent = roomDoc.rent || 0;
        }

        if (!roomDoc && rent) {
            const parsedRent = Number(rent);
            if (!Number.isFinite(parsedRent) || parsedRent <= 0) {
                await session.abortTransaction();
                return res.status(400).json({ success: false, message: "Invalid rent amount" });
            }
            finalRent = parsedRent;
        }

        const [resident] = await User.create([
            { name, email: normalizedEmail, password, role: "resident", roomId: roomDoc ? roomDoc._id : null, isActive: true }
        ], { session });

        if (roomDoc) {
            roomDoc.occupiedBeds += 1;
            await roomDoc.save({ session });
        }

        if (finalRent > 0) {
            const now = new Date();
            const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 5);
            await Payment.create([
                { resident: resident._id, amount: finalRent, type: "rent", status: "pending", month: now.toISOString().slice(0, 7), dueDate }
            ], { session });
        }

        await session.commitTransaction();

        return res.status(201).json({ success: true, resident });
    } catch (err) {
        await session.abortTransaction();
        logger.error(`ADD RESIDENT ERROR: ${err.message}`);
        next(err);
    } finally {
        session.endSession();
    }
};

export const updateResident = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const { name, email, isActive } = req.body;

        const resident = await User.findOne({ _id: id, role: "resident" }).session(session);
        if (!resident) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Resident not found" });
        }

        if (typeof name === "string" && name.trim()) resident.name = name.trim();

        if (typeof email === "string" && email.trim()) {
            const normalizedEmail = email.toLowerCase().trim();
            const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: id } }).session(session);
            if (existing) {
                await session.abortTransaction();
                return res.status(400).json({ success: false, message: "Email already exists" });
            }
            resident.email = normalizedEmail;
        }

        if (typeof isActive === "boolean") resident.isActive = isActive;

        await resident.save({ session });
        await session.commitTransaction();

        return res.json({ success: true, resident });
    } catch (err) {
        await session.abortTransaction();
        logger.error(`UPDATE RESIDENT ERROR: ${err.message}`);
        next(err);
    } finally {
        session.endSession();
    }
};

export const deleteResident = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;

        const resident = await User.findById(id).session(session);
        if (!resident) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Resident not found" });
        }

        if (resident.roomId) {
            const room = await Room.findById(resident.roomId).session(session);
            if (room && room.occupiedBeds > 0) {
                room.occupiedBeds -= 1;
                await room.save({ session });
            }
        }

        await Payment.deleteMany({ resident: resident._id }).session(session);
        await resident.deleteOne({ session });
        await session.commitTransaction();

        return res.json({ success: true, message: "Resident deleted successfully" });
    } catch (err) {
        await session.abortTransaction();
        logger.error(`DELETE RESIDENT ERROR: ${err.message}`);
        next(err);
    } finally {
        session.endSession();
    }
};
