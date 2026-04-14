import { Router } from 'express';
import CategorysController from '../controllers/CategorysController';
import CategorysRepository from '../repositories/CategorysRepository';
import CategorysService from '../services/CategorysService';
import { validate } from '@/middleware/validation.middleware';
import { authenticateJWT } from '@/middleware/auth.middleware';
import { CreateCategorySchema, UpdateCategorySchema } from '../dtos/category.dto';

const router = Router();

const repository = new CategorysRepository();
const service = new CategorysService(repository);
const controller = new CategorysController(service);

router.post('/', authenticateJWT, validate(CreateCategorySchema), controller.create);
router.get('/', authenticateJWT, controller.getAll);
router.get('/:id', authenticateJWT, controller.getById);
router.put('/:id', authenticateJWT, validate(UpdateCategorySchema), controller.update);
router.delete('/:id', authenticateJWT, controller.delete);

export default router;
