import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Shift } from '../../shifts/models/Shift';
import { Product } from '../../products/models/Product';
import { User } from '../../users/models/User';

@Entity('pharmacies')
export class Pharmacy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  adress: string;

  @Column('numeric', { precision: 9, scale: 6, nullable: true })
  lat: number;

  @Column('numeric', { precision: 9, scale: 6, nullable: true })
  lng: number;

  @Column({ type: 'bigint', nullable: true })
  phone: string;

  @Column({ nullable: true })
  openingDays: string;

  @Column({ type: 'time', nullable: true })
  openingTime: string;

  @Column({ type: 'time', nullable: true })
  closingTime: string;

  @ManyToOne(() => Shift, shift => shift.pharmacies)
  @JoinColumn({ name: 'idShift' })
  shift: Shift;

  @OneToMany(() => Product, product => product.pharmacy)
  products: Product[];

  @OneToMany(() => User, user => user.pharmacy)
  users: User[];
}