import 'reflect-metadata';
import AppDataSource from '@/data-source';
import { RbacAudit1790000000000 } from './1790000000000-RbacAudit';
import { Role } from '@/roles/models/Role';
import { AuditLog } from '@/audit/models/AuditLog';

const describeDb = process.env.RUN_DB_INTEGRATION === '1' ? describe : describe.skip;

describeDb('RBAC migration against PostgreSQL', () => {
  beforeAll(async () => {
    if (process.env.NODE_ENV !== 'test' || process.env.DB_INTEGRATION_ISOLATED !== 'true') {
      throw new Error('Requires isolated test database');
    }

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  });

  it('runs safely against a synchronized test schema and preserves roles', async () => {
    const before = await AppDataSource.getRepository(Role).find();
    const runner = AppDataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      await new RbacAudit1790000000000().up(runner);
      const after = await runner.manager.getRepository(Role).find();
      expect(after.map((r) => r.id).sort()).toEqual(before.map((r) => r.id).sort());
      expect(await runner.hasTable('audit_logs')).toBe(true);
      await runner.rollbackTransaction();
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  });

  it('audit log entity maps to the database', async () => {
    const columns = AppDataSource.getMetadata(AuditLog).columns.map(
      (column) => column.databaseName,
    );
    expect(columns).toEqual(
      expect.arrayContaining(['userId', 'pharmacyId', 'createdAt', 'ipAddress']),
    );
  });
});
