import { Request } from 'express';
import { IUser } from '../../models/User';

// Augment the Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
