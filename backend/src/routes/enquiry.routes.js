import { Router } from "express";
import auth from "../middleware/auth.js";
import Enquiry from "../models/Enquiry.js";

const router = Router();

/**
 * POST /api/enquiries
 * Create new enquiry
 */
router.post("/", auth, async (req, res) => {
    try {
        const { pgId, pgName, message } = req.body;

        if (!pgId || !pgName) {
            return res.status(400).json({
                success: false,
                message: "PG details missing",
            });
        }

        const enquiry = await Enquiry.create({
            pgId,
            pgName,
            userId: req.user._id,
            message,
        });

        res.status(201).json({
            success: true,
            message: "Enquiry sent successfully",
            data: enquiry,
        });

    } catch (error) {
        console.error("Enquiry error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});

export default router;