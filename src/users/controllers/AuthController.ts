import { getJwtSecret } from '@/utils/jwt-secret';
import { RefreshSessionService, duration } from '../services/RefreshSessionService';
import { readRefreshCookie, setRefreshCookie, clearRefreshCookie } from '../utils/session-cookie';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import UsersService from '../services/UsersService';
import { LoginDTO } from '../dtos/auth.dto';
import { CreateUserDTO } from '../dtos/user.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';
import { sendSuccess, sendCreated, sendError } from '@/utils/api.utils';
import { toPublicUser } from '../utils/public-user';

class AuthController {
  constructor(private readonly usersService: UsersService, private readonly sessions = new RefreshSessionService()) {}

  private accessToken(user: Parameters<typeof toPublicUser>[0]) {
    return jwt.sign({ id: user.id, email: user.email, role: user.role?.code ?? null }, getJwtSecret(), { expiresIn: duration('ACCESS_TOKEN_MINUTES', 15, 60) * 60 });
  }

  refresh = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = readRefreshCookie(req);
      if (!token) throw new AppError(401, 'Missing refresh token');
      const session = await this.sessions.rotate(token);
      setRefreshCookie(res, session.token, session.expiresAt);
      sendSuccess(res, { user: toPublicUser(session.user), token: this.accessToken(session.user) });
    } catch (error) {
      if (error instanceof AppError) { clearRefreshCookie(res); sendError(res, error.message, error.statusCode); return; }
      sendError(res, 'Internal server error', 500);
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = readRefreshCookie(req);
      if (token) await this.sessions.revoke(token);
      clearRefreshCookie(res);
      res.status(204).end();
    } catch { sendError(res, 'Internal server error', 500); }
  };

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.usersService.registerCustomer(req.body as CreateUserDTO);
      // Never invent a role: missing roles are represented as null.
      const token = this.accessToken(user);
      const session = await this.sessions.create(user.id);
      setRefreshCookie(res, session.token, session.expiresAt);
      sendCreated(res, { user: toPublicUser(user), token }, 'User registered successfully', 'AUTH_REGISTER_SUCCESS');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode, error.validationErrors, error.statusCode === 400 ? 'AUTH_REGISTRATION_FAILED' : 'AUTH_ERROR');
        return;
      }
      logger.error('Registration failed:', error);
      sendError(res, 'Internal server error', 500, undefined, 'INTERNAL_SERVER_ERROR');
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body as LoginDTO;
      const user = await this.usersService.authenticateUser(email, password);
      const token = this.accessToken(user);
      const session = await this.sessions.create(user.id);
      setRefreshCookie(res, session.token, session.expiresAt);
      sendSuccess(res, { user: toPublicUser(user), token }, 'Login successful', undefined, 'AUTH_LOGIN_SUCCESS');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode, error.validationErrors, error.statusCode === 401 ? 'AUTH_INVALID_CREDENTIALS' : 'AUTH_ERROR');
        return;
      }
      logger.error('Login failed:', error);
      sendError(res, 'Internal server error', 500, undefined, 'INTERNAL_SERVER_ERROR');
    }
  };
}

export default AuthController;
