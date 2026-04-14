import { z } from 'zod';

export const CreateOrderItemSchema = z.object({
  idOrder: z.string().uuid().optional().nullable(),
  idProduct: z.string().uuid().optional().nullable(),
  amount: z.number().int().positive().optional(),
  price: z.number().positive().optional(),
});

export const UpdateOrderItemSchema = CreateOrderItemSchema.partial();

export type CreateOrderItemDTO = z.infer<typeof CreateOrderItemSchema>;
export type UpdateOrderItemDTO = z.infer<typeof UpdateOrderItemSchema>;
