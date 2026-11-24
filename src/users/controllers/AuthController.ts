import { getJwtSecret } from '@/utils/jwt-secret';
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
  constructor(private readonly usersService: UsersService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.usersService.createUser(req.body as CreateUserDTO);
      // Never invent a role: missing roles are represented as null.
      const payload = { id: user.id, email: user.email, role: user.role?.name ?? null };
      const token = jwt.sign(payload, getJwtSecret(), { expiresIn: '1d' });
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
      const payload = { id: user.id, email: user.email, role: user.role?.name ?? null };
      const token = jwt.sign(payload, getJwtSecret(), { expiresIn: '1d' });
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
