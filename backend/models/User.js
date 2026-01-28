const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: String,
        email: {
            type: String,
            required: true,
            unique: true,
            index: true, // Speeds up login queries significantly
            lowercase: true, // Prevents "User@email.com" vs "user@email.com" issues
            trim: true // Removes accidental spaces
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["admin", "resident"],
            default: "resident"
        },
        isActive: {
            type: Boolean,
            default: true // Allows soft delete (disable account without deleting data)
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Compound index for admin queries like "find all active residents"
userSchema.index({ role: 1, isActive: 1 });

module.exports = mongoose.model("User", userSchema);