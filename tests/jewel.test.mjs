// v131: ювелирное дело — учитель, огранка, кольца/шеи по классу, аксессуары ювелира, навык, очередь ремесла; камни с двумя свойствами в heroStats.
import test from 'node:test'; import assert from 'node:assert/strict';
import { ZONES } from '../data/zones.js';
import { JEWEL_RECIPES } from '../data/jewelcraft.js';
import { GEMS } from '../data/mining.js';
import { TRINKETS } from '../data/trinkets.js';
import { buildWorld } from '../src/world/world.js';
import { newHero, heroStats } from '../src/entities/hero.js';
import { createGame, update, interactTarget, trinketProc } from '../src/systems/game.js';
import { learnJewel, canJewel, makeJewel, jewelSkill } from '../src/systems/jewel.js';
import { startCraft, craftTick } from '../src/systems/craft.js';
import { addStack, countOf, insertGem } from '../src/systems/mining.js';
import { makeStack, makeTrinket, makeItem } from '../src/systems/items.js';
import { migrate } from '../src/engine/save.js';
import { rng } from '../src/engine/util.js';

const W = buildWorld(ZONES.pine);
function setup(lvl = 10) { const h = newHero('Ю', 'mage'); h.lvl = lvl; migrate(h); const G = createGame(h, W, { rand: rng(7) }); for (const m of G.mobs) { m.state = 'dead'; m.respawnAt = 1e18; } return G; }

test('jewel: учитель в Ювелирной мастерской, E даёт событие jewel; без навыка не сделать', () => {
  const G = setup(), b = G.W.houses.find(x => x.id === 'jeweler'); assert.ok(b && b.jeweler);
  G.P.x = b.x; G.P.y = b.y + 60; assert.equal(interactTarget(G).k, 'b'); update(G, 0.05, { interact: true }); assert.ok(G.ev.some(e => e.k === 'jewel'));
  addStack(G.hero, makeStack('gem', 'tigerseye', 2)); addStack(G.hero, makeStack('bar', 'copper', 1));
  assert.equal(makeJewel(G, 'cut_tiger'), null); assert.ok(learnJewel(G)); assert.equal(jewelSkill(G.hero), 1); assert.equal(learnJewel(G), false);
});

test('jewel: огранка тратит камни и слиток, даёт стопку; камень вставляется и считается в heroStats (два свойства)', () => {
  const G = setup(), h = G.hero; learnJewel(G);
  addStack(h, makeStack('gem', 'tigerseye', 3)); addStack(h, makeStack('gem', 'amethyst', 1)); addStack(h, makeStack('bar', 'tin', 2)); addStack(h, makeStack('bar', 'copper', 1));
  assert.equal(canJewel(h, 'cut_tiger'), 1); const out = makeJewel(G, 'cut_tiger'); assert.ok(out && out.kind === 'gem' && out.metal === 'tiger_cut');
  assert.equal(countOf(h, 'gem', 'tigerseye'), 1); assert.equal(countOf(h, 'bar', 'copper'), 0); assert.equal(countOf(h, 'gem', 'tiger_cut'), 1);
  h.prof.jewel = 50; assert.equal(canJewel(h, 'sunstone'), 1); assert.ok(makeJewel(G, 'sunstone')); assert.equal(countOf(h, 'gem', 'sunstone'), 1);
  const neck = makeItem(h.cls, 'neck', 10, 'rare', rng(3)); h.bag.push(neck); const st0 = heroStats(h);
  assert.ok(insertGem(h, h.bag.find(i => i.kind === 'gem' && i.metal === 'sunstone'), neck)); h.eq.neck = neck; const st1 = heroStats(h);
  assert.ok(st1.maxHp > heroStats({ ...h, eq: { ...h.eq, neck: { ...neck, gem: null } } }).maxHp, 'выносливость камня');
  assert.ok(GEMS.stormgem.bonus.haste && GEMS.bloodstone.cut);
});

test('jewel: кольцо и шея — по классу героя, уровню и цвету рецепта; аксессуары ювелира — только из рецепта, не из добычи', () => {
  const G = setup(), h = G.hero; learnJewel(G); h.prof.jewel = 120;
  addStack(h, makeStack('bar', 'copper', 3)); const r = makeJewel(G, 'ring_copper'); assert.ok(r && r.slot === 'ring' && r.cls === 'mage' && r.ilvl === 6 && r.rar === 'good');
  addStack(h, makeStack('bar', 'iron', 5)); addStack(h, makeStack('gem', 'emerald', 1)); addStack(h, makeStack('gem', 'amethyst', 1));
  const n = makeJewel(G, 'neck_iron'); assert.ok(n && n.slot === 'neck' && n.rar === 'rare' && n.ilvl === 16);
  addStack(h, makeStack('bar', 'iron', 4)); addStack(h, makeStack('gem', 'stormgem', 1)); const t = makeJewel(G, 'bell'); assert.ok(t && t.trinket === 'bell' && t.rar === 'rare' && t.stam === undefined);
  for (let i = 0; i < 200; i++) assert.ok(!TRINKETS.find(x => x.id === makeTrinket('mage', 12, 'rare', rng(i)).trinket).craft, 'ремесленные не падают');
  assert.equal(makeJewel(G, 'bell'), null, 'материалы кончились');
});

test('jewel: очередь ремесла — «все» огранки по времени, навык растёт; сохранение переживает migrate', () => {
  const G = setup(), h = G.hero; learnJewel(G);
  addStack(h, makeStack('gem', 'tigerseye', 6)); addStack(h, makeStack('bar', 'copper', 3));
  assert.ok(startCraft(G, 'jewel', 'cut_tiger', 999)); assert.ok(G.P.craft && G.P.craft.max === 3);
  for (let i = 0; i < 200 && G.P.craft; i++) craftTick(G, 0.1);
  assert.equal(countOf(h, 'gem', 'tiger_cut'), 3); assert.equal(countOf(h, 'gem', 'tigerseye'), 0); assert.ok(jewelSkill(h) >= 3, 'оранжевый — растёт всегда');
  const h2 = migrate(JSON.parse(JSON.stringify(h))); assert.equal(h2.prof.jewel, h.prof.jewel); assert.equal(countOf(h2, 'gem', 'tiger_cut'), 3);
});

test('jewel: Серебряный колокольчик замедляет врагов вокруг при попадании по герою', () => {
  const G = setup(12), h = G.hero; const t = makeTrinket('mage', 14, 'rare', rng(1), 'bell'); h.eq.trinket = t; G.rand = () => 0;
  const m = G.mobs[0]; m.state = 'chase'; m.x = G.P.x + 40; m.y = G.P.y; m.hp = m.maxHp;
  G.P.tcd = 0; assert.ok(trinketProc(G, 'hurt', m)); assert.ok(m.chill > 0);
});
