import { AdminCreateUserSchema } from './admin-user.dto';

const base = {
  username: 'pharmacist1', email: 'pharmacist@example.com',
  password: 'a-long-password', firstName: 'Ana', lastName: 'Perez',
};

describe('AdminCreateUserSchema', () => {
  it('requires a pharmacy for pharmacists', () => {
    expect(AdminCreateUserSchema.safeParse({ ...base, roleCode: 'PHARMACIST' }).success).toBe(false);
    expect(AdminCreateUserSchema.safeParse({
      ...base, roleCode: 'PHARMACIST', pharmacyId: 'fa7ef47d-9040-4a3a-bdb8-bc6b2f934551',
    }).success).toBe(true);
  });

  it('rejects pharmacy assignment for non-pharmacists', () => {
    expect(AdminCreateUserSchema.safeParse({
      ...base, roleCode: 'ADMIN', pharmacyId: 'fa7ef47d-9040-4a3a-bdb8-bc6b2f934551',
    }).success).toBe(false);
  });

  it('rejects unknown role codes and extra properties', () => {
    expect(AdminCreateUserSchema.safeParse({ ...base, roleCode: 'SUPER_ADMIN' }).success).toBe(false);
    expect(AdminCreateUserSchema.safeParse({ ...base, roleCode: 'CUSTOMER', isAdmin: true }).success).toBe(false);
  });
});
