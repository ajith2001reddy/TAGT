require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const residentRoutes = require("./routes/resident");
const errorHandler = require("./middleware/errorHandler");

/* ================= APP INIT ================= */
const app = express();
const PORT = process.env.PORT || 5000;

/* ================= DB ================= */
connectDB();

/* ================= SECURITY ================= */
app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(
    cors({
        origin: "*",
        credentials: true
    })
);

/* ================= API ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/resident", residentRoutes);

/* ================= STATIC FRONTEND ================= */
/**
 * IMPORTANT:
 * This allows manifest.json, favicon, static assets
 * WITHOUT authentication
 */
app.use(express.static(path.join(__dirname, "frontend/build")));

/* ================= REACT ROUTER FALLBACK ================= */
app.get("*", (req, res) => {
    res.sendFile(
        path.join(__dirname, "frontend/build", "index.html")
    );
});

/* ================= ERROR HANDLER ================= */
app.use(errorHandler);

/* ================= START ================= */
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
