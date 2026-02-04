import { Router } from "express";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const router = Router();

router.post("/login", async (req, res, next) => {
    try {
        const email = req.body.email?.toLowerCase().trim();
        const password = req.body.password?.trim();

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user with password (select: false in schema, so explicitly select it)
        const user = await User.findOne({ email }).select("+password");

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Use model's comparePassword method
        const isMatch = await user.comparePassword(password);

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

        res.json({
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
    } catch (err) {
        next(err);
    }
});

export default router;