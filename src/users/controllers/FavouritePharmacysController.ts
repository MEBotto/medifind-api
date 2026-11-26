import { Response } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';
import FavouritePharmacysService from '../services/FavouritePharmacysService';
import { CreateFavouritePharmacyDTO, UpdateFavouritePharmacyDTO } from '../dtos/favourite-pharmacy.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';
import { sendSuccess, sendCreated, sendError } from '@/utils/api.utils';

class FavouritePharmacysController {
  constructor(private readonly service: FavouritePharmacysService) {}

  private handleError(res: Response, error: unknown): void {
    if (error instanceof AppError) {
      sendError(res, error.message, error.statusCode, error.validationErrors);
      return;
    }
    logger.error('Error en favoritos:', error);
    sendError(res, 'Error interno del servidor');
  }

  create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const entity = await this.service.createFavouritePharmacy(req.user.id, req.body as CreateFavouritePharmacyDTO);
      sendCreated(res, entity, 'Farmacia agregada a favoritos');
    } catch (error) { this.handleError(res, error); }
  };

  getById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const entity = await this.service.getFavouritePharmacyById(req.user.id, req.params.id);
      if (!entity) throw new AppError(404, 'Favorito no encontrado');
      sendSuccess(res, entity);
    } catch (error) { this.handleError(res, error); }
  };

  getAll = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      sendSuccess(res, await this.service.getAllFavouritePharmacys(req.user.id));
    } catch (error) { this.handleError(res, error); }
  };

  update = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      const entity = await this.service.updateFavouritePharmacy(req.user.id, req.params.id, req.body as UpdateFavouritePharmacyDTO);
      sendSuccess(res, entity, 'Favorito actualizado');
    } catch (error) { this.handleError(res, error); }
  };

  delete = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required');
      await this.service.deleteFavouritePharmacy(req.user.id, req.params.id);
      sendSuccess(res, null, 'Favorito eliminado');
    } catch (error) { this.handleError(res, error); }
  };
}
export default FavouritePharmacysController;
