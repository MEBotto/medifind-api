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
  it('switches active duty at 08:00 Argentina time across January/February', async () => {
    const search = new PharmacysRepository();
    const filters = PharmacySearchSchema.parse({ onDuty: 'true', search: suffix });
    const before = await search.findAll(filters, '00000000-0000-4000-8000-000000000001', new Date('2026-02-01T10:59:00Z'));
    const after = await search.findAll(filters, '00000000-0000-4000-8000-000000000001', new Date('2026-02-01T11:00:00Z'));
    const january = await calendar.getCalendar(2026, 1);
    expect(before.data.map(p => p.shift?.code?.trim())).toEqual([january.days[30].group]);
    expect(after.data.map(p => p.shift?.code?.trim())).toEqual(['G']);
  });

  it('evaluates overnight hours across midnight and excludes the opening endpoint', async () => {
    const pharmacyRepo = AppDataSource.getRepository(Pharmacy);
    const pharmacy = await pharmacyRepo.findOneByOrFail({ id: ids[0] });
    pharmacy.weeklyHours = [{ dayOfWeek: 6, opensAt: '22:00', closesAt: '02:00' }];
    pharmacy.open24Hours = false;
    await pharmacyRepo.save(pharmacy);
    const search = new PharmacysRepository();
    const filters = PharmacySearchSchema.parse({ openNow: 'true', search: suffix });
    const check = async (iso: string) => (await search.findAll(filters,
      '00000000-0000-4000-8000-000000000001', new Date(iso))).data.map(p => p.id);
    // Saturday 2026-06-06: 21:59, 22:00; Sunday 2026-06-07: 01:59, 02:00 Argentina time.
    expect(await check('2026-06-07T00:59:00Z')).not.toContain(pharmacy.id);
    expect(await check('2026-06-07T01:00:00Z')).toContain(pharmacy.id);
    expect(await check('2026-06-07T04:59:00Z')).toContain(pharmacy.id);
    expect(await check('2026-06-07T05:00:00Z')).not.toContain(pharmacy.id);
  });

});
