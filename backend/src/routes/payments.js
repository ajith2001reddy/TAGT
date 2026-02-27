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
            return res.status(400).json({ success: false, message: "Invalid resident" });
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid amount" });
        }

        const resident = await User.findOne({
            _id: residentId,
            role: "resident",
            isActive: true,
        }).lean();

        if (!resident) {
            return res.status(400).json({
                success: false,
                message: "Resident not found or inactive",
            });
        }

        // Prevent duplicate monthly bill
        if (month) {
            // FIX: Payment model uses 'resident' field, not 'residentId'
            const exists = await Payment.findOne({ resident: residentId, month });
            if (exists) {
                return res.status(400).json({
                    success: false,
                    message: "Bill already exists for this month",
                });
            }
        }

        const dueDate = month
            ? new Date(`${month}-05`) // 5th of the billed month
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

        const payment = await Payment.create({
            resident: residentId,       // FIX: was 'residentId', model field is 'resident'
            amount,
            notes: description || adminNote || "",
            type: type || "other",
            month: month || new Date().toISOString().slice(0, 7),
            status: "pending",
            dueDate,
        });

        res.status(201).json({ success: true, payment });
    } catch (err) {
        next(err);
    }
});

/* =========================
   ADMIN → GET ALL PAYMENTS
========================= */
// FIX: Removed duplicate GET "/" handler (there were two, second one shadowed the first)
router.get("/", auth, isAdmin, async (req, res, next) => {
    try {
        const payments = await Payment.find()
            .populate({
                path: "resident",       // FIX: was 'residentId'
                select: "email name",
                options: { strictPopulate: false },
            })
            .sort({ createdAt: -1 })
            .lean();

        return res.json({
            success: true,
            payments: payments || [],
        });
    } catch (err) {
        console.error("GET PAYMENTS ERROR:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to load payments",
        });
    }
});

/* =========================
   RESIDENT → GET OWN PAYMENTS
========================= */
router.get("/mine", auth, async (req, res, next) => {
    try {
        const payments = await Payment.find({ resident: req.user._id })
            .sort({ createdAt: -1 })
            .lean();

        return res.json({ success: true, payments });
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
            return res.status(400).json({ success: false, message: "Invalid payment ID" });
        }

        const payment = await Payment.findById(id);

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        if (payment.status === "paid") {
            return res.json({ success: true, message: "Payment already marked as paid" });
        }

        payment.status = "paid";
        payment.paidAt = new Date();
        await payment.save();

        res.json({ success: true, message: "Payment marked as paid" });
    } catch (err) {
        next(err);
    }
});

/* =========================
   ADMIN → DELETE PAYMENT
========================= */
router.delete("/:id", auth, isAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid payment ID" });
        }

        const payment = await Payment.findById(id);

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        await payment.deleteOne();

        res.json({ success: true, message: "Payment deleted successfully" });
    } catch (err) {
        next(err);
    }
});

export default router;