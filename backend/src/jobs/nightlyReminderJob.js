import Payment from "../models/Payment.js";
import { sendRentReminder } from "../services/emailService.js";
import logger from "../utils/logger.js";

/**
 * 1️⃣ Nightly Rent Reminder System
 * Goal: Every night the system checks for unpaid rent (pending or overdue) and sends reminders.
 */
export async function runNightlyRentReminders() {
    try {
        // Find all unpaid payments (pending or overdue)
        // We typically only want to remind for "rent" types
        const unpaid = await Payment.find({
            status: { $in: ["pending", "overdue"] },
            type: "rent",
            isDeleted: false
        }).populate("resident", "name email phoneNumber").populate("propertyId", "name");

        logger.info(`[JOB] Nightly Reminders: Found ${unpaid.length} unpaid rent records.`);

        let sentCount = 0;
        for (const payment of unpaid) {
            // Safety check: ensure resident has contact info
            if (!payment.resident?.email) continue;

            try {
                // Send reminder (Current implementation uses emailService)
                await sendRentReminder({
                    name: payment.resident.name,
                    email: payment.resident.email,
                    amount: payment.totalPayable || payment.amount,
                    dueDate: payment.dueDate,
                    month: payment.month,
                    propertyName: payment.propertyId?.name || "TAGT Property"
                });
                sentCount++;
            } catch (err) {
                logger.error(`[JOB] Failed to send reminder to ${payment.resident.email}`, { error: err.message });
            }
        }

        logger.info(`[JOB] Nightly Reminders complete. Sent: ${sentCount}`);
        return sentCount;
    } catch (err) {
        logger.error("[JOB] Nightly Reminders system error", { error: err.message });
        throw err;
    }
}
