import Payment from "../models/Payment.js";
import logger from "../utils/logger.js";

/**
 * Job: Marks payments as overdue if they are past their due date
 */
export async function markOverduePayments() {
    try {
        const now = new Date();
        const result = await Payment.updateMany(
            { status: "pending", dueDate: { $lt: now } },
            { status: "overdue" }
        );

        if (result.modifiedCount > 0) {
            logger.info(`[JOB] Overdue status updated`, { count: result.modifiedCount });
        }
        return result;
    } catch (err) {
        logger.error("[JOB] Overdue job error", { error: err.message });
        throw err;
    }
}
