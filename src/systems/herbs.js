// Травничество и алхимия (v84). Без рисования. Кусты трав — как жилы: области зоны (Z.herbs), состояние в герое (h.plants[зона]).
// Сбор — E у куста, 2 с, без инструмента. Варка — у котла (травница в Столице, трактир Хутора Подгорного): травы + склянка → зелье.
// Зелья двух родов (боевое/защитное) действуют по одному; h.elixir = { battle: {id, t}, guard: {id, t} } — переживает выход из игры.
import { HERBS, HERBAL } from '../../data/herbs.js';
import { POTIONS, ALCH } from '../../data/alchemy.js';
import { LOOT } from '../../data/balance.js';
import { makeStack } from './items.js';
import { addStack, countOf, takeStack } from './mining.js';
import { dist } from '../engine/util.js';

const emit = (G, e) => G.ev.push(e);
const sfx = (G, n) => G.ev.push({ k: 'sfx', n });

/** Цвет куста или рецепта для навыка (как у жил): red — рано, orange/yellow/green — растёт, gray — не растёт. */
export function skillColor(skill, req, table = HERBAL.colors) {
  if (skill < req) return { c: 'red', chance: 0 };
  const d = skill - req; for (const [lim, c, chance] of table) if (d < lim) return { c, chance };
  return { c: 'gray', chance: 0 };
}
export const herbSkill = H => (H.prof && H.prof.herbal) || 0;
export const alchSkill = H => (H.prof && H.prof.alchemy) || 0;

/** Место под куст: проходимо, не на дороге, не в посёлке и не в лагере, на ровном. Травы — ближе к дорогам и опушкам, чем жилы. */
function goodSpot(W, x, y, A) {
  if (!W.walkable(x, y) || W.edgeDist(x, y) < 60) return false;
  if (W.relief && (W.relief.levelAt(x, y) !== W.relief.levelAt(A.x, A.y) || !W.flatOk(x, y, 60))) return false;
  if (W.roadD(x, y) < 40) return false;
  if (W.town && dist(x, y, W.town.x, W.town.y) < W.town.R + 60) return false;
  if (W.camps.some(c => dist(x, y, c.x, c.y) < c.r + 70)) return false;
  if (W.inField && W.inField(x, y, 10)) return false;
  if (W.river && W.riverD(x, y) < W.river.w / 2 + 30) return false;
  if (W.blocks.some(b => !b.rect && dist(x, y, b.x, b.y) < b.rx + 40)) return false;
  if (W.rocks && W.rocks.some(o => dist(x, y, o.x, o.y) < o.w * 0.6 + 30)) return false;
  return true;
}
function placeIn(G, A) {
  for (let i = 0; i < 60; i++) { const a = G.rand() * Math.PI * 2, d = Math.sqrt(G.rand()) * A.r, x = A.x + Math.cos(a) * d, y = A.y + Math.sin(a) * d; if (goodSpot(G.W, x, y, A)) return { x: Math.round(x), y: Math.round(y) }; }
  return null;
}
/** Кусты зоны: из сохранения героя или новые. */
export function initPlants(G) {
  const H = G.hero, Z = G.W.Z, areas = Z.herbs || [];
  H.plants = H.plants || {}; const list = H.plants[Z.id] = (H.plants[Z.id] || []).filter(v => areas[v.a] && v.herb === areas[v.a].herb);
  areas.forEach((A, a) => {
    let have = list.filter(v => v.a === a).length;
    while (have < A.n) { const p = placeIn(G, A); if (!p) break; list.push({ a, herb: A.herb, x: p.x, y: p.y, at: 0, s: Math.floor(G.rand() * 1000) }); have++; }
  });
  G.plants = list;
}
const live = (G, v) => !v.at || v.at <= G.t;
/** Куст, у которого стоит герой (для E). */
export function plantNear(G) {
  const P = G.P; let best = null, bd = HERBAL.reach;
  for (const v of G.plants || []) { if (!live(G, v)) continue; const d = dist(P.x, P.y, v.x, v.y); if (d < bd && Math.abs(G.W.hAt(P.x, P.y) - G.W.hAt(v.x, v.y)) < 26) { bd = d; best = v; } }
  return best;
}
/** Начать сбор (E у куста). */
export function startGather(G, v) {
  const H = G.hero, P = G.P, Hb = HERBS[v.herb], sk = herbSkill(H);
  if (!sk) { emit(G, { k: 'toast', s: 'Чтобы собирать травы, выучите травничество у травницы в Столице', id: 'herb' }); return; }
  if (sk < Hb.req) { emit(G, { k: 'toast', s: `${Hb.name}: нужно травничество ${Hb.req} (у вас ${sk})`, id: 'herb' }); return; }
  if (G.t - P.lastCombat < 1.5) { emit(G, { k: 'toast', s: 'В бою не до трав', id: 'herb' }); return; }
  P.gather = { v, t: 0, max: HERBAL.time }; P.sit = false; P.face = Math.atan2(v.y - P.y, v.x - P.x); P.dir = v.x < P.x ? -1 : 1;
}
export function stopGather(G, why) { if (!G.P.gather) return; G.P.gather = null; if (why) emit(G, { k: 'toast', s: why, id: 'herb' }); }

