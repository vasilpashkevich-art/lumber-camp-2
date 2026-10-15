// Зачарование (v107): учитель, жезл чародея, распыление вещей на материалы, чары на вещи. Без рисования.
// Чары хранятся в вещи (`it.ench` — id рецепта) и считаются в heroStats; на вещи одни чары, новые заменяют прежние.
import { ENCH, ENCH_MATS, ENCHANTS, DISENCHANT, DE_REQ } from '../../data/enchanting.js';
import { LOOT } from '../../data/balance.js';
import { makeStack, isStackKind } from './items.js';
import { addStack, countOf, takeStack } from './mining.js';
import { skillColor } from './herbs.js';

const emit = (G, e) => G.ev.push(e);
const sfx = (G, n) => G.ev.push({ k: 'sfx', n });
export const enchSkill = H => (H.prof && H.prof.enchant) || 0;
export const hasRod = H => H.bag.some(it => it.tool === 'rod');
export const makeRod = () => ({ id: 'rod' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36), kind: 'tool', tool: 'rod', name: 'Медный жезл чародея', rar: 'common', price: 20 });
const freeCells = H => { let n = 0; for (let p = 0; p < LOOT.bag; p++) if (!H.bag.some(x => x.pos === p)) n++; return n; };
const freePos = H => { for (let p = 0; p < LOOT.bag; p++) if (!H.bag.some(x => x.pos === p)) return p; return -1; };

// ---------------------------------------------------------------- учитель и жезл
export function learnEnchant(G) {
  const H = G.hero; H.prof = H.prof || {};
  if (H.prof.enchant) { emit(G, { k: 'toast', s: 'Зачарование уже изучено', id: 'guild' }); return false; }
  H.prof.enchant = 1; emit(G, { k: 'skill', s: 'Изучено: зачарование (1)' }); sfx(G, 'levelUp'); return true;
}
/** Жезл чародея из медных слитков (в Мастерской чар). */
export function craftRod(G) {
  const H = G.hero;
  if (hasRod(H)) { emit(G, { k: 'toast', s: 'Жезл уже есть', id: 'guild' }); return false; }
  if (countOf(H, 'bar', 'copper') < ENCH.rodBars) { emit(G, { k: 'toast', s: `Нужно ${ENCH.rodBars} медных слитков — руду плавят в кузнице`, id: 'guild' }); return false; }
  takeStack(H, 'bar', 'copper', ENCH.rodBars);
  const p = freePos(H); if (p < 0) { addStack(H, makeStack('bar', 'copper', ENCH.rodBars)); emit(G, { k: 'toast', s: 'Сумка полна', id: 'bagfull' }); return false; }
  const it = makeRod(); it.pos = p; H.bag.push(it); sfx(G, 'skill'); emit(G, { k: 'toast', s: 'Готов <b>Медный жезл чародея</b> — держите его в сумке', id: 'guild' }); return true;
}

