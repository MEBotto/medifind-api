import { CreateRoleSchema, UpdateRoleSchema } from './role.dto';
import { CreatePermissionSchema } from './permission.dto';

describe('RBAC DTOs', () => {
  it('requires uppercase stable role codes', () => {
    expect(CreateRoleSchema.safeParse({ code: 'ADMIN', name: 'Administrador' }).success).toBe(true);
    expect(CreateRoleSchema.safeParse({ code: 'Admin', name: 'Administrador' }).success).toBe(false);
  });
  it('does not allow changing a role code', () => {
    expect(UpdateRoleSchema.safeParse({ code: 'CUSTOMER' }).success).toBe(false);
  });
  it('validates permission codes', () => {
    expect(CreatePermissionSchema.safeParse({ code: 'USERS_CREATE', name: 'Crear usuarios' }).success).toBe(true);
    expect(CreatePermissionSchema.safeParse({ code: 'users.create' }).success).toBe(false);
  });
});
