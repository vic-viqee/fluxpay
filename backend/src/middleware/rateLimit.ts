import { Request, Response, NextFunction } from 'express';

type LimitBucket = {
  count: number;
  windowStart: number;
};

const getClientIp = (req: Request) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
};

export const createRateLimiter = (options: {
  windowMs: number;
  maxRequests: number;
  keyFn?: (req: Request) => string;
  message?: string;
}) => {
  const buckets = new Map<string, LimitBucket>();
  const keyFn = options.keyFn || ((req: Request) => getClientIp(req));

  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets.entries()) {
      if (now - bucket.windowStart > options.windowMs) {
        buckets.delete(key);
      }
    }
  }, Math.max(options.windowMs, 60_000));

  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyFn(req) || 'unknown';
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || now - existing.windowStart > options.windowMs) {
      buckets.set(key, { count: 1, windowStart: now });
      return next();
    }

    if (existing.count >= options.maxRequests) {
      return res.status(429).json({
        message: options.message || 'Too many requests. Please try again later.',
      });
    }

    existing.count += 1;
    buckets.set(key, existing);
    return next();
  };
};

export const globalRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 120,
  message: 'Too many requests from this IP. Please slow down.',
});

// Stricter limiter for sensitive auth endpoints (Login, Signup, Google Exchange)
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // 10 attempts
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
});

// Very strict limiter for password reset requests
export const passwordResetRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 attempts
  message: 'Too many password reset requests. Please try again after an hour.',
});
