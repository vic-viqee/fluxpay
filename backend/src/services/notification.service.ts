import nodemailer from 'nodemailer';
import config from '../config';
import logger from '../utils/logger';
import { IUser } from '../models/User';
import { IClient } from '../models/Client';
import { IServicePlan } from '../models/ServicePlan';
import mongoose, { Types } from 'mongoose';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: config.email.user && config.email.pass ? {
    user: config.email.user,
    pass: config.email.pass,
  } : undefined,
});

interface PaymentFailureData {
  ownerEmail: string;
  businessName: string;
  clientName: string;
  phoneNumber: string;
  planName: string;
  amount: number;
  failureCount?: number;
  nextRetry?: Date;
}

export const sendPaymentFailureEmail = async (data: PaymentFailureData): Promise<void> => {
  const { ownerEmail, businessName, clientName, phoneNumber, planName, amount, failureCount = 1, nextRetry } = data;
  
  const retryInfo = nextRetry 
    ? `The next retry attempt will be made on ${nextRetry.toLocaleDateString()} at ${nextRetry.toLocaleTimeString()}.`
    : 'No further automatic retries will be made.';

  const mailOptions = {
    from: config.email.from,
    to: ownerEmail,
    subject: `Payment Failed - ${businessName} - ${clientName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #d9534f;">Payment Failed - Action Required</h2>
        <p>Hello,</p>
        <p>A payment has <strong>failed</strong> for one of your subscriptions.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Customer:</strong> ${clientName}</p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${phoneNumber}</p>
          <p style="margin: 5px 0;"><strong>Plan:</strong> ${planName}</p>
          <p style="margin: 5px 0;"><strong>Amount:</strong> KES ${amount.toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>Failure Count:</strong> ${failureCount} of 3</p>
        </div>
        
        <p style="color: #666;">${retryInfo}</p>
        
        ${failureCount >= 3 ? `
        <p style="color: #d9534f; font-weight: bold;">Warning: After 3 consecutive failures, the subscription will be automatically suspended.</p>
        ` : ''}
        
        <p>Please contact the customer to resolve the payment issue.</p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">&copy; ${new Date().getFullYear()} FluxPay. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Payment failure email sent to ${ownerEmail}`);
  } catch (error) {
    logger.error(`Error sending payment failure email to ${ownerEmail}: ${error}`);
  }
};

export const sendSubscriptionSuspendedEmail = async (data: Omit<PaymentFailureData, 'failureCount'>): Promise<void> => {
  const { ownerEmail, businessName, clientName, phoneNumber, planName, amount } = data;
  
  const mailOptions = {
    from: config.email.from,
    to: ownerEmail,
    subject: `Subscription Suspended - ${businessName} - ${clientName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #d9534f;">Subscription Suspended</h2>
        <p>Hello,</p>
        <p>The subscription for <strong>${clientName}</strong> has been automatically suspended due to 3 consecutive payment failures.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Customer:</strong> ${clientName}</p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${phoneNumber}</p>
          <p style="margin: 5px 0;"><strong>Plan:</strong> ${planName}</p>
          <p style="margin: 5px 0;"><strong>Amount:</strong> KES ${amount.toLocaleString()}</p>
        </div>
        
        <p>To reactivate this subscription, please ensure the customer's M-Pesa is funded and manually retry the payment from the FluxPay dashboard.</p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">&copy; ${new Date().getFullYear()} FluxPay. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Subscription suspended email sent to ${ownerEmail}`);
  } catch (error) {
    logger.error(`Error sending suspended email to ${ownerEmail}: ${error}`);
  }
};

export const sendPaymentSuccessEmail = async (data: {
  ownerEmail: string;
  businessName: string;
  clientName: string;
  amount: number;
  mpesaReceiptNo: string;
}): Promise<void> => {
  const { ownerEmail, businessName, clientName, amount, mpesaReceiptNo } = data;
  
  const mailOptions = {
    from: config.email.from,
    to: ownerEmail,
    subject: `Payment Received - ${businessName} - KES ${amount.toLocaleString()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #28a745;">Payment Received</h2>
        <p>Hello,</p>
        <p>A payment of <strong>KES ${amount.toLocaleString()}</strong> has been successfully received.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Customer:</strong> ${clientName}</p>
          <p style="margin: 5px 0;"><strong>Amount:</strong> KES ${amount.toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>M-Pesa Receipt:</strong> ${mpesaReceiptNo}</p>
        </div>
        
        <p>Thank you for using FluxPay!</p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">&copy; ${new Date().getFullYear()} FluxPay. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Payment success email sent to ${ownerEmail}`);
  } catch (error) {
    logger.error(`Error sending payment success email to ${ownerEmail}: ${error}`);
  }
};