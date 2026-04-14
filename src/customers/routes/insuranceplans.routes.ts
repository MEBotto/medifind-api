import { Router } from 'express';
import InsurancePlansController from '../controllers/InsurancePlansController';
import InsurancePlansRepository from '../repositories/InsurancePlansRepository';
import InsurancePlansService from '../services/InsurancePlansService';
import { validate } from '@/middleware/validation.middleware';
import { authenticateJWT } from '@/middleware/auth.middleware';
import { CreateInsurancePlanSchema, UpdateInsurancePlanSchema } from '../dtos/insurance-plan.dto';

const router = Router();

const repository = new InsurancePlansRepository();
const service = new InsurancePlansService(repository);
const controller = new InsurancePlansController(service);

router.post('/', authenticateJWT, validate(CreateInsurancePlanSchema), controller.create);
router.get('/', authenticateJWT, controller.getAll);
router.get('/:id', authenticateJWT, controller.getById);
router.put('/:id', authenticateJWT, validate(UpdateInsurancePlanSchema), controller.update);
router.delete('/:id', authenticateJWT, controller.delete);

export default router;
