import 'reflect-metadata';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '@/app';
import AppDataSource from '@/data-source';
import { Pharmacy } from '@/pharmacies/models/Pharmacy';
import { Shift } from '@/shifts/models/Shift';
import { Role } from '@/roles/models/Role';
import { User } from '@/users/models/User';
import { PharmacySearchSchema } from '@/pharmacies/dtos/pharmacy-search.dto';
import PharmacysRepository from '@/pharmacies/repositories/PharmacysRepository';

const suite = process.env.RUN_DB_INTEGRATION === 'true' ? describe : describe.skip;

suite('Pharmacy HTTP authorization and openNow (isolated PostgreSQL)', () => {
  const suffix = 'http-integration-' + process.pid;
  const roles: Role[] = [];
  const users: User[] = [];
  const pharmacies: Pharmacy[] = [];
  let shift: Shift;
  let adminToken: string;
  let ownerToken: string;
  let otherToken: string;

  const token = (user: User) => jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'integration-test-secret',
    { expiresIn: '10m' },
  );

  beforeAll(async () => {
    if (process.env.NODE_ENV !== 'test' || process.env.DB_INTEGRATION_ISOLATED !== 'true') {
      throw new Error('Requires disposable DB, NODE_ENV=test and DB_INTEGRATION_ISOLATED=true');
    }
    await AppDataSource.initialize();
    const shiftRepo = AppDataSource.getRepository(Shift);
    const pharmacyRepo = AppDataSource.getRepository(Pharmacy);
    const roleRepo = AppDataSource.getRepository(Role);
    const userRepo = AppDataSource.getRepository(User);

    shift = await shiftRepo.save(shiftRepo.create({ name: suffix, code: 'Z' }));
    pharmacies.push(await pharmacyRepo.save(pharmacyRepo.create({
      name: suffix + '-always', adress: 'Test', shift,
      open24Hours: true, weeklyHours: [],
    })));
    pharmacies.push(await pharmacyRepo.save(pharmacyRepo.create({
      name: suffix + '-closed', adress: 'Test', shift,
      open24Hours: false, weeklyHours: [],
    })));
    for (const code of ['ADMIN', 'PHARMACIST']) {
      let role = await roleRepo.findOneBy({ code });
      if (!role) { role = await roleRepo.save(roleRepo.create({ code, name: code })); roles.push(role); }
    }
    const adminRole = await roleRepo.findOneByOrFail({ code: 'ADMIN' });
    const pharmacistRole = await roleRepo.findOneByOrFail({ code: 'PHARMACIST' });
    for (const [index, role, pharmacy] of [
      [0, adminRole, null],
      [1, pharmacistRole, pharmacies[0]],
      [2, pharmacistRole, pharmacies[1]],
    ] as const) {
      users.push(await userRepo.save(userRepo.create({
        username: suffix + '-' + index, email: suffix + '-' + index + '@example.test',
        password: 'not-used', role, pharmacy,
      })));
    }
    [adminToken, ownerToken, otherToken] = users.map(token);
  });

  afterAll(async () => {
    if (!AppDataSource.isInitialized) return;
    try {
      await AppDataSource.getRepository(User).remove(users);
      await AppDataSource.getRepository(Pharmacy).remove(pharmacies);
      if (shift) await AppDataSource.getRepository(Shift).remove(shift);
      if (roles.length) await AppDataSource.getRepository(Role).remove(roles);
    } finally { await AppDataSource.destroy(); }
  });

  it('rejects unauthenticated access', async () => {
    const res = await request(app).put(`/api/pharmacys/${pharmacies[0].id}/hours`)
      .send({ weeklyHours: [], open24Hours: false });
    expect(res.status).toBe(401);
  });

  it('allows the owner and blocks another pharmacist', async () => {
    const url = `/api/pharmacys/${pharmacies[0].id}/hours`;
    const body = { weeklyHours: [{ dayOfWeek: 6, opensAt: '09:00', closesAt: '13:00' }], open24Hours: false };
    const denied = await request(app).put(url).set('Authorization', `Bearer ${otherToken}`).send(body);
    expect(denied.status).toBe(403);
    const accepted = await request(app).put(url).set('Authorization', `Bearer ${ownerToken}`).send(body);
    expect(accepted.status).toBe(200);
    const saved = await AppDataSource.getRepository(Pharmacy).findOneByOrFail({ id: pharmacies[0].id });
    expect(saved.weeklyHours).toEqual(body.weeklyHours);
    expect(saved.open24Hours).toBe(false);
  });

  it('allows admin to edit any pharmacy and rejects invalid hours', async () => {
    const url = `/api/pharmacys/${pharmacies[1].id}/hours`;
    const invalid = await request(app).put(url).set('Authorization', `Bearer ${adminToken}`)
      .send({ weeklyHours: [{ dayOfWeek: 8, opensAt: '09:00', closesAt: '13:00' }], open24Hours: false });
    expect(invalid.status).toBe(400);
    const accepted = await request(app).put(url).set('Authorization', `Bearer ${adminToken}`)
      .send({ weeklyHours: [], open24Hours: true });
    expect(accepted.status).toBe(200);
  });

  it('filters openNow using actual PostgreSQL queries', async () => {
    // No calendar is configured for the current year on this isolated DB.
    const repo = AppDataSource.getRepository(Pharmacy);
    const always = await repo.findOneByOrFail({ id: pharmacies[0].id });
    always.open24Hours = true;
    always.weeklyHours = [];
    await repo.save(always);
    const closed = await repo.findOneByOrFail({ id: pharmacies[1].id });
    closed.open24Hours = false;
    closed.weeklyHours = [];
    await repo.save(closed);
    const search = new PharmacysRepository();
    const open = await search.findAll(PharmacySearchSchema.parse({ openNow: 'true', search: suffix }), users[0].id);
    const shut = await search.findAll(PharmacySearchSchema.parse({ openNow: 'false', search: suffix }), users[0].id);
    expect(open.data.map(item => item.id)).toContain(always.id);
    expect(open.data.map(item => item.id)).not.toContain(closed.id);
    expect(shut.data.map(item => item.id)).toContain(closed.id);
  });
});
