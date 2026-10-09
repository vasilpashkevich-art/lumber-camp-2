// v66: строки характеристик в окне героя с пояснениями (значок «i» у каждой строки).
// Чистая функция без DOM — проверяется тестом.
import { CLASSES, MAIN_STAT } from '../../data/classes.js';
import { HERO, LOOT, ITEM, PROPS, armorCut } from '../../data/balance.js';
import { fmt1 } from '../engine/util.js';
import { attackOf } from '../entities/hero.js';

const MAIN_WHO = { warrior: 'Воина', mage: 'Мага', archer: 'Лучника' };
const PNAME = { crit: 'Крит', haste: 'Скорость удара', regen: 'Восстановление', pen: 'Пробивание брони', dodge: 'Уклонение', vamp: 'Вампиризм', block: 'Блок', cdr: 'Перезарядка' };
const pc = v => Math.round(v) + '%';
const cap = k => `Больше ${PROPS[k].cap}% не бывает.`;

/** Строки окна: [{ label, val, help }]. help — пояснение для подсказки (null — без значка). */
export function statRows(h, st) {
  const C = CLASSES[h.cls], perStam = Math.round(10 * C.hpMul * 10) / 10, main = MAIN_STAT[h.cls];
  const per = fmt1(attackOf(h).mul), critEvery = st.crit > 0 ? Math.max(1, Math.round(100 / st.crit)) : 0;
  const rows = [
    { label: 'Уровень', val: h.lvl, help: 'Растёт от опыта за убитых мобов. С уровнем растут здоровье и сила удара. Серые мобы — намного ниже вас — опыта не дают.' },
    { label: 'Здоровье', val: st.maxHp, help: `Сколько урона вы выдержите. Растёт с уровнем и от выносливости на вещах.${C.hpMul > 1 ? ` У ${MAIN_WHO[h.cls]} здоровья на ${pc((C.hpMul - 1) * 100)} больше.` : C.hpMul < 1 ? ` У ${MAIN_WHO[h.cls]} здоровья на ${pc((1 - C.hpMul) * 100)} меньше.` : ''} Вне боя через ${HERO.outOfCombat} с восстанавливается само, сидя (X) — быстрее, в Столице и на стоянках — очень быстро.` },
    { label: 'Выносливость', val: st.stam, help: `Есть на вещах. Каждая единица — +${fmt1(perStam)} здоровья.${st.stam ? ` Сейчас она даёт +${Math.round(st.stam * perStam)} здоровья.` : ' Сейчас выносливости на вещах нет.'}` },
    { label: main, val: st.main, help: `Главный параметр ${MAIN_WHO[h.cls]}, есть только на вещах вашего класса. Каждая единица — +${per} к силе удара, а с ней сильнее и умения.${h.cls === 'archer' ? ` Каждые ${ITEM.agiCrit} единиц — ещё +1% крита (сейчас +${fmt1(st.main / ITEM.agiCrit)}%).` : ''}` },
    { label: 'Сила удара', val: fmt1(st.hit), help: `Урон одного обычного удара, пока его не срезала броня врага. Складывается из уровня, ${main === 'Сила' ? 'силы' : main === 'Интеллект' ? 'интеллекта' : 'ловкости'} и урона оружия. Умения бьют от неё же.${st.unarmed ? ' Сейчас вы без оружия — бьёте кулаками.' : ''}` },
    { label: 'Урон в секунду', val: fmt1(st.dps), help: 'Средний урон за секунду обычными ударами — с учётом скорости удара и крита. Им удобно сравнивать вещи: зелёная ▲ на вещи в сумке значит, что он вырастет.' },
    { label: 'Крит', val: fmt1(st.crit) + '%', help: `Шанс, что удар выйдет в ${fmt1(ITEM.critMul)} раза сильнее.${critEvery ? ` Сейчас — примерно каждый ${critEvery}-й удар.` : ''} У всех с начала ${ITEM.baseCrit}%, остальное — с вещей. ${cap('crit')}` },
  ];
  const P = {
    haste: v => `Удары чаще на ${fmt1(v)}%. ${cap('haste')}`,
    regen: v => `Здоровье прибавляется всегда, даже в бою: ${fmt1(v)} в секунду — ${Math.round(v * 60)} в минуту.`,
    pen: v => `Броня врага срезает ваш урон слабее: вы пробиваете ${fmt1(v)}% его брони. ${cap('pen')}`,
    dodge: v => `Шанс увернуться от удара врага и не получить урона: ${fmt1(v)}%. ${cap('dodge')}`,
    vamp: v => `${fmt1(v)}% нанесённого вами урона возвращается здоровьем. ${cap('vamp')}`,
    block: v => `Шанс принять удар врага на оружие и не получить урона: ${fmt1(v)}%. ${cap('block')}`,
    cdr: v => `Умения перезаряжаются на ${fmt1(v)}% быстрее. ${cap('cdr')}`,
  };
  for (const [k, v] of Object.entries(st.p)) if (v > 0 && k !== 'crit') rows.push({ label: PNAME[k], val: fmt1(v) + PROPS[k].unit, help: P[k](v) });
  const cut = Math.round(armorCut(st.armor, h.lvl) * 100);
  rows.push({ label: 'Броня', val: `${st.armor} (−${cut}%)`, help: `Срезает урон от ударов врагов — сейчас на ${cut}%. С каждым уровнем для того же процента нужно больше брони, так что вещи стоит менять. Больше 75% не бывает.` });
  return rows;
}
