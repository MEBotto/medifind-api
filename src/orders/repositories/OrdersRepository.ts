import { Repository } from 'typeorm';
import { Order } from '../models/Order';
import AppDataSource from '@/data-source';
import { CreateOrderDTO, UpdateOrderDTO } from '../dtos/order.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class OrdersRepository {
  private ormRepository: Repository<Order>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Order);
  }

  async create(data: CreateOrderDTO): Promise<Order> {
    try {
      const entity = this.ormRepository.create(data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      logger.error('Error al crear Order:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async findById(id: string): Promise<Order | null> {
    try {
      return await this.ormRepository.findOneBy({ id });
    } catch (error) {
      logger.error(`Error al buscar Order ${id}:`, error);
      throw new AppError(500, 'Error al buscar la entidad');
    }
  }

  async findAll(): Promise<Order[]> {
    try {
      return await this.ormRepository.find();
    } catch (error) {
      logger.error('Error al buscar orders:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async update(id: string, data: UpdateOrderDTO): Promise<Order> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'Order no encontrado');
      }

      Object.assign(entity, data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar Order ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'Order no encontrado');
      }

      await this.ormRepository.remove(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar Order ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default OrdersRepository;