/** Каждый кадр: сбор идёт, кусты вырастают в новых местах, зелья тикают. */
export function herbTick(G, dt) {
  const P = G.P, H = G.hero;
  for (const v of G.plants || []) if (v.at && v.at <= G.t) { const A = G.W.Z.herbs[v.a], p = A && placeIn(G, A); if (p) { v.x = p.x; v.y = p.y; } v.at = 0; v.s = Math.floor(G.rand() * 1000); }
  // зелья: время идёт и вне боя; кончилось — надпись
  const E = H.elixir || (H.elixir = { battle: null, guard: null });
  for (const k of ['battle', 'guard']) { const e = E[k]; if (!e) continue; e.t -= dt; if (e.t <= 0) { E[k] = null; emit(G, { k: 'toast', s: `${POTIONS[e.id].name}: действие кончилось`, id: 'elix' }); } }
  if (!P.gather) return;
  const v = P.gather.v; if (!live(G, v) || dist(P.x, P.y, v.x, v.y) > HERBAL.reach + 10) { stopGather(G); return; }
  P.gather.t += dt;
  if (P.gather.t < P.gather.max) return;
  const Hb = HERBS[v.herb], n = HERBAL.n[0] + Math.floor(G.rand() * (HERBAL.n[1] - HERBAL.n[0] + 1));
  const left = addStack(H, makeStack('herb', v.herb, n));
  emit(G, { k: 'txt', x: v.x, y: v.y - 50, s: `+${n - left} ${Hb.name.toLowerCase()}`, col: Hb.hi });
  if (left) emit(G, { k: 'toast', s: 'Сумка полна — часть трав осталась на кусте', id: 'bagfull' });
  H.stats.herbs = (H.stats.herbs || 0) + n - left;
  if (G.rand() < HERBAL.rare && !addStack(H, makeStack('herb', 'fireflower', 1))) { emit(G, { k: 'txt', x: v.x, y: v.y - 72, s: '+ Огнецвет!', col: HERBS.fireflower.col }); emit(G, { k: 'toast', s: `Редкая трава: <b style="color:${HERBS.fireflower.col}">Огнецвет</b>`, id: 'gem' }); }
  const sk = herbSkill(H), col = skillColor(sk, Hb.req);
  if (sk < HERBAL.cap && G.rand() < col.chance) { H.prof.herbal = sk + 1; emit(G, { k: 'skill', s: `Травничество: ${sk + 1}` }); sfx(G, 'skill'); }
  v.at = G.t + HERBAL.respawn[0] + G.rand() * (HERBAL.respawn[1] - HERBAL.respawn[0]);
  G.fx.push({ k: 'herbPick', x: v.x, y: v.y, t: 0.7, max: 0.7, seed: v.s, col: Hb.hi });
  P.gather = null; sfx(G, 'loot');
}

// ---------------------------------------------------------------- учителя
export function learnHerbal(G) {
  const H = G.hero; H.prof = H.prof || {};
  if (H.prof.herbal) { emit(G, { k: 'toast', s: 'Травничество уже изучено', id: 'guild' }); return false; }
  H.prof.herbal = 1; emit(G, { k: 'skill', s: 'Изучено: травничество (1)' }); sfx(G, 'levelUp'); return true;
}
export function learnAlchemy(G) {
  const H = G.hero; H.prof = H.prof || {};
  if (H.prof.alchemy) { emit(G, { k: 'toast', s: 'Алхимия уже изучена', id: 'guild' }); return false; }
  H.prof.alchemy = 1; emit(G, { k: 'skill', s: 'Изучена: алхимия (1)' }); sfx(G, 'levelUp'); return true;
}
/** Склянки у торговца. */
export function buyFlask(G, n = 1) {
  const H = G.hero, p = ALCH.flaskPrice * n;
  if (H.gold < p) { emit(G, { k: 'toast', s: 'Не хватает денег', id: 'gold' }); return false; }
  const left = addStack(H, makeStack('flask', 'flask', n)); if (left === n) { emit(G, { k: 'toast', s: 'Сумка полна', id: 'bagfull' }); return false; }
  H.gold -= ALCH.flaskPrice * (n - left); sfx(G, 'coin'); return true;
}

