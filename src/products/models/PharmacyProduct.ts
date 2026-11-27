import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  UpdateDateColumn,
  Check,
} from 'typeorm';
import { CatalogProduct } from './CatalogProduct';
import { Pharmacy } from '../../pharmacies/models/Pharmacy';

@Entity('pharmacy_products')
@Unique('UQ_pharmacy_products_pharmacy_product', ['pharmacy', 'product'])
@Check('CHK_pharmacy_products_quantity', '"quantity" >= 0')
@Check('CHK_pharmacy_products_price', '"price" IS NULL OR "price" >= 0')
export class PharmacyProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CatalogProduct, (product) => product.listings, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'productId',
    foreignKeyConstraintName: 'FK_pharmacy_products_product',
  })
  product: CatalogProduct;

  @ManyToOne(() => Pharmacy, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'pharmacyId',
    foreignKeyConstraintName: 'FK_pharmacy_products_pharmacy',
  })
  pharmacy: Pharmacy;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  price: string | null;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'boolean', default: false })
  active: boolean;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
