import mongoose from "mongoose";

const bedSchema = new mongoose.Schema(
    {
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true,
            index: true,
        },
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true,
            index: true,
        },
        bedNumber: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["available", "occupied", "maintenance"],
            default: "available",
            index: true,
        },
        residentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },
    },
    { timestamps: true }
);

// Unique bed number per room
bedSchema.index({ roomId: 1, bedNumber: 1 }, { unique: true });

export default mongoose.model("Bed", bedSchema);
