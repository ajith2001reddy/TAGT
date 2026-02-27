import { Router } from "express";

import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";

import {
    getAllResidents,
    addResident,
} from "../controllers/residentController.js";

import Request from "../models/Request.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";

const router = Router();

router.get("/residents", auth, isAdmin, getAllResidents);
router.post("/residents", auth, isAdmin, addResident);

router.get("/requests", auth, isAdmin, async (req, res, next) => {
    try {
        const requests = await Request.find()
            .populate("resident", "name email")
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, requests });
    } catch (err) {
        next(err);
    }
});

router.get("/stats", auth, isAdmin, async (req, res, next) => {
    try {
        const [totalResidents, pendingRequests, payments] = await Promise.all([
            User.countDocuments({ role: "resident", isActive: true }),
            Request.countDocuments({ status: { $ne: "resolved" } }),
            Payment.find({}, "amount status").lean(),
        ]);

        let totalRevenue = 0;
        let outstandingBalance = 0;
        for (const p of payments) {
            if (p.status === "paid") totalRevenue += p.amount || 0;
            else outstandingBalance += p.amount || 0;
        }

        res.json({
            success: true,
            stats: { totalResidents, pendingRequests, totalRevenue, outstandingBalance },
        });
    } catch (err) {
        next(err);
    }
});

export default router;