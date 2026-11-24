import { Router } from 'express';
import ProductsController from '../controllers/ProductsController';
import ProductsRepository from '../repositories/ProductsRepository';
import ProductsService from '../services/ProductsService';
import { validate } from '@/middleware/validation.middleware';
import { authenticateJWT, requireRole } from '@/middleware/auth.middleware';
import { CreateProductSchema, UpdateProductSchema } from '../dtos/product.dto';

const router = Router();

const repository = new ProductsRepository();
const service = new ProductsService(repository);
const controller = new ProductsController(service);

router.post('/', authenticateJWT, requireRole('ADMIN', 'PHARMACIST'), validate(CreateProductSchema), controller.create);
router.get('/', authenticateJWT, controller.getAll);
router.get('/:id', authenticateJWT, controller.getById);
router.put('/:id', authenticateJWT, requireRole('ADMIN', 'PHARMACIST'), validate(UpdateProductSchema), controller.update);
router.delete('/:id', authenticateJWT, requireRole('ADMIN', 'PHARMACIST'), controller.delete);

export default router;
