import 'reflect-metadata';
import AppDataSource from '@/data-source';
import { Shift } from '@/shifts/models/Shift';
import { ShiftRotationRule } from '@/shifts/models/ShiftRotationRule';
import { ShiftRotationRuleShift } from '@/shifts/models/ShiftRotationRuleShift';
import { Pharmacy } from '@/pharmacies/models/Pharmacy';
import { ShiftCalendarService } from '@/shifts/services/ShiftCalendarService';
import PharmacysRepository from '@/pharmacies/repositories/PharmacysRepository';
import { PharmacySearchSchema } from '@/pharmacies/dtos/pharmacy-search.dto';

const enabled = process.env.RUN_DB_INTEGRATION === 'true';
const suite = enabled ? describe : describe.skip;

suite('PostgreSQL integration: pharmacy duty and opening hours', () => {
  const suffix = 'medifind-integration';
  const ids: string[] = [];
  const shifts: Shift[] = [];
  const calendar = new ShiftCalendarService();

  beforeAll(async () => {
    if (process.env.NODE_ENV !== 'test' || process.env.DB_INTEGRATION_ISOLATED !== 'true') {
      throw new Error('Integration tests require NODE_ENV=test and DB_INTEGRATION_ISOLATED=true');
    }
    await AppDataSource.initialize();
    const shiftRepo = AppDataSource.getRepository(Shift);
    const pharmacyRepo = AppDataSource.getRepository(Pharmacy);
    for (const code of 'ABCDEFGHIJKL') {
      const shift = await shiftRepo.save(shiftRepo.create({ code, name: `${suffix}-${code}` }));
      shifts.push(shift);
      const pharmacy = await pharmacyRepo.save(pharmacyRepo.create({
        name: `${suffix}-pharmacy-${code}`, adress: 'Test only',
        shift, open24Hours: false,
        weeklyHours: [{ dayOfWeek: 1, opensAt: '09:00', closesAt: '13:00' }],
      }));
      ids.push(pharmacy.id);
    }
  });

  afterAll(async () => {
    if (!AppDataSource.isInitialized) return;
    try {
      // Never clean a shared database; this suite is only allowed on disposable DBs.
      await AppDataSource.getRepository(Pharmacy).delete(ids);
      const rules = await AppDataSource.getRepository(ShiftRotationRule).find({ where: { year: 2026 } });
      for (const rule of rules) {
        await AppDataSource.getRepository(ShiftRotationRuleShift).delete({ rule: { id: rule.id } });
        await AppDataSource.getRepository(ShiftRotationRule).remove(rule);
      }
      await AppDataSource.getRepository(Shift).remove(shifts);
    } finally { await AppDataSource.destroy(); }
  });

  it('persists the annual calendar and filters the duty group across January/February', async () => {
    await calendar.configureYear({
      year: 2026,
      january: ['A','B','C','D','E','F'],
      february: ['G','H','I','J','K','L'],
      januaryAnchor: { day: 1, group: 'F' },
      februaryAnchor: { day: 1, group: 'G' },
      generalAnchor: { day: 1, group: 'K' },
    });
    const jan = await calendar.getCalendar(2026, 1);
    const feb = await calendar.getCalendar(2026, 2);
    expect(jan.days[0].group).toBe('F');
    expect(feb.days[0].group).toBe('G');
    const repo = new PharmacysRepository();
    const filters = PharmacySearchSchema.parse({ onDuty: 'true', dutyDate: '2026-02-01' });
    const result = await repo.findAll(filters, '00000000-0000-4000-8000-000000000001');
    expect(result.data.some(p => p.shift?.code?.trim() === 'G')).toBe(true);
    expect(result.data.every(p => p.shift?.code?.trim() === 'G')).toBe(true);
  });

  it('stores individual Saturday and closed Sunday schedules', async () => {
    const repo = AppDataSource.getRepository(Pharmacy);
    const pharmacy = await repo.findOneByOrFail({ id: ids[0] });
    pharmacy.weeklyHours = [{ dayOfWeek: 6, opensAt: '09:00', closesAt: '12:00' }];
    await repo.save(pharmacy);
    const reloaded = await repo.findOneByOrFail({ id: ids[0] });
    expect(reloaded.weeklyHours).toEqual([{ dayOfWeek: 6, opensAt: '09:00', closesAt: '12:00' }]);
  });
});
