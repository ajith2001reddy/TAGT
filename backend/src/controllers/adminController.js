import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import Room from "../models/rooms.js";

export const getAllResidents = async (req, res, next) => {
    try {
        const residents = await User.find({ role: "resident" })
            .populate("roomId", "roomNumber totalBeds occupiedBeds")
            .sort({ createdAt: -1 })
            .lean();

        res.json({ success: true, residents });
    } catch (err) {
        next(err);
    }
};

export const addResident = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { name, email, password, roomId } = req.body;

        if (!name || !email || !password) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existing = await User.findOne({ email: normalizedEmail }).session(session);
        if (existing) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        let room = null;
        if (roomId) {
            room = await Room.findById(roomId).session(session);

            if (!room) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: "Invalid room selected"
                });
            }

            if (room.occupiedBeds >= room.totalBeds) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: "No beds available in this room"
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const resident = await User.create(
            [
                {
                    name,
                    email: normalizedEmail,
                    password: hashedPassword,
                    role: "resident",
                    roomId: room ? room._id : null
                }
            ],
            { session }
        );

        if (room) {
            room.occupiedBeds += 1;
            await room.save({ session });
        }

        await session.commitTransaction();

        res.status(201).json({
            success: true,
            resident: resident[0]
        });
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        session.endSession();
    }
};
