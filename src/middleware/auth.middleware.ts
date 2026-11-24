import { getJwtSecret } from '@/utils/jwt-secret';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string | null;
  };
}

export const authenticateJWT = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const match = /^Bearer\s+(\S+)$/i.exec(req.headers.authorization ?? '');
  if (!match) {
    return next(new AppError(401, 'Authorization token is missing or malformed'));
  }

  try {
    const decoded = jwt.verify(match[1], getJwtSecret());
    if (typeof decoded === 'string' ||
        typeof decoded.id !== 'string' ||
        typeof decoded.email !== 'string' ||
        (decoded.role !== null && typeof decoded.role !== 'string')) {
      return next(new AppError(401, 'Invalid authentication token'));
    }
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired authentication token'));
  }
};

export const requireRole = (requiredRole: string) =>
  (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError(401, 'Authentication required'));
    if (req.user.role !== requiredRole && req.user.role !== 'Admin') {
      return next(new AppError(403, 'Insufficient permissions'));
    }
    next();
  };
