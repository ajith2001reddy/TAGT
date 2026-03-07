// src/controllers/v2/subscriptionController.js
import { Subscription, PLAN_LIMITS, getPlanForOwner } from "../../models/Subscription.js";
import User from "../../models/User.js";
import Room from "../../models/rooms.js";
import Payment from "../../models/Payment.js";
import Property from "../../models/Property.js";

/* ─────────────────────────────────────────────────
   GET /v2/subscription/my-plan
   Owner: fetch their current subscription + limits
───────────────────────────────────────────────── */
export const getMyPlan = async (req, res, next) => {
    try {
        const ownerId = req.user._id;
        const sub = await Subscription.findOne({ owner: ownerId }).lean();
        const plan = sub?.plan || "free";
        const limits = PLAN_LIMITS[plan];

        // Count current usage
        const propertyId = req.user.propertyId || (req.user.propertyIds?.[0]);
        const [residentCount, roomCount] = await Promise.all([
            propertyId ? User.countDocuments({ role: "resident", propertyId, isActive: true }) : 0,
            propertyId ? Room.countDocuments({ propertyId }) : 0,
        ]);

        return res.json({
            success: true, data: {
                plan, limits,
                status: sub?.status || "active",
                currentPeriodEnd: sub?.currentPeriodEnd || null,
                trialEndsAt: sub?.trialEndsAt || null,
                usage: { residents: residentCount, rooms: roomCount },
            }
        });
    } catch (err) { next(err); }
};

/* ─────────────────────────────────────────────────
   GET /v2/subscription/plans
   Public: list all available plans
───────────────────────────────────────────────── */
export const listPlans = async (req, res) => {
    const plans = [
        {
            id: "free", name: "Free", price: 0, priceLabel: "Free forever",
            limits: PLAN_LIMITS.free,
            features: ["Up to 10 rooms", "Up to 20 residents", "Basic payments", "Manual billing"],
            highlight: false,
        },
        {
            id: "pro", name: "Pro", price: 999, priceLabel: "₹999/mo",
            limits: PLAN_LIMITS.pro,
            features: ["Up to 100 rooms", "Up to 500 residents", "Analytics & reports", "Auto billing", "Email reminders", "Revenue leak detector"],
            highlight: true,
        },
        {
            id: "enterprise", name: "Enterprise", price: 2999, priceLabel: "₹2,999/mo",
            limits: PLAN_LIMITS.enterprise,
            features: ["Unlimited everything", "Priority support", "Custom branding", "API access", "White-label reports"],
            highlight: false,
        },
    ];
    return res.json({ success: true, data: plans });
};

/* ─────────────────────────────────────────────────
   POST /v2/subscription/upgrade
   (Legacy) Owner requests plan upgrade
───────────────────────────────────────────────── */
export const upgradePlan = async (req, res, next) => {
    try {
        // Enforce Stripe flow instead of direct manual upgrades
        return res.status(400).json({
            success: false,
            message: "Direct upgrades are disabled. Please use the Billing portal (Stripe) to upgrade your subcription."
        });
    } catch (err) { next(err); }
};

/* ─────────────────────────────────────────────────
   GET /v2/admin/subscriptions
   Super admin: list all owner subscriptions
───────────────────────────────────────────────── */
export const listAllSubscriptions = async (req, res, next) => {
    try {
        const subs = await Subscription.find({}).populate("owner", "name email").sort({ updatedAt: -1 }).lean();

        // Owners without a subscription record = free
        const ownersWithSub = new Set(subs.map(s => String(s.owner?._id)));
        const allOwners = await User.find({ role: "owner" }, "name email createdAt").lean();
        const unsubOwners = allOwners.filter(o => !ownersWithSub.has(String(o._id))).map(o => ({
            owner: o, plan: "free", status: "active", currentPeriodEnd: null,
        }));

        return res.json({ success: true, data: [...subs, ...unsubOwners] });
    } catch (err) { next(err); }
};

/* ─────────────────────────────────────────────────
   PATCH /v2/admin/subscriptions/:ownerId
   Super admin: manually set a plan for an owner
───────────────────────────────────────────────── */
export const adminSetPlan = async (req, res, next) => {
    try {
        const { plan, status } = req.body;
        if (plan && !["free", "pro", "enterprise"].includes(plan)) return res.status(400).json({ success: false, message: "Invalid plan" });

        const sub = await Subscription.findOneAndUpdate(
            { owner: req.params.ownerId },
            { ...(plan ? { plan } : {}), ...(status ? { status } : {}) },
            { new: true, upsert: true }
        ).populate("owner", "name email");

        return res.json({ success: true, data: sub });
    } catch (err) { next(err); }
};
