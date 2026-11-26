import AppDataSource from '@/data-source';
import { AppError } from '@/middleware/error.middleware';
import { AuditLog } from '@/audit/models/AuditLog';
import { Pharmacy } from '@/pharmacies/models/Pharmacy';
import { CatalogProduct } from '../models/CatalogProduct';
import { PharmacyProduct } from '../models/PharmacyProduct';
import { AddInventoryDTO, UpdateInventoryDTO } from '../dtos/pharmacy-inventory.dto';
import { ProductActor, resolveProductPharmacy } from './ProductsService';

export class PharmacyInventoryService {
  async list(actor: ProductActor, requestedPharmacyId?: string): Promise<PharmacyProduct[]> {
    const pharmacyId = resolveProductPharmacy(actor, requestedPharmacyId);
    return AppDataSource.getRepository(PharmacyProduct).find({
      where: { pharmacy: { id: pharmacyId } },
      relations: { product: { laboratory: true, category: true } },
      order: { updatedAt: 'DESC' },
      take: 500,
    });
  }

  async catalog(search?: string): Promise<CatalogProduct[]> {
    const repo = AppDataSource.getRepository(CatalogProduct);
    const query = repo.createQueryBuilder('product')
      .leftJoinAndSelect('product.laboratory', 'laboratory')
      .leftJoinAndSelect('product.category', 'category')
      .orderBy('product.name', 'ASC').take(100);
    if (search?.trim()) query.where('product.name ILIKE :search', { search: `%${search.trim().replace(/[\\%_]/g, '\\$&')}%` });
    return query.getMany();
  }

  async add(data: AddInventoryDTO, actor: ProductActor): Promise<PharmacyProduct> {
    const pharmacyId = resolveProductPharmacy(actor, data.pharmacyId);
    return AppDataSource.transaction(async manager => {
      const pharmacy = await manager.findOneBy(Pharmacy, { id: pharmacyId });
      if (!pharmacy) throw new AppError(404, 'Pharmacy not found');
      const product = await manager.findOneBy(CatalogProduct, { id: data.productId });
      if (!product) throw new AppError(404, 'Catalog product not found');
      const repo = manager.getRepository(PharmacyProduct);
      const exists = await repo.findOne({ where: { pharmacy: { id: pharmacyId }, product: { id: product.id } } });
      if (exists) throw new AppError(409, 'Product already listed in pharmacy');
      const listing = await repo.save(repo.create({
        pharmacy, product, price: data.price ?? null, quantity: data.quantity ?? 0, active: data.active ?? false,
      }));
      await manager.getRepository(AuditLog).save({
        action: 'PHARMACY_INVENTORY_ADDED', entityType: 'PharmacyProduct', entityId: listing.id,
        userId: actor.id, pharmacyId, newValues: { productId: product.id, price: listing.price, quantity: listing.quantity, active: listing.active },
      });
      return listing;
    });
  }

  async update(id: string, data: UpdateInventoryDTO, actor: ProductActor): Promise<PharmacyProduct> {
    return AppDataSource.transaction(async manager => {
      const repo = manager.getRepository(PharmacyProduct);
      const listing = await repo.findOne({ where: { id }, relations: { pharmacy: true, product: true } });
      if (!listing) throw new AppError(404, 'Inventory listing not found');
      resolveProductPharmacy(actor, listing.pharmacy.id);
      const before = { price: listing.price, quantity: listing.quantity, active: listing.active };
      if (data.price !== undefined) listing.price = data.price;
      if (data.quantity !== undefined) listing.quantity = data.quantity;
      if (data.active !== undefined) listing.active = data.active;
      const saved = await repo.save(listing);
      await manager.getRepository(AuditLog).save({
        action: 'PHARMACY_INVENTORY_UPDATED', entityType: 'PharmacyProduct', entityId: id,
        userId: actor.id, pharmacyId: listing.pharmacy.id,
        oldValues: before, newValues: { price: saved.price, quantity: saved.quantity, active: saved.active },
      });
      return saved;
    });
  }

  async deactivate(id: string, actor: ProductActor): Promise<PharmacyProduct> {
    return this.update(id, { active: false }, actor);
  }
}
