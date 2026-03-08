import mongoose from "mongoose";
import { tenantIsolationPlugin } from "../middleware/tenantIsolation.js";

const RequestSchema = new mongoose.Schema(
    {
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true,
            index: true
        },

        resident: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        message: {
            type: String,
            trim: true,
            default: ""
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium"
        },

        status: {
            type: String,
            enum: ["pending", "in-progress", "resolved"],
            default: "pending",
            index: true
        },

        // 🗑️ Soft delete fields
        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }

);

// 🗑️ Soft-delete: automatically exclude deleted requests from all find queries
RequestSchema.pre(/^find/, function (next) {
    if (this._conditions.isDeleted === undefined) {
        this.where({ isDeleted: { $ne: true } });
    }
    next();
});

RequestSchema.pre("validate", function (next) {
    if (!this.propertyId || !this.resident) {
        return next(new Error("Invalid tenant association"));
    }
    next();
});

RequestSchema.index({ propertyId: 1, status: 1 });
RequestSchema.index({ propertyId: 1, status: 1, createdAt: -1 });
RequestSchema.index({ propertyId: 1, priority: 1, status: 1 });

// Apply tenant isolation
RequestSchema.plugin(tenantIsolationPlugin);

export default mongoose.model("Request", RequestSchema);