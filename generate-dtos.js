const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src');

const dtosData = {
  roles: {
    dtos: {
      'role.dto.ts': `import { z } from 'zod';

export const CreateRoleSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export const UpdateRoleSchema = CreateRoleSchema.partial();

export type CreateRoleDTO = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleDTO = z.infer<typeof UpdateRoleSchema>;
`,
      'permission.dto.ts': `import { z } from 'zod';

export const CreatePermissionSchema = z.object({
  code: z.string().min(1, 'El código es obligatorio'),
  description: z.string().optional(),
});

export const UpdatePermissionSchema = CreatePermissionSchema.partial();

export type CreatePermissionDTO = z.infer<typeof CreatePermissionSchema>;
export type UpdatePermissionDTO = z.infer<typeof UpdatePermissionSchema>;
`
    }
  },
  shifts: {
    dtos: {
      'shift.dto.ts': `import { z } from 'zod';

export const CreateShiftSchema = z.object({
  name: z.string().optional(),
  code: z.string().max(1, 'El código debe ser de 1 caracter').optional(),
});

export const UpdateShiftSchema = CreateShiftSchema.partial();

export type CreateShiftDTO = z.infer<typeof CreateShiftSchema>;
export type UpdateShiftDTO = z.infer<typeof UpdateShiftSchema>;
`,
      'shift-rotation-rule.dto.ts': `import { z } from 'zod';

export const CreateShiftRotationRuleSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  year: z.number().int().optional().nullable(),
  months: z.array(z.number().int().min(1).max(12)).min(1, 'Debe haber al menos un mes'),
  anchorDay: z.number().int().default(1),
  idAnchorShift: z.string().uuid('ID de turno ancla inválido'),
  priority: z.number().int().default(0),
});

export const UpdateShiftRotationRuleSchema = CreateShiftRotationRuleSchema.partial();

export type CreateShiftRotationRuleDTO = z.infer<typeof CreateShiftRotationRuleSchema>;
export type UpdateShiftRotationRuleDTO = z.infer<typeof UpdateShiftRotationRuleSchema>;
`
    }
  },
  pharmacies: {
    dtos: {
      'pharmacy.dto.ts': `import { z } from 'zod';

export const CreatePharmacySchema = z.object({
  name: z.string().optional(),
  adress: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  phone: z.number().int().optional().or(z.string().regex(/^\\d+$/).transform(Number)),
  openingDays: z.string().optional(),
  openingTime: z.string().optional(), // Expected 'HH:mm:ss'
  closingTime: z.string().optional(), // Expected 'HH:mm:ss'
  idShift: z.string().uuid().optional().nullable(),
});

export const UpdatePharmacySchema = CreatePharmacySchema.partial();

export type CreatePharmacyDTO = z.infer<typeof CreatePharmacySchema>;
export type UpdatePharmacyDTO = z.infer<typeof UpdatePharmacySchema>;
`
    }
  },
  orders: {
    dtos: {
      'order.dto.ts': `import { z } from 'zod';
import { OrderState } from '../models/Order';

export const CreateOrderSchema = z.object({
  idCustomer: z.string().uuid().optional().nullable(),
  totalPrice: z.number().optional(),
  state: z.nativeEnum(OrderState).default(OrderState.PENDING),
});

export const VoidOrderSchema = z.object({
  voidReason: z.string().min(1, 'Se requiere un motivo de anulación'),
  voidedBy: z.string().uuid('ID de usuario inválido'),
});

export const UpdateOrderSchema = CreateOrderSchema.partial();

export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderDTO = z.infer<typeof UpdateOrderSchema>;
export type VoidOrderDTO = z.infer<typeof VoidOrderSchema>;
`,
      'order-item.dto.ts': `import { z } from 'zod';

export const CreateOrderItemSchema = z.object({
  idOrder: z.string().uuid().optional().nullable(),
  idProduct: z.string().uuid().optional().nullable(),
  amount: z.number().int().positive().optional(),
  price: z.number().positive().optional(),
});

export const UpdateOrderItemSchema = CreateOrderItemSchema.partial();

export type CreateOrderItemDTO = z.infer<typeof CreateOrderItemSchema>;
export type UpdateOrderItemDTO = z.infer<typeof UpdateOrderItemSchema>;
`
    }
  },
  customers: {
    dtos: {
      'customer.dto.ts': `import { z } from 'zod';

export const CreateCustomerSchema = z.object({
  idUser: z.string().uuid().optional().nullable(),
  idPerson: z.string().uuid('ID de persona inválido'),
  idInsurancePlan: z.string().uuid().optional().nullable(),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();

export type CreateCustomerDTO = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerDTO = z.infer<typeof UpdateCustomerSchema>;
`,
      'person.dto.ts': `import { z } from 'zod';

export const CreatePersonSchema = z.object({
  name: z.string().optional(),
  surname: z.string().optional(),
  identification: z.number().int().optional(),
});

export const UpdatePersonSchema = CreatePersonSchema.partial();

export type CreatePersonDTO = z.infer<typeof CreatePersonSchema>;
export type UpdatePersonDTO = z.infer<typeof UpdatePersonSchema>;
`,
      'insurance-plan.dto.ts': `import { z } from 'zod';

export const CreateInsurancePlanSchema = z.object({
  description: z.string().optional(),
  active: z.boolean().optional(),
  idMedicalInsurance: z.string().uuid().optional().nullable(),
});

export const UpdateInsurancePlanSchema = CreateInsurancePlanSchema.partial();

export type CreateInsurancePlanDTO = z.infer<typeof CreateInsurancePlanSchema>;
export type UpdateInsurancePlanDTO = z.infer<typeof UpdateInsurancePlanSchema>;
`,
      'medical-insurance.dto.ts': `import { z } from 'zod';

export const CreateMedicalInsuranceSchema = z.object({
  description: z.string().optional(),
});

export const UpdateMedicalInsuranceSchema = CreateMedicalInsuranceSchema.partial();

export type CreateMedicalInsuranceDTO = z.infer<typeof CreateMedicalInsuranceSchema>;
export type UpdateMedicalInsuranceDTO = z.infer<typeof UpdateMedicalInsuranceSchema>;
`
    }
  },
  products: {
    dtos: {
      'product.dto.ts': `import { z } from 'zod';
import { ProductUnit, ProductMagnitude } from '../models/Product';

export const CreateProductSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  dose: z.number().int().optional(),
  unit: z.nativeEnum(ProductUnit).optional(),
  quantity: z.number().int().optional(),
  magnitude: z.nativeEnum(ProductMagnitude).optional(),
  idLabo: z.string().uuid().optional().nullable(),
  idPharmacy: z.string().uuid().optional().nullable(),
  idCategory: z.string().uuid().optional().nullable(),
  active: z.boolean().default(true),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export type CreateProductDTO = z.infer<typeof CreateProductSchema>;
export type UpdateProductDTO = z.infer<typeof UpdateProductSchema>;
`,
      'category.dto.ts': `import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export type CreateCategoryDTO = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof UpdateCategorySchema>;
`,
      'laboratory.dto.ts': `import { z } from 'zod';

export const CreateLaboratorySchema = z.object({
  name: z.string().optional(),
});

export const UpdateLaboratorySchema = CreateLaboratorySchema.partial();

export type CreateLaboratoryDTO = z.infer<typeof CreateLaboratorySchema>;
export type UpdateLaboratoryDTO = z.infer<typeof UpdateLaboratorySchema>;
`
    }
  },
  users: {
    dtos: {
      'favourite-pharmacy.dto.ts': `import { z } from 'zod';

export const CreateFavouritePharmacySchema = z.object({
  idUser: z.string().uuid('ID de usuario inválido'),
  idPharmacy: z.string().uuid('ID de farmacia inválido'),
  active: z.boolean().default(true),
});

export const UpdateFavouritePharmacySchema = CreateFavouritePharmacySchema.partial();

export type CreateFavouritePharmacyDTO = z.infer<typeof CreateFavouritePharmacySchema>;
export type UpdateFavouritePharmacyDTO = z.infer<typeof UpdateFavouritePharmacySchema>;
`
    }
  }
};

try {
  for (const domain of Object.keys(dtosData)) {
    const domainDtosPath = path.join(srcPath, domain, 'dtos');
    if (!fs.existsSync(domainDtosPath)) {
      fs.mkdirSync(domainDtosPath, { recursive: true });
    }
    const dtos = dtosData[domain].dtos;
    for (const dtoFile of Object.keys(dtos)) {
      const filePath = path.join(domainDtosPath, dtoFile);
      fs.writeFileSync(filePath, dtos[dtoFile]);
      console.log('Created: ' + filePath);
    }
  }
} catch (e) {
  console.error(e);
}
