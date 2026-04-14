import { Client } from 'pg';
import 'dotenv/config';
import { logger } from '@/utils/logger';

(async () => {
  const dbName = process.env.DB_DATABASE;
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });

  try {
    await client.connect();
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);

    if (res.rowCount === 0) {
      logger.info(`La base de datos "${dbName}" no existe. Creando...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      logger.info(`Base de datos "${dbName}" creada correctamente.`);
    } else {
      logger.info(`La base de datos "${dbName}" ya existe.`);
    }
  } catch (err) {
    logger.error('Error verificando o creando la base de datos:', err);
  } finally {
    await client.end();
  }
})();
