const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema(
    {
        residentId: mongoose.Schema.Types.ObjectId,
        message: String,
        status: {
            type: String,
            enum: ["pending", "in-progress", "resolved"],
            default: "pending"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Request", RequestSchema);
