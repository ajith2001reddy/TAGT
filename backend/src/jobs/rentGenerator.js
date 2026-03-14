import Payment from "../models/Payment.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";

export async function generateMonthlyRent() {
    try {
        logger.info("[JOB] Generating monthly rent");

        // Only active residents who are assigned to a property and haven't been deleted
        const residents = await User.find({ 
            role: "resident", 
            status: "active",
            isDeleted: false,
            propertyId: { $ne: null }
        });

        const now = new Date();
        const monthIdentifier = now.toISOString().slice(0, 7); // YYYY-MM
        const monthName = now.toLocaleString("default", { month: "long", year: "numeric" });

        let created = 0;

        for (const resident of residents) {
            // Prevent duplicate creation for the same month
            const existing = await Payment.findOne({
                resident: resident._id,
                month: monthIdentifier,
                type: "rent"
            });

            if (existing) continue;

            await Payment.create({
                propertyId: resident.propertyId,
                resident: resident._id,
                room: resident.roomId,
                amount: resident.rent || 0,
                status: "pending",
                dueDate: new Date(now.getFullYear(), now.getMonth(), 5), // Due on 5th
                month: monthIdentifier,
                type: "rent",
                notes: `System generated rent for ${monthName}`
            });

            created++;
        }

        logger.info(`[JOB] Automatic Rent Generation complete: ${created} records created.`);
        return created;
    } catch (err) {
        logger.error("[JOB] Rent generation error", { error: err.message });
        throw err;
    }
}