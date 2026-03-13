import { Request, Response, NextFunction } from 'express';
import ServicePlan from '../../models/ServicePlan';
import Subscription from '../../models/Subscription';
import { IUser } from '../../models/User';
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination';

export const createServicePlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, amountKes, frequency, billingDay } = req.body;

    if (!name || !amountKes || !frequency || !billingDay) {
      return res.status(400).json({ message: 'All service plan fields are required.' });
    }

    const user = req.user as IUser; // Cast req.user to IUser
    if (!user || !user._id) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    const newPlan = new ServicePlan({
      name,
      amountKes,
      frequency,
      billingDay,
      ownerId: user._id,
    });

    await newPlan.save();
    res.status(201).json({ message: 'Service plan created successfully', plan: newPlan });
  } catch (error) {
    next(error);
  }
};

export const getServicePlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as IUser;
    if (!user || !user._id) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    const { page, limit, skip } = getPaginationParams(req);
    const query = { ownerId: user._id };
    
    const [plans, total] = await Promise.all([
      ServicePlan.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ServicePlan.countDocuments(query)
    ]);
    
    res.status(200).json(createPaginatedResponse(plans, total, { page, limit, skip }));
  } catch (error) {
    next(error);
  }
};

export const updateServicePlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, amountKes, frequency, billingDay } = req.body;

    if (!name || !amountKes || !frequency || !billingDay) {
      return res.status(400).json({ message: 'All service plan fields are required.' });
    }

    const user = req.user as IUser;
    if (!user || !user._id) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    const updatedPlan = await ServicePlan.findOneAndUpdate(
      { _id: id, ownerId: user._id },
      { name, amountKes, frequency, billingDay },
      { new: true, runValidators: true }
    );

    if (!updatedPlan) {
      return res.status(404).json({ message: 'Service plan not found.' });
    }

    return res.status(200).json({ message: 'Service plan updated successfully', plan: updatedPlan });
  } catch (error) {
    next(error);
  }
};

export const deleteServicePlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = req.user as IUser;
    if (!user || !user._id) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    const subscriptionUsingPlan = await Subscription.findOne({
      ownerId: user._id,
      planId: id,
    })
      .select('_id')
      .lean();

    if (subscriptionUsingPlan) {
      return res.status(409).json({
        message: 'This plan is linked to one or more subscriptions. Delete or move those subscriptions first.',
      });
    }

    const deletedPlan = await ServicePlan.findOneAndDelete({ _id: id, ownerId: user._id });
    if (!deletedPlan) {
      return res.status(404).json({ message: 'Service plan not found.' });
    }

    return res.status(200).json({ message: 'Service plan deleted successfully' });
  } catch (error) {
    next(error);
  }
};
