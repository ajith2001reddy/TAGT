const mongoose = require("mongoose");

/**
 * RequestHistory
 * Phase 2 Archive Model
 */

const RequestHistorySchema = new mongoose.Schema(
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

RequestHistorySchema.index({ residentId: 1, resolvedAt: -1 });

module.exports = mongoose.model("RequestHistory", RequestHistorySchema);
