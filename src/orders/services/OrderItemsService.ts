import OrderItemsRepository from '../repositories/OrderItemsRepository';
import { CreateOrderItemDTO, UpdateOrderItemDTO } from '../dtos/order-item.dto';
import { OrderItem } from '../models/OrderItem';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class OrderItemsService {
  constructor(
    private readonly orderItemsRepository: OrderItemsRepository
  ) {}

  async createOrderItem(data: CreateOrderItemDTO): Promise<OrderItem> {
    try {
      const entity = await this.orderItemsRepository.create(data);
      logger.info('OrderItem creado exitosamente');
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error al crear OrderItem:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async getOrderItemById(id: string): Promise<OrderItem> {
    try {
      const entity = await this.orderItemsRepository.findById(id);
      if (!entity) {
        throw new AppError(404, 'OrderItem no encontrado');
      }
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al obtener OrderItem ${id}:`, error);
      throw new AppError(500, 'Error al obtener la entidad');
    }
  }

  async getAllOrderItems(): Promise<OrderItem[]> {
    try {
      return await this.orderItemsRepository.findAll();
    } catch (error) {
      logger.error('Error al listar OrderItems:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async updateOrderItem(id: string, data: UpdateOrderItemDTO): Promise<OrderItem> {
    try {
      const updatedEntity = await this.orderItemsRepository.update(id, data);
      logger.info(`OrderItem actualizado: ${id}`);
      return updatedEntity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar OrderItem ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async deleteOrderItem(id: string): Promise<void> {
    try {
      await this.orderItemsRepository.delete(id);
      logger.info(`OrderItem eliminado: ${id}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar OrderItem ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default OrderItemsService;
