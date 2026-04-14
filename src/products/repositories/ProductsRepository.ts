import { Repository } from 'typeorm';
import { Product } from '../models/Product';
import AppDataSource from '@/data-source';
import { CreateProductDTO, UpdateProductDTO } from '../dtos/product.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class ProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Product);
  }

  async create(data: CreateProductDTO): Promise<Product> {
    try {
      const entity = this.ormRepository.create(data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      logger.error('Error al crear Product:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async findById(id: string): Promise<Product | null> {
    try {
      return await this.ormRepository.findOne({ where: { id } as any });
    } catch (error) {
      logger.error(`Error al buscar Product ${id}:`, error);
      throw new AppError(500, 'Error al buscar la entidad');
    }
  }

  async findAll(): Promise<Product[]> {
    try {
      return await this.ormRepository.find();
    } catch (error) {
      logger.error('Error al buscar products:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async update(id: string, data: UpdateProductDTO): Promise<Product> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'Product no encontrado');
      }

      Object.assign(entity, data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar Product ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'Product no encontrado');
      }

      await this.ormRepository.remove(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar Product ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default ProductsRepository;
