// Таланты героя (v73): ряды на 10, 15, 20 уровне, из ряда берётся один. Сброс — у наставника в Столице за деньги.
import { TALENTS, RESET_PRICE } from '../../data/talents.js';

export const talentRows = h => TALENTS[h.cls] || [];
/** Выбран ли талант. */
export const hasTal = (h, id) => !!h.talents && Object.values(h.talents).includes(id);
/** Сколько рядов открыто, но талант в них ещё не выбран. */
export const talentFree = h => talentRows(h).filter(r => h.lvl >= r.lvl && !(h.talents || {})[r.lvl]).length;
/** Взять талант из ряда lvl. false — ряд закрыт, уже выбран или такого нет. */
export function chooseTalent(h, lvl, id) {
  const row = talentRows(h).find(r => r.lvl === lvl);
  if (!row || h.lvl < lvl || !row.opts.some(o => o.id === id)) return false;
  h.talents = h.talents || {}; if (h.talents[lvl]) return false;
  h.talents[lvl] = id; return true;
}
export const resetPrice = h => RESET_PRICE(h.lvl);
/** Сбросить все таланты за деньги. Возвращает 'ok', 'empty' (нечего сбрасывать) или 'gold' (не хватает денег). */
export function resetTalents(h) {
  if (!h.talents || !Object.keys(h.talents).length) return 'empty';
  const p = resetPrice(h); if (h.gold < p) return 'gold';
  h.gold -= p; h.talents = {}; return 'ok';
}
