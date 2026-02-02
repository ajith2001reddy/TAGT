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
router.get("/requests", auth, isAdmin, async (req, res, next) => {
    try {
        const requests = await Request.find()
            .populate("residentId", "name email")
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (err) {
        next(err);
    }
});

// GET request history (archived)
router.get("/requests/history", auth, isAdmin, async (req, res, next) => {
    try {
        const history = await RequestHistory.find()
            .populate("residentId", "name email")
            .sort({ createdAt: -1 });

        res.json(history);
    } catch (err) {
        next(err);
    }
});

/* ================= ADMIN DASHBOARD STATS ================= */

router.get("/stats", auth, isAdmin, async (req, res, next) => {
    try {
        const totalResidents = await User.countDocuments({
            role: "resident"
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
            totalResidents,
            pendingRequests,
            totalRevenue,
            outstandingBalance
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
