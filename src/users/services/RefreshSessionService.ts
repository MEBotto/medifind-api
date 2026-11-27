import { randomBytes, randomUUID, createHash } from 'crypto';
import { EntityManager } from 'typeorm';
import AppDataSource from '@/data-source';
import { RefreshSession } from '../models/RefreshSession';
import { User } from '../models/User';
import { AppError } from '@/middleware/error.middleware';

export const hashRefreshToken = (token: string) => createHash('sha256').update(token).digest('hex');
export function duration(name: string, fallback: number, max: number): number {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isSafeInteger(value) || value < 1 || value > max) throw new Error('Invalid ' + name);
  return value;
}
export class RefreshSessionService {
  private async issue(manager: EntityManager, userId: string, familyId: string, expiresAt: Date) {
    const token = randomBytes(32).toString('hex');
    await manager.getRepository(RefreshSession).save({
      id: randomUUID(), familyId, userId, tokenHash: hashRefreshToken(token), expiresAt, revokedAt: null,
    });
    return { token, expiresAt };
  }
  async create(userId: string) {
    const expiresAt = new Date(Date.now() + duration('REFRESH_TOKEN_DAYS', 7, 90) * 86400000);
    return AppDataSource.transaction(manager => this.issue(manager, userId, randomUUID(), expiresAt));
  }
  private async lockFamily(manager: EntityManager, token: string) {
    const repo = manager.getRepository(RefreshSession);
    const found = await repo.findOneBy({ tokenHash: hashRefreshToken(token) });
    if (!found) return null;
    await manager.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [found.familyId]);
    return repo.findOneBy({ id: found.id });
  }
  async rotate(token: string) {
    const result = await AppDataSource.transaction(async manager => {
      const row = await this.lockFamily(manager, token);
      if (!row) return null;
      const repo = manager.getRepository(RefreshSession);
      if (row.revokedAt) {
        await repo.update({ familyId: row.familyId }, { revokedAt: new Date() });
        return null; // Commit revocation before returning 401.
      }
      if (row.expiresAt.getTime() <= Date.now()) return null;
      const user = await manager.getRepository(User).findOne({ where: { id: row.userId }, relations: { role: true } });
      if (!user) return null;
      await repo.update(row.id, { revokedAt: new Date() });
      return { user, ...await this.issue(manager, row.userId, row.familyId, row.expiresAt) };
    });
    if (!result) throw new AppError(401, 'Invalid or expired session');
    return result;
  }
  async revoke(token: string) {
    await AppDataSource.transaction(async manager => {
      const row = await this.lockFamily(manager, token);
      if (row) await manager.getRepository(RefreshSession).update({ familyId: row.familyId }, { revokedAt: new Date() });
    });
  }
}
