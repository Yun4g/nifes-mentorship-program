import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports like 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // This should be your Gmail App Password
  }
});

// Generic function to send emails
export const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"Leap-On Mentorship" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

// Load email template
const loadTemplate = (templateName, replacements) => {
  const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
  let template = fs.readFileSync(templatePath, 'utf8');
  for (const [key, value] of Object.entries(replacements)) {
    template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return template;
};

// Send verification email
export const sendVerificationEmail = async (email, verificationUrl) => {
  const subject = 'Verify Your Email';
  const html = loadTemplate('verification', { verificationUrl });
  await sendEmail({ to: email, subject, html });
};

// Send login notification email
export const sendLoginNotificationEmail = async (email, firstName) => {
  const subject = 'Login Notification';
  const html = loadTemplate('loginNotification', { firstName });
  await sendEmail({ to: email, subject, html });
};

// Send profile completion email
export const sendProfileCompletionEmail = async (email, firstName) => {
  const subject = 'Profile Completion';
  const html = loadTemplate('profileCompletion', { firstName });
  await sendEmail({ to: email, subject, html });
};

export default transporter;