import 'reflect-metadata';
import AppDataSource from '@/data-source';
import { Shift } from '@/shifts/models/Shift';
import { Pharmacy } from '@/pharmacies/models/Pharmacy';

const codes = 'ABCDEFGHIJKL'.split('');

/** Non-destructive, repeatable fixture loader. Only for isolated development databases. */
async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production' || process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error('Set ALLOW_DEMO_SEED=true on an isolated development database');
  }
  await AppDataSource.initialize();
  try {
    const shifts = AppDataSource.getRepository(Shift);
    const pharmacies = AppDataSource.getRepository(Pharmacy);
    for (const code of codes) {
      let shift = await shifts.findOneBy({ code });
      if (!shift) shift = await shifts.save(shifts.create({ code, name: `Grupo ${code}` }));
      const name = `MediFind Demo ${code}`;
      let pharmacy = await pharmacies.findOneBy({ name });
      if (!pharmacy) pharmacy = pharmacies.create({ name });
      pharmacy.shift = shift;
      pharmacy.adress = `Dirección ficticia ${code} - San Nicolás`;
      pharmacy.open24Hours = code === 'L';
      pharmacy.weeklyHours = code === 'L' ? [] : [
        ...[1,2,3,4,5].flatMap(dayOfWeek => [
          { dayOfWeek, opensAt: '09:00', closesAt: '13:00' },
          { dayOfWeek, opensAt: '16:00', closesAt: '20:00' },
        ]),
        ...(code.charCodeAt(0) % 2 === 0 ? [{ dayOfWeek: 6, opensAt: '09:00', closesAt: '13:00' }] : []),
      ];
      await pharmacies.save(pharmacy);
    }
    console.info('12 demo shifts and pharmacies ready. No production data used.');
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
