import { z } from 'zod';

export const CreatePermissionSchema = z.object({
  code: z.string().trim().regex(/^[A-Z][A-Z0-9_]*$/).max(100),
  name: z.string().trim().min(1).max(150).optional(),
  description: z.string().optional(),
}).strict();

export const UpdatePermissionSchema = CreatePermissionSchema.omit({ code: true }).partial().strict();
export type CreatePermissionDTO = z.infer<typeof CreatePermissionSchema>;
export type UpdatePermissionDTO = z.infer<typeof UpdatePermissionSchema>;
