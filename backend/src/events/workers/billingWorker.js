import { Worker } from "bullmq";
import IORedis from "ioredis";
import logger from "../../utils/logger.js";
import Payment from "../../models/Payment.js";
import Subscription from "../../models/Subscription.js";
import { sendPaymentConfirmation } from "../../services/emailService.js";
import { generateInvoiceBuffer } from "../../utils/invoiceGenerator.js";

const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
});

/**
 * Billing Worker: Processes background tasks related to Stripe and subscriptions.
 */
const billingWorker = new Worker("events", async (job) => {
    const { name, data } = job;
    logger.info(`[Billing Worker] Processing Job: ${job.id} (${name})`, { name, data });

    try {
        switch (name) {
            case "billing.checkout.completed":
                if (data.mode === "payment") {
                    await handleRentPayment(data);
                } else if (data.mode === "subscription") {
                    await handleSubscriptionUpgrade(data);
                }
                break;

            default:
                logger.debug(`[Billing Worker] Skipping non-billing job: ${name}`);
        }
    } catch (err) {
        logger.error(`[Billing Worker] Job ${job.id} failed: ${err.message}`, { error: err.message });
        throw err;
    }
}, { connection });

/**
 * Handles one-off rent payment completion
 */
async function handleRentPayment(data) {
    const paymentId = data.metadata?.paymentId;
    if (!paymentId) return;

    const payment = await Payment.findByIdAndUpdate(
        paymentId,
        { status: "paid", paidAt: new Date(), method: "online", transactionId: data.sessionId },
        { new: true }
    ).populate("resident", "name email").populate("propertyId", "name");

    if (!payment) return;

    // Generate PDF receipt
    let pdfBuffer = null;
    try {
        pdfBuffer = await generateInvoiceBuffer(payment);
    } catch (pdfErr) {
        logger.error("[Billing Worker] PDF Generation Failed", { paymentId: payment._id, error: pdfErr.message });
    }

    // Send confirmation email
    if (payment.resident?.email) {
        await sendPaymentConfirmation({
            name: payment.resident.name,
            email: payment.resident.email,
            amount: payment.amount,
            month: payment.month,
            paidAt: payment.paidAt,
            propertyName: payment.propertyId?.name,
            paymentId: payment._id.toString(),
            pdfBuffer
        });
    }

    logger.info(`[Billing Worker] Payment processed: ${payment._id}`);
}

/**
 * Handles owner subscription upgrade
 */
async function handleSubscriptionUpgrade(data) {
    const ownerId = data.clientReferenceId;
    const planId = data.metadata?.planId || "pro";

    if (!ownerId) return;

    await Subscription.findOneAndUpdate(
        { owner: ownerId },
        {
            plan: planId,
            status: "active",
            stripeSubscriptionId: data.subscriptionId,
            stripeCustomerId: data.customerId,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        { new: true, upsert: true }
    );

    logger.info(`[Billing Worker] Subscription activated for owner: ${ownerId}`);
}

billingWorker.on("completed", (job) => {
    logger.info(`[Billing Worker] Job ${job.id} completed.`);
});

billingWorker.on("failed", (job, err) => {
    logger.error(`[Billing Worker] Job ${job?.id} failed: ${err.message}`);
});

export default billingWorker;
