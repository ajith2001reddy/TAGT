const nodemailer = require("nodemailer");

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email service disabled: missing EMAIL_USER or EMAIL_PASS");
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // App password, not Gmail password
    }
});

/**
 * Core email sender
 */
async function sendEmail(to, subject, html) {
    if (!process.env.EMAIL_USER) {
        console.warn("Email not sent (EMAIL_USER not configured)");
        return;
    }

    try {
        await transporter.sendMail({
            from: `"TAGT Property Management" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });

        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error("Email error:", error.message);
    }
}

/* ============================
   EMAIL TEMPLATES
   ============================ */

function sendWelcomeEmail(email, name, password) {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to TAGT Property Management</h2>
            <p>Hello ${name},</p>
            <p>Your resident account has been created successfully.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Password:</strong> ${password}</p>
            </div>
            <p>
                <a href="${process.env.FRONTEND_URL}" 
                   style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                   Login to Dashboard
                </a>
            </p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                Please change your password after first login.
            </p>
        </div>
    `;

    return sendEmail(email, "Welcome to TAGT - Your Account Details", html);
}

function sendStatusUpdateEmail(email, requestMessage, newStatus, adminNote) {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Maintenance Request Update</h2>
            <p>Your maintenance request has been updated:</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Request:</strong> ${requestMessage}</p>
                <p><strong>New Status:</strong> <strong>${newStatus}</strong></p>
                <p><strong>Admin Note:</strong> ${adminNote || "No additional notes"}</p>
            </div>
            <p>
                <a href="${process.env.FRONTEND_URL}/resident"
                   style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                   View Request
                </a>
            </p>
        </div>
    `;

    return sendEmail(email, "TAGT: Maintenance Request Status Update", html);
}

function sendPaymentReminder(email, name, amount, dueDate) {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Payment Reminder</h2>
            <p>Hello ${name},</p>
            <p>This is a friendly reminder that your payment is due soon:</p>
            <div style="background: #fef2f2; border: 2px solid #dc2626; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="font-size: 24px; font-weight: bold; color: #dc2626; margin: 0;">
                    $${amount}
                </p>
                <p style="color: #6b7280; margin: 5px 0;">
                    Due Date: ${new Date(dueDate).toLocaleDateString()}
                </p>
            </div>
            <p>
                <a href="${process.env.FRONTEND_URL}/resident/payments"
                   style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                   Pay Now
                </a>
            </p>
        </div>
    `;

    return sendEmail(email, "TAGT: Payment Reminder", html);
}

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendStatusUpdateEmail,
    sendPaymentReminder
};
