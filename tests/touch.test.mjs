// v69: касание и щелчок по миру — моб, тело, жила, постройка, земля; поход к цели и действие по прибытии.
import test from 'node:test';
import assert from 'node:assert/strict';
import { PINE } from '../data/zones.js';
import { buildWorld } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { createGame, update, whatAt } from '../src/systems/game.js';
import { learnMining, buyPick } from '../src/systems/mining.js';
import { makeItem } from '../src/systems/items.js';
import { rng } from '../src/engine/util.js';

const W = buildWorld(PINE);
const game = (cls = 'warrior') => { const G = createGame(newHero('Т', cls), W, { rand: rng(5) }); G.st.maxHp = G.P.hp = 99999; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e12; }); G.P.x = 2900; G.P.y = 3600; return G; };
const run = (G, sec, first = {}) => { const ev = []; for (let i = 0; i < sec * 20; i++) { update(G, 0.05, i === 0 ? first : {}); ev.push(...G.ev); G.ev.length = 0; } return ev; };

test('касание земли — герой идёт туда и останавливается', () => {
  const G = game(); run(G, 2.5, { pick: { x: 3200, y: 3650, touch: true } });
  assert.ok(Math.hypot(G.P.x - 3200, G.P.y - 3650) < 14, `${G.P.x},${G.P.y}`); assert.equal(G.P.goal, null);
});
test('щелчок мышью по земле не ведёт героя, а снимает цель', () => {
  const G = game(); G.P.target = G.mobs[0]; run(G, 1, { pick: { x: 3200, y: 3650, touch: false } });
  assert.equal(G.P.x, 2900); assert.equal(G.P.target, null);
});
test('касание тела — подходит и открывает подсумок; щелчок мышью — так же', () => {
  for (const touch of [true, false]) {
    const G = game(); G.corpses.push({ id: 1, x: 3150, y: 3600, name: 'Волк', lvl: 2, money: 5, items: [], until: 1e9 });
    const ev = run(G, 3, { pick: { x: 3150, y: 3600, touch } });
    assert.ok(ev.some(e => e.k === 'lootOpen'), 'подсумок');
  }
});
test('касание жилы — подходит и копает', () => {
  const G = game(); learnMining(G); G.hero.gold = 100; buyPick(G); G.P.lastCombat = -99;
  const v = G.veins[0]; G.P.x = v.x - 250; G.P.y = v.y + 20;
  assert.equal(whatAt(G, v.x, v.y - 20, true).k, 'vein');
  run(G, 3, { pick: { x: v.x, y: v.y - 20, touch: true } }); assert.ok(G.P.mine, 'копает');
});
test('касание моба — цель, автоатака и подход на удар; своё движение отменяет поход', () => {
  const G = game(), m = G.mobs.find(m => m.kind === 'wolf'); m.state = 'idle'; m.hp = m.max = 9999; m.x = m.hx = 3200; m.y = m.hy = 3600;
  run(G, 0.05, { pick: { x: m.x, y: m.y - 10, touch: true } });
  assert.equal(G.P.target, m); assert.equal(G.P.auto, m); assert.ok(G.P.goal);
  run(G, 0.1, { mx: -1 }); assert.equal(G.P.goal, null, 'джойстик отменил');
  run(G, 0.05, { pick: { x: m.x, y: m.y - 10, touch: true } }); run(G, 3); assert.ok(m.hp < 9999, 'дошёл и бьёт');
});
test('касание торговца — подходит и открывает лавку', () => {
  const G = game(), b = G.W.houses.find(b => b.vendor); G.P.x = b.x + 250; G.P.y = b.y + 120;
  const ev = run(G, 4, { pick: { x: b.x, y: b.y - 30, touch: true } });
  assert.ok(ev.some(e => e.k === 'vendor'), 'лавка');
});
