import mongoose from "mongoose";

const requestHistorySchema = new mongoose.Schema(
    {
        requestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Request",
            index: true
        },
        residentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        originalMessage: {
            type: String,
            required: true,
            trim: true
        },
        finalResolution: {
            type: String,
            required: true,
            trim: true
        },
        timeline: [
            {
                status: {
                    type: String
                },
                note: {
                    type: String
                },
                adminId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        resolvedAt: {
            type: Date,
            default: Date.now,
            index: true
        },
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            index: true
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
requestHistorySchema.pre(/^find/, function (next) {
    if (this._conditions.isDeleted === undefined) {
        this.where({ isDeleted: { $ne: true } });
    }
    next();
});

// ✅ Compound index for multi-tenant history
requestHistorySchema.index({ propertyId: 1, residentId: 1 });

requestHistorySchema.index({ residentId: 1, resolvedAt: -1 });

export default mongoose.model("RequestHistory", requestHistorySchema);
