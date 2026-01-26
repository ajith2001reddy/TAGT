const express = require("express");
const Resident = require("../models/Resident");
const Payment = require("../models/Payment");
const Request = require("../models/Request");
const auth = require("../middleware/auth");

const router = express.Router();

// ADD resident
router.post("/add", async (req, res) => {
    const resident = new Resident(req.body);
    await resident.save();

    const payment = new Payment({
        residentId: resident._id,
        month: "January",
        status: "DUE"
    });
    await payment.save();

    res.json(resident);
});

// GET all residents
router.get("/", async (req, res) => {
    const residents = await Resident.find();
    res.json(residents);
});

// GET payments of resident
router.get("/payments/:id", async (req, res) => {
    const payments = await Payment.find({ residentId: req.params.id });
    res.json(payments);
});

// MARK payment as PAID
router.post("/pay/:id", async (req, res) => {
    await Payment.findByIdAndUpdate(req.params.id, { status: "PAID" });
    res.json("Payment updated");
});

// ADD complaint / request
router.post("/request", async (req, res) => {
    const request = new Request(req.body);
    await request.save();
    res.json(request);
});

// GET complaints by resident
router.get("/request/:id", async (req, res) => {
    const requests = await Request.find({ residentId: req.params.id });
    res.json(requests);
});
router.post("/request", auth, async (req, res) => {
    const request = await Request.create({
        residentId: req.user.id,
        message: req.body.message
    });
    res.status(201).json(request);
});


module.exports = router;
