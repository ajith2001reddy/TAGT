import Joi from "joi";

export const createRequestSchema = Joi.object({
    title: Joi.string().required().trim(),
    description: Joi.string().required().trim(),
    priority: Joi.string().valid("low", "medium", "high", "urgent").optional()
});

export const updateRequestSchema = Joi.object({
    status: Joi.string().valid("pending", "in-progress", "resolved").optional(),
    priority: Joi.string().valid("low", "medium", "high", "urgent").optional()
});
