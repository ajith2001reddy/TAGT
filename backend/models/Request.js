const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
    residentId: mongoose.Schema.Types.ObjectId,
    message: String,
    status: { type: String, default: "OPEN" }
});

module.exports = mongoose.model("Request", RequestSchema);
