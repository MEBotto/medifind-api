import { Router } from 'express';
import PermissionsController from '../controllers/PermissionsController';
import PermissionsRepository from '../repositories/PermissionsRepository';
import PermissionsService from '../services/PermissionsService';
import { validate } from '@/middleware/validation.middleware';
import { authenticateJWT } from '@/middleware/auth.middleware';
import { CreatePermissionSchema, UpdatePermissionSchema } from '../dtos/permission.dto';

const router = Router();

const repository = new PermissionsRepository();
const service = new PermissionsService(repository);
const controller = new PermissionsController(service);

router.post('/', authenticateJWT, validate(CreatePermissionSchema), controller.create);
router.get('/', authenticateJWT, controller.getAll);
router.get('/:id', authenticateJWT, controller.getById);
router.put('/:id', authenticateJWT, validate(UpdatePermissionSchema), controller.update);
router.delete('/:id', authenticateJWT, controller.delete);

export default router;
