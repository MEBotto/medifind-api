import PharmacysRepository from '../repositories/PharmacysRepository';
import { CreatePharmacyDTO, UpdatePharmacyDTO } from '../dtos/pharmacy.dto';
import { PharmacySearchDTO } from '../dtos/pharmacy-search.dto';
import { Pharmacy } from '../models/Pharmacy';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class PharmacysService {
  constructor(
    private readonly pharmacysRepository: PharmacysRepository
  ) {}

  async createPharmacy(data: CreatePharmacyDTO): Promise<Pharmacy> {
    try {
      const entity = await this.pharmacysRepository.create(data);
      logger.info('Pharmacy creado exitosamente');
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error al crear Pharmacy:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async getPharmacyById(id: string): Promise<Pharmacy> {
    try {
      const entity = await this.pharmacysRepository.findById(id);
      if (!entity) {
        throw new AppError(404, 'Pharmacy no encontrado');
      }
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al obtener Pharmacy ${id}:`, error);
      throw new AppError(500, 'Error al obtener la entidad');
    }
  }

  async getAllPharmacys(filters: PharmacySearchDTO): Promise<{ data: Pharmacy[]; total: number; page: number; limit: number; totalPages: number }> {
    try {
      return await this.pharmacysRepository.findAll(filters);
    } catch (error) {
      logger.error('Error al listar Pharmacys:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async updatePharmacy(id: string, data: UpdatePharmacyDTO): Promise<Pharmacy> {
    try {
      const updatedEntity = await this.pharmacysRepository.update(id, data);
      logger.info(`Pharmacy actualizado: ${id}`);
      return updatedEntity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar Pharmacy ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async deletePharmacy(id: string): Promise<void> {
    try {
      await this.pharmacysRepository.delete(id);
      logger.info(`Pharmacy eliminado: ${id}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar Pharmacy ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default PharmacysService;
