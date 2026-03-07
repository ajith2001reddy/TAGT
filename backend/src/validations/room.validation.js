import Joi from "joi";

export const createRoomSchema = Joi.object({
    propertyId: Joi.string().required(),
    roomNumber: Joi.string().required(),
    capacity: Joi.number().integer().min(1).required(),
    baseRent: Joi.number().min(0).required(),
    amenities: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid("available", "occupied", "maintenance").optional()
});

export const updateRoomSchema = Joi.object({
    roomNumber: Joi.string().optional(),
    capacity: Joi.number().integer().min(1).optional(),
    baseRent: Joi.number().min(0).optional(),
    amenities: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid("available", "occupied", "maintenance").optional()
});
