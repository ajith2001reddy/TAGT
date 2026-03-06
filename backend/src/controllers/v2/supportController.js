// backend/src/controllers/v2/supportController.js
import SupportTicket from "../../models/SupportTicket.js";
import SupportMessage from "../../models/SupportMessage.js";
import User from "../../models/User.js";
import { sendTicketCreatedEmail, sendTicketReplyEmail, sendTicketResolvedEmail } from "../../services/emailService.js";
import { createNotification } from "../../services/notificationService.js";
import logger from "../../utils/logger.js";

/* ─────────────────────────────────────────────────
   POST /v2/support/tickets
   Resident / Owner: create a new support ticket
───────────────────────────────────────────────── */
export const createTicket = async (req, res, next) => {
    try {
        const { title, category, priority, message } = req.body;

        if (!title || !category || !message) {
            return res.status(400).json({ success: false, message: "title, category and message are required" });
        }

        const ticket = await SupportTicket.create({
            userId: req.user._id,
            role: req.user.role,
            propertyId: req.user.propertyId || null,
            title,
            category,
            priority: priority || "medium",
            message,
            status: "open",
        });

        // Seed first message from the ticket body so thread is pre-populated
        await SupportMessage.create({
            ticketId: ticket._id,
            senderId: req.user._id,
            senderRole: req.user.role,
            message,
            isInternal: false,
        });

        // Fire-and-forget email
        sendTicketCreatedEmail({
            name: req.user.name,
            email: req.user.email,
            ticketId: ticket._id.toString(),
            title,
            category,
        }).catch(() => { });

        logger.info("[Support] Ticket created", { ticketId: ticket._id, userId: req.user._id });
        return res.status(201).json({ success: true, data: ticket });
    } catch (err) {
        next(err);
    }
};

/* ─────────────────────────────────────────────────
   GET /v2/support/tickets
   Resident / Owner: their own tickets
───────────────────────────────────────────────── */
export const listMyTickets = async (req, res, next) => {
    try {
        const { status, category } = req.query;
        const filter = { userId: req.user._id };
        if (status) filter.status = status;
        if (category) filter.category = category;

        const tickets = await SupportTicket.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        return res.json({ success: true, data: tickets });
    } catch (err) {
        next(err);
    }
};

/* ─────────────────────────────────────────────────
   GET /v2/support/tickets/all
   Super Admin: all tickets, filterable
───────────────────────────────────────────────── */
export const listAllTickets = async (req, res, next) => {
    try {
        const { status, category, priority, role, propertyId, page = 1, limit = 50 } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (priority) filter.priority = priority;
        if (role) filter.role = role;
        if (propertyId) filter.propertyId = propertyId;

        const skip = (Number(page) - 1) * Number(limit);

        const [tickets, total] = await Promise.all([
            SupportTicket.find(filter)
                .populate("userId", "name email")
                .populate("propertyId", "name city")
                .populate("resolvedBy", "name email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            SupportTicket.countDocuments(filter),
        ]);

        // Ticket counter by status for dashboard cards
        const [openCount, inProgressCount, resolvedCount] = await Promise.all([
            SupportTicket.countDocuments({ status: "open" }),
            SupportTicket.countDocuments({ status: "in_progress" }),
            SupportTicket.countDocuments({ status: "resolved" }),
        ]);

        return res.json({
            success: true,
            data: tickets,
            summary: { open: openCount, in_progress: inProgressCount, resolved: resolvedCount },
            pagination: { page: Number(page), limit: Number(limit), total },
        });
    } catch (err) {
        next(err);
    }
};

/* ─────────────────────────────────────────────────
   GET /v2/support/tickets/:id
   All parties: single ticket + messages
───────────────────────────────────────────────── */
export const getTicket = async (req, res, next) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id)
            .populate("userId", "name email")
            .populate("propertyId", "name city")
            .populate("resolvedBy", "name email")
            .lean();

        if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

        // Authorization: owner/resident can only see their own tickets
        if (req.user.role !== "super_admin" && ticket.userId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        // Fetch messages (non-admin users don't see internal notes)
        const msgFilter = { ticketId: ticket._id };
        if (req.user.role !== "super_admin") msgFilter.isInternal = false;

        const messages = await SupportMessage.find(msgFilter)
            .populate("senderId", "name role")
            .sort({ createdAt: 1 })
            .lean();

        return res.json({ success: true, data: { ticket, messages } });
    } catch (err) {
        next(err);
    }
};

