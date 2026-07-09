import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { ApiError } from '../utils/apiError';

export const authRateLimiter = rateLimit({
  windowMs: env.authRateLimit.windowMs,
  max: env.authRateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(ApiError.tooManyRequests('Too many attempts, please try again later'));
  },
});
