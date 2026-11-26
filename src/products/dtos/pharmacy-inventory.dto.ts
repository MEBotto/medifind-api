import { z } from 'zod';

const price = z.string().regex(/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/, 'Invalid decimal price');
export const AddInventorySchema = z.object({
  productId: z.string().uuid(),
  pharmacyId: z.string().uuid().optional(),
  price: price.nullable().optional(),
  quantity: z.number().int().nonnegative().optional(),
  active: z.boolean().optional(),
}).strict();
export const UpdateInventorySchema = AddInventorySchema.omit({ productId: true }).extend({
  pharmacyId: z.never().optional(),
});
export type AddInventoryDTO = z.infer<typeof AddInventorySchema>;
export type UpdateInventoryDTO = z.infer<typeof UpdateInventorySchema>;
