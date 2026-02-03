import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
    {
        residentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ["pending", "in-progress", "resolved"],
            default: "pending",
            index: true
        },
        statusHistory: [
            {
                status: {
                    type: String,
                    required: true
                },
                changedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        adminNotes: [
            {
                note: {
                    type: String,
                    required: true
                },
                status: {
                    type: String
                },
                adminId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        workflowStatus: {
            type: String,
            enum: ["Received", "In-Progress", "On Hold", "Done"],
            default: "Received",
            index: true
        },
        cost: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

requestSchema.index({ residentId: 1, status: 1 });
requestSchema.index({ status: 1, createdAt: -1 });
requestSchema.index({ workflowStatus: 1, createdAt: -1 });

export default mongoose.model("Request", requestSchema);
