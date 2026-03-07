import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // "free", "pro", "enterprise"
    displayName: { type: String, required: true },         // "Free", "Pro", "Enterprise"
    price: { type: Number, required: true, default: 0 },   // monthly price in INR
    stripePriceId: { type: String, default: null },
    limits: {
        properties: { type: Number, default: 1 },
        rooms: { type: Number, default: 5 },
        residents: { type: Number, default: 10 },
        reports: { type: Boolean, default: false },
        analytics: { type: Boolean, default: false },
        emailReminders: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const SubscriptionSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
    status: { type: String, enum: ["active", "trialing", "past_due", "cancelled", "expired"], default: "active" },
    trialEndsAt: { type: Date, default: null },
    currentPeriodStart: { type: Date, default: Date.now },
    currentPeriodEnd: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    stripeCustomerId: { type: String, default: null },
    stripeSubscriptionId: { type: String, default: null },
    cancelAtPeriodEnd: { type: Boolean, default: false },
}, { timestamps: true });

export const Plan = mongoose.model("Plan", PlanSchema);
export const Subscription = mongoose.model("Subscription", SubscriptionSchema);
export default Subscription;

/* ── Plan limits helper ─────────────────────────── */
export const PLAN_LIMITS = {
    free: { properties: 1, rooms: 10, residents: 20, reports: false, analytics: false, emailReminders: false },
    pro: { properties: 5, rooms: 100, residents: 500, reports: true, analytics: true, emailReminders: true },
    enterprise: { properties: 999, rooms: 9999, residents: 99999, reports: true, analytics: true, emailReminders: true },
};

export const getPlanForOwner = async (ownerId) => {
    const sub = await Subscription.findOne({ owner: ownerId }).lean();
    if (!sub || sub.status === "expired" || sub.status === "cancelled") return "free";
    return sub.plan || "free";
};

export const canAccess = (plan, feature) => {
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
    return limits[feature] === true || (typeof limits[feature] === "number" && limits[feature] > 0);
};
