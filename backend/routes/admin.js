const express = require("express");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const Request = require("../models/Request");
const User = require("../models/User");
const Resident = require("../models/Resident");

const router = express.Router();

/* ===== GET ALL REQUESTS ===== */
router.get("/requests", auth, isAdmin, async (req, res, next) => {
    try {
        const requests = await Request.find()
            .populate("residentId", "email")
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (err) {
        next(err);
    }
});

/* ===== UPDATE REQUEST STATUS ===== */
router.put("/requests/:id/status", auth, isAdmin, async (req, res, next) => {
    try {
        const { status } = req.body;

        const request = await Request.findById(req.params.id);
        if (!request) return res.status(404).json("Request not found");

        request.status = status;
        request.statusHistory.push({ status });

        await request.save();
        res.json("Request updated");
    } catch (err) {
        next(err);
    }
});
router.get("/stats", auth, isAdmin, async (req, res) => {
    try {
        const totalResidents = await User.countDocuments({ role: "resident" });
        const pendingRequests = await Request.countDocuments({ status: "pending" });

        res.json({
            totalResidents,
            pendingRequests
        });
    } catch (err) {
        console.error("Admin stats error:", err);
        res.status(500).json({ message: "Failed to load admin stats" });
    }
});
/* ===== GET ALL RESIDENTS ===== */
router.get("/residents", auth, isAdmin, async (req, res, next) => {
    try {
        const residents = await Resident.find()
            .populate("userId", "email");
        res.json(residents);
    } catch (err) {
        next(err);
    }
});


module.exports = router;
