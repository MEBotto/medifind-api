import AppDataSource from '@/data-source';
import { AppError } from '@/middleware/error.middleware';
import { Pharmacy } from '@/pharmacies/models/Pharmacy';
import { Shift } from '../models/Shift';
import { ShiftRotationRule } from '../models/ShiftRotationRule';
import { ShiftRotationRuleShift } from '../models/ShiftRotationRuleShift';
import { AnnualShiftConfig } from '../dtos/annual-shift-config.dto';

const ALL_CODES = 'ABCDEFGHIJKL'.split('');
const utcDay = (year: number, month: number, day: number): number =>
  Date.UTC(year, month - 1, day) / 86400000;

export class ShiftCalendarService {
  async configureYear(config: AnnualShiftConfig): Promise<void> {
    await AppDataSource.transaction(async manager => {
      const shifts = await manager.getRepository(Shift).find();
      const byCode = new Map(shifts.map(s => [s.code?.trim(), s]));
      if (ALL_CODES.some(code => !byCode.has(code)) || new Set(shifts.map(s => s.code?.trim())).size !== shifts.length) {
        throw new AppError(422, 'Deben existir exactamente los grupos únicos A a L');
      }
      const definitions = [
        { name: `Enero ${config.year}`, months: [1], codes: config.january, anchor: config.januaryAnchor, priority: 10 },
        { name: `Febrero ${config.year}`, months: [2], codes: config.february, anchor: config.februaryAnchor, priority: 10 },
        { name: `General ${config.year}`, months: [3,4,5,6,7,8,9,10,11,12], codes: ALL_CODES, anchor: config.generalAnchor, priority: 1 },
      ];
      // Delete only this year's managed rules, preserving unrelated/manual rules.
      const existing = await manager.getRepository(ShiftRotationRule).find({ where: { year: config.year } });
      const managed = existing.filter(r => r.name === `Enero ${config.year}` ||
        r.name === `Febrero ${config.year}` || r.name === `General ${config.year}`);
      for (const rule of managed) {
        await manager.getRepository(ShiftRotationRuleShift).delete({ rule: { id: rule.id } });
        await manager.getRepository(ShiftRotationRule).remove(rule);
      }
      for (const definition of definitions) {
        const anchorShift = byCode.get(definition.anchor.group)!;
        const rule = await manager.getRepository(ShiftRotationRule).save(manager.getRepository(ShiftRotationRule).create({
          name: definition.name, year: config.year, months: definition.months,
          anchorDay: definition.anchor.day, idAnchorShift: anchorShift.id, priority: definition.priority,
        }));
        await manager.getRepository(ShiftRotationRuleShift).save(definition.codes.map((code, position) =>
          manager.getRepository(ShiftRotationRuleShift).create({
            rule, shift: byCode.get(code)!, position,
          })));
      }
    });
  }

  async getCalendar(year: number, month: number) {
    const rules = await AppDataSource.getRepository(ShiftRotationRule)
      .createQueryBuilder('rule')
      .leftJoinAndSelect('rule.rotationRuleShifts', 'item')
      .leftJoinAndSelect('item.shift', 'shift')
      .where('(rule.year = :year OR rule.year IS NULL)', { year })
      .andWhere(':month = ANY(rule.months)', { month })
      .orderBy('rule.priority', 'DESC')
      .addOrderBy('rule.id', 'ASC')
      .getMany();
    const rule = rules[0];
    if (!rule) throw new AppError(404, 'No hay calendario configurado para este mes');
    if (rules.length > 1 && rules[1].priority === rule.priority) {
      throw new AppError(409, 'Existen reglas de turno con la misma prioridad para este mes');
    }
    const ordered = [...rule.rotationRuleShifts].sort((a,b) => a.position - b.position);
    if (!ordered.length || ordered.some((item, index) => item.position !== index || !item.shift)) {
      throw new AppError(422, 'La secuencia de turnos está incompleta');
    }
    const anchorIndex = ordered.findIndex(item => item.shift.id === rule.idAnchorShift);
    if (anchorIndex === -1) throw new AppError(422, 'El grupo ancla no pertenece a la rotación');
    // Summer rules anchor in their own month. General annual rule anchors in March.
    const anchorMonth = rule.months.includes(1) && month === 1 ? 1 :
      rule.months.includes(2) && month === 2 ? 2 :
      rule.months.includes(3) ? 3 : Math.min(...rule.months);
    const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const entries = Array.from({ length: days }, (_, offset) => {
      const day = offset + 1;
      const elapsed = utcDay(year, month, day) - utcDay(year, anchorMonth, rule.anchorDay);
      const index = ((anchorIndex + elapsed) % ordered.length + ordered.length) % ordered.length;
      return { date: `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`,
        group: ordered[index].shift.code?.trim(), shiftId: ordered[index].shift.id };
    });
    const ids = [...new Set(entries.map(entry => entry.shiftId))];
    const pharmacies = await AppDataSource.getRepository(Pharmacy)
      .createQueryBuilder('pharmacy')
      .leftJoinAndSelect('pharmacy.shift', 'shift')
      .where('shift.id IN (:...ids)', { ids })
      .orderBy('pharmacy.name', 'ASC')
      .getMany();
    const byShift = new Map(ids.map(id => [id, pharmacies.filter(p => p.shift?.id === id)]));
    return { year, month, rule: { id: rule.id, name: rule.name, priority: rule.priority },
      days: entries.map(entry => ({ ...entry, pharmacies: byShift.get(entry.shiftId) ?? [] })) };
  }
}
