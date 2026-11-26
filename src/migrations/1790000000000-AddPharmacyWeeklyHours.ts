import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPharmacyWeeklyHours1790000000000 implements MigrationInterface {
  name = 'AddPharmacyWeeklyHours1790000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pharmacies" ADD COLUMN "weeklyHours" jsonb NOT NULL DEFAULT '[]'::jsonb`);
    await queryRunner.query(`ALTER TABLE "pharmacies" ADD COLUMN "open24Hours" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pharmacies" DROP COLUMN "open24Hours"`);
    await queryRunner.query(`ALTER TABLE "pharmacies" DROP COLUMN "weeklyHours"`);
  }
}
