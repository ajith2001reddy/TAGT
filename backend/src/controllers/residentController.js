import logger from "../utils/logger.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import User from "../models/User.js";
import Room from "../models/rooms.js";
import Payment from "../models/Payment.js";

/**
 * =============================
 * GET ALL RESIDENTS
 * =============================
 */
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

/**
 * =============================
 * ADD RESIDENT  + CREATE RENT
 * =============================
 */
export const addResident = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { name, email, password, roomId, rent } = req.body;

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

        let room = null;
        let finalRent = 0;

        /**
         * OPTIONAL ROOM
         */
        if (roomId) {
            room = await Room.findById(roomId).session(session);

            if (!room) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: "Invalid room selected",
                });
            }

            if (room.occupiedBeds >= room.totalBeds) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: "No beds available in this room",
                });
            }

            finalRent = room.rent || 0;
        }

        /**
         * MANUAL RENT (if no room)
         */
        if (!room && rent) {
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

        /**
         * HASH PASSWORD
         */
        const hashedPassword = await bcrypt.hash(password, 10);

        /**
         * CREATE RESIDENT
         */
        const [resident] = await User.create(
            [
                {
                    name,
                    email: normalizedEmail,
                    password: hashedPassword,
                    role: "resident",
                    roomId: room ? room._id : null,
                },
            ],
            { session }
        );

        /**
         * UPDATE ROOM OCCUPANCY
         */
        if (room) {
            room.occupiedBeds += 1;
            await room.save({ session });
        }

        /**
         * CREATE INITIAL UNPAID RENT
         */
        if (finalRent > 0) {
            await Payment.create(
                [
                    {
                        residentId: resident._id,
                        amount: finalRent,
                        description: "Monthly Rent",
                        type: "rent",
                        status: "unpaid",
                        month: new Date().toISOString().slice(0, 7),
                        createdBy: req.user.id,
                    },
                ],
                { session }
            );
        }

        await session.commitTransaction();

        logger.info(
            `Resident added: ${resident.name}, Rent: ${finalRent}, Room: ${room ? room.roomNumber : "None"}`
        );

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

/**
 * =============================
 * DELETE RESIDENT
 * =============================
 */
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

        /**
         * Reduce room occupancy
         */
        if (resident.roomId) {
            const room = await Room.findById(resident.roomId).session(session);

            if (room && room.occupiedBeds > 0) {
                room.occupiedBeds -= 1;
                await room.save({ session });
            }
        }

        /**
         * Delete payments of resident
         */
        await Payment.deleteMany({ residentId: resident._id }).session(session);

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
