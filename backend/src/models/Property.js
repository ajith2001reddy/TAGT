import mongoose from "mongoose";
import { tenantIsolationPlugin } from "../middleware/tenantIsolation.js";
import { encrypt, decrypt } from "../utils/encryption.js";

const propertySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, index: true },
        type: { type: String, enum: ["pg", "hostel", "apartment", "other"], required: true, index: true },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true
        },
        address: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        gstin: { type: String, trim: true, default: "", set: encrypt, get: decrypt },
        pan: { type: String, trim: true, default: "", set: encrypt, get: decrypt },
        phone: { type: String, trim: true, default: "", set: encrypt, get: decrypt },
        joinCode: { type: String, unique: true, sparse: true, trim: true, index: true },
        isActive: { type: Boolean, default: true, index: true },

        // 🖼️ Visual Assets
        images: [{ type: String }],
        heroImage: { type: String, default: null },

        // 🗑️ Soft delete fields
        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date, default: null },
    },
    {
        timestamps: true,
        toJSON: { getters: true },
        toObject: { getters: true }
    }
);

// 🗑️ Soft-delete: automatically exclude deleted properties from all find queries
propertySchema.pre(/^find/, function (next) {
    if (this._conditions.isDeleted === undefined) {
        this.where({ isDeleted: { $ne: true } });
    }
    next();
});

propertySchema.index({ ownerId: 1, isActive: 1 });
propertySchema.index({ ownerId: 1, isDeleted: 1 }); // Required for soft-delete fast lookups

// Apply tenant isolation
propertySchema.plugin(tenantIsolationPlugin);

export default mongoose.models.Property || mongoose.model("Property", propertySchema);
