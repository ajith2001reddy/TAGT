import Razorpay from "razorpay";
import crypto from "crypto";

const razorpayEnabled = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

const razorpay = razorpayEnabled ? new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
}) : null;

export const isRazorpayEnabled = () => razorpayEnabled;

/**
 * Creates a Razorpay Order for a single payment (e.g. Rent)
 * @param {Object} params
 * @param {string} params.paymentId - The internal MongoDB Payment ID
 * @param {number} params.amount - Total amount in INR
 * @returns {Promise<Object>} The Razorpay order object
 */
export const createPaymentOrder = async ({ paymentId, amount }) => {
    if (!razorpay) throw new Error("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env");

    const options = {
        amount: Math.round(amount * 100), // convert to paise
        currency: "INR",
        receipt: `receipt_${paymentId}`,
        notes: {
            paymentId: paymentId,
        }
    };

    const order = await razorpay.orders.create(options);
    return order;
};

/**
 * Creates a Subscription for an Owner (Platform billing)
 * First, creates a customer if they don't exist, then creates the subscription.
 * Note: Requires pre-configured Razorpay Plans on the Dashboard.
 */
export const createSubscriptionOrder = async ({ planId, ownerEmail, ownerId, ownerName }) => {
    if (!razorpay) throw new Error("Razorpay is not configured");

    // Map your internal plan IDs ("pro", "enterprise") to Razorpay Plan IDs from env
    const rpPlanId = planId === "pro" ? process.env.RAZORPAY_PLAN_PRO : process.env.RAZORPAY_PLAN_ENTERPRISE;
    if (!rpPlanId) throw new Error(`Configuration error: No Razorpay Plan ID found for ${planId}`);

    // Create a subscription order in Razorpay
    const options = {
        plan_id: rpPlanId,
        customer_notify: 1, // Let Razorpay send the automated tracking emails
        total_count: 12, // e.g., 12 months, adjust as needed or use 120 for "unlimited"
        notes: {
            ownerId: ownerId,
            planId: planId
        }
    };

    const subscription = await razorpay.subscriptions.create(options);
    return subscription;
};

/**
 * Verifies the signature from the Razorpay client payload after a successful payment
 */
export const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
    if (!razorpayEnabled) throw new Error("Razorpay not configured");

    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    return expectedSignature === signature;
};

/**
 * Verifies a Razorpay Webhook signature
 */
export const verifyWebhookSignature = (rawBody, signature) => {
    if (!razorpayEnabled) return false;
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");
        
    return expectedSignature === signature;
};
