import { Repository } from 'typeorm';
import { User } from '../models/User';
import AppDataSource from '@/data-source';
import { CreateUserDTO, UpdateUserDTO } from '../dtos/user.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';
import bcrypt from 'bcrypt';

class UsersRepository {
  private ormRepository: Repository<User>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(User);
  }

  async create(userData: CreateUserDTO): Promise<User> {
    try {
      const user = this.ormRepository.create(userData);
      return await this.ormRepository.save(user);
    } catch (error) {
      logger.error('Failed to create user:', error);
      throw new AppError(500, 'Failed to create user');
    }
  }

  async findById(id: string): Promise<User | null> {
    return this.ormRepository.findOne({ where: { id }, relations: { role: true } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.ormRepository.findOne({ where: { email }, relations: { role: true } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.ormRepository.findOne({ where: { username }, relations: { role: true } });
  }

  async verifyCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const isPasswordValid = await bcrypt.compare(password, user.password);
    return isPasswordValid ? user : null;
  }

  async update(id: string, userData: UpdateUserDTO): Promise<User> {
    try {
      const user = await this.findById(id);
      if (!user) throw new AppError(404, 'User not found');
      Object.assign(user, userData);
      return await this.ormRepository.save(user);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to update user:', error);
      throw new AppError(500, 'Failed to update user');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const user = await this.findById(id);
      if (!user) throw new AppError(404, 'User not found');
      await this.ormRepository.remove(user);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to delete user:', error);
      throw new AppError(500, 'Failed to delete user');
    }
  }
}

export default UsersRepository;
