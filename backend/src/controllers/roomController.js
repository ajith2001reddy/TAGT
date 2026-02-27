import Room from "../models/rooms.js";
import logger from "../utils/logger.js";
import mongoose from "mongoose";

export const addRoom = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { roomNumber, rent, totalBeds, note } = req.body;

        if (!roomNumber || rent == null || totalBeds == null) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Room number, rent, and total beds are required",
            });
        }

        if (!Number.isFinite(Number(rent)) || Number(rent) <= 0) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Rent must be a positive number" });
        }

        if (!Number.isFinite(Number(totalBeds)) || Number(totalBeds) <= 0) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Total beds must be a positive number" });
        }

        const exists = await Room.findOne({ roomNumber }).session(session);
        if (exists) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Room number already exists" });
        }

        const room = await Room.create(
            [{ roomNumber, rent: Number(rent), totalBeds: Number(totalBeds), occupiedBeds: 0, note: typeof note === "string" ? note : "" }],
            { session }
        );

        await session.commitTransaction();

        logger.info(`Room added: ${room[0].roomNumber}`);

        return res.status(201).json({ success: true, room: room[0] });
    } catch (err) {
        await session.abortTransaction();
        logger.error(`ADD ROOM ERROR: ${err.message}`);
        next(err);
    } finally {
        session.endSession();
    }
};

export const getAllRooms = async (req, res, next) => {
    try {
        const rooms = await Room.find().sort({ createdAt: -1 }).lean();
        return res.json({ success: true, rooms });
    } catch (err) {
        logger.error(`GET ROOMS ERROR: ${err.message}`);
        next(err);
    }
};

export const updateRoom = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rent, totalBeds, note, maintenanceMode, maintenanceNote } = req.body;

        const room = await Room.findById(id);
        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        if (rent != null) {
            const parsedRent = Number(rent);
            if (!Number.isFinite(parsedRent) || parsedRent <= 0) {
                return res.status(400).json({ success: false, message: "Rent must be a positive number" });
            }
            room.rent = parsedRent;
        }

        if (totalBeds != null) {
            const parsedBeds = Number(totalBeds);
            if (!Number.isFinite(parsedBeds) || parsedBeds <= 0) {
                return res.status(400).json({ success: false, message: "Total beds must be a positive number" });
            }
            if (parsedBeds < room.occupiedBeds) {
                return res.status(400).json({ success: false, message: "Total beds cannot be lower than occupied beds" });
            }
            room.totalBeds = parsedBeds;
        }

        if (typeof note === "string") room.note = note;
        if (typeof maintenanceMode === "boolean") room.maintenanceMode = maintenanceMode;
        if (typeof maintenanceNote === "string") room.maintenanceNote = maintenanceNote;

        await room.save();

        return res.json({ success: true, room });
    } catch (err) {
        logger.error(`UPDATE ROOM ERROR: ${err.message}`);
        next(err);
    }
};

export const deleteRoom = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;

        const room = await Room.findById(id).session(session);

        if (!room) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        if (room.occupiedBeds > 0) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Cannot delete room with assigned residents" });
        }

        await room.deleteOne({ session });

        await session.commitTransaction();
        logger.info(`Room deleted: ${room.roomNumber}`);

        return res.json({ success: true, message: "Room deleted successfully" });
    } catch (err) {
        await session.abortTransaction();
        logger.error(`DELETE ROOM ERROR: ${err.message}`);
        next(err);
    } finally {
        session.endSession();
    }
};
