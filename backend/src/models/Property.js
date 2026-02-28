import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, index: true },
        type: { type: String, enum: ["pg", "hotel"], required: true, index: true },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        address: { type: String, required: true, trim: true },
        isActive: { type: Boolean, default: true, index: true }
    },
    { timestamps: true }
);

propertySchema.index({ owner: 1, isActive: 1 });

export default mongoose.model("Property", propertySchema);
