import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
    {
        // 🔗 Resident reference
        resident: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resident",
            required: true,
            index: true,
        },

        // 🔗 Room reference
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true,
        },

        // 💰 Amount to be paid
        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        // 📅 Month identifier (YYYY-MM) → used for cron + duplicate prevention
        month: {
            type: String,
            required: true,
            match: /^\d{4}-\d{2}$/, // e.g., 2026-02
            index: true,
        },

        // 🧾 Payment type (FIXED ENUM — your bug was here)
        type: {
            type: String,
            enum: ["rent", "deposit", "late_fee", "other"],
            default: "rent",
            required: true,
            index: true,
        },

        // 📊 Payment status
        status: {
            type: String,
            enum: ["pending", "paid", "failed", "cancelled"],
            default: "pending",
            index: true,
        },

        // ⏰ Due date for reminders / late fee automation
        dueDate: {
            type: Date,
            required: true,
        },

        // 💳 Payment method (future Stripe/cash support)
        method: {
            type: String,
            enum: ["cash", "card", "bank", "online", null],
            default: null,
        },

        // 🧾 Optional transaction reference (Stripe ID, etc.)
        transactionId: {
            type: String,
            default: null,
        },

        // 📝 Notes (admin comments, adjustments)
        notes: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        // 📅 Actual paid timestamp
        paidAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);



// Ensures ONE rent payment per resident per month
PaymentSchema.index(
    { resident: 1, month: 1, type: 1 },
    { unique: true }
);



export default mongoose.model("Payment", PaymentSchema);
