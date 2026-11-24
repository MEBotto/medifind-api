import { User } from '../models/User';

/** Explicit allowlist: never serialize credentials or internal relations. */
export const toPublicUser = (user: User) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role?.name ?? null,
});
