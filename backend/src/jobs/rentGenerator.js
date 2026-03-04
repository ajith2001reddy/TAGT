import Payment from "../models/Payment.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";

export async function generateMonthlyRent() {
    try {
        logger.info("[JOB] Generating monthly rent");

        const residents = await User.find({ role: "resident" });

        const now = new Date();
        const month = now.toLocaleString("default", { month: "long" });

        let created = 0;

        for (const resident of residents) {
            const existing = await Payment.findOne({
                resident: resident._id,
                month
            });

            if (existing) continue;

            await Payment.create({
                resident: resident._id,
                amount: resident.rent || 0,
                status: "pending",
                dueDate: new Date(now.getFullYear(), now.getMonth(), 5),
                month
            });

            created++;
        }

        logger.info("[JOB] Rent records created", { count: created });
    } catch (err) {
        logger.error("[JOB] Rent generation error", { error: err.message });
    }
}