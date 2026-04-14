import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './User';
import { Pharmacy } from '../../pharmacies/models/Pharmacy';

@Entity('favourite_pharmacies')
@Unique(['user', 'pharmacy'])
export class FavouritePharmacy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.favouritePharmacies)
  @JoinColumn({ name: 'idUser' })
  user: User;

  @ManyToOne(() => Pharmacy)
  @JoinColumn({ name: 'idPharmacy' })
  pharmacy: Pharmacy;

  @Column()
  active: boolean;
}