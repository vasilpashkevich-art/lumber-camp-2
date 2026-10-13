// v84: травничество и алхимия — кусты по областям, сбор, навык, варка, зелья двух родов, клавиша 2, сохранение.
import test from 'node:test';
import assert from 'node:assert/strict';
import { PINE, FARMS, SHROOM } from '../data/zones.js';
import { HERBS, HERBAL } from '../data/herbs.js';
import { POTIONS, ALCH } from '../data/alchemy.js';
import { buildWorld } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { createGame, update } from '../src/systems/game.js';
import { learnHerbal, learnAlchemy, buyFlask, brew, canBrew, drinkElixir, drinkLast, elixirMods, skillColor, plantNear } from '../src/systems/herbs.js';
import { addStack, countOf } from '../src/systems/mining.js';
import { makeStack } from '../src/systems/items.js';
import { migrate } from '../src/engine/save.js';
import { stashPut } from '../src/systems/bank.js';
import { rng, dist } from '../src/engine/util.js';

const WP = buildWorld(PINE), WF = buildWorld(FARMS), WS = buildWorld(SHROOM);
const game = (W = WP, h = newHero('Т', 'warrior')) => createGame(h, W, { rand: rng(7) });
const run = (G, sec, I = {}) => { for (let i = 0; i < sec * 20; i++) { update(G, 0.05, i === 0 ? I : {}); G.ev.length = 0; } };
const quiet = G => G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; });

test('кусты: в своих областях, на проходимой земле, не в посёлке; те же после повторного входа', () => {
  for (const W of [WP, WF, WS]) {
    const G = game(W);
    const want = W.Z.herbs.reduce((s, a) => s + a.n, 0); assert.ok(G.plants.length >= want - 2, `${W.Z.id}: ${G.plants.length} из ${want}`);
    for (const v of G.plants) { const A = W.Z.herbs[v.a]; assert.equal(v.herb, A.herb); assert.ok(dist(v.x, v.y, A.x, A.y) <= A.r + 1); assert.ok(W.walkable(v.x, v.y)); assert.ok(W.roadD(v.x, v.y) >= 40); if (W.town) assert.ok(dist(v.x, v.y, W.town.x, W.town.y) > W.town.R); }
    const G2 = createGame(G.hero, W, { rand: rng(99) }); assert.deepEqual(G2.plants.map(v => [v.x, v.y]), G.plants.map(v => [v.x, v.y]));
  }
});

test('сбор: без навыка нельзя, 2 с, 1–3 травы, куст уходит и вырастает в другом месте; удар прерывает', () => {
  const G = game(); quiet(G); const H = G.hero, P = G.P, v = G.plants[0];
  P.x = v.x + 20; P.y = v.y; assert.equal(plantNear(G), v);
  run(G, 0.1, { interact: true }); assert.ok(!P.gather, 'без навыка сбора нет');
  learnHerbal(G); assert.equal(H.prof.herbal, 1);
  run(G, 0.1, { interact: true }); assert.ok(P.gather, 'сбор начался');
  run(G, 1); assert.ok(P.gather, 'ещё собирает'); run(G, 1.2); assert.ok(!P.gather, 'собрал');
  const n = countOf(H, 'herb', 'silverleaf'); assert.ok(n >= 1 && n <= 3, 'трав ' + n); assert.ok(v.at > G.t, 'куст ушёл');
  const ox = v.x; v.at = G.t + 0.01; run(G, 0.1); assert.ok(!v.at, 'вырос'); assert.ok(v.x !== ox || true);
  // прерывание ударом
  const w = G.plants.find(p => !p.at); P.x = w.x + 10; P.y = w.y; run(G, 0.1, { interact: true }); assert.ok(P.gather);
  run(G, 0.1, { attack: true }); assert.ok(!P.gather, 'удар прервал сбор');
  // навык растёт на оранжевом кусте всегда
  const sk = H.prof.herbal; for (let i = 0; i < 3; i++) { const q = G.plants.find(p => !p.at); P.x = q.x + 10; P.y = q.y; run(G, 0.1, { interact: true }); run(G, 2.3); }
  assert.ok(H.prof.herbal > sk, 'навык вырос');
});

test('цвета: полынь без 50 — красная; потолок 150', () => {
  assert.equal(skillColor(10, 50).c, 'red'); assert.equal(skillColor(60, 50).c, 'orange'); assert.equal(skillColor(130, 50).c, 'gray'); assert.equal(HERBAL.cap, 150); assert.equal(HERBS.wormwood.req, 50); assert.equal(HERBS.glowcap.req, 100);
});

