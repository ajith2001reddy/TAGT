const Room = require("../models/rooms");

/* ============================
   GET ALL ROOMS
   ============================ */
exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find().sort({ createdAt: -1 });

        return res.json({
            success: true,
            rooms
        });
    } catch (err) {
        console.error("GET ROOMS ERROR:", err.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch rooms"
        });
    }
};

/* ============================
   ADD NEW ROOM
   ============================ */
exports.addRoom = async (req, res) => {
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

        return res.status(201).json({
            success: true,
            room
        });
    } catch (err) {
        console.error("ADD ROOM ERROR:", err.message);
        return res.status(500).json({
            success: false,
            message: "Failed to add room"
        });
    }
};

/* ============================
   DELETE ROOM
   ============================ */
exports.deleteRoom = async (req, res) => {
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

        return res.json({
            success: true,
            message: "Room deleted successfully"
        });
    } catch (err) {
        console.error("DELETE ROOM ERROR:", err.message);
        return res.status(500).json({
            success: false,
            message: "Failed to delete room"
        });
    }
};
