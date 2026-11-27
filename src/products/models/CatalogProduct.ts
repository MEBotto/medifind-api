import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { Laboratory } from './Laboratory';
import { Category } from './Category';
import { PharmacyProduct } from './PharmacyProduct';

@Entity('catalog_products')
@Unique('UQ_catalog_products_barcode', ['barcode'])
export class CatalogProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  barcode: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  presentation: string | null;

  @Column({ type: 'int', nullable: true })
  dose: number | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit: string | null;

  @ManyToOne(() => Laboratory, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'laboratoryId',
    foreignKeyConstraintName: 'FK_catalog_products_laboratory',
  })
  laboratory: Laboratory | null;

  @ManyToOne(() => Category, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'categoryId',
    foreignKeyConstraintName: 'FK_catalog_products_category',
  })
  category: Category | null;

  @OneToMany(() => PharmacyProduct, (listing) => listing.product)
  listings: PharmacyProduct[];
}
