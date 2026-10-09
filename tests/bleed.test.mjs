// Лучник: Кровоточащая стрела — удар и 5 тиков кровотечения раз в секунду, обновляется, к логову — залечивается.
import test from 'node:test';
import assert from 'node:assert/strict';
import { PINE } from '../data/zones.js';
import { CLASSES } from '../data/classes.js';
import { buildWorld } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { createGame, update } from '../src/systems/game.js';
import { rng } from '../src/engine/util.js';

const W = buildWorld(PINE);
const setup = () => {
  const G = createGame(newHero('Л', 'archer'), W, { rand: rng(3) });
  const m = G.mobs.find(m => m.kind === 'boar'); m.hp = m.max = 1e6; m.lvl = 1; m.dmg = 0;
  G.P.x = m.x - 200; G.P.y = m.y; G.P.target = m; return { G, m };
};
const run = (G, sec, I = {}, log) => { for (let i = 0; i < sec * 20; i++) { update(G, 0.05, i === 0 ? I : {}); if (log) log.push(...G.ev); G.ev.length = 0; } };

test('Тройной выстрел заменён Кровоточащей стрелой', () => {
  const A = CLASSES.archer.abils[0]; assert.equal(A.id, 'bleed'); assert.equal(A.key, 'C'); assert.equal(A.bleed.t, 5);
});

test('кровотечение: 5 тиков раз в секунду, ровный урон, потом проходит', () => {
  const { G, m } = setup(), ev = [];
  run(G, 1.2, { ability: true }, ev);
  assert.ok(m.bleed, 'на цели кровотечение');
  run(G, 6, {}, ev);
  const ticks = ev.filter(e => e.k === 'dmg' && e.bleed);
  assert.equal(ticks.length, 5, 'пять тиков');
  assert.ok(ticks.every(t => Math.abs(t.v - ticks[0].v) < 1e-6), 'тики одинаковые, без крита');
  assert.ok(Math.abs(ticks[0].v - G.st.hit * 0.35) < 1e-6);
  assert.equal(m.bleed, null);
});

test('повторный выстрел обновляет время, не складывает; моб у логова залечивает рану', () => {
  const { G, m } = setup();
  run(G, 1.2, { ability: true }); run(G, 2.5);
  const left = m.bleed.n; G.P.acd = {}; run(G, 1.0, { ability: true });
  assert.ok(m.bleed.n >= left, 'время обновилось'); assert.ok(m.bleed.n <= 5);
  m.state = 'return'; run(G, 0.1); assert.equal(m.bleed, null);
});
