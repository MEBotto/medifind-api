import { Request, Response } from 'express';
import InsurancePlansService from '../services/InsurancePlansService';
import { CreateInsurancePlanDTO, UpdateInsurancePlanDTO } from '../dtos/insurance-plan.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';
import { sendSuccess, sendCreated, sendError } from '@/utils/api.utils';

class InsurancePlansController {
  constructor(private readonly insurancePlansService: InsurancePlansService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body as CreateInsurancePlanDTO;
      const entity = await this.insurancePlansService.createInsurancePlan(data);
      sendCreated(res, entity, 'InsurancePlan creado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode, error.validationErrors);
        return;
      }
      logger.error('Error en create InsurancePlan:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const entity = await this.insurancePlansService.getInsurancePlanById(id);
      sendSuccess(res, entity);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en getById InsurancePlan:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const entities = await this.insurancePlansService.getAllInsurancePlans();
      sendSuccess(res, entities);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en getAll InsurancePlans:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body as UpdateInsurancePlanDTO;
      const entity = await this.insurancePlansService.updateInsurancePlan(id, data);
      sendSuccess(res, entity, 'InsurancePlan actualizado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en update InsurancePlan:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.insurancePlansService.deleteInsurancePlan(id);
      sendSuccess(res, null, 'InsurancePlan eliminado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en delete InsurancePlan:', error);
      sendError(res, 'Error interno del servidor');
    }
  };
}

export default InsurancePlansController;
