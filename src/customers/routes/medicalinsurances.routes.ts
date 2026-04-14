import { Router } from 'express';
import MedicalInsurancesController from '../controllers/MedicalInsurancesController';
import MedicalInsurancesRepository from '../repositories/MedicalInsurancesRepository';
import MedicalInsurancesService from '../services/MedicalInsurancesService';
import { validate } from '@/middleware/validation.middleware';
import { authenticateJWT } from '@/middleware/auth.middleware';
import { CreateMedicalInsuranceSchema, UpdateMedicalInsuranceSchema } from '../dtos/medical-insurance.dto';

const router = Router();

const repository = new MedicalInsurancesRepository();
const service = new MedicalInsurancesService(repository);
const controller = new MedicalInsurancesController(service);

router.post('/', authenticateJWT, validate(CreateMedicalInsuranceSchema), controller.create);
router.get('/', authenticateJWT, controller.getAll);
router.get('/:id', authenticateJWT, controller.getById);
router.put('/:id', authenticateJWT, validate(UpdateMedicalInsuranceSchema), controller.update);
router.delete('/:id', authenticateJWT, controller.delete);

export default router;
