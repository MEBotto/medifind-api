import { Router } from 'express';
import RolePermissionsController from '../controllers/RolePermissionsController';
import RolePermissionsRepository from '../repositories/RolePermissionsRepository';
import RolePermissionsService from '../services/RolePermissionsService';
import { authenticateJWT, requireRole } from '@/middleware/auth.middleware';

const router = Router();

const repository = new RolePermissionsRepository();
const service = new RolePermissionsService(repository);
const controller = new RolePermissionsController(service);
router.use(authenticateJWT, requireRole('ADMIN'));

router.get('/:id', controller.getById);
router.delete('/:id', controller.delete);

export default router;
