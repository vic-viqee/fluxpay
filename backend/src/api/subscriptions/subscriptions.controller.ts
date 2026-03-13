import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Subscription from '../../models/Subscription';
import Client from '../../models/Client';
import ServicePlan from '../../models/ServicePlan';
import { IUser } from '../../models/User';
import { calculateNextBillingDate, BillingFrequency } from '../../utils/billing';
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination';

export const createSubscription = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { clientId, planId, notes } = req.body;
    const user = req.user as IUser;
    const ownerId = user?._id;

    if (!clientId || !planId || !ownerId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Client ID and Plan ID are required.' });
    }

    const client = await Client.findOne({ _id: clientId, ownerId }).session(session);
    if (!client) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Client not found or does not belong to this user.' });
    }

    const servicePlan = await ServicePlan.findOne({ _id: planId, ownerId }).session(session);
    if (!servicePlan) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Service Plan not found or does not belong to this user.' });
    }

    const nextBillingDate = calculateNextBillingDate(new Date(), servicePlan.frequency as BillingFrequency, servicePlan.billingDay);

    const newSubscription = new Subscription({
      clientId,
      planId,
      ownerId,
      status: 'PENDING_ACTIVATION',
      startDate: new Date(),
      nextBillingDate,
      notes,
    });

    const savedSubscription = await newSubscription.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(savedSubscription);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const getSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as IUser;
    if (!user || !user._id) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }
    
    const { page, limit, skip } = getPaginationParams(req);
    const query = { ownerId: user._id };
    
    const [subscriptions, total] = await Promise.all([
      Subscription.find(query)
        .populate('clientId', 'name phoneNumber email')
        .populate('planId', 'name amountKes frequency')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Subscription.countDocuments(query)
    ]);
    
    res.status(200).json(createPaginatedResponse(subscriptions, total, { page, limit, skip }));
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as IUser; // Cast req.user to IUser
    if (!user || !user._id) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }
    const subscription = await Subscription.findOne({ _id: req.params.id, ownerId: user._id })
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

export const updateSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // For updates, ensure ownerId is not changed and only allowed fields are updated
    const { clientId, planId, status, nextBillingDate, notes } = req.body;
    const user = req.user as IUser; // Cast req.user to IUser
    
    const updatedSubscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, ownerId: user?._id },
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

export const deleteSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as IUser; // Cast req.user to IUser
    const deletedSubscription = await Subscription.findOneAndDelete({ _id: req.params.id, ownerId: user?._id });
    if (!deletedSubscription) {
      return res.status(404).json({ message: 'Subscription not found or does not belong to this user.' });
    }
    res.status(200).json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    next(error);
  }
};
