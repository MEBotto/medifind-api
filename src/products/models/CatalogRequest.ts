import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
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
@Index('IDX_catalog_requests_pending', ['status', 'createdAt'])
export class CatalogRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: CatalogRequestType })
  type: CatalogRequestType;

  @Column({
    type: 'enum',
    enum: CatalogRequestStatus,
    default: CatalogRequestStatus.PENDING,
  })
  status: CatalogRequestStatus;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'requestedById',
    foreignKeyConstraintName: 'FK_catalog_requests_requester',
  })
  requestedBy: User;

  @ManyToOne(() => Pharmacy, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'pharmacyId',
    foreignKeyConstraintName: 'FK_catalog_requests_pharmacy',
  })
  pharmacy: Pharmacy;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'reviewedById',
    foreignKeyConstraintName: 'FK_catalog_requests_reviewer',
  })
  reviewedBy: User | null;

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @ManyToOne(() => CatalogRequest, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'parentRequestId',
    foreignKeyConstraintName: 'FK_catalog_requests_parent',
  })
  parentRequest: CatalogRequest | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
