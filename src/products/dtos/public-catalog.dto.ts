import { z } from 'zod';

export const PublicCatalogQuerySchema = z.object({
  q: z.string().trim().min(2).max(100),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
}).strict();

export const PublicProductIdSchema = z.string().uuid();
export type PublicCatalogQuery = z.infer<typeof PublicCatalogQuerySchema>;

const coordinate = z.coerce.number().finite();
export const ProductPharmaciesQuerySchema = z.object({
  lat: coordinate.min(-90).max(90).optional(),
  lng: coordinate.min(-180).max(180).optional(),
  radiusKm: coordinate.positive().max(500).optional(),
  orderBy: z.enum(['distance', 'price', 'name']).default('price'),
  order: z.enum(['ASC', 'DESC']).default('ASC'),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
}).strict().superRefine((data, ctx) => {
  if ((data.lat === undefined) !== (data.lng === undefined)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['lng'], message: 'lat and lng must be provided together' });
  }
  if (data.radiusKm !== undefined && data.lat === undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['radiusKm'], message: 'radiusKm requires coordinates' });
  }
  if (data.orderBy === 'distance' && data.lat === undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['orderBy'], message: 'distance ordering requires coordinates' });
  }
});
export type ProductPharmaciesQuery = z.infer<typeof ProductPharmaciesQuerySchema>;
