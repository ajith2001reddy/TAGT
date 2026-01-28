const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema(
    {
        /* ================= EXISTING FIELDS (UNCHANGED) ================= */

        residentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true // Speeds up "find my requests" queries
        },

        message: {
            type: String,
            required: true
        },

        // OLD STATUS SYSTEM (KEPT FOR BACKWARD COMPATIBILITY)
        status: {
            type: String,
            enum: ["pending", "in-progress", "resolved"],
            default: "pending",
            index: true // Speeds up dashboard counts and filtering
        },

        statusHistory: [
            {
                status: String,
                changedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],

        /* ================= PHASE 1 ADDITIONS (SAFE) ================= */

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
            index: true // Speeds up workflow filtering
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

/* ================= PERFORMANCE INDEXES ================= */

// Compound index for common query: "find active requests for this resident"
RequestSchema.index({ residentId: 1, status: 1 });

// Compound index for admin dashboard: "pending requests sorted by date"
RequestSchema.index({ status: 1, createdAt: -1 });

// Compound index for workflow queries
RequestSchema.index({ workflowStatus: 1, createdAt: -1 });

module.exports = mongoose.model("Request", RequestSchema);