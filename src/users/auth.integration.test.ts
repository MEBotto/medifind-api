import 'reflect-metadata';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import app from '@/app';
import AppDataSource from '@/data-source';
import { User } from './models/User';
import { Role } from '@/roles/models/Role';
import { DEFAULT_ROLES } from '@/roles/constants/role-codes';
import { getJwtSecret } from '@/utils/jwt-secret';

const suite = process.env.RUN_DB_INTEGRATION === 'true' ? describe : describe.skip;

suite('Authentication API (isolated PostgreSQL)', () => {
  const suffix = randomUUID();
  const credentials = {
    username: `test_${suffix}`,
    email: `test_${suffix}@example.test`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
  };

  let userId: string;
  let token: string;

  beforeAll(async () => {
    if (process.env.NODE_ENV !== 'test' || process.env.DB_INTEGRATION_ISOLATED !== 'true') {
      throw new Error('Requires isolated test database');
    }

    await AppDataSource.initialize();

    const repository = AppDataSource.getRepository(Role);

    for (const role of DEFAULT_ROLES) {
      const existing = await repository.findOneBy({
        code: role.code,
      });

      if (!existing) {
        await repository.save(repository.create(role));
      }
    }
  });

  afterAll(async () => {
    if (!AppDataSource.isInitialized) return;

    try {
      await AppDataSource.getRepository(User).delete({
        email: credentials.email,
      });
    } finally {
      await AppDataSource.destroy();
    }
  });

  it('registers a customer without exposing the password', async () => {
    const response = await request(app).post('/api/auth/register').send(credentials);

    expect(response.status).toBe(201);
    expect(response.body.code).toBe('AUTH_REGISTER_SUCCESS');
    expect(response.body.data.user.id).toEqual(expect.any(String));
    expect(response.body.data.user.id).not.toBe('');
    expect(response.body.data.user.password).toBeUndefined();

    userId = response.body.data.user.id;
  });

  it('authenticates a customer and returns a valid JWT', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: credentials.email,
      password: credentials.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.data.token).toEqual(expect.any(String));
    expect(response.body.data.user.id).toBe(userId);
    expect(response.body.data.user.email).toBe(credentials.email);
    expect(response.body.data.user.password).toBeUndefined();

    token = response.body.data.token;

    expect(() => jwt.verify(token, getJwtSecret())).not.toThrow();
  });

  it('rejects an incorrect password', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: credentials.email,
      password: 'IncorrectPassword123!',
    });

    expect(response.status).toBe(401);
  });

  it('rejects requests without an access token', async () => {
    const response = await request(app).get(`/api/users/${userId}`);

    expect(response.status).toBe(401);
  });

  it('rejects invalid tokens without exposing sensitive data', async () => {
    const response = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', 'Bearer invalid.token.value');

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('error');
    expect(response.body.code).toBe('REQUEST_FAILED');
    expect(response.body.data).toBeUndefined();
    expect(response.body.token).toBeUndefined();
  });

  it('prevents customers from accessing administrative endpoints', async () => {
    const response = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });
});
