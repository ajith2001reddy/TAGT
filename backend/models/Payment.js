const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        residentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        description: {
            type: String,
            default: "",
            trim: true
        },

        type: {
            type: String,
            default: "manual"
        },

        month: {
            type: String,
            default: null,
            index: true
        },

        status: {
            type: String,
            enum: ["unpaid", "paid"],
            default: "unpaid",
            index: true
        },

        adminNote: {
            type: String,
            default: ""
        },

        paidAt: {
            type: Date,
            default: null
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

paymentSchema.index({ residentId: 1, status: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
