import { Request, Response, NextFunction } from 'express';
import ServicePlan from '../../models/ServicePlan';
// Removed `import { AuthenticatedRequest } from '../../middleware/auth.middleware';`
import { IUser } from '../../models/User';

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
    const user = req.user as IUser; // Cast req.user to IUser
    if (!user || !user._id) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    const plans = await ServicePlan.find({ ownerId: user._id });
    res.status(200).json({ plans });
  } catch (error) {
    next(error);
  }
};

