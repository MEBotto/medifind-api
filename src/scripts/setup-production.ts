import 'reflect-metadata';
import bcrypt from 'bcrypt';
import AppDataSource from '@/data-source';
import { Role } from '@/roles/models/Role';
import { User } from '@/users/models/User';
import { Permission } from '@/roles/models/Permission';
import { RolePermission } from '@/roles/models/RolePermission';
import { DEFAULT_ROLES } from '@/roles/constants/role-codes';

/**
 * Production setup orchestrator: migrate, seed reference roles, optionally
 * bootstrap the first administrator. Safe to rerun: no demo data or truncation.
 * Run only after the complete initial-schema migration is committed.
 */
async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'test') {
    throw new Error('Production setup must not run with NODE_ENV=test (synchronize is enabled)');
  }
  await AppDataSource.initialize();
  try {
    // Refuse to initialize a fresh database until a complete baseline migration exists.
    // The existing RBAC migration only upgrades an already-created schema.
    const hasBaseline = AppDataSource.migrations.some(migration => migration.name?.includes('InitialSchema'));
    if (!hasBaseline) {
      throw new Error('Missing initial schema migration: production setup is not ready for an empty database');
    }
    await AppDataSource.runMigrations({ transaction: 'all' });
    await AppDataSource.transaction(async manager => {
      await manager.query('SELECT pg_advisory_xact_lock(783004220)');
      const roles = manager.getRepository(Role);
      for (const role of DEFAULT_ROLES) {
        const existing = await roles.findOneBy({ code: role.code });
        if (existing) {
          await roles.update(existing.id, { name: role.name, description: role.description });
        } else {
          await roles.save(roles.create(role));
        }
      }

      // Seed the permission catalog and default role assignments.
      // Current HTTP authorization still uses requireRole; these assignments
      // are reference data for the upcoming fine-grained permission middleware.
      const definitions = [
        { code: 'USERS_MANAGE', name: 'Administrar usuarios', roles: ['ADMIN'] },
        { code: 'ROLES_MANAGE', name: 'Administrar roles', roles: ['ADMIN'] },
        { code: 'PHARMACIES_MANAGE', name: 'Administrar farmacias', roles: ['ADMIN'] },
        { code: 'PRODUCTS_MANAGE', name: 'Administrar productos', roles: ['ADMIN', 'PHARMACIST'] },
      ] as const;
      const permissions = manager.getRepository(Permission);
      const assignments = manager.getRepository(RolePermission);
      for (const definition of definitions) {
        let permission = await permissions.findOneBy({ code: definition.code });
        if (!permission) {
          permission = await permissions.save(permissions.create({
            code: definition.code, name: definition.name,
          }));
        } else if (permission.name !== definition.name) {
          permission.name = definition.name;
          await permissions.save(permission);
        }
        for (const roleCode of definition.roles) {
          const role = await roles.findOneByOrFail({ code: roleCode });
          const existing = await assignments.findOne({
            where: { role: { id: role.id }, permission: { id: permission.id } },
          });
          if (!existing) await assignments.save(assignments.create({ role, permission }));
        }
      }

      const adminRole = await roles.findOneByOrFail({ code: 'ADMIN' });
      const users = manager.getRepository(User);
      const hasAdmin = await users.count({ where: { role: { id: adminRole.id } } });
      if (hasAdmin) {
        console.info('An administrator already exists; bootstrap skipped');
        return;
      }

      const { BOOTSTRAP_ADMIN_EMAIL: email, BOOTSTRAP_ADMIN_USERNAME: username,
        BOOTSTRAP_ADMIN_PASSWORD: password } = process.env;
      if (!email || !username || !password || password.length < 12) {
        throw new Error('First setup requires BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_USERNAME and BOOTSTRAP_ADMIN_PASSWORD (12+ characters)');
      }
      if (await users.findOne({ where: [{ email }, { username }] })) {
        throw new Error('Bootstrap administrator email or username already exists');
      }
      await users.save(users.create({
        email, username, password: await bcrypt.hash(password, 12), role: adminRole,
      }));
      console.info('Initial administrator created');
    });
    console.info('Production setup completed');
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch(error => {
  console.error('Production setup failed:', error);
  process.exitCode = 1;
});
