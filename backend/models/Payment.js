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
            required: true
        },

        // Used for rent (e.g. "2026-01")
        month: {
            type: String
        },

        amount: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: ["paid", "unpaid"],
            default: "unpaid"
        },

        /* ================= PHASE 3 ADDITIONS ================= */

        // What this charge is for (rent, damage, maintenance, etc.)
        description: {
            type: String,
            default: "Charge"
        },

        // How this bill was created
        type: {
            type: String,
            enum: ["rent", "manual", "maintenance"],
            default: "manual"
        },

        // Admin who created the bill
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        // When admin marked it paid
        paidAt: {
            type: Date
        },

        // Optional admin note
        adminNote: {
            type: String
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
