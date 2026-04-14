import RolePermissionsRepository from '../repositories/RolePermissionsRepository';
import { RolePermission } from '../models/RolePermission';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class RolePermissionsService {
  constructor(
    private readonly repository: RolePermissionsRepository
  ) {}

  async getById(id: string): Promise<RolePermission> {
    try {
      const entity = await this.repository.findById(id);
      if (!entity) throw new AppError(404, 'RolePermission no encontrado');
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al obtener RolePermission ${id}:`, error);
      throw new AppError(500, 'Error al obtener la entidad');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
      logger.info(`RolePermission eliminado: ${id}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar RolePermission ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default RolePermissionsService;
