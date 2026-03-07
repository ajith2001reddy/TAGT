import "dotenv/config";
import { Worker } from "bullmq";
import redis from "./config/redis.js";
import logger from "./utils/logger.js";
import { connectDB } from "./config/db.js";
import { generateMonthlyRent } from "./jobs/rentGenerator.js";
import { markOverduePayments } from "./jobs/overdueStatusJob.js";
import { sendUpcomingRentReminders, sendOverdueNotices } from "./jobs/emailReminderJob.js";

const QUEUE_NAME = "main-task-queue";

const jobRegistry = {
    "MonthlyRentGeneration": generateMonthlyRent,
    "MarkOverduePayments": markOverduePayments,
    "UpcomingRentReminders": sendUpcomingRentReminders,
    "OverdueNotices": sendOverdueNotices
};

async function startWorker() {
    try {
        await connectDB();
        logger.info("[WORKER] ✅ Database connected");

        const worker = new Worker(QUEUE_NAME, async (job) => {
            const { name, data } = job;
            logger.info(`[WORKER] Starting job: ${name}`, { jobId: job.id });

            try {
                const startTime = Date.now();

                if (jobRegistry[name]) {
                    await jobRegistry[name](data);
                    const duration = Date.now() - startTime;
                    logger.info(`[WORKER] Job completed: ${name}`, { duration: `${duration}ms` });
                } else {
                    throw new Error(`Job type '${name}' not found in registry`);
                }
            } catch (err) {
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

        logger.info(`👷‍♂️ Background Worker Process Started for queue: ${QUEUE_NAME}`);

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

    } catch (err) {
        logger.error("❌ Failed to start background worker", { error: err.message, stack: err.stack });
        process.exit(1);
    }
}

startWorker();
