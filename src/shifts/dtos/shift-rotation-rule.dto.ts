import { z } from 'zod';

export const CreateShiftRotationRuleSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  year: z.number().int().optional().nullable(),
  months: z.array(z.number().int().min(1).max(12)).min(1, 'Debe haber al menos un mes'),
  anchorDay: z.number().int().default(1),
  idAnchorShift: z.string().uuid('ID de turno ancla inválido'),
  priority: z.number().int().default(0),
});

export const UpdateShiftRotationRuleSchema = CreateShiftRotationRuleSchema.partial();

export type CreateShiftRotationRuleDTO = z.infer<typeof CreateShiftRotationRuleSchema>;
export type UpdateShiftRotationRuleDTO = z.infer<typeof UpdateShiftRotationRuleSchema>;
