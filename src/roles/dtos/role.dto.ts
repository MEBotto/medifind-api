import { z } from 'zod';

export const CreateRoleSchema = z.object({
  code: z.string().trim().regex(/^[A-Z][A-Z0-9_]*$/).max(50),
  name: z.string().trim().min(1).max(100),
  description: z.string().optional(),
}).strict();

export const UpdateRoleSchema = CreateRoleSchema.omit({ code: true }).partial().strict();
export type CreateRoleDTO = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleDTO = z.infer<typeof UpdateRoleSchema>;
