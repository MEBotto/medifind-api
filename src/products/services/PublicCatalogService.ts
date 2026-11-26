import AppDataSource from '@/data-source';
import { AppError } from '@/middleware/error.middleware';
import { CatalogProduct } from '../models/CatalogProduct';
import { PharmacyProduct } from '../models/PharmacyProduct';
import { PublicCatalogQuery } from '../dtos/public-catalog.dto';

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

  async pharmacies(productId: string) {
    const product = await AppDataSource.getRepository(CatalogProduct).findOne({
      where: { id: productId }, relations: { laboratory: true, category: true },
    });
    if (!product) throw new AppError(404, 'Catalog product not found');
    const listings = await AppDataSource.getRepository(PharmacyProduct)
      .createQueryBuilder('listing')
      .innerJoinAndSelect('listing.pharmacy', 'pharmacy')
      .where('listing.productId = :productId', { productId })
      .andWhere('listing.active = true')
      .andWhere('listing.quantity > 0')
      .orderBy('listing.price', 'ASC', 'NULLS LAST')
      .addOrderBy('pharmacy.name', 'ASC')
      .take(100)
      .getMany();
    return {
      product,
      pharmacies: listings.map(listing => ({
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
      })),
    };
  }
}
