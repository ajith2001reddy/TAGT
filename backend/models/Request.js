const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema(
    {
        /* ================= EXISTING FIELDS (UNCHANGED) ================= */

        residentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        message: {
            type: String,
            required: true
        },

        // OLD STATUS SYSTEM (KEPT FOR BACKWARD COMPATIBILITY)
        status: {
            type: String,
            enum: ["pending", "in-progress", "resolved"],
            default: "pending"
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

        /**
         * Admin notes for professional request handling
         * - Does NOT affect existing flows
         * - Empty for old records
         * - Used only by admin features
         */
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

        /**
         * New workflow status (OPTIONAL)
         * This allows future migration without breaking old logic
         */
        workflowStatus: {
            type: String,
            enum: ["Received", "In-Progress", "On Hold", "Done"],
            default: "Received"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Request", RequestSchema);
