import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('El email debe ser válido'),
  password: z.string().min(1, 'La contraseña es obligatoria')
});

export type LoginDTO = z.infer<typeof LoginSchema>;
