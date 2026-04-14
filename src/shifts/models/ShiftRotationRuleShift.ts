import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ShiftRotationRule } from './ShiftRotationRule';
import { Shift } from './Shift';

@Entity('shift_rotation_rule_shifts')
export class ShiftRotationRuleShift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ShiftRotationRule, rule => rule.rotationRuleShifts)
  @JoinColumn({ name: 'idRule' })
  rule: ShiftRotationRule;

  @ManyToOne(() => Shift, shift => shift.rotationRuleShifts)
  @JoinColumn({ name: 'idShift' })
  shift: Shift;

  @Column({ type: 'int' })
  position: number;
}