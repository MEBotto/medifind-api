import { Router, Response } from 'express';
import { z } from 'zod';
import { PharmacySearchSchema } from '../dtos/pharmacy-search.dto';
import { activeDutyDate } from '@/shifts/utils/active-duty-date';
import { ShiftCalendarService } from '@/shifts/services/ShiftCalendarService';
import { distanceKm } from '../utils/availability';
import { availabilityDetails } from '../utils/availability-details';
import { AuthRequest, requirePharmacyAccess } from '@/middleware/auth.middleware';
import AppDataSource from '@/data-source';
import { Pharmacy } from '../models/Pharmacy';
import { PharmacyHoursSchema } from '../dtos/pharmacy-hours.dto';
import { sendSuccess, sendError } from '@/utils/api.utils';
import { logger } from '@/utils/logger';
import PharmacysController from '../controllers/PharmacysController';
import PharmacysRepository from '../repositories/PharmacysRepository';
import PharmacysService from '../services/PharmacysService';
import { validate } from '@/middleware/validation.middleware';
import { authenticateJWT, requireRole } from '@/middleware/auth.middleware';
import { CreatePharmacySchema, UpdatePharmacySchema } from '../dtos/pharmacy.dto';

const router = Router();

const repository = new PharmacysRepository();
const service = new PharmacysService(repository);
const controller = new PharmacysController(service);

router.post('/', authenticateJWT, requireRole('ADMIN'), validate(CreatePharmacySchema), controller.create);
router.get('/', authenticateJWT, controller.getAll);

const NearbySchema = z.object({
  lat: z.coerce.number().finite().min(-90).max(90),
  lng: z.coerce.number().finite().min(-180).max(180),
  radiusKm: z.coerce.number().positive().max(500).default(10),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

// Route before /:id to prevent "nearby" from being interpreted as a pharmacy ID.
router.get('/nearby', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const parsed = NearbySchema.safeParse(req.query);
  if (!parsed.success) {
    sendError(res, 'Parámetros inválidos', 400, parsed.error.issues.map(issue => ({
      path: issue.path.join('.'), message: issue.message,
    })));
    return;
  }
  if (!req.user) { sendError(res, 'Authentication required', 401); return; }
  try {
    const { lat, lng, radiusKm, page, limit } = parsed.data;
    const now = new Date();
    const dutyDate = activeDutyDate(now);
    const [year, month, day] = dutyDate.split('-').map(Number);
    let activeShiftId: string | undefined;
    try {
      const calendar = await new ShiftCalendarService().getCalendar(year, month);
      activeShiftId = calendar.days[day - 1]?.shiftId;
    } catch (error) {
      // Availability can still be shown using regular opening hours when no calendar exists.
      if (!(error instanceof Error && 'statusCode' in error && error.statusCode === 404)) throw error;
    }
    const filters = PharmacySearchSchema.parse({
      lat, lng, radiusKm, orderBy: 'distance', page, limit,
    });
    const result = await service.getAllPharmacys(filters, req.user.id);
    const data = result.data.map(pharmacy => {
      const distance = distanceKm(lat, lng, Number(pharmacy.lat), Number(pharmacy.lng));
      return {
        id: pharmacy.id, name: pharmacy.name, address: pharmacy.adress,
        lat: Number(pharmacy.lat), lng: Number(pharmacy.lng),
        distanceKm: Math.round(distance * 100) / 100,
        ...availabilityDetails(pharmacy, now, activeShiftId),
        open24Hours: pharmacy.open24Hours,
        weeklyHours: pharmacy.weeklyHours,
      };
    });
    sendSuccess(res, { ...result, data, checkedAt: now.toISOString(), timeZone: 'America/Argentina/Buenos_Aires' });
  } catch (error) {
    logger.error('Error buscando farmacias cercanas:', error);
    sendError(res, 'Error al buscar farmacias cercanas', 500);
  }
});

router.put('/:pharmacyId/hours', authenticateJWT, requirePharmacyAccess, validate(PharmacyHoursSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const repository = AppDataSource.getRepository(Pharmacy);
      const pharmacy = await repository.findOneBy({ id: req.params.pharmacyId });
      if (!pharmacy) { sendError(res, 'Farmacia no encontrada', 404); return; }
      pharmacy.weeklyHours = req.body.weeklyHours;
      pharmacy.open24Hours = req.body.open24Hours;
      const saved = await repository.save(pharmacy);
      sendSuccess(res, { id: saved.id, weeklyHours: saved.weeklyHours, open24Hours: saved.open24Hours },
        'Horarios actualizados');
    } catch (error) {
      logger.error('Error actualizando horarios de farmacia:', error);
      sendError(res, 'Error interno del servidor');
    }
  });

router.get('/:id/availability', authenticateJWT, async (req: AuthRequest, res: Response) => {
  if (!z.string().uuid().safeParse(req.params.id).success) {
    sendError(res, 'ID de farmacia inválido', 400); return;
  }
  try {
    const pharmacy = await repository.findById(req.params.id);
    if (!pharmacy) { sendError(res, 'Farmacia no encontrada', 404); return; }
    const now = new Date();
    const date = activeDutyDate(now);
    const [year, month, day] = date.split('-').map(Number);
    let activeShiftId: string | undefined;
    let dutyEndsAt: string | null = null;
    let calendarAvailable = false;
    try {
      const calendar = await new ShiftCalendarService().getCalendar(year, month);
      calendarAvailable = true;
      activeShiftId = calendar.days[day - 1]?.shiftId;
      if (activeShiftId && pharmacy.shift?.id === activeShiftId) {
        // 08:00 Argentina = 11:00 UTC (Argentina currently has no DST).
        const nextDay = new Date(`${date}T11:00:00.000Z`);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);
        dutyEndsAt = nextDay.toISOString();
      }
    } catch (error) {
      if (!(error instanceof Error && 'statusCode' in error && error.statusCode === 404)) throw error;
    }
    sendSuccess(res, {
      id: pharmacy.id, name: pharmacy.name, address: pharmacy.adress,
      phone: pharmacy.phone, lat: pharmacy.lat, lng: pharmacy.lng,
      shiftCode: pharmacy.shift?.code?.trim() ?? null,
      open24Hours: pharmacy.open24Hours, weeklyHours: pharmacy.weeklyHours,
      ...availabilityDetails(pharmacy, now, activeShiftId),
      dutyEndsAt, calendarAvailable, checkedAt: now.toISOString(),
      timeZone: 'America/Argentina/Buenos_Aires',
    });
  } catch (error) {
    logger.error('Error consultando disponibilidad de farmacia:', error);
    sendError(res, 'Error al consultar disponibilidad', 500);
  }
});

router.get('/:id', authenticateJWT, controller.getById);
router.put('/:id', authenticateJWT, requireRole('ADMIN'), validate(UpdatePharmacySchema), controller.update);
router.delete('/:id', authenticateJWT, requireRole('ADMIN'), controller.delete);

export default router;
