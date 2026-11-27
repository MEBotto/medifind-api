import { Repository } from 'typeorm';
import { Laboratory } from '../models/Laboratory';
import AppDataSource from '@/data-source';
import { CreateLaboratoryDTO, UpdateLaboratoryDTO } from '../dtos/laboratory.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class LaboratorysRepository {
  private ormRepository: Repository<Laboratory>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Laboratory);
  }

  async create(data: CreateLaboratoryDTO): Promise<Laboratory> {
    try {
      const entity = this.ormRepository.create(data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      logger.error('Error al crear Laboratory:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async findById(id: string): Promise<Laboratory | null> {
    try {
      return await this.ormRepository.findOneBy({ id });
    } catch (error) {
      logger.error(`Error al buscar Laboratory ${id}:`, error);
      throw new AppError(500, 'Error al buscar la entidad');
    }
  }

  async findAll(): Promise<Laboratory[]> {
    try {
      return await this.ormRepository.find();
    } catch (error) {
      logger.error('Error al buscar laboratorys:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async update(id: string, data: UpdateLaboratoryDTO): Promise<Laboratory> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'Laboratory no encontrado');
      }

      Object.assign(entity, data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar Laboratory ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'Laboratory no encontrado');
      }

      await this.ormRepository.remove(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar Laboratory ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default LaboratorysRepository;
