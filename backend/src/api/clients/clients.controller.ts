import { Request, Response, NextFunction } from 'express';
import Client from '../../models/Client';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export const createClient = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, phoneNumber, email } = req.body;
    const ownerId = req.user?._id;

    if (!name || !phoneNumber || !ownerId) {
      return res.status(400).json({ message: 'Client name and phone number are required.' });
    }

    // Check if client with this phone number already exists for this owner
    const existingClient = await Client.findOne({ phoneNumber, ownerId });
    if (existingClient) {
      return res.status(409).json({ message: 'Client with this phone number already exists for this user.' });
    }

    const newClient = new Client({
      name,
      phoneNumber,
      email,
      ownerId,
    });

    await newClient.save();
    res.status(201).json({ message: 'Client created successfully', client: newClient });
  } catch (error) {
    next(error);
  }
};

export const getClients = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.user?._id;
    if (!ownerId) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }
    const clients = await Client.find({ ownerId });
    res.status(200).json({ clients });
  } catch (error) {
    next(error);
  }
};
