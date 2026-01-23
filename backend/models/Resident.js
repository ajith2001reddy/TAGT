const mongoose = require("mongoose");

const ResidentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: String,
    roomNumber: String,
    monthlyRent: Number
});

module.exports = mongoose.model("Resident", ResidentSchema);
