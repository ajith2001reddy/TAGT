import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema(
    {
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true,
            index: true
        },

        resident: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        message: {
            type: String,
            trim: true,
            default: ""
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium"
        },

        status: {
            type: String,
            enum: ["pending", "in-progress", "resolved"],
            default: "pending",
            index: true
        }
    },
    { timestamps: true }

);

RequestSchema.pre("validate", function (next) {
    if (!this.propertyId || !this.resident) {
        return next(new Error("Invalid tenant association"));
    }
    next();
});

RequestSchema.index({ propertyId: 1, status: 1 });

export default mongoose.model("Request", RequestSchema);