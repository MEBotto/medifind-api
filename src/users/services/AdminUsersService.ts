import bcrypt from 'bcrypt';
import AppDataSource from '@/data-source';
import { AppError } from '@/middleware/error.middleware';
import { User } from '@/users/models/User';
import { Role } from '@/roles/models/Role';
import { Pharmacy } from '@/pharmacies/models/Pharmacy';
import { AuditLog } from '@/audit/models/AuditLog';
import { AdminCreateUserDTO } from '../dtos/admin-user.dto';

export class AdminUsersService {
  async create(data: AdminCreateUserDTO, actorId: string): Promise<User> {
    return AppDataSource.transaction(async manager => {
      const users = manager.getRepository(User);
      if (await users.findOne({ where: [{ email: data.email }, { username: data.username }] })) {
        throw new AppError(409, 'Email or username already registered');
      }
      const role = await manager.getRepository(Role).findOneBy({ code: data.roleCode });
      if (!role) throw new AppError(400, 'Invalid role');
      const pharmacy = data.pharmacyId
        ? await manager.getRepository(Pharmacy).findOneBy({ id: data.pharmacyId }) : null;
      if (data.pharmacyId && !pharmacy) throw new AppError(404, 'Pharmacy not found');
      const user = await users.save(users.create({
        username: data.username, email: data.email,
        password: await bcrypt.hash(data.password, 12),
        role, pharmacy,
      }));
      await manager.getRepository(AuditLog).save(manager.getRepository(AuditLog).create({
        action: 'USER_CREATED', entityType: 'User', entityId: user.id,
        userId: actorId, pharmacyId: pharmacy?.id ?? null,
        metadata: { roleCode: role.code },
      }));
      return user;
    });
  }
}
