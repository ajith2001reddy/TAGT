import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import Room from "../models/rooms.js";
import { logger } from "../utils/logger.js";

export const getAllResidents = async (req, res, next) => {
    try {
        const residents = await User.find({ role: "resident" })
            .populate("roomId", "roomNumber totalBeds occupiedBeds")
            .sort({ createdAt: -1 })
            .lean();

        res.json({ success: true, residents });
    } catch (err) {
        logger.error(`GET RESIDENTS ERROR: ${err.message}`);
        next(err);
    }
};

export const addResident = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { name, email, password, roomId } = req.body;

        if (!name || !email || !password) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({ email: normalizedEmail }).session(session);
        if (existingUser) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        let room = null;
        if (roomId) {
            room = await Room.findById(roomId).session(session);

            if (!room) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: "Invalid room selected"
                });
            }

            if (room.occupiedBeds >= room.totalBeds) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: "No beds available in this room"
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [resident] = await User.create(
            [
                {
                    name,
                    email: normalizedEmail,
                    password: hashedPassword,
                    role: "resident",
                    roomId: room ? room._id : null
                }
            ],
            { session }
        );

        if (room) {
            room.occupiedBeds += 1;
            await room.save({ session });
        }

        await session.commitTransaction();

        logger.info(
            `Resident added: ${resident.name}, Room: ${room ? room.roomNumber : "None"}`
        );

        res.status(201).json({
            success: true,
            resident
        });
    } catch (err) {
        await session.abortTransaction();
        logger.error(`ADD RESIDENT ERROR: ${err.message}`);
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
            return res.status(404).json({
                success: false,
                message: "Resident not found"
            });
        }

        if (resident.roomId) {
            const room = await Room.findById(resident.roomId).session(session);
            if (room && room.occupiedBeds > 0) {
                room.occupiedBeds -= 1;
                await room.save({ session });
            }
        }

        await resident.deleteOne({ session });

        await session.commitTransaction();

        logger.info(`Resident deleted: ${resident.name}`);

        res.json({
            success: true,
            message: "Resident deleted successfully"
        });
    } catch (err) {
        await session.abortTransaction();
        logger.error(`DELETE RESIDENT ERROR: ${err.message}`);
        next(err);
    } finally {
        session.endSession();
    }
};
