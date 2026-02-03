const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false // never return password by default
        },

        role: {
            type: String,
            enum: ["admin", "resident"],
            default: "resident"
        },

        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            default: null
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Useful compound index
userSchema.index({ role: 1, isActive: 1 });

module.exports = mongoose.model("User", userSchema);
