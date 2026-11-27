import { Repository, DeepPartial } from 'typeorm';
import { Customer } from '../models/Customer';
import AppDataSource from '@/data-source';
import { CreateCustomerDTO, UpdateCustomerDTO } from '../dtos/customer.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class CustomersRepository {
  private ormRepository: Repository<Customer>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Customer);
  }

  async create(data: CreateCustomerDTO): Promise<Customer> {
    try {
      const entity = this.ormRepository.create(data as unknown as DeepPartial<Customer>);
      return await this.ormRepository.save(entity);
    } catch (error) {
      logger.error('Error al crear Customer:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async findById(id: string): Promise<Customer | null> {
    try {
      return await this.ormRepository.findOneBy({ id });
    } catch (error) {
      logger.error(`Error al buscar Customer ${id}:`, error);
      throw new AppError(500, 'Error al buscar la entidad');
    }
  }

  async findAll(): Promise<Customer[]> {
    try {
      return await this.ormRepository.find();
    } catch (error) {
      logger.error('Error al buscar customers:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async update(id: string, data: UpdateCustomerDTO): Promise<Customer> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'Customer no encontrado');
      }

      Object.assign(entity, data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar Customer ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'Customer no encontrado');
      }

      await this.ormRepository.remove(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar Customer ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default CustomersRepository;
