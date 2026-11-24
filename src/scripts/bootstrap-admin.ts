import 'reflect-metadata';
import bcrypt from 'bcrypt';
import AppDataSource from '@/data-source';
import { Role } from '@/roles/models/Role';
import { User } from '@/users/models/User';

/**
 * One-time bootstrap. Credentials must be provided via environment variables;
 * never commit them. Refuses to run when any ADMIN already exists.
 */
async function main(): Promise<void> {
  const { BOOTSTRAP_ADMIN_EMAIL: email, BOOTSTRAP_ADMIN_USERNAME: username,
    BOOTSTRAP_ADMIN_PASSWORD: password } = process.env;
  if (!email || !username || !password || password.length < 12) {
    throw new Error('Set BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_USERNAME and a password of at least 12 characters');
  }
  await AppDataSource.initialize();
  try {
    await AppDataSource.transaction(async manager => {
      await manager.query('SELECT pg_advisory_xact_lock(783004219)');
      const role = await manager.getRepository(Role).findOneBy({ code: 'ADMIN' });
      if (!role) throw new Error('Run seed:roles first');
      const existingAdmin = await manager.getRepository(User).count({ where: { role: { id: role.id } } });
      if (existingAdmin) throw new Error('An administrator already exists');
      const users = manager.getRepository(User);
      if (await users.findOne({ where: [{ email }, { username }] })) {
        throw new Error('Email or username is already in use');
      }
      await users.save(users.create({ email, username, password: await bcrypt.hash(password, 12), role }));
    });
    console.info('Initial administrator created');
  } finally {
    await AppDataSource.destroy();
  }
}
main().catch(error => { console.error('Administrator bootstrap failed:', error.message); process.exitCode = 1; });
