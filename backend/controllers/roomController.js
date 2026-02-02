const rooms = require("../models/rooms");

/* ============================
   GET ALL rooms
   ============================ */
exports.getAllroomss = async (req, res) => {
    try {
        const rooms = await rooms.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            rooms
        });
    } catch (err) {
        console.error("GET rooms ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch rooms"
        });
    }
};

/* ============================
   ADD NEW rooms
   ============================ */
exports.addrooms = async (req, res) => {
    try {
        const { roomsNumber, rent, totalBeds, note } = req.body;

        if (!roomsNumber || !rent || !totalBeds) {
            return res.status(400).json({
                success: false,
                message: "rooms number, rent, and total beds are required"
            });
        }

        const exists = await rooms.findOne({ roomsNumber });
        if (exists) {
            return res.status(400).json({
                success: false,
                message: "rooms number already exists"
            });
        }

        const rooms = await rooms.create({
            roomsNumber,
            rent,
            totalBeds,
            occupiedBeds: 0,
            note: note || ""
        });

        res.status(201).json({
            success: true,
            rooms
        });
    } catch (err) {
        console.error("ADD rooms ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Failed to add rooms"
        });
    }
};

/* ============================
   DELETE rooms
   ============================ */
exports.deleterooms = async (req, res) => {
    try {
        const { id } = req.params;

        const rooms = await rooms.findById(id);
        if (!rooms) {
            return res.status(404).json({
                success: false,
                message: "rooms not found"
            });
        }

        if (rooms.occupiedBeds > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete rooms with residents"
            });
        }

        await rooms.deleteOne();

        res.json({
            success: true,
            message: "rooms deleted successfully"
        });
    } catch (err) {
        console.error("DELETE rooms ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Failed to delete rooms"
        });
    }
};
