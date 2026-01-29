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

// Rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(generalLimiter);

/* ================= CORS (FIXED FOR LOCALHOST + RENDER) ================= */

/* ================= CORS (FIXED FOR LOCALHOST + RENDER) ================= */
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://tagt.onrender.com",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("CORS blocked origin:", origin);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// 🔴 THIS LINE FIXES YOUR ERROR
app.options("*", cors());

/* ================= MIDDLEWARE ================= */
app.use(express.json());

/* ================= API ROUTES ================= */
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
    console.log(`🌍 Allowed origins:`, allowedOrigins);
});