import AppDataSource from '@/data-source';
import { logger } from '@/utils/logger';
import { DataSource, EntityMetadata, EntityTarget } from 'typeorm';

async function wipeDatabase(ds: DataSource, { hard = true } = {}) {
  // Recolectar todos los nombres de tablas (incluye tablas de join many-to-many)
  const metas: EntityMetadata[] = ds.entityMetadatas;
  const tablePaths = new Set<string>();
  for (const m of metas) {
    tablePaths.add(m.tablePath);
    for (const r of m.relations) {
      const j = r.junctionEntityMetadata;
      if (j) tablePaths.add(j.tablePath);
    }
  }
  const tables = Array.from(tablePaths);
  if (tables.length === 0) {
    logger.warn('No se encontraron tablas registradas en el DataSource.');
    return;
  }

  const qr = ds.createQueryRunner();
  await qr.connect();

  try {
    const type = ds.options.type;

    if (hard && type === 'postgres') {
      const quotePg = (p: string) =>
        p
          .split('.')
          .map((s) => `"${s}"`)
          .join('.');
      const list = tables.map(quotePg).join(', ');
      await qr.query(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE;`);
      logger.info(`TRUNCATE (RESTART IDENTITY CASCADE) en ${tables.length} tablas [Postgres].`);
    } else if (hard && (type === 'mysql' || type === 'mariadb')) {
      await qr.query('SET FOREIGN_KEY_CHECKS = 0;');
      for (const t of tables) {
        const quoted = '`' + t.replace('.', '`.`') + '`';
        await qr.query(`TRUNCATE TABLE ${quoted};`);
      }
      await qr.query('SET FOREIGN_KEY_CHECKS = 1;');
      logger.info(`TRUNCATE con FK OFF/ON en ${tables.length} tablas [MySQL/MariaDB].`);
    } else {
      // Fallback: borrar con manager.clear (DELETE FROM); no reinicia secuencias.
      // Orden: primero las que tienen más FKs para minimizar violaciones.
      const sorted = metas.slice().sort((a, b) => b.foreignKeys.length - a.foreignKeys.length);
      for (const m of sorted) {
        await ds.manager.clear(m.target as EntityTarget<unknown>);
      }
      logger.info(`DELETE FROM (clear) en ${sorted.length} entidades [soft].`);
    }
  } finally {
    await qr.release();
  }
}

async function main() {
  const hard = !process.argv.includes('--soft');
  const force = process.argv.includes('--force');

  if (process.env.NODE_ENV === 'production' && !force) {
    console.error(
      '❌ Abortado: NODE_ENV=production. Usá --force para continuar bajo tu responsabilidad.',
    );
    process.exit(1);
  }

  await AppDataSource.initialize();
  logger.info('Conectado a la base de datos');

  try {
    await wipeDatabase(AppDataSource, { hard });
    logger.info('✅ Base limpiada.');
  } catch (err) {
    logger.error('Error al limpiar la base:', err);
    process.exitCode = 1;
  } finally {
    await AppDataSource.destroy();
  }
}

if (require.main === module) {
  // Ejecutado directamente
  main();
}

export default main;
