import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

// Debug: confirm email credentials (remove in production)
console.log("Email configuration:", {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD ? "Password is set" : "Password is not set"
});

// Create a transporter using Gmail + App Password
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // must be App Password if using Gmail
    },
    tls: {
        rejectUnauthorized: false, // for dev only, remove in production
    },
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ SMTP configuration error:", error);
    } else {
        console.log("✅ SMTP server is ready to take our messages");
    }
});

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetToken - Password reset token
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.error("❌ Email credentials are not properly configured");
        return false;
    }

    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: `"TNR Steel Help" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "🔑 Reset Your Password - TNR Steel Help",
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); overflow: hidden;">
            
            <!-- Header -->
            <div style="background-color: #0d6efd; padding: 20px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0;">TNR Steel Help</h2>
            </div>
            
            <!-- Body -->
            <div style="padding: 30px; color: #333333;">
              <h3 style="margin-top: 0;">Password Reset Request</h3>
              <p>Hello,</p>
              <p>You recently requested to reset your password. Click the button below to set a new password:</p>
              
              <!-- Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background-color: #0d6efd; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Reset Password
                </a>
              </div>

              <p style="color: #555;">This link will expire in <strong>1 hour</strong>.</p>
              <p>If you did not request this change, you can safely ignore this email.</p>
            </div>
            
            <!-- Footer -->
            <div style="background: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #777;">
              <p>&copy; ${new Date().getFullYear()} TNR Steel Help. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to ${email}`);
        return true;
    } catch (error) {
        console.error("❌ Error sending email:", error);
        return false;
    }
};
