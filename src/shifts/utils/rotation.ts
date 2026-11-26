/** Calculate an index from an annual rule's own anchor, without local-time DST effects. */
export function rotationIndex(
  year: number, month: number, day: number,
  anchorMonth: number, anchorDay: number,
  anchorIndex: number, length: number,
): number {
  if (!Number.isInteger(length) || length <= 0) throw new Error('Empty rotation');
  const elapsed = (Date.UTC(year, month - 1, day) -
    Date.UTC(year, anchorMonth - 1, anchorDay)) / 86400000;
  return ((anchorIndex + elapsed) % length + length) % length;
}
