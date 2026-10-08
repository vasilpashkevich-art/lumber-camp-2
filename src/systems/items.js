// Вещи: создание, характеристики, облик, цена.
import { GEAR_NAMES } from '../../data/classes.js';
import { RAR_MUL, RAR_IDX, LOOT } from '../../data/balance.js';
import { weighted, uid } from '../engine/util.js';

const ARMOR_SLOT = { head: 0.7, chest: 1.2, legs: 0.9 };
const CLASS_ARMOR = { warrior: 1.6, archer: 1.0, mage: 0.5 };
const STAM_SLOT = { head: 0.8, chest: 1.2, legs: 1.0, weapon: 0.5 };

/** Ярус облика 0..4 по уровню вещи и редкости. */
export function visTier(ilvl, rar) {
  return Math.max(0, Math.min(4, RAR_IDX[rar] + Math.floor(ilvl / 15)));
}

/** Новая вещь. cls — класс, для которого вещь; slot — head/chest/legs/weapon. */
export function makeItem(cls, slot, ilvl, rar, r = Math.random) {
  const tier = rar === 'start' ? 0 : Math.max(1, visTier(ilvl, rar));
  const m = RAR_MUL[rar];
  const it = { id: uid(), cls, slot, ilvl, rar, tier };
  if (slot === 'weapon') {
    it.dmg = Math.round((3 + ilvl * 1.5) * m * (0.92 + r() * 0.16) * 10) / 10;
    it.wt = rar === 'start' ? 0 : Math.min(3, tier);
  } else {
    it.armor = Math.round((2 + ilvl * 1.6) * ARMOR_SLOT[slot] * CLASS_ARMOR[cls] * m * (0.9 + r() * 0.2));
  }
  it.stam = rar === 'start' ? 0 : Math.round((1 + ilvl * 0.9) * STAM_SLOT[slot] * m * (0.85 + r() * 0.3));
  if (RAR_IDX[rar] >= 3) it.pow = Math.round(ilvl * 0.6 * m); // редкие+ добавляют силу удара
  it.name = itemName(it);
  it.price = sellPrice(it);
  return it;
}

export function itemName(it) {
  const names = GEAR_NAMES[it.cls][it.slot];
  const idx = it.slot === 'weapon' ? (it.wt ?? 0) : it.tier;
  return names[Math.min(idx, names.length - 1)] || 'Вещь';
}

export function sellPrice(it) {
  if (it.rar === 'start') return 0;
  return Math.max(1, Math.round((1 + it.ilvl * 0.8) * [0, 1, 2.2, 5, 12][RAR_IDX[it.rar]]));
}

/** Стартовые вещи: рубаха, штаны, простое оружие. */
export function starterGear(cls) {
  return {
    head: null,
    chest: makeItem(cls, 'chest', 1, 'start', () => 0.5),
    legs: makeItem(cls, 'legs', 1, 'start', () => 0.5),
    weapon: makeItem(cls, 'weapon', 1, 'start', () => 0.5),
  };
}

/** Случайная вещь с моба. */
export function rollDrop(cls, mobL, rare, r = Math.random) {
  const rar = weighted(rare ? LOOT.rareMobRarity : LOOT.rarity, r);
  const slot = weighted([['head', 2], ['chest', 3], ['legs', 3], ['weapon', 2]], r);
  const ilvl = Math.max(1, mobL + (r() < 0.3 ? 1 : 0));
  return makeItem(cls, slot, ilvl, rar, r);
}

/** Облик героя для рисования: какие ярусы на какой части тела. */
export function lookOf(hero) {
  const e = hero.eq;
  const best = ['head', 'chest', 'legs'].map(s => e[s]).filter(Boolean).reduce((a, it) => RAR_IDX[it.rar] > RAR_IDX[a] ? it.rar : a, 'start');
  return {
    cls: hero.cls,
    head: e.head ? e.head.tier : 0,
    chest: e.chest ? e.chest.tier : 0,
    legs: e.legs ? e.legs.tier : 0,
    wt: e.weapon ? (e.weapon.wt ?? 0) : 0,
    rar: best === 'start' ? 'common' : best,
    glow: RAR_IDX[best] >= 4,
  };
}

/** Строки описания вещи для подсказки. */
export function itemLines(it) {
  const L = [];
  if (it.dmg) L.push(`Урон: ${String(it.dmg).replace('.', ',')}`);
  if (it.armor) L.push(`Броня: ${it.armor}`);
  if (it.stam) L.push(`+${it.stam} к выносливости`);
  if (it.pow) L.push(`+${it.pow} к силе удара`);
  L.push(`Уровень вещи: ${it.ilvl}`);
  return L;
}
