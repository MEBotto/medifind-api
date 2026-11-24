import { getJwtSecret } from '@/utils/jwt-secret';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AppDataSource from '@/data-source';
import { User } from '@/users/models/User';
import { AppError } from './error.middleware';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string | null; pharmacyId: string | null };
}

export const authenticateJWT = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  const match = /^Bearer\s+(\S+)$/i.exec(req.headers.authorization ?? '');
  if (!match) { next(new AppError(401, 'Authorization token is missing or malformed')); return; }
  let decoded: jwt.JwtPayload;
  try {
    const payload = jwt.verify(match[1], getJwtSecret());
    if (typeof payload === 'string' || typeof payload.id !== 'string' || typeof payload.email !== 'string') {
      next(new AppError(401, 'Invalid authentication token')); return;
    }
    decoded = payload;
  } catch {
    next(new AppError(401, 'Invalid or expired authentication token')); return;
  }
  try {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: decoded.id }, relations: { role: true, pharmacy: true },
    });
    if (!user || user.email !== decoded.email) { next(new AppError(401, 'Account no longer available')); return; }
    req.user = {
      id: user.id, email: user.email, role: user.role?.code ?? null,
      pharmacyId: user.pharmacy?.id ?? null,
    };
    next();
  } catch (error) { next(error); }
};

export const requireRole = (...allowedRoles: string[]) =>
  (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) { next(new AppError(401, 'Authentication required')); return; }
    if (!req.user.role || (!allowedRoles.includes(req.user.role) && req.user.role !== 'ADMIN')) {
      next(new AppError(403, 'Insufficient permissions')); return;
    }
    next();
  };

/** Apply to routes with a :pharmacyId parameter; ADMIN may manage any pharmacy. */
export const requirePharmacyAccess = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  if (!req.user) { next(new AppError(401, 'Authentication required')); return; }
  if (req.user.role === 'ADMIN') { next(); return; }
  if (req.user.role !== 'PHARMACIST' || !req.user.pharmacyId ||
      req.user.pharmacyId !== req.params.pharmacyId) {
    next(new AppError(403, 'Pharmacy access denied')); return;
  }
  next();
};
