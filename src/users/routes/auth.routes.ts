import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import UsersRepository from '../repositories/UsersRepository';
import UsersService from '../services/UsersService';
import { validate } from '@/middleware/validation.middleware';
import { CreateUserSchema } from '../dtos/user.dto';
import { LoginSchema } from '../dtos/auth.dto';

const router = Router();
const usersRepository = new UsersRepository();
const usersService = new UsersService(usersRepository);
const authController = new AuthController(usersService);

router.post('/register', validate(CreateUserSchema), authController.register);
router.post('/login', validate(LoginSchema), authController.login);

export default router;
