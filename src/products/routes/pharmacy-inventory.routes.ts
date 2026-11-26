import { Router, Response, NextFunction } from 'express';
import { authenticateJWT, requireRole, AuthRequest } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { AppError } from '@/middleware/error.middleware';
import { AddInventorySchema, UpdateInventorySchema } from '../dtos/pharmacy-inventory.dto';
import { PharmacyInventoryService } from '../services/PharmacyInventoryService';

const router = Router();
const service = new PharmacyInventoryService();
const actor = (req: AuthRequest) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  return req.user;
};

router.get('/catalog', authenticateJWT, requireRole('ADMIN', 'PHARMACIST'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (req.query.search !== undefined && typeof req.query.search !== 'string') throw new AppError(400, 'Invalid search');
      res.json(await service.catalog(req.query.search as string | undefined));
    } catch (error) { next(error); }
  });

router.get('/', authenticateJWT, requireRole('ADMIN', 'PHARMACIST'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (req.query.pharmacyId !== undefined && typeof req.query.pharmacyId !== 'string') throw new AppError(400, 'Invalid pharmacyId');
      res.json(await service.list(actor(req), req.query.pharmacyId as string | undefined));
    } catch (error) { next(error); }
  });

router.post('/', authenticateJWT, requireRole('ADMIN', 'PHARMACIST'), validate(AddInventorySchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { res.status(201).json(await service.add(req.body, actor(req))); } catch (error) { next(error); }
  });

router.patch('/:id', authenticateJWT, requireRole('ADMIN', 'PHARMACIST'), validate(UpdateInventorySchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { res.json(await service.update(req.params.id, req.body, actor(req))); } catch (error) { next(error); }
  });

router.delete('/:id', authenticateJWT, requireRole('ADMIN', 'PHARMACIST'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { res.json(await service.deactivate(req.params.id, actor(req))); } catch (error) { next(error); }
  });

export default router;
