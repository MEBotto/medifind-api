import { PharmacyHoursSchema } from './pharmacy-hours.dto';

describe('pharmacy-specific schedules', () => {
  it('supports different hours for weekdays and Saturday with Sunday closed', () => {
    const result = PharmacyHoursSchema.safeParse({
      open24Hours: false,
      weeklyHours: [
        { dayOfWeek: 1, opensAt: '09:00', closesAt: '13:00' },
        { dayOfWeek: 1, opensAt: '16:00', closesAt: '20:00' },
        { dayOfWeek: 6, opensAt: '09:00', closesAt: '12:30' },
      ],
    });
    expect(result.success).toBe(true);
  });
  it('supports a fully closed normal schedule', () => {
    expect(PharmacyHoursSchema.safeParse({ open24Hours: false, weeklyHours: [] }).success).toBe(true);
  });
  it('rejects malformed times', () => {
    expect(PharmacyHoursSchema.safeParse({ open24Hours: false, weeklyHours: [
      { dayOfWeek: 6, opensAt: '25:00', closesAt: '12:00' },
    ] }).success).toBe(false);
  });
});
