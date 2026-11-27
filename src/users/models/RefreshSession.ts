import { Entity, PrimaryColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('refresh_sessions')
@Index('refresh_sessions_family_idx', ['familyId'])
@Index('refresh_sessions_user_idx', ['userId'])
export class RefreshSession {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  familyId: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({
    name: 'userId',
    foreignKeyConstraintName: 'refresh_sessions_userId_fkey',
  })
  user: User;

  @Column({ unique: true, length: 64 })
  tokenHash: string;

  @Column('timestamptz')
  expiresAt: Date;

  @Column('timestamptz', { nullable: true })
  revokedAt: Date | null;
}
