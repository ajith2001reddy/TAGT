require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

/* ================= APP SETUP ================= */
const app = express();
const PORT = process.env.PORT || 5000;

/* ================= SECURITY ================= */
app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

/* ================= CORS ================= */
app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "https://tagt.website",
            "https://www.tagt.website"
        ],
        credentials: true
    })
);

/* ================= BODY PARSER ================= */
app.use(express.json());

/* ================= ROUTES ================= */
app.get("/api/health", (req, res) => {
    res.json({ status: "OK" });
});

app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;

    // TEMP DEMO LOGIN (from scratch)
    if (email !== "admin@test.com" || password !== "123456") {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({
        token: "demo-jwt-token",
        role: "admin"
    });
});

/* ================= START SERVER ================= */
app.listen(PORT, () => {
    console.log(`✅ Backend running on port ${PORT}`);
});
