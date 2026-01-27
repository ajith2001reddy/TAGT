const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
    residentId: mongoose.Schema.Types.ObjectId,
    month: String,
    amount: Number,
    status: { type: String, enum: ["paid", "unpaid"], default: "unpaid" }
}, { timestamps: true });

module.exports = mongoose.model("Payment", PaymentSchema);
