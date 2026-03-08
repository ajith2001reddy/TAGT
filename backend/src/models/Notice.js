import mongoose from "mongoose";
import { tenantIsolationPlugin } from "../middleware/tenantIsolation.js";

const noticeSchema = new mongoose.Schema(
    {
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true,
            index: true
        },
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true
        },
        priority: {
            type: String,
            enum: ["info", "warning", "critical"],
            default: "info"
        },
        audienceCount: {
            type: Number,
            default: 0
        },
        // 🗑️ Soft delete fields
        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// 🗑️ Soft-delete middleware
noticeSchema.pre(/^find/, function (next) {
    if (this._conditions.isDeleted === undefined) {
        this.where({ isDeleted: { $ne: true } });
    }
    next();
});

// Apply tenant isolation
noticeSchema.plugin(tenantIsolationPlugin);

export default mongoose.model("Notice", noticeSchema);
