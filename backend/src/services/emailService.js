// src/services/emailService.js
import nodemailer from "nodemailer";

const emailEnabled = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter = null;
if (emailEnabled) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
}

const FROM = process.env.SMTP_FROM || "TAGT Platform <noreply@tagt.app>";

const send = async (to, subject, html) => {
    if (!transporter) {
        console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
        return { mocked: true };
    }
    return transporter.sendMail({ from: FROM, to, subject, html });
};

/* ── Templates ──────────────────────────────────── */

export const sendRentReminder = async ({ name, email, amount, dueDate, month, propertyName }) => {
    const dueFmt = new Date(dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    return send(email, `Rent Reminder – ${month}`, `
        <div style="font-family:system-ui,sans-serif;max-width:580px;margin:auto;padding:32px;background:#0d1520;color:#fff;border-radius:16px">
            <div style="font-size:24px;font-weight:700;margin-bottom:8px;color:#00d4ff">TAGT</div>
            <h2 style="margin:0 0 16px">Hi ${name},</h2>
            <p style="color:#aaa">Your rent for <b style="color:#fff">${month}</b> is due soon.</p>
            <div style="background:#0f1a26;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin:20px 0">
                <div style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px">Amount Due</div>
                <div style="font-size:32px;font-weight:700;color:#00d4ff">₹${amount.toLocaleString()}</div>
                <div style="font-size:14px;color:#aaa;margin-top:6px">Due by ${dueFmt}</div>
            </div>
            <p style="color:#aaa">Please pay on time to avoid late fees. Contact your property manager at <b>${propertyName || "TAGT"}</b> for any issues.</p>
            <div style="margin-top:24px;font-size:12px;color:#555">TAGT Property Management</div>
        </div>
    `);
};

export const sendOverdueNotice = async ({ name, email, amount, lateFee, month }) => {
    return send(email, `⚠ Overdue Rent – ${month}`, `
        <div style="font-family:system-ui,sans-serif;max-width:580px;margin:auto;padding:32px;background:#0d1520;color:#fff;border-radius:16px">
            <div style="font-size:24px;font-weight:700;margin-bottom:8px;color:#ff5252">TAGT – Overdue Notice</div>
            <h2 style="margin:0 0 16px">Hi ${name},</h2>
            <p style="color:#aaa">Your rent for <b style="color:#fff">${month}</b> is <b style="color:#ff5252">overdue</b>.</p>
            <div style="background:#1a0f0f;border:1px solid rgba(255,82,82,0.2);border-radius:12px;padding:20px;margin:20px 0">
                <div style="font-size:28px;font-weight:700;color:#ff5252">₹${(amount + (lateFee || 0)).toLocaleString()}</div>
                <div style="font-size:13px;color:#aaa;margin-top:6px">Rent: ₹${amount.toLocaleString()} + Late Fee: ₹${(lateFee || 0).toLocaleString()}</div>
            </div>
            <p style="color:#aaa">Please pay immediately to avoid further penalties.</p>
        </div>
    `);
};

export const sendPaymentConfirmation = async ({ name, email, amount, month, paidAt }) => {
    const dateFmt = new Date(paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    return send(email, `✅ Payment Confirmed – ${month}`, `
        <div style="font-family:system-ui,sans-serif;max-width:580px;margin:auto;padding:32px;background:#0d1520;color:#fff;border-radius:16px">
            <div style="font-size:24px;font-weight:700;margin-bottom:8px;color:#00e676">TAGT</div>
            <h2 style="margin:0 0 16px">Payment received, ${name}!</h2>
            <div style="background:#0f1a1a;border:1px solid rgba(0,230,118,0.2);border-radius:12px;padding:20px;margin:20px 0">
                <div style="font-size:28px;font-weight:700;color:#00e676">₹${amount.toLocaleString()}</div>
                <div style="font-size:13px;color:#aaa;margin-top:6px">${month} · Paid on ${dateFmt}</div>
            </div>
            <p style="color:#aaa">Thank you for your payment. This is your digital confirmation.</p>
        </div>
    `);
};

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
            <p style="color:#aaa">Please change your password on first login.</p>
        </div>
    `);
};

export const isEmailEnabled = () => emailEnabled;
