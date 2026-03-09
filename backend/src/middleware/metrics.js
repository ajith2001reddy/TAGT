import client from "prom-client";
import logger from "../utils/logger.js";

// Initialize Prometheus Registry
const register = new client.Registry();

// Default metrics (CPU, Memory, etc.)
client.collectDefaultMetrics({ register });

// ── CUSTOM METRICS ──────────────────────────────────────────────────

// 1. HTTP Request Duration Histogram
export const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "status"],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10], // seconds
});

// 2. Business Events Counter
export const businessEventsCounter = new client.Counter({
    name: "business_event_total",
    help: "Total count of business domain events",
    labelNames: ["event_type"],
});

// 3. Worker Job Duration Histogram
export const workerJobDuration = new client.Histogram({
    name: "worker_job_duration_seconds",
    help: "Duration of background jobs in seconds",
    labelNames: ["job_name", "status"],
    buckets: [1, 5, 10, 30, 60, 120, 300, 600], // buckets up to 10 mins
});

// 4. Worker Job Total Counter
export const workerJobCounter = new client.Counter({
    name: "worker_job_total",
    help: "Total count of background jobs",
    labelNames: ["job_name", "status"],
});

register.registerMetric(httpRequestDuration);
register.registerMetric(businessEventsCounter);
register.registerMetric(workerJobDuration);
register.registerMetric(workerJobCounter);

/**
 * Middleware to track request latency
 */
export const metricsMiddleware = (req, res, next) => {
    const start = process.hrtime();

    res.on("finish", () => {
        const duration = process.hrtime(start);
        const durationInSeconds = duration[0] + duration[1] / 1e9;

        // Skip some high-noise or internal routes if needed
        if (req.originalUrl === "/metrics" || req.originalUrl === "/health") return;

        // Clean up route name (remove IDs to prevent label explosion)
        const route = req.route ? req.route.path : req.originalUrl.split("?")[0];

        httpRequestDuration.labels(req.method, route, res.statusCode).observe(durationInSeconds);
    });

    next();
};

/**
 * Handle /metrics endpoint
 */
export const metricsEndpoint = async (req, res) => {
    try {
        res.set("Content-Type", register.contentType);
        res.end(await register.metrics());
    } catch (err) {
        logger.error("Metrics Collection Error", { error: err.message });
        res.status(500).send(err.message);
    }
};

export default register;
