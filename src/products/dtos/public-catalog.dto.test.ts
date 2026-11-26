import { PublicCatalogQuerySchema, PublicProductIdSchema } from './public-catalog.dto';

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
