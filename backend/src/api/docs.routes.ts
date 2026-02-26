import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const base = '/api';
  res.status(200).json({
    name: 'FluxPay API',
    version: 'v1',
    basePath: base,
    authentication: {
      type: 'Bearer JWT',
      header: 'Authorization: Bearer <token>',
      refreshEndpoint: `${base}/auth/refresh-token`,
    },
    endpoints: [
      { method: 'POST', path: `${base}/auth/signup`, description: 'Register a user account.' },
      { method: 'POST', path: `${base}/auth/login`, description: 'Login and receive access + refresh tokens.' },
      { method: 'POST', path: `${base}/auth/refresh-token`, description: 'Rotate refresh token and issue a new access token.' },
      { method: 'POST', path: `${base}/auth/forgot-password`, description: 'Start reset-password flow.' },
      { method: 'POST', path: `${base}/auth/reset-password/:token`, description: 'Complete reset-password flow.' },
      { method: 'GET', path: `${base}/auth/google`, description: 'Start Google OAuth flow.' },
      { method: 'POST', path: `${base}/payments/stk-push`, description: 'Initiate STK push.', authRequired: true },
      { method: 'POST', path: `${base}/payments/simulate-stk-push`, description: 'Simulation helper for STK push.', authRequired: true },
      { method: 'POST', path: `${base}/payments/callback`, description: 'Daraja callback endpoint.' },
      { method: 'GET', path: `${base}/users/me`, description: 'Current user profile.', authRequired: true },
      { method: 'GET', path: `${base}/transactions`, description: 'List user transactions.', authRequired: true },
      { method: 'POST', path: `${base}/plans`, description: 'Create service plan.', authRequired: true },
      { method: 'GET', path: `${base}/plans`, description: 'List service plans.', authRequired: true },
      { method: 'POST', path: `${base}/clients`, description: 'Create client.', authRequired: true },
      { method: 'GET', path: `${base}/clients`, description: 'List clients.', authRequired: true },
      { method: 'POST', path: `${base}/subscriptions`, description: 'Create subscription.', authRequired: true },
      { method: 'GET', path: `${base}/subscriptions`, description: 'List subscriptions.', authRequired: true },
      { method: 'GET', path: `${base}/subscriptions/:id`, description: 'Get one subscription.', authRequired: true },
      { method: 'PUT', path: `${base}/subscriptions/:id`, description: 'Update one subscription.', authRequired: true },
      { method: 'DELETE', path: `${base}/subscriptions/:id`, description: 'Delete one subscription.', authRequired: true },
      { method: 'GET', path: `${base}/customers`, description: 'Customer analytics rollup.', authRequired: true },
      { method: 'GET', path: `${base}/analytics`, description: 'Dashboard analytics.', authRequired: true },
      { method: 'GET', path: `${base}/settings`, description: 'Get user settings.', authRequired: true },
      { method: 'PUT', path: `${base}/settings`, description: 'Update user settings.', authRequired: true },
    ],
    notes: [
      'All timestamps are ISO-8601.',
      'Most write endpoints return validation errors as HTTP 400.',
      'Protected endpoints return HTTP 401 when Authorization header is missing/invalid.',
    ],
  });
});

export default router;
