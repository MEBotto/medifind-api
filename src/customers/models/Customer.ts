import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/models/User';
import { Person } from './Person';
import { InsurancePlan } from './InsurancePlan';
import { Order } from '../../orders/models/Order';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.customers)
  @JoinColumn({ name: 'idUser' })
  user: User;

  @ManyToOne(() => Person, person => person.customers)
  @JoinColumn({ name: 'idPerson' })
  person: Person;

  @ManyToOne(() => InsurancePlan, plan => plan.customers)
  @JoinColumn({ name: 'idInsurancePlan' })
  insurancePlan: InsurancePlan;

  @OneToMany(() => Order, order => order.customer)
  orders: Order[];
}