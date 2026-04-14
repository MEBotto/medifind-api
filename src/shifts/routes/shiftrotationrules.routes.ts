import { Router } from 'express';
import ShiftRotationRulesController from '../controllers/ShiftRotationRulesController';
import ShiftRotationRulesRepository from '../repositories/ShiftRotationRulesRepository';
import ShiftRotationRulesService from '../services/ShiftRotationRulesService';
import { validate } from '@/middleware/validation.middleware';
import { authenticateJWT } from '@/middleware/auth.middleware';
import { CreateShiftRotationRuleSchema, UpdateShiftRotationRuleSchema } from '../dtos/shift-rotation-rule.dto';

const router = Router();

const repository = new ShiftRotationRulesRepository();
const service = new ShiftRotationRulesService(repository);
const controller = new ShiftRotationRulesController(service);

router.post('/', authenticateJWT, validate(CreateShiftRotationRuleSchema), controller.create);
router.get('/', authenticateJWT, controller.getAll);
router.get('/:id', authenticateJWT, controller.getById);
router.put('/:id', authenticateJWT, validate(UpdateShiftRotationRuleSchema), controller.update);
router.delete('/:id', authenticateJWT, controller.delete);

export default router;
