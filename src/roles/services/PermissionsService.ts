import PermissionsRepository from '../repositories/PermissionsRepository';
import { CreatePermissionDTO, UpdatePermissionDTO } from '../dtos/permission.dto';
import { Permission } from '../models/Permission';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class PermissionsService {
  constructor(
    private readonly permissionsRepository: PermissionsRepository
  ) {}

  async createPermission(data: CreatePermissionDTO): Promise<Permission> {
    try {
      const entity = await this.permissionsRepository.create(data);
      logger.info('Permission creado exitosamente');
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error al crear Permission:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async getPermissionById(id: string): Promise<Permission> {
    try {
      const entity = await this.permissionsRepository.findById(id);
      if (!entity) {
        throw new AppError(404, 'Permission no encontrado');
      }
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al obtener Permission ${id}:`, error);
      throw new AppError(500, 'Error al obtener la entidad');
    }
  }

  async getAllPermissions(): Promise<Permission[]> {
    try {
      return await this.permissionsRepository.findAll();
    } catch (error) {
      logger.error('Error al listar Permissions:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async updatePermission(id: string, data: UpdatePermissionDTO): Promise<Permission> {
    try {
      const updatedEntity = await this.permissionsRepository.update(id, data);
      logger.info(`Permission actualizado: ${id}`);
      return updatedEntity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar Permission ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async deletePermission(id: string): Promise<void> {
    try {
      await this.permissionsRepository.delete(id);
      logger.info(`Permission eliminado: ${id}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar Permission ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default PermissionsService;
