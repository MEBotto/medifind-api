import { Response } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';
import { AppError } from '@/middleware/error.middleware';
import { sendCreated, sendError } from '@/utils/api.utils';
import { toPublicUser } from '../utils/public-user';
import { AdminUsersService } from '../services/AdminUsersService';
import { AdminCreateUserDTO } from '../dtos/admin-user.dto';

const service = new AdminUsersService();
export const createAdminUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');
    const user = await service.create(req.body as AdminCreateUserDTO, req.user.id);
    sendCreated(res, toPublicUser(user), 'User created successfully', 'USER_CREATED');
  } catch (error) {
    if (error instanceof AppError) {
      sendError(res, error.message, error.statusCode); return;
    }
    sendError(res, 'Internal server error', 500);
  }
};
