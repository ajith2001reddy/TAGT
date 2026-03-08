import { Worker } from "bullmq";
import IORedis from "ioredis";
import logger from "../../utils/logger.js";
import Notification from "../../models/Notification.js";
import ActivityLog from "../../models/ActivityLog.js";

const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
});

/**
 * Resident Worker: Processes background tasks related to resident events.
 */
const residentWorker = new Worker("events", async (job) => {
    const { name, data } = job;
    logger.info(`[Worker] Processing Job: ${job.id} (${name})`, { name, data });

    try {
        switch (name) {
            case "resident.request.created":
                await Notification.create({
                    recipient: data.ownerId,
                    title: "New Resident Request",
                    message: `You have a new resident join request.`,
                    type: "alert",
                    link: `/owner/onboarding`,
                    propertyId: data.propertyId
                });
                break;

            case "resident.approved":
                // Create Activity Log
                await ActivityLog.create({
                    action: "RESIDENT_ADMITTED",
                    performedBy: data.processedBy,
                    role: "owner",
                    propertyId: data.propertyId,
                    route: "BULLMQ_WORKER"
                });

                // Create Notification for Resident
                await Notification.create({
                    recipient: data.residentId,
                    title: "Application Approved",
                    message: `Your application to join the property was approved. Welcome!`,
                    type: "success",
                    propertyId: data.propertyId
                });

                // Phase 3: Analytics update will be triggered here
                // await analyticsService.updateResidentStats(data);
                break;

            default:
                logger.warn(`[Worker] Unknown job name: ${name}`);
        }
    } catch (err) {
        logger.error(`[Worker] Job ${job.id} failed: ${err.message}`, { error: err.message, stack: err.stack });
        throw err; // Re-throw to trigger retry based on queue settings
    }
}, { connection });

residentWorker.on("completed", (job) => {
    logger.info(`[Worker] Job ${job.id} completed successfully.`);
});

residentWorker.on("failed", (job, err) => {
    logger.error(`[Worker] Job ${job?.id} failed: ${err.message}`);
});

export default residentWorker;
