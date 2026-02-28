import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        // Firebase UID - linked when user logs in via Firebase/Google
        // sparse: true allows multiple documents to have null (for old password users)
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

        // Password is optional — Google/Firebase users won't have one
        password: {
            type: String,
            minlength: 6,
            select: false,
        },

        role: {
            type: String,
            enum: ["super_admin", "owner", , "resident"],
            default: "resident",
            index: true,
        },


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


userSchema.pre("validate", function (next) {
    if (this.role === "super_admin") {
        this.propertyId = null;
    }

    if (["owner", "resident"].includes(this.role) && !this.propertyId) {
        return next(new Error("propertyId is required for owner and resident"));
    }

    return next();
});

// Only hash if password exists and was modified
userSchema.pre("save", async function (next) {
    if (!this.password || !this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);