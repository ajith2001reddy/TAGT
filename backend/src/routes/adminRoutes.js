import { Router } from "express";

import auth from "../middleware/auth.js";


import {
    getAllResidents,
    addResident,
} from "../controllers/residentController.js";

import Request from "../models/Request.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { buildPropertyFilter } from "../utils/tenantScope.js";
import authorize from "../middleware/authorize.js";

const router = Router();

router.get("/residents", auth, authorize("owner"), getAllResidents);
router.post("/residents", auth, authorize("owner"), addResident);

router.get("/requests", auth, authorize("owner"), async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const requests = await Request.find({ ...scope })
            .populate("resident", "name email")
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, requests });
    } catch (err) {
        next(err);
    }
});

router.get("/stats", auth, authorize("owner"), async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const [totalResidents, pendingRequests, payments] = await Promise.all([
            User.countDocuments({ role: "resident", isActive: true, ...scope }),
            Request.countDocuments({ status: { $ne: "resolved" }, ...scope }),
            Payment.find({ ...scope }, "amount status").lean(),
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