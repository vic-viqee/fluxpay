import mongoose from 'mongoose';
import config from './index';
import logger from '../utils/logger';

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    throw error; // Re-throw the error to be caught by the caller
  }
};

export default connectDB;
