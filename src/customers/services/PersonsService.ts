import PersonsRepository from '../repositories/PersonsRepository';
import { CreatePersonDTO, UpdatePersonDTO } from '../dtos/person.dto';
import { Person } from '../models/Person';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class PersonsService {
  constructor(
    private readonly personsRepository: PersonsRepository
  ) {}

  async createPerson(data: CreatePersonDTO): Promise<Person> {
    try {
      const entity = await this.personsRepository.create(data);
      logger.info('Person creado exitosamente');
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error al crear Person:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async getPersonById(id: string): Promise<Person> {
    try {
      const entity = await this.personsRepository.findById(id);
      if (!entity) {
        throw new AppError(404, 'Person no encontrado');
      }
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al obtener Person ${id}:`, error);
      throw new AppError(500, 'Error al obtener la entidad');
    }
  }

  async getAllPersons(): Promise<Person[]> {
    try {
      return await this.personsRepository.findAll();
    } catch (error) {
      logger.error('Error al listar Persons:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async updatePerson(id: string, data: UpdatePersonDTO): Promise<Person> {
    try {
      const updatedEntity = await this.personsRepository.update(id, data);
      logger.info(`Person actualizado: ${id}`);
      return updatedEntity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar Person ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async deletePerson(id: string): Promise<void> {
    try {
      await this.personsRepository.delete(id);
      logger.info(`Person eliminado: ${id}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar Person ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default PersonsService;
