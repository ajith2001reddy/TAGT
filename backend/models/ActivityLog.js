const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema(
    {
        action: {
            type: String,
            required: true
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        role: {
            type: String,
            required: true
        },
        ipAddress: String,
        route: String
    },
    { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
