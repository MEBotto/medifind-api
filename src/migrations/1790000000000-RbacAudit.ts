import { MigrationInterface, QueryRunner } from 'typeorm';

/** Upgrade existing synchronized MediFind databases without deleting business data. */
export class RbacAudit1790000000000 implements MigrationInterface {
  name = 'RbacAudit1790000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "code" varchar(50)');
    await queryRunner.query('ALTER TABLE "permissions" ADD COLUMN IF NOT EXISTS "name" varchar(150)');
    await queryRunner.query(`UPDATE "roles" SET "code" = CASE
      WHEN lower(trim("name")) IN ('admin', 'administrador') THEN 'ADMIN'
      WHEN lower(trim("name")) IN ('pharmacist', 'farmacéutico', 'farmaceutico') THEN 'PHARMACIST'
      WHEN lower(trim("name")) IN ('customer', 'cliente') THEN 'CUSTOMER'
      ELSE NULL END
      WHERE "code" IS NULL`);
    // Fail rather than silently renaming or dropping unknown legacy roles.
    const unknown = await queryRunner.query('SELECT "id", "name" FROM "roles" WHERE "code" IS NULL');
    if (unknown.length) throw new Error('Unmapped legacy roles: review role names before migrating');
    const duplicates = await queryRunner.query('SELECT "code" FROM "roles" GROUP BY "code" HAVING count(*) > 1');
    if (duplicates.length) throw new Error('Duplicate legacy role codes: consolidate roles before migrating');
    await queryRunner.query('ALTER TABLE "roles" ALTER COLUMN "code" SET NOT NULL');
    await queryRunner.query('CREATE UNIQUE INDEX IF NOT EXISTS "UQ_roles_code" ON "roles" ("code")');
    await queryRunner.query('CREATE UNIQUE INDEX IF NOT EXISTS "UQ_permissions_code" ON "permissions" ("code")');
    // Do not delete legacy assignments implicitly; require manual review of duplicates.
    const duplicateAssignments = await queryRunner.query(`SELECT "idRole", "idPermission", count(*) AS total
      FROM "role_permission" GROUP BY "idRole", "idPermission" HAVING count(*) > 1`);
    if (duplicateAssignments.length) throw new Error('Duplicate role-permission assignments: review before migrating');
    await queryRunner.query('CREATE UNIQUE INDEX IF NOT EXISTS "UQ_role_permission_pair" ON "role_permission" ("idRole", "idPermission")');
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "audit_logs" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" uuid NULL, "pharmacyId" uuid NULL,
      "action" varchar(100) NOT NULL, "entityType" varchar(100) NOT NULL,
      "entityId" uuid NULL, "oldValues" jsonb NULL, "newValues" jsonb NULL,
      "metadata" jsonb NULL, "ipAddress" varchar(45) NULL,
      "userAgent" text NULL, "createdAt" timestamptz NOT NULL DEFAULT now()
    )`);
    await queryRunner.query('CREATE INDEX IF NOT EXISTS "IDX_audit_logs_actor_created" ON "audit_logs" ("userId", "createdAt")');
    await queryRunner.query('CREATE INDEX IF NOT EXISTS "IDX_audit_logs_entity" ON "audit_logs" ("entityType", "entityId")');
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Intentionally irreversible: dropping audit history or role codes would lose data.
    throw new Error('RbacAudit migration requires a reviewed manual rollback');
  }
}
