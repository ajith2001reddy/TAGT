import Joi from "joi";

export const createPaymentSchema = Joi.object({
    propertyId: Joi.string().required(),
    resident: Joi.string().required(),
    room: Joi.string().optional().allow(null),
    amount: Joi.number().min(0).required(),
    month: Joi.string().pattern(/^\d{4}-\d{2}$/).required(),
    type: Joi.string().valid("rent", "deposit", "late_fee", "other").required(),
    status: Joi.string().valid("pending", "overdue", "paid", "failed", "cancelled").optional(),
    dueDate: Joi.date().iso().required(),
    method: Joi.string().valid("cash", "card", "bank", "online").optional().allow(null),
    transactionId: Joi.string().optional().allow(null),
    notes: Joi.string().max(500).optional().allow("")
});

export const markPaymentPaidSchema = Joi.object({
    method: Joi.string().valid("cash", "card", "bank", "online").required(),
    transactionId: Joi.string().optional().allow(null),
    notes: Joi.string().max(500).optional().allow("")
});
