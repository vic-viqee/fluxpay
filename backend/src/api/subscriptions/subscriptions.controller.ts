import { Response, NextFunction } from 'express';
import Subscription from '../../models/Subscription';
import Client from '../../models/Client'; // Import Client model
import ServicePlan from '../../models/ServicePlan'; // Import ServicePlan model
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

// Helper function to calculate next billing date
const calculateNextBillingDate = (frequency: string, billingDay: number): Date => {
  const now = new Date();
  let nextBillingDate = new Date(now);

  if (frequency === 'monthly') {
    nextBillingDate.setDate(billingDay);
    if (nextBillingDate <= now) {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    }
  } else if (frequency === 'weekly') {
    const dayOfWeek = billingDay % 7; // Convert 1-7 to 0-6 (Sunday-Saturday)
    const currentDay = now.getDay();
    const daysToAdd = (dayOfWeek - currentDay + 7) % 7;
    nextBillingDate.setDate(now.getDate() + daysToAdd);
    if (nextBillingDate <= now) { // If it's today or in the past, add a week
      nextBillingDate.setDate(nextBillingDate.getDate() + 7);
    }
  } else if (frequency === 'daily') {
    nextBillingDate.setDate(now.getDate() + 1); // Next day
  } else if (frequency === 'annually') {
    // Assuming billingDay is day of month, and billingMonth (if needed) is implicit (e.g., current month)
    // For simplicity, setting to next year's same month/day if current day has passed
    nextBillingDate.setFullYear(now.getFullYear() + 1);
    nextBillingDate.setDate(billingDay); // This will handle overflow correctly for months with fewer days
    if (nextBillingDate <= now) {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }
  }
  // Reset time to start of day to avoid timezone issues
  nextBillingDate.setHours(0, 0, 0, 0);
  return nextBillingDate;
};


export const createSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { clientId, planId, notes } = req.body;
    const ownerId = req.user?._id;

    if (!clientId || !planId || !ownerId) {
      return res.status(400).json({ message: 'Client ID and Plan ID are required.' });
    }

    // Verify client and plan exist and belong to the owner
    const client = await Client.findOne({ _id: clientId, ownerId });
    if (!client) {
      return res.status(404).json({ message: 'Client not found or does not belong to this user.' });
    }

    const servicePlan = await ServicePlan.findOne({ _id: planId, ownerId });
    if (!servicePlan) {
      return res.status(404).json({ message: 'Service Plan not found or does not belong to this user.' });
    }

    const nextBillingDate = calculateNextBillingDate(servicePlan.frequency, servicePlan.billingDay);

    const newSubscription = new Subscription({
      clientId,
      planId,
      ownerId,
      status: 'PENDING_ACTIVATION',
      startDate: new Date(),
      nextBillingDate,
      notes,
    });
    const savedSubscription = await newSubscription.save();

    // TODO: Trigger initial client invitation notification (e.g., SMS to client.phoneNumber)

    res.status(201).json(savedSubscription);
  } catch (error) {
    next(error);
  }
};

export const getSubscriptions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }
    const subscriptions = await Subscription.find({ ownerId: req.user._id })
      .populate('clientId', 'name phoneNumber email') // Select specific fields
      .populate('planId', 'name amountKes frequency'); // Select specific fields
    res.status(200).json(subscriptions);
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }
    const subscription = await Subscription.findOne({ _id: req.params.id, ownerId: req.user._id })
      .populate('clientId', 'name phoneNumber email')
      .populate('planId', 'name amountKes frequency');
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.status(200).json(subscription);
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // For updates, ensure ownerId is not changed and only allowed fields are updated
    const { clientId, planId, status, nextBillingDate, notes } = req.body;
    
    const updatedSubscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user?._id },
      { clientId, planId, status, nextBillingDate, notes }, // Only allow these fields to be updated
      { new: true, runValidators: true }
    );
    if (!updatedSubscription) {
      return res.status(404).json({ message: 'Subscription not found or does not belong to this user.' });
    }
    res.status(200).json(updatedSubscription);
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const deletedSubscription = await Subscription.findOneAndDelete({ _id: req.params.id, ownerId: req.user?._id });
    if (!deletedSubscription) {
      return res.status(404).json({ message: 'Subscription not found or does not belong to this user.' });
    }
    res.status(200).json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    next(error);
  }
};
