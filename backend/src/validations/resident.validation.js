import Joi from "joi";

export const createResidentSchema = Joi.object({
    name: Joi.string().required().trim(),
    email: Joi.string().email().required().trim(),
    phoneNumber: Joi.string().optional().allow("").trim(),
    roomId: Joi.string().optional().allow(null),
    bedId: Joi.string().optional().allow(null),
    propertyId: Joi.string().optional().allow(null)
});

export const updateResidentSchema = Joi.object({
    name: Joi.string().optional().trim(),
    phoneNumber: Joi.string().optional().allow("").trim(),
    isActive: Joi.boolean().optional(),
    roomId: Joi.string().optional().allow(null),
    bedId: Joi.string().optional().allow(null)
});
