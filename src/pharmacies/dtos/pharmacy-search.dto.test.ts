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

  it.each([
    { page: '0' }, { limit: '101' }, { lat: '90.1', lng: '0' },
    { lat: '-34' }, { lng: '-58' }, { radiusKm: '5' },
    { orderBy: 'distance' }, { lat: '0', lng: '0', radiusKm: '-1' },
    { orderBy: 'invalid' },
  ])('rejects invalid query %p', query => {
    expect(PharmacySearchSchema.safeParse(query).success).toBe(false);
  });
});
