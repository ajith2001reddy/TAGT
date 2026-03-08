import mongoose from "mongoose";
import { tenantIsolationPlugin } from "../middleware/tenantIsolation.js";

const internalNoteSchema = new mongoose.Schema({
    note: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    addedAt: { type: Date, default: Date.now },
});

const SupportTicketSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        role: {
            type: String,
            enum: ["resident", "owner"],
            required: true,
        },

        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            index: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            enum: [
                "payment",
                "technical",
                "maintenance",
                "maintenance_escalation",
                "account",
                "billing",
                "other",
            ],
            required: true,
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium",
        },

        message: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: ["open", "in_progress", "resolved"],
            default: "open",
            index: true,
        },

        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        resolvedAt: {
            type: Date,
        },

        internalNotes: [internalNoteSchema],
        // 🗑️ Soft delete fields
        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// 🗑️ Soft-delete middleware
SupportTicketSchema.pre(/^find/, function (next) {
    if (this._conditions.isDeleted === undefined) {
        this.where({ isDeleted: { $ne: true } });
    }
    next();
});

SupportTicketSchema.index({ status: 1, priority: 1, createdAt: -1 });
SupportTicketSchema.index({ userId: 1, status: 1 });

// Apply tenant isolation
SupportTicketSchema.plugin(tenantIsolationPlugin);

export default mongoose.model("SupportTicket", SupportTicketSchema);
