import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-medifind-key';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new AppError(403, 'Token inválido o expirado'));
      }
      
      req.user = decoded as any;
      next();
    });
  } else {
    next(new AppError(401, 'Falta el token de autorización'));
  }
};

export const requireRole = (requiredRole: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Usuario no autenticado'));
    }

    if (req.user.role !== requiredRole && req.user.role !== 'Admin') { // Admins override
      return next(new AppError(403, `Requiere rol de ${requiredRole} para esta acción`));
    }

    next();
  };
};
