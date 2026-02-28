
import mongoose from "mongoose";
import User from "../models/User.js";
import Room from "../models/rooms.js";
import admin from "../config/firebase.js";
import { buildPropertyFilter } from "../utils/tenantScope.js";

export const getAllResidents = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const residents = await User.find({
            role: "resident",
            ...scope
        })
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
        const scope = buildPropertyFilter(req.user);
        const existing = await User.findOne({ email: normalizedEmail, ...scope }).session(session);
        if (existing) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }


        let room = null;
        if (roomId) {
            const roomScope = buildPropertyFilter(req.user);
            room = await Room.findById(roomId, ...roomScope).session(session);

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

        // FIXED: Removed manual bcrypt.hash() - let pre-save hook handle it
        const resident = await User.create(
            [
                {
                    name,
                    email: normalizedEmail,
                    password: password, // Plain text - pre-save hook will hash
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