import { toPublicUser } from './public-user';
import { User } from '../models/User';

describe('toPublicUser', () => {
  it('never exposes the password hash or private relations', () => {
    const user = {
      id: 'user-1',
      username: 'tester',
      email: 'tester@example.com',
      password: '$2b$10$secret-hash',
      customers: [{ id: 'private-customer' }],
    } as unknown as User;

    expect(toPublicUser(user)).toEqual({
      id: 'user-1',
      username: 'tester',
      email: 'tester@example.com',
      role: null,
    });
    expect(JSON.stringify(toPublicUser(user))).not.toContain('password');
    expect(JSON.stringify(toPublicUser(user))).not.toContain('private-customer');
  });

  it('uses the stable role code when loaded', () => {
    const user = { id: '1', username: 'a', email: 'a@b.com', role: { code: 'ADMIN', name: 'Administrador' } } as User;
    expect(toPublicUser(user).role).toBe('ADMIN');
  });
});
