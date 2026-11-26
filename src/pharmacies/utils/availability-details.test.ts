import { Pharmacy } from '../models/Pharmacy';
import { availabilityDetails } from './availability-details';

const pharmacy = (weeklyHours: Pharmacy['weeklyHours'], open24Hours = false, shiftId?: string) =>
  ({ weeklyHours, open24Hours, shift: shiftId ? { id: shiftId } : null } as Pharmacy);

describe('availability detail', () => {
  const now = new Date('2026-06-07T01:30:00Z'); // Saturday 22:30 Argentina

  it('reports regular overnight opening and minutes to closing', () => {
    const result = availabilityDetails(pharmacy([{ dayOfWeek: 6, opensAt: '22:00', closesAt: '02:00' }]), now);
    expect(result.status).toBe('OPEN');
    expect(result.minutesUntilNextClosing).toBe(210);
    expect(result.nextClosingAt).toBe('2026-06-07T05:00:00.000Z');
  });

  it('prioritizes on-duty over regular closed hours', () => {
    const result = availabilityDetails(pharmacy([], false, 'shift-1'), now, 'shift-1');
    expect(result.status).toBe('ON_DUTY');
    expect(result.openNow).toBe(true);
    expect(result.nextClosingAt).toBeNull();
  });

  it('reports a closed pharmacy with no known next opening', () => {
    const result = availabilityDetails(pharmacy([]), now);
    expect(result.status).toBe('CLOSED');
    expect(result.nextOpeningAt).toBeNull();
    expect(result.minutesUntilNextOpening).toBeNull();
  });
});
