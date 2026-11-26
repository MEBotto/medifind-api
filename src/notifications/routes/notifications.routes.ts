import { Router, Response, NextFunction } from 'express';
import { authenticateJWT, AuthRequest } from '@/middleware/auth.middleware';
import { AppError } from '@/middleware/error.middleware';
import AppDataSource from '@/data-source';
import { Notification } from '../models/Notification';

const router = Router();
router.use(authenticateJWT);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const unread = req.query.unread === 'true';
    if (req.query.unread !== undefined && req.query.unread !== 'true' && req.query.unread !== 'false')
      throw new AppError(400, 'Invalid unread filter');
    const repo = AppDataSource.getRepository(Notification);
    const query = repo.createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId: req.user.id })
      .orderBy('notification.createdAt', 'DESC').take(100);
    if (unread) query.andWhere('notification.readAt IS NULL');
    const [data, total] = await query.getManyAndCount();
    res.json({ data, total });
  } catch (error) { next(error); }
});

router.patch('/:id/read', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(req.params.id))
      throw new AppError(400, 'Invalid notification id');
    const repo = AppDataSource.getRepository(Notification);
    const result = await repo.createQueryBuilder().update(Notification)
      .set({ readAt: () => 'COALESCE("readAt", now())' })
      .where('id = :id AND "userId" = :userId', { id: req.params.id, userId: req.user.id })
      .execute();
    if (!result.affected) throw new AppError(404, 'Notification not found');
    res.json({ success: true });
  } catch (error) { next(error); }
});
export default router;
