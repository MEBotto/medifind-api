import { Repository, DeepPartial } from 'typeorm';
import { Pharmacy } from '../models/Pharmacy';
import AppDataSource from '@/data-source';
import { CreatePharmacyDTO, UpdatePharmacyDTO } from '../dtos/pharmacy.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class PharmacysRepository {
  private ormRepository: Repository<Pharmacy>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Pharmacy);
  }

  async create(data: CreatePharmacyDTO): Promise<Pharmacy> {
    try {
      const entity = this.ormRepository.create(data as unknown as DeepPartial<Pharmacy>);
      return await this.ormRepository.save(entity);
    } catch (error) {
      logger.error('Error al crear Pharmacy:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async findById(id: string): Promise<Pharmacy | null> {
    try {
      return await this.ormRepository.findOne({ where: { id } as any });
    } catch (error) {
      logger.error(`Error al buscar Pharmacy ${id}:`, error);
      throw new AppError(500, 'Error al buscar la entidad');
    }
  }

  async findAll(): Promise<Pharmacy[]> {
    try {
      return await this.ormRepository.find();
    } catch (error) {
      logger.error('Error al buscar pharmacys:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async update(id: string, data: UpdatePharmacyDTO): Promise<Pharmacy> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'Pharmacy no encontrado');
      }

      Object.assign(entity, data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar Pharmacy ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'Pharmacy no encontrado');
      }

      await this.ormRepository.remove(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar Pharmacy ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default PharmacysRepository;
