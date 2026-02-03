import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Room from "../models/rooms.js";

/* ============================
   GET ALL RESIDENTS (ADMIN)
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
        console.error("GET RESIDENTS ERROR:", error.message);
        next(error);
    }
};

/* ============================
   ADD NEW RESIDENT (ADMIN)
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

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        let room = null;

        // Validate room & availability
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

        const hashedPassword = await bcrypt.hash(password, 10);

        const resident = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: "resident",
            roomId: room ? room._id : null
        });

        // Increase occupied beds AFTER resident creation
        if (room) {
            room.occupiedBeds += 1;
            await room.save();
        }

        res.status(201).json({
            success: true,
            resident
        });
    } catch (error) {
        console.error("ADD RESIDENT ERROR:", error.message);
        next(error);
    }
};
