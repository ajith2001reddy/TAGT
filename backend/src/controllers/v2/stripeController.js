import Payment from "../../models/Payment.js";
import User from "../../models/User.js";
import Property from "../../models/Property.js";
import { createCheckoutSession, createSubscriptionCheckoutSession, constructWebhookEvent, isStripeEnabled } from "../../services/stripeService.js";
import { sendPaymentConfirmation, sendRentReminder } from "../../services/emailService.js";
import { generateInvoiceBuffer } from "../../utils/invoiceGenerator.js";
import { buildPropertyFilter } from "../../utils/tenantScope.js";
import logger from "../../utils/logger.js";

const APP_URL = process.env.APP_URL || "http://localhost:3000";

/* ─────────────────────────────────────────────────
   POST /v2/stripe/checkout-session
   Resident initiates online payment for a pending bill
───────────────────────────────────────────────── */
export const createPaymentSession = async (req, res, next) => {
    try {
        if (!isStripeEnabled()) {
            return res.status(503).json({ success: false, message: "Online payments not configured yet. Contact your property manager." });
        }

        const scope = buildPropertyFilter(req.user);
        const { paymentId } = req.body;
        if (!paymentId) return res.status(400).json({ success: false, message: "paymentId is required" });

        const payment = await Payment.findOne({ _id: paymentId, ...scope }).populate("resident", "name email").lean();
        if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
        if (payment.status === "paid") return res.status(400).json({ success: false, message: "Payment already completed" });

        const totalAmount = payment.totalPayable || (payment.amount + (payment.lateFee || 0));

        const session = await createCheckoutSession({
            paymentId: String(payment._id),
            residentEmail: payment.resident?.email,
            amount: totalAmount,
            description: `Rent – ${payment.month}`,
            successUrl: `${APP_URL}/resident/payments?success=1&session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${APP_URL}/resident/payments?cancelled=1`,
        });

        return res.json({ success: true, data: { url: session.url, sessionId: session.id } });
    } catch (err) { next(err); }
};

/* ─────────────────────────────────────────────────
   POST /v2/stripe/checkout-subscription
   Owner initiates an upgrade (Free -> Pro / Enterprise)
───────────────────────────────────────────────── */
export const createSubscriptionSession = async (req, res, next) => {
    try {
        if (!isStripeEnabled()) {
            return res.status(503).json({ success: false, message: "Stripe not configured. Cannot process subscriptions." });
        }

        const { planId } = req.body;
        if (!["pro", "enterprise"].includes(planId)) {
            return res.status(400).json({ success: false, message: "Invalid plan selected" });
        }

        const priceId = planId === "pro" ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_ENTERPRISE;
        if (!priceId) {
            logger.error(`[STRIPE] Missing Price ID for plan: ${planId}`);
            return res.status(500).json({ success: false, message: `Configuration error: No Stripe Price ID found for ${planId} plan.` });
        }

        const ownerId = req.user._id;

        const session = await createSubscriptionCheckoutSession({
            priceId,
            ownerEmail: req.user.email,
            ownerId: String(ownerId),
            planId,
            successUrl: `${APP_URL}/owner/subscription?success=1&session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${APP_URL}/owner/subscription?cancelled=1`,
        });

        return res.json({ success: true, data: { url: session.url, sessionId: session.id } });
    } catch (err) { next(err); }
};

/* ─────────────────────────────────────────────────
   POST /v2/stripe/webhook
   Handles Stripe events (charge.succeeded, etc.)
───────────────────────────────────────────────── */
export const stripeWebhook = async (req, res, next) => {
    try {
        const sig = req.headers["stripe-signature"];
        if (!sig) return res.status(400).send("Missing stripe-signature header");

        const event = constructWebhookEvent(req.body, sig);

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;

            if (session.mode === "payment") {
                // One-off rent payment logic
                const paymentId = session.metadata?.paymentId;
                if (paymentId) {
                    const payment = await Payment.findByIdAndUpdate(
                        paymentId,
                        { status: "paid", paidAt: new Date(), method: "online", transactionId: session.id },
                        { new: true }
                    ).populate("resident", "name email").populate("propertyId", "name");

                    // Generate PDF receipt in-memory
                    let pdfBuffer = null;
                    try {
                        pdfBuffer = await generateInvoiceBuffer(payment);
                    } catch (pdfErr) {
                        logger.error("[STRIPE] Failed to generate PDF buffer for receipt", { paymentId: payment._id, error: pdfErr.message });
                    }

                    // Send confirmation email WITH PDF ATTACHMENT
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

                    logger.info(`[STRIPE] Payment processed successfuly`, { paymentId: payment._id });
                }
            } else if (session.mode === "subscription") {
                // Subscription upgrade logic
                const ownerId = session.client_reference_id;
                const planId = session.metadata?.planId || "pro";
                const subscriptionId = session.subscription;
                const customerId = session.customer;

                if (ownerId) {
                    import("../../models/Subscription.js").then(({ Subscription }) => {
                        Subscription.findOneAndUpdate(
                            { owner: ownerId },
                            {
                                plan: planId,
                                status: "active",
                                stripeSubscriptionId: subscriptionId,
                                stripeCustomerId: customerId,
                                currentPeriodStart: new Date(),
                                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Rough approx based on checkout, webhook usually handles invoice.payment_succeeded to sync dates perfectly
                            },
                            { new: true, upsert: true }
                        ).catch(e => logger.error("[STRIPE WEBHOOK] Failed to activate subscription:", e));
                    });
                }
            }
        }

        return res.json({ received: true });
    } catch (err) {
        logger.error("[STRIPE WEBHOOK]", { error: err.message });
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
};

/* ─────────────────────────────────────────────────
   GET /v2/stripe/status
   Whether Stripe is configured
───────────────────────────────────────────────── */
export const stripeStatus = async (req, res) => {
    return res.json({ success: true, data: { enabled: isStripeEnabled() } });
};
