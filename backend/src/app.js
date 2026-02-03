import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import apiRoutes from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { swaggerSpec, swaggerUi } from "./swagger.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "*",
        credentials: true
    })
);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === "/api/health"
});
app.use(limiter);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notFound);
app.use(errorHandler);

export default app;
