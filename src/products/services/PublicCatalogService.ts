import AppDataSource from '@/data-source';
import { AppError } from '@/middleware/error.middleware';
import { CatalogProduct } from '../models/CatalogProduct';
import { PharmacyProduct } from '../models/PharmacyProduct';
import { PublicCatalogQuery, ProductPharmaciesQuery } from '../dtos/public-catalog.dto';

export class PublicCatalogService {
  async search({ q, page, limit }: PublicCatalogQuery) {
    const query = AppDataSource.getRepository(CatalogProduct)
      .createQueryBuilder('product')
      .innerJoin('product.listings', 'listing', 'listing.active = true AND listing.quantity > 0')
      .leftJoinAndSelect('product.laboratory', 'laboratory')
      .leftJoinAndSelect('product.category', 'category')
      .where('(product.name ILIKE :term OR product.barcode ILIKE :term OR laboratory.name ILIKE :term)', {
        term: `%${q.replace(/[\\%_]/g, '\\$&')}%`,
      })
      .distinct(true)
      .orderBy('product.name', 'ASC')
      .addOrderBy('product.id', 'ASC')
      .skip((page - 1) * limit).take(limit);
    const [products, total] = await query.getManyAndCount();
    return { data: products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async pharmacies(productId: string, filters: ProductPharmaciesQuery) {
    const product = await AppDataSource.getRepository(CatalogProduct).findOne({
      where: { id: productId }, relations: { laboratory: true, category: true },
    });
    if (!product) throw new AppError(404, 'Catalog product not found');

    const qb = AppDataSource.getRepository(PharmacyProduct)
      .createQueryBuilder('listing')
      .innerJoinAndSelect('listing.pharmacy', 'pharmacy')
      .where('listing.productId = :productId', { productId })
      .andWhere('listing.active = true')
      .andWhere('listing.quantity > 0');

    // Match the existing pharmacy search: spherical distance in km, clamped for numerical safety.
    if (filters.lat !== undefined && filters.lng !== undefined) {
      const distance = `(6371 * acos(LEAST(1, GREATEST(-1,
        cos(radians(:lat)) * cos(radians(pharmacy.lat)) *
        cos(radians(pharmacy.lng) - radians(:lng)) +
        sin(radians(:lat)) * sin(radians(pharmacy.lat))
      ))))`;
      qb.andWhere('pharmacy.lat IS NOT NULL AND pharmacy.lng IS NOT NULL')
        .setParameters({ lat: filters.lat, lng: filters.lng })
        .addSelect(distance, 'distance_km');
      if (filters.radiusKm !== undefined) {
        qb.andWhere(`${distance} <= :radiusKm`, { radiusKm: filters.radiusKm });
      }
      if (filters.orderBy === 'distance') qb.orderBy('distance_km', filters.order);
    }
    if (filters.orderBy === 'price') qb.orderBy('listing.price', filters.order, 'NULLS LAST');
    if (filters.orderBy === 'name') qb.orderBy('pharmacy.name', filters.order, 'NULLS LAST');
    qb.addOrderBy('listing.id', 'ASC');

    // getRawAndEntities preserves the calculated distance alongside hydrated entities.
    const total = await qb.getCount();
    const { entities, raw } = await qb.skip((filters.page - 1) * filters.limit)
      .take(filters.limit).getRawAndEntities();
    const pharmacies = entities.map((listing, index) => ({
      pharmacy: {
        id: listing.pharmacy.id,
        name: listing.pharmacy.name,
        address: listing.pharmacy.adress,
        lat: listing.pharmacy.lat,
        lng: listing.pharmacy.lng,
        phone: listing.pharmacy.phone,
      },
      price: listing.price,
      available: true,
      updatedAt: listing.updatedAt,
      distanceKm: filters.lat === undefined ? null :
        (raw[index]?.distance_km == null ? null : Number(Number(raw[index].distance_km).toFixed(2))),
    }));
    return {
      product, pharmacies,
      pagination: { page: filters.page, limit: filters.limit, total, pages: Math.ceil(total / filters.limit) },
    };
  }
}
