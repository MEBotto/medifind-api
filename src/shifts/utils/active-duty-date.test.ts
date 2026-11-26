import { activeDutyDate } from './active-duty-date';

describe('active pharmacy guard 08:00 to 08:00 in Argentina', () => {
  it('keeps yesterday group until 07:59:59', () => {
    expect(activeDutyDate(new Date('2026-02-01T10:59:59Z'))).toBe('2026-01-31');
  });
  it('switches at 08:00 local (11:00 UTC)', () => {
    expect(activeDutyDate(new Date('2026-02-01T11:00:00Z'))).toBe('2026-02-01');
  });
  it('works across new year boundary', () => {
    expect(activeDutyDate(new Date('2027-01-01T10:00:00Z'))).toBe('2026-12-31');
  });
  it('works across leap day boundary', () => {
    expect(activeDutyDate(new Date('2028-03-01T10:59:59Z'))).toBe('2028-02-29');
  });
});
