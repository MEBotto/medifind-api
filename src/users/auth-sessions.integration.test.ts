import 'reflect-metadata';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import app from '@/app';
import AppDataSource from '@/data-source';
import { User } from './models/User';
import { RefreshSession } from './models/RefreshSession';
import { hashRefreshToken } from './services/RefreshSessionService';
import { getJwtSecret } from '@/utils/jwt-secret';

const suite = process.env.RUN_DB_INTEGRATION === 'true' ? describe : describe.skip;
suite('Authentication sessions (isolated PostgreSQL)', () => {
  let user: User;
  const password = 'integration-password-123';
  const cookie = (res: { headers: Record<string, unknown> }) => {
    const values = res.headers['set-cookie'] as string[];
    expect(values).toBeDefined();
    return values[0].split(';')[0];
  };
  const refresh = (value: string) => request(app).post('/api/auth/refresh').set('Cookie', value);
  const login = async () => {
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password });
    expect(res.status).toBe(200);
    return res;
  };
  beforeAll(async () => {
    if (process.env.NODE_ENV !== 'test' || process.env.DB_INTEGRATION_ISOLATED !== 'true') throw new Error('Requires isolated test database');
    await AppDataSource.initialize();
    const suffix = randomUUID();
    user = await AppDataSource.getRepository(User).save({ username: suffix, email: suffix + '@example.test', password: await bcrypt.hash(password, 4) });
  });
  afterAll(async () => {
    if (!AppDataSource.isInitialized) return;
    try { if (user) await AppDataSource.getRepository(User).delete(user.id); }
    finally { await AppDataSource.destroy(); }
  });
  it('issues a short-lived JWT and stores only the refresh hash', async () => {
    const res = await login();
    const value = cookie(res);
    expect(res.headers['set-cookie'][0]).toContain('HttpOnly');
    expect(res.headers['set-cookie'][0]).toContain('SameSite=Strict');
    const claims = jwt.verify(res.body.data.token, getJwtSecret()) as jwt.JwtPayload;
    expect(claims.exp! - claims.iat!).toBe(Number(process.env.ACCESS_TOKEN_MINUTES ?? 15) * 60);
    const row = await AppDataSource.getRepository(RefreshSession).findOneByOrFail({ tokenHash: hashRefreshToken(value.split('=')[1]) });
    expect(row.userId).toBe(user.id);
    expect(row.revokedAt).toBeNull();
    expect(res.body.data.user.password).toBeUndefined();
  });
  it('rotates and revokes the whole family on replay without affecting another session', async () => {
    const original = cookie(await login());
    const independent = cookie(await login());
    const rotated = await refresh(original);
    expect(rotated.status).toBe(200);
    const next = cookie(rotated);
    expect(next).not.toBe(original);
    expect((await refresh(original)).status).toBe(401);
    expect((await refresh(next)).status).toBe(401);
    expect((await refresh(independent)).status).toBe(200);
  });
  it('serializes simultaneous refreshes and invalidates the winning token on replay', async () => {
    const original = cookie(await login());
    const responses = await Promise.all([refresh(original), refresh(original)]);
    expect(responses.map(r => r.status).sort()).toEqual([200, 401]);
    const winner = responses.find(r => r.status === 200)!;
    expect((await refresh(cookie(winner))).status).toBe(401);
  });
  it('rejects expired refresh tokens', async () => {
    const original = cookie(await login());
    await AppDataSource.getRepository(RefreshSession).update({ tokenHash: hashRefreshToken(original.split('=')[1]) }, { expiresAt: new Date(Date.now() - 1000) });
    expect((await refresh(original)).status).toBe(401);
  });
  it('revokes on logout and supports repeated logout', async () => {
    const original = cookie(await login());
    const res = await request(app).post('/api/auth/logout').set('Cookie', original);
    expect(res.status).toBe(204);
    expect((await refresh(original)).status).toBe(401);
    expect((await request(app).post('/api/auth/logout').set('Cookie', original)).status).toBe(204);
  });
  it('rejects missing and malformed cookies', async () => {
    expect((await request(app).post('/api/auth/refresh')).status).toBe(401);
    expect((await refresh('medifind_refresh=bad')).status).toBe(401);
  });
});
