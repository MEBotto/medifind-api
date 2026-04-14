import { Repository } from 'typeorm';
import { Permission } from '../models/Permission';
import AppDataSource from '@/data-source';
import { CreatePermissionDTO, UpdatePermissionDTO } from '../dtos/permission.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class PermissionsRepository {
  private ormRepository: Repository<Permission>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Permission);
  }

  async create(data: CreatePermissionDTO): Promise<Permission> {
    try {
      const entity = this.ormRepository.create(data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      logger.error('Error al crear Permission:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async findById(id: string): Promise<Permission | null> {
    try {
      return await this.ormRepository.findOne({ where: { id } as any });
    } catch (error) {
      logger.error(`Error al buscar Permission ${id}:`, error);
      throw new AppError(500, 'Error al buscar la entidad');
    }
  }

  async findAll(): Promise<Permission[]> {
    try {
      return await this.ormRepository.find();
    } catch (error) {
      logger.error('Error al buscar permissions:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async update(id: string, data: UpdatePermissionDTO): Promise<Permission> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'Permission no encontrado');
      }

      Object.assign(entity, data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar Permission ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'Permission no encontrado');
      }

      await this.ormRepository.remove(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar Permission ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default PermissionsRepository;
