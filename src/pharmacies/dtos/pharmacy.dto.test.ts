import { CreatePharmacySchema, UpdatePharmacySchema } from './pharmacy.dto';

describe('pharmacy DTO validation', () => {
  it('accepts valid coordinates, opening hours and a phone string', () => {
    const result = CreatePharmacySchema.parse({
      name: 'Farmacia Central', adress: 'Calle 123',
      lat: -34.6037, lng: -58.3816,
      phone: '5491100123456', openingTime: '09:00', closingTime: '21:30:00',
    });
    expect(result.phone).toBe('5491100123456');
  });

  it('keeps long phone numbers as strings', () => {
    const result = CreatePharmacySchema.parse({ phone: '12345678901234567890' });
    expect(result.phone).toBe('12345678901234567890');
  });

  it.each([
    { lat: 91, lng: 10 },
    { lat: 10, lng: -181 },
    { lat: -34 },
    { lng: -58 },
    { openingTime: '25:00' },
    { phone: 'abc123' },
    { unknownField: 'unexpected' },
  ])('rejects invalid creation input: %p', input => {
    expect(CreatePharmacySchema.safeParse(input).success).toBe(false);
  });

  it('allows partial updates and nullable shift', () => {
    expect(UpdatePharmacySchema.safeParse({ idShift: null }).success).toBe(true);
    expect(UpdatePharmacySchema.safeParse({ name: 'Nueva farmacia' }).success).toBe(true);
  });
});
