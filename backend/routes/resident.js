const express = require("express");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const Request = require("../models/Request");

const router = express.Router();

/* ===== CREATE REQUEST ===== */
router.post("/request", auth, async (req, res, next) => {
    try {
        if (!req.body.message || !req.body.message.trim()) {
            return res
                .status(400)
                .json({ message: "Request message is required" });
        }

        const request = await Request.create({
            residentId: req.user.id,
            message: req.body.message
        });

        res.status(201).json(request);
    } catch (err) {
        next(err);
    }
});

/* ===== GET MY REQUESTS ===== */
router.get("/requests", auth, async (req, res, next) => {
    try {
        const requests = await Request.find({
            residentId: req.user.id
        }).sort({ createdAt: -1 });

        res.json(requests);
    } catch (err) {
        next(err);
    }
});

/* ===== DELETE MY REQUEST ===== */
router.delete("/request/:id", auth, async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res
                .status(400)
                .json({ message: "Invalid request ID" });
        }

        const request = await Request.findOne({
            _id: req.params.id,
            residentId: req.user.id
        });

        if (!request) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        await request.deleteOne();
        res.json({
            message: "Request deleted successfully"
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
