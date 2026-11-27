import { Repository, DeepPartial } from 'typeorm';
import { ShiftRotationRule } from '../models/ShiftRotationRule';
import AppDataSource from '@/data-source';
import { CreateShiftRotationRuleDTO, UpdateShiftRotationRuleDTO } from '../dtos/shift-rotation-rule.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class ShiftRotationRulesRepository {
  private ormRepository: Repository<ShiftRotationRule>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(ShiftRotationRule);
  }

  async create(data: CreateShiftRotationRuleDTO): Promise<ShiftRotationRule> {
    try {
      const entity = this.ormRepository.create(data as unknown as DeepPartial<ShiftRotationRule>);
      return await this.ormRepository.save(entity);
    } catch (error) {
      logger.error('Error al crear ShiftRotationRule:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async findById(id: string): Promise<ShiftRotationRule | null> {
    try {
      return await this.ormRepository.findOneBy({ id });
    } catch (error) {
      logger.error(`Error al buscar ShiftRotationRule ${id}:`, error);
      throw new AppError(500, 'Error al buscar la entidad');
    }
  }

  async findAll(): Promise<ShiftRotationRule[]> {
    try {
      return await this.ormRepository.find();
    } catch (error) {
      logger.error('Error al buscar shiftrotationrules:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async update(id: string, data: UpdateShiftRotationRuleDTO): Promise<ShiftRotationRule> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'ShiftRotationRule no encontrado');
      }

      Object.assign(entity, data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar ShiftRotationRule ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'ShiftRotationRule no encontrado');
      }

      await this.ormRepository.remove(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar ShiftRotationRule ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default ShiftRotationRulesRepository;
