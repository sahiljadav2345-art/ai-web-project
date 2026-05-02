// ─── Email Utility ───────────────────────────────────────────────────────────
// Sends emails using Nodemailer (Gmail SMTP example)
const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  // Create transporter with Gmail (or any SMTP provider)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for port 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"MockPrep" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
