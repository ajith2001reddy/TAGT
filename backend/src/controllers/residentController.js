import logger from "../utils/logger.js";
import mongoose from "mongoose";

import User from "../models/User.js";
import Room from "../models/rooms.js";
import Payment from "../models/Payment.js";

/* =====================================================
   GET ALL RESIDENTS
===================================================== */
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

/* =====================================================
   ADD RESIDENT
   Accepts: { name, email, password, roomNumber OR roomId, rent }
   - Looks up room by roomNumber if provided
   - Falls back to manual rent
   - Password is plain text — pre-save hook in User model hashes it
===================================================== */
export const addResident = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Support both roomNumber (from form) and roomId (ObjectId)
        const { name, email, password, roomNumber, roomId, rent } = req.body;

        /* ---------- VALIDATION ---------- */
        if (!name || !email || !password) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({ email: normalizedEmail }).session(session);
        if (existingUser) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        /* ---------- FIND ROOM ---------- */
        let roomDoc = null;
        let finalRent = 0;

        if (roomNumber) {
            // Lookup by room number string (e.g. "101")
            roomDoc = await Room.findOne({ roomNumber: String(roomNumber) }).session(session);

            if (!roomDoc) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: `Room "${roomNumber}" not found`,
                });
            }
        } else if (roomId && mongoose.Types.ObjectId.isValid(roomId)) {
            // Lookup by ObjectId
            roomDoc = await Room.findById(roomId).session(session);

            if (!roomDoc) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: "Invalid room selected",
                });
            }
        }

        if (roomDoc) {
            if (roomDoc.occupiedBeds >= roomDoc.totalBeds) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: "No beds available in this room",
                });
            }
            finalRent = roomDoc.rent || 0;
        }

        /* ---------- MANUAL RENT (no room) ---------- */
        if (!roomDoc && rent) {
            const parsedRent = Number(rent);
            if (!Number.isFinite(parsedRent) || parsedRent <= 0) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: "Invalid rent amount",
                });
            }
            finalRent = parsedRent;
        }

        /* ---------- CREATE RESIDENT ---------- */
        // Pass plain password — User model pre-save hook hashes it automatically
        const [resident] = await User.create(
            [
                {
                    name,
                    email: normalizedEmail,
                    password,          // pre-save hook handles hashing
                    role: "resident",
                    roomId: roomDoc ? roomDoc._id : null,
                    isActive: true,
                },
            ],
            { session }
        );

        /* ---------- UPDATE ROOM OCCUPANCY ---------- */
        if (roomDoc) {
            roomDoc.occupiedBeds += 1;
            await roomDoc.save({ session });
        }

        /* ---------- CREATE FIRST RENT BILL ---------- */
        if (finalRent > 0) {
            const now = new Date();
            const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 5);

            await Payment.create(
                [
                    {
                        resident: resident._id,
                        amount: finalRent,
                        type: "rent",
                        status: "pending",
                        month: now.toISOString().slice(0, 7),
                        dueDate,
                    },
                ],
                { session }
            );
        }

        await session.commitTransaction();

        logger.info(`Resident added: ${resident.name}, Room: ${roomDoc?.roomNumber || "None"}, Rent: ${finalRent}`);

        return res.status(201).json({
            success: true,
            resident,
        });
    } catch (err) {
        await session.abortTransaction();
        logger.error(`ADD RESIDENT ERROR: ${err.message}`);
        next(err);
    } finally {
        session.endSession();
    }
};

/* =====================================================
   DELETE RESIDENT
===================================================== */
export const deleteResident = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;

        const resident = await User.findById(id).session(session);

        if (!resident) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Resident not found",
            });
        }

        /* ---------- Reduce room occupancy ---------- */
        if (resident.roomId) {
            const room = await Room.findById(resident.roomId).session(session);
            if (room && room.occupiedBeds > 0) {
                room.occupiedBeds -= 1;
                await room.save({ session });
            }
        }

        /* ---------- Delete payments ---------- */
        await Payment.deleteMany({ resident: resident._id }).session(session);

        await resident.deleteOne({ session });

        await session.commitTransaction();

        logger.info(`Resident deleted: ${resident.name}`);

        return res.json({
            success: true,
            message: "Resident deleted successfully",
        });
    } catch (err) {
        await session.abortTransaction();
        logger.error(`DELETE RESIDENT ERROR: ${err.message}`);
        next(err);
    } finally {
        session.endSession();
    }
};