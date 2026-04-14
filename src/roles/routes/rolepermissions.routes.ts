import { Router } from 'express';
import RolePermissionsController from '../controllers/RolePermissionsController';
import RolePermissionsRepository from '../repositories/RolePermissionsRepository';
import RolePermissionsService from '../services/RolePermissionsService';
import { authenticateJWT } from '@/middleware/auth.middleware';

const router = Router();

const repository = new RolePermissionsRepository();
const service = new RolePermissionsService(repository);
const controller = new RolePermissionsController(service);

router.get('/:id', authenticateJWT, controller.getById);
router.delete('/:id', authenticateJWT, controller.delete);

export default router;
