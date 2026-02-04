import Room from "../models/rooms.js";
import logger from "../utils/logger.js";  // Corrected import
import mongoose from "mongoose";

// Add room function
export const addRoom = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { roomNumber, rent, totalBeds, note } = req.body;

        if (!roomNumber || rent == null || totalBeds == null) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Room number, rent, and total beds are required"
            });
        }

        if (typeof rent !== "number" || rent <= 0) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Rent must be a positive number"
            });
        }

        if (typeof totalBeds !== "number" || totalBeds <= 0) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Total beds must be a positive number"
            });
        }

        const exists = await Room.findOne({ roomNumber }).session(session);
        if (exists) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Room number already exists"
            });
        }

        const room = await Room.create(
            [
                {
                    roomNumber,
                    rent,
                    totalBeds,
                    occupiedBeds: 0,
                    note: typeof note === "string" ? note : ""
                }
            ],
            { session }
        );

        await session.commitTransaction();

        logger.info(`Room added: ${room.roomNumber}`);
        res.status(201).json({ success: true, room });
    } catch (err) {
        await session.abortTransaction();
        logger.error(`ADD ROOM ERROR: ${err.message}`);
        next(err);
    } finally {
        session.endSession();
    }
};

// Other controller functions (getAllRooms, deleteRoom, etc.)

export const getAllRooms = async (req, res, next) => {
    try {
        const rooms = await Room.find().sort({ createdAt: -1 }).lean();
        res.json({ success: true, rooms });
    } catch (err) {
        logger.error(`GET ROOMS ERROR: ${err.message}`);
        next(err);
    }
};

export const deleteRoom = async (req, res, next) => {
    // deleteRoom logic
};
