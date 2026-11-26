import { z } from 'zod';

const interval = z.object({
  dayOfWeek: z.number().int().min(1).max(7),
  opensAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  closesAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
}).strict().refine(item => item.opensAt !== item.closesAt, 'Use open24Hours for 24h opening');

export const PharmacyHoursSchema = z.object({
  weeklyHours: z.array(interval).max(28),
  open24Hours: z.boolean(),
}).strict();
