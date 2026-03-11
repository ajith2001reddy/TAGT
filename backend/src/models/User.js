import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { tenantIsolationPlugin } from "../middleware/tenantIsolation.js";
import { encrypt, decrypt } from "../utils/encryption.js";

const userSchema = new mongoose.Schema(
    {
        firebaseUid: {
            type: String,
            unique: true,
            sparse: true,
            index: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
            match: [/\S+@\S+\.\S+/, "Please use a valid email address"],
        },
        phoneNumber: {
            type: String,
            trim: true,
            default: "",
            set: encrypt,
            get: decrypt
        },

        emailVerified: {
            type: Boolean,
            default: false,
            index: true,
        },
        phoneVerified: {
            type: Boolean,
            default: false,
        },

        verification: {
            status: {
                type: String,
                enum: ["unverified", "pending", "approved", "rejected"],
                default: "unverified",
                index: true,
            },
            selfiePhoto: { type: String, default: null },
            idFront: { type: String, default: null },
            idBack: { type: String, default: null },
            propertyDocument: { type: String, default: null },
            aiScore: { type: Number, default: 0 },
            fraudRisk: {
                type: String,
                enum: ["low", "medium", "high", "unknown"],
                default: "unknown"
            }
        },

        password: {
            type: String,
            minlength: 6,
            select: false,
        },
        setupToken: {
            type: String,
            default: null,
            index: true,
        },

        setupTokenExpires: {
            type: Date,
            default: null,
        },

        role: {
            type: String,
            enum: ["super_admin", "owner", "resident"],
            default: "resident",
            index: true,
        },

        status: {
            type: String,
            enum: ["pending", "approved", "active", "inactive"],
            default: "active",
            index: true,
        },

        // ✅ Explicit link to owner for residents
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },

        // ✅ Single property for resident
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            default: null,
            index: true,
        },

        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            default: null,
            index: true,
        },

        bedId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bed",
            default: null,
            index: true,
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

        notes: [{
            text: { type: String, trim: true, maxlength: 1000 },
            addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            addedAt: { type: Date, default: Date.now },
        }],

        notifications: [
            {
                type: { type: String, enum: ["info", "warning", "success", "danger"], default: "info" },
                message: { type: String, required: true },
                read: { type: Boolean, default: false },
                createdAt: { type: Date, default: Date.now },
            },
        ],

        // 🗑️ Soft delete
        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date, default: null },
    },
    {
        timestamps: true,
        toJSON: { getters: true },
        toObject: { getters: true }
    }
);

// 🔐 Hash password before saving (only when modified)
userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// 🗑️ Soft-delete: automatically exclude deleted users from all find queries
userSchema.pre(/^find/, function (next) {
    if (this._conditions.isDeleted === undefined) {
        this.where({ isDeleted: { $ne: true } });
    }
    next();
});

// ✅ Helper: verify a plain-text password against the stored hash
userSchema.methods.comparePassword = async function (plain) {
    return bcrypt.compare(plain, this.password);
};

// Apply tenant isolation
userSchema.plugin(tenantIsolationPlugin);

// 📊 Compound Indexes for Dashboard/Query Performance
userSchema.index({ ownerId: 1, isDeleted: 1 });
userSchema.index({ propertyId: 1, isDeleted: 1 });
userSchema.index({ firebaseUid: 1, isDeleted: 1 });

export default mongoose.models.User || mongoose.model("User", userSchema);