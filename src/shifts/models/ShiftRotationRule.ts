import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ShiftRotationRuleShift } from './ShiftRotationRuleShift';

@Entity('shift_rotation_rules')
export class ShiftRotationRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'int', nullable: true })
  year: number;

  @Column('int', { array: true })
  months: number[];

  @Column({ type: 'int', default: 1 })
  anchorDay: number;

  @Column({ type: 'uuid' })
  idAnchorShift: string;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @OneToMany(() => ShiftRotationRuleShift, srrs => srrs.rule)
  rotationRuleShifts: ShiftRotationRuleShift[];
}