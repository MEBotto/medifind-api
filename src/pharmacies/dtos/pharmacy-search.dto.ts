import { z } from 'zod';

const numeric = z.coerce.number().finite();
const optionalBoolean = z.enum(['true', 'false']).transform(value => value === 'true');
const optionalText = z.string().trim().min(1).max(150);
const uuid = z.string().uuid();

export const PharmacySearchSchema = z.object({
  search: z.string().trim().max(150).optional(),
  name: optionalText.optional(),
  address: optionalText.optional(),
  idShift: uuid.optional(),
  shiftCode: z.string().trim().min(1).max(10).optional(),
  hasShift: optionalBoolean.optional(),
  hasCoordinates: optionalBoolean.optional(),
  hasProducts: optionalBoolean.optional(),
  favoritesOnly: optionalBoolean.optional(),
  onDuty: optionalBoolean.optional(),
  openNow: optionalBoolean.optional(),
  dutyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD').refine(value => {
    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.getUTCFullYear() === y && date.getUTCMonth() + 1 === m && date.getUTCDate() === d;
  }, 'Fecha inválida').optional(),
  productName: optionalText.optional(),
  idCategory: uuid.optional(),
  idLaboratory: uuid.optional(),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  lat: numeric.min(-90).max(90).optional(),
  lng: numeric.min(-180).max(180).optional(),
  radiusKm: numeric.positive().max(500).optional(),
  orderBy: z.enum(['name', 'address', 'distance', 'id']).default('name'),
  order: z.enum(['ASC', 'DESC']).default('ASC'),
}).strict().superRefine((data, ctx) => {
  if ((data.lat === undefined) !== (data.lng === undefined)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'lat and lng must be provided together', path: ['lng'] });
  }
  if (data.radiusKm !== undefined && data.lat === undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'radiusKm requires lat and lng', path: ['radiusKm'] });
  }
  if (data.hasProducts === false && (data.productName || data.idCategory || data.idLaboratory)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'hasProducts=false cannot be combined with product filters', path: ['hasProducts'] });
  }
  if (data.hasCoordinates === false && data.lat !== undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'hasCoordinates=false cannot be combined with coordinates', path: ['hasCoordinates'] });
  }
  if (data.hasShift === false && (data.idShift || data.shiftCode)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'hasShift=false cannot be combined with shift filters', path: ['hasShift'] });
  }
  if (data.dutyDate && data.onDuty === undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'dutyDate requires onDuty', path: ['dutyDate'] });
  }
  if (data.onDuty === true && data.hasShift === false) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'onDuty=true requires a shift', path: ['hasShift'] });
  }
  if (data.orderBy === 'distance' && data.lat === undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'distance ordering requires lat and lng', path: ['orderBy'] });
  }
});
export type PharmacySearchDTO = z.infer<typeof PharmacySearchSchema>;
