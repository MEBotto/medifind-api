import { z } from 'zod';

export const CreatePersonSchema = z.object({
  name: z.string().optional(),
  surname: z.string().optional(),
  identification: z.number().int().optional(),
});

export const UpdatePersonSchema = CreatePersonSchema.partial();

export type CreatePersonDTO = z.infer<typeof CreatePersonSchema>;
export type UpdatePersonDTO = z.infer<typeof UpdatePersonSchema>;
