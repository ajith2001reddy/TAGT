import { Router } from "express";

import auth from "../middleware/auth.js";


import {
    listResidents,
    createResident,
    moveResidentRoom,
    deactivateResident,
    addResidentNote,
    getResidentHistory,
    deleteResident
} from "../controllers/v2/residentController.js";

import Request from "../models/Request.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { buildPropertyFilter } from "../utils/tenantScope.js";
import authorize from "../middleware/authorize.js";
import Property from "../models/Property.js";

const router = Router();

router.get("/residents", auth, authorize("owner"), listResidents);
router.post("/residents", auth, authorize("owner"), createResident);
router.put("/residents/:id/move-room", auth, authorize("owner"), moveResidentRoom);
router.put("/residents/:id/deactivate", auth, authorize("owner"), deactivateResident);
router.post("/residents/:id/notes", auth, authorize("owner"), addResidentNote);
router.get("/residents/:id/history", auth, authorize("owner"), getResidentHistory);
router.delete("/residents/:id", auth, authorize("owner"), deleteResident);

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
    try {
        let filter = {};
        if (req.user.role === "owner") {
            filter = { _id: { $in: req.user.propertyIds || [] } };
        }

        // Fetch properties and aggregate room stats in parallel
        const Room = (await import("../models/Room.js")).default;
        const properties = await Property.find(filter).lean();

        if (properties.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const propertyIds = properties.map(p => p._id);

        // Aggregate bed stats per property from Room collection
        const roomStats = await Room.aggregate([
            { $match: { propertyId: { $in: propertyIds } } },
            {
                $group: {
                    _id: "$propertyId",
                    totalBeds: { $sum: "$totalBeds" },
                    occupiedBeds: { $sum: "$occupiedBeds" },
                    totalRooms: { $sum: 1 }
                }
            }
        ]);

        const statsMap = {};
        for (const s of roomStats) {
            statsMap[s._id.toString()] = s;
        }

        const enriched = properties.map(p => {
            const stats = statsMap[p._id.toString()] || { totalBeds: 0, occupiedBeds: 0, totalRooms: 0 };
            return {
                ...p,
                totalBeds: stats.totalBeds,
                occupiedBeds: stats.occupiedBeds,
                totalRooms: stats.totalRooms,
            };
        });

        res.json({ success: true, data: enriched });
    } catch (err) {
        console.error("Failed to fetch owner properties", err);
        res.status(500).json({ success: false, message: "Failed to fetch properties" });
    }
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