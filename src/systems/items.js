// Вещи: создание, характеристики, облик, цена.
import { GEAR_NAMES, MAIN_STAT_TO } from '../../data/classes.js';
import { RAR_MUL, RAR_IDX, RAR_PROPS, LOOT, ITEM, PROPS } from '../../data/balance.js';
import { TRINKETS } from '../../data/trinkets.js';
import { ORES, GEMS } from '../../data/mining.js';
import { weighted, uid, rng } from '../engine/util.js';

const ARMOR_SLOT = { head: 0.7, chest: 1.2, legs: 0.9 };
const CLASS_ARMOR = { warrior: 1.6, archer: 1.0, mage: 0.5 };
const STAM_SLOT = { head: 0.8, chest: 1.2, legs: 1.0, weapon: 0.5, neck: 0.7, ring: 0.6 };

/** Ярус облика и названия 1..4: растёт с уровнем вещи (каждые 8) и цветом. */
export function visTier(ilvl, rar) {
  if (rar === 'start') return 0;
  return Math.max(1, Math.min(4, RAR_IDX[rar] + Math.floor(ilvl / 8)));
}

const r1 = v => Math.round(v * 10) / 10;
/** Величина свойства на вещи. */
export function propVal(k, slot, ilvl, rar, r = Math.random) {
  const P = PROPS[k];
  return Math.max(0.1, r1((P.base + P.per * ilvl) * ITEM.slot[slot] * (ITEM.propRar[rar] || 1) * (0.85 + r() * 0.3)));
}

/** Новая вещь. cls — класс, для которого вещь; slot — head/chest/legs/weapon. */
export function makeItem(cls, slot, ilvl, rar, r = Math.random) {
  const tier = visTier(ilvl, rar);
  const m = RAR_MUL[rar];
  const it = { id: uid(), cls, slot, ilvl, rar, tier };
  if (slot === 'weapon') {
    it.dmg = r1((3 + ilvl * 1.5) * m * (0.92 + r() * 0.16));
    it.wt = rar === 'start' ? 0 : Math.min(3, tier);
  } else if (ARMOR_SLOT[slot]) {
    it.armor = Math.round((2 + ilvl * 1.6) * ARMOR_SLOT[slot] * CLASS_ARMOR[cls] * m * (0.9 + r() * 0.2));
  }   // кольцо и шея — без брони: только параметры
  it.main = rar === 'start' ? 0 : Math.max(1, Math.round((ITEM.main.base + ITEM.main.per * ilvl) * ITEM.slot[slot] * m * (0.9 + r() * 0.2)));
  it.stam = rar === 'start' ? 0 : Math.round((1 + ilvl * 0.9) * STAM_SLOT[slot] * m * (0.85 + r() * 0.3));
  // дополнительные свойства: зелёная — 1, синяя — 2 (одно может быть особым), без повторов, только своего класса
  const n = RAR_PROPS[rar] || 0;
  if (n) {
    it.props = {};
    const pool = Object.keys(PROPS).filter(k => PROPS[k].cls.includes(cls));
    for (let i = 0; i < n; i++) {
      const can = pool.filter(k => !(k in it.props) && (!PROPS[k].special || (RAR_IDX[rar] >= 3 && !Object.keys(it.props).some(q => PROPS[q].special))));
      if (!can.length) break;
      const k = can[Math.floor(r() * can.length)];
      it.props[k] = propVal(k, slot, ilvl, rar, r);
    }
  }
  it.name = itemName(it);
  it.price = sellPrice(it);
  return it;
}

export function itemName(it) {
  const names = GEAR_NAMES[it.cls][it.slot];
  const idx = it.slot === 'weapon' ? (it.wt ?? 0) : it.tier;
  const base = names[Math.min(idx, names.length - 1)] || 'Вещь';
  const first = it.props && Object.keys(it.props)[0];
  return first && it.tier < 4 ? `${base} ${PROPS[first].suf}` : base;
}

export function sellPrice(it) {
  if (it.rar === 'start') return 1;
  return Math.max(1, Math.round((1 + it.ilvl * 0.8) * [0, 1, 2.2, 5, 12][RAR_IDX[it.rar]]));
}

/** Пересчитать старую вещь по правилам v59 (то же место, уровень и цвет; случайность — от id, чтобы было одинаково). */
export function remakeItem(it, cls) {
  let seed = 7; for (const ch of String(it.id)) seed = (seed * 31 + ch.charCodeAt(0)) % 2147483647;
  const n = makeItem(it.cls || cls, it.slot || 'chest', it.ilvl || 1, it.rar || 'common', it.rar === 'start' ? () => 0.5 : rng(seed || 1));
  n.id = it.id; if (it.pos != null) n.pos = it.pos;
  return n;
}

/** Стартовые вещи: рубаха, штаны, простое оружие. */
export function starterGear(cls) {
  return {
    head: null, neck: null, ring: null, trinket: null,
    chest: makeItem(cls, 'chest', 1, 'start', () => 0.5),
    legs: makeItem(cls, 'legs', 1, 'start', () => 0.5),
    weapon: makeItem(cls, 'weapon', 1, 'start', () => 0.5),
  };
}

