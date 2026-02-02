const mongoose = require("mongoose");

const roomsSchema = new mongoose.Schema(
    {
        roomsNumber: {
            type: String,
            required: true,
            unique: true
        },

        rent: {
            type: Number,
            required: true,
            min: 1
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

        note: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

/* ============================
   VIRTUAL: AVAILABLE BEDS
   ============================ */
roomsSchema.virtual("availableBeds").get(function () {
    return this.totalBeds - this.occupiedBeds;
});

module.exports = mongoose.model("roomss", roomsSchema);
