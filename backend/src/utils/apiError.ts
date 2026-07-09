export class ApiError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: unknown;

  constructor(statusCode: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message = 'Bad Request', details?: unknown) {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }
  static unauthorized(message = 'Unauthorized', details?: unknown) {
    return new ApiError(401, message, 'UNAUTHORIZED', details);
  }
  static forbidden(message = 'Forbidden', details?: unknown) {
    return new ApiError(403, message, 'FORBIDDEN', details);
  }
  static notFound(message = 'Not Found', details?: unknown) {
    return new ApiError(404, message, 'NOT_FOUND', details);
  }
  static conflict(message = 'Conflict', details?: unknown) {
    return new ApiError(409, message, 'CONFLICT', details);
  }
  static tooManyRequests(message = 'Too many requests', details?: unknown) {
    return new ApiError(429, message, 'TOO_MANY_REQUESTS', details);
  }
  static internal(message = 'Internal Server Error', details?: unknown) {
    return new ApiError(500, message, 'INTERNAL', details);
  }
}
