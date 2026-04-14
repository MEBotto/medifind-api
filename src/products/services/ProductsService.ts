import ProductsRepository from '../repositories/ProductsRepository';
import { CreateProductDTO, UpdateProductDTO } from '../dtos/product.dto';
import { Product } from '../models/Product';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository
  ) {}

  async createProduct(data: CreateProductDTO): Promise<Product> {
    try {
      const entity = await this.productsRepository.create(data);
      logger.info('Product creado exitosamente');
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error al crear Product:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const entity = await this.productsRepository.findById(id);
      if (!entity) {
        throw new AppError(404, 'Product no encontrado');
      }
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al obtener Product ${id}:`, error);
      throw new AppError(500, 'Error al obtener la entidad');
    }
  }

  async getAllProducts(): Promise<Product[]> {
    try {
      return await this.productsRepository.findAll();
    } catch (error) {
      logger.error('Error al listar Products:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async updateProduct(id: string, data: UpdateProductDTO): Promise<Product> {
    try {
      const updatedEntity = await this.productsRepository.update(id, data);
      logger.info(`Product actualizado: ${id}`);
      return updatedEntity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar Product ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await this.productsRepository.delete(id);
      logger.info(`Product eliminado: ${id}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar Product ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default ProductsService;
