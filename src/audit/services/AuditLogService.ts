import { EntityManager } from 'typeorm';
import AppDataSource from '@/data-source';
import { AuditLog } from '../models/AuditLog';

export type AuditEvent = Pick<AuditLog, 'action' | 'entityType'> &
  Partial<Pick<AuditLog, 'userId' | 'pharmacyId' | 'entityId' | 'oldValues' | 'newValues' | 'metadata' | 'ipAddress' | 'userAgent'>>;

/** Pass the business transaction's manager to guarantee atomic auditing. */
export class AuditLogService {
  async record(event: AuditEvent, manager: EntityManager = AppDataSource.manager): Promise<AuditLog> {
    const repo = manager.getRepository(AuditLog);
    return repo.save(repo.create(event));
  }
}
