import { z } from 'zod';
import { CreateUserSchema } from './user.dto';

export const AdminCreateUserSchema = CreateUserSchema.extend({
  roleCode: z.enum(['ADMIN', 'PHARMACIST', 'CUSTOMER']),
  pharmacyId: z.string().uuid().nullable().optional(),
}).strict().superRefine((data, ctx) => {
  if (data.roleCode === 'PHARMACIST' && !data.pharmacyId) {
    ctx.addIssue({ code: 'custom', path: ['pharmacyId'], message: 'A pharmacist must have a pharmacy' });
  }
  if (data.roleCode !== 'PHARMACIST' && data.pharmacyId) {
    ctx.addIssue({ code: 'custom', path: ['pharmacyId'], message: 'Only pharmacists can be assigned a pharmacy' });
  }
});
export type AdminCreateUserDTO = z.infer<typeof AdminCreateUserSchema>;
