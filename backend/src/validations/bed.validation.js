import Joi from "joi";

export const createBedSchema = Joi.object({
    propertyId: Joi.string().required(),
    roomId: Joi.string().required(),
    bedLabel: Joi.string().required().trim(),
    rent: Joi.number().min(0).required()
});

export const updateBedStatusSchema = Joi.object({
    status: Joi.string().valid("available", "occupied", "maintenance").required()
});

export const assignBedSchema = Joi.object({
    residentId: Joi.string().required()
});
