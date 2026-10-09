// Горное дело (v61): жилы в областях зоны, добыча с навыком по цветам, плавка, учитель и кирка.
// Без рисования. Состояние жил хранится в герое (h.veins[зона]), чтобы не появлялись заново при каждом входе.
import { ORES, MINE, veinColor } from '../../data/mining.js';
import { LOOT } from '../../data/balance.js';
import { makeStack, makePick } from './items.js';
import { dist } from '../engine/util.js';

const emit = (G, e) => G.ev.push(e);
const sfx = (G, n) => G.ev.push({ k: 'sfx', n });

/** Подходит ли место под жилу: проходимо, не на дороге, не в лагере, не в городе, не в поле и не у воды. */
function goodSpot(W, x, y) {
  if (!W.walkable(x, y) || W.edgeDist(x, y) < 70) return false;
  if (W.roadD(x, y) < 70) return false;
  if (W.town && dist(x, y, W.town.x, W.town.y) < W.town.R + 80) return false;
  if (W.camps.some(c => dist(x, y, c.x, c.y) < c.r + 90)) return false;
  if (W.inField && W.inField(x, y, 20)) return false;
  if (W.river && W.riverD(x, y) < W.river.w / 2 + 40) return false;
  if (W.blocks.some(b => !b.rect && dist(x, y, b.x, b.y) < b.rx + 50)) return false;
  return true;
}
function placeIn(G, A) {
  for (let i = 0; i < 60; i++) { const a = G.rand() * Math.PI * 2, d = Math.sqrt(G.rand()) * A.r, x = A.x + Math.cos(a) * d, y = A.y + Math.sin(a) * d; if (goodSpot(G.W, x, y)) return { x: Math.round(x), y: Math.round(y) }; }
  return null;
}

/** Жилы зоны: из сохранения героя или новые. */
export function initVeins(G) {
  const H = G.hero, Z = G.W.Z, areas = Z.ore || [];
  H.veins = H.veins || {}; const list = H.veins[Z.id] = (H.veins[Z.id] || []).filter(v => areas[v.a] && v.metal === areas[v.a].metal);
  areas.forEach((A, a) => {
    let have = list.filter(v => v.a === a).length;
    while (have < A.n) { const p = placeIn(G, A); if (!p) break; list.push({ a, metal: A.metal, x: p.x, y: p.y, at: 0, s: Math.floor(G.rand() * 1000) }); have++; }
  });
  G.veins = list;
}
const live = (G, v) => !v.at || v.at <= G.t;

/** Жила, у которой стоит герой (для E). */
export function veinNear(G) {
  const P = G.P; let best = null, bd = MINE.reach;
  for (const v of G.veins || []) { if (!live(G, v)) continue; const d = dist(P.x, P.y, v.x, v.y); if (d < bd) { bd = d; best = v; } }
  return best;
}
export const miningSkill = H => (H.prof && H.prof.mining) || 0;
export const hasPick = H => H.bag.some(it => it.tool === 'pick');

/** Начать копать (E у жилы). */
export function startMine(G, v) {
  const H = G.hero, P = G.P, O = ORES[v.metal], sk = miningSkill(H);
  if (!sk) { emit(G, { k: 'toast', s: 'Чтобы копать руду, выучите горное дело в Гильдии рудокопов в Столице', id: 'mine' }); return; }
  if (!hasPick(H)) { emit(G, { k: 'toast', s: 'Нужна кирка — её продают в Гильдии рудокопов', id: 'mine' }); return; }
  if (sk < O.req) { emit(G, { k: 'toast', s: `${O.vein}: нужно горное дело ${O.req} (у вас ${sk})`, id: 'mine' }); return; }
  if (G.t - P.lastCombat < 1.5) { emit(G, { k: 'toast', s: 'В бою не до руды', id: 'mine' }); return; }
  P.mine = { v, t: 0, max: MINE.time }; P.sit = false; P.face = Math.atan2(v.y - P.y, v.x - P.x); P.dir = v.x < P.x ? -1 : 1;
}
/** Прервать копание (движение, удар, урон). */
export function stopMine(G, why) { if (!G.P.mine) return; G.P.mine = null; if (why) emit(G, { k: 'toast', s: why, id: 'mine' }); }

