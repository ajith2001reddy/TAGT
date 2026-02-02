const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

const {
    getAllResidents,
    addResident
} = require("../controllers/adminController");

const Request = require("../models/Request");
const RequestHistory = require("../models/RequestHistory");
const Payment = require("../models/Payment");
const User = require("../models/User");

/* ================= RESIDENT MANAGEMENT ================= */

// GET all residents
router.get("/residents", auth, isAdmin, getAllResidents);

// ADD resident
router.post("/residents", auth, isAdmin, addResident);

/* ================= REQUESTS ================= */

// GET all maintenance requests
router.get("/requests", auth, isAdmin, async (req, res) => {
    try {
        const requests = await Request.find()
            .populate("residentId", "name email")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            requests
        });
    } catch (err) {
        console.error("GET REQUESTS ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch requests"
        });
    }
});

// GET request history (archived)
router.get("/requests/history", auth, isAdmin, async (req, res) => {
    try {
        const history = await RequestHistory.find()
            .populate("residentId", "name email")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            history
        });
    } catch (err) {
        console.error("GET REQUEST HISTORY ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch request history"
        });
    }
});

/* ================= ADMIN DASHBOARD STATS ================= */

router.get("/stats", auth, isAdmin, async (req, res) => {
    try {
        const totalResidents = await User.countDocuments({
            role: { $regex: /^resident$/i },
            isActive: true
        });

        const pendingRequests = await Request.countDocuments({
            status: { $ne: "resolved" }
        });

        const payments = await Payment.find();

        const totalRevenue = payments
            .filter((p) => p.status === "paid")
            .reduce((sum, p) => sum + p.amount, 0);

        const outstandingBalance = payments
            .filter((p) => p.status === "unpaid")
            .reduce((sum, p) => sum + p.amount, 0);

        res.json({
            success: true,
            stats: {
                totalResidents,
                pendingRequests,
                totalRevenue,
                outstandingBalance
            }
        });
    } catch (err) {
        console.error("ADMIN STATS ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch admin stats"
        });
    }
});

module.exports = router;
