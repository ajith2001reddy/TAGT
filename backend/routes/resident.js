const express = require("express");
const auth = require("../middleware/auth");
const Request = require("../models/Request");
const Payment = require("../models/Payment");

const router = express.Router();

// My payments
router.get("/payments", auth, async (req, res, next) => {
    try {
        const payments = await Payment.find({ residentId: req.user.id });
        res.json(payments);
    } catch (err) {
        next(err);
    }
});

// Raise request
router.post("/request", auth, async (req, res, next) => {
    try {
        const request = await Request.create({
            residentId: req.user.id,
            message: req.body.message
        });
        res.status(201).json(request);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
