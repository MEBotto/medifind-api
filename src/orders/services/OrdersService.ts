import OrdersRepository from '../repositories/OrdersRepository';
import { CreateOrderDTO, UpdateOrderDTO } from '../dtos/order.dto';
import { Order } from '../models/Order';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository
  ) {}

  async createOrder(data: CreateOrderDTO): Promise<Order> {
    try {
      const entity = await this.ordersRepository.create(data);
      logger.info('Order creado exitosamente');
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error al crear Order:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async getOrderById(id: string): Promise<Order> {
    try {
      const entity = await this.ordersRepository.findById(id);
      if (!entity) {
        throw new AppError(404, 'Order no encontrado');
      }
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al obtener Order ${id}:`, error);
      throw new AppError(500, 'Error al obtener la entidad');
    }
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      return await this.ordersRepository.findAll();
    } catch (error) {
      logger.error('Error al listar Orders:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async updateOrder(id: string, data: UpdateOrderDTO): Promise<Order> {
    try {
      const updatedEntity = await this.ordersRepository.update(id, data);
      logger.info(`Order actualizado: ${id}`);
      return updatedEntity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar Order ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async deleteOrder(id: string): Promise<void> {
    try {
      await this.ordersRepository.delete(id);
      logger.info(`Order eliminado: ${id}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar Order ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default OrdersService;
