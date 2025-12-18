import { Request, Response, NextFunction } from 'express';
import ServicePlan from '../../models/ServicePlan';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export const createServicePlan = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, amountKes, frequency, billingDay } = req.body;

    if (!name || !amountKes || !frequency || !billingDay) {
      return res.status(400).json({ message: 'All service plan fields are required.' });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    const newPlan = new ServicePlan({
      name,
      amountKes,
      frequency,
      billingDay,
      ownerId: req.user._id,
    });

    await newPlan.save();
    res.status(201).json({ message: 'Service plan created successfully', plan: newPlan });
  } catch (error) {
    next(error);
  }
};
