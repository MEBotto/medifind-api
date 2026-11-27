import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { User } from '../../users/models/User';
import { RolePermission } from './RolePermission';

@Entity('roles')
@Index('UQ_roles_code', ['code'], { unique: true })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  code: string;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  name: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @OneToMany(() => RolePermission, (rp) => rp.role)
  rolePermissions: RolePermission[];
}
