import mongoose from "mongoose";

const SupportMessageSchema = new mongoose.Schema(
    {
        ticketId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SupportTicket",
            required: true,
            index: true,
        },

        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        senderRole: {
            type: String,
            enum: ["resident", "owner", "super_admin"],
            required: true,
        },

        message: {
            type: String,
            required: true,
        },

        // If true, only super_admin can see this (internal note as message)
        isInternal: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

SupportMessageSchema.index({ ticketId: 1, createdAt: 1 });

export default mongoose.model("SupportMessage", SupportMessageSchema);
