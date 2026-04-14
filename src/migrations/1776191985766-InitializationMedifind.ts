import { MigrationInterface, QueryRunner } from "typeorm";

export class InitializationMedifind1776191985766 implements MigrationInterface {
    name = 'InitializationMedifind1776191985766'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "description" character varying, CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role_permission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "idRole" uuid, "idPermission" uuid, CONSTRAINT "PK_96c8f1fd25538d3692024115b47" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "description" character varying, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "medical_insurance" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying, CONSTRAINT "PK_1ae4c51216b24dd0c9b942ecda5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "insurance_plan" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying, "active" boolean, "idMedicalInsurance" uuid, CONSTRAINT "PK_b56065bb88ed4df0772c87ce6a6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "laboratories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, CONSTRAINT "PK_095d956b8c0841845525483188c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "shift_rotation_rules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "year" integer, "months" integer array NOT NULL, "anchorDay" integer NOT NULL DEFAULT '1', "idAnchorShift" uuid NOT NULL, "priority" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_6699047479d5ddda194bbeb0322" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "shift_rotation_rule_shifts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "position" integer NOT NULL, "idRule" uuid, "idShift" uuid, CONSTRAINT "PK_b155282f17143d4082bbe3c2a50" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "shifts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "code" character, CONSTRAINT "PK_84d692e367e4d6cdf045828768c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pharmacies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "adress" character varying, "lat" numeric(9,6), "lng" numeric(9,6), "phone" bigint, "openingDays" character varying, "openingTime" TIME, "closingTime" TIME, "idShift" uuid, CONSTRAINT "PK_887410330080d3beb73850ebc8f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."products_unit_enum" AS ENUM('ml', 'mg', 'g')`);
        await queryRunner.query(`CREATE TYPE "public"."products_magnitude_enum" AS ENUM('unit')`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "description" character varying, "price" money, "dose" integer, "unit" "public"."products_unit_enum", "quantity" integer, "magnitude" "public"."products_magnitude_enum", "active" boolean NOT NULL, "idLabo" uuid, "idPharmacy" uuid, "idCategory" uuid, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" integer, "price" money, "idOrder" uuid, "idProduct" uuid, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."orders_state_enum" AS ENUM('pending', 'preparing', 'cancelled', 'ready', 'delivered')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "number" SERIAL NOT NULL, "date" TIMESTAMP NOT NULL DEFAULT now(), "totalPrice" money, "voidedAt" TIMESTAMP, "voidReason" text, "state" "public"."orders_state_enum" NOT NULL DEFAULT 'pending', "idCustomer" uuid, "voidedBy" uuid, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "idUser" uuid, "idPerson" uuid, "idInsurancePlan" uuid, CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "people" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "surname" character varying, "identification" integer, CONSTRAINT "PK_aa866e71353ee94c6cc51059c5b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "favourite_pharmacies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "active" boolean NOT NULL, "idUser" uuid, "idPharmacy" uuid, CONSTRAINT "UQ_10cd2a7a5f39f40eab8fe19f0e2" UNIQUE ("idUser", "idPharmacy"), CONSTRAINT "PK_b7fd6a5bf4cc85f0ffd9ef5ad30" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "email" character varying, "password" character varying NOT NULL, "idRole" uuid, "idPerson" uuid, "idPharmacy" uuid, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "role_permission" ADD CONSTRAINT "FK_a1789584ad25a0b20a8183ddd1d" FOREIGN KEY ("idRole") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permission" ADD CONSTRAINT "FK_f34776ae884696e31dc6ee6be68" FOREIGN KEY ("idPermission") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "insurance_plan" ADD CONSTRAINT "FK_084bafcf14db334cbe984c8f2cf" FOREIGN KEY ("idMedicalInsurance") REFERENCES "medical_insurance"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shift_rotation_rule_shifts" ADD CONSTRAINT "FK_42b924f9219a48dad906baa3319" FOREIGN KEY ("idRule") REFERENCES "shift_rotation_rules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shift_rotation_rule_shifts" ADD CONSTRAINT "FK_5127d5c2cd2b7f4884f3587e89c" FOREIGN KEY ("idShift") REFERENCES "shifts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pharmacies" ADD CONSTRAINT "FK_eb44e3b3f8b6fdaf5af644d9dc3" FOREIGN KEY ("idShift") REFERENCES "shifts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_d7cbd09a383e639bc38f41c11de" FOREIGN KEY ("idLabo") REFERENCES "laboratories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_419f0c5d68983a55242dfcc9e5e" FOREIGN KEY ("idPharmacy") REFERENCES "pharmacies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_bfe0abe9481ee46c83d37de2a69" FOREIGN KEY ("idCategory") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_b3d6dd400698a870f9bae722498" FOREIGN KEY ("idOrder") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_3fa6c5f86e69939faf194711cb3" FOREIGN KEY ("idProduct") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_6ce1f477de72fd7eba392341cd0" FOREIGN KEY ("idCustomer") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_49382b06ab16c5b464962068f24" FOREIGN KEY ("voidedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_55156bb5bf5456bb1267829f871" FOREIGN KEY ("idUser") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_d7ea3c856ebd78181033d914c77" FOREIGN KEY ("idPerson") REFERENCES "people"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_0878a60afc5cc8734e766f296a4" FOREIGN KEY ("idInsurancePlan") REFERENCES "insurance_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favourite_pharmacies" ADD CONSTRAINT "FK_d319478035fed38dca47fba4781" FOREIGN KEY ("idUser") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favourite_pharmacies" ADD CONSTRAINT "FK_ac290face1211429fd911d5da2e" FOREIGN KEY ("idPharmacy") REFERENCES "pharmacies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_8adb072236d4ef4db52d8632c1a" FOREIGN KEY ("idRole") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a42e34423469b101443d9a6c87d" FOREIGN KEY ("idPerson") REFERENCES "people"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_9354a60f46d5261fa45d95e87d0" FOREIGN KEY ("idPharmacy") REFERENCES "pharmacies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_9354a60f46d5261fa45d95e87d0"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a42e34423469b101443d9a6c87d"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_8adb072236d4ef4db52d8632c1a"`);
        await queryRunner.query(`ALTER TABLE "favourite_pharmacies" DROP CONSTRAINT "FK_ac290face1211429fd911d5da2e"`);
        await queryRunner.query(`ALTER TABLE "favourite_pharmacies" DROP CONSTRAINT "FK_d319478035fed38dca47fba4781"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_0878a60afc5cc8734e766f296a4"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_d7ea3c856ebd78181033d914c77"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_55156bb5bf5456bb1267829f871"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_49382b06ab16c5b464962068f24"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_6ce1f477de72fd7eba392341cd0"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_3fa6c5f86e69939faf194711cb3"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_b3d6dd400698a870f9bae722498"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_bfe0abe9481ee46c83d37de2a69"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_419f0c5d68983a55242dfcc9e5e"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_d7cbd09a383e639bc38f41c11de"`);
        await queryRunner.query(`ALTER TABLE "pharmacies" DROP CONSTRAINT "FK_eb44e3b3f8b6fdaf5af644d9dc3"`);
        await queryRunner.query(`ALTER TABLE "shift_rotation_rule_shifts" DROP CONSTRAINT "FK_5127d5c2cd2b7f4884f3587e89c"`);
        await queryRunner.query(`ALTER TABLE "shift_rotation_rule_shifts" DROP CONSTRAINT "FK_42b924f9219a48dad906baa3319"`);
        await queryRunner.query(`ALTER TABLE "insurance_plan" DROP CONSTRAINT "FK_084bafcf14db334cbe984c8f2cf"`);
        await queryRunner.query(`ALTER TABLE "role_permission" DROP CONSTRAINT "FK_f34776ae884696e31dc6ee6be68"`);
        await queryRunner.query(`ALTER TABLE "role_permission" DROP CONSTRAINT "FK_a1789584ad25a0b20a8183ddd1d"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "favourite_pharmacies"`);
        await queryRunner.query(`DROP TABLE "people"`);
        await queryRunner.query(`DROP TABLE "customers"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_state_enum"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TYPE "public"."products_magnitude_enum"`);
        await queryRunner.query(`DROP TYPE "public"."products_unit_enum"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "pharmacies"`);
        await queryRunner.query(`DROP TABLE "shifts"`);
        await queryRunner.query(`DROP TABLE "shift_rotation_rule_shifts"`);
        await queryRunner.query(`DROP TABLE "shift_rotation_rules"`);
        await queryRunner.query(`DROP TABLE "laboratories"`);
        await queryRunner.query(`DROP TABLE "insurance_plan"`);
        await queryRunner.query(`DROP TABLE "medical_insurance"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "role_permission"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
    }

}
