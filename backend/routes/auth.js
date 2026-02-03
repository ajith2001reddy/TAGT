const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const router = express.Router();

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
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

        const token = generateToken(user);

        return res.json({
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
        console.error("LOGIN ERROR:", err.message);
        return res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
});

module.exports = router;
