const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema(
    {
        residentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        message: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "in-progress", "resolved"],
            default: "pending"
        },
        statusHistory: [
            {
                status: String,
                changedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model("Request", RequestSchema);
