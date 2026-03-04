import { Router } from "express";
import auth from "../middleware/auth.js";
import Enquiry from "../models/Enquiry.js";
import logger from "../utils/logger.js";

const router = Router();

/**
 * POST /api/enquiries
 * Create new enquiry
 */
router.post("/", auth, async (req, res) => {
    try {
        const { propertyId, pgName, message } = req.body;

        if (!propertyId || !pgName) {
            return res.status(400).json({
                success: false,
                message: "Property ID and Name are required",
            });
        }

        const enquiry = await Enquiry.create({
            propertyId,
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
        logger.error("Enquiry error", { error: error.message });

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});

export default router;