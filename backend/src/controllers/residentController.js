import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Room from "../models/rooms.js";
import { logger } from "../utils/logger.js"; // Assuming a logger utility like winston is set up

/* ============================
   GET ALL RESIDENTS
============================ */
export const getAllResidents = async (req, res, next) => {
    try {
        const residents = await User.find({ role: "resident" })
            .populate("roomId", "roomNumber totalBeds occupiedBeds")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            residents
        });
    } catch (error) {
        logger.error("GET RESIDENTS ERROR:", error.message);
        next(error);
    }
};

/* ============================
   ADD NEW RESIDENT
============================ */
export const addResident = async (req, res, next) => {
    try {
        const { name, email, password, roomId } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check for existing email
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        // Room validation before creation
        let room = null;
        if (roomId) {
            room = await Room.findById(roomId);
            if (!room) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid room selected"
                });
            }

            if (room.occupiedBeds >= room.totalBeds) {
                return res.status(400).json({
                    success: false,
                    message: "No beds available in this room"
                });
            }
        }

        // Hashing password using User model pre-save hook
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create resident
        const resident = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: "resident",
            roomId: room ? room._id : null
        });

        // Update room occupancy after resident creation
        if (room) {
            room.occupiedBeds += 1;
            await room.save();
        }

        logger.info(`Resident added: ${name}, Room: ${room ? room.roomNumber : 'None'}`);
        res.status(201).json({
            success: true,
            resident
        });
    } catch (error) {
        logger.error("ADD RESIDENT ERROR:", error.message);
        next(error);
    }
};

/* ============================
   DELETE RESIDENT
============================ */
export const deleteResident = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find resident
        const resident = await User.findById(id);
        if (!resident) {
            return res.status(404).json({
                success: false,
                message: "Resident not found"
            });
        }

        // Update room occupancy
        const room = await Room.findById(resident.roomId);
        if (room) {
            room.occupiedBeds -= 1;
            await room.save();
        }

        // Delete resident
        await resident.deleteOne();

        logger.info(`Resident deleted: ${resident.name}`);
        res.json({
            success: true,
            message: "Resident deleted successfully"
        });
    } catch (error) {
        logger.error("DELETE RESIDENT ERROR:", error.message);
        next(error);
    }
};
