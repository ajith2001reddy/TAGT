require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

/* ================= APP INIT ================= */
const app = express();
const PORT = process.env.PORT || 5000;

/* ================= CORS ================= */
const allowedOrigins = [
    "https://tagt.website",
    "https://www.tagt.website"
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (Postman, server-to-server)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error("CORS not allowed for origin: " + origin),
                false
            );
        },
        credentials: true
    })
);

/* ================= MIDDLEWARE ================= */
app.use(express.json());

/* ================= DB CONNECT ================= */
if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI not defined");
    process.exit(1);
}

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => {
        console.error("❌ MongoDB connection failed", err);
        process.exit(1);
    });

/* ================= ROUTES ================= */
const authRoutes = require("./routes/auth");

/* ================= HEALTH ================= */
app.get("/api/health", (req, res) => {
    res.json({ status: "OK" });
});

/* ================= AUTH ================= */
app.use("/api/auth", authRoutes);

/* ================= 404 HANDLER ================= */
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

/* ================= ERROR HANDLER ================= */
app.use((err, req, res, next) => {
    console.error("❌ ERROR:", err.message);
    res.status(err.status || 500).json({
        message: err.message || "Server error"
    });
});

/* ================= START SERVER ================= */
app.listen(PORT, () => {
    console.log(`✅ Backend running on port ${PORT}`);
});
