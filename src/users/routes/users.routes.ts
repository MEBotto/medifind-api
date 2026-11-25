import { Router } from 'express';
import UsersController from '../controllers/UsersController';
import UsersRepository from '../repositories/UsersRepository';
import UsersService from '../services/UsersService';
import { validate } from '@/middleware/validation.middleware';
import { authenticateJWT, requireRole } from '@/middleware/auth.middleware';
import { UpdateUserSchema } from '../dtos/user.dto';
import { AdminCreateUserSchema } from '../dtos/admin-user.dto';
import { createAdminUser } from '../controllers/AdminUsersController';

const router = Router();

// Inicializar dependencias
const usersRepository = new UsersRepository();
const usersService = new UsersService(usersRepository);
const usersController = new UsersController(usersService);

// Las operaciones administrativas sobre usuarios requieren autenticación y rol Admin.
// El acceso al perfil propio se implementará mediante endpoints específicos (/me).
router.use(authenticateJWT, requireRole('ADMIN'));

router.post('/', validate(AdminCreateUserSchema), createAdminUser);
router.get('/:id', usersController.getUserById);
router.put('/:id', validate(UpdateUserSchema), usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

export default router;
