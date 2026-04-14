import { Repository } from 'typeorm';
import { Shift } from '../models/Shift';
import AppDataSource from '@/data-source';
import { CreateShiftDTO, UpdateShiftDTO } from '../dtos/shift.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class ShiftsRepository {
  private ormRepository: Repository<Shift>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Shift);
  }

  async create(data: CreateShiftDTO): Promise<Shift> {
    try {
      const entity = this.ormRepository.create(data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      logger.error('Error al crear Shift:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async findById(id: string): Promise<Shift | null> {
    try {
      return await this.ormRepository.findOne({ where: { id } as any });
    } catch (error) {
      logger.error(`Error al buscar Shift ${id}:`, error);
      throw new AppError(500, 'Error al buscar la entidad');
    }
  }

  async findAll(): Promise<Shift[]> {
    try {
      return await this.ormRepository.find();
    } catch (error) {
      logger.error('Error al buscar shifts:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async update(id: string, data: UpdateShiftDTO): Promise<Shift> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'Shift no encontrado');
      }

      Object.assign(entity, data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar Shift ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'Shift no encontrado');
      }

      await this.ormRepository.remove(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar Shift ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default ShiftsRepository;
