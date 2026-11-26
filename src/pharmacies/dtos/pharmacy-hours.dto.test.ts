import { CreatePharmacySchema, UpdatePharmacySchema } from './pharmacy.dto';

describe('structured pharmacy opening hours', () => {
  it('accepts weekly opening intervals', () => {
    expect(CreatePharmacySchema.safeParse({ name: 'Farmacia', weeklyHours: [
      { dayOfWeek: 1, opensAt: '09:00', closesAt: '13:00' },
      { dayOfWeek: 1, opensAt: '16:00', closesAt: '20:00' },
    ] }).success).toBe(true);
  });
  it('accepts 24-hour pharmacies', () => {
    expect(UpdatePharmacySchema.safeParse({ open24Hours: true }).success).toBe(true);
  });
  it('rejects invalid times and weekdays', () => {
    expect(UpdatePharmacySchema.safeParse({ weeklyHours: [{ dayOfWeek: 8, opensAt: '09:00', closesAt: '18:00' }] }).success).toBe(false);
    expect(UpdatePharmacySchema.safeParse({ weeklyHours: [{ dayOfWeek: 1, opensAt: '09:00', closesAt: '09:00' }] }).success).toBe(false);
  });
});
