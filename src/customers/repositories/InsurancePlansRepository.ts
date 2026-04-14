import { Repository } from 'typeorm';
import { InsurancePlan } from '../models/InsurancePlan';
import AppDataSource from '@/data-source';
import { CreateInsurancePlanDTO, UpdateInsurancePlanDTO } from '../dtos/insurance-plan.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class InsurancePlansRepository {
  private ormRepository: Repository<InsurancePlan>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(InsurancePlan);
  }

  async create(data: CreateInsurancePlanDTO): Promise<InsurancePlan> {
    try {
      const entity = this.ormRepository.create(data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      logger.error('Error al crear InsurancePlan:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async findById(id: string): Promise<InsurancePlan | null> {
    try {
      return await this.ormRepository.findOne({ where: { id } as any });
    } catch (error) {
      logger.error(`Error al buscar InsurancePlan ${id}:`, error);
      throw new AppError(500, 'Error al buscar la entidad');
    }
  }

  async findAll(): Promise<InsurancePlan[]> {
    try {
      return await this.ormRepository.find();
    } catch (error) {
      logger.error('Error al buscar insuranceplans:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async update(id: string, data: UpdateInsurancePlanDTO): Promise<InsurancePlan> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'InsurancePlan no encontrado');
      }

      Object.assign(entity, data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar InsurancePlan ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'InsurancePlan no encontrado');
      }

      await this.ormRepository.remove(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar InsurancePlan ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default InsurancePlansRepository;
