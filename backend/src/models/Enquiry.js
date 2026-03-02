import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
    {
        pgId: {
            type: String,
            required: true,
        },
        pgName: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Enquiry", enquirySchema);