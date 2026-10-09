// Герой: создание, характеристики, опыт.
import { CLASSES, FIST } from '../../data/classes.js';
import { HERO, MAX_LVL, xpNeed, ITEM, PROPS, armorCut } from '../../data/balance.js';
import { starterGear } from '../systems/items.js';
import { uid } from '../engine/util.js';

export const HERO_V = 2; // версия сохранения героя (2 — вещи v59: главный параметр и свойства)

export function newHero(name, cls) {
  return {
    v: HERO_V, id: uid(), name: name.trim().slice(0, 16) || 'Безымянный', cls,
    lvl: 1, xp: 0, gold: 0,
    eq: starterGear(cls), bag: [], potions: 2, prof: { mining: 0 }, tPity: 0, veins: {}, shops: {},
    pos: null, hp: null, zone: 'pine',
    worldT: 0,                 // время мира этого героя, секунды (возрождение мобов)
    dead: {},                  // ключ моба -> время возрождения
    stats: { kills: 0, deaths: 0, gold: 0, items: 0, play: 0 },
    created: Date.now(), seen: Date.now(),
  };
}

/** Итоговые характеристики героя с учётом вещей. eq — можно подставить другой набор (для сравнения). */
export function heroStats(h, eq = h.eq) {
  const C = CLASSES[h.cls];
  let armor = C.armor, stam = 0, main = 0, wdmg = 0;
  const p = {}; for (const k in PROPS) p[k] = 0;
  for (const it of Object.values(eq)) {
    if (!it) continue;
    armor += it.armor || 0; stam += it.stam || 0;
    if (it.cls === h.cls) { main += it.main || 0; for (const [k, v] of Object.entries(it.props || {})) if (k in p) p[k] += v; }
    if (it.slot === 'weapon') wdmg = it.dmg || 0;
  }
  if (h.cls === 'archer') p.crit += main / ITEM.agiCrit;
  for (const k in p) p[k] = Math.min(PROPS[k].cap, Math.round(p[k] * 10) / 10);
  const crit = Math.min(PROPS.crit.cap, ITEM.baseCrit + p.crit);
  const maxHp = Math.round((HERO.hp(h.lvl) + stam * 10) * C.hpMul);
  const power = HERO.power(h.lvl) + main;
  const A = attackOf({ ...h, eq }), cd = A.cd / (1 + p.haste / 100), hit = (power + wdmg * 1.6) * A.mul;
  const dps = hit / cd * (1 + crit / 100 * (ITEM.critMul - 1));
  // живучесть: сколько урона выдержит с бронёй, блоком и уклонением
  const avoid = Math.min(0.5, (p.block + p.dodge) / 100);
  const ehp = maxHp / (1 - armorCut(armor, h.lvl)) / (1 - avoid);
  return { maxHp, armor, stam, main, power, wdmg, hit, cd, crit, p, dps, ehp, unarmed: !eq.weapon };
}
/** Обычный удар героя: оружием класса или кулаками, если оружие снято. */
export const attackOf = h => h.eq.weapon ? CLASSES[h.cls].attack : FIST;

/** Добавить опыт. Возвращает число полученных уровней. */
export function addXp(h, n) {
  if (h.lvl >= MAX_LVL) return 0;
  h.xp += n; let up = 0;
  while (h.lvl < MAX_LVL && h.xp >= xpNeed(h.lvl)) { h.xp -= xpNeed(h.lvl); h.lvl++; up++; }
  if (h.lvl >= MAX_LVL) h.xp = 0;
  return up;
}

/** Насколько вещь лучше надетой на том же месте: доли изменения урона в секунду и живучести. null — не для этого класса или уже надета. */
export function compareItem(h, it) {
  if (!it || it.cls !== h.cls) return null;
  const cur = h.eq[it.slot]; if (cur && cur.id === it.id) return null;
  const a = heroStats(h), b = heroStats(h, { ...h.eq, [it.slot]: it });
  const dps = b.dps / a.dps - 1, ehp = b.ehp / a.ehp - 1;
  return { dps, ehp, up: dps > 0.001, score: dps + ehp * 0.5 };
}
