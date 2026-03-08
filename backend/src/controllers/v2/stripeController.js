import Payment from "../../models/Payment.js";
import { createCheckoutSession, createSubscriptionCheckoutSession, constructWebhookEvent, isStripeEnabled } from "../../services/stripeService.js";
import { sendPaymentConfirmation } from "../../services/emailService.js";
import { generateInvoiceBuffer } from "../../utils/invoiceGenerator.js";
import { buildPropertyFilter } from "../../utils/tenantScope.js";
import logger from "../../utils/logger.js";
import eventBus from "../../events/publisher.js";

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
export const stripeWebhook = async (req, res) => {
    let event;

    try {
        const sig = req.headers["stripe-signature"];
        if (!sig) return res.status(400).send("Missing stripe-signature header");

        event = constructWebhookEvent(req.body, sig);

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            await eventBus.publish("billing.checkout.completed", {
                sessionId: session.id,
                mode: session.mode,
                metadata: session.metadata,
                clientReferenceId: session.client_reference_id,
                subscriptionId: session.subscription,
                customerId: session.customer
            });
            logger.info(`[STRIPE WEBHOOK] Checkout session event published: ${session.id}`);
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
