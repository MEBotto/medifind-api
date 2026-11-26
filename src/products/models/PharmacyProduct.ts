import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, UpdateDateColumn } from 'typeorm';
import { CatalogProduct } from './CatalogProduct';
import { Pharmacy } from '../../pharmacies/models/Pharmacy';

@Entity('pharmacy_products')
@Unique('UQ_pharmacy_products_pharmacy_product', ['pharmacy', 'product'])
export class PharmacyProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CatalogProduct, product => product.listings, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'productId' })
  product: CatalogProduct;

  @ManyToOne(() => Pharmacy, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'pharmacyId' })
  pharmacy: Pharmacy;

  // Decimal is stored as a string to avoid floating-point errors.
  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  price: string | null;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'boolean', default: false })
  active: boolean;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
