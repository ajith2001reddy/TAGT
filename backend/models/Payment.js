const mongoose = require("mongoose");

/**
 * Payment
 * Phase 3 – Billing & Revenue
 *
 * Backward compatible:
 * - Existing records with only month/amount/status still work
 * - New fields are optional and additive
 */

const PaymentSchema = new mongoose.Schema(
    {
        /* ================= EXISTING (UNCHANGED) ================= */
        residentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true // Critical for "get my payments" queries
        },

        // Used for rent (e.g. "2026-01")
        month: {
            type: String,
            index: true // For monthly rent reports
        },

        amount: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: ["paid", "unpaid"],
            default: "unpaid",
            index: true // Critical for filtering paid vs unpaid
        },

        /* ================= PHASE 3 ADDITIONS ================= */

        description: {
            type: String,
            default: "Charge"
        },

        type: {
            type: String,
            enum: ["rent", "manual", "maintenance"],
            default: "manual",
            index: true // For filtering by payment type
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        paidAt: {
            type: Date,
            index: true // For revenue reports by date
        },
        },

        adminNote: {
            type: String
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

/* ================= PERFORMANCE INDEXES ================= */

// Critical for resident dashboard: "my unpaid bills"
PaymentSchema.index({ residentId: 1, status: 1 });

// For admin revenue queries: "show me all paid payments sorted by date"
PaymentSchema.index({ status: 1, paidAt: -1 });

// For monthly rent reports: "show me January rent payments"
PaymentSchema.index({ month: 1, status: 1 });

module.exports = mongoose.model("Payment", PaymentSchema);