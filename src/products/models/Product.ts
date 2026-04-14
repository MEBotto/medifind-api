import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Laboratory } from './Laboratory';
import { Pharmacy } from '../../pharmacies/models/Pharmacy';
import { Category } from './Category';
import { OrderItem } from '../../orders/models/OrderItem';

export enum ProductUnit {
  ML = 'ml',
  MG = 'mg',
  G = 'g'
}

export enum ProductMagnitude {
  UNIT = 'unit'
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'money', nullable: true })
  price: number;

  @Column({ type: 'int', nullable: true })
  dose: number;

  @Column({ type: 'enum', enum: ProductUnit, nullable: true })
  unit: ProductUnit;

  @Column({ type: 'int', nullable: true })
  quantity: number;

  @Column({ type: 'enum', enum: ProductMagnitude, nullable: true })
  magnitude: ProductMagnitude;

  @ManyToOne(() => Laboratory, lab => lab.products)
  @JoinColumn({ name: 'idLabo' })
  laboratory: Laboratory;

  @ManyToOne(() => Pharmacy, pharmacy => pharmacy.products)
  @JoinColumn({ name: 'idPharmacy' })
  pharmacy: Pharmacy;

  @ManyToOne(() => Category, category => category.products)
  @JoinColumn({ name: 'idCategory' })
  category: Category;

  @Column()
  active: boolean;

  @OneToMany(() => OrderItem, item => item.product)
  orderItems: OrderItem[];
}