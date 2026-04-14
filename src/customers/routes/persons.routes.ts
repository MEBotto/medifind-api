import { Router } from 'express';
import PersonsController from '../controllers/PersonsController';
import PersonsRepository from '../repositories/PersonsRepository';
import PersonsService from '../services/PersonsService';
import { validate } from '@/middleware/validation.middleware';
import { authenticateJWT } from '@/middleware/auth.middleware';
import { CreatePersonSchema, UpdatePersonSchema } from '../dtos/person.dto';

const router = Router();

const repository = new PersonsRepository();
const service = new PersonsService(repository);
const controller = new PersonsController(service);

router.post('/', authenticateJWT, validate(CreatePersonSchema), controller.create);
router.get('/', authenticateJWT, controller.getAll);
router.get('/:id', authenticateJWT, controller.getById);
router.put('/:id', authenticateJWT, validate(UpdatePersonSchema), controller.update);
router.delete('/:id', authenticateJWT, controller.delete);

export default router;
