const mongoose = require("mongoose");

/**
 * Room
 * Phase 4 – Room & Bed Management
 *
 * - Tracks total beds
 * - Tracks occupied beds
 * - Availability is calculated (not stored)
 */

const RoomSchema = new mongoose.Schema(
    {
        roomNumber: {
            type: String,
            required: true,
            unique: true
        },

        totalBeds: {
            type: Number,
            required: true,
            min: 1
        },

        occupiedBeds: {
            type: Number,
            default: 0,
            min: 0
        },

        // Optional notes (maintenance, blocked beds, etc.)
        note: {
            type: String
        }
    },
    { timestamps: true }
);

/* ================= VIRTUAL FIELD =================
   Available beds = totalBeds - occupiedBeds
================================================== */
RoomSchema.virtual("availableBeds").get(function () {
    return this.totalBeds - this.occupiedBeds;
});

// Ensure virtuals show up in JSON
RoomSchema.set("toJSON", { virtuals: true });
RoomSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Room", RoomSchema);
