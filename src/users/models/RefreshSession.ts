import { Entity, PrimaryColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('refresh_sessions')
@Index(['familyId'])
@Index(['userId'])
export class RefreshSession {
  @PrimaryColumn('uuid') id: string;
  @Column('uuid') familyId: string;
  @Column('uuid') userId: string;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) user: User;
  @Column({ unique: true, length: 64 }) tokenHash: string;
  @Column('timestamptz') expiresAt: Date;
  @Column('timestamptz', { nullable: true }) revokedAt: Date | null;
}
