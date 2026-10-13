// Банк (v72): у банкира в Столице. Личный банк героя (h.bank, 64 ячейки) и общий сундук всех героев на устройстве
// (G.shared.items, 32 ячейки; хранится отдельно от героев — save.js). Без рисования: только перекладывание вещей.
import { LOOT } from '../../data/balance.js';
import { freePos } from './game.js';
import { isStackKind } from './items.js';

const emit = (G, e) => G.ev.push(e);
const sfx = (G, n) => G.ev.push({ k: 'sfx', n });
export const isStack = it => isStackKind(it);
const sameStack = (a, b) => isStack(a) && isStack(b) && a.kind === b.kind && a.metal === b.metal;

/** Хранилище по имени: 'bank' — личный банк героя, 'shared' — общий сундук. */
export function store(G, where) {
  if (where === 'shared') { G.shared = G.shared || { items: [] }; return { list: G.shared.items, size: LOOT.shared, shared: true }; }
  G.hero.bank = G.hero.bank || []; return { list: G.hero.bank, size: LOOT.bank };
}
const at = (S, pos) => S.list.find(x => x.pos === pos);
const freeIn = S => { for (let p = 0; p < S.size; p++) if (!at(S, p)) return p; return -1; };
const touch = (G, S) => { if (S.shared) G.sharedDirty = true; };

/** Сумка → хранилище (в ячейку pos, если свободна). Стопки сначала доливаются в такие же. false — места нет. */
export function stashPut(G, it, where, pos = null) {
  const H = G.hero, S = store(G, where), i = H.bag.indexOf(it); if (i < 0) return false;
  if (isStack(it)) {
    for (const o of S.list) { if (it.n <= 0) break; if (sameStack(o, it) && o.n < LOOT.stack) { const k = Math.min(it.n, LOOT.stack - o.n); o.n += k; it.n -= k; } }
    if (it.n <= 0) { H.bag.splice(i, 1); touch(G, S); sfx(G, 'equip'); return true; }
  }
  const p = pos != null && pos >= 0 && pos < S.size && !at(S, pos) ? pos : freeIn(S);
  if (p < 0) { touch(G, S); emit(G, { k: 'toast', s: S.shared ? 'Общий сундук полон' : 'В банке нет места', id: 'bankfull' }); return false; }
  H.bag.splice(i, 1); it.pos = p; S.list.push(it); touch(G, S); sfx(G, 'equip'); return true;
}
/** Хранилище → сумка (в ячейку pos, если свободна). Стопки доливаются в сумку; что не влезло — остаётся. */
export function stashTake(G, it, where, pos = null) {
  const H = G.hero, S = store(G, where), i = S.list.indexOf(it); if (i < 0) return false;
  if (isStack(it)) {
    for (const o of H.bag) { if (it.n <= 0) break; if (sameStack(o, it) && o.n < LOOT.stack) { const k = Math.min(it.n, LOOT.stack - o.n); o.n += k; it.n -= k; } }
    if (it.n <= 0) { S.list.splice(i, 1); touch(G, S); sfx(G, 'equip'); return true; }
  }
  if (H.bag.length >= LOOT.bag || freePos(H) < 0) { touch(G, S); emit(G, { k: 'toast', s: 'Сумка полна', id: 'bagfull' }); return false; }
  S.list.splice(i, 1); const p = pos != null && pos >= 0 && pos < LOOT.bag && !H.bag.some(x => x.pos === pos) ? pos : freePos(H);
  it.pos = p; H.bag.push(it); touch(G, S); sfx(G, 'equip'); return true;
}
/** Переложить внутри хранилища; на занятую ячейку — меняются местами (одинаковые стопки — сливаются). */
export function stashMove(G, it, where, pos) {
  const S = store(G, where); if (!S.list.includes(it) || pos < 0 || pos >= S.size || it.pos === pos) return;
  const o = at(S, pos);
  if (o && sameStack(o, it) && o.n < LOOT.stack) { const k = Math.min(it.n, LOOT.stack - o.n); o.n += k; it.n -= k; if (it.n <= 0) S.list.splice(S.list.indexOf(it), 1); touch(G, S); return; }
  if (o) o.pos = it.pos; it.pos = pos; touch(G, S);
}
/** Из одного хранилища в другое (личный банк ↔ общий сундук). */
export function stashSwap(G, it, from, to, pos = null) {
  const A = store(G, from), B = store(G, to), i = A.list.indexOf(it); if (i < 0) return false;
  if (isStack(it)) { for (const o of B.list) { if (it.n <= 0) break; if (sameStack(o, it) && o.n < LOOT.stack) { const k = Math.min(it.n, LOOT.stack - o.n); o.n += k; it.n -= k; } } if (it.n <= 0) { A.list.splice(i, 1); touch(G, A); touch(G, B); return true; } }
  const p = pos != null && pos >= 0 && pos < B.size && !at(B, pos) ? pos : freeIn(B);
  if (p < 0) { touch(G, A); touch(G, B); emit(G, { k: 'toast', s: B.shared ? 'Общий сундук полон' : 'В банке нет места', id: 'bankfull' }); return false; }
  A.list.splice(i, 1); it.pos = p; B.list.push(it); touch(G, A); touch(G, B); sfx(G, 'equip'); return true;
}
/** Положить в банк всю руду, слитки и самоцветы из сумки. */
export function stashMaterials(G, where = 'bank') { let n = 0; for (const it of G.hero.bag.slice()) if (isStack(it) && stashPut(G, it, where)) n++; return n; }
/** Привести в порядок: ячейки без повторов и в пределах размера (для старых и испорченных сохранений). */
export function fixSlots(list, size) {
  const used = new Set(); for (const it of list) { if (!(Number.isInteger(it.pos) && it.pos >= 0 && it.pos < size) || used.has(it.pos)) it.pos = null; else used.add(it.pos); }
  let p = 0; for (const it of list) if (it.pos == null) { while (used.has(p)) p++; it.pos = p; used.add(p); }
  return list;
}
