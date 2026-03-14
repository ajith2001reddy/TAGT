import mongoose from "mongoose";
import { tenantIsolationPlugin } from "../middleware/tenantIsolation.js";

const leaseSchema = new mongoose.Schema(
    {
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true,
            index: true,
        },
        residentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        fileUrl: {
            type: String,
            required: true,
        },
        signedFileUrl: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: ["pending", "signed", "rejected"],
            default: "pending",
        },
        signature: {
            residentName: String,
            acceptedAt: Date,
            ipAddress: String,
            userAgent: String,
            typedName: String,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null },
        documentHash: { type: String, default: null }, // SHA256 integrity check
    },
    { timestamps: true }
);

leaseSchema.plugin(tenantIsolationPlugin);

export default mongoose.models.Lease || mongoose.model("Lease", leaseSchema);
