import nodemailer from 'nodemailer';
import config from '../config';
import logger from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure, // true for 465, false for other ports
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

export const sendResetPasswordEmail = async (to: string, token: string) => {
  const resetUrl = `${config.frontendUrl}/reset-password/${token}`;
  const mailOptions = {
    from: config.email.from,
    to,
    subject: 'Password Reset Request for FluxPay',
    html: `
      <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
      <p>Please click on the following link, or paste this into your browser to complete the process:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
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
