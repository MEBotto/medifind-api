const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src');

const getControllerTemplate = (domainPath, entityName, dtoPrefix) => {
  const serviceName = entityName + 'sService';
  const controllerName = entityName + 'sController';
  const variableServiceName = serviceName.charAt(0).toLowerCase() + serviceName.slice(1);
  const variableEntityName = entityName.charAt(0).toLowerCase() + entityName.slice(1);
  
  return `import { Request, Response } from 'express';
import ${serviceName} from '../services/${serviceName}';
import { Create${dtoPrefix}DTO, Update${dtoPrefix}DTO } from '../dtos/${dtoPrefix.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}.dto';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';
import { sendSuccess, sendCreated, sendError } from '@/utils/api.utils';

class ${controllerName} {
  constructor(private readonly ${variableServiceName}: ${serviceName}) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body as Create${dtoPrefix}DTO;
      const entity = await this.${variableServiceName}.create${entityName}(data);
      sendCreated(res, entity, '${entityName} creado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode, error.validationErrors);
        return;
      }
      logger.error('Error en create ${entityName}:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const entity = await this.${variableServiceName}.get${entityName}ById(id);
      sendSuccess(res, entity);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en getById ${entityName}:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const entities = await this.${variableServiceName}.getAll${entityName}s();
      sendSuccess(res, entities);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en getAll ${entityName}s:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body as Update${dtoPrefix}DTO;
      const entity = await this.${variableServiceName}.update${entityName}(id, data);
      sendSuccess(res, entity, '${entityName} actualizado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en update ${entityName}:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.${variableServiceName}.delete${entityName}(id);
      sendSuccess(res, null, '${entityName} eliminado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en delete ${entityName}:', error);
      sendError(res, 'Error interno del servidor');
    }
  };
}

export default ${controllerName};
`;
};

const getRouterTemplate = (domainPath, entityName, dtoPrefix) => {
  const serviceName = entityName + 'sService';
  const controllerName = entityName + 'sController';
  const repoName = entityName + 'sRepository';
  
  return `import { Router } from 'express';
import ${controllerName} from '../controllers/${controllerName}';
import ${repoName} from '../repositories/${repoName}';
import ${serviceName} from '../services/${serviceName}';
import { validate } from '@/middleware/validation.middleware';
import { authenticateJWT } from '@/middleware/auth.middleware';
import { Create${dtoPrefix}Schema, Update${dtoPrefix}Schema } from '../dtos/${dtoPrefix.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}.dto';

const router = Router();

const repository = new ${repoName}();
const service = new ${serviceName}(repository);
const controller = new ${controllerName}(service);

router.post('/', authenticateJWT, validate(Create${dtoPrefix}Schema), controller.create);
router.get('/', authenticateJWT, controller.getAll);
router.get('/:id', authenticateJWT, controller.getById);
router.put('/:id', authenticateJWT, validate(Update${dtoPrefix}Schema), controller.update);
router.delete('/:id', authenticateJWT, controller.delete);

export default router;
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
    { model: 'FavouritePharmacy', dto: 'FavouritePharmacy', isUsersPath: true }
  ]
};

try {
  let masterRouterImports = [];
  let masterRouterUses = [];

  for (const domain of Object.keys(dtosData)) {
    const domainControllersPath = path.join(srcPath, domain, 'controllers');
    const domainRoutesPath = path.join(srcPath, domain, 'routes');

    if (!fs.existsSync(domainControllersPath)) fs.mkdirSync(domainControllersPath, { recursive: true });
    if (!fs.existsSync(domainRoutesPath)) fs.mkdirSync(domainRoutesPath, { recursive: true });
    
    // We aggregate all routers inside each domain into a domain index router, or just link them directly in master index router.
    // For simplicity, we will link them directly in the master router.
    for (const item of dtosData[domain]) {
      const { model, dto, noDto, isUsersPath } = item;
      
      const fileNameController = `${model}sController.ts`; 
      const filePathController = path.join(domainControllersPath, fileNameController);
      
      let controllerContent = "";
      if (noDto) {
         controllerContent = `import { Request, Response } from 'express';
import ${model}sService from '../services/${model}sService';
import { AppError } from '@/middleware/error.middleware';
import { logger } from '@/utils/logger';
import { sendSuccess, sendError } from '@/utils/api.utils';

class ${model}sController {
  constructor(private readonly service: ${model}sService) {}

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const entity = await this.service.getById(id);
      sendSuccess(res, entity);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en getById ${model}:', error);
      sendError(res, 'Error interno del servidor');
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.delete(id);
      sendSuccess(res, null, '${model} eliminado exitosamente');
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.message, error.statusCode);
        return;
      }
      logger.error('Error en delete ${model}:', error);
      sendError(res, 'Error interno del servidor');
    }
  };
}

export default ${model}sController;
`;
      } else {
         controllerContent = getControllerTemplate(domain, model, dto);
      }
      fs.writeFileSync(filePathController, controllerContent);
      console.log('Created: ' + filePathController);

      // Now the Router
      const fileNameRouter = `${model.toLowerCase()}s.routes.ts`;
      const filePathRouter = path.join(domainRoutesPath, fileNameRouter);
      
      let routerContent = "";
      if (noDto) {
         routerContent = `import { Router } from 'express';
import ${model}sController from '../controllers/${model}sController';
import ${model}sRepository from '../repositories/${model}sRepository';
import ${model}sService from '../services/${model}sService';
import { authenticateJWT } from '@/middleware/auth.middleware';

const router = Router();

const repository = new ${model}sRepository();
const service = new ${model}sService(repository);
const controller = new ${model}sController(service);

router.get('/:id', authenticateJWT, controller.getById);
router.delete('/:id', authenticateJWT, controller.delete);

export default router;
`;
      } else {
         routerContent = getRouterTemplate(domain, model, dto);
      }
      fs.writeFileSync(filePathRouter, routerContent);
      console.log('Created: ' + filePathRouter);

      // Add to master router arrays
      const routeVariable = `${model.charAt(0).toLowerCase() + model.slice(1)}Routes`;
      masterRouterImports.push(`import ${routeVariable} from '@/${domain}/routes/${fileNameRouter.replace('.ts', '')}';`);
      masterRouterUses.push(`router.use('/${model.toLowerCase()}s', ${routeVariable});`);
    }
  }

  // Update Master Express Router
  const masterRouterPath = path.join(srcPath, 'routes', 'index.ts');
  const masterRouterContent = `import { Router } from 'express';
import userRoutes from '@/users/routes/users.routes';
import authRoutes from '@/users/routes/auth.routes';
${masterRouterImports.join('\n')}

const router = Router();

// Rutas principales
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Domain Routes
${masterRouterUses.join('\n')}

export default router;
`;
  
  fs.writeFileSync(masterRouterPath, masterRouterContent);
  console.log('Updated: ' + masterRouterPath);

} catch (e) {
  console.error(e);
}
