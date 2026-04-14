import CategorysRepository from '../repositories/CategorysRepository';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../dtos/category.dto';
import { Category } from '../models/Category';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class CategorysService {
  constructor(
    private readonly categorysRepository: CategorysRepository
  ) {}

  async createCategory(data: CreateCategoryDTO): Promise<Category> {
    try {
      const entity = await this.categorysRepository.create(data);
      logger.info('Category creado exitosamente');
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error al crear Category:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async getCategoryById(id: string): Promise<Category> {
    try {
      const entity = await this.categorysRepository.findById(id);
      if (!entity) {
        throw new AppError(404, 'Category no encontrado');
      }
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al obtener Category ${id}:`, error);
      throw new AppError(500, 'Error al obtener la entidad');
    }
  }

  async getAllCategorys(): Promise<Category[]> {
    try {
      return await this.categorysRepository.findAll();
    } catch (error) {
      logger.error('Error al listar Categorys:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async updateCategory(id: string, data: UpdateCategoryDTO): Promise<Category> {
    try {
      const updatedEntity = await this.categorysRepository.update(id, data);
      logger.info(`Category actualizado: ${id}`);
      return updatedEntity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar Category ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      await this.categorysRepository.delete(id);
      logger.info(`Category eliminado: ${id}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar Category ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default CategorysService;
