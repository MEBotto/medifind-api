import { Request, Response } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';
import PharmacysService from '../services/PharmacysService';
import { CreatePharmacyDTO, UpdatePharmacyDTO } from '../dtos/pharmacy.dto';
import { PharmacySearchSchema } from '../dtos/pharmacy-search.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';
import { sendSuccess, sendCreated, sendError } from '@/utils/api.utils';

class PharmacysController {
  constructor(private readonly pharmacysService: PharmacysService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body as CreatePharmacyDTO;
      const entity = await this.pharmacysService.createPharmacy(data);
      sendCreated(res, entity, 'Pharmacy creado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode, error.validationErrors);
        return;
      }
      logger.error('Error en create Pharmacy:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const entity = await this.pharmacysService.getPharmacyById(id);
      sendSuccess(res, entity);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en getById Pharmacy:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  getAll = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const parsed = PharmacySearchSchema.safeParse(req.query);
      if (!parsed.success) {
        sendError(res, 'Parámetros de búsqueda inválidos', 400, parsed.error.issues.map(issue => ({ path: issue.path.join('.'), message: issue.message })));
        return;
      }
      if (!req.user) {
        sendError(res, 'Authentication required', 401);
        return;
      }
      const result = await this.pharmacysService.getAllPharmacys(parsed.data, req.user.id);
      sendSuccess(res, result);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en getAll Pharmacys:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body as UpdatePharmacyDTO;
      const entity = await this.pharmacysService.updatePharmacy(id, data);
      sendSuccess(res, entity, 'Pharmacy actualizado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en update Pharmacy:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.pharmacysService.deletePharmacy(id);
      sendSuccess(res, null, 'Pharmacy eliminado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en delete Pharmacy:', error);
      sendError(res, 'Error interno del servidor');
    }
  };
}

export default PharmacysController;
