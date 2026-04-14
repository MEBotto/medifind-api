import ShiftsRepository from '../repositories/ShiftsRepository';
import { CreateShiftDTO, UpdateShiftDTO } from '../dtos/shift.dto';
import { Shift } from '../models/Shift';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class ShiftsService {
  constructor(
    private readonly shiftsRepository: ShiftsRepository
  ) {}

  async createShift(data: CreateShiftDTO): Promise<Shift> {
    try {
      const entity = await this.shiftsRepository.create(data);
      logger.info('Shift creado exitosamente');
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error al crear Shift:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async getShiftById(id: string): Promise<Shift> {
    try {
      const entity = await this.shiftsRepository.findById(id);
      if (!entity) {
        throw new AppError(404, 'Shift no encontrado');
      }
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al obtener Shift ${id}:`, error);
      throw new AppError(500, 'Error al obtener la entidad');
    }
  }

  async getAllShifts(): Promise<Shift[]> {
    try {
      return await this.shiftsRepository.findAll();
    } catch (error) {
      logger.error('Error al listar Shifts:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async updateShift(id: string, data: UpdateShiftDTO): Promise<Shift> {
    try {
      const updatedEntity = await this.shiftsRepository.update(id, data);
      logger.info(`Shift actualizado: ${id}`);
      return updatedEntity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar Shift ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async deleteShift(id: string): Promise<void> {
    try {
      await this.shiftsRepository.delete(id);
      logger.info(`Shift eliminado: ${id}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar Shift ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default ShiftsService;
