const express = require("express");
const router = express.Router();

const Request = require("../models/Request");
const auth = require("../middleware/auth");

/* ================= CREATE REQUEST ================= */
router.post("/request", auth, async (req, res, next) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        const request = await Request.create({
            residentId: req.user.id,
            message: message.trim(),
            status: "pending",
            workflowStatus: "Received",
            statusHistory: [{ status: "pending" }]
        });

        res.status(201).json({
            success: true,
            request
        });
    } catch (err) {
        next(err);
    }
});

/* ================= GET MY REQUESTS ================= */
router.get("/requests", auth, async (req, res, next) => {
    try {
        const requests = await Request.find({
            residentId: req.user.id
        })
            .sort({ createdAt: -1 })
            .lean();

        res.json(requests);
    } catch (err) {
        next(err);
    }
});

/* ================= DELETE REQUEST ================= */
router.delete("/request/:id", auth, async (req, res, next) => {
    try {
        const { id } = req.params;

        const request = await Request.findOne({
            _id: id,
            residentId: req.user.id
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found"
            });
        }

        await request.deleteOne();

        res.json({
            success: true,
            message: "Request deleted"
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
