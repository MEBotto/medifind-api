import { Request, Response, CookieOptions } from 'express';
const name = 'medifind_refresh';
const options = (): CookieOptions => ({
  httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api/auth',
});
export function readRefreshCookie(req: Request): string | null {
  const match = (req.headers.cookie ?? '').split(';').map(v => v.trim()).find(v => v.startsWith(name + '='));
  const token = match?.slice(name.length + 1);
  return token && /^[a-f0-9]{64}$/.test(token) ? token : null;
}
export function setRefreshCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(name, token, { ...options(), expires: expiresAt });
}
export function clearRefreshCookie(res: Response) { res.clearCookie(name, options()); }
