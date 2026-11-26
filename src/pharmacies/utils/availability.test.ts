import { distanceKm, localParts, nextRegularOpening, nextRegularClosing } from './availability';
import { Pharmacy } from '../models/Pharmacy';

const pharmacy = (hours: Pharmacy['weeklyHours'], open24Hours = false) =>
  ({ weeklyHours: hours, open24Hours } as Pharmacy);

describe('nearby availability helpers', () => {
  it('computes zero distance and a positive geographic distance', () => {
    expect(distanceKm(-34.6, -58.4, -34.6, -58.4)).toBeCloseTo(0);
    expect(distanceKm(-34.6, -58.4, -34.7, -58.4)).toBeGreaterThan(10);
  });

  it('uses Argentina local time even when the server is elsewhere', () => {
    expect(localParts(new Date('2026-06-07T01:00:00Z'))).toEqual({ dayOfWeek: 6, time: '22:00' });
  });

  it('finds next opening after a Saturday-to-Sunday overnight shift', () => {
    const p = pharmacy([{ dayOfWeek: 6, opensAt: '22:00', closesAt: '02:00' }]);
    expect(nextRegularClosing(p, new Date('2026-06-07T01:00:00Z'))).toBe('2026-06-07T05:00:00.000Z');
    expect(nextRegularOpening(p, new Date('2026-06-07T05:00:00Z'))).toBe('2026-06-14T01:00:00.000Z');
  });

  it('returns null for 24-hour pharmacies and those with no hours', () => {
    expect(nextRegularOpening(pharmacy([], true), new Date())).toBeNull();
    expect(nextRegularOpening(pharmacy([]), new Date())).toBeNull();
  });
});
