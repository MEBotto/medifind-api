import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial schema for a fresh MediFind database.
 *
 * TypeORM derives the DDL from the registered entities. This is intentionally
 * limited to an empty database: legacy databases must follow the upgrade path.
 * No schema synchronization is enabled on the application DataSource.
 */
export class InitialSchema1780000000000 implements MigrationInterface {
  name = 'InitialSchema1780000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const existing = await queryRunner.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = current_schema() AND table_type = 'BASE TABLE'
        AND table_name NOT IN ('migrations', 'typeorm_metadata')
    `);
    if (existing.length > 0) {
      throw new Error('InitialSchema requires an empty database; do not run on an existing schema');
    }

    // TypeORM 0.3's schema builder uses the same entity metadata as the API.
    // Generate the CREATE statements without enabling synchronize:true.
    const schemaBuilder = queryRunner.connection.driver.createSchemaBuilder();
    const sql = await schemaBuilder.log();
    for (const query of sql.upQueries) {
      await queryRunner.query(query.query, query.parameters);
    }
  }

  async down(): Promise<void> {
    throw new Error('InitialSchema rollback is intentionally disabled to protect application data');
  }
}
