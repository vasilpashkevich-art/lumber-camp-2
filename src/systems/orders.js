// v126: доска заказов (дейлики) и лавка Королевского квартирмейстера (всё за Королевские печати).
// Состояние у героя: h.orders = { day, act: {key: {n}}, done: {key: true}, bonus: {zone: true} }, печати — h.tokens.
// key = zone + '|' + id. День — по часам игрока (полночь); с новым днём доска очищается, взятые вчера — пропадают.
// Без рисования и DOM: окно рисует UI по данным отсюда; события — в G.ev.
import { ORDERS, ORDER, TOKEN, ROYAL } from '../../data/orders.js';
import { CONTINENT } from '../../data/zones.js';
import { MOBS } from '../../data/mobs.js';
import { MOUNTS } from '../../data/mounts.js';
import { ORES, GEMS } from '../../data/mining.js';
import { HERBS } from '../../data/herbs.js';
import { ENCH_MATS } from '../../data/enchanting.js';
import { TRINKETS } from '../../data/trinkets.js';
import { rng, plural } from '../engine/util.js';
import { addXp, heroStats } from '../entities/hero.js';
import { xpKill, LOOT } from '../../data/balance.js';
import { makeItem, makeTrinket, makeStack } from './items.js';
import { countOf, takeStack, addStack } from './mining.js';

const emit = (G, e) => G.ev.push(e);
const sfx = (G, n) => G.ev.push({ k: 'sfx', n });
const toast = (G, s, kind = '') => emit(G, { k: 'toast', s, kind, id: 'orders' });

/** Номер дня по часам игрока (полночь). now — для тестов. */
export function dayOf(now = Date.now()) { const d = new Date(now); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000); }
/** Состояние заказов героя; при новом дне — очищается. */
export function oState(h, now = Date.now()) {
  if (!h.orders) h.orders = { day: -1, act: {}, done: {}, bonus: {} };
  const d = dayOf(now);
  if (h.orders.day !== d) h.orders = { day: d, act: {}, done: {}, bonus: {} };
  if (h.tokens == null) h.tokens = 0;
  return h.orders;
}
/** Заказы на доске зоны сегодня: ORDER.perDay разных, по зерну дня. */
export function boardOf(zone, now = Date.now()) {
  const L = ORDERS[zone] || []; if (!L.length) return [];
  const day = dayOf(now), r = rng(day * 7919 + zone.length * 131 + zone.charCodeAt(0)), pool = L.slice(), out = [];
  while (out.length < Math.min(ORDER.perDay, L.length)) { const i = Math.floor(r() * pool.length); const T = pool.splice(i, 1)[0]; out.push({ ...T, zone, key: zone + '|' + T.id, need: T.n[0] + Math.floor(r() * (T.n[1] - T.n[0] + 1)) }); }
  return out;
}
const zoneLvl = zone => (CONTINENT.find(z => z.id === zone) || { lvl: [1, 6] }).lvl;
/** Зона «серая» для героя — печатей не дают. */
export const greyFor = (h, zone) => h.lvl >= zoneLvl(zone)[1] + ORDER.grey;
const mobName = m => (MOBS[m] && MOBS[m].name) || m;
const stackName = (kind, metal) => kind === 'ore' ? ORES[metal].ore : kind === 'bar' ? ORES[metal].bar : kind === 'herb' ? HERBS[metal].name : kind === 'gem' ? GEMS[metal].name : kind === 'ench' ? ENCH_MATS[metal].name : metal;
/** Что нужно сделать — строкой. */
export function orderGoal(T) {
  if (T.k === 'kill' || T.k === 'leader') { const ms = Array.isArray(T.mob) ? T.mob : [T.mob]; return `${T.k === 'leader' ? 'Убить любых' : 'Убить'}: ${ms.map(mobName).join(', ')} — ${T.need}`; }
  if (T.k === 'rare') return `Сразить: ${mobName(T.mob)}`;
  if (T.k === 'gather') return `Принести: ${stackName(T.kind, T.metal)} — ${T.need}`;
  return '';
}
/** Сколько сделано (для gather — сколько в сумке). */
export function orderProgress(h, T) {
  const S = oState(h), A = S.act[T.key]; if (!A) return 0;
  if (T.k === 'gather') return Math.min(T.need, countOf(h, T.kind, T.metal));
  return Math.min(T.need, A.n || 0);
}
export const orderReady = (h, T) => !!oState(h).act[T.key] && orderProgress(h, T) >= T.need;
/** Награда за заказ: печати (0 в серой зоне), деньги, опыт. */
export function orderReward(h, T) {
  const L = zoneLvl(T.zone), lv = Math.round((L[0] + L[1]) / 2), grey = greyFor(h, T.zone);
  return { tok: grey ? 0 : (T.tok ?? ORDER.tok), money: Math.round(lv * 10 * ORDER.moneyK), xp: Math.round(xpKill(lv, h.lvl) * ORDER.xpK), grey };
}
/** Взять заказ. */
export function oTake(G, T) {
  const h = G.hero, S = oState(h);
  if (S.done[T.key]) { toast(G, 'Этот заказ сегодня уже выполнен'); return false; }
  if (S.act[T.key]) return false;
  if (T.prof && !(h.prof && h.prof[T.prof])) { toast(G, T.prof === 'mining' ? 'Нужно горное дело — учат в Гильдии рудокопов' : 'Нужно травничество — учит травница Агафья'); return false; }
  S.act[T.key] = { n: 0, need: T.need }; sfx(G, 'loot'); emit(G, { k: 'orders' }); return true;
}
/** Отказаться от заказа (счёт сбрасывается). */
export function oDrop(G, T) { const S = oState(G.hero); if (!S.act[T.key]) return false; delete S.act[T.key]; emit(G, { k: 'orders' }); return true; }
/** Сдать заказ на доске. */
export function oTurnIn(G, T) {
  const h = G.hero, S = oState(h); if (!orderReady(h, T)) return false;
  if (T.k === 'gather') takeStack(h, T.kind, T.metal, T.need);
  delete S.act[T.key]; S.done[T.key] = true;
  const R = orderReward(h, T); h.gold += R.money; h.stats.gold = (h.stats.gold || 0) + R.money; h.tokens += R.tok;
  if (addXp(h, R.xp)) { G.st = heroStats(h); G.P.hp = G.st.maxHp; emit(G, { k: 'lvl', L: h.lvl }); sfx(G, 'levelUp'); }
  let s = `Заказ выполнен: <b>${T.name}</b>. ` + (R.tok ? `+${R.tok} ${plural(R.tok, TOKEN.short, 'печати', 'печатей')}` : 'Печатей нет — вы переросли этот край');
  // все заказы дня этой зоны — ещё печати
  const all = boardOf(T.zone).every(o => S.done[o.key]);
  if (all && !S.bonus[T.zone] && !R.grey) { S.bonus[T.zone] = true; h.tokens += ORDER.bonus; s += `. Все заказы дня — ещё +${ORDER.bonus}!`; }
  emit(G, { k: 'coins', v: R.money }); emit(G, { k: 'txt', x: G.P.x, y: G.P.y - 90, s: `+${R.xp} опыта`, col: '#c8a0ff' }); sfx(G, 'coin'); toast(G, s, 'good'); emit(G, { k: 'orders' }); return true;
}
/** Из killMob: засчитать убийство во взятые заказы этой зоны. */
export function oOnKill(G, m) {
  const h = G.hero, S = oState(h), zone = G.W.Z.id;
  for (const key of Object.keys(S.act)) { const [z, id] = key.split('|'); if (z !== zone) continue; const T0 = (ORDERS[z] || []).find(o => o.id === id); if (!T0 || T0.k === 'gather') continue;
    const A = S.act[key], need = A.need || T0.n[1], ms = Array.isArray(T0.mob) ? T0.mob : [T0.mob]; if (!ms.includes(m.kind) || A.n >= need) continue; A.n++;
    if (A.n >= need) toast(G, `<b>${T0.name}</b> — готово! Сдайте на доске заказов`, 'good'); else emit(G, { k: 'txt', x: m.x, y: m.y - 60, s: `${T0.name}: ${A.n}/${need}`, col: '#ffe08a' });
  }
}
/** Взятые заказы в этой зоне (для отслеживания). */
export function activeOrders(h, zone) { const S = oState(h); return boardOf(zone).filter(T => S.act[T.key]); }

