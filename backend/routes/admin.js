const express = require("express");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

const Request = require("../models/Request");
const RequestHistory = require("../models/RequestHistory"); // ✅ PHASE 2
const User = require("../models/User");
const Resident = require("../models/Resident");

const router = express.Router();

/* =========================================================
   GET ALL REQUESTS (ADMIN)
   (UNCHANGED)
========================================================= */
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

/* =========================================================
   UPDATE REQUEST STATUS (LEGACY)
   (UNCHANGED — OLD UI CONTINUES TO WORK)
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
    } catch (err) {
        res.status(500).json("Failed to update request");
    }
});

/* =========================================================
   PHASE 1 – ADVANCED WORKFLOW STATUS
========================================================= */
router.put(
    "/requests/:id/workflow-status",
    auth,
    isAdmin,
    async (req, res) => {
        try {
            const { workflowStatus, note } = req.body;

            if (!workflowStatus || !note) {
                return res
                    .status(400)
                    .json("Workflow status and admin note are required");
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
        } catch (err) {
            res.status(500).json("Failed to update workflow status");
        }
    }
);

/* =========================================================
   PHASE 2 – CLOSE & ARCHIVE REQUEST (CORE)
   - Requires Final Resolution
   - Moves request → RequestHistory
   - Deletes from active Request collection
========================================================= */
router.post(
    "/requests/:id/archive",
    auth,
    isAdmin,
    async (req, res) => {
        try {
            const { finalResolution } = req.body;

            if (!finalResolution) {
                return res
                    .status(400)
                    .json("Final resolution is required");
            }

            const request = await Request.findById(req.params.id);
            if (!request) return res.status(404).json("Request not found");

            // Create history record
            await RequestHistory.create({
                requestId: request._id,
                residentId: request.residentId,
                originalMessage: request.message,
                finalResolution,
                timeline: request.adminNotes || [],
                resolvedBy: req.user.id,
                resolvedAt: new Date()
            });

            // Remove active request
            await request.deleteOne();

            res.json("Request archived successfully");
        } catch (err) {
            res.status(500).json("Failed to archive request");
        }
    }
);

/* =========================================================
   PHASE 2 – GET REQUEST HISTORY (ADMIN)
========================================================= */
router.get(
    "/requests/history",
    auth,
    isAdmin,
    async (req, res) => {
        try {
            const history = await RequestHistory.find()
                .populate("residentId", "email")
                .populate("resolvedBy", "email")
                .sort({ resolvedAt: -1 });

            res.json(history);
        } catch (err) {
            res.status(500).json("Failed to load request history");
        }
    }
);

/* =========================================================
   ADMIN DASHBOARD STATS
   (EXTENDED, OLD KEYS STILL RETURNED)
========================================================= */
router.get("/stats", auth, isAdmin, async (req, res) => {
    try {
        const totalResidents = await Resident.countDocuments();
        const pendingRequests = await Request.countDocuments({
            status: "pending"
        });

        const totalRequests = await Request.countDocuments();
        const openRequests = await Request.countDocuments({
            workflowStatus: { $ne: "Done" }
        });

        res.json({
            totalResidents,      // OLD
            pendingRequests,     // OLD
            totalRequests,       // NEW
            openRequests         // NEW
        });
    } catch (err) {
        res.status(500).json("Failed to load stats");
    }
});

/* =========================================================
   GET ALL RESIDENTS
   (UNCHANGED)
========================================================= */
router.get("/residents", auth, isAdmin, async (req, res) => {
    try {
        const residents = await Resident.find().populate(
            "userId",
            ["email", "name"]
        );
        res.json(residents);
    } catch (err) {
        res.status(500).json("Failed to fetch residents");
    }
});

/* =========================================================
   ADD NEW RESIDENT (ADMIN)
   (UNCHANGED)
========================================================= */
router.post("/residents", auth, isAdmin, async (req, res) => {
    try {
        const { name, email, password, room, rent } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json("User already exists");

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
