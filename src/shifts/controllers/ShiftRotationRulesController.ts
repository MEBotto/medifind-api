import { Request, Response } from 'express';
import ShiftRotationRulesService from '../services/ShiftRotationRulesService';
import { CreateShiftRotationRuleDTO, UpdateShiftRotationRuleDTO } from '../dtos/shift-rotation-rule.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';
import { sendSuccess, sendCreated, sendError } from '@/utils/api.utils';

class ShiftRotationRulesController {
  constructor(private readonly shiftRotationRulesService: ShiftRotationRulesService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body as CreateShiftRotationRuleDTO;
      const entity = await this.shiftRotationRulesService.createShiftRotationRule(data);
      sendCreated(res, entity, 'ShiftRotationRule creado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode, error.validationErrors);
        return;
      }
      logger.error('Error en create ShiftRotationRule:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const entity = await this.shiftRotationRulesService.getShiftRotationRuleById(id);
      sendSuccess(res, entity);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en getById ShiftRotationRule:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const entities = await this.shiftRotationRulesService.getAllShiftRotationRules();
      sendSuccess(res, entities);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en getAll ShiftRotationRules:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body as UpdateShiftRotationRuleDTO;
      const entity = await this.shiftRotationRulesService.updateShiftRotationRule(id, data);
      sendSuccess(res, entity, 'ShiftRotationRule actualizado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en update ShiftRotationRule:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.shiftRotationRulesService.deleteShiftRotationRule(id);
      sendSuccess(res, null, 'ShiftRotationRule eliminado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en delete ShiftRotationRule:', error);
      sendError(res, 'Error interno del servidor');
    }
  };
}

export default ShiftRotationRulesController;
