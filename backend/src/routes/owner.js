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
import Property from "../models/Property.js";

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
router.get("/properties", auth, authorize("owner", "super_admin"), async (req, res) => {
    let filter = {};
    if (req.user.role === "owner") {
        filter = { _id: { $in: req.user.propertyIds || [] } };
    }

    const properties = await Property.find(filter).lean();
    res.json({ success: true, data: properties });
});

router.get("/stats", auth, authorize("owner", "super_admin"), async (req, res, next) => {
    try {
        const { propertyId } = req.query;
        let scope = {};

        if (propertyId) {
            // 🔐 SECURITY CHECK
            if (req.user.role === "owner" && !req.user.propertyIds?.includes(propertyId)) {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized property access"
                });
            }
            scope = { propertyId };
        } else if (req.user.role === "owner") {
            // All properties for this owner
            scope = { propertyId: { $in: req.user.propertyIds || [] } };
        } else if (req.user.role === "super_admin") {
            // All properties globally
            scope = {};
        }

        const [totalResidents, pendingRequests, payments] =
            await Promise.all([
                User.countDocuments({
                    role: "resident",
                    isActive: true,
                    ...scope
                }),
                Request.countDocuments({
                    status: { $ne: "resolved" },
                    ...scope
                }),
                Payment.find(scope, "amount status").lean()
            ]);

        let totalRevenue = 0;
        let outstandingBalance = 0;

        for (const p of payments) {
            if (p.status === "paid") totalRevenue += p.amount || 0;
            else outstandingBalance += p.amount || 0;
        }

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
        next(err);
    }
});

export default router;