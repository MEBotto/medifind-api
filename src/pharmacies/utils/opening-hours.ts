/**
 * Pure helpers for weekly opening schedules.
 * Day numbering follows ISO: Monday=1, Sunday=7.
 * Times are interpreted in the pharmacy's local timezone by the caller.
 */
export type WeeklyOpeningInterval = {
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
};

const toMinutes = (value: string): number => {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error('Invalid HH:mm time');
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

export function isOpenAt(
  intervals: WeeklyOpeningInterval[],
  dayOfWeek: number,
  time: string,
): boolean {
  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) {
    throw new Error('Invalid ISO weekday');
  }
  const now = toMinutes(time);
  const previousDay = dayOfWeek === 1 ? 7 : dayOfWeek - 1;
  return intervals.some(interval => {
    if (!Number.isInteger(interval.dayOfWeek) || interval.dayOfWeek < 1 || interval.dayOfWeek > 7) {
      throw new Error('Invalid schedule weekday');
    }
    const opens = toMinutes(interval.opensAt);
    const closes = toMinutes(interval.closesAt);
    if (opens === closes) return false; // Explicit 24h intervals need a separate representation.
    if (opens < closes) {
      return interval.dayOfWeek === dayOfWeek && now >= opens && now < closes;
    }
    return (interval.dayOfWeek === dayOfWeek && now >= opens) ||
      (interval.dayOfWeek === previousDay && now < closes);
  });
}