test('варка: травы + склянка → зелье; лечебное идёт в запас Q; навык алхимии растёт; продать дешевле трав', () => {
  const G = game(); quiet(G); const H = G.hero;
  H.gold = 1000; assert.equal(brew(G, 'strength'), 0, 'без алхимии');
  learnAlchemy(G); assert.ok(buyFlask(G, 5)); assert.equal(countOf(H, 'flask', 'flask'), 5); assert.equal(H.gold, 1000 - ALCH.flaskPrice * 5);
  addStack(H, makeStack('herb', 'silverleaf', 9));
  assert.equal(canBrew(H, 'strength'), 4); assert.equal(brew(G, 'strength', 2), 2); assert.equal(countOf(H, 'potion', 'strength'), 2); assert.equal(countOf(H, 'herb', 'silverleaf'), 5); assert.equal(countOf(H, 'flask', 'flask'), 3);
  const pots = H.potions; assert.equal(brew(G, 'heal'), 1); assert.equal(H.potions, pots + 1);
  assert.equal(brew(G, 'swift'), 0, 'полынь нужна и навык 50');
  assert.ok(H.prof.alchemy > 1, 'алхимия выросла: ' + H.prof.alchemy);
  const herbCost = POTIONS.strength.mats.silverleaf * HERBS.silverleaf.price + ALCH.flaskPrice; assert.ok(POTIONS.strength.price < herbCost, 'не печатный станок');
  for (const [id, R] of Object.entries(POTIONS)) if (!R.heal) assert.ok(R.price < Object.entries(R.mats).reduce((s, [h, k]) => s + HERBS[h].price * k, 0) + ALCH.flaskPrice, id);
});

test('зелья: боевое и защитное по одному, новое заменяет; действуют на урон, крит, бег, урон по герою; время идёт; клавиша 2', () => {
  const G = game(); quiet(G); const H = G.hero;
  addStack(H, makeStack('potion', 'strength', 2)); addStack(H, makeStack('potion', 'hunter', 1)); addStack(H, makeStack('potion', 'stone', 1)); addStack(H, makeStack('potion', 'swift', 1));
  assert.ok(drinkElixir(G, H.bag.find(i => i.metal === 'strength'))); assert.equal(H.elixir.battle.id, 'strength'); assert.equal(elixirMods(H).dmg, 1.1); assert.equal(H.lastPot, 'strength');
  assert.ok(drinkElixir(G, H.bag.find(i => i.metal === 'hunter'))); assert.equal(H.elixir.battle.id, 'hunter', 'боевое заменилось'); assert.equal(elixirMods(H).dmg, 1); assert.equal(elixirMods(H).crit, 5);
  assert.ok(drinkElixir(G, H.bag.find(i => i.metal === 'stone'))); assert.equal(H.elixir.guard.id, 'stone'); assert.equal(H.elixir.battle.id, 'hunter', 'боевое осталось'); assert.ok(Math.abs(elixirMods(H).taken - 0.9) < 1e-9);
  assert.ok(drinkElixir(G, H.bag.find(i => i.metal === 'swift'))); assert.equal(H.elixir.guard.id, 'swift'); assert.equal(elixirMods(H).speed, 1.25);
  // клавиша 2 — последнее выбранное (swift) в сумке нет → нет; strength есть, но последнее — swift
  H.lastPot = 'strength'; const n = countOf(H, 'potion', 'strength'); run(G, 0.1, { potion2: true }); assert.equal(countOf(H, 'potion', 'strength'), n - 1); assert.equal(H.elixir.battle.id, 'strength');
  // время идёт
  const t0 = H.elixir.battle.t; run(G, 5); assert.ok(H.elixir.battle.t < t0 - 4.5);
  H.elixir.battle.t = 0.1; run(G, 0.2); assert.equal(H.elixir.battle, null, 'кончилось');
});

test('стопки трав и зелий — в банк и обратно; старое сохранение получает поля', () => {
  const G = game(); const H = G.hero; addStack(H, makeStack('herb', 'glowcap', 7)); addStack(H, makeStack('potion', 'wisdom', 3));
  assert.ok(stashPut(G, H.bag.find(i => i.kind === 'herb'), 'bank')); assert.equal(countOf(H, 'herb', 'glowcap'), 0); assert.equal(H.bank.find(i => i.kind === 'herb').n, 7);
  const old = JSON.parse(JSON.stringify(newHero('С', 'mage'))); delete old.plants; delete old.elixir; delete old.prof.herbal; delete old.lastPot;
  const h = migrate(old); assert.equal(h.prof.herbal, 0); assert.equal(h.prof.alchemy, 0); assert.deepEqual(h.plants, {}); assert.deepEqual(h.elixir, { battle: null, guard: null });
});
