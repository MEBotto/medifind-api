import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReconcileSchema1800000002000 implements MigrationInterface {
  name = 'ReconcileSchema1800000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Prevent concurrent writes while validating and changing the schema.
    await queryRunner.query(`
      LOCK TABLE "roles", "permissions", "role_permission"
      IN ACCESS EXCLUSIVE MODE
    `);

    // Validate existing data before changing column definitions.
    const invalidCodes = await queryRunner.query(`
      SELECT "id"
      FROM "permissions"
      WHERE length("code") > 100
      LIMIT 1
    `);

    if (invalidCodes.length > 0) {
      throw new Error('Permission codes exceed the maximum length of 100 characters');
    }

    const invalidNames = await queryRunner.query(`
      SELECT "id"
      FROM "roles"
      WHERE length("name") > 100
      LIMIT 1
    `);

    if (invalidNames.length > 0) {
      throw new Error('Role names exceed the maximum length of 100 characters');
    }

    const invalidAssignments = await queryRunner.query(`
      SELECT "id"
      FROM "role_permission"
      WHERE "idRole" IS NULL
         OR "idPermission" IS NULL
      LIMIT 1
    `);

    if (invalidAssignments.length > 0) {
      throw new Error('Incomplete role-permission assignments require manual review');
    }

    // Permissions: preserve existing values.
    await queryRunner.query(`
      ALTER TABLE "permissions"
      ALTER COLUMN "code" TYPE varchar(100),
      ALTER COLUMN "description" TYPE text
    `);

    // Roles: preserve existing values.
    await queryRunner.query(`
      ALTER TABLE "roles"
      ALTER COLUMN "name" TYPE varchar(100),
      ALTER COLUMN "description" TYPE text
    `);

    // Role-permission assignments must reference both entities.
    await queryRunner.query(`
      ALTER TABLE "role_permission"
      ALTER COLUMN "idRole" SET NOT NULL,
      ALTER COLUMN "idPermission" SET NOT NULL
    `);

    // Align foreign-key deletion behavior with entity definitions.
    await queryRunner.query(`
      ALTER TABLE "role_permission"
      DROP CONSTRAINT "FK_a1789584ad25a0b20a8183ddd1d",
      DROP CONSTRAINT "FK_f34776ae884696e31dc6ee6be68"
    `);

    await queryRunner.query(`
      ALTER TABLE "role_permission"
      ADD CONSTRAINT "FK_a1789584ad25a0b20a8183ddd1d"
        FOREIGN KEY ("idRole")
        REFERENCES "roles"("id")
        ON DELETE CASCADE
        ON UPDATE NO ACTION,
      ADD CONSTRAINT "FK_f34776ae884696e31dc6ee6be68"
        FOREIGN KEY ("idPermission")
        REFERENCES "permissions"("id")
        ON DELETE CASCADE
        ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "role_permission"
      DROP CONSTRAINT "FK_a1789584ad25a0b20a8183ddd1d",
      DROP CONSTRAINT "FK_f34776ae884696e31dc6ee6be68"
    `);

    await queryRunner.query(`
      ALTER TABLE "role_permission"
      ADD CONSTRAINT "FK_a1789584ad25a0b20a8183ddd1d"
        FOREIGN KEY ("idRole")
        REFERENCES "roles"("id")
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
      ADD CONSTRAINT "FK_f34776ae884696e31dc6ee6be68"
        FOREIGN KEY ("idPermission")
        REFERENCES "permissions"("id")
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "role_permission"
      ALTER COLUMN "idRole" DROP NOT NULL,
      ALTER COLUMN "idPermission" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "roles"
      ALTER COLUMN "name" TYPE varchar,
      ALTER COLUMN "description" TYPE varchar
    `);

    await queryRunner.query(`
      ALTER TABLE "permissions"
      ALTER COLUMN "code" TYPE varchar,
      ALTER COLUMN "description" TYPE varchar
    `);
  }
}
