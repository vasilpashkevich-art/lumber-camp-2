// Герой: создание, характеристики, опыт.
import { CLASSES } from '../../data/classes.js';
import { HERO, MAX_LVL, xpNeed } from '../../data/balance.js';
import { starterGear } from '../systems/items.js';
import { uid } from '../engine/util.js';

export const HERO_V = 1; // версия сохранения героя

export function newHero(name, cls) {
  return {
    v: HERO_V, id: uid(), name: name.trim().slice(0, 16) || 'Безымянный', cls,
    lvl: 1, xp: 0, gold: 0,
    eq: starterGear(cls), bag: [], potions: 2,
    pos: null, hp: null, zone: 'pine',
    worldT: 0,                 // время мира этого героя, секунды (возрождение мобов)
    dead: {},                  // ключ моба -> время возрождения
    stats: { kills: 0, deaths: 0, gold: 0, items: 0, play: 0 },
    created: Date.now(), seen: Date.now(),
  };
}

/** Итоговые характеристики героя с учётом вещей. */
export function heroStats(h) {
  const C = CLASSES[h.cls];
  let armor = C.armor, stam = 0, pow = 0, wdmg = 0;
  for (const it of Object.values(h.eq)) {
    if (!it) continue;
    armor += it.armor || 0; stam += it.stam || 0; pow += it.pow || 0;
    if (it.slot === 'weapon') wdmg = it.dmg || 0;
  }
  const maxHp = Math.round((HERO.hp(h.lvl) + stam * 10) * C.hpMul);
  const power = HERO.power(h.lvl) + pow;
  const hit = (power + wdmg * 1.6) * C.attack.mul;
  return { maxHp, armor, stam, power, wdmg, hit, dps: hit / C.attack.cd };
}

/** Добавить опыт. Возвращает число полученных уровней. */
export function addXp(h, n) {
  if (h.lvl >= MAX_LVL) return 0;
  h.xp += n; let up = 0;
  while (h.lvl < MAX_LVL && h.xp >= xpNeed(h.lvl)) { h.xp -= xpNeed(h.lvl); h.lvl++; up++; }
  if (h.lvl >= MAX_LVL) h.xp = 0;
  return up;
}
