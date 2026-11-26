import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from '@/users/models/User';

@Entity('notifications')
@Index('IDX_notifications_user_read_created', ['userId', 'readAt', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uuid' }) userId: string;
  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'userId' }) user: User;
  @Column({ type: 'varchar', length: 80 }) type: string;
  @Column({ type: 'varchar', length: 200 }) title: string;
  @Column({ type: 'text' }) message: string;
  @Column({ type: 'uuid', nullable: true }) catalogRequestId: string | null;
  @Column({ type: 'timestamptz', nullable: true }) readAt: Date | null;
  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
}
