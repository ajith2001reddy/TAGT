import Payment from "../../models/Payment.js";
import User from "../../models/User.js";
import { createPaymentOrder, createSubscriptionOrder, verifyPaymentSignature, verifyWebhookSignature, isRazorpayEnabled } from "../../services/razorpayService.js";
import { buildPropertyFilter } from "../../utils/tenantScope.js";
import logger from "../../utils/logger.js";
import eventBus from "../../events/publisher.js";

/* ─────────────────────────────────────────────────
   POST /v2/razorpay/create-payment-order
   Resident initiates online payment for a pending bill
───────────────────────────────────────────────── */
export const createPaymentSession = async (req, res, next) => {
    try {
        if (!isRazorpayEnabled()) {
            return res.status(503).json({ success: false, message: "Online payments not configured yet. Contact your property manager." });
        }

        const scope = buildPropertyFilter(req.user);
        const { paymentId } = req.body;
        if (!paymentId) return res.status(400).json({ success: false, message: "paymentId is required" });

        const payment = await Payment.findOne({ _id: paymentId, ...scope }).populate("resident", "name email phoneNumber").lean();
        if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
        if (payment.status === "paid") return res.status(400).json({ success: false, message: "Payment already completed" });

        const totalAmount = payment.totalPayable || (payment.amount + (payment.lateFee || 0));

        const order = await createPaymentOrder({
            paymentId: String(payment._id),
            amount: totalAmount,
        });

        // Save order ID to the payment record for verification later
        await Payment.updateOne({ _id: paymentId }, { transactionId: order.id });

        return res.json({ 
            success: true, 
            data: { 
                orderId: order.id, 
                amount: order.amount, 
                currency: order.currency,
                prefill: {
                    name: payment.resident?.name,
                    email: payment.resident?.email,
                    contact: payment.resident?.phoneNumber || ""
                }
            } 
        });
    } catch (err) { next(err); }
};

/* ─────────────────────────────────────────────────
   POST /v2/razorpay/verify-payment
   Frontend callback to confirm payment success
───────────────────────────────────────────────── */
export const verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;
        
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !paymentId) {
            return res.status(400).json({ success: false, message: "Missing Razorpay payment parameters" });
        }

        const isValid = verifyPaymentSignature({ orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature });
        
        if (!isValid) {
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }

        const scope = buildPropertyFilter(req.user);
        const payment = await Payment.findOne({ _id: paymentId, ...scope });
        
        // Final security check mapping DB to Order context via session id state
        if (!payment || payment.transactionId !== razorpay_order_id) {
            return res.status(400).json({ success: false, message: "Payment mismatch or not found" });
        }

        payment.status = "paid";
        payment.paidAt = new Date();
        payment.method = "online";
        // Preserve Razorpay specific payment ID separately from order ID if desired
        payment.notes = (payment.notes ? payment.notes + "\n" : "") + `Razorpay Payment ID: ${razorpay_payment_id}`;
        await payment.save();

        await eventBus.publish("billing.payment.success", { paymentId: payment._id });

        return res.json({ success: true, message: "Payment verified successfully" });
    } catch (err) { next(err); }
};


/* ─────────────────────────────────────────────────
   POST /v2/razorpay/create-subscription-order
   Owner initiates an upgrade (Free -> Pro / Enterprise)
───────────────────────────────────────────────── */
export const createSubscriptionSession = async (req, res, next) => {
    try {
        if (!isRazorpayEnabled()) {
            return res.status(503).json({ success: false, message: "Razorpay not configured. Cannot process subscriptions." });
        }

        const { planId } = req.body;
        if (!["pro", "enterprise"].includes(planId)) {
            return res.status(400).json({ success: false, message: "Invalid plan selected" });
        }

        const ownerId = req.user._id;
        
        const subscription = await createSubscriptionOrder({
            planId,
            ownerEmail: req.user.email,
            ownerId: String(ownerId),
            ownerName: req.user.name
        });

        // Save ongoing attempt to User model or separate Subscription init log depending on how your system handles pending subs.
        // The webhook handles the final provision.

        return res.json({ 
            success: true, 
            data: { 
                subscriptionId: subscription.id 
            } 
        });
    } catch (err) { next(err); }
};

/* ─────────────────────────────────────────────────
   POST /v2/razorpay/webhook
   Handles Razorpay background events
───────────────────────────────────────────────── */
export const razorpayWebhook = async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];
        if (!signature) return res.status(400).send("Missing signature header");

        const rawBody = JSON.stringify(req.body);
        const isValid = verifyWebhookSignature(rawBody, signature);
        
        if (!isValid) return res.status(400).send("Invalid signature");

        const event = req.body;

        if (event.event === "subscription.charged") {
            const subData = event.payload.subscription.entity;
            const ownerId = subData.notes?.ownerId;
            const planId = subData.notes?.planId;
            
            if (ownerId && planId) {
                // Publish subscription upgraded event via bus
                 await eventBus.publish("billing.checkout.completed", {
                    subscriptionId: subData.id,
                    clientReferenceId: ownerId, 
                    metadata: { planId }
                 });
                 logger.info(`[RAZORPAY WEBHOOK] Subscription active for owner ${ownerId} on plan ${planId}`);
            }
        }

        return res.json({ received: true });
    } catch (err) {
        logger.error("[RAZORPAY WEBHOOK]", { error: err.message });
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
};

/* ─────────────────────────────────────────────────
   GET /v2/razorpay/status
   Whether Razorpay is configured
───────────────────────────────────────────────── */
export const razorpayStatus = async (req, res) => {
    return res.json({ success: true, data: { enabled: isRazorpayEnabled() } });
};
