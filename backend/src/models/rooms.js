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
            min: 0
        },
        totalBeds: {
            type: Number,
            required: true,
            min: 0
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
        maintenanceMode: {
            type: Boolean,
            default: false,
            index: true
        },
        maintenanceNote: {
            type: String,
            default: "",
            trim: true,
            maxlength: 300
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

roomSchema.virtual("availableBeds").get(function () {
    if (this.maintenanceMode) return 0;
    return Math.max(0, this.totalBeds - this.occupiedBeds);
});

roomSchema.index({ rent: 1 });
roomSchema.index({ occupiedBeds: 1, totalBeds: 1 });

export default mongoose.model("Room", roomSchema);
