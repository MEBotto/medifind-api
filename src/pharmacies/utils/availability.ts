import { Pharmacy } from '../models/Pharmacy';
import { isOpenAt } from './opening-hours';

const TIME_ZONE = 'America/Argentina/Buenos_Aires';
const MINUTE = 60_000;

export function localParts(instant: Date): { dayOfWeek: number; time: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short',
  }).formatToParts(instant);
  const values = Object.fromEntries(parts.map(p => [p.type, p.value]));
  const weekdays: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  return { dayOfWeek: weekdays[values.weekday], time: `${values.hour}:${values.minute}` };
}

export function distanceKm(lat: number, lng: number, otherLat: number, otherLng: number): number {
  const toRad = (degrees: number) => degrees * Math.PI / 180;
  const dLat = toRad(otherLat - lat);
  const dLng = toRad(otherLng - lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(otherLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Return the next regular opening, scanning at most 8 days in the Argentina timezone. */
export function nextRegularOpening(pharmacy: Pharmacy, now: Date): string | null {
  if (pharmacy.open24Hours || !pharmacy.weeklyHours?.length) return null;
  const current = new Date(Math.ceil(now.getTime() / MINUTE) * MINUTE);
  // Minute-resolution scan handles cross-midnight schedules and week boundaries.
  let previous = isOpenAt(pharmacy.weeklyHours, localParts(current).dayOfWeek, localParts(current).time);
  for (let offset = 1; offset <= 8 * 24 * 60; offset++) {
    const candidate = new Date(current.getTime() + offset * MINUTE);
    const local = localParts(candidate);
    const open = isOpenAt(pharmacy.weeklyHours, local.dayOfWeek, local.time);
    if (open && !previous) return candidate.toISOString();
    previous = open;
  }
  return null;
}

export function nextRegularClosing(pharmacy: Pharmacy, now: Date): string | null {
  if (pharmacy.open24Hours || !pharmacy.weeklyHours?.length) return null;
  const current = new Date(Math.ceil(now.getTime() / MINUTE) * MINUTE);
  for (let offset = 1; offset <= 24 * 60 + 1; offset++) {
    const candidate = new Date(current.getTime() + offset * MINUTE);
    const local = localParts(candidate);
    if (!isOpenAt(pharmacy.weeklyHours, local.dayOfWeek, local.time)) return candidate.toISOString();
  }
  return null;
}
