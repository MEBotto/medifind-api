import 'reflect-metadata';
import AppDataSource from '@/data-source';
import { Role } from '@/roles/models/Role';
import { DEFAULT_ROLES } from '@/roles/constants/role-codes';

/** Run after database migrations. Does not create administrator credentials. */
async function main(): Promise<void> {
  await AppDataSource.initialize();
  try {
    const repository = AppDataSource.getRepository(Role);
    for (const role of DEFAULT_ROLES) {
      const existing = await repository.findOneBy({ code: role.code });
      if (existing) {
        await repository.update(existing.id, { name: role.name, description: role.description });
      } else {
        await repository.save(repository.create(role));
      }
    }
    console.info('Default roles initialized');
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch(error => {
  console.error('Failed to seed roles', error);
  process.exitCode = 1;
});
