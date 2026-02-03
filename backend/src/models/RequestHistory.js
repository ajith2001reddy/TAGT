import mongoose from "mongoose";

/**
 * RequestHistory
 * Phase 2 Archive Model
 */
const requestHistorySchema = new mongoose.Schema(
    {
        requestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Request",
            index: true
        },

        residentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        originalMessage: {
            type: String,
            required: true,
            trim: true
        },

        finalResolution: {
            type: String,
            required: true,
            trim: true
        },

        timeline: [
            {
                status: {
                    type: String
                },
                note: {
                    type: String
                },
                adminId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                createdAt: {
                    type: Date
                }
            }
        ],

        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        resolvedAt: {
            type: Date,
            default: Date.now,
            index: true
        }
    },
    {
        timestamps: true
    }
);

/* =========================
   INDEXES
========================= */
requestHistorySchema.index({ residentId: 1, resolvedAt: -1 });

export default mongoose.model("RequestHistory", requestHistorySchema);
