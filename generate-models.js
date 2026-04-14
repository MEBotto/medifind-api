const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src');

const domains = {
  roles: {
    models: {
      'Role.ts': `import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/models/User';
import { RolePermission } from './RolePermission';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => User, user => user.role)
  users: User[];

  @OneToMany(() => RolePermission, rp => rp.role)
  rolePermissions: RolePermission[];
}`,
      'Permission.ts': `import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RolePermission } from './RolePermission';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => RolePermission, rp => rp.permission)
  rolePermissions: RolePermission[];
}`,
      'RolePermission.ts': `import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './Role';
import { Permission } from './Permission';

@Entity('role_permission')
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Role, role => role.rolePermissions)
  @JoinColumn({ name: 'idRole' })
  role: Role;

  @ManyToOne(() => Permission, permission => permission.rolePermissions)
  @JoinColumn({ name: 'idPermission' })
  permission: Permission;
}`
    }
  },
  shifts: {
    models: {
      'Shift.ts': `import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Pharmacy } from '../../pharmacies/models/Pharmacy';
import { ShiftRotationRuleShift } from './ShiftRotationRuleShift';

@Entity('shifts')
export class Shift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'char', nullable: true })
  code: string;

  @OneToMany(() => Pharmacy, pharmacy => pharmacy.shift)
  pharmacies: Pharmacy[];

  @OneToMany(() => ShiftRotationRuleShift, srrs => srrs.shift)
  rotationRuleShifts: ShiftRotationRuleShift[];
}`,
      'ShiftRotationRule.ts': `import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ShiftRotationRuleShift } from './ShiftRotationRuleShift';

@Entity('shift_rotation_rules')
export class ShiftRotationRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'int', nullable: true })
  year: number;

  @Column('int', { array: true })
  months: number[];

  @Column({ type: 'int', default: 1 })
  anchorDay: number;

  @Column({ type: 'uuid' })
  idAnchorShift: string;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @OneToMany(() => ShiftRotationRuleShift, srrs => srrs.rule)
  rotationRuleShifts: ShiftRotationRuleShift[];
}`,
      'ShiftRotationRuleShift.ts': `import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ShiftRotationRule } from './ShiftRotationRule';
import { Shift } from './Shift';

@Entity('shift_rotation_rule_shifts')
export class ShiftRotationRuleShift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ShiftRotationRule, rule => rule.rotationRuleShifts)
  @JoinColumn({ name: 'idRule' })
  rule: ShiftRotationRule;

  @ManyToOne(() => Shift, shift => shift.rotationRuleShifts)
  @JoinColumn({ name: 'idShift' })
  shift: Shift;

  @Column({ type: 'int' })
  position: number;
}`
    }
  },
  pharmacies: {
    models: {
      'Pharmacy.ts': `import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Shift } from '../../shifts/models/Shift';
import { Product } from '../../products/models/Product';
import { User } from '../../users/models/User';

@Entity('pharmacies')
export class Pharmacy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  adress: string;

  @Column('numeric', { precision: 9, scale: 6, nullable: true })
  lat: number;

  @Column('numeric', { precision: 9, scale: 6, nullable: true })
  lng: number;

  @Column({ type: 'bigint', nullable: true })
  phone: string;

  @Column({ nullable: true })
  openingDays: string;

  @Column({ type: 'time', nullable: true })
  openingTime: string;

  @Column({ type: 'time', nullable: true })
  closingTime: string;

  @ManyToOne(() => Shift, shift => shift.pharmacies)
  @JoinColumn({ name: 'idShift' })
  shift: Shift;

  @OneToMany(() => Product, product => product.pharmacy)
  products: Product[];

  @OneToMany(() => User, user => user.pharmacy)
  users: User[];
}`
    }
  },
  orders: {
    models: {
      'Order.ts': `import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Customer } from '../../customers/models/Customer';
import { User } from '../../users/models/User';
import { OrderItem } from './OrderItem';

export enum OrderState {
  PENDING = 'pending',
  PREPARING = 'preparing',
  CANCELLED = 'cancelled',
  READY = 'ready',
  DELIVERED = 'delivered'
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'serial' })
  number: number;

  @CreateDateColumn({ type: 'timestamp' })
  date: Date;

  @ManyToOne(() => Customer, customer => customer.orders)
  @JoinColumn({ name: 'idCustomer' })
  customer: Customer;

  @Column({ type: 'money', nullable: true })
  totalPrice: number;

  @Column({ type: 'timestamp', nullable: true })
  voidedAt: Date;

  @Column({ type: 'text', nullable: true })
  voidReason: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'voidedBy' })
  voidedByUser: User;

  @Column({
    type: 'enum',
    enum: OrderState,
    default: OrderState.PENDING
  })
  state: OrderState;

  @OneToMany(() => OrderItem, item => item.order)
  items: OrderItem[];
}`,
      'OrderItem.ts': `import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './Order';
import { Product } from '../../products/models/Product';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, order => order.items)
  @JoinColumn({ name: 'idOrder' })
  order: Order;

  @ManyToOne(() => Product, product => product.orderItems)
  @JoinColumn({ name: 'idProduct' })
  product: Product;

  @Column({ type: 'int', nullable: true })
  amount: number;

  @Column({ type: 'money', nullable: true })
  price: number;
}`
    }
  },
  customers: {
    models: {
      'Customer.ts': `import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/models/User';
import { Person } from './Person';
import { InsurancePlan } from './InsurancePlan';
import { Order } from '../../orders/models/Order';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.customers)
  @JoinColumn({ name: 'idUser' })
  user: User;

  @ManyToOne(() => Person, person => person.customers)
  @JoinColumn({ name: 'idPerson' })
  person: Person;

  @ManyToOne(() => InsurancePlan, plan => plan.customers)
  @JoinColumn({ name: 'idInsurancePlan' })
  insurancePlan: InsurancePlan;

  @OneToMany(() => Order, order => order.customer)
  orders: Order[];
}`,
      'InsurancePlan.ts': `import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { MedicalInsurance } from './MedicalInsurance';
import { Customer } from './Customer';

@Entity('insurance_plan')
export class InsurancePlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  active: boolean;

  @ManyToOne(() => MedicalInsurance, mi => mi.insurancePlans)
  @JoinColumn({ name: 'idMedicalInsurance' })
  medicalInsurance: MedicalInsurance;

  @OneToMany(() => Customer, customer => customer.insurancePlan)
  customers: Customer[];
}`,
      'MedicalInsurance.ts': `import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { InsurancePlan } from './InsurancePlan';

@Entity('medical_insurance')
export class MedicalInsurance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => InsurancePlan, plan => plan.medicalInsurance)
  insurancePlans: InsurancePlan[];
}`,
      'Person.ts': `import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Customer } from './Customer';
import { User } from '../../users/models/User';

@Entity('people')
export class Person {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  surname: string;

  @Column({ type: 'int', nullable: true })
  identification: number;

  @OneToMany(() => Customer, customer => customer.person)
  customers: Customer[];

  @OneToMany(() => User, user => user.person)
  users: User[];
}`
    }
  },
  products: {
    models: {
      'Product.ts': `import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Laboratory } from './Laboratory';
import { Pharmacy } from '../../pharmacies/models/Pharmacy';
import { Category } from './Category';
import { OrderItem } from '../../orders/models/OrderItem';

export enum ProductUnit {
  ML = 'ml',
  MG = 'mg',
  G = 'g'
}

export enum ProductMagnitude {
  UNIT = 'unit'
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'money', nullable: true })
  price: number;

  @Column({ type: 'int', nullable: true })
  dose: number;

  @Column({ type: 'enum', enum: ProductUnit, nullable: true })
  unit: ProductUnit;

  @Column({ type: 'int', nullable: true })
  quantity: number;

  @Column({ type: 'enum', enum: ProductMagnitude, nullable: true })
  magnitude: ProductMagnitude;

  @ManyToOne(() => Laboratory, lab => lab.products)
  @JoinColumn({ name: 'idLabo' })
  laboratory: Laboratory;

  @ManyToOne(() => Pharmacy, pharmacy => pharmacy.products)
  @JoinColumn({ name: 'idPharmacy' })
  pharmacy: Pharmacy;

  @ManyToOne(() => Category, category => category.products)
  @JoinColumn({ name: 'idCategory' })
  category: Category;

  @Column()
  active: boolean;

  @OneToMany(() => OrderItem, item => item.product)
  orderItems: OrderItem[];
}`,
      'Laboratory.ts': `import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from './Product';

@Entity('laboratories')
export class Laboratory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @OneToMany(() => Product, product => product.laboratory)
  products: Product[];
}`,
      'Category.ts': `import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from './Product';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @OneToMany(() => Product, product => product.category)
  products: Product[];
}`
    }
  },
  users: {
    models: {
      'FavouritePharmacy.ts': `import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './User';
import { Pharmacy } from '../../pharmacies/models/Pharmacy';

@Entity('favourite_pharmacies')
@Unique(['user', 'pharmacy'])
export class FavouritePharmacy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.favouritePharmacies)
  @JoinColumn({ name: 'idUser' })
  user: User;

  @ManyToOne(() => Pharmacy)
  @JoinColumn({ name: 'idPharmacy' })
  pharmacy: Pharmacy;

  @Column()
  active: boolean;
}`
    }
  }
};

try {
  for (const domain of Object.keys(domains)) {
    const domainModelsPath = path.join(srcPath, domain, 'models');
    if (!fs.existsSync(domainModelsPath)) {
      fs.mkdirSync(domainModelsPath, { recursive: true });
    }
    const models = domains[domain].models;
    for (const model of Object.keys(models)) {
      const filePath = path.join(domainModelsPath, model);
      fs.writeFileSync(filePath, models[model]);
      console.log('Created: ' + filePath);
    }
  }
} catch (e) {
  console.error(e);
}
