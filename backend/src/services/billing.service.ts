import Subscription from '../models/Subscription';
import Transaction from '../models/Transaction';
import ServicePlan from '../models/ServicePlan';
import Client from '../models/Client';
import mongoose from 'mongoose';
import { initiateStkPush } from './mpesa.service';
import logger from '../utils/logger';
import moment from 'moment';
import { calculateNextBillingDate } from '../utils/billing';
import { sendPaymentFailureEmail, sendSubscriptionSuspendedEmail } from './notification.service';

export const processDuePayments = async () => {
  logger.info('Running processDuePayments...');
  const today = moment().startOf('day');

  try {
    const dueSubscriptions = await Subscription.find({
      status: 'ACTIVE',
      nextBillingDate: { $lte: today.toDate() },
    })
    .populate('clientId')
    .populate('planId')
    .populate('ownerId');

    for (const subscription of dueSubscriptions) {
      const client = subscription.clientId as any;
      const plan = subscription.planId as any;
      const owner = subscription.ownerId as any;

      if (!client || !plan) {
        logger.error(`Skipping subscription ${subscription._id}: Missing client or plan details.`);
        continue;
      }

      if (!client.phoneNumber || !plan.amountKes) {
        logger.error(`Skipping subscription ${subscription._id}: Missing client phone or plan amount.`);
        continue;
      }

      try {
        // 1. Call the M-Pesa STK Push service (outside of transaction since it's external)
        const stkPushResponse: any = await initiateStkPush(
          client.phoneNumber,
          plan.amountKes,
          owner?.businessName || 'FluxPay'
        );

        // 2. Persist the PENDING transaction in a session for atomicity
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
          const newTransaction = new Transaction({
            subscriptionId: subscription._id,
            ownerId: subscription.ownerId,
            amountKes: plan.amountKes,
            status: 'PENDING',
            retryCount: 0,
            darajaRequestId: stkPushResponse.CheckoutRequestID,
          });
          await newTransaction.save({ session });

          // 3. Update the Subscription's nextBillingDate to the next cycle
          subscription.nextBillingDate = calculateNextBillingDate(subscription.nextBillingDate, plan.frequency, plan.billingDay);
          subscription.lastPaymentAttempt = new Date();
          subscription.paymentFailureCount = 0;
          await subscription.save({ session });

          await session.commitTransaction();
          session.endSession();
          
          logger.info(`STK Push initiated for subscription ${subscription._id}. CheckoutRequestID: ${stkPushResponse.CheckoutRequestID}`);
        } catch (txError: any) {
          await session.abortTransaction();
          session.endSession();
          throw txError;
        }

      } catch (error: any) {
        logger.error(`Failed to initiate STK Push for subscription ${subscription._id}: ${error.message}`);
        
        const failureCount = (subscription.paymentFailureCount || 0) + 1;
        subscription.paymentFailureCount = failureCount;
        
        if (failureCount >= 3) {
          subscription.status = 'FAILED';
          logger.warn(`Subscription ${subscription._id} marked as FAILED after 3 consecutive payment failures. Owner: ${owner?.email}`);
          
          if (owner?.email) {
            await sendSubscriptionSuspendedEmail({
              ownerEmail: owner.email,
              businessName: owner?.businessName || 'FluxPay',
              clientName: client?.name || 'Unknown',
              phoneNumber: client?.phoneNumber || 'Unknown',
              planName: plan?.name || 'Unknown',
              amount: plan?.amountKes || 0,
            });
          }
        } else if (owner?.email) {
          await sendPaymentFailureEmail({
            ownerEmail: owner.email,
            businessName: owner?.businessName || 'FluxPay',
            clientName: client?.name || 'Unknown',
            phoneNumber: client?.phoneNumber || 'Unknown',
            planName: plan?.name || 'Unknown',
            amount: plan?.amountKes || 0,
            failureCount: failureCount,
          });
        }
        
        await subscription.save();
      }
    }
  } catch (error: any) {
    logger.error('Error processing due payments:', error.message);
  }
};

// Function to process failed transactions for retry
export const processFailedTransactions = async () => {
  logger.info('Running processFailedTransactions...');
  const twentyFourHoursAgo = moment().subtract(24, 'hours').toDate();

  try {
    const failedTransactions = await Transaction.find({
      status: 'FAILED',
      retryCount: { $lt: 3 },
      updatedAt: { $lte: twentyFourHoursAgo }, // Use updatedAt for cool-down
    })
    .populate({
        path: 'subscriptionId',
        populate: [{ path: 'clientId' }, { path: 'planId' }, { path: 'ownerId' }]
    });

    for (const transaction of failedTransactions) {
        const subscription = transaction.subscriptionId as any;

        if (!subscription || !subscription.clientId || !subscription.planId) {
            logger.error(`Skipping failed transaction ${transaction._id}: Missing subscription, client or plan details.`);
            continue;
        }

        const client = subscription.clientId as any;
        const plan = subscription.planId as any;
        const owner = subscription.ownerId as any;

        if (!client.phoneNumber || !plan.amountKes) {
            logger.error(`Skipping failed transaction ${transaction._id}: Missing client phone or plan amount.`);
            continue;
        }

        try {
            // Initiate a new STK Push
            const stkPushResponse: any = await initiateStkPush(
                client.phoneNumber,
                plan.amountKes,
                owner?.businessName || 'FluxPay'
            );

            // Create a new transaction record for the retry
            const retriedTransaction = new Transaction({
                subscriptionId: subscription._id,
                ownerId: subscription.ownerId,
                amountKes: plan.amountKes,
                status: 'PENDING',
                darajaRequestId: stkPushResponse.CheckoutRequestID,
                retryCount: transaction.retryCount + 1,
            });
            await retriedTransaction.save();
            
            logger.info(`Retry STK Push initiated for transaction ${transaction._id}. New CheckoutRequestID: ${stkPushResponse.CheckoutRequestID}`);
        } catch (error: any) {
            logger.error(`Failed to retry STK Push for transaction ${transaction._id}: ${error.message}`);
            transaction.retryCount += 1;
            await transaction.save();
        }
    }
  } catch (error: any) {
    logger.error('Error processing failed transactions:', error.message);
  }
};
