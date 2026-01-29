const express = require("express");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

const Request = require("../models/Request");
const RequestHistory = require("../models/RequestHistory");
const User = require("../models/User");
const Resident = require("../models/Resident");
const Payment = require("../models/Payment");
const Room = require("../models/Room");

const router = express.Router();

/* =========================================================
   GET ALL REQUESTS (ADMIN)
========================================================= */
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

/* =========================================================
   DELETE REQUEST (ADMIN) ✅ NEW
   - Hard delete
========================================================= */
router.delete("/requests/:id", auth, isAdmin, async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);
        if (!request) {
            return res.status(404).json("Request not found");
        }

        await request.deleteOne();
        res.json("Request deleted successfully");
    } catch {
        res.status(500).json("Failed to delete request");
    }
});

/* =========================================================
   UPDATE REQUEST STATUS (LEGACY)
========================================================= */
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

/* =========================================================
   PHASE 1 – ADVANCED WORKFLOW STATUS
========================================================= */
router.put("/requests/:id/workflow-status", auth, isAdmin, async (req, res) => {
    try {
        const { workflowStatus, note } = req.body;

        if (!workflowStatus || !note) {
            return res.status(400).json("Workflow status and admin note are required");
        }

        const FLOW = {
            Received: ["In-Progress"],
            "In-Progress": ["On Hold", "Done"],
            "On Hold": ["In-Progress"]
        };

        const request = await Request.findById(req.params.id);
        if (!request) return res.status(404).json("Request not found");

        const current = request.workflowStatus || "Received";

        if (!FLOW[current]?.includes(workflowStatus)) {
            return res.status(400).json("Invalid status transition");
        }

        request.workflowStatus = workflowStatus;
        request.adminNotes.push({
            note,
            status: workflowStatus,
            adminId: req.user.id
        });

        await request.save();
        res.json("Workflow status updated successfully");
    } catch {
        res.status(500).json("Failed to update workflow status");
    }
});

/* =========================================================
   PHASE 2 – ARCHIVE REQUEST
========================================================= */
router.post("/requests/:id/archive", auth, isAdmin, async (req, res) => {
    try {
        const { finalResolution } = req.body;
        if (!finalResolution) {
            return res.status(400).json("Final resolution is required");
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
        res.json("Request archived successfully");
    } catch {
        res.status(500).json("Failed to archive request");
    }
});

/* =========================================================
   GET REQUEST HISTORY
========================================================= */
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

/* =========================================================
   DASHBOARD STATS
========================================================= */
router.get("/stats", auth, isAdmin, async (req, res) => {
    try {
        const totalResidents = await Resident.countDocuments();
        const pendingRequests = await Request.countDocuments({ status: "pending" });
        const totalRequests = await Request.countDocuments();
        const openRequests = await Request.countDocuments({ workflowStatus: { $ne: "Done" } });

        const paidPayments = await Payment.find({ status: "paid" });
        const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);

        const unpaidPayments = await Payment.find({ status: "unpaid" });
        const outstandingBalance = unpaidPayments.reduce((sum, p) => sum + p.amount, 0);

        res.json({
            totalResidents,
            pendingRequests,
            totalRequests,
            openRequests,
            totalRevenue,
            outstandingBalance
        });
    } catch {
        res.status(500).json("Failed to load stats");
    }
});

/* =========================================================
   GET ALL RESIDENTS
========================================================= */
router.get("/residents", auth, isAdmin, async (req, res) => {
    try {
        const residents = await Resident.find().populate("userId", ["email", "name"]);
        res.json(residents);
    } catch {
        res.status(500).json("Failed to fetch residents");
    }
});

/* =========================================================
   ADD RESIDENT
========================================================= */
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
    } catch {
        res.status(500).json("Failed to add resident");
    }
});

/* =========================================================
   DELETE RESIDENT
========================================================= */
router.delete("/residents/:id", auth, isAdmin, async (req, res) => {
    try {
        const resident = await Resident.findById(req.params.id);
        if (!resident) return res.status(404).json("Resident not found");

        const activeRequests = await Request.countDocuments({
            residentId: resident.userId,
            workflowStatus: { $ne: "Done" }
        });

        if (activeRequests > 0) {
            return res.status(400).json("Resolve requests before deleting resident");
        }

        const unpaidBills = await Payment.countDocuments({
            residentId: resident.userId,
            status: "unpaid"
        });

        if (unpaidBills > 0) {
            return res.status(400).json("Clear payments before deleting resident");
        }

        await User.findByIdAndUpdate(resident.userId, { isActive: false });
        await resident.deleteOne();

        res.json("Resident deleted successfully");
    } catch {
        res.status(500).json("Failed to delete resident");
    }
});

module.exports = router;
