import { z } from 'zod';

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Use HH:mm or HH:mm:ss');
const coordinate = (min: number, max: number) => z.number().finite().min(min).max(max);
const phone = z.union([
  z.string().regex(/^\d{1,20}$/, 'Phone must contain 1 to 20 digits'),
  z.number().int().nonnegative().safe().transform(value => String(value)),
]);

const weeklyInterval = z.object({
  dayOfWeek: z.number().int().min(1).max(7),
  opensAt: z.string().regex(/^([01]\\d|2[0-3]):[0-5]\\d$/),
  closesAt: z.string().regex(/^([01]\\d|2[0-3]):[0-5]\\d$/),
}).strict().refine(value => value.opensAt !== value.closesAt, 'Use open24Hours for 24h opening');

const pharmacyFields = z.object({
  weeklyHours: z.array(weeklyInterval).max(28).optional(),
  open24Hours: z.boolean().optional(),
  name: z.string().trim().min(1).max(200).optional(),
  adress: z.string().trim().min(1).max(500).optional(),
  lat: coordinate(-90, 90).optional().nullable(),
  lng: coordinate(-180, 180).optional().nullable(),
  phone: phone.optional().nullable(),
  openingDays: z.string().trim().min(1).max(200).optional().nullable(),
  openingTime: time.optional().nullable(),
  closingTime: time.optional().nullable(),
  idShift: z.string().uuid().optional().nullable(),
}).strict();

export const CreatePharmacySchema = pharmacyFields.refine(
  data => (data.lat == null) === (data.lng == null),
  { message: 'Latitude and longitude must be provided together', path: ['lng'] },
);

export const UpdatePharmacySchema = pharmacyFields.partial();

export type CreatePharmacyDTO = z.infer<typeof CreatePharmacySchema>;
export type UpdatePharmacyDTO = z.infer<typeof UpdatePharmacySchema>;
