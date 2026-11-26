import { isOpenAt } from './opening-hours';

describe('weekly pharmacy opening hours', () => {
  const schedule = [
    { dayOfWeek: 1, opensAt: '09:00', closesAt: '18:00' },
    { dayOfWeek: 5, opensAt: '20:00', closesAt: '02:00' },
    { dayOfWeek: 7, opensAt: '23:00', closesAt: '03:00' },
  ];

  it('includes opening and excludes closing boundaries', () => {
    expect(isOpenAt(schedule, 1, '09:00')).toBe(true);
    expect(isOpenAt(schedule, 1, '17:59')).toBe(true);
    expect(isOpenAt(schedule, 1, '18:00')).toBe(false);
  });

  it('handles overnight intervals and week rollover', () => {
    expect(isOpenAt(schedule, 5, '23:00')).toBe(true);
    expect(isOpenAt(schedule, 6, '01:59')).toBe(true);
    expect(isOpenAt(schedule, 6, '02:00')).toBe(false);
    expect(isOpenAt(schedule, 1, '02:30')).toBe(true);
    expect(isOpenAt(schedule, 1, '03:00')).toBe(false);
  });

  it('rejects invalid days and times', () => {
    expect(() => isOpenAt(schedule, 0, '10:00')).toThrow();
    expect(() => isOpenAt(schedule, 1, '25:00')).toThrow();
  });
});