/** Каждый кадр: копание идёт, жилы возвращаются в новые места. */
export function mineTick(G, dt) {
  const P = G.P, H = G.hero;
  for (const v of G.veins || []) if (v.at && v.at <= G.t) { // вернулась: в другом месте той же области
    const A = G.W.Z.ore[v.a], p = A && placeIn(G, A); if (p) { v.x = p.x; v.y = p.y; } v.at = 0; v.s = Math.floor(G.rand() * 1000);
  }
  if (!P.mine) return;
  const v = P.mine.v; if (!live(G, v) || dist(P.x, P.y, v.x, v.y) > MINE.reach + 10) { stopMine(G); return; }
  P.mine.t += dt;
  if (Math.floor((P.mine.t - dt) / 0.6) !== Math.floor(P.mine.t / 0.6)) sfx(G, 'mine');
  if (P.mine.t < P.mine.max) return;
  // готово: руда, навык, жила пропадает
  const O = ORES[v.metal], n = MINE.ore[0] + Math.floor(G.rand() * (MINE.ore[1] - MINE.ore[0] + 1));
  const left = addStack(H, makeStack('ore', v.metal, n));
  emit(G, { k: 'txt', x: v.x, y: v.y - 60, s: `+${n - left} ${O.ore.toLowerCase()}`, col: '#f0a060' });
  if (left) emit(G, { k: 'toast', s: 'Сумка полна — часть руды осталась в жиле', id: 'bagfull' });
  H.stats.ore = (H.stats.ore || 0) + n - left;
  const sk = miningSkill(H), col = veinColor(sk, O.req);
  if (sk < MINE.cap && G.rand() < col.chance) { H.prof.mining = sk + 1; emit(G, { k: 'skill', s: `Горное дело: ${sk + 1}` }); sfx(G, 'skill'); }
  v.at = G.t + MINE.respawn[0] + G.rand() * (MINE.respawn[1] - MINE.respawn[0]);
  P.mine = null; sfx(G, 'loot');
}

// ---------------------------------------------------------------- стопки
const isStack = it => it && (it.kind === 'ore' || it.kind === 'bar');
const freePos = H => { for (let p = 0; p < LOOT.bag; p++) if (!H.bag.some(x => x.pos === p)) return p; return -1; };
/** Положить стопку: сперва в неполные такие же, остаток — в свободные ячейки. Возвращает, сколько не влезло. */
export function addStack(H, st) {
  let n = st.n;
  for (const it of H.bag) { if (n <= 0) break; if (isStack(it) && it.kind === st.kind && it.metal === st.metal && it.n < LOOT.stack) { const k = Math.min(n, LOOT.stack - it.n); it.n += k; n -= k; } }
  while (n > 0) { const p = freePos(H); if (p < 0) break; const k = Math.min(n, LOOT.stack); H.bag.push({ ...st, id: st.id + ':' + p + ':' + n, n: k, pos: p }); n -= k; }
  return n;
}
/** Сколько всего такой руды/слитков в сумке. */
export const countOf = (H, kind, metal) => H.bag.reduce((s, it) => s + (isStack(it) && it.kind === kind && it.metal === metal ? it.n : 0), 0);
function takeStack(H, kind, metal, n) {
  for (const it of H.bag.slice().sort((a, b) => a.n - b.n)) { if (n <= 0) break; if (isStack(it) && it.kind === kind && it.metal === metal) { const k = Math.min(n, it.n); it.n -= k; n -= k; if (it.n <= 0) H.bag.splice(H.bag.indexOf(it), 1); } }
}

// ---------------------------------------------------------------- учитель, кирка, плавка
export function learnMining(G) {
  const H = G.hero; H.prof = H.prof || {};
  if (H.prof.mining) { emit(G, { k: 'toast', s: 'Горное дело уже изучено', id: 'guild' }); return false; }
  H.prof.mining = 1; emit(G, { k: 'skill', s: 'Изучено: горное дело (1)' }); sfx(G, 'levelUp'); return true;
}
export function buyPick(G) {
  const H = G.hero;
  if (hasPick(H)) { emit(G, { k: 'toast', s: 'Кирка уже есть', id: 'guild' }); return false; }
  if (H.gold < MINE.pickPrice) { emit(G, { k: 'toast', s: 'Не хватает денег', id: 'gold' }); return false; }
  if (freePos(H) < 0) { emit(G, { k: 'toast', s: 'Сумка полна', id: 'bagfull' }); return false; }
  H.gold -= MINE.pickPrice; const it = makePick(); it.pos = freePos(H); H.bag.push(it); sfx(G, 'coin'); return true;
}
/** Переплавить: times раз по 2 руды → 1 слиток (или сколько выйдет). Возвращает число слитков. */
export function smelt(G, metal, times = 1) {
  const H = G.hero, O = ORES[metal], sk = miningSkill(H);
  if (!sk) { emit(G, { k: 'toast', s: 'Сначала выучите горное дело в Гильдии рудокопов', id: 'smelt' }); return 0; }
  if (sk < O.req) { emit(G, { k: 'toast', s: `${O.bar}: нужно горное дело ${O.req}`, id: 'smelt' }); return 0; }
  const can = Math.min(times, Math.floor(countOf(H, 'ore', metal) / MINE.smelt)); if (can <= 0) { emit(G, { k: 'toast', s: `Не хватает руды: нужно ${MINE.smelt}`, id: 'smelt' }); return 0; }
  takeStack(H, 'ore', metal, can * MINE.smelt);
  const left = addStack(H, makeStack('bar', metal, can));
  if (left) addStack(H, makeStack('ore', metal, left * MINE.smelt));   // не влезло — руда возвращается
  sfx(G, 'smelt'); return can - left;
}
