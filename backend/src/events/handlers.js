import eventBus from "../utils/eventBus.js";
import logger from "../utils/logger.js";
import ActivityLog from "../models/ActivityLog.js";
import { businessEventsCounter } from "../middleware/metrics.js";

/**
 * Initialize all Global Event Listeners
 */
export const initEventHandlers = () => {

    // 1️⃣ Resident Join Request Created
    eventBus.on("resident.request.created", async (data) => {
        businessEventsCounter.labels("resident.request.created").inc();
        logger.info("[Event Handler] Processing resident.request.created", { residentId: data.residentId });

        // Potential side effect: Send email to property owner
        // if (process.env.NODE_ENV === "production") await sendOwnerNotification(data);
    });

    // 2️⃣ Resident Approved
    eventBus.on("resident.approved", async (data) => {
        businessEventsCounter.labels("resident.approved").inc();
        logger.info("[Event Handler] Processing resident.approved", { residentId: data.residentId });

        // side effect: Create an ActivityLog entry for the system record
        try {
            await ActivityLog.create({
                action: "RESIDENT_ADMITTED",
                performedBy: data.processedBy,
                role: "owner", // or system
                propertyId: data.propertyId,
                route: "EVENT_BUS"
            });
        } catch (err) {
            logger.error("Failed to log resident admission via EventBus", { error: err.message });
        }
    });

    // 3️⃣ Payment Received
    eventBus.on("payment.received", async (data) => {
        businessEventsCounter.labels("payment.received").inc();
        logger.info("[Event Handler] Processing payment.received", { paymentId: data.paymentId });
        // side effect: Update occupancy analytics cache or trigger notification
    });

    logger.info("🎯 Domain Event Handlers initialized.");
};
