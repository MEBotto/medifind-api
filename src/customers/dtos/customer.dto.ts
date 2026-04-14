import { z } from 'zod';

export const CreateCustomerSchema = z.object({
  idUser: z.string().uuid().optional().nullable(),
  idPerson: z.string().uuid('ID de persona inválido'),
  idInsurancePlan: z.string().uuid().optional().nullable(),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();

export type CreateCustomerDTO = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerDTO = z.infer<typeof UpdateCustomerSchema>;
