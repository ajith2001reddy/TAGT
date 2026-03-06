// backend/src/services/notificationService.js
// Create a DB notification and push it live via Socket.io.
// Always fire-and-forget — never blocks a request.

import Notification from "../models/Notification.js";
import { emitToUser } from "../socket.js";
import logger from "../utils/logger.js";

/**
 * Create a notification and emit it live to the user's socket room.
 *
 * @param {object} opts
 * @param {string} opts.userId    - Recipient user _id
 * @param {string} [opts.role]    - recipient role (for logging)
 * @param {string} opts.title     - short title
 * @param {string} opts.message   - longer description
 * @param {string} [opts.type]    - payment | maintenance | support | system | resident
 * @param {string} [opts.link]    - optional deep-link URL
 */
export async function createNotification({ userId, role, title, message, type = "system", link = null }) {
    try {
        const notification = await Notification.create({ userId, role, title, message, type, link });

        // Push live to the user via Socket.io
        emitToUser(userId.toString(), "notification:new", {
            _id: notification._id,
            title,
            message,
            type,
            link,
            isRead: false,
            createdAt: notification.createdAt,
        });

        return notification;
    } catch (err) {
        logger.error("[Notification] Failed to create", { userId, error: err.message });
    }
}
