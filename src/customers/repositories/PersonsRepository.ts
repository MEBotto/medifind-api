import { Repository } from 'typeorm';
import { Person } from '../models/Person';
import AppDataSource from '@/data-source';
import { CreatePersonDTO, UpdatePersonDTO } from '../dtos/person.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class PersonsRepository {
  private ormRepository: Repository<Person>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Person);
  }

  async create(data: CreatePersonDTO): Promise<Person> {
    try {
      const entity = this.ormRepository.create(data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      logger.error('Error al crear Person:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async findById(id: string): Promise<Person | null> {
    try {
      return await this.ormRepository.findOne({ where: { id } as any });
    } catch (error) {
      logger.error(`Error al buscar Person ${id}:`, error);
      throw new AppError(500, 'Error al buscar la entidad');
    }
  }

  async findAll(): Promise<Person[]> {
    try {
      return await this.ormRepository.find();
    } catch (error) {
      logger.error('Error al buscar persons:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async update(id: string, data: UpdatePersonDTO): Promise<Person> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'Person no encontrado');
      }

      Object.assign(entity, data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar Person ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'Person no encontrado');
      }

      await this.ormRepository.remove(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar Person ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default PersonsRepository;
