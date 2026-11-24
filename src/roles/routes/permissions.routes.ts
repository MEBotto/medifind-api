import { Router } from 'express';
import PermissionsController from '../controllers/PermissionsController';
import PermissionsRepository from '../repositories/PermissionsRepository';
import PermissionsService from '../services/PermissionsService';
import { validate } from '@/middleware/validation.middleware';
import { authenticateJWT, requireRole } from '@/middleware/auth.middleware';
import { CreatePermissionSchema, UpdatePermissionSchema } from '../dtos/permission.dto';

const router = Router();

const repository = new PermissionsRepository();
const service = new PermissionsService(repository);
const controller = new PermissionsController(service);

// Permission administration is restricted to platform administrators.
router.use(authenticateJWT, requireRole('Admin'));

router.post('/', validate(CreatePermissionSchema), controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.put('/:id', validate(UpdatePermissionSchema), controller.update);
router.delete('/:id', controller.delete);

export default router;
