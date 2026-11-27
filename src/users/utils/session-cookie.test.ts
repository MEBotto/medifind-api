import { Request, Response } from 'express';
import { readRefreshCookie, setRefreshCookie } from './session-cookie';
import { hashRefreshToken } from '../services/RefreshSessionService';
describe('refresh token helpers', () => {
  it('accepts only a correctly shaped refresh cookie', () => {
    const token = 'a'.repeat(64);
    expect(readRefreshCookie({ headers: { cookie: 'other=x; medifind_refresh=' + token } } as Request)).toBe(token);
    expect(readRefreshCookie({ headers: { cookie: 'medifind_refresh=bad' } } as Request)).toBeNull();
  });
  it('sets an HttpOnly strict cookie', () => {
    const cookie = jest.fn();
    const expiry = new Date();
    setRefreshCookie({ cookie } as unknown as Response, 'a'.repeat(64), expiry);
    expect(cookie).toHaveBeenCalledWith('medifind_refresh', 'a'.repeat(64), expect.objectContaining({ httpOnly: true, sameSite: 'strict', path: '/api/auth', expires: expiry }));
  });
  it('hashes refresh tokens deterministically', () => {
    expect(hashRefreshToken('test')).toMatch(/^[a-f0-9]{64}$/);
    expect(hashRefreshToken('test')).not.toBe(hashRefreshToken('other'));
  });
});
