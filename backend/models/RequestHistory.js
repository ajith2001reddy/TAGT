const mongoose = require("mongoose");

/**
 * RequestHistory
 * Phase 2 Archive Model
 *
 * Purpose:
 * - Store CLOSED / DONE maintenance requests
 * - Keep audit trail permanently
 * - Requests are MOVED here (not deleted blindly)
 */

const RequestHistorySchema = new mongoose.Schema(
    {
        // Original request reference (optional but useful)
        requestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Request"
        },

        // Resident who created the request
        residentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Original request message
        originalMessage: {
            type: String,
            required: true
        },

        // Final resolution entered by admin (REQUIRED)
        finalResolution: {
            type: String,
            required: true
        },

        // Timeline copied from Request.adminNotes
        timeline: [
            {
                status: String,
                note: String,
                adminId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                createdAt: {
                    type: Date
                }
            }
        ],

        // Admin who closed the request
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // When it was resolved
        resolvedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "RequestHistory",
    RequestHistorySchema
);
