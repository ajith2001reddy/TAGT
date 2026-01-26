const mongoose = require("mongoose");

// Optional: log to verify file loading (remove in production)
console.log("Payment model loaded");

const PaymentSchema = new mongoose.Schema({
    residentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resident",
        required: true
    },
    month: {
        type: String,
        required: true,
        // Tip: Use a format like "YYYY-MM" (e.g., "2023-10") for easier sorting
    },
    amount: {
        type: Number,
        required: true,
        min: 0 // Safety check: amount cannot be negative
    },
    status: {
        type: String,
        enum: ["paid", "unpaid"],
        default: "unpaid"
    }
}, {
    timestamps: true // Adds 'createdAt' and 'updatedAt' fields automatically
});

module.exports = mongoose.model("Payment", PaymentSchema);