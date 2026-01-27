const express = require("express");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

const User = require("../models/User");
const Resident = require("../models/Resident");
const Request = require("../models/Request");
const Payment = require("../models/Payment");
const ActivityLog = require("../models/ActivityLog");

const router = express.Router();
const Joi = require("joi");

const addResidentSchema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    roomNumber: Joi.string().required(),
    monthlyRent: Joi.number().min(0).required()
});
const validate = require("../middleware/validate");




/* ================= GET ALL REQUESTS ================= */
router.get("/requests", auth, isAdmin, async (req, res, next) => {
    try {
        const requests = await Request.find().sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        next(err);
    }
});
/* ================= GET ALL RESIDENTS ================= */
router.get("/residents", auth, isAdmin, async (req, res, next) => {
    try {
        const residents = await Resident.find()
            .populate("userId", "email role")
            .sort({ createdAt: -1 });

        res.json(residents);
    } catch (err) {
        next(err);
    }
});


/* ================= UPDATE REQUEST STATUS ================= */
router.put("/requests/:id/status", auth, isAdmin, async (req, res, next) => {
    try {
        const { status } = req.body;

        const request = await Request.findById(req.params.id);
        if (!request) return res.status(404).json("Request not found");

        request.status = status;
        request.statusHistory.push({ status });
        await request.save();

        await ActivityLog.create({
            action: `Updated request status to ${status}`,
            performedBy: req.user.id,
            role: req.user.role,
            ipAddress: req.ip,
            route: req.originalUrl
        });

        res.json("Request updated successfully");
    } catch (err) {
        next(err);
    }
});

/* ================= ADD RESIDENT ================= */
router.post("/add-resident", auth, isAdmin, async (req, res, next) => {
    try {
        const { name, email, password, roomNumber, monthlyRent } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json("Missing required fields");
        }

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json("User already exists");

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashed,
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
            amount: monthlyRent
        });

        await ActivityLog.create({
            action: "Added resident",
            performedBy: req.user.id,
            role: req.user.role,
            ipAddress: req.ip,
            route: req.originalUrl
        });

        res.status(201).json("Resident added successfully");
    } catch (err) {
        next(err);
    }
});

/* ================= ADMIN DASHBOARD STATS ================= */
router.get("/stats", auth, isAdmin, async (req, res, next) => {
    try {
        const totalResidents = await Resident.countDocuments();
        const pendingRequests = await Request.countDocuments({
            status: "pending"
        });
        const unpaidPayments = await Payment.countDocuments({
            status: "unpaid"
        });

        res.json({
            totalResidents,
            pendingRequests,
            unpaidPayments
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
