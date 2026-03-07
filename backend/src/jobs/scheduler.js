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

    // Mark Overdue Payments: Daily at 2:00 AM
    cron.schedule("0 2 * * *", () => {
        mainQueue.add("MarkOverduePayments", { scheduled: true });
    });

    // Upcoming Rent Reminders (3 days before due): Daily at 9:00 AM
    cron.schedule("0 9 * * *", () => {
        mainQueue.add("UpcomingRentReminders", { scheduled: true });
    });

    // Overdue Notices: Daily at 10:00 AM
    cron.schedule("0 10 * * *", () => {
        mainQueue.add("OverdueNotices", { scheduled: true });
    });

    logger.info("✅ BullMQ Scheduler started: 4 repeatable triggers registered.");
}
