// backend/src/controllers/v2/notificationController.js
import Notification from "../../models/Notification.js";

/**
 * GET /v2/notifications
 * Current user's notifications, newest first (limit 50)
 */
export const getNotifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 30 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const [notifications, total] = await Promise.all([
            Notification.find({ userId: req.user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Notification.countDocuments({ userId: req.user._id }),
        ]);

        return res.json({ success: true, data: notifications, total });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /v2/notifications/unread-count
 * Returns unread count integer — used to poll the badge
 */
export const getUnreadCount = async (req, res, next) => {
    try {
        const count = await Notification.countDocuments({ userId: req.user._id, isRead: false });
        return res.json({ success: true, count });
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /v2/notifications/:id/read
 * Mark a single notification as read
 */
export const markRead = async (req, res, next) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { isRead: true }
        );
        return res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /v2/notifications/read-all
 * Mark ALL of current user's notifications as read
 */
export const markAllRead = async (req, res, next) => {
    try {
        await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
        return res.json({ success: true });
    } catch (err) {
        next(err);
    }
};
