import nodemailer from 'nodemailer';
import config from '../config';
import logger from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure, // true for 465, false for other ports
  auth: config.email.user && config.email.pass ? {
    user: config.email.user,
    pass: config.email.pass,
  } : undefined,
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  }
});

export const sendResetPasswordEmail = async (to: string, token: string) => {
  const resetUrl = `${config.frontendUrl}/reset-password/${token}`;
  const mailOptions = {
    from: config.email.from,
    to,
    subject: 'Password Reset Request for FluxPay',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You are receiving this because you (or someone else) have requested the reset of the password for your account on FluxPay.</p>
        <p>Please click on the button below to complete the process:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">&copy; ${new Date().getFullYear()} FluxPay. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${to}`);
  } catch (error) {
    logger.error(`Error sending password reset email to ${to}: ${error}`);
    throw new Error('Failed to send password reset email.');
  }
};
