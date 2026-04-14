import { Router } from 'express';
import FavouritePharmacysController from '../controllers/FavouritePharmacysController';
import FavouritePharmacysRepository from '../repositories/FavouritePharmacysRepository';
import FavouritePharmacysService from '../services/FavouritePharmacysService';
import { validate } from '@/middleware/validation.middleware';
import { authenticateJWT } from '@/middleware/auth.middleware';
import { CreateFavouritePharmacySchema, UpdateFavouritePharmacySchema } from '../dtos/favourite-pharmacy.dto';

const router = Router();

const repository = new FavouritePharmacysRepository();
const service = new FavouritePharmacysService(repository);
const controller = new FavouritePharmacysController(service);

router.post('/', authenticateJWT, validate(CreateFavouritePharmacySchema), controller.create);
router.get('/', authenticateJWT, controller.getAll);
router.get('/:id', authenticateJWT, controller.getById);
router.put('/:id', authenticateJWT, validate(UpdateFavouritePharmacySchema), controller.update);
router.delete('/:id', authenticateJWT, controller.delete);

export default router;
