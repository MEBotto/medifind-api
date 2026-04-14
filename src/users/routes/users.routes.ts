import { Router } from 'express';
import UsersController from '../controllers/UsersController';
import UsersRepository from '../repositories/UsersRepository';
import UsersService from '../services/UsersService';
import { validate } from '@/middleware/validation.middleware';
import { authenticateJWT, requireRole } from '@/middleware/auth.middleware';
import { CreateUserSchema, UpdateUserSchema } from '../dtos/user.dto';

const router = Router();

// Inicializar dependencias
const usersRepository = new UsersRepository();
const usersService = new UsersService(usersRepository);
const usersController = new UsersController(usersService);

// Rutas de usuarios (Creating a new user manually requires Admin role)
router.post('/', authenticateJWT, requireRole('Admin'), validate(CreateUserSchema), usersController.createUser);

router.get('/:id', usersController.getUserById);

router.put('/:id', validate(UpdateUserSchema), usersController.updateUser);

router.delete('/:id', usersController.deleteUser);

export default router;
