import AppDataSource from '@/data-source';
import { AppError } from '@/middleware/error.middleware';
import { AuditLog } from '@/audit/models/AuditLog';
import { Pharmacy } from '@/pharmacies/models/Pharmacy';
import { User } from '@/users/models/User';
import { Category } from '../models/Category';
import { Laboratory } from '../models/Laboratory';
import { CatalogProduct } from '../models/CatalogProduct';
import { CatalogRequest, CatalogRequestStatus, CatalogRequestType } from '../models/CatalogRequest';
import { CreateCatalogRequestDTO, ReviewCatalogRequestDTO } from '../dtos/catalog-request.dto';
import { ProductActor } from './ProductsService';

type ProductPayload = {
  name: string; description?: string; barcode?: string; presentation?: string;
  dose?: number; unit?: string; laboratoryId?: string; categoryId?: string; parentRequestId?: string;
};

export class CatalogRequestsService {
  async create(data: CreateCatalogRequestDTO, actor: ProductActor): Promise<CatalogRequest> {
    if (actor.role !== 'PHARMACIST' || !actor.pharmacyId) throw new AppError(403, 'Pharmacy access required');
    return AppDataSource.transaction(async manager => {
      const pharmacy = await manager.findOneBy(Pharmacy, { id: actor.pharmacyId! });
      if (!pharmacy) throw new AppError(404, 'Pharmacy not found');
      const user = await manager.findOneBy(User, { id: actor.id });
      if (!user) throw new AppError(401, 'User not found');
      let parentRequest: CatalogRequest | null = null;
      if (data.type === CatalogRequestType.PRODUCT && data.payload.parentRequestId) {
        parentRequest = await manager.findOne(CatalogRequest, {
          where: { id: data.payload.parentRequestId },
          relations: { pharmacy: true },
        });
        if (!parentRequest || parentRequest.type !== CatalogRequestType.LABORATORY ||
            parentRequest.pharmacy.id !== pharmacy.id || parentRequest.status === CatalogRequestStatus.REJECTED) {
          throw new AppError(400, 'Invalid related laboratory request');
        }
      }
      const repo = manager.getRepository(CatalogRequest);
      const request = await repo.save(repo.create({
        type: data.type, status: CatalogRequestStatus.PENDING,
        payload: data.payload, pharmacy, requestedBy: user, parentRequest,
      }));
      await manager.getRepository(AuditLog).save({
        action: 'CATALOG_REQUEST_CREATED', entityType: 'CatalogRequest', entityId: request.id,
        userId: actor.id, pharmacyId: pharmacy.id, newValues: { type: request.type, status: request.status },
      });
      return request;
    });
  }

  async list(actor: ProductActor, status?: CatalogRequestStatus): Promise<CatalogRequest[]> {
    if (actor.role !== 'ADMIN' && (actor.role !== 'PHARMACIST' || !actor.pharmacyId)) {
      throw new AppError(403, 'Catalog access denied');
    }
    return AppDataSource.getRepository(CatalogRequest).find({
      where: {
        ...(status ? { status } : {}),
        ...(actor.role !== 'ADMIN' ? { pharmacy: { id: actor.pharmacyId! } } : {}),
      },
      relations: { pharmacy: true, parentRequest: true },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async review(id: string, data: ReviewCatalogRequestDTO, actor: ProductActor): Promise<CatalogRequest> {
    if (actor.role !== 'ADMIN') throw new AppError(403, 'Admin access required');
    return AppDataSource.transaction(async manager => {
      const repo = manager.getRepository(CatalogRequest);
      const request = await repo.createQueryBuilder('request')
        .setLock('pessimistic_write')
        .where('request.id = :id', { id })
        .getOne();
      if (!request) throw new AppError(404, 'Request not found');
      if (request.status !== CatalogRequestStatus.PENDING) throw new AppError(409, 'Request already reviewed');
      const payload = request.payload as Record<string, unknown>;
      const name = String(payload.name ?? '').trim();
      if (!name) throw new AppError(400, 'Request has no name');

      if (data.decision === 'APPROVE') {
        if (request.type === CatalogRequestType.LABORATORY) {
          const exists = await manager.getRepository(Laboratory)
            .createQueryBuilder('laboratory').where('LOWER(TRIM(laboratory.name)) = LOWER(:name)', { name }).getOne();
          if (exists) throw new AppError(409, 'Laboratory already exists');
          await manager.save(Laboratory, manager.create(Laboratory, { name }));
        } else if (request.type === CatalogRequestType.CATEGORY) {
          const exists = await manager.getRepository(Category)
            .createQueryBuilder('category').where('LOWER(TRIM(category.name)) = LOWER(:name)', { name }).getOne();
          if (exists) throw new AppError(409, 'Category already exists');
          await manager.save(Category, manager.create(Category, { name }));
        } else {
          const productData = payload as ProductPayload;
          if (productData.barcode) {
            const exists = await manager.findOneBy(CatalogProduct, { barcode: productData.barcode });
            if (exists) throw new AppError(409, 'Barcode already exists');
          }
          let laboratoryId = productData.laboratoryId;
          if (productData.parentRequestId) {
            const parent = await repo.findOne({ where: { id: productData.parentRequestId } });
            if (!parent || parent.type !== CatalogRequestType.LABORATORY ||
                parent.status !== CatalogRequestStatus.APPROVED) {
              throw new AppError(409, 'Related laboratory request must be approved first');
            }
            const labName = String(parent.payload.name ?? '').trim();
            const lab = await manager.getRepository(Laboratory)
              .createQueryBuilder('laboratory').where('LOWER(TRIM(laboratory.name)) = LOWER(:name)', { name: labName }).getOne();
            if (!lab) throw new AppError(409, 'Approved laboratory not found');
            laboratoryId = lab.id;
          }
          if (laboratoryId && !await manager.findOneBy(Laboratory, { id: laboratoryId })) {
            throw new AppError(400, 'Laboratory not found');
          }
          if (productData.categoryId && !await manager.findOneBy(Category, { id: productData.categoryId })) {
            throw new AppError(400, 'Category not found');
          }
          await manager.save(CatalogProduct, manager.create(CatalogProduct, {
            name: productData.name, description: productData.description ?? null,
            barcode: productData.barcode ?? null, presentation: productData.presentation ?? null,
            dose: productData.dose ?? null, unit: productData.unit ?? null,
            laboratory: laboratoryId ? { id: laboratoryId } as Laboratory : null,
            category: productData.categoryId ? { id: productData.categoryId } as Category : null,
          }));
        }
        request.status = CatalogRequestStatus.APPROVED;
      } else {
        request.status = CatalogRequestStatus.REJECTED;
        request.rejectionReason = data.reason;
      }
      request.reviewedBy = { id: actor.id } as User;
      request.reviewedAt = new Date();
      await repo.save(request);
      await manager.getRepository(AuditLog).save({
        action: request.status === CatalogRequestStatus.APPROVED ? 'CATALOG_REQUEST_APPROVED' : 'CATALOG_REQUEST_REJECTED',
        entityType: 'CatalogRequest', entityId: request.id, userId: actor.id,
        newValues: { type: request.type, status: request.status, reason: request.rejectionReason },
      });
      return request;
    });
  }
}
