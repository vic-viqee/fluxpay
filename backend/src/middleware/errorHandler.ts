import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: any;
}

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${err.message}, Stack: ${err.stack}`);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';
  const errors = err.errors || undefined;

  const errorResponse: ErrorResponse = {
    statusCode,
    message,
  };

  if (errors) {
    errorResponse.errors = errors;
  }

  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
