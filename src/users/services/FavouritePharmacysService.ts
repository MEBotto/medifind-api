import FavouritePharmacysRepository from '../repositories/FavouritePharmacysRepository';
import { CreateFavouritePharmacyDTO, UpdateFavouritePharmacyDTO } from '../dtos/favourite-pharmacy.dto';
import { FavouritePharmacy } from '../models/FavouritePharmacy';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class FavouritePharmacysService {
  constructor(
    private readonly favouritePharmacysRepository: FavouritePharmacysRepository
  ) {}

  async createFavouritePharmacy(data: CreateFavouritePharmacyDTO): Promise<FavouritePharmacy> {
    try {
      const entity = await this.favouritePharmacysRepository.create(data);
      logger.info('FavouritePharmacy creado exitosamente');
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error al crear FavouritePharmacy:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async getFavouritePharmacyById(id: string): Promise<FavouritePharmacy> {
    try {
      const entity = await this.favouritePharmacysRepository.findById(id);
      if (!entity) {
        throw new AppError(404, 'FavouritePharmacy no encontrado');
      }
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al obtener FavouritePharmacy ${id}:`, error);
      throw new AppError(500, 'Error al obtener la entidad');
    }
  }

  async getAllFavouritePharmacys(): Promise<FavouritePharmacy[]> {
    try {
      return await this.favouritePharmacysRepository.findAll();
    } catch (error) {
      logger.error('Error al listar FavouritePharmacys:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async updateFavouritePharmacy(id: string, data: UpdateFavouritePharmacyDTO): Promise<FavouritePharmacy> {
    try {
      const updatedEntity = await this.favouritePharmacysRepository.update(id, data);
      logger.info(`FavouritePharmacy actualizado: ${id}`);
      return updatedEntity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar FavouritePharmacy ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async deleteFavouritePharmacy(id: string): Promise<void> {
    try {
      await this.favouritePharmacysRepository.delete(id);
      logger.info(`FavouritePharmacy eliminado: ${id}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar FavouritePharmacy ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default FavouritePharmacysService;
