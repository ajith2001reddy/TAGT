import Notice from "../../models/Notice.js";
import User from "../../models/User.js";
import { sendNoticeEmail } from "../../services/emailService.js";
import { createNotification } from "../../services/notificationService.js";
import { buildPropertyFilter } from "../../utils/tenantScope.js";
import logger from "../../utils/logger.js";

/**
 * Owner: Create a new Broadcast Notice
 */
export const createNotice = async (req, res, next) => {
    try {
        const { propertyId, title, message, priority } = req.body;

        if (!propertyId || !title || !message) {
            return res.status(400).json({ success: false, message: "propertyId, title, and message are required" });
        }

        // Verify ownership access via scope
        const scope = buildPropertyFilter(req.user);
        if (req.user.role !== "super_admin" && scope.propertyId && scope.propertyId.toString() !== propertyId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized property access" });
        }

        // Find all active residents in this property
        const residents = await User.find({
            role: "resident",
            propertyId,
            isActive: true
        }).populate("propertyId", "name");

        const audienceCount = residents.length;

        // Save the Notice record to history
        const notice = await Notice.create({
            propertyId,
            authorId: req.user._id,
            title,
            message,
            priority: priority || "info",
            audienceCount
        });

        // Fire-and-forget: dispatch emails and in-app notifications
        if (audienceCount > 0) {
            // Run in background to not block the HTTP response
            Promise.resolve().then(async () => {
                let emailsSent = 0;
                let notificationsSent = 0;

                for (const resident of residents) {
                    try {
                        // 1. Send Email
                        if (resident.email) {
                            await sendNoticeEmail({
                                name: resident.name,
                                email: resident.email,
                                title,
                                message,
                                propertyName: resident.propertyId?.name
                            });
                            emailsSent++;
                        }

                        // 2. Create In-App Notification
                        await createNotification({
                            userId: resident._id,
                            role: "resident",
                            title: `Announcement: ${title}`,
                            message: "A new announcement was posted by your property manager.",
                            type: "info",
                            link: "/resident"
                        });
                        notificationsSent++;

                    } catch (err) {
                        logger.error("[Notice] Failed to dispatch to resident", { residentId: resident._id, error: err.message });
                    }
                }

                logger.info(`[Notice] Broadcast complete`, {
                    noticeId: notice._id,
                    targetAudience: audienceCount,
                    emailsSent,
                    notificationsSent
                });
            });
        }

        return res.status(201).json({ success: true, data: notice });
    } catch (err) {
        next(err);
    }
};

/**
 * All roles: List notices for a property
 */
export const listNotices = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const { limit = 20 } = req.query;

        // Residents can only see notices for their own property
        // Owners can see notices for their owned properties via scope
        const filter = { ...scope };

        // If Owner requests a specific property, apply it (as long as it satisfies scope)
        if (req.query.propertyId) {
            filter.propertyId = req.query.propertyId;
        }

        const notices = await Notice.find(filter)
            .populate("authorId", "name role")
            .populate("propertyId", "name")
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .lean();

        return res.json({ success: true, data: notices });
    } catch (err) {
        next(err);
    }
};
