import InsurancePlansRepository from '../repositories/InsurancePlansRepository';
import { CreateInsurancePlanDTO, UpdateInsurancePlanDTO } from '../dtos/insurance-plan.dto';
import { InsurancePlan } from '../models/InsurancePlan';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class InsurancePlansService {
  constructor(
    private readonly insurancePlansRepository: InsurancePlansRepository
  ) {}

  async createInsurancePlan(data: CreateInsurancePlanDTO): Promise<InsurancePlan> {
    try {
      const entity = await this.insurancePlansRepository.create(data);
      logger.info('InsurancePlan creado exitosamente');
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error al crear InsurancePlan:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async getInsurancePlanById(id: string): Promise<InsurancePlan> {
    try {
      const entity = await this.insurancePlansRepository.findById(id);
      if (!entity) {
        throw new AppError(404, 'InsurancePlan no encontrado');
      }
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al obtener InsurancePlan ${id}:`, error);
      throw new AppError(500, 'Error al obtener la entidad');
    }
  }

  async getAllInsurancePlans(): Promise<InsurancePlan[]> {
    try {
      return await this.insurancePlansRepository.findAll();
    } catch (error) {
      logger.error('Error al listar InsurancePlans:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async updateInsurancePlan(id: string, data: UpdateInsurancePlanDTO): Promise<InsurancePlan> {
    try {
      const updatedEntity = await this.insurancePlansRepository.update(id, data);
      logger.info(`InsurancePlan actualizado: ${id}`);
      return updatedEntity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar InsurancePlan ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async deleteInsurancePlan(id: string): Promise<void> {
    try {
      await this.insurancePlansRepository.delete(id);
      logger.info(`InsurancePlan eliminado: ${id}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar InsurancePlan ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default InsurancePlansService;
