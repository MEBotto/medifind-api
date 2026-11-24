import { Router } from 'express';
import RolesController from '../controllers/RolesController';
import RolesRepository from '../repositories/RolesRepository';
import RolesService from '../services/RolesService';
import { validate } from '@/middleware/validation.middleware';
import { authenticateJWT, requireRole } from '@/middleware/auth.middleware';
import { CreateRoleSchema, UpdateRoleSchema } from '../dtos/role.dto';

const router = Router();

const repository = new RolesRepository();
const service = new RolesService(repository);
const controller = new RolesController(service);

// Role administration is restricted to platform administrators.
router.use(authenticateJWT, requireRole('Admin'));

router.post('/', validate(CreateRoleSchema), controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.put('/:id', validate(UpdateRoleSchema), controller.update);
router.delete('/:id', controller.delete);

export default router;
