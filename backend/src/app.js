import express from "express";
import cors from "cors";

import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";

/* ======================
   APP INITIALIZATION
====================== */
const app = express();

/* ======================
   DATABASE
====================== */
await connectDB();

/* ======================
   CORS CONFIG
====================== */
const allowedOrigins = [
    "https://tagt.website",
    "https://www.tagt.website",
    "http://localhost:3000"
];

app.use(
    cors({
        origin(origin, callback) {
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error(`CORS blocked: ${origin}`),
                false
            );
        },
        credentials: true
    })
);

/* ======================
   MIDDLEWARE
====================== */
app.use(express.json({ limit: "10kb" }));

/* ======================
   HEALTH CHECK
====================== */
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString()
    });
});

/* ======================
   ROUTES
====================== */
app.use("/api", routes);

/* ======================
   ERROR HANDLING
====================== */
app.use(notFound);
app.use(errorHandler);

export default app;
