import axios from 'axios';
import crypto from 'crypto';
import mongoose, { Types } from 'mongoose';
import Webhook from '../models/Webhook';
import ApiKey, { IApiKey } from '../models/ApiKey';
import logger from '../utils/logger';
import config from '../config';

const WEBHOOK_RETRY_DELAYS = [60000, 300000, 86400000]; // 1min, 5min, 24hr

interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

const signPayload = (payload: string, secret: string): string => {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
};

export const findApiKey = async (key: string): Promise<{ apiKey: IApiKey; ownerId: Types.ObjectId } | null> => {
  const apiKey = await ApiKey.findOne({ key, isActive: true });
  if (!apiKey) return null;
  
  return { apiKey, ownerId: apiKey.ownerId };
};

export const forwardWebhook = async (
  ownerId: Types.ObjectId,
  event: string,
  data: Record<string, unknown>
): Promise<void> => {
  const webhooks = await Webhook.find({ ownerId, isActive: true, events: event });
  
  if (webhooks.length === 0) {
    logger.info(`No webhooks configured for event: ${event}`);
    return;
  }

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  const payloadString = JSON.stringify(payload);

  for (const webhook of webhooks) {
    try {
      const signature = signPayload(payloadString, webhook.secret);
      
      await axios.post(webhook.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event,
        },
        timeout: 30000,
      });

      webhook.lastTriggeredAt = new Date();
      webhook.failureCount = 0;
      await webhook.save();
      
      logger.info(`Webhook delivered successfully for event: ${event}`);
    } catch (error: any) {
      logger.error(`Webhook delivery failed for ${webhook.url}: ${error.message}`);
      
      webhook.failureCount = (webhook.failureCount || 0) + 1;
      await webhook.save();

      if (webhook.failureCount! >= 3) {
        webhook.isActive = false;
        await webhook.save();
        logger.warn(`Webhook ${webhook.url} disabled after 3 consecutive failures`);
      }
    }
  }
};

export const triggerPaymentSuccess = async (
  ownerId: Types.ObjectId,
  transactionData: Record<string, unknown>
): Promise<void> => {
  await forwardWebhook(ownerId, 'payment.success', transactionData);
};

export const triggerPaymentFailed = async (
  ownerId: Types.ObjectId,
  transactionData: Record<string, unknown>
): Promise<void> => {
  await forwardWebhook(ownerId, 'payment.failed', transactionData);
};

export const triggerSubscriptionCreated = async (
  ownerId: Types.ObjectId,
  subscriptionData: Record<string, unknown>
): Promise<void> => {
  await forwardWebhook(ownerId, 'subscription.created', subscriptionData);
};

export const verifyApiKey = async (key: string, secret: string): Promise<boolean> => {
  const apiKey = await ApiKey.findOne({ key, isActive: true });
  if (!apiKey) return false;
  
  const bcrypt = await import('bcrypt');
  return bcrypt.compare(secret, apiKey.secret);
};