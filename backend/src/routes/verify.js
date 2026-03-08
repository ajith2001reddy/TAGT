import express from "express";
import User from "../models/User.js";
import { upload } from "../config/cloudinary.js";
import { fraudDetection } from "../utils/fraudDetection.js";
import protect from "../middleware/auth.js";

const router = express.Router();

/**
 * @desc Upload verification documents and trigger fraud detection
 * @route POST /api/verify/upload
 * @access Private
 */
router.post(
    "/upload",
    protect,
    upload.fields([
        { name: "selfie", maxCount: 1 },
        { name: "idFront", maxCount: 1 },
        { name: "idBack", maxCount: 1 },
        { name: "propertyDoc", maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            if (!req.files || !req.files.selfie || !req.files.idFront || !req.files.idBack) {
                return res.status(400).json({
                    success: false,
                    message: "Selfie, ID Front, and ID Back are required.",
                });
            }

            // Save basic files
            if (!user.verification) {
                user.verification = {};
            }

            user.verification.selfiePhoto = req.files.selfie[0].path;
            user.verification.idFront = req.files.idFront[0].path;
            user.verification.idBack = req.files.idBack[0].path;

            // Property proof for owners
            if (user.role === "owner") {
                if (!req.files.propertyDoc) {
                    return res.status(400).json({
                        success: false,
                        message: "Property document is required for owners.",
                    });
                }
                user.verification.propertyDocument = req.files.propertyDoc[0].path;
            }

            // Run fraud detection
            const { score, risk } = fraudDetection(user);
            user.verification.aiScore = score;
            user.verification.fraudRisk = risk;

            // Set status to pending for admin review
            user.verification.status = "pending";

            await user.save();

            res.status(200).json({
                success: true,
                message: "Documents uploaded successfully. Verification is pending admin approval.",
                data: {
                    status: user.verification.status,
                    fraudRisk: user.verification.fraudRisk
                }
            });
        } catch (error) {
            console.error("Verification upload error:", error);
            res.status(500).json({ success: false, message: "Server error during file upload" });
        }
    }
);

export default router;
