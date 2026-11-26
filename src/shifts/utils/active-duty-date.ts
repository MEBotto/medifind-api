export const DUTY_START_HOUR = 8;
export const DUTY_TIME_ZONE = 'America/Argentina/Buenos_Aires';

/** Return the calendar date whose 08:00–08:00 guard is active at an instant. */
export function activeDutyDate(instant: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: DUTY_TIME_ZONE, year: 'numeric', month: '2-digit',
    day: '2-digit', hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(instant);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  const year = Number(values.year), month = Number(values.month);
  const day = Number(values.day), hour = Number(values.hour);
  const date = new Date(Date.UTC(year, month - 1, day - (hour < DUTY_START_HOUR ? 1 : 0)));
  return date.toISOString().slice(0, 10);
}
