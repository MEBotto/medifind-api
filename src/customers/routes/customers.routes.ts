import { Router } from 'express';
import CustomersController from '../controllers/CustomersController';
import CustomersRepository from '../repositories/CustomersRepository';
import CustomersService from '../services/CustomersService';
import { validate } from '@/middleware/validation.middleware';
import { authenticateJWT } from '@/middleware/auth.middleware';
import { CreateCustomerSchema, UpdateCustomerSchema } from '../dtos/customer.dto';

const router = Router();

const repository = new CustomersRepository();
const service = new CustomersService(repository);
const controller = new CustomersController(service);

router.post('/', authenticateJWT, validate(CreateCustomerSchema), controller.create);
router.get('/', authenticateJWT, controller.getAll);
router.get('/:id', authenticateJWT, controller.getById);
router.put('/:id', authenticateJWT, validate(UpdateCustomerSchema), controller.update);
router.delete('/:id', authenticateJWT, controller.delete);

export default router;
