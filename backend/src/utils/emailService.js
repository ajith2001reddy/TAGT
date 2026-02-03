import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const FRONTEND_URL = process.env.FRONTEND_URL;

let transporter = null;

if (EMAIL_USER && EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });
}

async function sendEmail(to, subject, html) {
    if (!transporter) return;

    await transporter.sendMail({
        from: `"TAGT Property Management" <${EMAIL_USER}>`,
        to,
        subject,
        html
    });
}

function sendWelcomeEmail(email, name, password) {
    return sendEmail(
        email,
        "Welcome to TAGT - Your Account Details",
        `
        <div style="font-family:Arial,max-width:600px;margin:auto">
            <h2 style="color:#2563eb">Welcome to TAGT</h2>
            <p>Hello ${name},</p>
            <p>Your account has been created.</p>
            <div style="background:#f3f4f6;padding:16px;border-radius:6px">
                <p><b>Email:</b> ${email}</p>
                <p><b>Password:</b> ${password}</p>
            </div>
            <a href="${FRONTEND_URL}"
               style="display:inline-block;margin-top:16px;padding:12px 24px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none">
                Login
            </a>
        </div>
        `
    );
}

function sendStatusUpdateEmail(email, requestMessage, newStatus, adminNote) {
    return sendEmail(
        email,
        "Maintenance Request Update",
        `
        <div style="font-family:Arial,max-width:600px;margin:auto">
            <h2 style="color:#2563eb">Request Update</h2>
            <p><b>Request:</b> ${requestMessage}</p>
            <p><b>Status:</b> ${newStatus}</p>
            <p><b>Note:</b> ${adminNote || "No notes"}</p>
            <a href="${FRONTEND_URL}/resident"
               style="display:inline-block;margin-top:16px;padding:12px 24px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none">
                View Request
            </a>
        </div>
        `
    );
}

function sendPaymentReminder(email, name, amount, dueDate) {
    return sendEmail(
        email,
        "Payment Reminder",
        `
        <div style="font-family:Arial,max-width:600px;margin:auto">
            <h2 style="color:#dc2626">Payment Reminder</h2>
            <p>Hello ${name},</p>
            <p><b>Amount:</b> $${amount}</p>
            <p><b>Due:</b> ${new Date(dueDate).toLocaleDateString()}</p>
            <a href="${FRONTEND_URL}/resident/payments"
               style="display:inline-block;margin-top:16px;padding:12px 24px;background:#dc2626;color:#fff;border-radius:6px;text-decoration:none">
                Pay Now
            </a>
        </div>
        `
    );
}

export {
    sendEmail,
    sendWelcomeEmail,
    sendStatusUpdateEmail,
    sendPaymentReminder
};
