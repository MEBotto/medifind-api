import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Customer } from './Customer';
import { User } from '../../users/models/User';

@Entity('people')
export class Person {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  surname: string;

  @Column({ type: 'int', nullable: true })
  identification: number;

  @OneToMany(() => Customer, customer => customer.person)
  customers: Customer[];

  @OneToMany(() => User, user => user.person)
  users: User[];
}