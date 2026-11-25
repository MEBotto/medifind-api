import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial schema for a fresh MediFind database.
 *
 * TypeORM derives the DDL from the registered entities. This is intentionally
 * designed to create missing schema without dropping existing application data.
 * No schema synchronization is enabled on the application DataSource.
 */
export class InitialSchema1780000000000 implements MigrationInterface {
  name = 'InitialSchema1780000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // An existing schema may have been created by earlier synchronize-based
    // deployments. The schema builder computes missing DDL rather than
    // assuming that every application table is absent.
    // Never run generated DROP statements against existing user data.
    // TypeORM 0.3's schema builder uses the same entity metadata as the API.
    // Generate the CREATE statements without enabling synchronize:true.
    const before = await queryRunner.query("SELECT tablename FROM pg_tables WHERE schemaname = current_schema() ORDER BY tablename");
    console.info('InitialSchema tables before schema builder:', before.map((row: { tablename: string }) => row.tablename));
    const schemaBuilder = queryRunner.connection.driver.createSchemaBuilder();
    const sql = await schemaBuilder.log();
    const after = await queryRunner.query("SELECT tablename FROM pg_tables WHERE schemaname = current_schema() ORDER BY tablename");
    console.info('InitialSchema tables after schema builder:', after.map((row: { tablename: string }) => row.tablename));
    console.info('InitialSchema planned DDL:', sql.upQueries.map(query => query.query));
    const destructive = sql.upQueries.filter(query => /\\b(DROP\\s+(TABLE|COLUMN|INDEX|CONSTRAINT)|TRUNCATE|DELETE\\s+FROM)\\b/i.test(query.query));
    if (destructive.length) {
      throw new Error('InitialSchema detected destructive schema changes; review and migrate existing data manually');
    }
    for (const query of sql.upQueries) {
      await queryRunner.query(query.query, query.parameters);
    }
  }

  async down(): Promise<void> {
    throw new Error('InitialSchema rollback is intentionally disabled to protect application data');
  }
}
