import { Router } from "express";
import mongoose from "mongoose";
import Request from "../models/Request.js";
import firebaseAuth from "../middleware/firebaseAuth.js";

const router = Router();

router.post("/request", firebaseAuth, async (req, res, next) => {
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

router.get("/requests", firebaseAuth, async (req, res, next) => {
    try {
        const requests = await Request.find({
            residentId: req.user.id
        })
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            requests
        });
    } catch (err) {
        next(err);
    }
});

router.delete("/request/:id", firebaseAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid request ID"
            });
        }

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

export default router;
