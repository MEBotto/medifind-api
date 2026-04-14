import MedicalInsurancesRepository from '../repositories/MedicalInsurancesRepository';
import { CreateMedicalInsuranceDTO, UpdateMedicalInsuranceDTO } from '../dtos/medical-insurance.dto';
import { MedicalInsurance } from '../models/MedicalInsurance';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class MedicalInsurancesService {
  constructor(
    private readonly medicalInsurancesRepository: MedicalInsurancesRepository
  ) {}

  async createMedicalInsurance(data: CreateMedicalInsuranceDTO): Promise<MedicalInsurance> {
    try {
      const entity = await this.medicalInsurancesRepository.create(data);
      logger.info('MedicalInsurance creado exitosamente');
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error al crear MedicalInsurance:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async getMedicalInsuranceById(id: string): Promise<MedicalInsurance> {
    try {
      const entity = await this.medicalInsurancesRepository.findById(id);
      if (!entity) {
        throw new AppError(404, 'MedicalInsurance no encontrado');
      }
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al obtener MedicalInsurance ${id}:`, error);
      throw new AppError(500, 'Error al obtener la entidad');
    }
  }

  async getAllMedicalInsurances(): Promise<MedicalInsurance[]> {
    try {
      return await this.medicalInsurancesRepository.findAll();
    } catch (error) {
      logger.error('Error al listar MedicalInsurances:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async updateMedicalInsurance(id: string, data: UpdateMedicalInsuranceDTO): Promise<MedicalInsurance> {
    try {
      const updatedEntity = await this.medicalInsurancesRepository.update(id, data);
      logger.info(`MedicalInsurance actualizado: ${id}`);
      return updatedEntity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar MedicalInsurance ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async deleteMedicalInsurance(id: string): Promise<void> {
    try {
      await this.medicalInsurancesRepository.delete(id);
      logger.info(`MedicalInsurance eliminado: ${id}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar MedicalInsurance ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default MedicalInsurancesService;
