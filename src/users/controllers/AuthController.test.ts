import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import AuthController from './AuthController';
import { RefreshSessionService } from '../services/RefreshSessionService';
import UsersService from '../services/UsersService';

jest.mock('@/utils/jwt-secret', () => ({ getJwtSecret: () => 'unit-test-secret' }));
jest.mock('@/utils/logger', () => ({ logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() } }));

describe('AuthController', () => {
  const user = {
    id: 'user-1',
    username: 'tester',
    email: 'tester@example.com',
    password: '$2b$10$private-hash',
  };
  const sessions = { create: jest.fn().mockResolvedValue({ token: 'a'.repeat(64), expiresAt: new Date(Date.now() + 10000) }) } as unknown as RefreshSessionService;
  const response = () => {
    const res = { status: jest.fn(), json: jest.fn(), cookie: jest.fn() };
    res.status.mockReturnValue(res);
    return res as unknown as Response;
  };

  it('login returns a safe user, a signed JWT, and an English code', async () => {
    const service = { authenticateUser: jest.fn().mockResolvedValue(user) } as unknown as UsersService;
    const controller = new AuthController(service, sessions);
    const res = response();
    await controller.login({ body: { email: user.email, password: 'secret' } } as Request, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = (res.json as jest.Mock).mock.calls[0][0];
    expect(body.code).toBe('AUTH_LOGIN_SUCCESS');
    expect(body.message).toBe('Login successful');
    expect(body.data.user.password).toBeUndefined();
    expect(jwt.verify(body.data.token, 'unit-test-secret')).toMatchObject({ role: null });
  });

  it('register returns HTTP 201 without a password hash', async () => {
    const service = { registerCustomer: jest.fn().mockResolvedValue(user) } as unknown as UsersService;
    const controller = new AuthController(service, sessions);
    const res = response();
    await controller.register({ body: user } as Request, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const body = (res.json as jest.Mock).mock.calls[0][0];
    expect(body.code).toBe('AUTH_REGISTER_SUCCESS');
    expect(body.data.user.password).toBeUndefined();
  });

  it('rejects invalid login credentials without returning a token', async () => {
    const { AppError } = require('@/middleware/error.middleware');
    const service = {
      authenticateUser: jest.fn().mockRejectedValue(new AppError(401, 'Invalid email or password')),
    } as unknown as UsersService;
    const controller = new AuthController(service, sessions);
    const res = response();
    await controller.login({ body: { email: user.email, password: 'wrong' } } as Request, res);

    expect(res.status).toHaveBeenCalledWith(401);
    const body = (res.json as jest.Mock).mock.calls[0][0];
    expect(body.code).toBe('AUTH_INVALID_CREDENTIALS');
    expect(body.token).toBeUndefined();
  });
});
