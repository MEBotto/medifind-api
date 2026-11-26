import FavouritePharmacysRepository from '../repositories/FavouritePharmacysRepository';
import { CreateFavouritePharmacyDTO, UpdateFavouritePharmacyDTO } from '../dtos/favourite-pharmacy.dto';
import { FavouritePharmacy } from '../models/FavouritePharmacy';

class FavouritePharmacysService {
  constructor(private readonly repository: FavouritePharmacysRepository) {}

  createFavouritePharmacy(userId: string, data: CreateFavouritePharmacyDTO): Promise<FavouritePharmacy> {
    return this.repository.create(userId, data.idPharmacy);
  }
  getFavouritePharmacyById(userId: string, id: string): Promise<FavouritePharmacy | null> {
    return this.repository.findById(id, userId);
  }
  getAllFavouritePharmacys(userId: string): Promise<FavouritePharmacy[]> {
    return this.repository.findAll(userId);
  }
  updateFavouritePharmacy(userId: string, id: string, data: UpdateFavouritePharmacyDTO): Promise<FavouritePharmacy> {
    return this.repository.update(id, userId, data.active);
  }
  deleteFavouritePharmacy(userId: string, id: string): Promise<void> {
    return this.repository.delete(id, userId);
  }
}
export default FavouritePharmacysService;
