const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
    {
        roomNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
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
            min: 0,
            validate: {
                validator: function (value) {
                    return value <= this.totalBeds;
                },
                message: "Occupied beds cannot exceed total beds"
            }
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
roomSchema.virtual("availableBeds").get(function () {
    return this.totalBeds - this.occupiedBeds;
});

module.exports = mongoose.model("Room", roomSchema);
