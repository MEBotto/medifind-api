import UsersRepository from '../repositories/UsersRepository';
import { CreateUserDTO, UpdateUserDTO } from '../dtos/user.dto';
import { User } from '../models/User';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';
import bcrypt from 'bcrypt';

class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(userData: CreateUserDTO): Promise<User> {
    try {
      const existingUser = await this.usersRepository.findByEmail(userData.email);
      if (existingUser) throw new AppError(409, 'Email is already registered');
      const existingUsername = await this.usersRepository.findByUsername(userData.username);
      if (existingUsername) throw new AppError(409, 'Username is already taken');

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await this.usersRepository.create({
        ...userData,
        password: hashedPassword,
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

  async updateUser(id: string, userData: UpdateUserDTO): Promise<User> {
    try {
      const user = await this.usersRepository.findById(id);
      if (!user) throw new AppError(404, 'User not found');

      if (userData.email && userData.email !== user.email) {
        const existingUser = await this.usersRepository.findByEmail(userData.email);
        if (existingUser) throw new AppError(409, 'Email is already registered');
      }
      if (userData.username && userData.username !== user.username) {
        const existingUsername = await this.usersRepository.findByUsername(userData.username);
        if (existingUsername) throw new AppError(409, 'Username is already taken');
      }
      const updates = {
        ...userData,
        ...(userData.password ? { password: await bcrypt.hash(userData.password, 10) } : {}),
      };
      const updatedUser = await this.usersRepository.update(id, updates);
      return updatedUser;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to update user:', error);
      throw new AppError(500, 'Failed to update user');
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const user = await this.usersRepository.findById(id);
      if (!user) throw new AppError(404, 'User not found');
      await this.usersRepository.delete(id);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to delete user:', error);
      throw new AppError(500, 'Failed to delete user');
    }
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
