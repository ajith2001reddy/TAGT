import Joi from "joi";

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firebaseToken: Joi.string().optional() // sometimes UI passes firebaseToken instead of password
}).or("password", "firebaseToken");

export const registerOwnerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().required(),
    phone: Joi.string().optional(),
});
