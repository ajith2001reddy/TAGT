import User from "../models/User.js";
import logger from "../utils/logger.js";
import { api } from "../lib/api.js"; // This might not be right for background services
// Assuming there is a service to send alerts to owners

/**
 * 2️⃣ Lease Expiry Alert System
 * Goal: Check daily for leases expiring within 30 days and alert the owner.
 */
export async function runLeaseExpiryAlerts() {
    try {
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        // Find residents whose lease ends between now and 30 days from now
        const expiringResidents = await User.find({
            role: "resident",
            leaseEnd: { $gte: now, $lte: thirtyDaysFromNow },
            isDeleted: false
        }).populate("ownerId", "name email").populate("propertyId", "name");

        logger.info(`[JOB] Lease Expiry: Found ${expiringResidents.length} residents with upcoming expiry.`);

        let alertCount = 0;
        for (const resident of expiringResidents) {
            if (!resident.ownerId?.email) continue;

            const daysLeft = Math.ceil((new Date(resident.leaseEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            // Log the alert (In a real system, we'd send an email/notification to resident.ownerId)
            logger.info(`[ALERT] Lease for ${resident.name} at ${resident.propertyId?.name || 'Property'} expires in ${daysLeft} days.`);
            
            // Push notification to owner (mental model)
            // await notificationService.sendToUser(resident.ownerId._id, {
            //     title: "Lease Expiry Alert",
            //     message: `${resident.name}'s lease expires in ${daysLeft} days.`,
            //     type: "warning"
            // });

            alertCount++;
        }

        logger.info(`[JOB] Lease Expiry alerts processed: ${alertCount}`);
        return alertCount;
    } catch (err) {
        logger.error("[JOB] Lease Expiry system error", { error: err.message });
        throw err;
    }
}
