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
    // If billingDay is 1-7 (Mon-Sun), moment.isoWeekday() matches this.
    // nextDate.isoWeekday(billingDay) sets the date to the next occurrence of that day.
    // If today is the billingDay, it will set it for next week.
    nextDate.isoWeekday(billingDay);
    if (nextDate.isSameOrBefore(moment(currentDate))) {
      nextDate.add(1, 'weeks').isoWeekday(billingDay);
    }
  } else if (frequency === 'monthly') {
    // Sets to the 'billingDay' of the current month. If that's past, it goes to next month.
    nextDate.date(billingDay);
    if (nextDate.isSameOrBefore(moment(currentDate))) {
      nextDate.add(1, 'months').date(billingDay);
    }
  } else if (frequency === 'annually') {
    // Assuming billingDay is day of month, and month is set implicitly from start date
    // For simplicity, it will try to set the date to the billingDay, then move to next year if needed.
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
    .populate('planId');

    for (const subscription of dueSubscriptions) {
      if (!subscription.clientId || !subscription.planId) {
        logger.error(`Skipping subscription ${subscription._id}: Missing client or plan details.`);
        continue;
      }

      const client = subscription.clientId as any; // Cast to access populated fields
      const plan = subscription.planId as any; // Cast to access populated fields

      if (!client.phoneNumber || !plan.amountKes) {
        logger.error(`Skipping subscription ${subscription._id}: Missing client phone or plan amount.`);
        continue;
      }

      try {
        // 1. Create a PENDING Transaction record
        const newTransaction = new Transaction({
          subscriptionId: subscription._id,
          ownerId: subscription.ownerId,
          amountKes: plan.amountKes,
          status: 'PENDING',
          retryCount: 0,
        });
        await newTransaction.save();
        
        // 2. Call the M-Pesa STK Push service
        const stkPushResponse = await initiateStkPush(
          client.phoneNumber,
          plan.amountKes,
          (subscription.ownerId as any).businessName || 'FluxPay' // Assuming ownerId is populated with User
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
        // Mark transaction as FAILED if STK push initiation fails
        const failedTransaction = await Transaction.findOne({_id: newTransaction._id});
        if(failedTransaction){
            failedTransaction.status = 'FAILED';
            await failedTransaction.save();
        }
        // Increment retryCount for the subscription, or handle as needed
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
      transactionDate: { $lte: twentyFourHoursAgo }, // Cool-down period
    })
    .populate({
        path: 'subscriptionId',
        populate: [{ path: 'clientId' }, { path: 'planId' }, { path: 'ownerId' }] // Deep populate
    });

    for (const transaction of failedTransactions) {
        if (!transaction.subscriptionId || !transaction.subscriptionId.clientId || !transaction.subscriptionId.planId) {
            logger.error(`Skipping failed transaction ${transaction._id}: Missing subscription, client or plan details.`);
            continue;
        }

        const subscription = transaction.subscriptionId as any;
        const client = subscription.clientId as any;
        const plan = subscription.planId as any;

        if (!client.phoneNumber || !plan.amountKes) {
            logger.error(`Skipping failed transaction ${transaction._id}: Missing client phone or plan amount.`);
            continue;
        }

        try {
            // Initiate a new STK Push
            const stkPushResponse = await initiateStkPush(
                client.phoneNumber,
                plan.amountKes,
                (subscription.ownerId as any).businessName || 'FluxPay'
            );

            // Create a new transaction record for the retry, linking it to the subscription
            const retriedTransaction = new Transaction({
                subscriptionId: subscription._id,
                ownerId: subscription.ownerId,
                amountKes: plan.amountKes,
                status: 'PENDING',
                darajaRequestId: stkPushResponse.CheckoutRequestID,
                retryCount: transaction.retryCount + 1, // Increment retry count
            });
            await retriedTransaction.save();

            // Mark the original failed transaction as superceded or just leave it
            // For now, we leave the old FAILED transaction and create a new PENDING one for the retry attempt.

            logger.info(`Retry STK Push initiated for transaction ${transaction._id}. New CheckoutRequestID: ${stkPushResponse.CheckoutRequestID}`);
            // TODO: Alert the owner (Alex) about the retry
        } catch (error: any) {
            logger.error(`Failed to retry STK Push for transaction ${transaction._id}: ${error.message}`);
            // If retry fails, just increment the retry count of the original transaction
            transaction.retryCount += 1;
            await transaction.save();
            // TODO: Alert the owner (Alex) about the persistent failure
        }
    }
  } catch (error: any) {
    logger.error('Error processing failed transactions:', error.message);
  }
};
