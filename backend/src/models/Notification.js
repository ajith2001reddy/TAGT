import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        role: {
            type: String,
            enum: ["resident", "owner", "super_admin"],
        },

        title: {
            type: String,
            required: true,
        },

        message: {
            type: String,
            required: true,
        },

        type: {
            type: String,
            enum: ["payment", "maintenance", "support", "system", "resident"],
            default: "system",
        },

        // Optional deep-link (e.g. /owner/payments, /resident/support)
        link: {
            type: String,
            default: null,
        },

        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
        // 🗑️ Soft delete fields
        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// 🗑️ Soft-delete middleware
NotificationSchema.pre(/^find/, function (next) {
    if (this._conditions.isDeleted === undefined) {
        this.where({ isDeleted: { $ne: true } });
    }
    next();
});

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Notification", NotificationSchema);