/* ─────────────────────────────────────────────────
   POST /v2/support/tickets/:id/reply
   All parties: add a message to the thread
───────────────────────────────────────────────── */
export const replyToTicket = async (req, res, next) => {
    try {
        const { message } = req.body;
        if (!message?.trim()) return res.status(400).json({ success: false, message: "message is required" });

        const ticket = await SupportTicket.findById(req.params.id).populate("userId", "name email").lean();
        if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

        // Authorization
        if (req.user.role !== "super_admin" && ticket.userId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const msg = await SupportMessage.create({
            ticketId: ticket._id,
            senderId: req.user._id,
            senderRole: req.user.role,
            message,
            isInternal: false,
        });

        // Auto-move to in_progress when admin first replies
        if (req.user.role === "super_admin" && ticket.status === "open") {
            await SupportTicket.findByIdAndUpdate(ticket._id, { status: "in_progress" });
        }

        // Notify ticket owner
        sendTicketReplyEmail({
            name: ticket.userId.name,
            email: ticket.userId.email,
            ticketId: ticket._id.toString(),
            title: ticket.title,
            repliedBy: req.user.role === "super_admin" ? "Support Team" : req.user.name,
            message,
        }).catch(() => { });

        // Live notification to ticket owner
        createNotification({
            userId: ticket.userId._id,
            role: ticket.userId.role,
            title: `New reply on: ${ticket.title}`,
            message: req.user.role === "super_admin" ? "Support team replied to your ticket" : `${req.user.name} added a reply`,
            type: "support",
            link: `/support`,
        }).catch(() => { });

        return res.status(201).json({ success: true, data: msg });
    } catch (err) {
        next(err);
    }
};

/* ─────────────────────────────────────────────────
   PATCH /v2/support/tickets/:id/status
   Super Admin: update ticket status
───────────────────────────────────────────────── */
export const updateTicketStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!["open", "in_progress", "resolved"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const update = { status };
        if (status === "resolved") {
            update.resolvedBy = req.user._id;
            update.resolvedAt = new Date();
        }

        const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, update, { new: true })
            .populate("userId", "name email")
            .lean();

        if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

        // Send resolved email + notification
        if (status === "resolved") {
            sendTicketResolvedEmail({
                name: ticket.userId.name,
                email: ticket.userId.email,
                ticketId: ticket._id.toString(),
                title: ticket.title,
            }).catch(() => { });
            createNotification({
                userId: ticket.userId._id,
                role: ticket.userId.role,
                title: `Ticket resolved: ${ticket.title}`,
                message: "Your support ticket has been marked as resolved.",
                type: "support",
                link: `/support`,
            }).catch(() => { });
        }

        logger.info("[Support] Ticket status updated", { ticketId: ticket._id, status });
        return res.json({ success: true, data: ticket });
    } catch (err) {
        next(err);
    }
};

/* ─────────────────────────────────────────────────
   POST /v2/support/tickets/:id/note
   Super Admin: add internal note (not visible to user)
───────────────────────────────────────────────── */
export const addInternalNote = async (req, res, next) => {
    try {
        const { note } = req.body;
        if (!note?.trim()) return res.status(400).json({ success: false, message: "note is required" });

        const ticket = await SupportTicket.findByIdAndUpdate(
            req.params.id,
            { $push: { internalNotes: { note, addedBy: req.user._id, addedAt: new Date() } } },
            { new: true }
        )
            .populate("internalNotes.addedBy", "name")
            .lean();

        if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

        return res.json({ success: true, data: ticket.internalNotes });
    } catch (err) {
        next(err);
    }
};
