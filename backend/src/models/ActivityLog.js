import mongoose from "mongoose";
import { tenantIsolationPlugin } from "../middleware/tenantIsolation.js";

const ActivityLogSchema = new mongoose.Schema(
    {
        action: {
            type: String,
            required: true,
            index: true
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
            index: true
        },
        role: {
            type: String,
            required: true,
            index: true
        },
        ipAddress: {
            type: String
        },
        route: {
            type: String
        },
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            default: null, // null for super_admin system-wide actions
            index: true
        },
        details: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        // 🗑️ Soft delete fields
        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date, default: null },
    },
    {
        timestamps: true
    }
);

// 🗑️ Soft-delete middleware
ActivityLogSchema.pre(/^find/, function (next) {
    if (this._conditions.isDeleted === undefined) {
        this.where({ isDeleted: { $ne: true } });
    }
    next();
});

// ✅ Compound index for multi-tenant analytics/history
// Apply tenant isolation
ActivityLogSchema.plugin(tenantIsolationPlugin);

export default mongoose.model("ActivityLog", ActivityLogSchema);
