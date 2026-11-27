import { Repository } from 'typeorm';
import { RolePermission } from '../models/RolePermission';
import AppDataSource from '@/data-source';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class RolePermissionsRepository {
  private ormRepository: Repository<RolePermission>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(RolePermission);
  }

  async findById(id: string): Promise<RolePermission | null> {
    try {
      return await this.ormRepository.findOneBy({ id });
    } catch (error) {
      logger.error(`Error al buscar RolePermission ${id}:`, error);
      throw new AppError(500, 'Error al buscar la entidad');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const entity = await this.findById(id);
      if (!entity) throw new AppError(404, 'RolePermission no encontrado');
      await this.ormRepository.remove(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar RolePermission ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default RolePermissionsRepository;
