import User from "../../models/User.js";
import ActivityLog from "../../models/ActivityLog.js";
import admin from "firebase-admin";

export const login = async (req, res) => {
    try {
        const { firebaseToken } = req.body;
        if (firebaseToken) {
            const decoded = await admin.auth().verifyIdToken(firebaseToken);
            const user = await User.findOne({ firebaseUid: decoded.uid });
            if (user) {
                await ActivityLog.create({
                    action: "LOGIN_SUCCESS",
                    performedBy: user._id,
                    role: user.role,
                    propertyId: user.propertyId || null,
                    ipAddress: req.ip || req.headers["x-forwarded-for"] || "unknown",
                    route: "POST /api/v2/auth/login"
                });
            }
        }
    } catch (error) {
        // Silently fail logging to avoid blocking Firebase client-side flow
        console.error("Login audit failed", error.message);
    }

    res.json({
        success: true,
        message: "Login handled by Firebase on frontend"
    });
};

export const registerOwner = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and email required"
            });
        }

        const existing = await User.findOne({ email: email.toLowerCase() });

        if (existing) {
            return res.json({
                success: true,
                message: "Owner already exists"
            });
        }

        const newOwner = await User.create({
            name,
            email: email.toLowerCase(),
            role: "owner",
            isActive: true
        });

        await ActivityLog.create({
            action: "OWNER_REGISTERED",
            performedBy: newOwner._id,
            role: "owner",
            propertyId: null,
            ipAddress: req.ip || req.headers["x-forwarded-for"] || "unknown",
            route: "POST /api/v2/auth/register-owner"
        });

        res.status(201).json({
            success: true,
            data: newOwner
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};