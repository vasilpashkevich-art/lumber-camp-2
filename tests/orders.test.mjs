// v126: доска заказов (дейлики) — 3 заказа в день по зерну дня, взять/сдать, печати, бонус за все три, серая зона без печатей;
// лавка квартирмейстера — баран за печати, синяя вещь, фиолетовый аксессуар, сундучки.
import test from 'node:test'; import assert from 'node:assert/strict';
import { ZONES } from '../data/zones.js';
import { ORDERS, ORDER, ROYAL } from '../data/orders.js';
import { MOUNTS } from '../data/mounts.js';
import { buildWorld } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { createGame, update, interactTarget } from '../src/systems/game.js';
import { boardOf, oState, oTake, oTurnIn, oDrop, orderReady, orderProgress, orderReward, greyFor, buyRoyal, dayOf, boardMark } from '../src/systems/orders.js';
import { countOf, addStack } from '../src/systems/mining.js';
import { makeStack } from '../src/systems/items.js';
import { migrate } from '../src/engine/save.js';
import { rng } from '../src/engine/util.js';

const W = buildWorld(ZONES.pine);
function setup(lvl = 5) { const h = newHero('З', 'warrior'); h.lvl = lvl; migrate(h); const G = createGame(h, W, { rand: rng(5) }); for (const m of G.mobs) { m.state = 'dead'; m.respawnAt = 1e18; } return G; }
const kill = (G, m) => { m.state = 'chase'; m.hp = 1; m.stun = 2; G.P.x = m.x - 30; G.P.y = m.y; G.P.target = m; G.P.hp = G.st.maxHp; for (let i = 0; i < 80 && m.state !== 'dead'; i++) update(G, 0.05, { attack: true }); assert.equal(m.state, 'dead'); };

test('orders: доска — 3 разных заказа, одинаковые в один день, другие в другой; у каждой зоны есть заказы', () => {
  for (const z of Object.keys(ORDERS)) { const L = boardOf(z); assert.equal(L.length, ORDER.perDay); assert.equal(new Set(L.map(o => o.id)).size, 3); for (const o of L) assert.ok(o.need >= o.n[0] && o.need <= o.n[1]); }
  const a = boardOf('pine', 1e12).map(o => o.id), b = boardOf('pine', 1e12 + 3600e3).map(o => o.id), c = boardOf('pine', 1e12 + 86400e3 * 3).map(o => o.id);
  assert.deepEqual(a, b); assert.notDeepEqual(a, c);
  assert.ok(ORDERS.pine.length >= 9 && ORDERS.farms.length >= 9 && ORDERS.shroom.length >= 9);
});

test('orders: доска в мире — подойти, E даёт событие board; квартирмейстер — житель у дворца', () => {
  const G = setup(); const bd = W.boards[0]; assert.ok(bd); G.P.x = bd.x; G.P.y = bd.y + 50;
  assert.equal(interactTarget(G).k, 'board'); update(G, 0.05, { interact: true }); assert.ok(G.ev.some(e => e.k === 'board' && e.b.zone === 'pine'));
  assert.ok(G.npcs.find(n => n.id === 'royal' && n.special === 'royal'));
});

test('orders: убийства считаются только у взятого заказа; сдача даёт печать, деньги, опыт; второй раз не сдать', () => {
  const G = setup(5), h = G.hero, T = { ...ORDERS.pine.find(o => o.id === 'boars'), zone: 'pine', key: 'pine|boars', need: 4 };
  const ms = Array.isArray(T.mob) ? T.mob : [T.mob]; const pick = () => G.mobs.find(m => ms.includes(m.kind) && m.state === 'dead');
  const m0 = pick(); kill(G, m0); assert.equal(orderProgress(h, T), 0, 'до взятия не считается');
  assert.ok(oTake(G, T)); for (let i = 0; i < T.need; i++) { const m = pick(); m.state = 'idle'; kill(G, m); }
  assert.ok(orderReady(h, T)); const g0 = h.gold, x0 = h.xp + h.lvl * 1e6, R = orderReward(h, T);
  assert.ok(oTurnIn(G, T)); assert.equal(h.tokens, R.tok); assert.equal(h.gold, g0 + R.money); assert.ok(h.xp + h.lvl * 1e6 > x0);
  assert.equal(oTurnIn(G, T), false); assert.equal(oTake(G, T), false);
});

