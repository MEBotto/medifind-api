import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Pharmacy } from '../../pharmacies/models/Pharmacy';
import { ShiftRotationRuleShift } from './ShiftRotationRuleShift';

@Entity('shifts')
export class Shift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'char', nullable: true })
  code: string;

  @OneToMany(() => Pharmacy, pharmacy => pharmacy.shift)
  pharmacies: Pharmacy[];

  @OneToMany(() => ShiftRotationRuleShift, srrs => srrs.shift)
  rotationRuleShifts: ShiftRotationRuleShift[];
}