import Room from "../models/rooms.js";
import { logger } from "../utils/logger.js"; // Assuming a logger utility like winston is set up

/* ============================
   GET ALL ROOMS
============================ */
export const getAllRooms = async (req, res, next) => {
    try {
        const rooms = await Room.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            rooms
        });
    } catch (error) {
        logger.error("GET ROOMS ERROR:", error.message);
        next(error);
    }
};

/* ============================
   ADD NEW ROOM
============================ */
export const addRoom = async (req, res, next) => {
    try {
        const { roomNumber, rent, totalBeds, note } = req.body;

        // Validation for required fields and correct data types
        if (!roomNumber || !rent || !totalBeds) {
            return res.status(400).json({
                success: false,
                message: "Room number, rent, and total beds are required"
            });
        }

        if (typeof rent !== "number" || rent <= 0) {
            return res.status(400).json({
                success: false,
                message: "Rent must be a positive number"
            });
        }

        if (typeof totalBeds !== "number" || totalBeds <= 0) {
            return res.status(400).json({
                success: false,
                message: "Total beds must be a positive number"
            });
        }

        // Room number format validation (example: alphanumeric format)
        const roomNumberRegex = /^[A-Za-z0-9]+$/;
        if (!roomNumberRegex.test(roomNumber)) {
            return res.status(400).json({
                success: false,
                message: "Room number must be alphanumeric"
            });
        }

        // Check if the room number already exists
        const exists = await Room.findOne({ roomNumber });
        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Room number already exists"
            });
        }

        // Ensure note is a string (optional field)
        const roomNote = typeof note === "string" ? note : "";

        // Create new room
        const room = await Room.create({
            roomNumber,
            rent,
            totalBeds,
            occupiedBeds: 0,
            note: roomNote
        });

        logger.info(`Room added: ${roomNumber}`); // Log room creation
        res.status(201).json({
            success: true,
            room
        });
    } catch (error) {
        logger.error("ADD ROOM ERROR:", error.message);
        next(error);
    }
};

/* ============================
   DELETE ROOM
============================ */
export const deleteRoom = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find room by ID
        const room = await Room.findById(id);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        // Check if the room is still occupied by residents
        if (room.occupiedBeds > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete room with residents"
            });
        }

        // Delete room
        await room.deleteOne();

        logger.info(`Room deleted: ${room.roomNumber}`); // Log room deletion
        res.json({
            success: true,
            message: "Room deleted successfully"
        });
    } catch (error) {
        logger.error("DELETE ROOM ERROR:", error.message);
        next(error);
    }
};
