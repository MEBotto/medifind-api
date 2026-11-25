import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Bootstrap migration for fresh databases. Existing synchronized databases
 * are left untouched and can be upgraded by the subsequent RBAC migration.
 *
 * NOTE: The DDL is currently derived from entity metadata. Before releasing,
 * replace it with a frozen generated migration to make history immutable.
 */
export class InitialSchema1780000000000 implements MigrationInterface {
  name = 'InitialSchema1780000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const entityTables = [...new Set(queryRunner.connection.entityMetadatas
      .map(metadata => metadata.tableName))];

    const existing: Array<{ table_name: string }> = await queryRunner.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = current_schema() AND table_type = 'BASE TABLE'
        AND table_name = ANY($1::text[])
    `, [entityTables]);
    const present = new Set(existing.map(row => row.table_name));

    // Some installations were initialized using TypeORM synchronize before
    // migrations were introduced. Never replay CREATE TABLE on those schemas.
    if (present.size === entityTables.length) {
      console.info('InitialSchema: application tables already exist; leaving schema unchanged');
      return;
    }

    // Partial schemas must be reviewed; automatically reconciling them can
    // destroy columns or constraints and is not a safe production migration.
    if (present.size > 0) {
      const missing = entityTables.filter(table => !present.has(table));
      throw new Error(`InitialSchema detected a partial schema; missing tables: ${missing.join(', ')}`);
    }

    const schemaBuilder = queryRunner.connection.driver.createSchemaBuilder();
    const sql = await schemaBuilder.log();
    const destructive = sql.upQueries.filter(query =>
      /\\b(DROP\\s+(TABLE|COLUMN|INDEX|CONSTRAINT)|TRUNCATE|DELETE\\s+FROM)\\b/i.test(query.query)
    );
    if (destructive.length) {
      throw new Error('InitialSchema generated destructive DDL; review manually');
    }
    for (const query of sql.upQueries) {
      await queryRunner.query(query.query, query.parameters);
    }
  }

  async down(): Promise<void> {
    throw new Error('InitialSchema rollback is disabled to protect application data');
  }
}
