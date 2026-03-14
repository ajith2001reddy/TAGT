import mongoose from "mongoose";
import { tenantIsolationPlugin } from "../middleware/tenantIsolation.js";

const expenseSchema = new mongoose.Schema(
    {
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true,
            index: true,
        },
        category: {
            type: String,
            enum: [
                "ration", "vegetables", "dairy", "maintenance", 
                "deposit_returned", "electricity", "water", "fuel", 
                "bonus", "housekeeping", "salaries", "pg_rent", "wifi", "others"
            ],
            default: "others",
            index: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        name: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        date: {
            type: Date,
            default: Date.now,
            index: true,
        },
        status: {
            type: String,
            enum: ["paid", "pending"],
            default: "paid",
        },
        receiptUrl: {
            type: String,
            default: null,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        // 🗑️ Soft delete fields
        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// 🗑️ Soft-delete: automatically exclude deleted expenses from all find queries
expenseSchema.pre(/^find/, function (next) {
    if (this._conditions.isDeleted === undefined) {
        this.where({ isDeleted: { $ne: true } });
    }
    next();
});

// Compound index for reports
expenseSchema.index({ propertyId: 1, date: 1, category: 1 });

// Apply tenant isolation
expenseSchema.plugin(tenantIsolationPlugin);

export default mongoose.models.Expense || mongoose.model("Expense", expenseSchema);
