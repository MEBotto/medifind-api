import { Repository, DeepPartial } from 'typeorm';
import { Shift } from '@/shifts/models/Shift';
import { Pharmacy } from '../models/Pharmacy';
import AppDataSource from '@/data-source';
import { CreatePharmacyDTO, UpdatePharmacyDTO } from '../dtos/pharmacy.dto';
import { PharmacySearchDTO } from '../dtos/pharmacy-search.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class PharmacysRepository {
  private ormRepository: Repository<Pharmacy>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Pharmacy);
  }

  private async resolveShift(idShift: string | null | undefined): Promise<Shift | null> {
    if (!idShift) return null;
    const shift = await AppDataSource.getRepository(Shift).findOneBy({ id: idShift });
    if (!shift) throw new AppError(400, 'El turno indicado no existe');
    return shift;
  }

  async create(data: CreatePharmacyDTO): Promise<Pharmacy> {
    try {
      const { idShift, ...fields } = data;
      const entity = this.ormRepository.create(fields as DeepPartial<Pharmacy>);
      if (idShift !== undefined) entity.shift = await this.resolveShift(idShift);
      return await this.ormRepository.save(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error al crear Pharmacy:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async findById(id: string): Promise<Pharmacy | null> {
    try {
      return await this.ormRepository.findOne({ where: { id }, relations: { shift: true } });
    } catch (error) {
      logger.error(`Error al buscar Pharmacy ${id}:`, error);
      throw new AppError(500, 'Error al buscar la entidad');
    }
  }

  async findAll(filters: PharmacySearchDTO): Promise<{ data: Pharmacy[]; total: number; page: number; limit: number; totalPages: number }> {
    try {
      const qb = this.ormRepository.createQueryBuilder('pharmacy')
        .leftJoinAndSelect('pharmacy.shift', 'shift');
      if (filters.search) {
        qb.andWhere('pharmacy.name ILIKE :search', { search: `%${filters.search}%` });
      }
      if (filters.lat !== undefined && filters.lng !== undefined) {
        // Great-circle distance in km; clamp acos input for floating-point safety.
        const distance = `(6371 * acos(LEAST(1, GREATEST(-1,
          cos(radians(:lat)) * cos(radians(pharmacy.lat)) *
          cos(radians(pharmacy.lng) - radians(:lng)) +
          sin(radians(:lat)) * sin(radians(pharmacy.lat))
        ))))`;
        qb.andWhere('pharmacy.lat IS NOT NULL AND pharmacy.lng IS NOT NULL')
          .setParameters({ lat: filters.lat, lng: filters.lng });
        if (filters.radiusKm !== undefined) {
          qb.andWhere(`${distance} <= :radiusKm`, { radiusKm: filters.radiusKm });
        }
        if (filters.orderBy === 'distance') {
          qb.addSelect(distance, 'distance_km').orderBy('distance_km', filters.order);
        }
      }
      if (filters.orderBy === 'name') {
        qb.orderBy('pharmacy.name', filters.order, 'NULLS LAST');
      }
      qb.addOrderBy('pharmacy.id', 'ASC');
      const total = await qb.getCount();
      const data = await qb.skip((filters.page - 1) * filters.limit)
        .take(filters.limit).getMany();
      return { data, total, page: filters.page, limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit) };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error al buscar farmacias:', error);
      throw new AppError(500, 'Error al listar las farmacias');
    }
  }

  async update(id: string, data: UpdatePharmacyDTO): Promise<Pharmacy> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'Pharmacy no encontrado');
      }

      const { idShift, ...fields } = data;
      Object.assign(entity, fields);
      if (idShift !== undefined) entity.shift = await this.resolveShift(idShift);
      return await this.ormRepository.save(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al actualizar Pharmacy ${id}:`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, 'Pharmacy no encontrado');
      }

      await this.ormRepository.remove(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(`Error al eliminar Pharmacy ${id}:`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default PharmacysRepository;
