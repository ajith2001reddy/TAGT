import mongoose from "mongoose";

const bedSchema = new mongoose.Schema(
    {
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true,
            index: true,
        },
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true,
            index: true,
        },
        bedNumber: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["available", "occupied", "maintenance"],
            default: "available",
            index: true,
        },
        residentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },

        // 🗑️ Soft delete fields
        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// 🗑️ Soft-delete: automatically exclude deleted beds from all find queries
bedSchema.pre(/^find/, function (next) {
    if (this._conditions.isDeleted === undefined) {
        this.where({ isDeleted: { $ne: true } });
    }
    next();
});

// Unique bed number per room
bedSchema.index({ roomId: 1, bedNumber: 1 }, { unique: true });

// ✅ Compound index for multi-tenant list/filter
bedSchema.index({ propertyId: 1, status: 1 });

export default mongoose.model("Bed", bedSchema);
