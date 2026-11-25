import { Request, Response } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';
import UsersService from '../services/UsersService';
import { CreateUserDTO, UpdateUserDTO } from '../dtos/user.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';
import { sendSuccess, sendCreated, sendError } from '@/utils/api.utils';
import { toPublicUser } from '../utils/public-user';

class UsersController {
  constructor(private readonly usersService: UsersService) {}

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.usersService.createUser(req.body as CreateUserDTO);
      sendCreated(res, toPublicUser(user), 'User created successfully', 'USER_CREATED');
    } catch (error) { this.handleError(res, error); }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.usersService.getUserById(req.params.id);
      sendSuccess(res, toPublicUser(user));
    } catch (error) { this.handleError(res, error); }
  };

  updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const user = await this.usersService.updateUser(req.params.id, req.body as UpdateUserDTO, req.user.id);
      sendSuccess(res, toPublicUser(user), 'User updated successfully', undefined, 'USER_UPDATED');
    } catch (error) { this.handleError(res, error); }
  };

  deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      await this.usersService.deleteUser(req.params.id, req.user.id);
      sendSuccess(res, null, 'User deleted successfully', undefined, 'USER_DELETED');
    } catch (error) { this.handleError(res, error); }
  };

  private handleError(res: Response, error: unknown): void {
    if (error instanceof AppError) {
      sendError(res, error.message, error.statusCode, error.validationErrors);
      return;
    }
    logger.error('User request failed:', error);
    sendError(res, 'Internal server error', 500, undefined, 'INTERNAL_SERVER_ERROR');
  }
}

export default UsersController;
