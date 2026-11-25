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
    // TypeORM creates its own migrations table before invoking up(). Only
    // application entity tables matter for detecting a pre-existing schema.
    const entityTables = [...new Set(queryRunner.connection.entityMetadatas
      .map(metadata => metadata.tableName))];
    const existing = await queryRunner.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = current_schema() AND table_type = 'BASE TABLE'
        AND table_name = ANY($1::text[])
    `, [entityTables]);
    if (existing.length > 0) {
      throw new Error(`InitialSchema requires no existing application tables; found: ${existing.map((row: { table_name: string }) => row.table_name).join(', ')}`);
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
