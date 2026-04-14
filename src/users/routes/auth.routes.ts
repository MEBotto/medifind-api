import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import UsersRepository from '../repositories/UsersRepository';
import UsersService from '../services/UsersService';

const router = Router();

// Inicializar dependencias
const usersRepository = new UsersRepository();
const usersService = new UsersService(usersRepository);
const authController = new AuthController(usersService);

// Rutas de autenticación
router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;
