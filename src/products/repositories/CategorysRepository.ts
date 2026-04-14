import { Repository } from 'typeorm';
import { Category } from '../models/Category';
import AppDataSource from '@/data-source';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../dtos/category.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class CategorysRepository {
  private ormRepository: Repository<Category>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Category);
  }

  async create(data: CreateCategoryDTO): Promise<Category> {
    try {
      const entity = this.ormRepository.create(data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      logger.error('Error al crear Category:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async findById(id: string): Promise<Category | null> {
    try {
      return await this.ormRepository.findOne({ where: { id } as any });
    } catch (error) {
      logger.error(`Error al buscar Category ${id}:`, error);
      throw new AppError(500, 'Error al buscar la entidad');
    }
  }

  async findAll(): Promise<Category[]> {
    try {
      return await this.ormRepository.find();
    } catch (error) {
      logger.error('Error al buscar categorys:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async update(id: string, data: UpdateCategoryDTO): Promise<Category> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'Category no encontrado');
      }

      Object.assign(entity, data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar Category ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'Category no encontrado');
      }

      await this.ormRepository.remove(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar Category ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default CategorysRepository;
