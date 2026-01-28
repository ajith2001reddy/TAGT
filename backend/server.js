require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const residentRoutes = require("./routes/resident");
const paymentsRoutes = require("./routes/payments");
const errorHandler = require("./middleware/errorHandler");
const roomsRoutes = require("./routes/rooms");

/* ================= APP INIT ================= */
const app = express();
const PORT = process.env.PORT || 5000;

/* ================= DB ================= */
connectDB();

/* ================= SECURITY ================= */
app.use(helmet());

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: "Too many login attempts, please try again later"
});

// General API rate limit
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use(generalLimiter);

/* ================= CORS (SECURE) ================= */
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL] // Set this in your .env (e.g., https://yourapp.com)
    : ['http://localhost:3000', 'http://localhost:3001'];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (mobile apps, curl, etc.)
            if (!origin) return callback(null, true);

            if (allowedOrigins.indexOf(origin) === -1) {
                return callback(new Error('CORS policy violation'), false);
            }
            return callback(null, true);
        },
        credentials: true
    })
);

/* ================= MIDDLEWARE ================= */
app.use(express.json());

/* ================= API ROUTES ================= */
app.use("/api/auth/login", authLimiter); // Apply strict limit to login
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/resident", residentRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/rooms", roomsRoutes);

/* ================= HEALTH CHECK ================= */
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

/* ================= ERROR HANDLER ================= */
app.use(errorHandler);

/* ================= START ================= */
app.listen(PORT, () => {
    console.log(`✅ Backend API running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});