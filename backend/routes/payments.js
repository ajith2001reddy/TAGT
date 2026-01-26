const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

// Mark paid
router.put("/:id/paid", auth, isAdmin, async (req, res) => {
    await Payment.findByIdAndUpdate(req.params.id, { status: "paid" });
    res.json("Payment marked as paid");
});

module.exports = router;
