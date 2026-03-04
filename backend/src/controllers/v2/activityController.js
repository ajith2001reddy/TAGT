// src/controllers/v2/activityController.js
import ActivityLog from "../../models/ActivityLog.js";
import { buildPropertyFilter } from "../../utils/tenantScope.js";
import eventBus from "../../utils/eventBus.js";

/* ─────────────────────────────────────────────────
   Middleware: log an action to ActivityLog
   Usage: router.post("/path", auth, logActivity("ACTION_NAME"), controller)
───────────────────────────────────────────────── */
export const logActivity = (action) => async (req, res, next) => {
    try {
        if (req.user?._id) {
            const log = await ActivityLog.create({
                action,
                performedBy: req.user._id,
                role: req.user.role,
                propertyId: req.user.propertyId || null,
                ipAddress: req.ip || req.headers["x-forwarded-for"] || "unknown",
                route: `${req.method} ${req.originalUrl}`,
            }).catch(() => { }); // fire-and-forget, never block the request

            if (log) {
                eventBus.publish("activity.logged", { action, userId: req.user._id });
            }
        }
    } catch { }
    next();
};

/* ─────────────────────────────────────────────────
   GET /v2/admin/activity-logs
   Super admin: paginated, filterable activity log
───────────────────────────────────────────────── */
export const listActivityLogs = async (req, res, next) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Number(req.query.limit) || 50);
        const skip = (page - 1) * limit;
        const match = {};
        if (req.query.role) match.role = req.query.role;
        if (req.query.action) match.action = { $regex: req.query.action, $options: "i" };

        const [logs, total] = await Promise.all([
            ActivityLog.find(match).populate("performedBy", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            ActivityLog.countDocuments(match),
        ]);

        return res.json({ success: true, data: logs, pagination: { page, limit, total } });
    } catch (err) { next(err); }
};

/* ─────────────────────────────────────────────────
   GET /v2/owner/activity-logs
   Owner: their own recent actions
───────────────────────────────────────────────── */
export const myActivityLogs = async (req, res, next) => {
    try {
        const logs = await ActivityLog.find({ performedBy: req.user._id }).sort({ createdAt: -1 }).limit(50).lean();
        return res.json({ success: true, data: logs });
    } catch (err) { next(err); }
};
