import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import compression from "compression";
import { v4 as uuidv4 } from "uuid";
import "@sentry/profiling-node"; // Import for side effects to enable profiling

import apiRoutes from "./routes/index.js";
import { metricsMiddleware, metricsEndpoint } from "./middleware/metrics.js";
import { initEventHandlers } from "./events/handlers.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { auditLogger } from "./middleware/auditLogger.js";
import { swaggerSpec, swaggerUi } from "./swagger.js";
import "./jobs/scheduler.js"; // Initialize chron jobs
import logger from "./utils/logger.js"; // Assuming logger is available

// Initialize Sentry if DSN is provided
if (process.env.SENTRY_DSN) {
    import("@sentry/node").then((Sentry) => {
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            environment: process.env.NODE_ENV,
            integrations: [],
        });
        logger.info("🛡️ Sentry initialized.");
    });
}

// Initialize Domain Event Bus
initEventHandlers();

const app = express();
/* ================= REQUEST IDs & LOGGING ================= */

app.use((req, res, next) => {
    req.id = uuidv4();
    next();
});

app.use(morgan("combined"));
app.use(compression());

/* ================= METRICS ================= */

app.use(metricsMiddleware);
app.get("/metrics", (req, res, next) => {
    if (req.headers["x-admin-key"] !== process.env.ADMIN_KEY) {
        return res.status(403).send("Forbidden");
    }
    next();
}, metricsEndpoint);

/* ================= SECURITY ================= */

app.set("trust proxy", 1);
app.use(
    helmet({
        // Needed for Firebase popup auth flows (window.close / window.closed in popup).
        crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
        // Keep COEP disabled to avoid breaking third-party auth SDK resources.
        crossOriginEmbedderPolicy: false,
        // Strict SOC2 Header Hardening
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com", "https://www.gstatic.com"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https://*"],
                connectSrc: ["'self'", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com", "https://www.googleapis.com", "https://tagt.website"],
                frameSrc: ["'self'", "https://tagt.website", "https://tagt.firebaseapp.com"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: [],
            },
        },
        frameguard: {
            action: "deny",
        },
        xssFilter: true,
        noSniff: true,
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

        if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // IMPORTANT: Allows cookies/auth headers like Firebase token to flow
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-requested-with"],
}));
app.options("*", cors()); // Enable pre-flight across-the-board

/* ================= RATE LIMIT ================= */

// Global limiter - 100 requests per minute for standard API traffic
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later" },
});

// Strict limiter for Login (5 requests per minute)
const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many login attempts, please try again in a minute" },
    keyGenerator: (req) => req.ip,
});

// Ultra-strict limiter for Signup (3 requests per minute)
const signupLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many signup attempts, please try again in a minute" },
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

// Heavy Reports Limiter
const reportLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many report requests. Please wait 15 minutes." },
});

// Automation Limiter
const automationLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Automation triggers are rate-limited to prevent abuse." },
});

// Support Ticket Limiter
const supportLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Support ticket submission limit reached. Please try again in an hour." },
});

// Mount limiters to their specific routes
app.use("/api/v2/auth/login", loginLimiter);
app.use("/api/v2/auth/register-owner", signupLimiter);
app.use("/api/v2/payments", paymentLimiter);
app.use("/api/v2/reports", reportLimiter);
app.use("/api/v2/automation", automationLimiter);
app.use("/api/v2/support/tickets", supportLimiter);

// Apply standard global limiter to the rest of the API
app.use("/api", limiter);

/* ================= BODY PARSER ================= */

// Stripe Webhook MUST have raw body for signature verification
import { stripeWebhook } from "./controllers/v2/stripeController.js";
app.post(
    "/api/v2/stripe/webhook",
    express.raw({ type: "application/json" }),
    stripeWebhook
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(auditLogger);

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

// Let Sentry catch errors before the custom errorHandler.
if (process.env.SENTRY_DSN) {
    import("@sentry/node").then((Sentry) => {
        Sentry.setupExpressErrorHandler(app);
    });
}

// Global Error Handlers (Should be last)
app.use(notFound);
app.use(errorHandler);

export default app;
