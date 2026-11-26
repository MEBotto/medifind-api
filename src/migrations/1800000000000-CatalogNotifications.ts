import { MigrationInterface, QueryRunner } from 'typeorm';

export class CatalogNotifications1800000000000 implements MigrationInterface {
  name = 'CatalogNotifications1800000000000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "notifications" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "userId" uuid NOT NULL,
      "type" varchar(80) NOT NULL,
      "title" varchar(200) NOT NULL,
      "message" text NOT NULL,
      "catalogRequestId" uuid,
      "readAt" timestamptz,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "PK_notifications" PRIMARY KEY ("id"),
      CONSTRAINT "FK_notifications_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    )`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_user_read_created" ON "notifications" ("userId", "readAt", "createdAt")`);
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "notifications"');
  }
}
