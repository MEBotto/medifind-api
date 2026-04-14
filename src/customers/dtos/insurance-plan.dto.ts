import { z } from 'zod';

export const CreateInsurancePlanSchema = z.object({
  description: z.string().optional(),
  active: z.boolean().optional(),
  idMedicalInsurance: z.string().uuid().optional().nullable(),
});

export const UpdateInsurancePlanSchema = CreateInsurancePlanSchema.partial();

export type CreateInsurancePlanDTO = z.infer<typeof CreateInsurancePlanSchema>;
export type UpdateInsurancePlanDTO = z.infer<typeof UpdateInsurancePlanSchema>;
