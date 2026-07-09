import { NextFunction, Request, Response } from 'express';
import { MongoServerError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';
import { ZodError } from 'zod';
import { ApiError } from '../utils/apiError';
import { env } from '../config/env';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: { message: err.message, code: err.code, details: err.details },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
      },
    });
    return;
  }

  if (err instanceof MongooseError.ValidationError) {
    res.status(400).json({
      error: {
        message: 'Validation failed',
        code: 'MONGOOSE_VALIDATION',
        details: Object.values(err.errors).map((e) => ({
          path: e.path,
          message: e.message,
        })),
      },
    });
    return;
  }

  if (
    err instanceof MongoServerError &&
    err.code === 11000
  ) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
    res.status(409).json({
      error: { message: `Duplicate value for ${field}`, code: 'DUPLICATE' },
    });
    return;
  }

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: { message: 'Invalid JSON body', code: 'BAD_JSON' } });
    return;
  }

  const message =
    err instanceof Error ? err.message : 'Unexpected error occurred';
  const statusCode = env.isProd ? 500 : 500;
  if (!env.isProd) {
    console.error('Unhandled error:', err);
  }
  res.status(statusCode).json({
    error: { message: env.isProd ? 'Internal Server Error' : message, code: 'INTERNAL' },
  });
}
