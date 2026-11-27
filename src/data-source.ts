import { DataSource } from 'typeorm';
import 'dotenv/config';
import { logger } from '@/utils/logger';

import { RefreshSession } from './users/models/RefreshSession';
import { User } from './users/models/User';
import { Notification } from './notifications/models/Notification';
import { AuditLog } from './audit/models/AuditLog';
import { Role } from './roles/models/Role';
import { Permission } from './roles/models/Permission';
import { RolePermission } from './roles/models/RolePermission';
import { Shift } from './shifts/models/Shift';
import { ShiftRotationRule } from './shifts/models/ShiftRotationRule';
import { ShiftRotationRuleShift } from './shifts/models/ShiftRotationRuleShift';
import { Pharmacy } from './pharmacies/models/Pharmacy';
import { Order } from './orders/models/Order';
import { OrderItem } from './orders/models/OrderItem';
import { Customer } from './customers/models/Customer';
import { Person } from './customers/models/Person';
import { InsurancePlan } from './customers/models/InsurancePlan';
import { MedicalInsurance } from './customers/models/MedicalInsurance';
import { Product } from './products/models/Product';
import { CatalogProduct } from './products/models/CatalogProduct';
import { PharmacyProduct } from './products/models/PharmacyProduct';
import { CatalogRequest } from './products/models/CatalogRequest';
import { Category } from './products/models/Category';
import { Laboratory } from './products/models/Laboratory';
import { FavouritePharmacy } from './users/models/FavouritePharmacy';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [RefreshSession, Notification, AuditLog, User, Role, Permission, RolePermission, Shift, ShiftRotationRule, ShiftRotationRuleShift, Pharmacy, Order, OrderItem, Customer, Person, InsurancePlan, MedicalInsurance, Product, CatalogProduct, PharmacyProduct, CatalogRequest, Category, Laboratory, FavouritePharmacy],
  // Match timestamp-prefixed migration files only; never load Jest test modules.
  // Use compiled JavaScript migrations when running from dist in production.
  migrations: [process.env.NODE_ENV === 'production'
    ? 'dist/migrations/[0-9]*.js'
    : 'src/migrations/[0-9]*.ts'],
  // Never auto-modify a real database schema. Tests use an isolated disposable DB.
  synchronize: process.env.NODE_ENV === 'test',
  logging: false,
});

// Función para inicializar la conexión
export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    logger.info('Conexión a PostgreSQL establecida correctamente');
  } catch (error) {
    logger.error('Error al conectar con PostgreSQL:', error);
    throw error;
  }
};

export default AppDataSource;
