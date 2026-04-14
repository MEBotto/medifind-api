import { Repository } from 'typeorm';
import { ShiftRotationRuleShift } from '../models/ShiftRotationRuleShift';
import AppDataSource from '@/data-source';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class ShiftRotationRuleShiftsRepository {
  private ormRepository: Repository<ShiftRotationRuleShift>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(ShiftRotationRuleShift);
  }

  async findById(id: string): Promise<ShiftRotationRuleShift | null> {
    try {
      return await this.ormRepository.findOne({ where: { id } as any });
    } catch (error) {
      logger.error(`Error al buscar ShiftRotationRuleShift ${id}:`, error);
      throw new AppError(500, 'Error al buscar la entidad');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const entity = await this.findById(id);
      if (!entity) throw new AppError(404, 'ShiftRotationRuleShift no encontrado');
      await this.ormRepository.remove(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar ShiftRotationRuleShift ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default ShiftRotationRuleShiftsRepository;
