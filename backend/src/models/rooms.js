import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            index: true
        },
        roomNumber: {
            type: String,
            required: true,
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
        },
        beds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bed"
        }],
        // 🗑️ Soft delete fields
        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date, default: null },
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

// 📊 Compound indexes for scoped analytics queries
roomSchema.index({ propertyId: 1, roomNumber: 1 }, { unique: true, sparse: true });
roomSchema.index({ propertyId: 1, maintenanceMode: 1 });
roomSchema.index({ rent: 1 });
roomSchema.index({ occupiedBeds: 1, totalBeds: 1 });
roomSchema.index({ isDeleted: 1, propertyId: 1 });

// 🗑️ Soft-delete: automatically exclude deleted rooms from all find queries
roomSchema.pre(/^find/, function (next) {
    if (this._conditions.isDeleted === undefined) {
        this.where({ isDeleted: { $ne: true } });
    }
    next();
});

export default mongoose.model("Room", roomSchema);
