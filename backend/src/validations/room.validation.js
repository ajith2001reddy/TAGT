import Joi from "joi";

export const createRoomSchema = Joi.object({
    propertyId: Joi.string().required(),
    roomNumber: Joi.string().required(),
    totalBeds: Joi.number().integer().min(1).required(),
    rent: Joi.number().min(0).required(),
    amenities: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid("available", "occupied", "maintenance").optional()
});

export const updateRoomSchema = Joi.object({
    roomNumber: Joi.string().optional(),
    totalBeds: Joi.number().integer().min(1).optional(),
    rent: Joi.number().min(0).optional(),
    amenities: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid("available", "occupied", "maintenance").optional()
});