// ---------------------------------------------------------------- варка
/** Сколько раз можно сварить рецепт из того, что в сумке. */
export function canBrew(H, id) {
  const R = POTIONS[id]; let n = countOf(H, 'flask', 'flask');
  for (const [hb, k] of Object.entries(R.mats)) n = Math.min(n, Math.floor(countOf(H, 'herb', hb) / k));
  return Math.max(0, n);
}
/** Сварить зелье times раз (или сколько выйдет). Возвращает число сваренных. */
export function brew(G, id, times = 1) {
  const H = G.hero, R = POTIONS[id], sk = alchSkill(H);
  if (!sk) { emit(G, { k: 'toast', s: 'Сначала выучите алхимию у травницы в Столице', id: 'brew' }); return 0; }
  if (sk < R.req) { emit(G, { k: 'toast', s: `${R.name}: нужна алхимия ${R.req}`, id: 'brew' }); return 0; }
  let can = Math.min(times, canBrew(H, id)); if (can <= 0) { emit(G, { k: 'toast', s: 'Не хватает трав или склянок', id: 'brew' }); return 0; }
  if (R.heal) can = Math.min(can, Math.max(0, 10 - H.potions));
  if (can <= 0) { emit(G, { k: 'toast', s: 'Больше 10 зелий здоровья не унести', id: 'pot' }); return 0; }
  let done = 0;
  for (let i = 0; i < can; i++) {
    if (!R.heal && !freeFor(H, id)) { emit(G, { k: 'toast', s: 'Сумка полна', id: 'bagfull' }); break; }
    takeStack(H, 'flask', 'flask', 1); for (const [hb, k] of Object.entries(R.mats)) takeStack(H, 'herb', hb, k);
    if (R.heal) H.potions++; else addStack(H, makeStack('potion', id, 1));
    done++;
    const s = alchSkill(H), col = skillColor(s, R.req, ALCH.colors);
    if (s < ALCH.cap && G.rand() < col.chance) { H.prof.alchemy = s + 1; emit(G, { k: 'skill', s: `Алхимия: ${s + 1}` }); sfx(G, 'skill'); }
  }
  if (done) { H.stats.brewed = (H.stats.brewed || 0) + done; sfx(G, 'potion'); emit(G, { k: 'toast', s: `Сварено: ${R.name}${done > 1 ? ' × ' + done : ''}`, id: 'brew' }); }
  return done;
}
const freeFor = (H, id) => H.bag.some(it => it.kind === 'potion' && it.metal === id && it.n < LOOT.stack) || H.bag.length < LOOT.bag;

// ---------------------------------------------------------------- выпить
/** Выпить зелье из сумки (стопка it). Боевое/защитное — по одному, новое заменяет прежнее. */
export function drinkElixir(G, it) {
  const H = G.hero, P = G.P, R = POTIONS[it.metal]; if (!R || it.kind !== 'potion') return false;
  if (P.dead) return false;
  const E = H.elixir || (H.elixir = { battle: null, guard: null }), prev = E[R.kind];
  takeStack(H, 'potion', it.metal, 1);
  E[R.kind] = { id: it.metal, t: R.dur }; H.lastPot = it.metal;
  emit(G, { k: 'txt', x: P.x, y: P.y - 70, s: R.name, col: R.col });
  if (prev && prev.id !== it.metal) emit(G, { k: 'toast', s: `${POTIONS[prev.id].name} сменилось: ${R.name}`, id: 'elix' });
  G.fx.push({ k: 'drink', x: P.x, y: P.y, t: 0.8, max: 0.8, seed: 3, col: R.col });
  sfx(G, 'potion'); return true;
}
/** Клавиша 2: выпить последнее выбранное зелье (если оно есть в сумке). */
export function drinkLast(G) {
  const H = G.hero, id = H.lastPot, it = id && H.bag.find(x => x.kind === 'potion' && x.metal === id);
  if (!it) { emit(G, { k: 'toast', s: id ? `${POTIONS[id].name}: в сумке нет` : 'Выберите зелье в сумке — потом оно будет на клавише 2', id: 'elix' }); return false; }
  return drinkElixir(G, it);
}
/** Действующие зелья: сводка множителей для боя. */
export function elixirMods(H) {
  const E = H.elixir, m = { dmg: 1, taken: 1, speed: 1, crit: 0, xp: 1 }; if (!E) return m;
  for (const k of ['battle', 'guard']) { const e = E[k]; if (!e) continue; const R = POTIONS[e.id]; if (!R) continue; if (R.dmg) m.dmg *= 1 + R.dmg; if (R.taken) m.taken *= 1 - R.taken; if (R.speed) m.speed *= 1 + R.speed; if (R.crit) m.crit += R.crit; if (R.xp) m.xp *= 1 + R.xp; }
  return m;
}
