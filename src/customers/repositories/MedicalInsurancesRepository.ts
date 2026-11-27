import { Repository } from 'typeorm';
import { MedicalInsurance } from '../models/MedicalInsurance';
import AppDataSource from '@/data-source';
import { CreateMedicalInsuranceDTO, UpdateMedicalInsuranceDTO } from '../dtos/medical-insurance.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class MedicalInsurancesRepository {
  private ormRepository: Repository<MedicalInsurance>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(MedicalInsurance);
  }

  async create(data: CreateMedicalInsuranceDTO): Promise<MedicalInsurance> {
    try {
      const entity = this.ormRepository.create(data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      logger.error('Error al crear MedicalInsurance:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async findById(id: string): Promise<MedicalInsurance | null> {
    try {
      return await this.ormRepository.findOneBy({ id });
    } catch (error) {
      logger.error(`Error al buscar MedicalInsurance ${id}:`, error);
      throw new AppError(500, 'Error al buscar la entidad');
    }
  }

  async findAll(): Promise<MedicalInsurance[]> {
    try {
      return await this.ormRepository.find();
    } catch (error) {
      logger.error('Error al buscar medicalinsurances:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async update(id: string, data: UpdateMedicalInsuranceDTO): Promise<MedicalInsurance> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'MedicalInsurance no encontrado');
      }

      Object.assign(entity, data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar MedicalInsurance ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'MedicalInsurance no encontrado');
      }

      await this.ormRepository.remove(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar MedicalInsurance ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default MedicalInsurancesRepository;
