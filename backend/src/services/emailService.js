// backend/src/services/emailService.js
// ─────────────────────────────────────────────────────────────────
// Single canonical email service. Merges:
//   - services/emailService.js (part 02) — good templates, on-brand HTML
//   - utils/emailService.js (part 06)    — DELETE that file, use this one
//
// Configure via .env:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
//
// If not configured, all calls log to console and return { mocked: true }.
// Email failures NEVER throw — they are caught and logged internally.
// ─────────────────────────────────────────────────────────────────

import nodemailer from "nodemailer";

const emailEnabled = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter = null;
if (emailEnabled) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        tls: { rejectUnauthorized: false },
    });
}

export const isEmailEnabled = () => emailEnabled;

const FROM = process.env.SMTP_FROM || '"TAGT Platform" <noreply@tagt.app>';

// Internal send helper — never throws
const send = async (to, subject, html) => {
    if (!transporter) {
        console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
        return { mocked: true };
    }
    try {
        const info = await transporter.sendMail({ from: FROM, to, subject, html });
        console.log(`[EMAIL] Sent: ${subject} → ${to} (${info.messageId})`);
        return info;
    } catch (err) {
        console.error(`[EMAIL] Failed: ${subject} → ${to}:`, err.message);
        return { error: err.message };
    }
};

// ─── Templates ───────────────────────────────────────────────────

export const sendWelcomeEmail = async ({ name, email, tempPassword, propertyName }) => {
    return send(email, `Welcome to ${propertyName || "TAGT"} 🏠`, `
        <div style="font-family:system-ui,sans-serif;max-width:580px;margin:auto;padding:32px;background:#0d1520;color:#fff;border-radius:16px">
            <div style="font-size:24px;font-weight:700;margin-bottom:16px;color:#00d4ff">TAGT</div>
            <h2>Welcome, ${name}!</h2>
            <p style="color:#aaa">Your tenant account at <b>${propertyName || "TAGT"}</b> has been created.</p>
            <div style="background:#0f1a26;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin:20px 0">
                <div style="margin-bottom:8px"><span style="color:#666;font-size:12px">Email:</span><br><b>${email}</b></div>
                ${tempPassword ? `<div><span style="color:#666;font-size:12px">Temporary Password:</span><br><b style="color:#00d4ff;font-size:18px;letter-spacing:0.05em">${tempPassword}</b></div>` : ""}
            </div>
            <p style="color:#aaa">Please change your password on first login at <a href="${process.env.APP_URL || "https://tagt.website"}/login" style="color:#00d4ff">tagt.website</a>.</p>
            <div style="margin-top:24px;font-size:12px;color:#555">TAGT Property Management</div>
        </div>
    `);
};

export const sendPaymentConfirmation = async ({ name, email, amount, month, paidAt, propertyName }) => {
    const dateFmt = new Date(paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    return send(email, `✅ Payment Confirmed – ${month}`, `
        <div style="font-family:system-ui,sans-serif;max-width:580px;margin:auto;padding:32px;background:#0d1520;color:#fff;border-radius:16px">
            <div style="font-size:24px;font-weight:700;margin-bottom:8px;color:#00e676">TAGT</div>
            <h2>Payment received, ${name}!</h2>
            <div style="background:#0f1a1a;border:1px solid rgba(0,230,118,0.2);border-radius:12px;padding:20px;margin:20px 0">
                <div style="font-size:28px;font-weight:700;color:#00e676">₹${Number(amount).toLocaleString("en-IN")}</div>
                <div style="font-size:13px;color:#aaa;margin-top:6px">${month} · Paid on ${dateFmt}</div>
            </div>
            <p style="color:#aaa">Thank you for your payment. This is your digital confirmation for <b>${propertyName || "TAGT"}</b>.</p>
            <div style="margin-top:24px;font-size:12px;color:#555">TAGT Property Management</div>
        </div>
    `);
};

export const sendRentReminder = async ({ name, email, amount, dueDate, month, propertyName }) => {
    const dueFmt = new Date(dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    return send(email, `Rent Reminder – ${month}`, `
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
    return send(email, `⚠ Overdue Rent – ${month}`, `
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