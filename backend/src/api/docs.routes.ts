import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to the FluxPay API documentation.',
    // In a real application, you might serve a Swagger/OpenAPI spec here
    v1: {
      auth: '/api/auth',
      payments: '/api/payments',
      subscriptions: '/api/subscriptions',
      customers: '/api/customers',
      analytics: '/api/analytics',
      settings: '/api/settings',
    }
  });
});

export default router;
