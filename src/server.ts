import { getJwtSecret } from '@/utils/jwt-secret';
import 'dotenv/config';
import 'reflect-metadata';
import app from './app';
import AppDataSource, { initializeDatabase } from '@/data-source';
import { logger } from '@/utils/logger';
import { Server } from 'http';

const PORT = process.env.PORT || 3000;

let server: Server;

// Inicialización de la base de datos y servidor
const startServer = async () => {
  try {
    getJwtSecret();
    await initializeDatabase();

    server = app.listen(PORT, () => {
      logger.info(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejador de señales para cierre graceful
const gracefulShutdown = async () => {
  logger.info('Recibida señal de cierre. Cerrando servidor...');

  if (server) {
    server.close(() => {
      logger.info('Servidor HTTP cerrado');
      AppDataSource.destroy()
        .then(() => {
          logger.info('Conexión a la base de datos cerrada');
          process.exit(0);
        })
        .catch((error: Error) => {
          logger.error('Error al cerrar la conexión a la base de datos:', error);
          process.exit(1);
        });
    });
  }
};

// Manejadores de señales
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();
