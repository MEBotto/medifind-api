import { MigrationInterface, QueryRunner } from 'typeorm';

export class CatalogInventoryFoundation1790000000000 implements MigrationInterface {
  name = 'CatalogInventoryFoundation1790000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "catalog_products" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "name" varchar(255) NOT NULL,
      "description" text,
      "barcode" varchar(100),
      "presentation" varchar(100),
      "dose" integer,
      "unit" varchar(20),
      "laboratoryId" uuid,
      "categoryId" uuid,
      CONSTRAINT "PK_catalog_products" PRIMARY KEY ("id"),
      CONSTRAINT "UQ_catalog_products_barcode" UNIQUE ("barcode"),
      CONSTRAINT "FK_catalog_products_laboratory" FOREIGN KEY ("laboratoryId") REFERENCES "laboratories"("id") ON DELETE RESTRICT,
      CONSTRAINT "FK_catalog_products_category" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT
    )`);
    await queryRunner.query(`CREATE TABLE "pharmacy_products" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "productId" uuid NOT NULL,
      "pharmacyId" uuid NOT NULL,
      "price" numeric(12,2),
      "quantity" integer NOT NULL DEFAULT 0,
      "active" boolean NOT NULL DEFAULT false,
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "PK_pharmacy_products" PRIMARY KEY ("id"),
      CONSTRAINT "UQ_pharmacy_products_pharmacy_product" UNIQUE ("pharmacyId", "productId"),
      CONSTRAINT "FK_pharmacy_products_product" FOREIGN KEY ("productId") REFERENCES "catalog_products"("id") ON DELETE RESTRICT,
      CONSTRAINT "FK_pharmacy_products_pharmacy" FOREIGN KEY ("pharmacyId") REFERENCES "pharmacies"("id") ON DELETE RESTRICT,
      CONSTRAINT "CHK_pharmacy_products_quantity" CHECK ("quantity" >= 0),
      CONSTRAINT "CHK_pharmacy_products_price" CHECK ("price" IS NULL OR "price" >= 0)
    )`);
    await queryRunner.query(`CREATE TYPE "catalog_requests_type_enum" AS ENUM ('PRODUCT','LABORATORY','CATEGORY')`);
    await queryRunner.query(`CREATE TYPE "catalog_requests_status_enum" AS ENUM ('PENDING','APPROVED','REJECTED')`);
    await queryRunner.query(`CREATE TABLE "catalog_requests" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "type" "catalog_requests_type_enum" NOT NULL,
      "status" "catalog_requests_status_enum" NOT NULL DEFAULT 'PENDING',
      "payload" jsonb NOT NULL,
      "requestedById" uuid NOT NULL,
      "pharmacyId" uuid NOT NULL,
      "reviewedById" uuid,
      "reviewedAt" timestamptz,
      "rejectionReason" text,
      "parentRequestId" uuid,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "PK_catalog_requests" PRIMARY KEY ("id"),
      CONSTRAINT "FK_catalog_requests_requester" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT,
      CONSTRAINT "FK_catalog_requests_pharmacy" FOREIGN KEY ("pharmacyId") REFERENCES "pharmacies"("id") ON DELETE RESTRICT,
      CONSTRAINT "FK_catalog_requests_reviewer" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL,
      CONSTRAINT "FK_catalog_requests_parent" FOREIGN KEY ("parentRequestId") REFERENCES "catalog_requests"("id") ON DELETE SET NULL
    )`);
    await queryRunner.query(`CREATE INDEX "IDX_catalog_requests_pending" ON "catalog_requests" ("status", "createdAt")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "catalog_requests"`);
    await queryRunner.query(`DROP TYPE "catalog_requests_status_enum"`);
    await queryRunner.query(`DROP TYPE "catalog_requests_type_enum"`);
    await queryRunner.query(`DROP TABLE "pharmacy_products"`);
    await queryRunner.query(`DROP TABLE "catalog_products"`);
  }
}
