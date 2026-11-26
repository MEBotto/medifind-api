import { z } from 'zod';

export const PublicCatalogQuerySchema = z.object({
  q: z.string().trim().min(2).max(100),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
}).strict();

export const PublicProductIdSchema = z.string().uuid();
export type PublicCatalogQuery = z.infer<typeof PublicCatalogQuerySchema>;
