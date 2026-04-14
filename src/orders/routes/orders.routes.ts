import { Router } from 'express';
import OrdersController from '../controllers/OrdersController';
import OrdersRepository from '../repositories/OrdersRepository';
import OrdersService from '../services/OrdersService';
import { validate } from '@/middleware/validation.middleware';
import { authenticateJWT } from '@/middleware/auth.middleware';
import { CreateOrderSchema, UpdateOrderSchema } from '../dtos/order.dto';

const router = Router();

const repository = new OrdersRepository();
const service = new OrdersService(repository);
const controller = new OrdersController(service);

router.post('/', authenticateJWT, validate(CreateOrderSchema), controller.create);
router.get('/', authenticateJWT, controller.getAll);
router.get('/:id', authenticateJWT, controller.getById);
router.put('/:id', authenticateJWT, validate(UpdateOrderSchema), controller.update);
router.delete('/:id', authenticateJWT, controller.delete);

export default router;
