import { AnnualShiftConfigSchema, CalendarQuerySchema } from './annual-shift-config.dto';

const config = {
  year: 2026,
  january: ['A','B','C','D','E','F'],
  february: ['G','H','I','J','K','L'],
  januaryAnchor: { day: 1, group: 'F' },
  februaryAnchor: { day: 1, group: 'G' },
  generalAnchor: { day: 1, group: 'K' },
};

describe('annual shift configuration', () => {
  it('accepts a six/six summer split with independent anchors', () => {
    expect(AnnualShiftConfigSchema.safeParse(config).success).toBe(true);
  });
  it('accepts reversed split for another year', () => {
    const reversed = { ...config, year: 2027,
      january: config.february, february: config.january,
      januaryAnchor: { day: 1, group: 'G' },
      februaryAnchor: { day: 1, group: 'A' } };
    expect(AnnualShiftConfigSchema.safeParse(reversed).success).toBe(true);
  });
  it('rejects duplicate or missing summer groups', () => {
    expect(AnnualShiftConfigSchema.safeParse({ ...config, february: config.january }).success).toBe(false);
  });
  it('rejects an anchor group outside its month', () => {
    expect(AnnualShiftConfigSchema.safeParse({ ...config, januaryAnchor: { day: 1, group: 'K' } }).success).toBe(false);
  });
  it('validates calendar month', () => {
    expect(CalendarQuerySchema.safeParse({ year: '2026', month: '2' }).success).toBe(true);
    expect(CalendarQuerySchema.safeParse({ year: '2026', month: '13' }).success).toBe(false);
  });
});
