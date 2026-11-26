import { Router, Response } from 'express';
import { AuthRequest, requirePharmacyAccess } from '@/middleware/auth.middleware';
import AppDataSource from '@/data-source';
import { Pharmacy } from '../models/Pharmacy';
import { PharmacyHoursSchema } from '../dtos/pharmacy-hours.dto';
import { sendSuccess, sendError } from '@/utils/api.utils';
import { logger } from '@/utils/logger';
import PharmacysController from '../controllers/PharmacysController';
import PharmacysRepository from '../repositories/PharmacysRepository';
import PharmacysService from '../services/PharmacysService';
import { validate } from '@/middleware/validation.middleware';
import { authenticateJWT, requireRole } from '@/middleware/auth.middleware';
import { CreatePharmacySchema, UpdatePharmacySchema } from '../dtos/pharmacy.dto';

const router = Router();

const repository = new PharmacysRepository();
const service = new PharmacysService(repository);
const controller = new PharmacysController(service);

router.post('/', authenticateJWT, requireRole('ADMIN'), validate(CreatePharmacySchema), controller.create);
router.get('/', authenticateJWT, controller.getAll);
router.put('/:pharmacyId/hours', authenticateJWT, requirePharmacyAccess, validate(PharmacyHoursSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const repository = AppDataSource.getRepository(Pharmacy);
      const pharmacy = await repository.findOneBy({ id: req.params.pharmacyId });
      if (!pharmacy) { sendError(res, 'Farmacia no encontrada', 404); return; }
      pharmacy.weeklyHours = req.body.weeklyHours;
      pharmacy.open24Hours = req.body.open24Hours;
      const saved = await repository.save(pharmacy);
      sendSuccess(res, { id: saved.id, weeklyHours: saved.weeklyHours, open24Hours: saved.open24Hours },
        'Horarios actualizados');
    } catch (error) {
      logger.error('Error actualizando horarios de farmacia:', error);
      sendError(res, 'Error interno del servidor');
    }
  });
router.get('/:id', authenticateJWT, controller.getById);
router.put('/:id', authenticateJWT, requireRole('ADMIN'), validate(UpdatePharmacySchema), controller.update);
router.delete('/:id', authenticateJWT, requireRole('ADMIN'), controller.delete);

export default router;
