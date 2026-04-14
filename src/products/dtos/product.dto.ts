import { z } from 'zod';
import { ProductUnit, ProductMagnitude } from '../models/Product';

export const CreateProductSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  dose: z.number().int().optional(),
  unit: z.nativeEnum(ProductUnit).optional(),
  quantity: z.number().int().optional(),
  magnitude: z.nativeEnum(ProductMagnitude).optional(),
  idLabo: z.string().uuid().optional().nullable(),
  idPharmacy: z.string().uuid().optional().nullable(),
  idCategory: z.string().uuid().optional().nullable(),
  active: z.boolean().default(true),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export type CreateProductDTO = z.infer<typeof CreateProductSchema>;
export type UpdateProductDTO = z.infer<typeof UpdateProductSchema>;
