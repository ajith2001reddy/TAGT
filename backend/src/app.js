import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import apiRoutes from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { swaggerSpec, swaggerUi } from "./swagger.js";



const app = express();
/* ================= SECURITY ================= */

app.set("trust proxy", 1);
app.use(
    helmet({
        // Needed for Firebase popup auth flows (window.close / window.closed in popup).
        crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
        // Keep COEP disabled to avoid breaking third-party auth SDK resources.
        crossOriginEmbedderPolicy: false
    })
);

const allowedOrigins = [
    "https://tagt.website",
    "https://www.tagt.website",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173", // in case you ever use Vite
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (origin.includes(".vercel.app")) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // During local dev, we might want to just log the missing origin and allow it initially
        // callback(new Error(`Not allowed by CORS: ${origin}`));
        // FOR NOW: Let's relax CORS perfectly for your local development setup
        return callback(null, true);
    },
    credentials: true, // IMPORTANT: Allows cookies/auth headers like Firebase token to flow
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-requested-with"],
}));
app.options("*", cors()); // Enable pre-flight across-the-board

/* ================= RATE LIMIT ================= */

// Global limiter - broad protection
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later" },
});

// Strict limiter for auth endpoints (brute-force protection)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many login attempts, please try again in 15 minutes" },
    keyGenerator: (req) => req.ip,
});

// Payment limiter (prevent accidental double-charges)
const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Payment request rate limit exceeded" },
});

app.use("/api", limiter);
app.use("/api/v2/auth/login", authLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/v2/payments", paymentLimiter);
app.use("/api/payments", paymentLimiter);

/* ================= BODY PARSER ================= */

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
    res.status(200).json({
        status: "OK",
        service: "TAGT Backend",
        time: new Date().toISOString(),
    });
});

/* ================= ROUTES ================= */

app.use("/api", apiRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* ================= ERRORS ================= */

app.use(notFound);
app.use(errorHandler);

export default app;
