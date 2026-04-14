import { z } from 'zod';

export const CreatePermissionSchema = z.object({
  code: z.string().min(1, 'El código es obligatorio'),
  description: z.string().optional(),
});

export const UpdatePermissionSchema = CreatePermissionSchema.partial();

export type CreatePermissionDTO = z.infer<typeof CreatePermissionSchema>;
export type UpdatePermissionDTO = z.infer<typeof UpdatePermissionSchema>;
