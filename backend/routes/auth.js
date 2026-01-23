const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Resident = require("../models/Resident");

const router = express.Router();

// LOGIN
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json("Invalid credentials");

    let residentId = null;
    if (user.role === "resident") {
        const resident = await Resident.findOne({ userId: user._id });
        if (resident) residentId = resident._id;
    }

    const token = jwt.sign(
        { id: user._id, role: user.role },
        "tagt_secret",
        { expiresIn: "1d" }
    );

    res.json({
        token,
        role: user.role,
        residentId
    });
});

module.exports = router;
