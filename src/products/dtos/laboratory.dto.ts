import { z } from 'zod';

export const CreateLaboratorySchema = z.object({
  name: z.string().optional(),
});

export const UpdateLaboratorySchema = CreateLaboratorySchema.partial();

export type CreateLaboratoryDTO = z.infer<typeof CreateLaboratorySchema>;
export type UpdateLaboratoryDTO = z.infer<typeof UpdateLaboratorySchema>;
