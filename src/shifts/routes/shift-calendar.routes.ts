import { Router } from 'express';
import { Response } from 'express';
import { AuthRequest, authenticateJWT, requireRole } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { sendSuccess, sendError } from '@/utils/api.utils';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';
import { AnnualShiftConfigSchema, CalendarQuerySchema } from '../dtos/annual-shift-config.dto';
import { ShiftCalendarService } from '../services/ShiftCalendarService';

const router = Router();
const service = new ShiftCalendarService();

router.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const parsed = CalendarQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    sendError(res, 'Parámetros inválidos', 400, parsed.error.flatten().fieldErrors);
    return;
  }
  try {
    sendSuccess(res, await service.getCalendar(parsed.data.year, parsed.data.month));
  } catch (error) {
    if (error instanceof AppError) sendError(res, error.message, error.statusCode);
    else { logger.error('Error consultando calendario:', error); sendError(res, 'Error interno del servidor'); }
  }
});

router.put('/annual', authenticateJWT, requireRole('ADMIN'), validate(AnnualShiftConfigSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      await service.configureYear(req.body);
      sendSuccess(res, { year: req.body.year }, 'Calendario anual configurado');
    } catch (error) {
      if (error instanceof AppError) sendError(res, error.message, error.statusCode);
      else { logger.error('Error configurando calendario:', error); sendError(res, 'Error interno del servidor'); }
    }
  });

export default router;
