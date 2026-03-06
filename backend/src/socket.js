// backend/src/socket.js
// Initializes Socket.io on the existing http.Server.
// Users join a personal room "user:{userId}" so we can send targeted events.

import { Server } from "socket.io";
import logger from "./utils/logger.js";

let io = null;

const allowedOrigins = [
    "https://tagt.website",
    "https://www.tagt.website",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
];

export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: (origin, cb) => {
                if (!origin) return cb(null, true);
                if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) return cb(null, true);
                return cb(new Error("Socket CORS blocked"));
            },
            credentials: true,
        },
        transports: ["websocket", "polling"],
    });

    io.on("connection", (socket) => {
        // Client sends their userId after connecting (from localStorage / auth context)
        socket.on("user:join", (userId) => {
            if (!userId) return;
            socket.join(`user:${userId}`);
            logger.info(`[Socket] User joined room: user:${userId}`);
        });

        socket.on("disconnect", () => {
            logger.info(`[Socket] Client disconnected: ${socket.id}`);
        });
    });

    logger.info("🔌 Socket.io initialized");
    return io;
}

/** Get the Socket.io instance from anywhere in the app */
export function getIO() {
    if (!io) throw new Error("Socket.io not initialized yet");
    return io;
}

/** Emit a notification event to a specific user's room */
export function emitToUser(userId, event, data) {
    if (!io || !userId) return;
    io.to(`user:${userId}`).emit(event, data);
}
