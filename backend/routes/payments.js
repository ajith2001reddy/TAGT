const express = require("express");
const router = express.Router();

const Payment = require("../models/Payment");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

/* =========================================================
   PHASE 3 – ADMIN CREATE BILL (NEW)
   - Direct billing to a resident
   - Used for rent, penalties, maintenance, etc.
========================================================= */
router.post("/", auth, isAdmin, async (req, res) => {
    try {
        const {
            residentId,
            amount,
            description,
            type,
            month,
            adminNote
        } = req.body;

        if (!residentId || !amount) {
            return res
                .status(400)
                .json("Resident and amount are required");
        }

        const payment = await Payment.create({
            residentId,
            amount,
            description,
            type,
            month,
            adminNote,
            createdBy: req.user.id
        });

        res.status(201).json(payment);
    } catch (err) {
        res.status(500).json("Failed to create payment");
    }
});

/* =========================================================
   PHASE 3 – ADMIN GET ALL PAYMENTS (NEW)
========================================================= */
router.get("/", auth, isAdmin, async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate("residentId", "email")
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (err) {
        res.status(500).json("Failed to fetch payments");
    }
});

/* =========================================================
   PHASE 3 – RESIDENT GET OWN PAYMENTS (NEW)
========================================================= */
router.get("/my", auth, async (req, res) => {
    try {
        const payments = await Payment.find({
            residentId: req.user.id
        }).sort({ createdAt: -1 });

        res.json(payments);
    } catch (err) {
        res.status(500).json("Failed to fetch payments");
    }
});

/* =========================================================
   MARK PAYMENT AS PAID (EXISTING – EXTENDED SAFELY)
========================================================= */
router.put("/:id/paid", auth, isAdmin, async (req, res) => {
    try {
        await Payment.findByIdAndUpdate(req.params.id, {
            status: "paid",
            paidAt: new Date()
        });

        res.json("Payment marked as paid");
    } catch (err) {
        res.status(500).json("Failed to mark payment as paid");
    }
});

module.exports = router;
