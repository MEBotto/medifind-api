import { rotationIndex } from './rotation';

describe('daily shift rotation', () => {
  it('matches observed summer boundary dates when configured', () => {
    const jan = 'ABCDEF', feb = 'GHIJKL', general = 'ABCDEFGHIJKL';
    expect(jan[rotationIndex(2026, 1, 1, 1, 1, 5, 6)]).toBe('F');
    expect(jan[rotationIndex(2026, 1, 31, 1, 1, 5, 6)]).toBe('F');
    expect(feb[rotationIndex(2026, 2, 1, 2, 1, 0, 6)]).toBe('G');
    expect(feb[rotationIndex(2026, 2, 28, 2, 1, 0, 6)]).toBe('J');
    expect(general[rotationIndex(2026, 3, 1, 3, 1, 10, 12)]).toBe('K');
  });
  it('supports dates before the annual anchor', () => {
    expect(rotationIndex(2027, 3, 1, 3, 4, 0, 12)).toBe(9);
  });
  it('supports leap years', () => {
    expect(rotationIndex(2028, 3, 1, 2, 28, 0, 12)).toBe(2);
  });
  it('rejects empty sequences', () => {
    expect(() => rotationIndex(2027, 1, 1, 1, 1, 0, 0)).toThrow();
  });
});
