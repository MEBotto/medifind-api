import { Repository } from 'typeorm';
import { FavouritePharmacy } from '../models/FavouritePharmacy';
import AppDataSource from '@/data-source';
import { CreateFavouritePharmacyDTO, UpdateFavouritePharmacyDTO } from '../dtos/favourite-pharmacy.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class FavouritePharmacysRepository {
  private ormRepository: Repository<FavouritePharmacy>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(FavouritePharmacy);
  }

  async create(data: CreateFavouritePharmacyDTO): Promise<FavouritePharmacy> {
    try {
      const entity = this.ormRepository.create(data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      logger.error('Error al crear FavouritePharmacy:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async findById(id: string): Promise<FavouritePharmacy | null> {
    try {
      return await this.ormRepository.findOne({ where: { id } as any });
    } catch (error) {
      logger.error(`Error al buscar FavouritePharmacy ${id}:`, error);
      throw new AppError(500, 'Error al buscar la entidad');
    }
  }

  async findAll(): Promise<FavouritePharmacy[]> {
    try {
      return await this.ormRepository.find();
    } catch (error) {
      logger.error('Error al buscar favouritepharmacys:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async update(id: string, data: UpdateFavouritePharmacyDTO): Promise<FavouritePharmacy> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'FavouritePharmacy no encontrado');
      }

      Object.assign(entity, data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar FavouritePharmacy ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'FavouritePharmacy no encontrado');
      }

      await this.ormRepository.remove(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar FavouritePharmacy ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default FavouritePharmacysRepository;
