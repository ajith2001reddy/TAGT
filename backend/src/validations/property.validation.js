import Joi from "joi";

export const updatePropertySchema = Joi.object({
    name: Joi.string().optional().trim(),
    type: Joi.string().valid("pg", "hotel").optional(),
    address: Joi.string().optional().trim(),
    city: Joi.string().optional().trim(),
    gstin: Joi.string().optional().allow("").trim(),
    pan: Joi.string().optional().allow("").trim(),
    phone: Joi.string().optional().allow("").trim(),
    isActive: Joi.boolean().optional()
});

export const updatePropertyStatusSchema = Joi.object({
    status: Joi.string().valid("active", "suspended", "maintenance").required()
});
