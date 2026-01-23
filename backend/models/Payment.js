const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
    residentId: mongoose.Schema.Types.ObjectId,
    month: String,
    status: {
        type: String,
        enum: ["PAID", "DUE"],
        default: "DUE"
    }
});

module.exports = mongoose.model("Payment", PaymentSchema);
