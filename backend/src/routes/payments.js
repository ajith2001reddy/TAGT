import { Router } from "express";
import mongoose from "mongoose";

import Payment from "../models/Payment.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";

const router = Router();

/* =========================
   ADMIN → CREATE BILL
========================= */
router.post("/", auth, isAdmin, async (req, res, next) => {
    try {
        const { residentId, description, type, month, adminNote } = req.body;
        const amount = Number(req.body.amount);

        if (!mongoose.Types.ObjectId.isValid(residentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid resident"
            });
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid amount"
            });
        }

        const resident = await User.findOne({
            _id: residentId,
            role: "resident",
            isActive: true
        }).lean();

        if (!resident) {
            return res.status(400).json({
                success: false,
                message: "Resident not found or inactive"
            });
        }

        const payment = await Payment.create({
            residentId,
            amount,
            description: description || "",
            type: type || "manual",
            month: month || null,
            adminNote: adminNote || "",
            status: "unpaid",
            createdBy: req.user.id
        });

        res.status(201).json({ success: true, payment });
    } catch (err) {
        next(err);
    }
});

/* =========================
   ADMIN → GET ALL PAYMENTS
========================= */
router.get("/", auth, isAdmin, async (req, res, next) => {
    try {
        const payments = await Payment.find()
            .populate("residentId", "email name")
            .sort({ createdAt: -1 })
            .lean();

        res.json({ success: true, payments });
    } catch (err) {
        next(err);
    }
});

/* =========================
   RESIDENT → GET OWN PAYMENTS
========================= */
router.get("/my", auth, async (req, res, next) => {
    try {
        res.set({
            "Cache-Control": "no-store, no-cache, must-revalidate, private",
            Pragma: "no-cache",
            Expires: "0"
        });

        const payments = await Payment.find({
            residentId: req.user.id
        })
            .sort({ createdAt: -1 })
            .lean();

        res.json({ success: true, payments });
    } catch (err) {
        next(err);
    }
});

/* =========================
   ADMIN → MARK PAYMENT AS PAID
========================= */
router.put("/:id/paid", auth, isAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment ID"
            });
        }

        const payment = await Payment.findById(id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        if (payment.status === "paid") {
            return res.json({
                success: true,
                message: "Payment already marked as paid"
            });
        }

        payment.status = "paid";
        payment.paidAt = new Date();
        await payment.save();

        res.json({
            success: true,
            message: "Payment marked as paid"
        });
    } catch (err) {
        next(err);
    }
});

export default router;
