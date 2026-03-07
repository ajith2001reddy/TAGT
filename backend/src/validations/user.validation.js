import Joi from "joi";

export const updateProfileSchema = Joi.object({
    name: Joi.string().optional().trim(),
    phoneNumber: Joi.string().optional().allow("").trim(),
    email: Joi.string().email().optional().trim()
});

export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
});
