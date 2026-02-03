import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema(
    {
        action: {
            type: String,
            required: true,
            index: true
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
            index: true
        },
        role: {
            type: String,
            required: true,
            index: true
        },
        ipAddress: {
            type: String
        },
        route: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("ActivityLog", ActivityLogSchema);
