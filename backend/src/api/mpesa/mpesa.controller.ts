import { Request, Response, NextFunction } from 'express';
import { getAccountBalance, getTransactionStatus } from '../../services/mpesa.service';
import logger from '../../utils/logger';
import { IUser } from '../../models/User';

export const getBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const balance = await getAccountBalance();
    res.status(200).json({ data: balance });
  } catch (error) {
    logger.error('Get balance error:', error);
    next(error);
  }
};

export const checkTransactionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { checkoutRequestId } = req.params;
    
    if (!checkoutRequestId) {
      return res.status(400).json({ message: 'CheckoutRequestID is required' });
    }

    const status = await getTransactionStatus(checkoutRequestId);
    res.status(200).json({ data: status });
  } catch (error) {
    logger.error('Get transaction status error:', error);
    next(error);
  }
};