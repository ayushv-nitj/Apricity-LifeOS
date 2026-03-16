/**
 * lib/mailer.ts — Nodemailer email utility using Gmail SMTP
 */
import nodemailer from "nodemailer";

function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // SSL
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD?.replace(/\s/g, ""),
    },
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const transporter = createTransporter();

  const info = await transporter.sendMail({
    from: `"Apricity Life OS" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Reset your Apricity password",
    html: `
      <div style="font-family:monospace;background:#050a14;color:#e2e8f0;padding:32px;border-radius:12px;max-width:480px">
        <h2 style="color:#00f5ff;margin-bottom:8px">Password Reset</h2>
        <p style="color:#94a3b8;margin-bottom:24px">
          Click the button below to reset your password. This link expires in <strong style="color:#fff">1 hour</strong>.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;background:linear-gradient(135deg,#00f5ff,#0080ff);color:#050a14;
                  font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px">
          Reset Password
        </a>
        <p style="color:#475569;font-size:12px;margin-top:24px">
          If you didn't request this, you can safely ignore this email.
        </p>
        <p style="color:#475569;font-size:12px">${resetUrl}</p>
      </div>
    `,
  });

  console.log("Email sent:", info.messageId);
}
