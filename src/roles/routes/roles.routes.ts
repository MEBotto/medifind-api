import { Router } from 'express';
import RolesController from '../controllers/RolesController';
import RolesRepository from '../repositories/RolesRepository';
import RolesService from '../services/RolesService';
import { validate } from '@/middleware/validation.middleware';
import { authenticateJWT } from '@/middleware/auth.middleware';
import { CreateRoleSchema, UpdateRoleSchema } from '../dtos/role.dto';

const router = Router();

const repository = new RolesRepository();
const service = new RolesService(repository);
const controller = new RolesController(service);

router.post('/', authenticateJWT, validate(CreateRoleSchema), controller.create);
router.get('/', authenticateJWT, controller.getAll);
router.get('/:id', authenticateJWT, controller.getById);
router.put('/:id', authenticateJWT, validate(UpdateRoleSchema), controller.update);
router.delete('/:id', authenticateJWT, controller.delete);

export default router;
