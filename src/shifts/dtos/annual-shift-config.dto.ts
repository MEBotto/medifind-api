import { z } from 'zod';

const codes = z.array(z.enum(['A','B','C','D','E','F','G','H','I','J','K','L'])).length(6);
const anchor = z.object({
  day: z.number().int().min(1).max(28),
  group: z.enum(['A','B','C','D','E','F','G','H','I','J','K','L']),
}).strict();
export const AnnualShiftConfigSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  january: codes,
  february: codes,
  januaryAnchor: anchor,
  februaryAnchor: anchor,
  generalAnchor: anchor,
}).strict().superRefine((value, ctx) => {
  const all = [...value.january, ...value.february];
  if (new Set(all).size !== 12) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['february'], message: 'Enero y febrero deben cubrir los 12 grupos sin repeticiones' });
  }
  for (const month of ['january', 'february'] as const) {
    if (!value[month].includes(value[`${month}Anchor`].group)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [`${month}Anchor`], message: 'El grupo ancla debe participar en el mes' });
    }
  }
});
export const CalendarQuerySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100),
  month: z.coerce.number().int().min(1).max(12),
}).strict();
export type AnnualShiftConfig = z.infer<typeof AnnualShiftConfigSchema>;
