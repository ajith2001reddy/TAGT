import Room from "../models/rooms.js";

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
        console.error("GET ROOMS ERROR:", error.message);
        next(error);
    }
};

/* ============================
   ADD NEW ROOM
============================ */
export const addRoom = async (req, res, next) => {
    try {
        const { roomNumber, rent, totalBeds, note } = req.body;

        if (!roomNumber || !rent || !totalBeds) {
            return res.status(400).json({
                success: false,
                message: "Room number, rent, and total beds are required"
            });
        }

        const exists = await Room.findOne({ roomNumber });
        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Room number already exists"
            });
        }

        const room = await Room.create({
            roomNumber,
            rent,
            totalBeds,
            occupiedBeds: 0,
            note: note || ""
        });

        res.status(201).json({
            success: true,
            room
        });
    } catch (error) {
        console.error("ADD ROOM ERROR:", error.message);
        next(error);
    }
};

/* ============================
   DELETE ROOM
============================ */
export const deleteRoom = async (req, res, next) => {
    try {
        const { id } = req.params;

        const room = await Room.findById(id);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        if (room.occupiedBeds > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete room with residents"
            });
        }

        await room.deleteOne();

        res.json({
            success: true,
            message: "Room deleted successfully"
        });
    } catch (error) {
        console.error("DELETE ROOM ERROR:", error.message);
        next(error);
    }
};
