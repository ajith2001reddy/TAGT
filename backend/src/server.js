import "dotenv/config";  // MUST BE FIRST



import http from "http";
import mongoose from "mongoose";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { validateEnv } from "./config/env.js";
import { initScheduler } from "./jobs/scheduler.js";
import { initSocket } from "./socket.js";
import redis from "./config/redis.js";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 5001;

let server;

const waitForRedisReady = () => new Promise((resolve, reject) => {
    if (redis.status === "ready") return resolve();
    const onReady = () => { cleanup(); resolve(); };
    const onError = (err) => { cleanup(); reject(err); };
    const onTimeout = setTimeout(() => {
        cleanup();
        reject(new Error("Redis not ready within 10s"));
    }, 10000);
    const cleanup = () => {
        clearTimeout(onTimeout);
        redis.off("ready", onReady);
        redis.off("error", onError);
    };
    redis.once("ready", onReady);
    redis.once("error", onError);
});

async function startServer() {
    try {
        validateEnv();
        await connectDB();
        logger.info("✅ Database connected");

        // Ensure Redis is ready before accepting requests
        await waitForRedisReady();
        logger.info("✅ Redis ready");

        server = http.createServer(app);

        // Attach Socket.io (must be before server.listen)
        initSocket(server);

        server.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
        });

        // Initialize background jobs
        initScheduler();

    } catch (err) {
        logger.error("❌ Failed to start server", { error: err.message, stack: err.stack });
        process.exit(1);
    }
}

startServer();

// Graceful Shutdown Function
const gracefulShutdown = async (signal, exitCode = 0) => {
    logger.info(`🛑 ${signal} received. Shutting down gracefully...`);
    if (server) {
        server.close(async () => {
            logger.info("HTTP server closed.");
            await mongoose.connection.close();
            logger.info("Database connection closed.");
            try {
                await redis.quit();
                logger.info("Redis connection closed.");
            } catch (err) {
                logger.warn("Redis quit failed", { error: err.message });
            }
            process.exit(exitCode);
        });
    } else {
        await mongoose.connection.close();
        try {
            await redis.quit();
        } catch (err) {
            logger.warn("Redis quit failed", { error: err.message });
        }
        process.exit(exitCode);
    }
    
    // Force close after 10 seconds if graceful shutdown fails
    setTimeout(() => {
        logger.error("❌ Could not close connections in time, forcefully shutting down");
        process.exit(1);
    }, 10000);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("uncaughtException", (err) => {
    logger.error("🛑 Uncaught Exception - API Crash:", { error: err.message, stack: err.stack });
    gracefulShutdown("uncaughtException", 1);
});

process.on("unhandledRejection", (reason, promise) => {
    logger.error("🛑 Unhandled Rejection at:", { promise, reason });
    gracefulShutdown("unhandledRejection", 1);
});
