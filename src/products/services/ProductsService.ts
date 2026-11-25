import AppDataSource from '@/data-source';
import { AppError } from '@/middleware/error.middleware';
import { AuditLog } from '@/audit/models/AuditLog';
import { Pharmacy } from '@/pharmacies/models/Pharmacy';
import { Product } from '../models/Product';
import { CreateProductDTO, UpdateProductDTO } from '../dtos/product.dto';
import ProductsRepository from '../repositories/ProductsRepository';

export type ProductActor = { id: string; role: string | null; pharmacyId: string | null };

export const resolveProductPharmacy = (actor: ProductActor, requested?: string | null): string => {
  if (actor.role === 'ADMIN') {
    if (!requested) throw new AppError(400, 'A pharmacy is required');
    return requested;
  }
  if (actor.role !== 'PHARMACIST' || !actor.pharmacyId) {
    throw new AppError(403, 'Pharmacy access denied');
  }
  if (requested && requested !== actor.pharmacyId) {
    throw new AppError(403, 'Cannot manage another pharmacy');
  }
  return actor.pharmacyId;
};

class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async createProduct(data: CreateProductDTO, actor: ProductActor): Promise<Product> {
    const pharmacyId = resolveProductPharmacy(actor, data.idPharmacy);
    return AppDataSource.transaction(async manager => {
      const pharmacy = await manager.getRepository(Pharmacy).findOneBy({ id: pharmacyId });
      if (!pharmacy) throw new AppError(404, 'Pharmacy not found');
      const repo = manager.getRepository(Product);
      const product = await repo.save(repo.create({
        ...data, pharmacy,
        ...(data.idLabo ? { laboratory: { id: data.idLabo } } : {}),
        ...(data.idCategory ? { category: { id: data.idCategory } } : {}),
      }));
      const logs = manager.getRepository(AuditLog);
      await logs.save(logs.create({
        action: 'PRODUCT_CREATED', entityType: 'Product', entityId: product.id,
        userId: actor.id, pharmacyId, newValues: { name: product.name, quantity: product.quantity },
      }));
      return product;
    });
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productsRepository.findById(id);
    if (!product) throw new AppError(404, 'Product not found');
    return product;
  }

  async getAllProducts(): Promise<Product[]> {
    return this.productsRepository.findAll();
  }

  async updateProduct(id: string, data: UpdateProductDTO, actor: ProductActor): Promise<Product> {
    return AppDataSource.transaction(async manager => {
      const repo = manager.getRepository(Product);
      const product = await repo.findOne({ where: { id }, relations: { pharmacy: true } });
      if (!product) throw new AppError(404, 'Product not found');
      const currentPharmacyId = product.pharmacy?.id;
      if (!currentPharmacyId) throw new AppError(403, 'Product has no assigned pharmacy');
      if (actor.role !== 'ADMIN' && (actor.role !== 'PHARMACIST' || actor.pharmacyId !== currentPharmacyId)) {
        throw new AppError(403, 'Pharmacy access denied');
      }
      if (data.idPharmacy !== undefined && data.idPharmacy !== currentPharmacyId) {
        throw new AppError(403, 'Product pharmacy cannot be changed via this endpoint');
      }
      const before = { name: product.name, quantity: product.quantity, active: product.active };
      const { idPharmacy: _ignored, idLabo, idCategory, ...fields } = data;
      Object.assign(product, fields);
      if (idLabo !== undefined) product.laboratory = idLabo ? { id: idLabo } as Product['laboratory'] : null as unknown as Product['laboratory'];
      if (idCategory !== undefined) product.category = idCategory ? { id: idCategory } as Product['category'] : null as unknown as Product['category'];
      const saved = await repo.save(product);
      const logs = manager.getRepository(AuditLog);
      await logs.save(logs.create({
        action: 'PRODUCT_UPDATED', entityType: 'Product', entityId: id,
        userId: actor.id, pharmacyId: currentPharmacyId,
        oldValues: before, newValues: { name: saved.name, quantity: saved.quantity, active: saved.active },
      }));
      return saved;
    });
  }

  async deleteProduct(id: string, actor: ProductActor): Promise<void> {
    await AppDataSource.transaction(async manager => {
      const repo = manager.getRepository(Product);
      const product = await repo.findOne({ where: { id }, relations: { pharmacy: true } });
      if (!product) throw new AppError(404, 'Product not found');
      const pharmacyId = product.pharmacy?.id;
      if (!pharmacyId) throw new AppError(403, 'Product has no assigned pharmacy');
      if (actor.role !== 'ADMIN' && (actor.role !== 'PHARMACIST' || actor.pharmacyId !== pharmacyId)) {
        throw new AppError(403, 'Pharmacy access denied');
      }
      const logs = manager.getRepository(AuditLog);
      await logs.save(logs.create({
        action: 'PRODUCT_DELETED', entityType: 'Product', entityId: id,
        userId: actor.id, pharmacyId,
        oldValues: { name: product.name, quantity: product.quantity },
      }));
      await repo.remove(product);
    });
  }
}

export default ProductsService;
