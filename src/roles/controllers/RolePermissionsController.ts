import { Request, Response } from 'express';
import RolePermissionsService from '../services/RolePermissionsService';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';
import { sendSuccess, sendError } from '@/utils/api.utils';

class RolePermissionsController {
  constructor(private readonly service: RolePermissionsService) {}

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const entity = await this.service.getById(id);
      sendSuccess(res, entity);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en getById RolePermission:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.delete(id);
      sendSuccess(res, null, 'RolePermission eliminado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en delete RolePermission:', error);
      sendError(res, 'Error interno del servidor');
    }
  };
}

export default RolePermissionsController;
