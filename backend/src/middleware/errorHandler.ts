import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ApiErrorResponse } from '../types/index.js';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware
 */
export const errorHandler = (
  err: Error | ApiError | Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error: ApiError = err instanceof ApiError ? err : new ApiError(err.message);

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        error = new ApiError('Resource already exists', 409);
        break;
      case 'P2003':
        error = new ApiError('Foreign key constraint failed', 400);
        break;
      case 'P2025':
        error = new ApiError('Record not found', 404);
        break;
      case 'P2027':
        error = new ApiError('Database connection error', 503);
        break;
      default:
        error = new ApiError('Database operation failed', 500);
    }
  }

  // Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    error = new ApiError('Invalid data provided', 400);
  }

  // Mongoose validation error (legacy support)
  if (err.name === 'ValidationError' && 'errors' in err) {
    const mongooseErr = err as { errors: Record<string, { message: string }> };
    const message = Object.values(mongooseErr.errors).map(val => val.message).join(', ');
    error = new ApiError(message, 400);
  }

  // Mongoose duplicate key error (legacy support)
  if ('code' in err && err.code === '11000' && 'keyValue' in err) {
    const duplicateErr = err as { keyValue: Record<string, unknown> };
    const field = Object.keys(duplicateErr.keyValue)[0];
    const message = `${field} already exists`;
    error = new ApiError(message, 409);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError('Token expired', 401);
  }

  // Cast error (invalid ID)
  if (err.name === 'CastError') {
    error = new ApiError('Invalid resource ID', 400);
  }

  // Syntax error (invalid JSON)
  if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
    error = new ApiError('Invalid JSON format', 400);
  }

  // Default error handling
  if (!error.statusCode) {
    error = new ApiError('Internal server error', 500);
  }

  // Prepare error response
  const errorResponse: ApiErrorResponse = {
    success: false,
    message: error.message,
    error: error.name,
    statusCode: error.statusCode,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  };

  // Add stack trace in development
  if (process.env['NODE_ENV'] === 'development') {
    if (error.stack) {
      (errorResponse as ApiErrorResponse & { stack?: string; details?: unknown }).stack = error.stack;
    }
    (errorResponse as ApiErrorResponse & { stack?: string; details?: unknown }).details = error;
  }

  // Send error response
  res.status(error.statusCode).json(errorResponse);
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new ApiError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Async error wrapper for controllers
 */
export const asyncHandler = <T extends Request, U extends Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<void>
) => {
  return (req: T, res: U, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default errorHandler;
