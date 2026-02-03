import { Router } from "express";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const router = Router();

/* =========================
   LOGIN
========================= */
router.post("/login", async (req, res, next) => {
    try {
        const email = req.body.email?.toLowerCase().trim();
        const { password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account is disabled"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = generateToken({
            id: user._id,
            role: user.role
        });

        return res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                roomId: user.roomId
            }
        });
    } catch (error) {
        next(error); // handled by global error middleware
    }
});

export default router;
