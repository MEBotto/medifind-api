import { Pharmacy } from '../models/Pharmacy';
import { localParts, nextRegularClosing, nextRegularOpening } from './availability';
import { isOpenAt } from './opening-hours';

export function availabilityDetails(pharmacy: Pharmacy, now: Date, activeShiftId?: string) {
  const local = localParts(now);
  const onDuty = Boolean(activeShiftId && pharmacy.shift?.id === activeShiftId);
  const regularlyOpen = Boolean(pharmacy.open24Hours ||
    isOpenAt(pharmacy.weeklyHours ?? [], local.dayOfWeek, local.time));
  const openNow = onDuty || regularlyOpen;
  const nextOpeningAt = openNow ? null : nextRegularOpening(pharmacy, now);
  const nextClosingAt = onDuty || pharmacy.open24Hours || !regularlyOpen
    ? null : nextRegularClosing(pharmacy, now);
  return {
    onDuty, openNow, status: onDuty ? 'ON_DUTY' : openNow ? 'OPEN' : 'CLOSED',
    nextOpeningAt, nextClosingAt,
    minutesUntilNextOpening: nextOpeningAt ? Math.max(0, Math.ceil((Date.parse(nextOpeningAt) - now.getTime()) / 60000)) : null,
    minutesUntilNextClosing: nextClosingAt ? Math.max(0, Math.ceil((Date.parse(nextClosingAt) - now.getTime()) / 60000)) : null,
  };
}
