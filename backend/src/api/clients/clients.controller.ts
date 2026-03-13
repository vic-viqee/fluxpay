import { Request, Response, NextFunction } from 'express';
import Client from '../../models/Client';
import { IUser } from '../../models/User';
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination';

export const createClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phoneNumber, email } = req.body;
    const user = req.user as IUser; // Cast req.user to IUser
    const ownerId = user?._id;

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

export const getClients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as IUser;
    const ownerId = user?._id;
    if (!ownerId) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }
    
    const { page, limit, skip } = getPaginationParams(req);
    const query = { ownerId };
    
    const [clients, total] = await Promise.all([
      Client.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Client.countDocuments(query)
    ]);
    
    res.status(200).json(createPaginatedResponse(clients, total, { page, limit, skip }));
  } catch (error) {
    next(error);
  }
};
