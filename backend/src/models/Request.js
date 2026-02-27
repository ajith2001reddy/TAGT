import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema(
    {
        resident: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
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

export default mongoose.model("Request", RequestSchema);