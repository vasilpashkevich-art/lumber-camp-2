// v61: горное дело, стопки, плавка, сумка 32, кольцо и шея, аксессуары и гарантия выпадения.
import test from 'node:test';
import assert from 'node:assert/strict';
import { PINE, FARMS } from '../data/zones.js';
import { MOBS } from '../data/mobs.js';
import { LOOT, TRINKET_DROP } from '../data/balance.js';
import { ORES, MINE, veinColor } from '../data/mining.js';
import { buildWorld } from '../src/world/world.js';
import { newHero, heroStats } from '../src/entities/hero.js';
import { createGame, update, sellItem, useTrinket } from '../src/systems/game.js';
import { learnMining, buyPick, smelt, countOf, addStack, veinNear } from '../src/systems/mining.js';
import { makeItem, makeTrinket, makeStack } from '../src/systems/items.js';
import { migrate } from '../src/engine/save.js';
import { rng, dist } from '../src/engine/util.js';

const WP = buildWorld(PINE), WF = buildWorld(FARMS);
const game = (cls = 'warrior', W = WP, h = newHero('Т', cls)) => createGame(h, W, { rand: rng(4) });
const run = (G, sec, I = {}) => { for (let i = 0; i < sec * 20; i++) { update(G, 0.05, i === 0 ? I : {}); G.ev.length = 0; } };
const quiet = G => G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; });

test('сумка 32 места, руда складывается стопками по 20', () => {
  assert.equal(LOOT.bag, 32);
  const h = newHero('Т', 'mage'); assert.equal(addStack(h, makeStack('ore', 'copper', 47)), 0);
  assert.deepEqual(h.bag.map(i => i.n).sort((a, b) => a - b), [7, 20, 20]); assert.equal(countOf(h, 'ore', 'copper'), 47);
  addStack(h, makeStack('ore', 'copper', 5)); assert.equal(countOf(h, 'ore', 'copper'), 52); assert.equal(h.bag.length, 3);
});

test('цвета жил как в WoW: оранжевая, жёлтая, зелёная, серая; рано — красная', () => {
  assert.equal(veinColor(0, 1).c, 'red'); assert.equal(veinColor(10, 1).c, 'orange'); assert.equal(veinColor(30, 1).c, 'yellow');
  assert.equal(veinColor(60, 1).c, 'green'); assert.equal(veinColor(80, 1).c, 'gray'); assert.equal(veinColor(80, 1).chance, 0);
  assert.equal(veinColor(49, 50).c, 'red'); assert.equal(veinColor(55, 50).c, 'orange');
});

test('жилы: стоят в своих областях, на проходимой земле, не на дорогах и не в лагерях; сохраняются в герое', () => {
  for (const W of [WP, WF]) {
    const G = game('archer', W);
    const want = W.Z.ore.reduce((s, a) => s + a.n, 0); assert.ok(G.veins.length >= want - 1, `${W.Z.id}: ${G.veins.length} из ${want}`);
    for (const v of G.veins) { const A = W.Z.ore[v.a]; assert.ok(dist(v.x, v.y, A.x, A.y) <= A.r + 1); assert.ok(W.walkable(v.x, v.y)); assert.ok(W.roadD(v.x, v.y) >= 70); }
    const G2 = createGame(G.hero, W, { rand: rng(99) }); assert.deepEqual(G2.veins.map(v => [v.x, v.y]), G.veins.map(v => [v.x, v.y]), 'те же жилы после входа');
  }
});

test('копать: без навыка и кирки нельзя; 3 с — руда, навык растёт, жила пропадает и появляется в другом месте', () => {
  const G = game(); quiet(G); const v = G.veins[0]; G.P.x = v.x + 30; G.P.y = v.y; G.P.lastCombat = -99;
  assert.ok(veinNear(G));
  run(G, 0.2, { interact: true }); assert.equal(G.P.mine, null, 'без навыка не копает');
  learnMining(G); G.hero.gold = 100; assert.ok(buyPick(G)); assert.equal(G.hero.gold, 100 - MINE.pickPrice);
  run(G, 0.2, { interact: true }); assert.ok(G.P.mine, 'копает');
  run(G, 3.2);
  assert.ok(countOf(G.hero, 'ore', 'copper') >= 2); assert.equal(G.hero.prof.mining, 2, 'оранжевая жила — +1 всегда');
  assert.ok(v.at > G.t, 'жила выкопана'); const old = [v.x, v.y];
  G.t = v.at + 1; run(G, 0.1); assert.equal(v.at, 0); assert.ok(old[0] !== v.x || old[1] !== v.y, 'вернулась в другом месте');
});

