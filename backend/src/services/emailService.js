// backend/src/services/emailService.js
// ─────────────────────────────────────────────────────────────────
// Single canonical email service. Supports:
//   - BREVO API (Primary for Production) -> Requires BREVO_API_KEY
//   - SMTP (Fallback for Local Dev)      -> SMTP_HOST, USER, PASS
//
// Configure via Railway/Env:
//   BREVO_API_KEY, SMTP_FROM_EMAIL
// ─────────────────────────────────────────────────────────────────

import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

// ─── Environment Details ──────────────────────────────────────────
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const isBrevoEnabled = !!BREVO_API_KEY;

// Fallback SMTP (if needed)
const emailEnabled = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const provider = process.env.EMAIL_PROVIDER || (isBrevoEnabled ? "BREVO" : "SMTP");

// "TAGT Platform" <support@tagt.website>
const FROM_NAME = "TAGT Platform";
const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || "support@tagt.website";
const FROM = process.env.SMTP_FROM || `"${FROM_NAME}" <${FROM_EMAIL}>`;

// ─── Legacy SMTP Setup (Keep for local dev if chosen) ──────────────
let transporter = null;
if (provider === "SMTP" && emailEnabled) {
    logger.info(`[SMTP INIT] Attempting connection to ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        tls: { rejectUnauthorized: false },
        family: 4
    });
}

// ─── Internal Send Helper ──────────────────────────────────────────
const send = async (to, subject, html, attachments = []) => {
    // 1️⃣ BREVO API (RECOMMENDED FOR CLOUD)
    if (provider === "BREVO") {
        if (!BREVO_API_KEY) {
            logger.info(`[BREVO MOCK] To: ${to} | Subject: ${subject}`);
            return { mocked: true };
        }

        try {
            const body = {
                sender: { name: FROM_NAME, email: FROM_EMAIL },
                to: [{ email: to }],
                subject: subject,
                htmlContent: html,
            };

            // Handle Attachments (Brevo expects base64)
            if (attachments.length > 0) {
                body.attachment = attachments.map(att => ({
                    name: att.filename,
                    content: typeof att.content === "string" ? att.content : att.content.toString("base64")
                }));
            }

            const response = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                    "api-key": BREVO_API_KEY,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(body)
            });

            const result = await response.json();

            if (response.ok) {
                logger.info(`[BREVO] Sent: ${subject}`, { to, messageId: result.messageId });
                return { success: true, messageId: result.messageId };
            } else {
                const errorDetail = result.message || JSON.stringify(result);
                logger.error(`[BREVO] Failed: ${subject} - Reason: ${errorDetail}`, { to });
                return { error: errorDetail };
            }
        } catch (err) {
            logger.error(`[BREVO] Network Error: ${subject} `, { to, error: err.message });
            return { error: err.message };
        }
    }

    // 2️⃣ LEGACY SMTP
    if (!transporter) {
        logger.info(`[EMAIL MOCK]To: ${to} | Subject: ${subject} `);
        return { mocked: true };
    }

    try {
        const info = await transporter.sendMail({ from: FROM, to, subject, html, attachments });
        logger.info(`[EMAIL] Sent: ${subject} `, { to, messageId: info.messageId });
        return info;
    } catch (err) {
        logger.error(`[EMAIL] Failed: ${subject} `, { to, error: err.message });
        return { error: err.message };
    }
};

// ─── Templates ───────────────────────────────────────────────────

export const sendWelcomeEmail = async ({ name, email, tempPassword, resetLink, propertyName }) => {
    return send(email, `Welcome to ${propertyName || "TAGT"} 🏠`, `
        <div style="font-family:system-ui,sans-serif;max-width:580px;margin:auto;padding:32px;background:#0d1520;color:#fff;border-radius:16px">
            <div style="font-size:24px;font-weight:700;margin-bottom:16px;color:#00d4ff">TAGT</div>
            <h2>Welcome, ${name}!</h2>
            <p style="color:#aaa">Your account at <b>${propertyName || "TAGT"}</b> has been created.</p>
            <div style="background:#0f1a26;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin:20px 0">
                <div style="margin-bottom:8px"><span style="color:#666;font-size:12px">Email:</span><br><b>${email}</b></div>
                ${tempPassword ? `<div><span style="color:#666;font-size:12px">Temporary Password:</span><br><b style="color:#00d4ff;font-size:18px;letter-spacing:0.05em">${tempPassword}</b></div>` : ""}
                ${resetLink ? `<div style="margin-top:16px"><a href="${resetLink}" style="background:#00d4ff;color:#000;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;display:inline-block">Set Your Password</a></div>` : ""}
            </div>
            ${!resetLink ? `<p style="color:#aaa">Please change your password on first login at <a href="${process.env.APP_URL || "https://tagt.website"}/login" style="color:#00d4ff">tagt.website</a>.</p>` : ""}
            <div style="margin-top:24px;font-size:12px;color:#555">TAGT Property Management</div>
        </div>
    `);
};

export const sendOwnerInvite = async ({ name, email, resetLink }) => {
    return send(email, `Invitation to join TAGT as Owner 🏠`, `
    <div style="font-family:system-ui,sans-serif;max-width:580px;margin:auto;padding:32px;background:#0d1520;color:#fff;border-radius:16px">
            <div style="font-size:24px;font-weight:700;margin-bottom:16px;color:#00d4ff">TAGT</div>
            <h2>Namaste ${name},</h2>
            <p style="color:#aaa">You have been invited to join the TAGT Platform as a <b>Property Owner</b>.</p>
            <p style="color:#aaa">With TAGT, you can manage your properties, tracking residents, and rent collections seamlessly.</p>
            <div style="background:#0f1a26;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin:24px 0;text-align:center">
                <p style="color:#fff;margin-bottom:20px">Please click the button below to set up your password and access your dashboard.</p>
                <a href="${resetLink}" style="background:#00d4ff;color:#000;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;display:inline-block;box-shadow:0 4px 14px rgba(0,212,255,0.3)">Set Up My Account</a>
            </div>
            <p style="color:#555;font-size:13px">If you didn't expect this invitation, you can safely ignore this email.</p>
            <div style="margin-top:32px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.05);font-size:12px;color:#555">TAGT Platform · Smart Property Management</div>
        </div>
    `);
};


export const sendPaymentConfirmation = async ({ name, email, amount, month, paidAt, paymentId, pdfBuffer }) => {
    const dateFmt = new Date(paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const template = `
    <div style="font-family:system-ui,sans-serif;max-width:580px;margin:auto;padding:32px;background:#0d1520;color:#fff;border-radius:16px">
            <div style="font-size:24px;font-weight:700;margin-bottom:8px;color:#00e676">TAGT</div>
            <h2>Payment received, ${name}!</h2>
            <div style="background:#0f1a1a;border:1px solid rgba(0,230,118,0.2);border-radius:12px;padding:20px;margin:20px 0">
                <div style="font-size:28px;font-weight:700;color:#00e676">₹${Number(amount).toLocaleString("en-IN")}</div>
                <div style="font-size:13px;color:#aaa;margin-top:6px">${month} · Paid on ${dateFmt}</div>
            </div>
            <p style="color:#aaa">Thank you for your payment. A PDF breakdown of this receipt has been attached to this email for your records.</p>
            <div style="margin-top:24px;font-size:12px;color:#555">TAGT Property Management</div>
        </div>
    `;

    const attachments = pdfBuffer ? [{
        filename: `receipt - ${paymentId}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf"
    }] : [];

    return send(email, `✅ Payment Confirmed – ${month} `, template, attachments);
};

