import { Router, Request, Response, NextFunction } from 'express';
import { AppError } from '@/middleware/error.middleware';
import { PublicCatalogQuerySchema, PublicProductIdSchema } from '../dtos/public-catalog.dto';
import { PublicCatalogService } from '../services/PublicCatalogService';

const router = Router();
const service = new PublicCatalogService();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = PublicCatalogQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new AppError(400, 'Invalid search parameters');
    res.json(await service.search(parsed.data));
  } catch (error) { next(error); }
});

router.get('/:productId/pharmacies', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = PublicProductIdSchema.safeParse(req.params.productId);
    if (!parsed.success) throw new AppError(400, 'Invalid product id');
    res.json(await service.pharmacies(parsed.data));
  } catch (error) { next(error); }
});

export default router;
