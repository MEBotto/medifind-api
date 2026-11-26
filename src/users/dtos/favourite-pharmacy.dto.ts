import { z } from 'zod';

// Ownership always comes from the authenticated JWT, never the request body.
export const CreateFavouritePharmacySchema = z.object({
  idPharmacy: z.string().uuid('ID de farmacia inválido'),
}).strict();

export const UpdateFavouritePharmacySchema = z.object({
  active: z.boolean(),
}).strict();

export type CreateFavouritePharmacyDTO = z.infer<typeof CreateFavouritePharmacySchema>;
export type UpdateFavouritePharmacyDTO = z.infer<typeof UpdateFavouritePharmacySchema>;