// ---------------------------------------------------------------- лавка квартирмейстера
export const royalWares = () => ROYAL;
export function royalName(W) { return W.k === 'mount' ? MOUNTS[W.mount].name : W.name; }
/** Купить за печати. choice — для item: место; для trinket: id аксессуара; для chest: что внутри. */
export function buyRoyal(G, W, choice) {
  const h = G.hero; if (h.tokens == null) h.tokens = 0;
  if (h.tokens < W.price) { toast(G, `Не хватает печатей: нужно ${W.price}, у вас ${h.tokens}`); return false; }
  if (W.k === 'mount') { const M = MOUNTS[W.mount]; if (h.mounts.includes(W.mount)) { toast(G, 'Этот баран уже ваш'); return false; } if (h.lvl < M.lvl) { toast(G, `Бараны — с ${M.lvl}-го уровня`); return false; }
    h.tokens -= W.price; h.mounts.push(W.mount); h.mount = W.mount; sfx(G, 'levelUp'); toast(G, `Ваш <b>${M.name}</b>! Сесть верхом — Z или кнопка с подковой`, 'good'); emit(G, { k: 'mounts' }); return true; }
  if (W.k === 'item') { const slot = choice; if (!['weapon', 'head', 'chest', 'legs', 'ring', 'neck'].includes(slot)) return false; if (h.bag.length >= LOOT.bag) { toast(G, 'Сумка полна'); return false; }
    const it = makeItem(h.cls, slot, h.lvl, 'rare', G.rand); h.tokens -= W.price; G.bagAdd(h, it); sfx(G, 'loot'); toast(G, `Получено: <b>${it.name}</b>`, 'good'); return true; }
  if (W.k === 'trinket') { const T = TRINKETS.find(t => t.id === choice && t.rar === 'epic'); if (!T) return false; if (h.bag.length >= LOOT.bag) { toast(G, 'Сумка полна'); return false; }
    const it = makeTrinket(h.cls, h.lvl, 'epic', G.rand, T.id); h.tokens -= W.price; G.bagAdd(h, it); sfx(G, 'loot'); toast(G, `Получено: <b>${it.name}</b>`, 'good'); return true; }
  if (W.k === 'chest') { if (!W.choices.includes(choice)) return false; const n = (W.nOf && W.nOf[choice]) || W.n; const st = makeStack(W.kind, choice, n);
    const left = addStack(h, st); if (left === n) { toast(G, 'Сумка полна'); return false; } h.tokens -= W.price; sfx(G, 'loot'); toast(G, `Получено: <b>${st.name}</b> × ${n - left}`, 'good'); return true; }
  return false;
}
