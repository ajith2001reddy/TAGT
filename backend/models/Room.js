const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
    roomNumber: String,
    totalBeds: Number,
    occupiedBeds: { type: Number, default: 0 }
});

module.exports = mongoose.model("Room", RoomSchema);
