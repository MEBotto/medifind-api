import { Repository, DeepPartial } from 'typeorm';
import { Shift } from '@/shifts/models/Shift';
import { ShiftCalendarService } from '@/shifts/services/ShiftCalendarService';
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

  async findAll(filters: PharmacySearchDTO, userId: string): Promise<{ data: Pharmacy[]; total: number; page: number; limit: number; totalPages: number }> {
    try {
      const qb = this.ormRepository.createQueryBuilder('pharmacy')
        .leftJoinAndSelect('pharmacy.shift', 'shift');
      if (filters.onDuty !== undefined || filters.openNow !== undefined) {
        // Use the pharmacy service timezone, not the server timezone.
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit',
        }).formatToParts(new Date());
        const today = Object.fromEntries(parts.map(part => [part.type, part.value]));
        const date = filters.dutyDate ?? `${today.year}-${today.month}-${today.day}`;
        const [year, month, day] = date.split('-').map(Number);
        let dutyShiftId: string | undefined;
        try {
          const calendar = await new ShiftCalendarService().getCalendar(year, month);
          dutyShiftId = calendar.days[day - 1]?.shiftId;
        } catch (error) {
          if (!(error instanceof AppError && error.statusCode === 404 && filters.onDuty === undefined)) throw error;
        }
        if (filters.onDuty !== undefined) {
          if (!dutyShiftId) throw new AppError(422, 'Fecha fuera del calendario');
          qb.andWhere(filters.onDuty ? 'shift.id = :dutyShiftId' : '(shift.id IS NULL OR shift.id <> :dutyShiftId)', { dutyShiftId });
        }
        if (filters.openNow !== undefined) {
          const localNow = "timezone('America/Argentina/Buenos_Aires', CURRENT_TIMESTAMP)";
          const weekday = `EXTRACT(ISODOW FROM ${localNow})`;
          const clock = `to_char(${localNow}, 'HH24:MI')`;
          const hoursOpen = `(pharmacy."open24Hours" = true OR EXISTS (
            SELECT 1 FROM jsonb_array_elements(pharmacy."weeklyHours") AS schedule(interval)
            WHERE (
              ((schedule.interval->>'dayOfWeek')::int = ${weekday}
                AND schedule.interval->>'opensAt' <= ${clock}
                AND (schedule.interval->>'closesAt' > ${clock} OR schedule.interval->>'closesAt' < schedule.interval->>'opensAt'))
              OR ((schedule.interval->>'dayOfWeek')::int = CASE WHEN ${weekday} = 1 THEN 7 ELSE ${weekday} - 1 END
                AND schedule.interval->>'closesAt' < schedule.interval->>'opensAt'
                AND schedule.interval->>'closesAt' > ${clock})
            )
          ))`;
          const dutyOpen = dutyShiftId ? 'shift.id = :openDutyShiftId' : 'FALSE';
          qb.andWhere(filters.openNow ? `(${hoursOpen} OR ${dutyOpen})` : `(NOT ${hoursOpen} AND NOT (${dutyOpen}))`,
            dutyShiftId ? { openDutyShiftId: dutyShiftId } : {});
        }
      }
      if (filters.favoritesOnly === true) {
        qb.andWhere(`EXISTS (
          SELECT 1 FROM favourite_pharmacies favorite
          WHERE favorite."idPharmacy" = pharmacy.id
            AND favorite."idUser" = :favoriteUserId
            AND favorite.active = true
        )`, { favoriteUserId: userId });
      }
      // Escape LIKE wildcards so user input is treated as literal text.
      const escapeLike = (value: string) => value.replace(/[\\%_]/g, '\\$&');
      if (filters.search) {
        qb.andWhere('(pharmacy.name ILIKE :search OR pharmacy.adress ILIKE :search)', {
          search: `%${escapeLike(filters.search)}%`,
        });
      }
      if (filters.name) {
        qb.andWhere('pharmacy.name ILIKE :name', { name: `%${escapeLike(filters.name)}%` });
      }
      if (filters.address) {
        qb.andWhere('pharmacy.adress ILIKE :address', { address: `%${escapeLike(filters.address)}%` });
      }
      if (filters.idShift) qb.andWhere('shift.id = :idShift', { idShift: filters.idShift });
      if (filters.shiftCode) qb.andWhere('shift.code = :shiftCode', { shiftCode: filters.shiftCode });
      if (filters.hasShift !== undefined) {
        qb.andWhere(filters.hasShift ? 'shift.id IS NOT NULL' : 'shift.id IS NULL');
      }
      if (filters.hasCoordinates !== undefined) {
        qb.andWhere(filters.hasCoordinates
          ? 'pharmacy.lat IS NOT NULL AND pharmacy.lng IS NOT NULL'
          : '(pharmacy.lat IS NULL OR pharmacy.lng IS NULL)');
      }
      const hasProductFilter = filters.productName !== undefined ||
        filters.idCategory !== undefined || filters.idLaboratory !== undefined;
      if (hasProductFilter || filters.hasProducts !== undefined) {
        // EXISTS avoids duplicate pharmacy rows and keeps pagination/count correct.
        const subquery = qb.subQuery()
          .select('1')
          .from('products', 'product')
          .where('product."idPharmacy" = pharmacy.id')
          .andWhere('product.active = true');
        if (filters.productName) {
          subquery.andWhere('product.name ILIKE :productName');
          qb.setParameter('productName', `%${escapeLike(filters.productName)}%`);
        }
        if (filters.idCategory) {
          subquery.andWhere('product."idCategory" = :idCategory');
          qb.setParameter('idCategory', filters.idCategory);
        }
        if (filters.idLaboratory) {
          subquery.andWhere('product."idLabo" = :idLaboratory');
          qb.setParameter('idLaboratory', filters.idLaboratory);
        }
        const expression = `EXISTS ${subquery.getQuery()}`;
        qb.andWhere(filters.hasProducts === false ? `NOT ${expression}` : expression);
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
      if (filters.orderBy === 'name') qb.orderBy('pharmacy.name', filters.order, 'NULLS LAST');
      if (filters.orderBy === 'address') qb.orderBy('pharmacy.adress', filters.order, 'NULLS LAST');
      if (filters.orderBy === 'id') qb.orderBy('pharmacy.id', filters.order);
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
