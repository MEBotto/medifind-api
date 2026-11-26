import { z } from 'zod';
import { CatalogRequestType } from '../models/CatalogRequest';

const product = z.object({
  name: z.string().trim().min(2).max(255),
  description: z.string().trim().max(2000).optional(),
  barcode: z.string().trim().min(4).max(100).optional(),
  presentation: z.string().trim().max(100).optional(),
  dose: z.number().int().nonnegative().optional(),
  unit: z.string().trim().max(20).optional(),
  laboratoryId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  parentRequestId: z.string().uuid().optional(),
}).strict();

const named = z.object({ name: z.string().trim().min(2).max(255) }).strict();

export const CreateCatalogRequestSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal(CatalogRequestType.PRODUCT), payload: product }),
  z.object({ type: z.literal(CatalogRequestType.LABORATORY), payload: named }),
  z.object({ type: z.literal(CatalogRequestType.CATEGORY), payload: named }),
]);

export const ReviewCatalogRequestSchema = z.discriminatedUnion('decision', [
  z.object({ decision: z.literal('APPROVE') }),
  z.object({ decision: z.literal('REJECT'), reason: z.string().trim().min(3).max(2000) }),
]);

export type CreateCatalogRequestDTO = z.infer<typeof CreateCatalogRequestSchema>;
export type ReviewCatalogRequestDTO = z.infer<typeof ReviewCatalogRequestSchema>;
