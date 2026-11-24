import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

interface ValidationError {
  path: string;
  message: string;
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public validationErrors?: ValidationError[],
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      code: err.validationErrors ? 'VALIDATION_ERROR' : 'REQUEST_FAILED',
      message: err.message,
      ...(err.validationErrors && { errors: err.validationErrors }),
    });
  }

  logger.error('Unhandled request error:', err);
  return res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
  });
};
