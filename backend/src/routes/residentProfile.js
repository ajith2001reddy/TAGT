import { Router } from "express";
import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";
import User from "../models/User.js";

const router = Router();

/**
 GET /api/resident/profile
 Returns resident property and room information
*/
router.get("/profile", auth, authorize("resident"), async (req, res) => {

    try {

        const resident = await User.findById(req.user._id)
            .populate("propertyId", "name address city phone")
            .populate("roomId", "roomNumber rent")
            .lean();

        if (!resident) {
            return res.status(404).json({
                success: false,
                message: "Resident not found"
            });
        }

        res.json({
            success: true,
            data: resident
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});

export default router;
