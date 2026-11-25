import UsersRepository from '../repositories/UsersRepository';
import { CreateUserDTO, UpdateUserDTO } from '../dtos/user.dto';
import { User } from '../models/User';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';
import bcrypt from 'bcrypt';
import AppDataSource from '@/data-source';
import { Role } from '@/roles/models/Role';
import { AuditLog } from '@/audit/models/AuditLog';

class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /** Public registration never accepts a client-supplied role or pharmacy. */
  async registerCustomer(userData: CreateUserDTO): Promise<User> {
    const customerRole = await AppDataSource.getRepository(Role).findOneBy({ code: 'CUSTOMER' });
    if (!customerRole) throw new AppError(503, 'Customer registration is not configured');
    return this.createUser(userData, customerRole);
  }

  async createUser(userData: CreateUserDTO, role?: Role): Promise<User> {
    try {
      const existingUser = await this.usersRepository.findByEmail(userData.email);
      if (existingUser) throw new AppError(409, 'Email is already registered');
      const existingUsername = await this.usersRepository.findByUsername(userData.username);
      if (existingUsername) throw new AppError(409, 'Username is already taken');

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await this.usersRepository.create({
        ...userData,
        password: hashedPassword,
        ...(role ? { role } : {}),
      });
      logger.info('User created successfully');
      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to create user:', error);
      throw new AppError(500, 'Failed to create user');
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const user = await this.usersRepository.findById(id);
      if (!user) throw new AppError(404, 'User not found');
      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to get user:', error);
      throw new AppError(500, 'Failed to get user');
    }
  }

  /** Updates a user and writes the audit event in the same transaction. */
  async updateUser(id: string, userData: UpdateUserDTO, actorId: string): Promise<User> {
    return AppDataSource.transaction(async manager => {
      const repository = manager.getRepository(User);
      const user = await repository.findOne({ where: { id }, relations: { role: true, pharmacy: true } });
      if (!user) throw new AppError(404, 'User not found');

      if (userData.email && userData.email !== user.email &&
          await repository.findOneBy({ email: userData.email })) {
        throw new AppError(409, 'Email is already registered');
      }
      if (userData.username && userData.username !== user.username &&
          await repository.findOneBy({ username: userData.username })) {
        throw new AppError(409, 'Username is already taken');
      }

      const before = { username: user.username, email: user.email };
      const { password, ...safeFields } = userData;
      Object.assign(user, safeFields);
      if (password) user.password = await bcrypt.hash(password, 12);
      const updated = await repository.save(user);
      const logs = manager.getRepository(AuditLog);
      await logs.save(logs.create({
        action: 'USER_UPDATED', entityType: 'User', entityId: id,
        userId: actorId, pharmacyId: user.pharmacy?.id ?? null,
        oldValues: before,
        newValues: { username: updated.username, email: updated.email },
        metadata: { passwordChanged: Boolean(password) },
      }));
      return updated;
    });
  }

  /** Deletes a user and audits the deletion atomically. */
  async deleteUser(id: string, actorId: string): Promise<void> {
    await AppDataSource.transaction(async manager => {
      const repository = manager.getRepository(User);
      const user = await repository.findOne({ where: { id }, relations: { role: true, pharmacy: true } });
      if (!user) throw new AppError(404, 'User not found');
      if (id === actorId) throw new AppError(403, 'Administrators cannot delete their own account');

      const logs = manager.getRepository(AuditLog);
      await logs.save(logs.create({
        action: 'USER_DELETED', entityType: 'User', entityId: id,
        userId: actorId, pharmacyId: user.pharmacy?.id ?? null,
        oldValues: { username: user.username, email: user.email, roleCode: user.role?.code ?? null },
      }));
      await repository.remove(user);
    });
  }

  async authenticateUser(email: string, password: string): Promise<User> {
    try {
      const user = await this.usersRepository.verifyCredentials(email, password);
      if (!user) throw new AppError(401, 'Invalid email or password');
      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Authentication failed:', error);
      throw new AppError(500, 'Authentication failed');
    }
  }
}

export default UsersService;
