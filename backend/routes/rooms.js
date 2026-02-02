const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const rooms = require("../models/rooms");

/* =========================================================
   CREATE rooms (ADMIN)
========================================================= */
router.post("/", auth, isAdmin, async (req, res) => {
    try {
        const { roomsNumber, note } = req.body;
        const totalBeds = Number(req.body.totalBeds);
        const rent = Number(req.body.rent);

        if (
            !roomsNumber ||
            !Number.isInteger(totalBeds) ||
            totalBeds <= 0 ||
            !Number.isFinite(rent) ||
            rent <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "rooms number, valid rent, and valid total beds are required"
            });
        }

        const exists = await rooms.findOne({ roomsNumber });
        if (exists) {
            return res.status(400).json({
                success: false,
                message: "rooms already exists"
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
        console.error("CREATE rooms ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Failed to create rooms"
        });
    }
});

/* =========================================================
   GET ALL roomsS (ADMIN)
========================================================= */
router.get("/", auth, isAdmin, async (req, res) => {
    try {
        const roomss = await rooms.find().sort({ roomsNumber: 1 });
        res.json({
            success: true,
            roomss
        });
    } catch (err) {
        console.error("GET roomsS ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch roomss"
        });
    }
});

/* =========================================================
   UPDATE OCCUPIED BEDS (ADMIN)
========================================================= */
router.put("/:id/occupancy", auth, isAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid rooms ID"
            });
        }

        const occupiedBeds = Number(req.body.occupiedBeds);
        if (!Number.isInteger(occupiedBeds) || occupiedBeds < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid occupied beds value"
            });
        }

        const rooms = await rooms.findById(req.params.id);
        if (!rooms) {
            return res.status(404).json({
                success: false,
                message: "rooms not found"
            });
        }

        if (occupiedBeds > rooms.totalBeds) {
            return res.status(400).json({
                success: false,
                message: "Occupied beds cannot exceed total beds"
            });
        }

        rooms.occupiedBeds = occupiedBeds;
        await rooms.save();

        res.json({
            success: true,
            rooms
        });
    } catch (err) {
        console.error("UPDATE OCCUPANCY ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Failed to update occupancy"
        });
    }
});

/* =========================================================
   DELETE rooms (ADMIN)
========================================================= */
router.delete("/:id", auth, isAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid rooms ID"
            });
        }

        const rooms = await rooms.findById(req.params.id);
        if (!rooms) {
            return res.status(404).json({
                success: false,
                message: "rooms not found"
            });
        }

        if (rooms.occupiedBeds > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete rooms with occupied beds"
            });
        }

        await rooms.deleteOne();

        res.json({
            success: true,
            message: "rooms deleted"
        });
    } catch (err) {
        console.error("DELETE rooms ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Failed to delete rooms"
        });
    }
});

module.exports = router;
