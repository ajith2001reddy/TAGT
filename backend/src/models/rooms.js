import mongoose from "mongoose";

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
                validator(value) {
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

// Virtual field for availability
roomSchema.virtual("availableBeds").get(function () {
    return Math.max(0, this.totalBeds - this.occupiedBeds);
});

// Indexes for analytics & queries
roomSchema.index({ rent: 1 });
roomSchema.index({ occupiedBeds: 1, totalBeds: 1 });

export default mongoose.model("Room", roomSchema);
