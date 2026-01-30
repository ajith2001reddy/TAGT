const mongoose = require("mongoose");

/**
 * Payment
 * Phase 3 – Billing & Revenue
 *
 * - Resident payments
 * - Admin-created bills
 * - Fully compatible with /payments/my
 */

const PaymentSchema = new mongoose.Schema(
    {
        residentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        month: {
            type: String,
            default: null,
            index: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: ["paid", "unpaid"],
            default: "unpaid",
            index: true
        },

        description: {
            type: String,
            default: "Charge"
        },

        type: {
            type: String,
            enum: ["rent", "manual", "maintenance"],
            default: "manual",
            index: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        paidAt: {
            type: Date,
            default: null,
            index: true
        },

        adminNote: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

/* ================= INDEXES ================= */

PaymentSchema.index({ residentId: 1, status: 1 });
PaymentSchema.index({ status: 1, paidAt: -1 });
PaymentSchema.index({ month: 1, status: 1 });

module.exports = mongoose.model("Payment", PaymentSchema);
