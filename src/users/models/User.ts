import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Role } from '../../roles/models/Role';
import { Person } from '../../customers/models/Person';
import { Pharmacy } from '../../pharmacies/models/Pharmacy';
import { FavouritePharmacy } from './FavouritePharmacy';
import { Customer } from '../../customers/models/Customer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column()
  password: string;

  @ManyToOne(() => Role, role => role.users)
  @JoinColumn({ name: 'idRole' })
  role: Role;

  @ManyToOne(() => Person, person => person.users)
  @JoinColumn({ name: 'idPerson' })
  person: Person;

  @ManyToOne(() => Pharmacy, pharmacy => pharmacy.users, { nullable: true })
  @JoinColumn({ name: 'idPharmacy' })
  pharmacy: Pharmacy | null;

  @OneToMany(() => FavouritePharmacy, fp => fp.user)
  favouritePharmacies: FavouritePharmacy[];

  @OneToMany(() => Customer, customer => customer.user)
  customers: Customer[];
}
