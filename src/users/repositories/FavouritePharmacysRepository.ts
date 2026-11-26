import { Repository } from 'typeorm';
import { FavouritePharmacy } from '../models/FavouritePharmacy';
import { Pharmacy } from '@/pharmacies/models/Pharmacy';
import AppDataSource from '@/data-source';
import { AppError } from '@/middleware/error.middleware';

class FavouritePharmacysRepository {
  private readonly ormRepository: Repository<FavouritePharmacy>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(FavouritePharmacy);
  }

  async create(userId: string, pharmacyId: string): Promise<FavouritePharmacy> {
    const pharmacy = await AppDataSource.getRepository(Pharmacy).findOneBy({ id: pharmacyId });
    if (!pharmacy) throw new AppError(404, 'Farmacia no encontrada');

    const existing = await this.ormRepository.findOne({
      where: { user: { id: userId }, pharmacy: { id: pharmacyId } },
      relations: { pharmacy: true },
    });
    if (existing) {
      if (existing.active) return existing;
      existing.active = true;
      return this.ormRepository.save(existing);
    }
    try {
      return await this.ormRepository.save(this.ormRepository.create({
        user: { id: userId }, pharmacy, active: true,
      }));
    } catch (error) {
      // Concurrent inserts cannot create duplicates because of the database UNIQUE constraint.
      if ((error as { code?: string }).code === '23505') {
        const duplicate = await this.ormRepository.findOne({
          where: { user: { id: userId }, pharmacy: { id: pharmacyId } },
          relations: { pharmacy: true },
        });
        if (duplicate) return duplicate;
      }
      throw error;
    }
  }

  findById(id: string, userId: string): Promise<FavouritePharmacy | null> {
    return this.ormRepository.findOne({
      where: { id, user: { id: userId } },
      relations: { pharmacy: true },
    });
  }

  findAll(userId: string): Promise<FavouritePharmacy[]> {
    return this.ormRepository.find({
      where: { user: { id: userId }, active: true },
      relations: { pharmacy: true },
      order: { id: 'ASC' },
    });
  }

  async update(id: string, userId: string, active: boolean): Promise<FavouritePharmacy> {
    const entity = await this.findById(id, userId);
    if (!entity) throw new AppError(404, 'Favorito no encontrado');
    entity.active = active;
    return this.ormRepository.save(entity);
  }

  async delete(id: string, userId: string): Promise<void> {
    const entity = await this.findById(id, userId);
    if (!entity) throw new AppError(404, 'Favorito no encontrado');
    entity.active = false;
    await this.ormRepository.save(entity);
  }
}
export default FavouritePharmacysRepository;
