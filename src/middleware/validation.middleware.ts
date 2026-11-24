import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { AppError } from './error.middleware';
import { logger } from '@/utils/logger';

export const validate =
  (schema: ZodTypeAny) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        logger.warn('Request validation failed', { errors });
        next(new AppError(400, 'Validation failed', errors));
      } else {
        next(error);
      }
    }
  };
