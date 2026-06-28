import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

type SendPasswordResetEmailInput = {
  to: string;
  name?: string | null;
  resetUrl: string;
};

function getEmailFrom() {
  return (
    process.env.SMTP_FROM?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    "Signal Forex <no-reply@forex-resignal.vercel.app>"
  );
}

function parseSmtpPort() {
  const rawPort = process.env.SMTP_PORT?.trim();
  const port = rawPort ? Number(rawPort) : 587;

  return Number.isInteger(port) && port > 0 ? port : 587;
}

function parseSmtpSecure(port: number) {
  const rawSecure = process.env.SMTP_SECURE?.trim().toLowerCase();

  if (rawSecure === "true") {
    return true;
  }

  if (rawSecure === "false") {
    return false;
  }

  return port === 465;
}

function getSmtpConfig(): SMTPTransport.Options | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !user || !pass) {
    return null;
  }

  const port = parseSmtpPort();

  return {
    host,
    port,
    secure: parseSmtpSecure(port),
    auth: {
      user,
      pass,
    },
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  const smtpConfig = getSmtpConfig();

  if (!smtpConfig) {
    console.warn(
      `Password reset email was not sent because SMTP is not configured. Reset link: ${text}`
    );

    return;
  }

  const transporter = nodemailer.createTransport(smtpConfig);

  await transporter.sendMail({
    from: getEmailFrom(),
    to,
    subject,
    html,
    text,
  });
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: SendPasswordResetEmailInput) {
  const safeName = escapeHtml(name?.trim() || "there");
  const safeResetUrl = escapeHtml(resetUrl);
  const subject = "Reset your Signal Forex password";

  await sendEmail({
    to,
    subject,
    text: [
      `Hi ${name?.trim() || "there"},`,
      "",
      "Use this link to reset your Signal Forex password:",
      resetUrl,
      "",
      "This link expires in 1 hour. If you did not request it, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <p>Hi ${safeName},</p>
        <p>Use the button below to reset your Signal Forex password.</p>
        <p>
          <a href="${safeResetUrl}" style="display:inline-block;border-radius:8px;background:#2563eb;color:#ffffff;padding:12px 18px;text-decoration:none;font-weight:700">
            Reset password
          </a>
        </p>
        <p style="color:#475569;font-size:14px">This link expires in 1 hour. If you did not request it, you can ignore this email.</p>
        <p style="color:#475569;font-size:12px">If the button does not work, open this link: ${safeResetUrl}</p>
      </div>
    `,
  });
}
