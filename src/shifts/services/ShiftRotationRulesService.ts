import ShiftRotationRulesRepository from '../repositories/ShiftRotationRulesRepository';
import { CreateShiftRotationRuleDTO, UpdateShiftRotationRuleDTO } from '../dtos/shift-rotation-rule.dto';
import { ShiftRotationRule } from '../models/ShiftRotationRule';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class ShiftRotationRulesService {
  constructor(
    private readonly shiftRotationRulesRepository: ShiftRotationRulesRepository
  ) {}

  async createShiftRotationRule(data: CreateShiftRotationRuleDTO): Promise<ShiftRotationRule> {
    try {
      const entity = await this.shiftRotationRulesRepository.create(data);
      logger.info('ShiftRotationRule creado exitosamente');
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error al crear ShiftRotationRule:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async getShiftRotationRuleById(id: string): Promise<ShiftRotationRule> {
    try {
      const entity = await this.shiftRotationRulesRepository.findById(id);
      if (!entity) {
        throw new AppError(404, 'ShiftRotationRule no encontrado');
      }
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al obtener ShiftRotationRule ${id}:`, error);
      throw new AppError(500, 'Error al obtener la entidad');
    }
  }

  async getAllShiftRotationRules(): Promise<ShiftRotationRule[]> {
    try {
      return await this.shiftRotationRulesRepository.findAll();
    } catch (error) {
      logger.error('Error al listar ShiftRotationRules:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async updateShiftRotationRule(id: string, data: UpdateShiftRotationRuleDTO): Promise<ShiftRotationRule> {
    try {
      const updatedEntity = await this.shiftRotationRulesRepository.update(id, data);
      logger.info(`ShiftRotationRule actualizado: ${id}`);
      return updatedEntity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar ShiftRotationRule ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async deleteShiftRotationRule(id: string): Promise<void> {
    try {
      await this.shiftRotationRulesRepository.delete(id);
      logger.info(`ShiftRotationRule eliminado: ${id}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar ShiftRotationRule ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default ShiftRotationRulesService;
