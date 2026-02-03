import mongoose from "mongoose";

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
            trim: true,
            default: ""
        },
        type: {
            type: String,
            enum: ["manual", "auto"],
            default: "manual",
            index: true
        },
        month: {
            type: String,
            index: true,
            default: null
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

paymentSchema.index({ residentId: 1, status: 1, month: 1 });

export default mongoose.model("Payment", paymentSchema);
