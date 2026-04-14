import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Customer } from '../../customers/models/Customer';
import { User } from '../../users/models/User';
import { OrderItem } from './OrderItem';

export enum OrderState {
  PENDING = 'pending',
  PREPARING = 'preparing',
  CANCELLED = 'cancelled',
  READY = 'ready',
  DELIVERED = 'delivered'
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', { generated: 'increment' })
  number: number;

  @CreateDateColumn({ type: 'timestamp' })
  date: Date;

  @ManyToOne(() => Customer, customer => customer.orders)
  @JoinColumn({ name: 'idCustomer' })
  customer: Customer;

  @Column({ type: 'money', nullable: true })
  totalPrice: number;

  @Column({ type: 'timestamp', nullable: true })
  voidedAt: Date;

  @Column({ type: 'text', nullable: true })
  voidReason: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'voidedBy' })
  voidedByUser: User;

  @Column({
    type: 'enum',
    enum: OrderState,
    default: OrderState.PENDING
  })
  state: OrderState;

  @OneToMany(() => OrderItem, item => item.order)
  items: OrderItem[];
}