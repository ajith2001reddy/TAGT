import { Router } from "express";
import mongoose from "mongoose";

import Payment from "../models/Payment.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import { buildPropertyFilter } from "../utils/tenantScope.js";

import { authorize } from "../middleware/authorize.js";

const router = Router();

/* =========================
   ADMIN → CREATE BILL
========================= */
router.post("/", auth, authorize("owner"), async (req, res, next) => {
    try {
        const { residentId, description, type, month, adminNote } = req.body;
        const amount = Number(req.body.amount);

        if (!mongoose.Types.ObjectId.isValid(residentId)) {
            return res.status(400).json({ success: false, message: "Invalid resident" });
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid amount" });
        }

        const scope = buildPropertyFilter(req.user);
        const resident = await User.findOne({
            _id: residentId,
            role: "resident",
            isActive: true,
            ...scope
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
            const scope = buildPropertyFilter(req.user);
            const exists = await Payment.findOne({ resident: residentId, month, ...scope });
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
            ...scope
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
router.get("/", auth, authorize("owner"), async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const payments = await Payment.find({ ...scope })
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


router.get("/export/csv", auth, isAdmin, async (req, res, next) => {
    try {
        const payments = await Payment.find()
            .populate({ path: "resident", select: "name email", options: { strictPopulate: false } })
            .sort({ createdAt: -1 })
            .lean();

        const escapeCsv = (value) => {
            if (value == null) return "";
            const str = String(value).replace(/"/g, '""');
            return /[",\n]/.test(str) ? `"${str}"` : str;
        };

        const rows = [
            ["paymentId", "residentName", "residentEmail", "amount", "type", "status", "month", "dueDate", "paidAt", "createdAt"],
            ...payments.map((payment) => [
                payment._id,
                payment.resident?.name || "",
                payment.resident?.email || "",
                payment.amount,
                payment.type,
                payment.status,
                payment.month || "",
                payment.dueDate ? new Date(payment.dueDate).toISOString() : "",
                payment.paidAt ? new Date(payment.paidAt).toISOString() : "",
                payment.createdAt ? new Date(payment.createdAt).toISOString() : ""
            ])
        ];

        const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=payments-${new Date().toISOString().slice(0, 10)}.csv`);
        return res.status(200).send(csv);
    } catch (err) {
        next(err);
    }
});

/* =========================
   RESIDENT → GET OWN PAYMENTS
========================= */
const getMyPayments = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const payments = await Payment.find({ resident: req.user._id, ...scope })
            .sort({ createdAt: -1 })
            .lean();

        return res.json({ success: true, payments });
    } catch (err) {
        next(err);
    }
};

router.get("/my", auth, getMyPayments);
router.get("/mine", auth, getMyPayments); // backward-compatible alias

/* =========================
   ADMIN → MARK PAYMENT AS PAID
========================= */
router.put("/:id/paid", auth, authorize("owner"), async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid payment ID" });
        }

        const scope = buildPropertyFilter(req.user);
        const payment = await Payment.findById(id, ...scope);

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
router.delete("/:id", auth, authorize("owner"), async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid payment ID" });
        }

        const scope = buildPropertyFilter(req.user);
        const payment = await Payment.findById(id, ...scope);

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