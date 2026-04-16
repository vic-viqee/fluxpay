import { Request, Response, NextFunction } from 'express';
import User from '../../models/User';
import bcrypt from 'bcrypt';

export const seedAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ 
        message: 'Admin already exists',
        email: existingAdmin.email 
      });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('FluxPay2024!', 10);
    
    const admin = await User.create({
      username: 'admin',
      email: 'admin@fluxpay.com',
      password: hashedPassword,
      businessName: 'FluxPay',
      businessType: 'Technology',
      businessPhoneNumber: '254700000000',
      preferredPaymentMethod: 'M-Pesa STK Push',
      role: 'admin',
      plan: 'Enterprise'
    });

    res.status(201).json({
      message: 'Admin created successfully',
      email: admin.email,
      password: 'FluxPay2024!'
    });
  } catch (error) {
    next(error);
  }
};