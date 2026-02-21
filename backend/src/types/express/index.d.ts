import { Request } from 'express';
import User from '../../models/User'; // Import the Mongoose model directly

// Augment the Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: InstanceType<typeof User>; // Type as a Mongoose User instance
    }
  }
}
