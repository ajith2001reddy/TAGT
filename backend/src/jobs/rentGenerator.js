import Payment from "../models/Payment.js";
import User from "../models/User.js";

export async function generateMonthlyRent() {
    try {
        console.log("[JOB] Generating monthly rent...");

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

        console.log(`[JOB] Rent records created: ${created}`);

    } catch (err) {
        console.error("[JOB] Rent generation error:", err.message);
    }
}