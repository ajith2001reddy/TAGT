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
app.use(helmet());

const allowedOrigins = [
    "https://tagt.website",
    "https://www.tagt.website",
    "http://localhost:3000",        // ✅ local dev
];

app.use(
    cors({
        origin: (origin, callback) => {
            // allow server-to-server or curl
            if (!origin) return callback(null, true);

            // allow Vercel preview deployments
            if (origin.includes(".vercel.app")) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

/* ================= RATE LIMIT ================= */

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500, // ✅ safer for dashboards
    standardHeaders: true,
    legacyHeaders: false,
});

app.use("/api", limiter); // limit only API, not docs

/* ================= BODY PARSER ================= */

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

/* ================= HEALTH CHECK ================= */

// root health for Render / uptime monitors
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
