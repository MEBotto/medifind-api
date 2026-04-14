import { z } from 'zod';

export const CreateRoleSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export const UpdateRoleSchema = CreateRoleSchema.partial();

export type CreateRoleDTO = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleDTO = z.infer<typeof UpdateRoleSchema>;
