import Payment from "../../models/Payment.js";
import User from "../../models/User.js";
import Property from "../../models/Property.js";
import { createCheckoutSession, constructWebhookEvent, isStripeEnabled } from "../../services/stripeService.js";
import { sendPaymentConfirmation } from "../../services/emailService.js";
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
            const paymentId = session.metadata?.paymentId;

            if (paymentId) {
                const payment = await Payment.findByIdAndUpdate(
                    paymentId,
                    { status: "paid", paidAt: new Date(), method: "online", transactionId: session.id },
                    { new: true }
                ).populate("resident", "name email");

                if (payment?.resident?.email) {
                    await sendPaymentConfirmation({
                        name: payment.resident.name,
                        email: payment.resident.email,
                        amount: payment.amount,
                        month: payment.month,
                        paidAt: payment.paidAt,
                    }).catch(err => logger.error("[WEBHOOK EMAIL]", { error: err.message, paymentId }));
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
