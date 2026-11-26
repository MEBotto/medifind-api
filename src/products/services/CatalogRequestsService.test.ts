import { CatalogRequestsService } from './CatalogRequestsService';
import AppDataSource from '@/data-source';
import { CatalogRequestStatus, CatalogRequestType } from '../models/CatalogRequest';

jest.mock('@/data-source', () => ({ __esModule: true, default: { transaction: jest.fn(), getRepository: jest.fn() } }));

const service = new CatalogRequestsService();
const admin = { id: 'admin', role: 'ADMIN', pharmacyId: null };
const pharmacist = { id: 'pharmacist', role: 'PHARMACIST', pharmacyId: 'pharmacy' };
const makeRequest = (type = CatalogRequestType.LABORATORY, payload: Record<string, unknown> = { name: 'Acme' }) => ({
  id: 'request-1', type, payload, status: CatalogRequestStatus.PENDING,
  rejectionReason: null, reviewedAt: null, reviewedBy: null,
});
const setup = (request: ReturnType<typeof makeRequest>) => {
  const save = jest.fn(async (entity: unknown) => entity);
  const queryBuilder = {
    setLock: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(request),
  };
  const requesterQuery = { innerJoinAndSelect: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), getOne: jest.fn().mockResolvedValue({ requestedBy: { id: 'pharmacist' } }) };
  const repo = { createQueryBuilder: jest.fn().mockReturnValueOnce(queryBuilder).mockReturnValue(requesterQuery), save, findOne: jest.fn() };
  const catalogQuery = {
    where: jest.fn().mockReturnThis(), andWhere: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(), getOne: jest.fn().mockResolvedValue(null),
  };
  const namedRepo = { createQueryBuilder: jest.fn(() => catalogQuery) };
  const notificationSave = jest.fn(async (value: Record<string, unknown>) => ({
    ...value, id: 'notification-1',
  }));
  const manager = {
    getRepository: jest.fn((entity: { name: string }) =>
      entity.name === 'CatalogRequest' ? repo :
      entity.name === 'AuditLog' ? { save: jest.fn() } :
      entity.name === 'Notification' ? { save: notificationSave } : namedRepo),
    query: jest.fn().mockResolvedValue([]),
    save: jest.fn(async (_entity: unknown, value: unknown) => value),
    create: jest.fn((_entity: unknown, value: unknown) => value),
    findOneBy: jest.fn().mockResolvedValue(null),
  };
  (AppDataSource.transaction as jest.Mock).mockImplementation(async fn => fn(manager));
  return { manager, repo, queryBuilder, catalogQuery, notificationSave };
};

beforeEach(() => jest.clearAllMocks());

describe('CatalogRequestsService review authorization and consistency', () => {
  it('rejects pharmacy approval before opening a transaction', async () => {
    await expect(service.review('request-1', { decision: 'APPROVE' }, pharmacist))
      .rejects.toMatchObject({ statusCode: 403 });
    expect(AppDataSource.transaction).not.toHaveBeenCalled();
  });

  it('rejects an already approved request under the row lock', async () => {
    const request = makeRequest();
    request.status = CatalogRequestStatus.APPROVED;
    const { queryBuilder, manager } = setup(request);
    await expect(service.review(request.id, { decision: 'APPROVE' }, admin))
      .rejects.toMatchObject({ statusCode: 409 });
    expect(queryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
    expect(manager.query).not.toHaveBeenCalled();
  });

  it('rejects duplicate laboratories case-insensitively', async () => {
    const { catalogQuery, manager } = setup(makeRequest());
    catalogQuery.getOne.mockResolvedValueOnce({ id: 'existing' });
    await expect(service.review('request-1', { decision: 'APPROVE' }, admin))
      .rejects.toMatchObject({ statusCode: 409 });
    expect(manager.query).toHaveBeenCalledWith('SELECT pg_advisory_xact_lock($1)', [74321001]);
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('requires approval of a related laboratory before product approval', async () => {
    const { repo, manager } = setup(makeRequest(CatalogRequestType.PRODUCT, {
      name: 'Product', parentRequestId: '11111111-1111-4111-8111-111111111111',
    }));
    repo.findOne.mockResolvedValue({ type: CatalogRequestType.LABORATORY, status: CatalogRequestStatus.PENDING });
    await expect(service.review('request-1', { decision: 'APPROVE' }, admin))
      .rejects.toMatchObject({ statusCode: 409 });
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('rejects a duplicate product identity without a barcode', async () => {
    const { catalogQuery, manager } = setup(makeRequest(CatalogRequestType.PRODUCT, { name: 'Product' }));
    catalogQuery.getOne.mockResolvedValueOnce({ id: 'existing-product' });
    await expect(service.review('request-1', { decision: 'APPROVE' }, admin))
      .rejects.toMatchObject({ statusCode: 409 });
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('records a rejection reason without creating a catalog entity', async () => {
    const { repo, manager, notificationSave } = setup(makeRequest());
    const result = await service.review('request-1', { decision: 'REJECT', reason: 'Duplicate' }, admin);
    expect(result.status).toBe(CatalogRequestStatus.REJECTED);
    expect(result.rejectionReason).toBe('Duplicate');
    expect(repo.save).toHaveBeenCalled();
    expect(notificationSave).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'pharmacist', type: 'CATALOG_REQUEST_REJECTED', catalogRequestId: 'request-1',
    }));
    expect(manager.query).toHaveBeenCalledWith('SELECT pg_notify($1, $2)', [
      'medifind_notifications', JSON.stringify({ id: 'notification-1', userId: 'pharmacist' }),
    ]);
  });
});
