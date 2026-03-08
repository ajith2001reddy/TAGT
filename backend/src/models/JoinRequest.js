import mongoose from "mongoose";
import { tenantIsolationPlugin } from "../middleware/tenantIsolation.js";

const joinRequestSchema = new mongoose.Schema({
    residentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    message: {
        type: String,
        trim: true
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    processedAt: {
        type: Date
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// 🗑️ Soft-delete middleware
joinRequestSchema.pre(/^find/, function (next) {
    if (this._conditions.isDeleted === undefined) {
        this.where({ isDeleted: { $ne: true } });
    }
    next();
});

// Index for fast lookups (propertyId + status is the most common query for owners)
joinRequestSchema.index({ propertyId: 1, status: 1 });
joinRequestSchema.index({ residentId: 1, createdAt: -1 });

// Apply tenant isolation
joinRequestSchema.plugin(tenantIsolationPlugin);

const JoinRequest = mongoose.model("JoinRequest", joinRequestSchema);

export default JoinRequest;