/** Случайная вещь с моба. table — добыча зоны {rarity, rare}; без неё — запасные таблицы из balance.js. */
export function rollDrop(cls, mobL, rare, r = Math.random, table = null) {
  const rar = weighted(rare ? (table && table.rare) || LOOT.rareMobRarity : (table && table.rarity) || LOOT.rarity, r);
  const slot = weighted([['head', 2], ['chest', 3], ['legs', 3], ['weapon', 2], ['neck', 1], ['ring', 1]], r);
  const ilvl = Math.max(1, mobL + (r() < 0.3 ? 1 : 0));
  return makeItem(cls, slot, ilvl, rar, r);
}

/** Аксессуар: способность вместо параметров. Только синие и фиолетовые; id — из TRINKETS (без него — случайный нужного цвета). */
export function makeTrinket(cls, ilvl, rar = 'rare', r = Math.random, id = null) {
  const pool = TRINKETS.filter(t => t.rar === rar), T = (id && TRINKETS.find(t => t.id === id)) || pool[Math.floor(r() * pool.length)];
  return { id: uid(), cls, slot: 'trinket', ilvl, rar: T.rar, tier: 3, trinket: T.id, name: T.name, price: Math.round((40 + ilvl * 12) * (T.rar === 'epic' ? 3 : 1)) };
}
export const TRINKET = id => TRINKETS.find(t => t.id === id);

/** Руда или слиток стопкой: kind — 'ore' | 'bar', metal — copper/tin. price — за штуку. */
export function makeStack(kind, metal, n = 1) {
  if (kind === 'gem') return { id: uid(), kind, metal, n, name: GEMS[metal].name, rar: metal === 'amethyst' ? 'good' : 'common', price: GEMS[metal].price };
  const O = ORES[metal];
  return { id: uid(), kind, metal, n, name: kind === 'ore' ? O.ore : O.bar, rar: 'common', price: kind === 'ore' ? O.oreP : O.barP };
}
/** Кирка: без неё жилу не выкопать. */
export const makePick = () => ({ id: uid(), kind: 'tool', tool: 'pick', name: 'Кирка рудокопа', rar: 'common', price: 12 });

/** Облик героя для рисования: какие ярусы на какой части тела. */
export function lookOf(hero) {
  const e = hero.eq;
  const best = ['head', 'chest', 'legs'].map(s => e[s]).filter(Boolean).reduce((a, it) => RAR_IDX[it.rar] > RAR_IDX[a] ? it.rar : a, 'start');
  return {
    cls: hero.cls,
    head: e.head ? e.head.tier : 0,
    chest: e.chest ? e.chest.tier : -1,     // −1 — снято: голый торс
    legs: e.legs ? e.legs.tier : -1,        // −1 — в трусах
    wt: e.weapon ? (e.weapon.wt ?? 0) : -1, // −1 — пустые руки
    rar: best === 'start' ? 'common' : best,
    glow: RAR_IDX[best] >= 4,
  };
}

/** Строки описания вещи для подсказки: [ключ, текст]. */
export function itemLines(it) {
  const L = [];
  if (it.kind === 'ore') return [['t', `Руда для плавки: ${2} — на слиток`], ['n', `В стопке: ${it.n} из ${LOOT.stack}`]];
  if (it.kind === 'bar') return [['t', 'Слиток. Пока его можно продать — позже из слитков будет ковать кузнец'], ['n', `В стопке: ${it.n} из ${LOOT.stack}`]];
  if (it.kind === 'gem') return [['t', 'Самоцвет. Пока его можно продать — позже из самоцветов будут гранить камни для вещей'], ['n', `В стопке: ${it.n} из ${LOOT.stack}`]];
  if (it.kind === 'tool') return [['t', 'Нужна, чтобы копать руду. Достаточно держать в сумке']];
  if (it.trinket) { const T = TRINKET(it.trinket); return [['ab', T.passive ? `Срабатывает само: ${T.d}` : `Клавиша 1: ${T.d}`, true], ['cd', `Перезарядка ${T.cd >= 120 ? T.cd / 60 + ' мин' : T.cd + ' с'}`], ['ilvl', `Уровень вещи: ${it.ilvl}`]]; }
  const f = v => String(v).replace('.', ',');
  if (it.dmg) L.push(['dmg', `Урон: ${f(it.dmg)}`]);
  if (it.armor) L.push(['armor', `Броня: ${it.armor}`]);
  if (it.main) L.push(['main', `+${it.main} ${MAIN_STAT_TO[it.cls]}`]);
  if (it.stam) L.push(['stam', `+${it.stam} к выносливости`]);
  for (const [k, v] of Object.entries(it.props || {})) L.push(['p:' + k, `+${f(v)}${PROPS[k].unit} ${PROPS[k].name}`, true]);
  L.push(['ilvl', `Уровень вещи: ${it.ilvl}`]);
  return L;
}

/** Числа вещи по ключам — для сравнения с надетой. */
export function itemNums(it) {
  const o = {}; if (!it) return o;
  if (it.dmg) o.dmg = it.dmg; if (it.armor) o.armor = it.armor; if (it.main) o.main = it.main; if (it.stam) o.stam = it.stam;
  for (const [k, v] of Object.entries(it.props || {})) o['p:' + k] = v;
  return o;
}
