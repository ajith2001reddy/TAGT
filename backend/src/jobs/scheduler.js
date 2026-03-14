import cron from "node-cron";
import logger from "../utils/logger.js";
import { mainQueue } from "./queue.js";

/**
 * Initializes all background cron schedules
 */
export function initScheduler() {
    logger.info("Initializing BullMQ background job system...");

    // 2. Schedule cron jobs to add tasks to the queue

    // Monthly Rent Generation: 1st of month at 1:00 AM
    cron.schedule("0 1 1 * *", () => {
        mainQueue.add("MonthlyRentGeneration", { scheduled: true });
    });

    // Nightly Rent Reminders: Daily at 8:00 PM
    cron.schedule("0 20 * * *", () => {
        mainQueue.add("NightlyRentReminders", { scheduled: true });
    });

    // Lease Expiry Alerts: Daily at 9:00 AM
    cron.schedule("0 9 * * *", () => {
        mainQueue.add("LeaseExpiryAlerts", { scheduled: true });
    });

    // Occupancy Stats Caching: Every 15 minutes
    cron.schedule("*/15 * * * *", () => {
        mainQueue.add("CachePropertyStats", { scheduled: true });
    });

    // Mark Overdue Payments: Daily at 2:00 AM
    cron.schedule("0 2 * * *", () => {
        mainQueue.add("MarkOverduePayments", { scheduled: true });
    });

    logger.info("✅ BullMQ Scheduler started: 5 repeatable triggers registered.");
}
