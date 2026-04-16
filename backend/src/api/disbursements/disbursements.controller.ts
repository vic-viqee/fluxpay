import { Request, Response, NextFunction } from 'express';
import { initiateB2CDisbursement } from '../../services/disbursement.service';
import logger from '../../utils/logger';
import { IUser } from '../../models/User';
import Transaction from '../../models/Transaction';
import mongoose from 'mongoose';

export const initiateDisbursement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phoneNumber, amount, reference, remarks } = req.body;
    const user = req.user as IUser;
    const ownerId = user._id;

    if (!phoneNumber || !amount || !reference) {
      return res.status(400).json({ message: 'Phone number, amount, and reference are required' });
    }

    if (amount < 10) {
      return res.status(400).json({ message: 'Minimum disbursement amount is KES 10' });
    }

    const result = await initiateB2CDisbursement(phoneNumber, amount, reference, remarks);

    const transaction = new Transaction({
      ownerId,
      darajaRequestId: result.conversationId,
      amountKes: amount,
      status: 'PENDING',
      retryCount: 0,
    });
    await transaction.save();

    res.status(200).json({
      message: 'Disbursement initiated successfully',
      data: {
        conversationId: result.conversationId,
        reference,
        amount,
        status: 'PENDING',
      },
    });
  } catch (error: any) {
    logger.error('Disbursement error:', error);
    next(error);
  }
};

export const listDisbursements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as IUser;
    const ownerId = user._id;
    const { limit = 50, skip = 0 } = req.query;

    const transactions = await Transaction.find({ ownerId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    res.status(200).json({ data: transactions });
  } catch (error) {
    logger.error('List disbursements error:', error);
    next(error);
  }
};