import { NextFunction, Response } from 'express';
import { AuthRequest } from './types';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/apiError';

export function authMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Missing or invalid Authorization header');
    }
    const token = header.slice('Bearer '.length).trim();
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired access token'));
  }
}
