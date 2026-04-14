import { z } from 'zod';

export const CreatePharmacySchema = z.object({
  name: z.string().optional(),
  adress: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  phone: z.number().int().optional().or(z.string().regex(/^\d+$/).transform(Number)),
  openingDays: z.string().optional(),
  openingTime: z.string().optional(), // Expected 'HH:mm:ss'
  closingTime: z.string().optional(), // Expected 'HH:mm:ss'
  idShift: z.string().uuid().optional().nullable(),
});

export const UpdatePharmacySchema = CreatePharmacySchema.partial();

export type CreatePharmacyDTO = z.infer<typeof CreatePharmacySchema>;
export type UpdatePharmacyDTO = z.infer<typeof UpdatePharmacySchema>;
