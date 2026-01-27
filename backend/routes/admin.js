const express = require("express");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const Request = require("../models/Request");
const User = require("../models/User");
const Resident = require("../models/Resident");

const router = express.Router();

/* ============================
   GET ALL REQUESTS (ADMIN)
============================ */
router.get("/requests", auth, isAdmin, async (req, res) => {
    try {
        const requests = await Request.find()
            .populate("residentId", "email")
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (err) {
        res.status(500).json("Failed to fetch requests");
    }
});

/* ============================
   UPDATE REQUEST STATUS
============================ */
router.put("/requests/:id/status", auth, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;

        const request = await Request.findById(req.params.id);
        if (!request) return res.status(404).json("Request not found");

        request.status = status;
        request.statusHistory.push({ status });

        await request.save();
        res.json("Request status updated");
    } catch (err) {
        res.status(500).json("Failed to update request");
    }
});

/* ============================
   ADMIN DASHBOARD STATS
============================ */
router.get("/stats", auth, isAdmin, async (req, res) => {
    try {
        const totalResidents = await User.countDocuments({ role: "resident" });
        const pendingRequests = await Request.countDocuments({ status: "pending" });

        res.json({ totalResidents, pendingRequests });
    } catch (err) {
        res.status(500).json("Failed to load stats");
    }
});

/* ============================
   GET ALL RESIDENTS
============================ */
router.get("/residents", auth, isAdmin, async (req, res) => {
    try {
        const residents = await Resident.find().populate("userId", "email name");
        res.json(residents);
    } catch (err) {
        res.status(500).json("Failed to fetch residents");
    }
});

/* ============================
   ADD NEW RESIDENT (ADMIN)
============================ */
router.post("/residents", auth, isAdmin, async (req, res) => {
    try {
        const { name, email, password, room, rent } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json("User already exists");

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "resident"
        });

        const resident = await Resident.create({
            userId: user._id,
            room,
            rent
        });

        res.json({ user, resident });
    } catch (err) {
        res.status(500).json("Failed to add resident");
    }
});

module.exports = router;
