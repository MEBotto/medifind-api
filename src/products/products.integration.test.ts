import 'reflect-metadata';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '@/app';
import AppDataSource from '@/data-source';
import { Role } from '@/roles/models/Role';
import { User } from '@/users/models/User';
import { Pharmacy } from '@/pharmacies/models/Pharmacy';
import { Product } from './models/Product';
import { AuditLog } from '@/audit/models/AuditLog';
import { getJwtSecret } from '@/utils/jwt-secret';

const integration = process.env.RUN_DB_INTEGRATION === '1';
const describeDb = integration ? describe : describe.skip;

describeDb('Product ownership and transactional audit (PostgreSQL)', () => {
  const suffix = randomUUID().slice(0, 8);
  let admin: User, pharmacist: User, customer: User;
  let pharmacyA: Pharmacy, pharmacyB: Pharmacy;
  let ownProductId: string;
  const token = (user: User) => jwt.sign(
    { id: user.id, email: user.email, role: user.role.code },
    getJwtSecret(), { expiresIn: '1h' },
  );

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    const roles = AppDataSource.getRepository(Role);
    const roleFor = async (code: string) => {
      const role = await roles.findOneBy({ code });
      if (!role) throw new Error('Missing seeded role: ' + code);
      return role;
    };
    const pharmacies = AppDataSource.getRepository(Pharmacy);
    pharmacyA = await pharmacies.save(pharmacies.create({ name: 'Test A ' + suffix }));
    pharmacyB = await pharmacies.save(pharmacies.create({ name: 'Test B ' + suffix }));
    const users = AppDataSource.getRepository(User);
    const createUser = async (code: string, pharmacy: Pharmacy | null) =>
      users.save(users.create({
        username: code.toLowerCase() + '_' + suffix,
        email: code.toLowerCase() + '_' + suffix + '@example.test',
        password: 'integration-only-hash',
        role: await roleFor(code), pharmacy,
      }));
    admin = await createUser('ADMIN', null);
    pharmacist = await createUser('PHARMACIST', pharmacyA);
    customer = await createUser('CUSTOMER', null);
  });

  afterAll(async () => {
    if (!AppDataSource.isInitialized) return;
    const products = AppDataSource.getRepository(Product);
    if (ownProductId) await products.delete({ id: ownProductId });
    const audits = AppDataSource.getRepository(AuditLog);
    await audits.delete({ userId: admin?.id });
    await audits.delete({ userId: pharmacist?.id });
    await audits.delete({ userId: customer?.id });
    const users = AppDataSource.getRepository(User);
    for (const user of [admin, pharmacist, customer]) if (user) await users.delete(user.id);
    const pharmacies = AppDataSource.getRepository(Pharmacy);
    for (const pharmacy of [pharmacyA, pharmacyB]) if (pharmacy) await pharmacies.delete(pharmacy.id);
    await AppDataSource.destroy();
  });

  it('rejects customer writes with 403', async () => {
    const response = await request(app).post('/api/products')
      .set('Authorization', 'Bearer ' + token(customer))
      .send({ name: 'Blocked', idPharmacy: pharmacyA.id });
    expect(response.status).toBe(403);
  });

  it('rejects cross-pharmacy creation with 403', async () => {
    const response = await request(app).post('/api/products')
      .set('Authorization', 'Bearer ' + token(pharmacist))
      .send({ name: 'Blocked', idPharmacy: pharmacyB.id });
    expect(response.status).toBe(403);
  });

  it('creates product in assigned pharmacy and commits its audit event', async () => {
    const response = await request(app).post('/api/products')
      .set('Authorization', 'Bearer ' + token(pharmacist))
      .send({ name: 'Owned product', quantity: 5 });
    expect(response.status).toBe(201);
    ownProductId = response.body.data.id;
    const product = await AppDataSource.getRepository(Product).findOne({
      where: { id: ownProductId }, relations: { pharmacy: true },
    });
    expect(product?.pharmacy.id).toBe(pharmacyA.id);
    const audit = await AppDataSource.getRepository(AuditLog).findOneBy({
      entityId: ownProductId, action: 'PRODUCT_CREATED',
    });
    expect(audit?.userId).toBe(pharmacist.id);
    expect(audit?.pharmacyId).toBe(pharmacyA.id);
  });

  it('rejects cross-pharmacy updates and deletes', async () => {
    const update = await request(app).put('/api/products/' + ownProductId)
      .set('Authorization', 'Bearer ' + token(admin))
      .send({ name: 'Admin edit' });
    expect(update.status).toBe(200);
    const foreignPharmacist = await AppDataSource.getRepository(User).findOne({
      where: { id: pharmacist.id }, relations: { role: true },
    });
    expect(foreignPharmacist).toBeTruthy();
    // The pharmacist may not transfer the product to another pharmacy.
    const transfer = await request(app).put('/api/products/' + ownProductId)
      .set('Authorization', 'Bearer ' + token(pharmacist))
      .send({ idPharmacy: pharmacyB.id });
    expect(transfer.status).toBe(403);
    const forbidden = await request(app).delete('/api/products/' + ownProductId)
      .set('Authorization', 'Bearer ' + token(customer));
    expect(forbidden.status).toBe(403);
  });
});
