import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from '../services/AuditLogService';
import { logger } from '@/utils/logger';
import { AuthRequest } from '@/middleware/auth.middleware';

const audit = new AuditLogService();

/**
 * Records mutation attempts and outcomes without persisting request bodies, tokens
 * or query parameters. Business-critical mutations should additionally audit in
 * their own database transaction.
 */
export const auditMutations = (req: Request, res: Response, next: NextFunction): void => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) { next(); return; }
  res.on('finish', () => {
    const auth = (req as AuthRequest).user;
    void audit.record({
      userId: auth?.id ?? null,
      pharmacyId: auth?.pharmacyId ?? null,
      action: 'HTTP_' + req.method,
      entityType: 'HttpRequest',
      metadata: { path: req.route?.path ?? req.path, statusCode: res.statusCode },
      ipAddress: req.ip || null,
      userAgent: (req.get('user-agent') || '').slice(0, 1000) || null,
    }).catch(error => logger.error('Audit write failed:', error));
  });
  next();
};
