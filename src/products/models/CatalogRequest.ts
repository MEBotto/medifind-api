import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/models/User';
import { Pharmacy } from '../../pharmacies/models/Pharmacy';

export enum CatalogRequestType {
  PRODUCT = 'PRODUCT',
  LABORATORY = 'LABORATORY',
  CATEGORY = 'CATEGORY',
}

export enum CatalogRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('catalog_requests')
export class CatalogRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: CatalogRequestType })
  type: CatalogRequestType;

  @Column({ type: 'enum', enum: CatalogRequestStatus, default: CatalogRequestStatus.PENDING })
  status: CatalogRequestStatus;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'requestedById' })
  requestedBy: User;

  @ManyToOne(() => Pharmacy, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'pharmacyId' })
  pharmacy: Pharmacy;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewedById' })
  reviewedBy: User | null;

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @ManyToOne(() => CatalogRequest, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentRequestId' })
  parentRequest: CatalogRequest | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
