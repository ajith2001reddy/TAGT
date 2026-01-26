const express = require("express");
const bcrypt = require("bcryptjs");

const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

const Room = require("../models/Room");
const Request = require("../models/Request");
const User = require("../models/User");
const Resident = require("../models/Resident");
const Payment = require("../models/Payment");
const ActivityLog = require("../models/ActivityLog");

const router = express.Router();

/* ================= DASHBOARD STATS ================= */
router.get("/stats", auth, isAdmin, async (req, res) => {
    try {
        const residents = await Resident.countDocuments();
        const pendingRequests = await Request.countDocuments({ status: "pending" });
        const unpaidPayments = await Payment.countDocuments({ status: "unpaid" });

        res.json({ residents, pendingRequests, unpaidPayments });
    } catch {
        res.status(500).json("Server error");
    }
});

/* ================= ADD RESIDENT ================= */
router.post("/add-resident", auth, isAdmin, async (req, res) => {
    try {
        const { name, email, password, roomNumber, monthlyRent } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "resident"
        });

        const resident = await Resident.create({
            userId: user._id,
            name,
            roomNumber,
            monthlyRent
        });

        await Payment.create({
            residentId: resident._id,
            month: "January",
            amount: monthlyRent,
            status: "unpaid"
        });

        await ActivityLog.create({
            action: "Added resident",
            performedBy: req.user.id,
            role: req.user.role
        });

        res.status(201).json("Resident added successfully");
    } catch (err) {
        console.error(err);
        res.status(500).json("Server error");
    }
});

/* ================= ROOMS ================= */
router.get("/rooms", auth, isAdmin, async (req, res) => {
    const rooms = await Room.find();
    res.json(rooms);
});

router.post("/rooms", auth, isAdmin, async (req, res) => {
    const room = await Room.create(req.body);

    await ActivityLog.create({
        action: "Added room",
        performedBy: req.user.id,
        role: req.user.role
    });

    res.status(201).json(room);
});

/* ================= REQUESTS ================= */
router.get("/requests", auth, isAdmin, async (req, res) => {
    const requests = await Request.find();
    res.json(requests);
});

router.put("/requests/:id/status", auth, isAdmin, async (req, res) => {
    const { status } = req.body;

    await Request.findByIdAndUpdate(req.params.id, { status });

    await ActivityLog.create({
        action: `Updated request status to ${status}`,
        performedBy: req.user.id,
        role: req.user.role
    });

    res.json("Request status updated");
});

module.exports = router;
