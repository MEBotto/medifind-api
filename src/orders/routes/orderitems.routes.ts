import { Router } from 'express';
import OrderItemsController from '../controllers/OrderItemsController';
import OrderItemsRepository from '../repositories/OrderItemsRepository';
import OrderItemsService from '../services/OrderItemsService';
import { validate } from '@/middleware/validation.middleware';
import { authenticateJWT } from '@/middleware/auth.middleware';
import { CreateOrderItemSchema, UpdateOrderItemSchema } from '../dtos/order-item.dto';

const router = Router();

const repository = new OrderItemsRepository();
const service = new OrderItemsService(repository);
const controller = new OrderItemsController(service);

router.post('/', authenticateJWT, validate(CreateOrderItemSchema), controller.create);
router.get('/', authenticateJWT, controller.getAll);
router.get('/:id', authenticateJWT, controller.getById);
router.put('/:id', authenticateJWT, validate(UpdateOrderItemSchema), controller.update);
router.delete('/:id', authenticateJWT, controller.delete);

export default router;
