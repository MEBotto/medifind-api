import CustomersRepository from '../repositories/CustomersRepository';
import { CreateCustomerDTO, UpdateCustomerDTO } from '../dtos/customer.dto';
import { Customer } from '../models/Customer';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class CustomersService {
  constructor(
    private readonly customersRepository: CustomersRepository
  ) {}

  async createCustomer(data: CreateCustomerDTO): Promise<Customer> {
    try {
      const entity = await this.customersRepository.create(data);
      logger.info('Customer creado exitosamente');
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error al crear Customer:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async getCustomerById(id: string): Promise<Customer> {
    try {
      const entity = await this.customersRepository.findById(id);
      if (!entity) {
        throw new AppError(404, 'Customer no encontrado');
      }
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al obtener Customer ${id}:`, error);
      throw new AppError(500, 'Error al obtener la entidad');
    }
  }

  async getAllCustomers(): Promise<Customer[]> {
    try {
      return await this.customersRepository.findAll();
    } catch (error) {
      logger.error('Error al listar Customers:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async updateCustomer(id: string, data: UpdateCustomerDTO): Promise<Customer> {
    try {
      const updatedEntity = await this.customersRepository.update(id, data);
      logger.info(`Customer actualizado: ${id}`);
      return updatedEntity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar Customer ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    try {
      await this.customersRepository.delete(id);
      logger.info(`Customer eliminado: ${id}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar Customer ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default CustomersService;
