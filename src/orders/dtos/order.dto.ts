import { z } from 'zod';
import { OrderState } from '../models/Order';

export const CreateOrderSchema = z.object({
  idCustomer: z.string().uuid().optional().nullable(),
  totalPrice: z.number().optional(),
  state: z.nativeEnum(OrderState).default(OrderState.PENDING),
});

export const VoidOrderSchema = z.object({
  voidReason: z.string().min(1, 'Se requiere un motivo de anulación'),
  voidedBy: z.string().uuid('ID de usuario inválido'),
});

export const UpdateOrderSchema = CreateOrderSchema.partial();

export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderDTO = z.infer<typeof UpdateOrderSchema>;
export type VoidOrderDTO = z.infer<typeof VoidOrderSchema>;
