import 'module-alias/register';
import 'dotenv/config';
import { logger } from '../utils/logger';
import AppDataSource from '../data-source';

async function runMigrations() {
  try {
    logger.info('Iniciando migraciones de base de datos...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    await AppDataSource.runMigrations();
    
    logger.info('Migraciones ejecutadas exitosamente');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    logger.error('Error ejecutando migraciones:', error);
    process.exit(1);
  }
}

runMigrations();
