// backend/src/socket.js
// Initializes Socket.io on the existing http.Server.
// Users join a personal room "user:{userId}" so we can send targeted events.

import { Server } from "socket.io";
import admin from "firebase-admin";
import logger from "./utils/logger.js";

let io = null;

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : [
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
        // Client sends their firebase token after connecting
        socket.on("user:join", async (token) => {
            if (!token) {
                logger.warn(`[Socket] No token provided for socket ${socket.id}`);
                return;
            }
            try {
                // Log token prefix/suffix for debugging (SECURE: don't log full token)
                const tokenSnippet = `${token.substring(0, 10)}...${token.slice(-10)}`;
                logger.info(`[Socket] Verifying token for socket ${socket.id}: ${tokenSnippet}`);

                const decoded = await admin.auth().verifyIdToken(token);
                const userId = decoded.uid; // Firebase UID
                socket.join(`user:${userId}`);
                logger.info(`[Socket] Authenticated user joined room: user:${userId}`);
            } catch (err) {
                logger.warn(`[Socket] Auth failed for socket ${socket.id}: ${err.message}`);
                socket.emit("error", "Authentication failed");
            }
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
