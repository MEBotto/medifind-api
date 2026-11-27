import { Repository } from 'typeorm';
import { OrderItem } from '../models/OrderItem';
import AppDataSource from '@/data-source';
import { CreateOrderItemDTO, UpdateOrderItemDTO } from '../dtos/order-item.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class OrderItemsRepository {
  private ormRepository: Repository<OrderItem>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(OrderItem);
  }

  async create(data: CreateOrderItemDTO): Promise<OrderItem> {
    try {
      const entity = this.ormRepository.create(data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      logger.error('Error al crear OrderItem:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async findById(id: string): Promise<OrderItem | null> {
    try {
      return await this.ormRepository.findOneBy({ id });
    } catch (error) {
      logger.error(`Error al buscar OrderItem ${id}:`, error);
      throw new AppError(500, 'Error al buscar la entidad');
    }
  }

  async findAll(): Promise<OrderItem[]> {
    try {
      return await this.ormRepository.find();
    } catch (error) {
      logger.error('Error al buscar orderitems:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async update(id: string, data: UpdateOrderItemDTO): Promise<OrderItem> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'OrderItem no encontrado');
      }

      Object.assign(entity, data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar OrderItem ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'OrderItem no encontrado');
      }

      await this.ormRepository.remove(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar OrderItem ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default OrderItemsRepository;
