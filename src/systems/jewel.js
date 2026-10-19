// Ювелирное дело (v131): учитель, огранка камней, кольца и шеи из слитков, ремесленные аксессуары. Без рисования.
// Рецепты — data/jewelcraft.js; материалы — стопки (gem/bar) из сумки; время — через очередь ремесла (craft.js, k = 'jewel').
import { JEWEL, JEWEL_RECIPES } from '../../data/jewelcraft.js';
import { GEMS } from '../../data/mining.js';
import { LOOT } from '../../data/balance.js';
import { makeStack, makeItem, makeTrinket } from './items.js';
import { addStack, countOf, takeStack } from './mining.js';
import { skillColor } from './herbs.js';

const emit = (G, e) => G.ev.push(e);
const sfx = (G, n) => G.ev.push({ k: 'sfx', n });
export const jewelSkill = H => (H.prof && H.prof.jewel) || 0;
const freePos = H => { for (let p = 0; p < LOOT.bag; p++) if (!H.bag.some(x => x.pos === p)) return p; return -1; };

export function learnJewel(G) {
  const H = G.hero; H.prof = H.prof || {};
  if (H.prof.jewel) { emit(G, { k: 'toast', s: 'Ювелирное дело уже изучено', id: 'guild' }); return false; }
  H.prof.jewel = 1; emit(G, { k: 'skill', s: 'Изучено: ювелирное дело (1)' }); sfx(G, 'levelUp'); return true;
}
/** Сколько раз хватает материалов (0 — нельзя). */
export function canJewel(H, id) { const R = JEWEL_RECIPES[id]; if (!R) return 0; let n = 99; for (const [kind, what, k] of R.mats) n = Math.min(n, Math.floor(countOf(H, kind, what) / k)); return n; }
/** Материалы словами — для окна: [[название, нужно, есть]]. */
export function jewelMats(H, id) { return JEWEL_RECIPES[id].mats.map(([kind, what, k]) => [kind === 'gem' ? GEMS[what].name : (what === 'copper' ? 'Медный слиток' : what === 'tin' ? 'Оловянный слиток' : 'Железный слиток'), k, countOf(H, kind, what)]); }
/** Сделать одну штуку по рецепту. Возвращает что вышло (стопка или вещь) или null. */
export function makeJewel(G, id) {
  const H = G.hero, R = JEWEL_RECIPES[id], sk = jewelSkill(H);
  if (!sk) { emit(G, { k: 'toast', s: 'Сначала выучите ювелирное дело у Златана в Ювелирной мастерской', id: 'jewel' }); return null; }
  if (!R) return null;
  if (sk < R.req) { emit(G, { k: 'toast', s: `${R.name}: нужно ювелирное дело ${R.req}`, id: 'jewel' }); return null; }
  if (canJewel(H, id) < 1) { emit(G, { k: 'toast', s: 'Не хватает материалов', id: 'jewel' }); return null; }
  // место: камень — в стопку такую же или свободную ячейку; вещь — свободная ячейка (материалы могут освободить ячейки, но не считаем на это)
  if (R.k === 'gem') { const room = H.bag.some(x => x.kind === 'gem' && x.metal === R.out && x.n < LOOT.stack); if (!room && freePos(H) < 0) { emit(G, { k: 'toast', s: 'Сумка полна', id: 'bagfull' }); return null; } }
  else if (freePos(H) < 0) { emit(G, { k: 'toast', s: 'Сумка полна', id: 'bagfull' }); return null; }
  for (const [kind, what, k] of R.mats) takeStack(H, kind, what, k);
  let out;
  if (R.k === 'gem') { out = makeStack('gem', R.out, 1); addStack(H, out); }
  else if (R.k === 'item') { out = makeItem(H.cls, R.slot, R.ilvl, R.rar, G.rand); out.pos = freePos(H); H.bag.push(out); }
  else { out = makeTrinket(H.cls, R.ilvl, 'rare', G.rand, R.trinket); out.pos = freePos(H); H.bag.push(out); }
  const col = skillColor(sk, R.req, JEWEL.colors);
  if (sk < JEWEL.cap && G.rand() < col.chance) { H.prof.jewel = sk + 1; emit(G, { k: 'skill', s: `Ювелирное дело: ${sk + 1}` }); sfx(G, 'skill'); }
  H.stats.jewels = (H.stats.jewels || 0) + 1;
  sfx(G, 'smelt'); emit(G, { k: 'toast', s: `Готово: <b>${out.name}</b>`, id: 'jewel' });
  return out;
}
