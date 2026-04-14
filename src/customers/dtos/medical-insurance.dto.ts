import { z } from 'zod';

export const CreateMedicalInsuranceSchema = z.object({
  description: z.string().optional(),
});

export const UpdateMedicalInsuranceSchema = CreateMedicalInsuranceSchema.partial();

export type CreateMedicalInsuranceDTO = z.infer<typeof CreateMedicalInsuranceSchema>;
export type UpdateMedicalInsuranceDTO = z.infer<typeof UpdateMedicalInsuranceSchema>;
