import { Request, Response } from 'express';
import ShiftRotationRuleShiftsService from '../services/ShiftRotationRuleShiftsService';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';
import { sendSuccess, sendError } from '@/utils/api.utils';

class ShiftRotationRuleShiftsController {
  constructor(private readonly service: ShiftRotationRuleShiftsService) {}

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
      logger.error('Error en getById ShiftRotationRuleShift:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.delete(id);
      sendSuccess(res, null, 'ShiftRotationRuleShift eliminado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en delete ShiftRotationRuleShift:', error);
      sendError(res, 'Error interno del servidor');
    }
  };
}

export default ShiftRotationRuleShiftsController;
