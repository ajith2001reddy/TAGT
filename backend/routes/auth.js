const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Resident = require("../models/Resident");

const router = express.Router();

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashedPassword,
            role
        });

        if (role === "resident") {
            await Resident.create({ userId: user._id });
        }

        res.status(201).json("User registered successfully");
    } catch (err) {
        console.error(err);
        res.status(500).json("Server error");
    }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
    const { email, password } = req.body || {};

    try {
        const user = await User.findOne({ email });
        if (!email || !password) {
            return res.status(400).json("Email and password are required");
        }

        if (!user) {
            return res.status(401).json("Invalid credentials");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json("Invalid credentials");
        }

        let residentId = null;
        if (user.role === "resident") {
            const resident = await Resident.findOne({ userId: user._id });
            if (resident) residentId = resident._id;
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            token,
            role: user.role,
            residentId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json("Server error");
    }
});

module.exports = router;
