const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src');

const getServiceTemplate = (domainPath, entityName, dtoPrefix) => {
  const serviceName = entityName + 'sService';
  const repoName = entityName + 'sRepository';
  const variableRepoName = repoName.charAt(0).toLowerCase() + repoName.slice(1);
  const variableEntityName = entityName.charAt(0).toLowerCase() + entityName.slice(1);
  
  return `import ${repoName} from '../repositories/${repoName}';
import { Create${dtoPrefix}DTO, Update${dtoPrefix}DTO } from '../dtos/${dtoPrefix.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}.dto';
import { ${entityName} } from '../models/${entityName}';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class ${serviceName} {
  constructor(
    private readonly ${variableRepoName}: ${repoName}
  ) {}

  async create${entityName}(data: Create${dtoPrefix}DTO): Promise<${entityName}> {
    try {
      const entity = await this.${variableRepoName}.create(data);
      logger.info('${entityName} creado exitosamente');
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error al crear ${entityName}:', error);
      throw new AppError(500, 'Error al crear la entidad');
    }
  }

  async get${entityName}ById(id: string): Promise<${entityName}> {
    try {
      const entity = await this.${variableRepoName}.findById(id);
      if (!entity) {
        throw new AppError(404, '${entityName} no encontrado');
      }
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(\`Error al obtener ${entityName} \${id}:\`, error);
      throw new AppError(500, 'Error al obtener la entidad');
    }
  }

  async getAll${entityName}s(): Promise<${entityName}[]> {
    try {
      return await this.${variableRepoName}.findAll();
    } catch (error) {
      logger.error('Error al listar ${entityName}s:', error);
      throw new AppError(500, 'Error al listar las entidades');
    }
  }

  async update${entityName}(id: string, data: Update${dtoPrefix}DTO): Promise<${entityName}> {
    try {
      const updatedEntity = await this.${variableRepoName}.update(id, data);
      logger.info(\`${entityName} actualizado: \${id}\`);
      return updatedEntity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(\`Error al actualizar ${entityName} \${id}:\`, error);
      throw new AppError(500, 'Error al actualizar la entidad');
    }
  }

  async delete${entityName}(id: string): Promise<void> {
    try {
      await this.${variableRepoName}.delete(id);
      logger.info(\`${entityName} eliminado: \${id}\`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(\`Error al eliminar ${entityName} \${id}:\`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default ${serviceName};
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
    const domainServicesPath = path.join(srcPath, domain, 'services');
    if (!fs.existsSync(domainServicesPath)) {
      fs.mkdirSync(domainServicesPath, { recursive: true });
    }
    
    for (const item of dtosData[domain]) {
      const { model, dto, noDto } = item;
      
      let serviceContent = "";
      if (noDto) {
         // minimal service wrapper for join tables
         serviceContent = `import ${model}sRepository from '../repositories/${model}sRepository';
import { ${model} } from '../models/${model}';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';

class ${model}sService {
  constructor(
    private readonly repository: ${model}sRepository
  ) {}

  async getById(id: string): Promise<${model}> {
    try {
      const entity = await this.repository.findById(id);
      if (!entity) throw new AppError(404, '${model} no encontrado');
      return entity;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(\`Error al obtener ${model} \${id}:\`, error);
      throw new AppError(500, 'Error al obtener la entidad');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
      logger.info(\`${model} eliminado: \${id}\`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(\`Error al eliminar ${model} \${id}:\`, error);
      throw new AppError(500, 'Error al eliminar la entidad');
    }
  }
}

export default ${model}sService;
`;
      } else {
         serviceContent = getServiceTemplate(domain, model, dto);
      }
      
      const fileName = `${model}sService.ts`; 
      const filePath = path.join(domainServicesPath, fileName);
      fs.writeFileSync(filePath, serviceContent);
      console.log('Created: ' + filePath);
    }
  }
} catch (e) {
  console.error(e);
}
