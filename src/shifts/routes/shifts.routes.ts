import { Router } from 'express';
import ShiftsController from '../controllers/ShiftsController';
import ShiftsRepository from '../repositories/ShiftsRepository';
import ShiftsService from '../services/ShiftsService';
import { validate } from '@/middleware/validation.middleware';
import { authenticateJWT } from '@/middleware/auth.middleware';
import { CreateShiftSchema, UpdateShiftSchema } from '../dtos/shift.dto';

const router = Router();

const repository = new ShiftsRepository();
const service = new ShiftsService(repository);
const controller = new ShiftsController(service);

router.post('/', authenticateJWT, validate(CreateShiftSchema), controller.create);
router.get('/', authenticateJWT, controller.getAll);
router.get('/:id', authenticateJWT, controller.getById);
router.put('/:id', authenticateJWT, validate(UpdateShiftSchema), controller.update);
router.delete('/:id', authenticateJWT, controller.delete);

export default router;