test('orders: принести — считает сумку, сдача забирает; взять без профессии нельзя; отказ сбрасывает', () => {
  const G = setup(5), h = G.hero, T = { ...ORDERS.pine.find(o => o.id === 'copper'), zone: 'pine', key: 'pine|copper', need: 8 };
  assert.equal(oTake(G, T), false, 'без горного дела'); h.prof.mining = 1; assert.ok(oTake(G, T));
  addStack(h, makeStack('ore', 'copper', 5)); assert.equal(orderProgress(h, T), 5); assert.equal(orderReady(h, T), false);
  addStack(h, makeStack('ore', 'copper', 5)); assert.ok(orderReady(h, T)); assert.ok(oTurnIn(G, T)); assert.equal(countOf(h, 'ore', 'copper'), 2);
  const T2 = { ...ORDERS.pine[0], zone: 'pine', key: 'pine|' + ORDERS.pine[0].id, need: 5 }; oTake(G, T2); oState(h).act[T2.key].n = 3; assert.ok(oDrop(G, T2)); assert.equal(orderProgress(h, T2), 0);
});

test('orders: бонус за все три; печати и в серой зоне; новый день очищает доску; знак над доской', () => {
  const G = setup(5), h = G.hero, L = boardOf('pine');
  for (const T of L) { if (T.prof) h.prof[T.prof] = 1; oTake(G, T); if (T.k === 'gather') addStack(h, makeStack(T.kind, T.metal, T.need)); else oState(h).act[T.key].n = T.need; }
  let tok = 0; for (const T of L) { assert.ok(oTurnIn(G, T)); tok += orderReward(h, T).tok; }
  assert.equal(h.tokens, tok + ORDER.bonus); assert.ok(oState(h).bonus.pine);
  const G2 = setup(12), h2 = G2.hero; assert.ok(greyFor(h2, 'pine')); assert.ok(orderReward(h2, L[0]).tok >= 1, 'v128: печати на любом уровне'); assert.ok(orderReward(h2, L[0]).money > 0);
  assert.equal(greyFor(setup(9).hero, 'pine'), false);
  const S = oState(h); S.day = dayOf() - 1; const S2 = oState(h); assert.equal(Object.keys(S2.done).length, 0); assert.equal(S2.day, dayOf());
  assert.equal(boardMark(h, 'pine'), '!'); const T0 = boardOf('pine')[0]; if (T0.prof) h.prof[T0.prof] = 1; oTake(G, T0); if (T0.k === 'gather') addStack(h, makeStack(T0.kind, T0.metal, T0.need)); else oState(h).act[T0.key].n = T0.need; assert.equal(boardMark(h, 'pine'), '?'); oTurnIn(G, T0); assert.equal(boardMark(h, 'pine'), '!');
  for (const T of boardOf('pine').slice(1)) { if (T.prof) h.prof[T.prof] = 1; oTake(G, T); } assert.equal(boardMark(h, 'pine'), '');
});

test('royal: баран за печати (с 15-го), синяя вещь в выбранное место, фиолетовый аксессуар, сундучок; не хватает — нет', () => {
  const G = setup(15), h = G.hero; h.tokens = 0;
  const ram = ROYAL.find(w => w.id === 'ram_snow'); assert.equal(buyRoyal(G, ram), false);
  h.tokens = 120; assert.ok(buyRoyal(G, ram)); assert.equal(h.tokens, 70); assert.deepEqual(h.mounts, ['ram_snow']); assert.equal(h.mount, 'ram_snow'); assert.equal(MOUNTS.ram_snow.art, 'ram');
  assert.equal(buyRoyal(G, ram), false, 'второй раз не купить');
  const G14 = setup(14); G14.hero.tokens = 60; assert.equal(buyRoyal(G14, ram), false);
  const it = ROYAL.find(w => w.k === 'item'); assert.ok(buyRoyal(G, it, 'head')); const got = h.bag.find(i => i.slot === 'head'); assert.ok(got && got.rar === 'rare' && got.ilvl === 15); assert.equal(h.tokens, 62);
  const tr = ROYAL.find(w => w.k === 'trinket'); assert.ok(buyRoyal(G, tr, 'phoenix')); assert.ok(h.bag.find(i => i.trinket === 'phoenix' && i.rar === 'epic')); assert.equal(h.tokens, 32);
  assert.equal(buyRoyal(G, tr, 'nope'), false);
  const gems = ROYAL.find(w => w.id === 'gems'); assert.ok(buyRoyal(G, gems, 'emerald')); assert.equal(countOf(h, 'gem', 'emerald'), 3);
  const dust = ROYAL.find(w => w.id === 'dust'); assert.ok(buyRoyal(G, dust, 'crystal')); assert.equal(countOf(h, 'ench', 'crystal'), 1); assert.equal(h.tokens, 22);
});

test('royal: верхом на баране — скорость по барану; сохранение переживает migrate', () => {
  const G = setup(15), h = G.hero; h.tokens = 50; buyRoyal(G, ROYAL[0]);
  const h2 = migrate(JSON.parse(JSON.stringify(h))); assert.deepEqual(h2.mounts, ['ram_snow']); assert.equal(h2.tokens, 0); assert.ok(h2.orders);
  const old = migrate({ v: 1, name: 'С', cls: 'mage', lvl: 3 }); assert.equal(old.tokens, 0); assert.ok(old.orders);
});
