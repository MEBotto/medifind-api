import { z } from 'zod';

export const CreateFavouritePharmacySchema = z.object({
  idUser: z.string().uuid('ID de usuario inválido'),
  idPharmacy: z.string().uuid('ID de farmacia inválido'),
  active: z.boolean().default(true),
});

export const UpdateFavouritePharmacySchema = CreateFavouritePharmacySchema.partial();

export type CreateFavouritePharmacyDTO = z.infer<typeof CreateFavouritePharmacySchema>;
export type UpdateFavouritePharmacyDTO = z.infer<typeof UpdateFavouritePharmacySchema>;
