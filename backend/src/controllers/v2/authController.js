import User from "../../models/User.js";
import ActivityLog from "../../models/ActivityLog.js";
import admin from "firebase-admin";
import Joi from "joi";

export const login = async (req, res) => {
    try {
        const token = req.body.firebaseToken || req.headers.authorization?.split("Bearer ")[1];

        if (token) {
            const decoded = await admin.auth().verifyIdToken(token);
            // Sanitize input to prevent injection
            const firebaseUid = String(decoded.uid);
            const user = await User.findOne({ firebaseUid });

            if (user) {
                await ActivityLog.create({
                    action: "LOGIN_SUCCESS",
                    performedBy: user._id,
                    role: user.role,
                    propertyId: user.propertyId || null,
                    ipAddress: String(req.ip || req.headers["x-forwarded-for"] || "unknown"),
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

export const register = async (req, res) => {
    try {
        const schema = Joi.object({
            name: Joi.string().min(2).max(100).required(),
            email: Joi.string().email().required(),
            role: Joi.string().valid("owner", "resident").default("resident"),
            phoneNumber: Joi.string().allow(""),
            password: Joi.string().allow("")
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { name, email, role, phoneNumber, password } = value;

        const sanitizedEmail = String(email || "").toLowerCase().trim();
        const existing = await User.findOne({ email: sanitizedEmail });

        if (existing) {
            return res.json({
                success: true,
                message: "User already registered",
                data: existing
            });
        }

        const newUser = await User.create({
            name: String(name).trim(),
            email: sanitizedEmail,
            phoneNumber: phoneNumber || null,
            password: password || null,
            role: role,
            isActive: true
        });

        await ActivityLog.create({
            action: "USER_REGISTERED",
            performedBy: newUser._id,
            role: role,
            propertyId: null,
            ipAddress: req.ip || req.headers["x-forwarded-for"] || "unknown",
            route: "POST /api/v2/auth/register"
        });

        res.status(201).json({
            success: true,
            data: newUser
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};