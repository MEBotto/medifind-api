import { AddInventorySchema, UpdateInventorySchema } from '../dtos/pharmacy-inventory.dto';
import { resolveProductPharmacy } from './ProductsService';

describe('Pharmacy inventory validation and isolation', () => {
  const pharmacist = { id: 'user', role: 'PHARMACIST', pharmacyId: 'my-pharmacy' };

  it('allows pharmacist to manage only their pharmacy', () => {
    expect(resolveProductPharmacy(pharmacist)).toBe('my-pharmacy');
    expect(() => resolveProductPharmacy(pharmacist, 'other-pharmacy'))
      .toThrow('Cannot manage another pharmacy');
  });

  it('requires pharmacyId for admin operations', () => {
    expect(() => resolveProductPharmacy({ id: 'admin', role: 'ADMIN', pharmacyId: null }))
      .toThrow('A pharmacy is required');
  });

  it('rejects negative stock and invalid prices', () => {
    const productId = '11111111-1111-4111-8111-111111111111';
    expect(AddInventorySchema.safeParse({ productId, quantity: -1 }).success).toBe(false);
    expect(AddInventorySchema.safeParse({ productId, price: '12.345' }).success).toBe(false);
    expect(AddInventorySchema.safeParse({ productId, price: '-1.00' }).success).toBe(false);
  });

  it('accepts exact decimal price strings', () => {
    const productId = '11111111-1111-4111-8111-111111111111';
    expect(AddInventorySchema.safeParse({ productId, price: '120.50', quantity: 5, active: true }).success).toBe(true);
  });

  it('disallows product reassignment or pharmacy changes through update', () => {
    expect(UpdateInventorySchema.safeParse({ productId: '11111111-1111-4111-8111-111111111111' }).success).toBe(false);
    expect(UpdateInventorySchema.safeParse({ pharmacyId: '11111111-1111-4111-8111-111111111111' }).success).toBe(false);
  });
});
