import Joi from "joi";

export const createTicketSchema = Joi.object({
    title: Joi.string().required().trim(),
    message: Joi.string().required().trim(),
    category: Joi.string().valid(
        "payment", "technical", "maintenance",
        "maintenance_escalation", "account", "billing", "other"
    ).required(),
    priority: Joi.string().valid("low", "medium", "high", "urgent").optional()
});

export const replyToTicketSchema = Joi.object({
    message: Joi.string().required().trim()
});

export const updateTicketStatusSchema = Joi.object({
    status: Joi.string().valid("open", "in_progress", "resolved").required()
});

export const addInternalNoteSchema = Joi.object({
    note: Joi.string().required().trim()
});