export const sendRentReminder = async ({ name, email, amount, dueDate, month, propertyName }) => {
    const dueFmt = new Date(dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    return send(email, `Rent Reminder – ${month} `, `
    <div style="font-family:system-ui,sans-serif;max-width:580px;margin:auto;padding:32px;background:#0d1520;color:#fff;border-radius:16px">
            <div style="font-size:24px;font-weight:700;margin-bottom:8px;color:#00d4ff">TAGT</div>
            <h2>Hi ${name},</h2>
            <p style="color:#aaa">Your rent for <b style="color:#fff">${month}</b> is due soon.</p>
            <div style="background:#0f1a26;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin:20px 0">
                <div style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px">Amount Due</div>
                <div style="font-size:32px;font-weight:700;color:#00d4ff">₹${Number(amount).toLocaleString("en-IN")}</div>
                <div style="font-size:14px;color:#aaa;margin-top:6px">Due by ${dueFmt}</div>
            </div>
            <p style="color:#aaa">Please pay on time to avoid late fees. Contact your property manager at <b>${propertyName || "TAGT"}</b> for any issues.</p>
            <div style="margin-top:24px;font-size:12px;color:#555">TAGT Property Management</div>
        </div>
    `);
};

export const sendOverdueNotice = async ({ name, email, amount, lateFee, month }) => {
    const total = Number(amount) + Number(lateFee || 0);
    return send(email, `⚠ Overdue Rent – ${month} `, `
    <div style="font-family:system-ui,sans-serif;max-width:580px;margin:auto;padding:32px;background:#0d1520;color:#fff;border-radius:16px">
            <div style="font-size:24px;font-weight:700;margin-bottom:8px;color:#ff5252">TAGT – Overdue Notice</div>
            <h2>Hi ${name},</h2>
            <p style="color:#aaa">Your rent for <b style="color:#fff">${month}</b> is <b style="color:#ff5252">overdue</b>.</p>
            <div style="background:#1a0f0f;border:1px solid rgba(255,82,82,0.2);border-radius:12px;padding:20px;margin:20px 0">
                <div style="font-size:28px;font-weight:700;color:#ff5252">₹${total.toLocaleString("en-IN")}</div>
                <div style="font-size:13px;color:#aaa;margin-top:6px">Rent: ₹${Number(amount).toLocaleString("en-IN")} + Late Fee: ₹${Number(lateFee || 0).toLocaleString("en-IN")}</div>
            </div>
            <p style="color:#aaa">Please pay immediately to avoid further penalties.</p>
            <div style="margin-top:24px;font-size:12px;color:#555">TAGT Property Management</div>
        </div>
    `);
};

// Alias used by stripeController and scheduler
export const sendPaymentReminder = sendRentReminder;

// ─── Broadcast Notices ────────────────────────────────────────────

export const sendNoticeEmail = async ({ name, email, title, message, propertyName }) => {
    return send(email, `📢 Important Update: ${title} `, `
    <div style="font-family:system-ui,sans-serif;max-width:580px;margin:auto;padding:32px;background:#0d1520;color:#fff;border-radius:16px">
            <div style="font-size:24px;font-weight:700;margin-bottom:8px;color:#00d4ff">TAGT Notice Board</div>
            <h2>Hi ${name},</h2>
            <p style="color:#aaa">The property manager for <b style="color:#fff">${propertyName || "your building"}</b> has posted a new announcement.</p>
            <div style="background:#0f1a26;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin:24px 0">
                <div style="font-size:18px;font-weight:700;margin-bottom:12px;color:#fff">${title}</div>
                <div style="color:#ccc;line-height:1.6;font-size:15px;white-space:pre-wrap;">${message}</div>
            </div>
            <p style="color:#aaa;font-size:13px">You can view this and other announcements on your TAGT Resident Dashboard.</p>
            <div style="margin-top:24px;font-size:12px;color:#555">TAGT Platform · Smart Property Management</div>
        </div>
    `);
};

// ─── Support Ticket Emails ────────────────────────────────────────

export const sendTicketCreatedEmail = async ({ name, email, ticketId, title, category }) => {
    return send(email, `🎫 Support Ticket Opened – ${title} `, `
    <div style="font-family:system-ui,sans-serif;max-width:580px;margin:auto;padding:32px;background:#0d1520;color:#fff;border-radius:16px">
            <div style="font-size:24px;font-weight:700;margin-bottom:8px;color:#00d4ff">TAGT Support</div>
            <h2>Hi ${name}, we received your request.</h2>
            <p style="color:#aaa">Your support ticket has been created and our team will respond shortly.</p>
            <div style="background:#0f1a26;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin:20px 0">
                <div style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px">Ticket ID</div>
                <div style="font-size:14px;color:#00d4ff;font-family:monospace">#${ticketId.slice(-8).toUpperCase()}</div>
                <div style="margin-top:12px;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.1em">Subject</div>
                <div style="font-weight:600">${title}</div>
                <div style="margin-top:8px;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.1em">Category</div>
                <div style="color:#aaa">${category.replace(/_/g, " ")}</div>
            </div>
            <p style="color:#aaa;font-size:13px">You can track your ticket status by logging into your TAGT dashboard.</p>
            <div style="margin-top:24px;font-size:12px;color:#555">TAGT Platform · Smart Property Management</div>
        </div>
    `);
};

export const sendTicketReplyEmail = async ({ name, email, ticketId, title, repliedBy, message }) => {
    return send(email, `💬 New Reply on Your Ticket – ${title} `, `
    <div style="font-family:system-ui,sans-serif;max-width:580px;margin:auto;padding:32px;background:#0d1520;color:#fff;border-radius:16px">
            <div style="font-size:24px;font-weight:700;margin-bottom:8px;color:#00d4ff">TAGT Support</div>
            <h2>Hi ${name}, you have a new reply.</h2>
            <p style="color:#aaa"><b style="color:#fff">${repliedBy}</b> has replied to your support ticket.</p>
            <div style="background:#0f1a26;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin:20px 0">
                <div style="font-size:12px;color:#666;margin-bottom:4px">Ticket #${ticketId.slice(-8).toUpperCase()}</div>
                <div style="font-weight:600;margin-bottom:12px">${title}</div>
                <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;color:#ccc;font-style:italic">"${message}"</div>
            </div>
            <p style="color:#aaa;font-size:13px">Log into your TAGT dashboard to reply or view the full conversation.</p>
            <div style="margin-top:24px;font-size:12px;color:#555">TAGT Platform · Smart Property Management</div>
        </div>
    `);
};

export const sendTicketResolvedEmail = async ({ name, email, ticketId, title }) => {
    return send(email, `✅ Support Ticket Resolved – ${title} `, `
    <div style="font-family:system-ui,sans-serif;max-width:580px;margin:auto;padding:32px;background:#0d1520;color:#fff;border-radius:16px">
            <div style="font-size:24px;font-weight:700;margin-bottom:8px;color:#00e676">TAGT Support</div>
            <h2>Hi ${name}, your ticket has been resolved.</h2>
            <p style="color:#aaa">Our support team has marked your ticket as resolved.</p>
            <div style="background:#0f1a1a;border:1px solid rgba(0,230,118,0.2);border-radius:12px;padding:20px;margin:20px 0">
                <div style="font-size:12px;color:#666;margin-bottom:4px">Ticket #${ticketId.slice(-8).toUpperCase()}</div>
                <div style="font-weight:600">${title}</div>
                <div style="margin-top:12px;display:inline-block;background:rgba(0,230,118,0.15);color:#00e676;padding:4px 12px;border-radius:999px;font-size:13px">✓ Resolved</div>
            </div>
            <p style="color:#aaa;font-size:13px">If you still need help, you can open a new ticket from your TAGT dashboard.</p>
            <div style="margin-top:24px;font-size:12px;color:#555">TAGT Platform · Smart Property Management</div>
        </div>
    `);
};
