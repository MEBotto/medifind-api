const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src');

const getRepoTemplate = (domainPath, entityName, dtoPrefix) => {
  const collectionName = entityName.toLowerCase() + 's';
  const repoName = entityName + 'sRepository';
  
  return `import { Repository } from 'typeorm';
import { ${entityName} } from '../models/${entityName}';
import AppDataSource from '@/data-source';
import { Create${dtoPrefix}DTO, Update${dtoPrefix}DTO } from '../dtos/${dtoPrefix.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class ${repoName} {
  private ormRepository: Repository<${entityName}>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(${entityName});
  }

  async create(data: Create${dtoPrefix}DTO): Promise<${entityName}> {
    try {
      const entity = this.ormRepository.create(data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      logger.error('Error al crear ${entityName}:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async findById(id: string): Promise<${entityName} | null> {
    try {
      return await this.ormRepository.findOne({ where: { id } as any });
    } catch (error) {
      logger.error(\`Error al buscar ${entityName} \${id}:\`, error);
      throw new AppError(500, 'Error al buscar la entidad');
    }
  }

  async findAll(): Promise<${entityName}[]> {
    try {
      return await this.ormRepository.find();
    } catch (error) {
      logger.error('Error al buscar ${collectionName}:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async update(id: string, data: Update${dtoPrefix}DTO): Promise<${entityName}> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, '${entityName} no encontrado');
      }

      Object.assign(entity, data);
      return await this.ormRepository.save(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(\`Error al actualizar ${entityName} \${id}:\`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new AppError(404, '${entityName} no encontrado');
      }

      await this.ormRepository.remove(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(\`Error al eliminar ${entityName} \${id}:\`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default ${repoName};
`;
};

const dtosData = {
  roles: [
    { model: 'Role', dto: 'Role' },
    { model: 'Permission', dto: 'Permission' },
    { model: 'RolePermission', dto: 'RolePermission', noDto: true } 
  ],
  shifts: [
    { model: 'Shift', dto: 'Shift' },
    { model: 'ShiftRotationRule', dto: 'ShiftRotationRule' },
    { model: 'ShiftRotationRuleShift', dto: 'ShiftRotationRuleShift', noDto: true } 
  ],
  pharmacies: [
    { model: 'Pharmacy', dto: 'Pharmacy' }
  ],
  orders: [
    { model: 'Order', dto: 'Order' },
    { model: 'OrderItem', dto: 'OrderItem' }
  ],
  customers: [
    { model: 'Customer', dto: 'Customer' },
    { model: 'Person', dto: 'Person' },
    { model: 'InsurancePlan', dto: 'InsurancePlan' },
    { model: 'MedicalInsurance', dto: 'MedicalInsurance' }
  ],
  products: [
    { model: 'Product', dto: 'Product' },
    { model: 'Category', dto: 'Category' },
    { model: 'Laboratory', dto: 'Laboratory' }
  ],
  users: [
    { model: 'FavouritePharmacy', dto: 'FavouritePharmacy' }
  ]
};

try {
  for (const domain of Object.keys(dtosData)) {
    const domainReposPath = path.join(srcPath, domain, 'repositories');
    if (!fs.existsSync(domainReposPath)) {
      fs.mkdirSync(domainReposPath, { recursive: true });
    }
    
    for (const item of dtosData[domain]) {
      const { model, dto, noDto } = item;
      
      let repoContent = "";
      if (noDto) {
         repoContent = `import { Repository } from 'typeorm';
import { ${model} } from '../models/${model}';
import AppDataSource from '@/data-source';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class ${model}sRepository {
  private ormRepository: Repository<${model}>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(${model});
  }

  async findById(id: string): Promise<${model} | null> {
    try {
      return await this.ormRepository.findOne({ where: { id } as any });
    } catch (error) {
      logger.error(\`Error al buscar ${model} \${id}:\`, error);
      throw new AppError(500, 'Error al buscar la entidad');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const entity = await this.findById(id);
      if (!entity) throw new AppError(404, '${model} no encontrado');
      await this.ormRepository.remove(entity);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(\`Error al eliminar ${model} \${id}:\`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default ${model}sRepository;
`;
      } else {
         repoContent = getRepoTemplate(domain, model, dto);
      }
      
      const fileName = `${model}sRepository.ts`; 
      const filePath = path.join(domainReposPath, fileName);
      fs.writeFileSync(filePath, repoContent);
      console.log('Created: ' + filePath);
    }
  }
} catch (e) {
  console.error(e);
}
