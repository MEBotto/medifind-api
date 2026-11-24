import { resolveProductPharmacy } from './ProductsService';

describe('Product pharmacy authorization', () => {
  const pharmacist = { id: 'u1', role: 'PHARMACIST', pharmacyId: 'pharmacy-a' };
  it('uses the assigned pharmacy for pharmacist product creation', () => {
    expect(resolveProductPharmacy(pharmacist)).toBe('pharmacy-a');
  });
  it('rejects another pharmacy supplied by a pharmacist', () => {
    expect(() => resolveProductPharmacy(pharmacist, 'pharmacy-b')).toThrow('Cannot manage another pharmacy');
  });
  it('requires a pharmacy assignment for pharmacists', () => {
    expect(() => resolveProductPharmacy({ ...pharmacist, pharmacyId: null })).toThrow('Pharmacy access denied');
  });
  it('requires explicit pharmacy selection for administrators', () => {
    expect(() => resolveProductPharmacy({ id: 'admin', role: 'ADMIN', pharmacyId: null })).toThrow('A pharmacy is required');
    expect(resolveProductPharmacy({ id: 'admin', role: 'ADMIN', pharmacyId: null }, 'pharmacy-b')).toBe('pharmacy-b');
  });
  it('rejects customer product writes', () => {
    expect(() => resolveProductPharmacy({ id: 'c', role: 'CUSTOMER', pharmacyId: null }, 'pharmacy-a')).toThrow('Pharmacy access denied');
  });
});
