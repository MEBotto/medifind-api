const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src');

const dtosData = {
  roles: ['Role', 'Permission', 'RolePermission'],
  shifts: ['Shift', 'ShiftRotationRule', 'ShiftRotationRuleShift'],
  pharmacies: ['Pharmacy'],
  orders: ['Order', 'OrderItem'],
  customers: ['Customer', 'Person', 'InsurancePlan', 'MedicalInsurance'],
  products: ['Product', 'Category', 'Laboratory'],
  users: ['FavouritePharmacy']
};

let imports = `import { User } from '@/users/models/User';\n`;
let entities = `User`;

for (const [domain, models] of Object.entries(dtosData)) {
  for (const model of models) {
    imports += `import { ${model} } from '@/${domain}/models/${model}';\n`;
    entities += `, ${model}`;
  }
}

const dataSourceContent = `import { DataSource } from 'typeorm';
import 'dotenv/config';

${imports}
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [${entities}],
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
`;

fs.writeFileSync(path.join(srcPath, 'data-source.ts'), dataSourceContent);
console.log('data-source.ts successfully updated automatically with all models.');
