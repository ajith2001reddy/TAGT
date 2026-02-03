import { Router } from "express";

import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";

import {
    getAllResidents,
    addResident
} from "../controllers/adminController.js";

import Request from "../models/Request.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";

// NOTE:
// RequestHistory model is referenced in old code.
// If it exists, convert it later and uncomment the import.
// import RequestHistory from "../models/RequestHistory.js";

const router = Router();

/* =========================
   RESIDENT MANAGEMENT
========================= */

// GET all residents
router.get("/residents", auth, isAdmin, getAllResidents);

// ADD resident
router.post("/residents", auth, isAdmin, addResident);

/* =========================
   REQUESTS
========================= */

// GET all maintenance requests
router.get("/requests", auth, isAdmin, async (req, res, next) => {
    try {
        const requests = await Request.find()
            .populate("residentId", "name email")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            requests
        });
    } catch (error) {
        next(error);
    }
});

/* =========================
   ADMIN DASHBOARD STATS
========================= */

router.get("/stats", auth, isAdmin, async (req, res, next) => {
    try {
        const totalResidents = await User.countDocuments({
            role: "resident",
            isActive: true
        });

        const pendingRequests = await Request.countDocuments({
            status: { $ne: "resolved" }
        });

        const payments = await Payment.find({}, "amount status");

        const totalRevenue = payments
            .filter((p) => p.status === "paid")
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        const outstandingBalance = payments
            .filter((p) => p.status === "unpaid")
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        res.json({
            success: true,
            stats: {
                totalResidents,
                pendingRequests,
                totalRevenue,
                outstandingBalance
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
