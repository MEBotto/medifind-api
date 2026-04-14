import { Router } from 'express';
import ShiftRotationRuleShiftsController from '../controllers/ShiftRotationRuleShiftsController';
import ShiftRotationRuleShiftsRepository from '../repositories/ShiftRotationRuleShiftsRepository';
import ShiftRotationRuleShiftsService from '../services/ShiftRotationRuleShiftsService';
import { authenticateJWT } from '@/middleware/auth.middleware';

const router = Router();

const repository = new ShiftRotationRuleShiftsRepository();
const service = new ShiftRotationRuleShiftsService(repository);
const controller = new ShiftRotationRuleShiftsController(service);

router.get('/:id', authenticateJWT, controller.getById);
router.delete('/:id', authenticateJWT, controller.delete);

export default router;
