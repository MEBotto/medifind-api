import { Router } from 'express';
import PharmacysController from '../controllers/PharmacysController';
import PharmacysRepository from '../repositories/PharmacysRepository';
import PharmacysService from '../services/PharmacysService';
import { validate } from '@/middleware/validation.middleware';
import { authenticateJWT } from '@/middleware/auth.middleware';
import { CreatePharmacySchema, UpdatePharmacySchema } from '../dtos/pharmacy.dto';

const router = Router();

const repository = new PharmacysRepository();
const service = new PharmacysService(repository);
const controller = new PharmacysController(service);

router.post('/', authenticateJWT, validate(CreatePharmacySchema), controller.create);
router.get('/', authenticateJWT, controller.getAll);
router.get('/:id', authenticateJWT, controller.getById);
router.put('/:id', authenticateJWT, validate(UpdatePharmacySchema), controller.update);
router.delete('/:id', authenticateJWT, controller.delete);

export default router;
