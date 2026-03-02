import { Router } from "express";
import firebaseAuth from "../middleware/firebaseAuth.js";
import authorize from "../middleware/authorize.js";
import Payment from "../models/Payment.js";
import Request from "../models/Request.js";

const router = Router();

/**
 * GET /api/resident/payments
 */
router.get("/payments", firebaseAuth, authorize("resident"), async (req, res) => {
    const payments = await Payment.find({
        resident: req.user._id
    }).lean();

    res.json({ success: true, data: payments });
});

/**
 * GET /api/resident/requests
 */
router.get("/requests", firebaseAuth, authorize("resident"), async (req, res) => {
    const requests = await Request.find({
        resident: req.user._id
    }).lean();

    res.json({ success: true, data: requests });
});

export default router;