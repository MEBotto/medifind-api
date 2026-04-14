import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { MedicalInsurance } from './MedicalInsurance';
import { Customer } from './Customer';

@Entity('insurance_plan')
export class InsurancePlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  active: boolean;

  @ManyToOne(() => MedicalInsurance, mi => mi.insurancePlans)
  @JoinColumn({ name: 'idMedicalInsurance' })
  medicalInsurance: MedicalInsurance;

  @OneToMany(() => Customer, customer => customer.insurancePlan)
  customers: Customer[];
}