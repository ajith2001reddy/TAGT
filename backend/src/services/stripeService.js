// src/services/stripeService.js
import Stripe from "stripe";

const stripeEnabled = !!process.env.STRIPE_SECRET_KEY;
const stripe = stripeEnabled ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" }) : null;

export const isStripeEnabled = () => stripeEnabled;

/**
 * Create a Stripe Checkout Session for a payment
 */
export const createCheckoutSession = async ({ paymentId, residentEmail, amount, description, successUrl, cancelUrl }) => {
    if (!stripe) throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY in .env");

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: residentEmail,
        line_items: [{
            price_data: {
                currency: "inr",
                product_data: { name: description || "Rent Payment" },
                unit_amount: Math.round(amount * 100), // paise
            },
            quantity: 1,
        }],
        mode: "payment",
        metadata: { paymentId },
        success_url: successUrl,
        cancel_url: cancelUrl,
    });

    return session;
};

/**
 * Create a Stripe Checkout Session for a new Subscription
 */
export const createSubscriptionCheckoutSession = async ({ priceId, ownerEmail, ownerId, planId, successUrl, cancelUrl }) => {
    if (!stripe) throw new Error("Stripe is not configured");

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: ownerEmail,
        line_items: [{
            price: priceId,
            quantity: 1,
        }],
        mode: "subscription",
        client_reference_id: ownerId, // very important for webhook to know WHICH owner paid
        metadata: { planId },
        success_url: successUrl,
        cancel_url: cancelUrl,
    });

    return session;
};

/**
 * Verify a Stripe webhook event signature
 */
export const constructWebhookEvent = (rawBody, sig) => {
    if (!stripe) throw new Error("Stripe not configured");
    return stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
};

/**
 * Create a Stripe customer
 */
export const createStripeCustomer = async ({ email, name }) => {
    if (!stripe) return null;
    return stripe.customers.create({ email, name });
};

/**
 * Create a subscription for an owner (platform subscription)
 */
export const createOwnerSubscription = async ({ customerId, priceId }) => {
    if (!stripe) throw new Error("Stripe not configured");
    return stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
    });
};
