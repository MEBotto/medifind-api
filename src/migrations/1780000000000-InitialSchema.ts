import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Bootstrap migration for fresh databases. Existing synchronized databases
 * are left untouched and can be upgraded by the subsequent RBAC migration.
 *
 * DDL is frozen to the schema snapshot captured on 2026-11-26.
 */
export class InitialSchema1780000000000 implements MigrationInterface {
  name = 'InitialSchema1780000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Frozen table list from the original 2026-11-26 schema snapshot.
    // Do not use current entityMetadatas: later migrations introduce tables
    // which must not be required before their own migration runs.
    const entityTables = [
      'permissions', 'role_permission', 'roles', 'medical_insurance',
      'insurance_plan', 'laboratories', 'shift_rotation_rules',
      'shift_rotation_rule_shifts', 'shifts', 'pharmacies', 'categories',
      'products', 'order_items', 'orders', 'customers', 'people',
      'favourite_pharmacies', 'users', 'audit_logs',
    ];

    const existing: Array<{ table_name: string }> = await queryRunner.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = current_schema() AND table_type = 'BASE TABLE'
        AND table_name = ANY($1::text[])
    `, [entityTables]);
    const present = new Set(existing.map(row => row.table_name));

    // Some installations were initialized using TypeORM synchronize before
    // migrations were introduced. Never replay CREATE TABLE on those schemas.
    const missingTables = entityTables.filter(table => !present.has(table));
    // audit_logs is introduced by the next RBAC migration for legacy schemas.
    if (present.size > 0 && missingTables.every(table => table === 'audit_logs')) {
      console.info('InitialSchema: application tables already exist; leaving schema unchanged');
      return;
    }

    // Partial schemas must be reviewed; automatically reconciling them can
    // destroy columns or constraints and is not a safe production migration.
    if (present.size > 0) {
      throw new Error(`InitialSchema detected a partial schema; missing tables: ${missingTables.join(', ')}`);
    }

    // Frozen SQL snapshot generated from the 2026-11-26 entity schema.
    // Do not derive historical migrations from current entity metadata.
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    const statements: readonly string[] = [
          "CREATE TABLE \"permissions\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"code\" varchar(100) NOT NULL, \"name\" varchar(150), \"description\" text, CONSTRAINT \"UQ_8dad765629e83229da6feda1c1d\" UNIQUE (\"code\"), CONSTRAINT \"PK_920331560282b8bd21bb02290df\" PRIMARY KEY (\"id\"))",
          "CREATE TABLE \"role_permission\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"idRole\" uuid NOT NULL, \"idPermission\" uuid NOT NULL, CONSTRAINT \"UQ_role_permission_pair\" UNIQUE (\"idRole\", \"idPermission\"), CONSTRAINT \"PK_96c8f1fd25538d3692024115b47\" PRIMARY KEY (\"id\"))",
          "CREATE TABLE \"roles\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"code\" varchar(50) NOT NULL, \"name\" varchar(100), \"description\" text, CONSTRAINT \"UQ_f6d54f95c31b73fb1bdd8e91d0c\" UNIQUE (\"code\"), CONSTRAINT \"PK_c1433d71a4838793a49dcad46ab\" PRIMARY KEY (\"id\"))",
          "CREATE TABLE \"medical_insurance\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"description\" varchar, CONSTRAINT \"PK_1ae4c51216b24dd0c9b942ecda5\" PRIMARY KEY (\"id\"))",
          "CREATE TABLE \"insurance_plan\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"description\" varchar, \"active\" boolean, \"idMedicalInsurance\" uuid, CONSTRAINT \"PK_b56065bb88ed4df0772c87ce6a6\" PRIMARY KEY (\"id\"))",
          "CREATE TABLE \"laboratories\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"name\" varchar, CONSTRAINT \"PK_095d956b8c0841845525483188c\" PRIMARY KEY (\"id\"))",
          "CREATE TABLE \"shift_rotation_rules\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"name\" varchar NOT NULL, \"year\" integer, \"months\" integer array NOT NULL, \"anchorDay\" integer NOT NULL DEFAULT 1, \"idAnchorShift\" uuid NOT NULL, \"priority\" integer NOT NULL DEFAULT 0, CONSTRAINT \"PK_6699047479d5ddda194bbeb0322\" PRIMARY KEY (\"id\"))",
          "CREATE TABLE \"shift_rotation_rule_shifts\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"position\" integer NOT NULL, \"idRule\" uuid, \"idShift\" uuid, CONSTRAINT \"PK_b155282f17143d4082bbe3c2a50\" PRIMARY KEY (\"id\"))",
          "CREATE TABLE \"shifts\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"name\" varchar, \"code\" character, CONSTRAINT \"PK_84d692e367e4d6cdf045828768c\" PRIMARY KEY (\"id\"))",
          "CREATE TABLE \"pharmacies\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"name\" varchar, \"adress\" varchar, \"lat\" numeric(9,6), \"lng\" numeric(9,6), \"phone\" bigint, \"openingDays\" varchar, \"openingTime\" TIME, \"closingTime\" TIME, \"idShift\" uuid, CONSTRAINT \"PK_887410330080d3beb73850ebc8f\" PRIMARY KEY (\"id\"))",
          "CREATE TABLE \"categories\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"name\" varchar, CONSTRAINT \"PK_24dbc6126a28ff948da33e97d3b\" PRIMARY KEY (\"id\"))",
          "CREATE TYPE \"public\".\"products_unit_enum\" AS ENUM('ml', 'mg', 'g')",
          "CREATE TYPE \"public\".\"products_magnitude_enum\" AS ENUM('unit')",
          "CREATE TABLE \"products\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"name\" varchar, \"description\" varchar, \"price\" money, \"dose\" integer, \"unit\" \"public\".\"products_unit_enum\", \"quantity\" integer, \"magnitude\" \"public\".\"products_magnitude_enum\", \"active\" boolean NOT NULL, \"idLabo\" uuid, \"idPharmacy\" uuid, \"idCategory\" uuid, CONSTRAINT \"PK_0806c755e0aca124e67c0cf6d7d\" PRIMARY KEY (\"id\"))",
          "CREATE TABLE \"order_items\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"amount\" integer, \"price\" money, \"idOrder\" uuid, \"idProduct\" uuid, CONSTRAINT \"PK_005269d8574e6fac0493715c308\" PRIMARY KEY (\"id\"))",
          "CREATE TYPE \"public\".\"orders_state_enum\" AS ENUM('pending', 'preparing', 'cancelled', 'ready', 'delivered')",
          "CREATE TABLE \"orders\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"number\" SERIAL NOT NULL, \"date\" TIMESTAMP NOT NULL DEFAULT now(), \"totalPrice\" money, \"voidedAt\" TIMESTAMP, \"voidReason\" text, \"state\" \"public\".\"orders_state_enum\" NOT NULL DEFAULT 'pending', \"idCustomer\" uuid, \"voidedBy\" uuid, CONSTRAINT \"PK_710e2d4957aa5878dfe94e4ac2f\" PRIMARY KEY (\"id\"))",
          "CREATE TABLE \"customers\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"idUser\" uuid, \"idPerson\" uuid, \"idInsurancePlan\" uuid, CONSTRAINT \"PK_133ec679a801fab5e070f73d3ea\" PRIMARY KEY (\"id\"))",
          "CREATE TABLE \"people\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"name\" varchar, \"surname\" varchar, \"identification\" integer, CONSTRAINT \"PK_aa866e71353ee94c6cc51059c5b\" PRIMARY KEY (\"id\"))",
          "CREATE TABLE \"favourite_pharmacies\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"active\" boolean NOT NULL, \"idUser\" uuid, \"idPharmacy\" uuid, CONSTRAINT \"UQ_10cd2a7a5f39f40eab8fe19f0e2\" UNIQUE (\"idUser\", \"idPharmacy\"), CONSTRAINT \"PK_b7fd6a5bf4cc85f0ffd9ef5ad30\" PRIMARY KEY (\"id\"))",
          "CREATE TABLE \"users\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"username\" varchar NOT NULL, \"email\" varchar, \"password\" varchar NOT NULL, \"idRole\" uuid, \"idPerson\" uuid, \"idPharmacy\" uuid, CONSTRAINT \"UQ_fe0bb3f6520ee0469504521e710\" UNIQUE (\"username\"), CONSTRAINT \"UQ_97672ac88f789774dd47f7c8be3\" UNIQUE (\"email\"), CONSTRAINT \"PK_a3ffb1c0c8416b9fc6f907b7433\" PRIMARY KEY (\"id\"))",
          "CREATE TABLE \"audit_logs\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"userId\" uuid, \"pharmacyId\" uuid, \"action\" varchar(100) NOT NULL, \"entityType\" varchar(100) NOT NULL, \"entityId\" uuid, \"oldValues\" jsonb, \"newValues\" jsonb, \"metadata\" jsonb, \"ipAddress\" varchar(45), \"userAgent\" text, \"createdAt\" TIMESTAMPTZ NOT NULL DEFAULT now(), CONSTRAINT \"PK_1bb179d048bbc581caa3b013439\" PRIMARY KEY (\"id\"))",
          "CREATE INDEX \"IDX_audit_logs_entity\" ON \"audit_logs\" (\"entityType\", \"entityId\")",
          "CREATE INDEX \"IDX_audit_logs_actor_created\" ON \"audit_logs\" (\"userId\", \"createdAt\")",
          "ALTER TABLE \"role_permission\" ADD CONSTRAINT \"FK_a1789584ad25a0b20a8183ddd1d\" FOREIGN KEY (\"idRole\") REFERENCES \"roles\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION",
          "ALTER TABLE \"role_permission\" ADD CONSTRAINT \"FK_f34776ae884696e31dc6ee6be68\" FOREIGN KEY (\"idPermission\") REFERENCES \"permissions\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION",
          "ALTER TABLE \"insurance_plan\" ADD CONSTRAINT \"FK_084bafcf14db334cbe984c8f2cf\" FOREIGN KEY (\"idMedicalInsurance\") REFERENCES \"medical_insurance\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION",
          "ALTER TABLE \"shift_rotation_rule_shifts\" ADD CONSTRAINT \"FK_42b924f9219a48dad906baa3319\" FOREIGN KEY (\"idRule\") REFERENCES \"shift_rotation_rules\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION",
          "ALTER TABLE \"shift_rotation_rule_shifts\" ADD CONSTRAINT \"FK_5127d5c2cd2b7f4884f3587e89c\" FOREIGN KEY (\"idShift\") REFERENCES \"shifts\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION",
          "ALTER TABLE \"pharmacies\" ADD CONSTRAINT \"FK_eb44e3b3f8b6fdaf5af644d9dc3\" FOREIGN KEY (\"idShift\") REFERENCES \"shifts\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION",
          "ALTER TABLE \"products\" ADD CONSTRAINT \"FK_d7cbd09a383e639bc38f41c11de\" FOREIGN KEY (\"idLabo\") REFERENCES \"laboratories\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION",
          "ALTER TABLE \"products\" ADD CONSTRAINT \"FK_419f0c5d68983a55242dfcc9e5e\" FOREIGN KEY (\"idPharmacy\") REFERENCES \"pharmacies\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION",
          "ALTER TABLE \"products\" ADD CONSTRAINT \"FK_bfe0abe9481ee46c83d37de2a69\" FOREIGN KEY (\"idCategory\") REFERENCES \"categories\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION",
          "ALTER TABLE \"order_items\" ADD CONSTRAINT \"FK_b3d6dd400698a870f9bae722498\" FOREIGN KEY (\"idOrder\") REFERENCES \"orders\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION",
          "ALTER TABLE \"order_items\" ADD CONSTRAINT \"FK_3fa6c5f86e69939faf194711cb3\" FOREIGN KEY (\"idProduct\") REFERENCES \"products\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION",
          "ALTER TABLE \"orders\" ADD CONSTRAINT \"FK_6ce1f477de72fd7eba392341cd0\" FOREIGN KEY (\"idCustomer\") REFERENCES \"customers\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION",
          "ALTER TABLE \"orders\" ADD CONSTRAINT \"FK_49382b06ab16c5b464962068f24\" FOREIGN KEY (\"voidedBy\") REFERENCES \"users\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION",
          "ALTER TABLE \"customers\" ADD CONSTRAINT \"FK_55156bb5bf5456bb1267829f871\" FOREIGN KEY (\"idUser\") REFERENCES \"users\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION",
          "ALTER TABLE \"customers\" ADD CONSTRAINT \"FK_d7ea3c856ebd78181033d914c77\" FOREIGN KEY (\"idPerson\") REFERENCES \"people\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION",
          "ALTER TABLE \"customers\" ADD CONSTRAINT \"FK_0878a60afc5cc8734e766f296a4\" FOREIGN KEY (\"idInsurancePlan\") REFERENCES \"insurance_plan\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION",
          "ALTER TABLE \"favourite_pharmacies\" ADD CONSTRAINT \"FK_d319478035fed38dca47fba4781\" FOREIGN KEY (\"idUser\") REFERENCES \"users\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION",
          "ALTER TABLE \"favourite_pharmacies\" ADD CONSTRAINT \"FK_ac290face1211429fd911d5da2e\" FOREIGN KEY (\"idPharmacy\") REFERENCES \"pharmacies\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION",
          "ALTER TABLE \"users\" ADD CONSTRAINT \"FK_8adb072236d4ef4db52d8632c1a\" FOREIGN KEY (\"idRole\") REFERENCES \"roles\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION",
          "ALTER TABLE \"users\" ADD CONSTRAINT \"FK_a42e34423469b101443d9a6c87d\" FOREIGN KEY (\"idPerson\") REFERENCES \"people\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION",
          "ALTER TABLE \"users\" ADD CONSTRAINT \"FK_9354a60f46d5261fa45d95e87d0\" FOREIGN KEY (\"idPharmacy\") REFERENCES \"pharmacies\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION"
    ];
    for (const statement of statements) {
      await queryRunner.query(statement);
    }
  }

  async down(): Promise<void> {
    throw new Error('InitialSchema rollback is disabled to protect application data');
  }
}
