const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        residentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        amount: {
            type: Number,
            required: true
        },

        description: {
            type: String,
            default: ""
        },

        type: {
            type: String,
            default: "manual"
        },

        month: {
            type: String,
            default: null
        },

        status: {
            type: String,
            enum: ["unpaid", "paid"],
            default: "unpaid"
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

module.exports = mongoose.model("Payment", paymentSchema);
