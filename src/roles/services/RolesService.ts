import RolesRepository from '../repositories/RolesRepository';
import { CreateRoleDTO, UpdateRoleDTO } from '../dtos/role.dto';
import { Role } from '../models/Role';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class RolesService {
  constructor(
    private readonly rolesRepository: RolesRepository
  ) {}

  async createRole(data: CreateRoleDTO): Promise<Role> {
    try {
      const entity = await this.rolesRepository.create(data);
      logger.info('Role creado exitosamente');
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error al crear Role:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async getRoleById(id: string): Promise<Role> {
    try {
      const entity = await this.rolesRepository.findById(id);
      if (!entity) {
        throw new AppError(404, 'Role no encontrado');
      }
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al obtener Role ${id}:`, error);
      throw new AppError(500, 'Error al obtener la entidad');
    }
  }

  async getAllRoles(): Promise<Role[]> {
    try {
      return await this.rolesRepository.findAll();
    } catch (error) {
      logger.error('Error al listar Roles:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async updateRole(id: string, data: UpdateRoleDTO): Promise<Role> {
    try {
      const updatedEntity = await this.rolesRepository.update(id, data);
      logger.info(`Role actualizado: ${id}`);
      return updatedEntity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar Role ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async deleteRole(id: string): Promise<void> {
    try {
      await this.rolesRepository.delete(id);
      logger.info(`Role eliminado: ${id}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar Role ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default RolesService;
