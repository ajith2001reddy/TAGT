const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Resident = require("../models/Resident");

const router = express.Router();

/* REGISTER */
router.post("/register", async (req, res) => {
    try {
        const { email, password, role } = req.body || {};

        if (!email || !password || !role) {
            return res.status(400).json("All fields required");
        }

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json("User exists");

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashed,
            role
        });

        if (role === "resident") {
            await Resident.create({ userId: user._id });
        }

        res.status(201).json("Registered successfully");
    } catch (err) {
        console.error(err);
        res.status(500).json("Server error");
    }
});

/* LOGIN */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json("Email & password required");
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json("Invalid credentials");

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json("Invalid credentials");

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token, role: user.role });
    } catch (err) {
        console.error(err);
        res.status(500).json("Server error");
    }
});

module.exports = router;
