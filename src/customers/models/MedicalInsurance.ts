import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { InsurancePlan } from './InsurancePlan';

@Entity('medical_insurance')
export class MedicalInsurance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => InsurancePlan, plan => plan.medicalInsurance)
  insurancePlans: InsurancePlan[];
}