import winston from "winston";
import LokiTransport from "winston-loki";

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

// Custom format for local development
const devFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
});

const transports = [
    new winston.transports.Console()
];

// Add centralized logging if DSNs are present
if (process.env.LOKI_HOST) {
    transports.push(new LokiTransport({
        host: process.env.LOKI_HOST, // e.g. "http://loki:3100"
        labels: { app: "tagt-backend" },
        json: true,
        replaceTimestamp: true,
        onConnectionError: (err) => console.error("Loki connection error", err)
    }));
}

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        process.env.NODE_ENV === "production" ? json() : combine(colorize(), devFormat)
    ),
    transports
});

export default logger;
