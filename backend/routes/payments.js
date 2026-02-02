const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Payment = require("../models/Payment");
const User = require("../models/User");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

/* =========================================================
   ADMIN → CREATE BILL
========================================================= */
router.post("/", auth, isAdmin, async (req, res) => {
    try {
        const { residentId, description, type, month, adminNote } = req.body;
        const amount = Number(req.body.amount);

        if (!residentId || !mongoose.Types.ObjectId.isValid(residentId)) {
            return res.status(400).json({ message: "Invalid resident" });
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        const resident = await User.findOne({
            _id: residentId,
            role: "resident",
            isActive: true
        });

        if (!resident) {
            return res
                .status(400)
                .json({ message: "Resident not found or inactive" });
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

        res.status(201).json(payment);
    } catch (err) {
        console.error("CREATE PAYMENT ERROR:", err);
        res.status(500).json({ message: "Failed to create payment" });
    }
});

/* =========================================================
   ADMIN → GET ALL PAYMENTS
========================================================= */
router.get("/", auth, isAdmin, async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate("residentId", "email name")
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (err) {
        console.error("FETCH PAYMENTS ERROR:", err);
        res.status(500).json({ message: "Failed to fetch payments" });
    }
});

/* =========================================================
   RESIDENT → GET OWN PAYMENTS
========================================================= */
router.get("/my", auth, async (req, res) => {
    try {
        res.set({
            "Cache-Control": "no-store, no-cache, must-revalidate, private",
            Pragma: "no-cache",
            Expires: "0"
        });

        const payments = await Payment.find({
            residentId: req.user.id
        }).sort({ createdAt: -1 });

        res.json(payments);
    } catch (err) {
        console.error("FETCH MY PAYMENTS ERROR:", err);
        res.status(500).json({ message: "Failed to fetch payments" });
    }
});

/* =========================================================
   ADMIN → MARK PAYMENT AS PAID
========================================================= */
router.put("/:id/paid", auth, isAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid payment ID" });
        }

        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        if (payment.status === "paid") {
            return res.json({ message: "Payment already marked as paid" });
        }

        payment.status = "paid";
        payment.paidAt = new Date();
        await payment.save();

        res.json({ message: "Payment marked as paid" });
    } catch (err) {
        console.error("MARK PAID ERROR:", err);
        res.status(500).json({ message: "Failed to mark payment as paid" });
    }
});

module.exports = router;