// ---------------------------------------------------------------- распыление
/** Ярус материалов по уровню вещи. */
export const tierOf = it => ((it.ilvl || 1) <= 10 ? 1 : 2);
/** Можно ли распылить: вещь (не стопка, не инструмент), зелёная и лучше, в сумке. Аксессуары тоже можно. */
export const canDisenchant = (H, it) => !!it && !isStackKind(it) && !it.kind && !!DISENCHANT[it.rar] && H.bag.includes(it);
/** Что может выйти (для подсказки): [[материал, от, до, шанс]]. */
export const deOutcome = it => DISENCHANT[it.rar] ? DISENCHANT[it.rar](tierOf(it)) : [];
/** Распылить вещь. Возвращает {материал: число} или null. */
export function disenchant(G, it, quiet = false) {
  const H = G.hero, sk = enchSkill(H);
  if (!sk) { emit(G, { k: 'toast', s: 'Сначала выучите зачарование в Мастерской чар в Столице', id: 'ench' }); return null; }
  if (!hasRod(H)) { emit(G, { k: 'toast', s: `Нужен жезл чародея — его делают в Мастерской чар из ${ENCH.rodBars} медных слитков`, id: 'ench' }); return null; }
  if (!canDisenchant(H, it)) { emit(G, { k: 'toast', s: 'Это не распылить: только зелёные, синие и фиолетовые вещи из сумки', id: 'ench' }); return null; }
  const got = {}; for (const [m, a, b, ch] of deOutcome(it)) if (G.rand() < ch) got[m] = (got[m] || 0) + a + Math.floor(G.rand() * (b - a + 1));
  // место в сумке: сама вещь освобождает ячейку; новые стопки — в неполные такие же или в свободные ячейки
  let need = 0; for (const [m, n] of Object.entries(got)) { let room = H.bag.reduce((s, x) => s + (x.kind === 'ench' && x.metal === m ? LOOT.stack - x.n : 0), 0); if (room < n) need += Math.ceil((n - room) / LOOT.stack); }
  if (need > freeCells(H) + 1) { emit(G, { k: 'toast', s: 'Сумка полна', id: 'bagfull' }); return null; }
  H.bag.splice(H.bag.indexOf(it), 1);
  for (const [m, n] of Object.entries(got)) addStack(H, makeStack('ench', m, n));
  const req = DE_REQ[tierOf(it)], col = skillColor(sk, req, ENCH.colors);
  if (sk < ENCH.cap && G.rand() < col.chance) { H.prof.enchant = sk + 1; emit(G, { k: 'skill', s: `Зачарование: ${sk + 1}` }); sfx(G, 'skill'); }
  H.stats.disenchanted = (H.stats.disenchanted || 0) + 1;
  if (!quiet) { sfx(G, 'potion'); emit(G, { k: 'toast', s: `Распылено: ${it.name} → ${Object.entries(got).map(([m, n]) => `<b style="color:${ENCH_MATS[m].col}">${ENCH_MATS[m].name} × ${n}</b>`).join(', ')}`, id: 'ench' }); }
  return got;
}
/** Распылить все зелёные вещи из сумки (кроме тех, что лучше надетых — их решает игрок сам). Возвращает {число, материалы}. */
export function disenchantAll(G, rar = 'good') {
  const H = G.hero, L = H.bag.filter(it => it.rar === rar && canDisenchant(H, it)), sum = {}; let n = 0;
  for (const it of L) { const got = disenchant(G, it, true); if (!got) break; n++; for (const [m, k] of Object.entries(got)) sum[m] = (sum[m] || 0) + k; }
  if (n) { sfx(G, 'potion'); emit(G, { k: 'toast', s: `Распылено вещей: ${n} → ${Object.entries(sum).map(([m, k]) => `<b style="color:${ENCH_MATS[m].col}">${ENCH_MATS[m].name} × ${k}</b>`).join(', ')}`, id: 'ench' }); }
  return { n, sum };
}

// ---------------------------------------------------------------- чары
/** Сколько раз хватит материалов на рецепт. */
export function canEnchant(H, id) { const R = ENCHANTS[id]; let n = 99; for (const [m, k] of Object.entries(R.mats)) n = Math.min(n, Math.floor(countOf(H, 'ench', m) / k)); return n; }
/** Вещи, на которые можно наложить рецепт: надетые и в сумке, нужного места. */
export function enchTargets(H, id) {
  const R = ENCHANTS[id], L = [];
  for (const it of Object.values(H.eq)) if (it && it.slot === R.slot && !it.kind) L.push(it);
  for (const it of H.bag) if (it.slot === R.slot && !it.kind && !it.trinket) L.push(it);
  return L;
}
/** Наложить чары на вещь (надетую или из сумки). */
export function enchant(G, id, target) {
  const H = G.hero, R = ENCHANTS[id], sk = enchSkill(H);
  if (!R || !target) return false;
  if (!sk) { emit(G, { k: 'toast', s: 'Сначала выучите зачарование в Мастерской чар в Столице', id: 'ench' }); return false; }
  if (!hasRod(H)) { emit(G, { k: 'toast', s: `Нужен жезл чародея — его делают в Мастерской чар из ${ENCH.rodBars} медных слитков`, id: 'ench' }); return false; }
  if (sk < R.req) { emit(G, { k: 'toast', s: `${R.name}: нужно зачарование ${R.req}`, id: 'ench' }); return false; }
  if (target.slot !== R.slot || target.kind) { emit(G, { k: 'toast', s: 'Эти чары — для другого места', id: 'ench' }); return false; }
  if (canEnchant(H, id) < 1) { emit(G, { k: 'toast', s: 'Не хватает материалов', id: 'ench' }); return false; }
  for (const [m, k] of Object.entries(R.mats)) takeStack(H, 'ench', m, k);
  target.ench = id;
  const col = skillColor(sk, R.req, ENCH.colors);
  if (sk < ENCH.cap && G.rand() < col.chance) { H.prof.enchant = sk + 1; emit(G, { k: 'skill', s: `Зачарование: ${sk + 1}` }); sfx(G, 'skill'); }
  H.stats.enchanted = (H.stats.enchanted || 0) + 1;
  sfx(G, 'potion'); emit(G, { k: 'toast', s: `Чары «${R.name}» наложены на «${target.name}»`, id: 'ench' });
  return true;
}
/** Бонус чар вещи (для heroStats и подсказки). */
export const enchBonus = it => (it && it.ench && ENCHANTS[it.ench] ? ENCHANTS[it.ench].bonus : null);
