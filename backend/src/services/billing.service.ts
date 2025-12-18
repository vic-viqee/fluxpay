import Subscription from '../models/Subscription';
import Transaction from '../models/Transaction';
import ServicePlan from '../models/ServicePlan';
import Client from '../models/Client';
import { initiateStkPush } from './mpesa.service';
import logger from '../utils/logger';
import moment from 'moment'; // Using moment for date calculations due to complexity of billing cycles

// Helper to calculate the next billing date for a subscription based on its plan
const getNextBillingDate = (currentDate: Date, frequency: 'daily' | 'weekly' | 'monthly' | 'annually', billingDay: number): Date => {
  let nextDate = moment(currentDate);

  if (frequency === 'daily') {
    nextDate.add(1, 'days');
  } else if (frequency === 'weekly') {
    nextDate.isoWeekday(billingDay);
    if (nextDate.isSameOrBefore(moment(currentDate))) {
      nextDate.add(1, 'weeks').isoWeekday(billingDay);
    }
  } else if (frequency === 'monthly') {
    nextDate.date(billingDay);
    if (nextDate.isSameOrBefore(moment(currentDate))) {
      nextDate.add(1, 'months').date(billingDay);
    }
  } else if (frequency === 'annually') {
    nextDate.add(1, 'years').date(billingDay);
    if (nextDate.isSameOrBefore(moment(currentDate))) {
        nextDate.add(1, 'years').date(billingDay);
    }
  }
  return nextDate.startOf('day').toDate();
};


// Function to process subscriptions with due payments
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

      let newTransaction: any = null;
      try {
        // 1. Create a PENDING Transaction record
        newTransaction = new Transaction({
          subscriptionId: subscription._id,
          ownerId: subscription.ownerId,
          amountKes: plan.amountKes,
          status: 'PENDING',
          retryCount: 0,
          darajaRequestId: 'temp' // Temporary ID before getting the real one
        });
        await newTransaction.save();
        
        // 2. Call the M-Pesa STK Push service
        const stkPushResponse: any = await initiateStkPush(
          client.phoneNumber,
          plan.amountKes,
          owner?.businessName || 'FluxPay'
        );

        // 3. Save the darajaRequestId
        newTransaction.darajaRequestId = stkPushResponse.CheckoutRequestID;
        await newTransaction.save();

        // 4. Update the Subscription's nextBillingDate to the next cycle
        subscription.nextBillingDate = getNextBillingDate(subscription.nextBillingDate, plan.frequency, plan.billingDay);
        await subscription.save();

        logger.info(`STK Push initiated for subscription ${subscription._id}. CheckoutRequestID: ${stkPushResponse.CheckoutRequestID}`);

      } catch (error: any) {
        logger.error(`Failed to initiate STK Push for subscription ${subscription._id}: ${error.message}`);
        if (newTransaction) {
          newTransaction.status = 'FAILED';
          await newTransaction.save();
        }
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
