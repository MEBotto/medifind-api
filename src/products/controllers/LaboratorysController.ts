import { Request, Response } from 'express';
import LaboratorysService from '../services/LaboratorysService';
import { CreateLaboratoryDTO, UpdateLaboratoryDTO } from '../dtos/laboratory.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';
import { sendSuccess, sendCreated, sendError } from '@/utils/api.utils';

class LaboratorysController {
  constructor(private readonly laboratorysService: LaboratorysService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body as CreateLaboratoryDTO;
      const entity = await this.laboratorysService.createLaboratory(data);
      sendCreated(res, entity, 'Laboratory creado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode, error.validationErrors);
        return;
      }
      logger.error('Error en create Laboratory:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const entity = await this.laboratorysService.getLaboratoryById(id);
      sendSuccess(res, entity);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en getById Laboratory:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const entities = await this.laboratorysService.getAllLaboratorys();
      sendSuccess(res, entities);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en getAll Laboratorys:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body as UpdateLaboratoryDTO;
      const entity = await this.laboratorysService.updateLaboratory(id, data);
      sendSuccess(res, entity, 'Laboratory actualizado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en update Laboratory:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.laboratorysService.deleteLaboratory(id);
      sendSuccess(res, null, 'Laboratory eliminado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en delete Laboratory:', error);
      sendError(res, 'Error interno del servidor');
    }
  };
}

export default LaboratorysController;
