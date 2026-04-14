import { Request, Response } from 'express';
import OrderItemsService from '../services/OrderItemsService';
import { CreateOrderItemDTO, UpdateOrderItemDTO } from '../dtos/order-item.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';
import { sendSuccess, sendCreated, sendError } from '@/utils/api.utils';

class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body as CreateOrderItemDTO;
      const entity = await this.orderItemsService.createOrderItem(data);
      sendCreated(res, entity, 'OrderItem creado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode, error.validationErrors);
        return;
      }
      logger.error('Error en create OrderItem:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const entity = await this.orderItemsService.getOrderItemById(id);
      sendSuccess(res, entity);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en getById OrderItem:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const entities = await this.orderItemsService.getAllOrderItems();
      sendSuccess(res, entities);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en getAll OrderItems:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body as UpdateOrderItemDTO;
      const entity = await this.orderItemsService.updateOrderItem(id, data);
      sendSuccess(res, entity, 'OrderItem actualizado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en update OrderItem:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.orderItemsService.deleteOrderItem(id);
      sendSuccess(res, null, 'OrderItem eliminado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en delete OrderItem:', error);
      sendError(res, 'Error interno del servidor');
    }
  };
}

export default OrderItemsController;
