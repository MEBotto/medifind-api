import { Request, Response } from 'express';
import MedicalInsurancesService from '../services/MedicalInsurancesService';
import { CreateMedicalInsuranceDTO, UpdateMedicalInsuranceDTO } from '../dtos/medical-insurance.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';
import { sendSuccess, sendCreated, sendError } from '@/utils/api.utils';

class MedicalInsurancesController {
  constructor(private readonly medicalInsurancesService: MedicalInsurancesService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body as CreateMedicalInsuranceDTO;
      const entity = await this.medicalInsurancesService.createMedicalInsurance(data);
      sendCreated(res, entity, 'MedicalInsurance creado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode, error.validationErrors);
        return;
      }
      logger.error('Error en create MedicalInsurance:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const entity = await this.medicalInsurancesService.getMedicalInsuranceById(id);
      sendSuccess(res, entity);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en getById MedicalInsurance:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const entities = await this.medicalInsurancesService.getAllMedicalInsurances();
      sendSuccess(res, entities);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en getAll MedicalInsurances:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body as UpdateMedicalInsuranceDTO;
      const entity = await this.medicalInsurancesService.updateMedicalInsurance(id, data);
      sendSuccess(res, entity, 'MedicalInsurance actualizado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en update MedicalInsurance:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.medicalInsurancesService.deleteMedicalInsurance(id);
      sendSuccess(res, null, 'MedicalInsurance eliminado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en delete MedicalInsurance:', error);
      sendError(res, 'Error interno del servidor');
    }
  };
}

export default MedicalInsurancesController;
