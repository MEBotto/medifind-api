import { DataSource } from 'typeorm';
import 'dotenv/config';

import { User } from './users/models/User';
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
  entities: [User, Role, Permission, RolePermission, Shift, ShiftRotationRule, ShiftRotationRuleShift, Pharmacy, Order, OrderItem, Customer, Person, InsurancePlan, MedicalInsurance, Product, Category, Laboratory, FavouritePharmacy],
  migrations: ['src/migrations/*.ts'],
  synchronize: true,
  logging: true,
});

// Función para inicializar la conexión
export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Conexión a la base de datos establecida correctamente');
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    throw error;
  }
};

export default AppDataSource;
