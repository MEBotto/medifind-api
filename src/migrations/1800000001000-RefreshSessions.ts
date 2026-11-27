import { MigrationInterface, QueryRunner } from 'typeorm';
export class RefreshSessions1800000001000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query('CREATE TABLE refresh_sessions (id uuid PRIMARY KEY, "familyId" uuid NOT NULL, "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, "tokenHash" varchar(64) NOT NULL UNIQUE, "expiresAt" timestamptz NOT NULL, "revokedAt" timestamptz NULL)');
    await q.query('CREATE INDEX refresh_sessions_family_idx ON refresh_sessions ("familyId")');
    await q.query('CREATE INDEX refresh_sessions_user_idx ON refresh_sessions ("userId")');
  }
  async down(q: QueryRunner): Promise<void> { await q.query('DROP TABLE refresh_sessions'); }
}
