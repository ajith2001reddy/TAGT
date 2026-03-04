import Payment from "../models/Payment.js";
import { sendRentReminder, sendOverdueNotice } from "../services/emailService.js";
import logger from "../utils/logger.js";

/**
 * Job: Sends reminders for payments due in 3 days
 */
export async function sendUpcomingRentReminders() {
    try {
        const now = new Date();
        const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        const startOfDay = new Date(in3Days.setHours(0, 0, 0, 0));
        const endOfDay = new Date(in3Days.setHours(23, 59, 59, 999));

        const upcomingPayments = await Payment.find({
            status: "pending",
            dueDate: { $gte: startOfDay, $lte: endOfDay },
        }).populate("resident", "name email").lean();

        let sent = 0;
        for (const p of upcomingPayments) {
            if (!p.resident?.email) continue;
            await sendRentReminder({
                name: p.resident.name,
                email: p.resident.email,
                amount: p.totalPayable || p.amount,
                dueDate: p.dueDate,
                month: p.month,
                propertyName: "TAGT Property",
            }).catch(err => logger.error("[JOB] Failed to send reminder", {
                error: err.message,
                resident: p.resident.email,
                paymentId: p._id
            }));
            sent++;
        }

        if (sent > 0) {
            logger.info(`[JOB] Upcoming rent reminders sent`, { count: sent });
        }
        return sent;
    } catch (err) {
        logger.error("[JOB] Upcoming reminders error", { error: err.message });
        throw err;
    }
}

/**
 * Job: Sends notifications for overdue payments
 */
export async function sendOverdueNotices() {
    try {
        const overduePayments = await Payment.find({ status: "overdue" })
            .populate("resident", "name email").lean();

        let sent = 0;
        for (const p of overduePayments) {
            if (!p.resident?.email) continue;
            await sendOverdueNotice({
                name: p.resident.name,
                email: p.resident.email,
                amount: p.amount,
                lateFee: p.lateFee || 0,
                month: p.month,
            }).catch(err => logger.error("[JOB] Failed to send overdue notice", {
                error: err.message,
                resident: p.resident.email,
                paymentId: p._id
            }));
            sent++;
        }

        if (sent > 0) {
            logger.info(`[JOB] Overdue notices sent`, { count: sent });
        }
        return sent;
    } catch (err) {
        logger.error("[JOB] Overdue notices error", { error: err.message });
        throw err;
    }
}
