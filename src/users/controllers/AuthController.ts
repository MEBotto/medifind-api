import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import UsersService from '../services/UsersService';
import { LoginDTO } from '../dtos/auth.dto';
import { CreateUserDTO } from '../dtos/user.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';
import { sendSuccess, sendCreated, sendError } from '@/utils/api.utils';

// We fall back to a default secret if not provided in .env
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-medifind-key';

class AuthController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Registra un nuevo usuario (Endpoint abierto para auto-registro)
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData = req.body as CreateUserDTO;
      // In a real scenario we'd assign a default role (like 'User' or 'Patient')
      const user = await this.usersService.createUser(userData);
      
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role?.name || 'User' // Default fallback
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
      
      sendCreated(res, { user, token }, 'Usuario registrado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode, error.validationErrors);
        return;
      }
      logger.error('Error en register:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  /**
   * Loguea a un usuario y devuelve el JWT
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body as LoginDTO;
      const user = await this.usersService.authenticateUser(email, password);

      const payload = {
        id: user.id,
        email: user.email,
        role: user.role?.name || 'User' // We assume a populated role, else basic permission
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

      sendSuccess(res, { user, token }, 'Login exitoso');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en login:', error);
      sendError(res, 'Error interno del servidor');
    }
  };
}

export default AuthController;
