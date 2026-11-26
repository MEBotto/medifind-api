import { Router, Response, NextFunction } from 'express';
import { authenticateJWT, requireRole, AuthRequest } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { AppError } from '@/middleware/error.middleware';
import { CatalogRequestStatus } from '../models/CatalogRequest';
import { CreateCatalogRequestSchema, ReviewCatalogRequestSchema } from '../dtos/catalog-request.dto';
import { CatalogRequestsService } from '../services/CatalogRequestsService';

const router = Router();
const service = new CatalogRequestsService();

router.post('/', authenticateJWT, requireRole('PHARMACIST'), validate(CreateCatalogRequestSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      res.status(201).json(await service.create(req.body, req.user));
    } catch (error) { next(error); }
  });

router.get('/', authenticateJWT, requireRole('ADMIN', 'PHARMACIST'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const rawStatus = req.query.status;
      if (rawStatus !== undefined && (typeof rawStatus !== 'string' ||
          !Object.values(CatalogRequestStatus).includes(rawStatus as CatalogRequestStatus))) {
        throw new AppError(400, 'Invalid status');
      }
      res.json(await service.list(req.user, rawStatus as CatalogRequestStatus | undefined));
    } catch (error) { next(error); }
  });

router.patch('/:id/review', authenticateJWT, requireRole('ADMIN'), validate(ReviewCatalogRequestSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      res.json(await service.review(req.params.id, req.body, req.user));
    } catch (error) { next(error); }
  });

export default router;
