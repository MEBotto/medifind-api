import { PharmacySearchSchema } from './pharmacy-search.dto';

describe('pharmacy search query', () => {
  it('applies safe pagination defaults', () => {
    expect(PharmacySearchSchema.parse({})).toMatchObject({
      page: 1, limit: 20, orderBy: 'name', order: 'ASC',
    });
  });

  it('accepts coordinates, radius and distance ordering', () => {
    expect(PharmacySearchSchema.parse({
      lat: '-34.6037', lng: '-58.3816', radiusKm: '5',
      page: '2', limit: '10', orderBy: 'distance',
    })).toMatchObject({ lat: -34.6037, lng: -58.3816, radiusKm: 5, page: 2, limit: 10 });
  });

  it('supports professional filters for shifts and product inventory', () => {
    const result = PharmacySearchSchema.parse({
      name: 'central', address: 'avenida', shiftCode: 'A',
      hasShift: 'true', hasProducts: 'true', hasCoordinates: 'false',
      productName: 'paracetamol', orderBy: 'address', order: 'DESC',
    });
    expect(result).toMatchObject({ hasShift: true, hasProducts: true, hasCoordinates: false, orderBy: 'address' });
  });

  it('supports favorites-only filtering without accepting arbitrary user IDs', () => {
    expect(PharmacySearchSchema.parse({ favoritesOnly: 'true' }).favoritesOnly).toBe(true);
    expect(PharmacySearchSchema.parse({ favoritesOnly: 'false' }).favoritesOnly).toBe(false);
    expect(PharmacySearchSchema.safeParse({ favoritesOnly: 'true', userId: 'another-user' }).success).toBe(false);
  });

  it.each([
    { page: '0' }, { limit: '101' }, { lat: '90.1', lng: '0' },
    { lat: '-34' }, { lng: '-58' }, { radiusKm: '5' },
    { orderBy: 'distance' }, { lat: '0', lng: '0', radiusKm: '-1' },
    { orderBy: 'invalid' },
    { hasProducts: 'false', productName: 'ibuprofen' },
    { hasShift: 'false', shiftCode: 'A' },
    { hasCoordinates: 'false', lat: '1', lng: '2' },
    { hasProducts: 'yes' },
    { favoritesOnly: 'yes' },
    { unexpected: 'value' },
  ])('rejects invalid query %p', query => {
    expect(PharmacySearchSchema.safeParse(query).success).toBe(false);
  });
});

describe('duty search filters', () => {
  it('accepts onDuty with a valid historical date', () => {
    const result = PharmacySearchSchema.safeParse({ onDuty: 'true', dutyDate: '2026-02-28' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.onDuty).toBe(true);
  });
  it('rejects invalid calendar dates', () => {
    expect(PharmacySearchSchema.safeParse({ onDuty: 'true', dutyDate: '2026-02-30' }).success).toBe(false);
  });
  it('rejects dutyDate without onDuty', () => {
    expect(PharmacySearchSchema.safeParse({ dutyDate: '2026-02-01' }).success).toBe(false);
  });
  it('rejects contradictory duty and shift filters', () => {
    expect(PharmacySearchSchema.safeParse({ onDuty: 'true', hasShift: 'false' }).success).toBe(false);
  });
});

describe('opening status filters', () => {
  it('accepts openNow with onDuty', () => {
    expect(PharmacySearchSchema.safeParse({ openNow: 'true', onDuty: 'true' }).success).toBe(true);
  });
  it('rejects real-time openNow with historical dutyDate', () => {
    expect(PharmacySearchSchema.safeParse({ openNow: 'true', onDuty: 'true', dutyDate: '2026-02-01' }).success).toBe(false);
  });
});
