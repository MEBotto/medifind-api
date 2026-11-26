import { z } from 'zod';

const numeric = z.coerce.number().finite();
export const PharmacySearchSchema = z.object({
  search: z.string().trim().max(150).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  lat: numeric.min(-90).max(90).optional(),
  lng: numeric.min(-180).max(180).optional(),
  radiusKm: numeric.positive().max(500).optional(),
  orderBy: z.enum(['name', 'distance']).default('name'),
  order: z.enum(['ASC', 'DESC']).default('ASC'),
}).refine(data => (data.lat === undefined) === (data.lng === undefined), {
  message: 'lat and lng must be provided together', path: ['lng'],
}).refine(data => data.radiusKm === undefined || data.lat !== undefined, {
  message: 'radiusKm requires lat and lng', path: ['radiusKm'],
}).refine(data => data.orderBy !== 'distance' || data.lat !== undefined, {
  message: 'distance ordering requires lat and lng', path: ['orderBy'],
});
export type PharmacySearchDTO = z.infer<typeof PharmacySearchSchema>;
