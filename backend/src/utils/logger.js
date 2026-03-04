import winston from "winston";

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

// Custom format for local development
const devFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        process.env.NODE_ENV === "production" ? json() : combine(colorize(), devFormat)
    ),
    transports: [
        new winston.transports.Console(),
    ]
});

export default logger; // Default export
