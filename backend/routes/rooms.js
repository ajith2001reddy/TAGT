const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const Room = require("../models/Room");

/* =========================================================
   CREATE ROOM (ADMIN)
========================================================= */
router.post("/", auth, isAdmin, async (req, res) => {
    try {
        const { roomNumber, totalBeds, note } = req.body;

        if (!roomNumber || !totalBeds) {
            return res
                .status(400)
                .json("Room number and total beds are required");
        }

        const exists = await Room.findOne({ roomNumber });
        if (exists) {
            return res.status(400).json("Room already exists");
        }

        const room = await Room.create({
            roomNumber,
            totalBeds,
            note
        });

        res.status(201).json(room);
    } catch (err) {
        res.status(500).json("Failed to create room");
    }
});

/* =========================================================
   GET ALL ROOMS (ADMIN)
========================================================= */
router.get("/", auth, isAdmin, async (req, res) => {
    try {
        const rooms = await Room.find().sort({ roomNumber: 1 });
        res.json(rooms);
    } catch (err) {
        res.status(500).json("Failed to fetch rooms");
    }
});

/* =========================================================
   UPDATE OCCUPIED BEDS (ADMIN)
   - Safe increment / decrement
========================================================= */
router.put("/:id/occupancy", auth, isAdmin, async (req, res) => {
    try {
        const { occupiedBeds } = req.body;

        if (occupiedBeds < 0) {
            return res.status(400).json("Invalid occupied beds value");
        }

        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json("Room not found");

        if (occupiedBeds > room.totalBeds) {
            return res
                .status(400)
                .json("Occupied beds cannot exceed total beds");
        }

        room.occupiedBeds = occupiedBeds;
        await room.save();

        res.json(room);
    } catch (err) {
        res.status(500).json("Failed to update occupancy");
    }
});

/* =========================================================
   DELETE ROOM (ADMIN)
========================================================= */
router.delete("/:id", auth, isAdmin, async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json("Room not found");

        if (room.occupiedBeds > 0) {
            return res
                .status(400)
                .json("Cannot delete room with occupied beds");
        }

        await room.deleteOne();
        res.json("Room deleted");
    } catch (err) {
        res.status(500).json("Failed to delete room");
    }
});

module.exports = router;
