import mongoose from "mongoose";

const joinRequestSchema = new mongoose.Schema({
    residentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    message: {
        type: String,
        trim: true
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    processedAt: {
        type: Date
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes for fast lookups
joinRequestSchema.index({ propertyId: 1, status: 1 });
joinRequestSchema.index({ residentId: 1, createdAt: -1 });

const JoinRequest = mongoose.model("JoinRequest", joinRequestSchema);

export default JoinRequest;
