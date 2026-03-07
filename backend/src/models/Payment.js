import mongoose from "mongoose";
import { tenantIsolationPlugin } from "../middleware/tenantIsolation.js";


const PaymentSchema = new mongoose.Schema(
    {
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            index: true,
            required: true,
        },

        // 🔗 Resident reference
        resident: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // 🔗 Room reference
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            default: null,
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
            enum: ["pending", "overdue", "paid", "failed", "cancelled"],
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

        lateFee: {
            type: Number,
            default: 0,
            min: 0,
        },


        totalPayable: {
            type: Number,
            default: 0,
            min: 0,
        },

        // 📅 Actual paid timestamp
        paidAt: {
            type: Date,
            default: null,
        },

        // 🗑️ Soft delete fields
        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date, default: null },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

// 🗑️ Soft-delete: automatically exclude deleted payments from all find queries
PaymentSchema.pre(/^find/, function (next) {
    if (this._conditions.isDeleted === undefined) {
        this.where({ isDeleted: { $ne: true } });
    }
    next();
});



PaymentSchema.pre("save", function (next) {
    const baseAmount = Number(this.amount || 0);
    const fee = Number(this.lateFee || 0);
    this.totalPayable = Number((baseAmount + fee).toFixed(2));
    next();
});
PaymentSchema.index({ propertyId: 1, resident: 1, month: 1 }, { unique: true });
PaymentSchema.index({ propertyId: 1, status: 1, dueDate: 1 });
PaymentSchema.index({ propertyId: 1, month: 1, status: 1 });
PaymentSchema.index({ resident: 1, month: 1 }, { unique: true }); // prevent duplicate bills

// 📊 Optimized compound indexes for dashboard/list analytics
PaymentSchema.index({ propertyId: 1, status: 1, createdAt: -1 });
PaymentSchema.index({ propertyId: 1, type: 1, status: 1 });

// ✅ Compound indexes for multi-tenant analytics
PaymentSchema.index({ propertyId: 1, status: 1, dueDate: 1 });
PaymentSchema.index({ propertyId: 1, month: 1, status: 1 });

// Apply tenant isolation
PaymentSchema.plugin(tenantIsolationPlugin);

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
