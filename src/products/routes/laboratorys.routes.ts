import { Router } from 'express';
import LaboratorysController from '../controllers/LaboratorysController';
import LaboratorysRepository from '../repositories/LaboratorysRepository';
import LaboratorysService from '../services/LaboratorysService';
import { validate } from '@/middleware/validation.middleware';
import { authenticateJWT } from '@/middleware/auth.middleware';
import { CreateLaboratorySchema, UpdateLaboratorySchema } from '../dtos/laboratory.dto';

const router = Router();

const repository = new LaboratorysRepository();
const service = new LaboratorysService(repository);
const controller = new LaboratorysController(service);

router.post('/', authenticateJWT, validate(CreateLaboratorySchema), controller.create);
router.get('/', authenticateJWT, controller.getAll);
router.get('/:id', authenticateJWT, controller.getById);
router.put('/:id', authenticateJWT, validate(UpdateLaboratorySchema), controller.update);
router.delete('/:id', authenticateJWT, controller.delete);

export default router;
