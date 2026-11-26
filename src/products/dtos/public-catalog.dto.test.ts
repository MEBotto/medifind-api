import { PublicCatalogQuerySchema, PublicProductIdSchema, ProductPharmaciesQuerySchema } from './public-catalog.dto';

describe('public catalog query validation', () => {
  it('requires a search term of at least two characters', () => {
    expect(PublicCatalogQuerySchema.safeParse({ q: 'a' }).success).toBe(false);
    expect(PublicCatalogQuerySchema.safeParse({ q: 'paracetamol' }).success).toBe(true);
  });

  it('applies pagination defaults', () => {
    const result = PublicCatalogQuerySchema.parse({ q: 'ibuprofeno' });
    expect(result).toEqual({ q: 'ibuprofeno', page: 1, limit: 20 });
  });

  it('rejects oversized pages and limits', () => {
    expect(PublicCatalogQuerySchema.safeParse({ q: 'ibuprofeno', limit: '100' }).success).toBe(false);
    expect(PublicCatalogQuerySchema.safeParse({ q: 'ibuprofeno', page: '-1' }).success).toBe(false);
  });

  it('validates product identifiers', () => {
    expect(PublicProductIdSchema.safeParse('not-an-id').success).toBe(false);
    expect(PublicProductIdSchema.safeParse('11111111-1111-4111-8111-111111111111').success).toBe(true);
  });
});

describe('geographic product pharmacy search validation', () => {
  it('allows default filters without coordinates', () => {
    expect(ProductPharmaciesQuerySchema.parse({})).toEqual({
      orderBy: 'price', order: 'ASC', page: 1, limit: 20,
    });
  });
  it('requires coordinates in pairs', () => {
    expect(ProductPharmaciesQuerySchema.safeParse({ lat: '-34.6' }).success).toBe(false);
  });
  it('requires coordinates for distance ordering and radius', () => {
    expect(ProductPharmaciesQuerySchema.safeParse({ orderBy: 'distance' }).success).toBe(false);
    expect(ProductPharmaciesQuerySchema.safeParse({ radiusKm: '5' }).success).toBe(false);
  });
  it('accepts valid geospatial filters', () => {
    expect(ProductPharmaciesQuerySchema.safeParse({
      lat: '-34.6037', lng: '-58.3816', radiusKm: '10', orderBy: 'distance',
    }).success).toBe(true);
  });
  it('rejects invalid bounds and excess limits', () => {
    expect(ProductPharmaciesQuerySchema.safeParse({ lat: '95', lng: '0' }).success).toBe(false);
    expect(ProductPharmaciesQuerySchema.safeParse({ limit: '51' }).success).toBe(false);
    expect(ProductPharmaciesQuerySchema.safeParse({ lat: '0', lng: '181' }).success).toBe(false);
  });
});
