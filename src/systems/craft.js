// v112: ремесло со временем, как в WoW. Плавка, варка, чары, распыление и жезл делаются не мгновенно, а по одной вещи за CRAFT[вид] секунд.
// Очередь заданий в P.craft = { q: [{ k, a, b, n }], t, max } — «Сделать всё» кладёт одно задание с n штук; распыление по щелчку — по заданию на вещь.
// Шаг, удар, умение, урон, гибель прерывают; сделанное остаётся, материал на прерванную вещь не тратится (снимается только в конце полоски).
import { CRAFT } from '../../data/balance.js';
import { ORES, MINE } from '../../data/mining.js';
import { POTIONS } from '../../data/alchemy.js';
import { ENCHANTS, ENCH, ENCH_MATS } from '../../data/enchanting.js';
import { smelt, countOf, miningSkill } from './mining.js';
import { brew, canBrew, alchSkill } from './herbs.js';
import { enchant, disenchant, canDisenchant, craftRod, canEnchant, hasRod, enchSkill } from './enchant.js';
import { JEWEL_RECIPES, JEWEL_TIME } from '../../data/jewelcraft.js';
import { makeJewel, canJewel, jewelSkill } from './jewel.js';

const emit = (G, e) => G.ev.push(e);
/** Время одной штуки: у ювелира — по роду рецепта (v131). */
const timeOf = j => j.k === 'jewel' ? JEWEL_TIME[JEWEL_RECIPES[j.a].k] : CRAFT[j.k];
/** Что делается: название для полоски. */
export function craftLabel(j) {
  if (!j) return '';
  if (j.k === 'smelt') return `Плавка: ${ORES[j.a].bar}`;
  if (j.k === 'brew') return `Варка: ${POTIONS[j.a].name}`;
  if (j.k === 'ench') return `Чары: ${ENCHANTS[j.a].name}`;
  if (j.k === 'de') return `Распыление: ${j.a.name}`;
  if (j.k === 'rod') return 'Жезл чародея';
  if (j.k === 'jewel') return `Ювелир: ${JEWEL_RECIPES[j.a].name}`;
  return '';
}
/** Можно ли сделать ещё одну штуку (без траты; сообщения — у самих функций при попытке). */
function canOne(G, j) {
  const H = G.hero;
  if (j.k === 'smelt') return miningSkill(H) >= ORES[j.a].req && countOf(H, 'ore', j.a) >= MINE.smelt;
  if (j.k === 'brew') return alchSkill(H) >= POTIONS[j.a].req && canBrew(H, j.a) > 0 && (!POTIONS[j.a].heal || H.potions < 10);
  if (j.k === 'ench') return hasRod(H) && enchSkill(H) >= ENCHANTS[j.a].req && canEnchant(H, j.a) > 0 && !!j.b;
  if (j.k === 'de') return hasRod(H) && enchSkill(H) > 0 && canDisenchant(H, j.a);
  if (j.k === 'rod') return !hasRod(H) && countOf(H, 'bar', 'copper') >= ENCH.rodBars;
  if (j.k === 'jewel') return jewelSkill(H) >= JEWEL_RECIPES[j.a].req && canJewel(H, j.a) > 0;
  return false;
}
/** Сделать одну штуку — прежними функциями профессий (они и тратят, и поднимают навык, и пишут сообщения). */
function doOne(G, j) {
  if (j.k === 'smelt') return smelt(G, j.a, 1) > 0;
  if (j.k === 'brew') return brew(G, j.a, 1) > 0;
  if (j.k === 'ench') return enchant(G, j.a, j.b);
  if (j.k === 'de') { const got = disenchant(G, j.a, !!j.quiet); if (got && j.sum) { for (const [m, k] of Object.entries(got)) j.sum[m] = (j.sum[m] || 0) + k; j.cnt.n++; } return !!got; }
  if (j.k === 'rod') return craftRod(G);
  if (j.k === 'jewel') return !!makeJewel(G, j.a);
  return false;
}
/** Поставить в очередь: k — вид, a — что (руда/рецепт/вещь), n — сколько штук (999 — всё, что хватит), b — цель чар. */
export function startCraft(G, k, a, n = 1, b = null, opt = {}) {
  const P = G.P; if (P.dead) return false;
  const j = { k, a, b, n, quiet: opt.quiet, sum: opt.sum, cnt: opt.cnt };
  if (!canOne(G, j)) { doOne(G, j); return false; }   // нельзя — пусть сама функция скажет почему (при нехватке она ничего не тратит)
  if (k === 'de' && P.craft && P.craft.q.some(x => x.k === 'de' && x.a === a)) return false;   // эта вещь уже в очереди
  if (!P.craft) { P.craft = { q: [], t: 0, max: timeOf(j) }; P.sit = false; P.auto = null; P.goal = null; }
  P.craft.q.push(j); if (P.craft.q.length === 1) { P.craft.t = 0; P.craft.max = timeOf(j); }
  emit(G, { k: 'craft' }); return true;
}
/** Прервать (сделанное остаётся). */
export function stopCraft(G, why) {
  const P = G.P; if (!P.craft) return;
  const fin = [...P.craft.q].reverse().find(j => j.after && j.cnt && j.cnt.n > 0);   // прервали «распылить все» — итог всё равно показать
  P.craft = null; if (fin) fin.after(fin); if (why) emit(G, { k: 'toast', s: why, id: 'craft' }); emit(G, { k: 'craft' });
}
/** Сколько штук задания ещё можно сделать (по материалам). */
function maxOf(G, j) {
  const H = G.hero;
  if (j.k === 'smelt') return Math.floor(countOf(H, 'ore', j.a) / MINE.smelt);
  if (j.k === 'brew') return POTIONS[j.a].heal ? Math.min(canBrew(H, j.a), 10 - H.potions) : canBrew(H, j.a);
  if (j.k === 'ench') return canEnchant(H, j.a);
  if (j.k === 'jewel') return canJewel(H, j.a);
  return 1;
}
/** Сколько ещё осталось в очереди (для полоски): штук всего, вместе с той, что делается. */
export function craftLeft(G) { const C = G.P.craft; if (!C) return 0; let n = 0; for (const j of C.q) n += Math.max(0, Math.min(j.n, maxOf(G, j))); return n; }
/** Распылить несколько вещей подряд: в конце — одно сообщение с итогом. */
export function startDeAll(G, items) {
  const sum = {}, cnt = { n: 0 }, L = items.filter(it => canDisenchant(G.hero, it)); let n = 0;
  L.forEach((it, i) => { if (startCraft(G, 'de', it, 1, null, { quiet: true, sum, cnt })) n++; });
  const q = G.P.craft && G.P.craft.q, last = q && [...q].reverse().find(j => j.sum === sum);
  if (last) last.after = () => { const got = Object.entries(sum); if (got.length) emit(G, { k: 'toast', s: `Распылено вещей: ${cnt.n} → ${got.map(([m, k]) => `<b style="color:${ENCH_MATS[m].col}">${ENCH_MATS[m].name} × ${k}</b>`).join(', ')}`, id: 'ench' }); emit(G, { k: 'sfx', n: 'potion' }); };
  return n;
}
/** Раз в кадр. */
export function craftTick(G, dt) {
  const P = G.P, C = P.craft; if (!C) return;
  if (P.dead) { P.craft = null; return; }
  const j = C.q[0]; if (!j) { P.craft = null; emit(G, { k: 'craft' }); return; }
  C.t += dt; if (C.t < C.max) return;
  const ok = canOne(G, j) && doOne(G, j);
  if (ok) { j.n--; j.done = (j.done || 0) + 1; emit(G, { k: 'craft', unit: true }); emit(G, { k: 'craftfx', kind: j.k }); }
  if (!ok || j.n <= 0 || !canOne(G, j)) { C.q.shift(); if (j.after) j.after(j); }
  C.t = 0; const nx = C.q[0];
  if (!nx) { P.craft = null; emit(G, { k: 'craft' }); return; }
  C.max = timeOf(nx);
}