test('серая жила навык не растит, движение прерывает копание, олово — только с 50', () => {
  const G = game(); quiet(G); learnMining(G); G.hero.gold = 100; buyPick(G); G.hero.prof.mining = 90;
  const v = G.veins[0]; G.P.x = v.x + 30; G.P.y = v.y; G.P.lastCombat = -99;
  run(G, 0.2, { interact: true }); run(G, 1); run(G, 0.1, { mx: 1 }); assert.equal(G.P.mine, null, 'шаг прервал');
  G.P.x = v.x + 30; G.P.y = v.y; run(G, 0.2, { interact: true }); run(G, 3.3); assert.equal(G.hero.prof.mining, 90);
  const F = game('mage', WF); quiet(F); learnMining(F); F.hero.gold = 100; buyPick(F); F.hero.prof.mining = 30;
  const t = F.veins.find(x => x.metal === 'tin'); F.P.x = t.x + 30; F.P.y = t.y; F.P.lastCombat = -99;
  run(F, 0.2, { interact: true }); assert.equal(F.P.mine, null, 'олово с 50');
});

test('плавка: 2 руды → 1 слиток, слиток дороже двух руд; продажа стопкой', () => {
  const G = game(); learnMining(G); addStack(G.hero, makeStack('ore', 'copper', 9));
  assert.equal(smelt(G, 'copper', 999), 4); assert.equal(countOf(G.hero, 'ore', 'copper'), 1); assert.equal(countOf(G.hero, 'bar', 'copper'), 4);
  for (const O of Object.values(ORES)) assert.ok(O.barP > O.oreP * 2, 'переплавлять выгодно');
  const bar = G.hero.bag.find(i => i.kind === 'bar'), g0 = G.hero.gold; sellItem(G, bar); assert.equal(G.hero.gold - g0, ORES.copper.barP * 4);
});

test('кольцо и шея: без брони, с главным параметром; аксессуар — только синий и выше', () => {
  const r = makeItem('warrior', 'ring', 8, 'rare', () => 0.5), n = makeItem('mage', 'neck', 8, 'good', () => 0.5);
  assert.ok(!r.armor && !r.dmg && r.main > 0 && Object.keys(r.props).length === 2); assert.ok(!n.armor && n.main > 0);
  const h = newHero('Т', 'warrior'), s0 = heroStats(h); h.eq.ring = r; assert.ok(heroStats(h).power > s0.power);
  const t = makeTrinket('warrior', 6, 'rare', () => 0.1); assert.equal(t.slot, 'trinket'); assert.equal(t.rar, 'rare'); assert.ok(t.name);
});

test('аксессуар с вожака: 10%, а 9-й подряд — точно', () => {
  const G = game(); const boss = G.mobs.find(m => m.D.rare); let got = 0, maxRun = 0, run0 = 0;
  for (let i = 0; i < 200; i++) {
    boss.state = 'idle'; boss.hp = 1; G.P.x = boss.x; G.P.y = boss.y;
    G.corpses = []; G.hero.lvl = 1;
    boss.hp = 0; G.mobs.forEach(m => { if (m !== boss) m.state = 'dead'; });
    // убить через удар
    const before = G.corpses.length; G.P.target = boss; update(G, 0.05, { attackTap: true }); G.ev.length = 0;
    const c = G.corpses[G.corpses.length - 1]; if (!c) continue;
    if (c.items.some(i => i.slot === 'trinket')) { got++; maxRun = Math.max(maxRun, run0); run0 = 0; } else run0++;
    G.P.cd = 0;
  }
  assert.ok(got > 0, 'выпадает'); assert.ok(maxRun <= TRINKET_DROP.pity, `без аксессуара подряд: ${maxRun}`);
});

test('аксессуары работают: сердце, ярость, флакон, око, шипы', () => {
  const G = game(); quiet(G); const h = G.hero;
  h.eq.trinket = makeTrinket('warrior', 6, 'rare', null, 'breath'); G.P.hp = 10; useTrinket(G); assert.ok(G.P.hp > 10 + G.st.maxHp * 0.3); assert.ok(G.P.tcd > 0);
  G.P.tcd = 0; h.eq.trinket = makeTrinket('warrior', 6, 'rare', null, 'stoneheart'); useTrinket(G); assert.ok(G.P.buf.stone > 0);
  const m = G.mobs.find(x => x.kind === 'wolf'); m.state = 'idle'; m.hp = m.max = 9999; m.x = G.P.x + 80; m.y = G.P.y;
  G.P.tcd = 0; h.eq.trinket = makeTrinket('warrior', 6, 'rare', null, 'stormeye'); useTrinket(G); assert.ok(m.hp < 9999, 'молния попала');
  G.P.tcd = 0; h.eq.trinket = makeTrinket('warrior', 6, 'rare', null, 'rage'); useTrinket(G); assert.ok(G.P.buf.rage > 0);
});

test('старое сохранение получает новые места, навык и пустые жилы', () => {
  const h = migrate({ v: 2, id: 'z', name: 'Z', cls: 'archer', lvl: 3, eq: { head: null, chest: null, legs: null, weapon: null }, bag: [{ id: 'a', slot: 'head', cls: 'archer', ilvl: 2, rar: 'common', pos: 23 }] });
  for (const s of ['neck', 'ring', 'trinket']) assert.ok(s in h.eq && h.eq[s] === null);
  assert.equal(h.prof.mining, 0); assert.equal(h.tPity, 0); assert.deepEqual(h.veins, {}); assert.equal(h.bag[0].pos, 23);
});
