import LaboratorysRepository from '../repositories/LaboratorysRepository';
import { CreateLaboratoryDTO, UpdateLaboratoryDTO } from '../dtos/laboratory.dto';
import { Laboratory } from '../models/Laboratory';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class LaboratorysService {
  constructor(
    private readonly laboratorysRepository: LaboratorysRepository
  ) {}

  async createLaboratory(data: CreateLaboratoryDTO): Promise<Laboratory> {
    try {
      const entity = await this.laboratorysRepository.create(data);
      logger.info('Laboratory creado exitosamente');
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error al crear Laboratory:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async getLaboratoryById(id: string): Promise<Laboratory> {
    try {
      const entity = await this.laboratorysRepository.findById(id);
      if (!entity) {
        throw new AppError(404, 'Laboratory no encontrado');
      }
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al obtener Laboratory ${id}:`, error);
      throw new AppError(500, 'Error al obtener la entidad');
    }
  }

  async getAllLaboratorys(): Promise<Laboratory[]> {
    try {
      return await this.laboratorysRepository.findAll();
    } catch (error) {
      logger.error('Error al listar Laboratorys:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async updateLaboratory(id: string, data: UpdateLaboratoryDTO): Promise<Laboratory> {
    try {
      const updatedEntity = await this.laboratorysRepository.update(id, data);
      logger.info(`Laboratory actualizado: ${id}`);
      return updatedEntity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar Laboratory ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async deleteLaboratory(id: string): Promise<void> {
    try {
      await this.laboratorysRepository.delete(id);
      logger.info(`Laboratory eliminado: ${id}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar Laboratory ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default LaboratorysService;
