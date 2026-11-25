import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Role } from './Role';
import { Permission } from './Permission';

@Entity('role_permission')
@Unique('UQ_role_permission_pair', ['role', 'permission'])
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Role, role => role.rolePermissions, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idRole' })
  role: Role;

  @ManyToOne(() => Permission, permission => permission.rolePermissions, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idPermission' })
  permission: Permission;
}
