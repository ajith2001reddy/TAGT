const mongoose = require("mongoose");

const residentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        room: {
            type: String,
            required: true
        },
        rent: {
            type: Number,
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Resident", residentSchema);
