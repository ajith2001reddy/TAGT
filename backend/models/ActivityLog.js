const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema(
    {
        action: {
            type: String,
            required: true
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        role: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
