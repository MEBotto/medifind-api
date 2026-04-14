import { Request, Response } from 'express';
import FavouritePharmacysService from '../services/FavouritePharmacysService';
import { CreateFavouritePharmacyDTO, UpdateFavouritePharmacyDTO } from '../dtos/favourite-pharmacy.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';
import { sendSuccess, sendCreated, sendError } from '@/utils/api.utils';

class FavouritePharmacysController {
  constructor(private readonly favouritePharmacysService: FavouritePharmacysService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body as CreateFavouritePharmacyDTO;
      const entity = await this.favouritePharmacysService.createFavouritePharmacy(data);
      sendCreated(res, entity, 'FavouritePharmacy creado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode, error.validationErrors);
        return;
      }
      logger.error('Error en create FavouritePharmacy:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const entity = await this.favouritePharmacysService.getFavouritePharmacyById(id);
      sendSuccess(res, entity);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en getById FavouritePharmacy:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const entities = await this.favouritePharmacysService.getAllFavouritePharmacys();
      sendSuccess(res, entities);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en getAll FavouritePharmacys:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body as UpdateFavouritePharmacyDTO;
      const entity = await this.favouritePharmacysService.updateFavouritePharmacy(id, data);
      sendSuccess(res, entity, 'FavouritePharmacy actualizado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en update FavouritePharmacy:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.favouritePharmacysService.deleteFavouritePharmacy(id);
      sendSuccess(res, null, 'FavouritePharmacy eliminado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en delete FavouritePharmacy:', error);
      sendError(res, 'Error interno del servidor');
    }
  };
}

export default FavouritePharmacysController;
