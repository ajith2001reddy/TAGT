import "dotenv/config";
import { Worker } from "bullmq";
import redis from "./config/redis.js";
import logger from "./utils/logger.js";
import { connectDB } from "./config/db.js";
import { generateMonthlyRent } from "./jobs/rentGenerator.js";
import { markOverduePayments } from "./jobs/overdueStatusJob.js";
import { sendUpcomingRentReminders, sendOverdueNotices } from "./jobs/emailReminderJob.js";
import "./events/workers/residentWorker.js";
import "./events/workers/billingWorker.js";
import { workerJobDuration, workerJobCounter } from "./middleware/metrics.js";
import * as Sentry from "@sentry/node";

const QUEUE_NAME = "main-task-queue";

const jobRegistry = {
    "MonthlyRentGeneration": generateMonthlyRent,
    "MarkOverduePayments": markOverduePayments,
    "UpcomingRentReminders": sendUpcomingRentReminders,
    "OverdueNotices": sendOverdueNotices
};

async function startWorker() {
    try {
        if (process.env.SENTRY_DSN) {
            Sentry.init({
                dsn: process.env.SENTRY_DSN,
                environment: process.env.NODE_ENV,
                tracesSampleRate: 1.0,
            });
            logger.info("[WORKER] 🛡️ Sentry initialized.");
        }

        await connectDB();
        logger.info("[WORKER] ✅ Database connected");

        const worker = new Worker(QUEUE_NAME, async (job) => {
            const { name, data } = job;
            logger.info(`[WORKER] Starting job: ${name}`, { jobId: job.id });

            const startTime = Date.now();
            try {

                if (jobRegistry[name]) {
                    await jobRegistry[name](data);
                    const durationInSeconds = (Date.now() - startTime) / 1000;

                    workerJobDuration.labels(name, "success").observe(durationInSeconds);
                    workerJobCounter.labels(name, "success").inc();

                    logger.info(`[WORKER] Job completed: ${name}`, { duration: `${durationInSeconds * 1000}ms` });
                } else {
                    throw new Error(`Job type '${name}' not found in registry`);
                }
            } catch (err) {
                const durationInSeconds = (Date.now() - startTime) / 1000;
                workerJobDuration.labels(name, "failed").observe(durationInSeconds);
                workerJobCounter.labels(name, "failed").inc();

                if (process.env.SENTRY_DSN) {
                    Sentry.captureException(err, { tags: { jobName: name } });
                }

                logger.error(`[WORKER] Job failed: ${name}`, { error: err.message, stack: err.stack });
                throw err;
            }
        }, {
            connection: redis,
            concurrency: 5 // Process 5 jobs at a time
        });

        worker.on("completed", (job) => {
            logger.debug(`Job ${job.id} has completed!`);
        });

        worker.on("failed", (job, err) => {
            logger.error(`Job ${job.id} has failed with ${err.message}`);
        });

        logger.info(`👷‍♂️ Background Workers Initialized.`);
        logger.info(`- Main Task Queue: ${QUEUE_NAME}`);
        logger.info(`- Event Bus Queue: events`);

        // Graceful Shutdown Handlers for Worker
        process.on("SIGINT", async () => {
            logger.info("🛑 SIGINT received. Shutting down worker gracefully...");
            await worker.close();
            process.exit(0);
        });

        process.on("SIGTERM", async () => {
            logger.info("🛑 SIGTERM received. Shutting down worker gracefully...");
            await worker.close();
            process.exit(0);
        });

        // 🚀 Global Crash Handlers (Prevent silent failures)
        process.on("uncaughtException", (err) => {
            logger.error("🛑 Uncaught Exception - Worker Crash:", { error: err.message, stack: err.stack });
            if (process.env.SENTRY_DSN) Sentry.captureException(err);
            // Allow process to exit so it can be restarted by orchestrator
            setTimeout(() => process.exit(1), 1000);
        });

        process.on("unhandledRejection", (reason, promise) => {
            logger.error("🛑 Unhandled Rejection at:", { promise, reason });
            if (process.env.SENTRY_DSN) Sentry.captureException(reason);
        });

    } catch (err) {
        logger.error("❌ Failed to start background worker", { error: err.message, stack: err.stack });
        process.exit(1);
    }
}

startWorker();
