const express = require("express");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

const Request = require("../models/Request");
const RequestHistory = require("../models/RequestHistory");
const User = require("../models/User");
const Resident = require("../models/Resident");
const Payment = require("../models/Payment");

const router = express.Router();

/* ================= REQUESTS ================= */
router.get("/requests", auth, isAdmin, async (req, res) => {
    try {
        const requests = await Request.find()
            .populate("residentId", "email")
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch {
        res.status(500).json("Failed to fetch requests");
    }
});

router.delete("/requests/:id", auth, isAdmin, async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);
        if (!request) return res.status(404).json("Request not found");

        await request.deleteOne();
        res.json("Request deleted successfully");
    } catch {
        res.status(500).json("Failed to delete request");
    }
});

router.put("/requests/:id/status", auth, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const request = await Request.findById(req.params.id);
        if (!request) return res.status(404).json("Request not found");

        request.status = status;
        request.statusHistory.push({ status });
        await request.save();

        res.json("Request status updated");
    } catch {
        res.status(500).json("Failed to update request");
    }
});

router.put("/requests/:id/workflow-status", auth, isAdmin, async (req, res) => {
    try {
        const { workflowStatus, note } = req.body;
        if (!workflowStatus || !note) {
            return res.status(400).json("Workflow status and note required");
        }

        const request = await Request.findById(req.params.id);
        if (!request) return res.status(404).json("Request not found");

        request.workflowStatus = workflowStatus;
        request.adminNotes.push({
            note,
            status: workflowStatus,
            adminId: req.user.id
        });

        await request.save();
        res.json("Workflow updated");
    } catch {
        res.status(500).json("Failed to update workflow");
    }
});

router.post("/requests/:id/archive", auth, isAdmin, async (req, res) => {
    try {
        const { finalResolution } = req.body;
        if (!finalResolution) {
            return res.status(400).json("Final resolution required");
        }

        const request = await Request.findById(req.params.id);
        if (!request) return res.status(404).json("Request not found");

        await RequestHistory.create({
            requestId: request._id,
            residentId: request.residentId,
            originalMessage: request.message,
            finalResolution,
            timeline: request.adminNotes || [],
            resolvedBy: req.user.id,
            resolvedAt: new Date()
        });

        await request.deleteOne();
        res.json("Request archived");
    } catch {
        res.status(500).json("Failed to archive request");
    }
});

router.get("/requests/history", auth, isAdmin, async (req, res) => {
    try {
        const history = await RequestHistory.find()
            .populate("residentId", "email")
            .populate("resolvedBy", "email")
            .sort({ resolvedAt: -1 });
        res.json(history);
    } catch {
        res.status(500).json("Failed to load request history");
    }
});

/* ================= STATS ================= */
router.get("/stats", auth, isAdmin, async (req, res) => {
    try {
        const totalResidents = await Resident.countDocuments();
        const totalRequests = await Request.countDocuments();
        const openRequests = await Request.countDocuments({
            workflowStatus: { $ne: "Done" }
        });

        const paid = await Payment.find({ status: "paid" });
        const unpaid = await Payment.find({ status: "unpaid" });

        res.json({
            totalResidents,
            totalRequests,
            openRequests,
            totalRevenue: paid.reduce((s, p) => s + p.amount, 0),
            outstandingBalance: unpaid.reduce((s, p) => s + p.amount, 0)
        });
    } catch {
        res.status(500).json("Failed to load stats");
    }
});

/* ================= RESIDENTS ================= */
router.get("/residents", auth, isAdmin, async (req, res) => {
    try {
        const residents = await Resident.find().populate("userId", ["email", "name"]);
        res.json(residents);
    } catch {
        res.status(500).json("Failed to fetch residents");
    }
});

router.post("/residents", auth, isAdmin, async (req, res) => {
    try {
        const { name, email, password, room, rent } = req.body;

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json("User already exists");

        const user = await User.create({
            name,
            email,
            password: await bcrypt.hash(password, 10),
            role: "resident"
        });

        const resident = await Resident.create({
            userId: user._id,
            room,
            rent
        });

        res.json({ user, resident });
    } catch {
        res.status(500).json("Failed to add resident");
    }
});

router.delete("/residents/:id", auth, isAdmin, async (req, res) => {
    try {
        const resident = await Resident.findById(req.params.id);
        if (!resident) return res.status(404).json("Resident not found");

        await User.findByIdAndUpdate(resident.userId, { isActive: false });
        await resident.deleteOne();

        res.json("Resident deleted");
    } catch {
        res.status(500).json("Failed to delete resident");
    }
});

module.exports = router;
