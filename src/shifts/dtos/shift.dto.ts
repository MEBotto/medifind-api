import { z } from 'zod';

export const CreateShiftSchema = z.object({
  name: z.string().optional(),
  code: z.string().max(1, 'El código debe ser de 1 caracter').optional(),
});

export const UpdateShiftSchema = CreateShiftSchema.partial();

export type CreateShiftDTO = z.infer<typeof CreateShiftSchema>;
export type UpdateShiftDTO = z.infer<typeof UpdateShiftSchema>;
