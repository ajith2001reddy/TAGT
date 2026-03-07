import eventBus from "../utils/eventBus.js";
import logger from "../utils/logger.js";
import ActivityLog from "../models/ActivityLog.js";
import Notification from "../models/Notification.js";
import { businessEventsCounter } from "../middleware/metrics.js";

/**
 * Initialize all Global Event Listeners
 */
export const initEventHandlers = () => {

    // 1️⃣ Resident Join Request Created
    eventBus.on("resident.request.created", async (data) => {
        businessEventsCounter.labels("resident.request.created").inc();
        logger.info("[Event Handler] Processing resident.request.created", { residentId: data.residentId });

        try {
            await Notification.create({
                recipient: data.ownerId,
                title: "New Resident Request",
                message: `You have a new resident join request.`,
                type: "alert",
                link: `/owner/onboarding`,
                propertyId: data.propertyId
            });
            // TODO: dispatch Email to Owner via BullMQ
        } catch (err) {
            logger.error("Failed to process event resident.request.created", { error: err.message });
        }
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

            await Notification.create({
                recipient: data.residentId,
                title: "Application Approved",
                message: `Your application to join the property was approved. Welcome!`,
                type: "success",
                propertyId: data.propertyId
            });
            // TODO: dispatch Welcome Email to Resident
        } catch (err) {
            logger.error("Failed to log resident admission via EventBus", { error: err.message });
        }
    });

    // 3️⃣ Payment Received
    eventBus.on("payment.received", async (data) => {
        businessEventsCounter.labels("payment.received").inc();
        logger.info("[Event Handler] Processing payment.received", { paymentId: data.paymentId });

        try {
            await Notification.create({
                recipient: data.residentId,
                title: "Payment Received",
                message: `We received your payment of ${data.amount}. Thank you!`,
                type: "success",
                propertyId: data.propertyId,
                link: `/resident/payments`
            });

            await Notification.create({
                recipient: data.ownerId,
                title: "New Rent Payment",
                message: `Payment of ${data.amount} received from Resident ID ${data.residentId}.`,
                type: "success",
                propertyId: data.propertyId,
                link: `/owner/payments`
            });
            // TODO: dispatch Slack Notification to Owner's Channel
        } catch (err) {
            logger.error("Failed to distribute payment receipts via EventBus", { error: err.message });
        }
    });

    logger.info("🎯 Domain Event Handlers initialized.");
};
