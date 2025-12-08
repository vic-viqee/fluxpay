import { Response, NextFunction } from 'express';
import Subscription from '../../models/Subscription';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export const createSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { 
      customerName, 
      phoneNumber, 
      amount, 
      billingFrequency, 
      plan, // Can be provided, otherwise defaults in model
      status, // Can be provided, otherwise defaults in model
      startDate, 
      endDate,
      notes,
    } = req.body;
    const userId = req.user?._id;

    // Server-side validation for new required fields
    if (!customerName || !phoneNumber || !amount || !billingFrequency) {
      return res.status(400).json({ message: 'Customer name, phone number, amount, and billing frequency are required.' });
    }

    const newSubscription = new Subscription({
      user: userId,
      customerName,
      phoneNumber,
      amount,
      billingFrequency,
      plan: plan || 'Custom', // Ensure plan has a default if not explicitly set
      status,
      startDate,
      endDate,
      notes,
    });
    const savedSubscription = await newSubscription.save();
    res.status(201).json(savedSubscription);
  } catch (error) {
    next(error);
  }
};

export const getSubscriptions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user?._id });
    res.status(200).json(subscriptions);
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const subscription = await Subscription.findOne({ _id: req.params.id, user: req.user?._id });
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
    const updatedSubscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, user: req.user?._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedSubscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.status(200).json(updatedSubscription);
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const deletedSubscription = await Subscription.findOneAndDelete({ _id: req.params.id, user: req.user?._id });
    if (!deletedSubscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.status(200).json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    next(error);
  }
};
