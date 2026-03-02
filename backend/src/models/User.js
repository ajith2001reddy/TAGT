import mongoose from "mongoose";
import bcrypt from "bcrypt";

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

        password: {
            type: String,
            minlength: 6,
            select: false,
        },

        role: {
            type: String,
            enum: ["super_admin", "owner", "resident"],
            default: "resident",
            index: true,
        },

        // ✅ Multi-property support for owners
        propertyIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Property",
                index: true,
            },
        ],

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

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    { timestamps: true }
);
export default mongoose.model("User", userSchema);