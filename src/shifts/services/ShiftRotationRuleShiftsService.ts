import ShiftRotationRuleShiftsRepository from '../repositories/ShiftRotationRuleShiftsRepository';
import { ShiftRotationRuleShift } from '../models/ShiftRotationRuleShift';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class ShiftRotationRuleShiftsService {
  constructor(
    private readonly repository: ShiftRotationRuleShiftsRepository
  ) {}

  async getById(id: string): Promise<ShiftRotationRuleShift> {
    try {
      const entity = await this.repository.findById(id);
      if (!entity) throw new AppError(404, 'ShiftRotationRuleShift no encontrado');
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al obtener ShiftRotationRuleShift ${id}:`, error);
      throw new AppError(500, 'Error al obtener la entidad');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
      logger.info(`ShiftRotationRuleShift eliminado: ${id}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar ShiftRotationRuleShift ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default ShiftRotationRuleShiftsService;
