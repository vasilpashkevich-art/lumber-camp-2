// v68: автоатака — пробел один раз, удары идут сами по цели; не переходит на соседей.
import test from 'node:test';
import assert from 'node:assert/strict';
import { PINE } from '../data/zones.js';
import { buildWorld } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { createGame, update } from '../src/systems/game.js';
import { rng } from '../src/engine/util.js';

const W = buildWorld(PINE);
const setup = (cls = 'warrior') => {
  const G = createGame(newHero('Т', cls), W, { rand: rng(2) }); G.st.maxHp = G.P.hp = 99999;
  G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; });
  const [a, b] = G.mobs.filter(m => m.kind === 'wolf').slice(0, 2);
  for (const [m, dx] of [[a, 30], [b, -30]]) { m.state = 'idle'; m.hp = m.max = 200; m.x = m.hx = 3000 + dx; m.y = m.hy = 3800; m.aggroOff = 1; }
  G.P.x = 3000; G.P.y = 3800; return { G, a, b };
};
const run = (G, sec, first = {}, each = {}) => { for (let i = 0; i < sec * 20; i++) { update(G, 0.05, i === 0 ? { ...each, ...first } : each); G.ev.length = 0; } };

test('один раз пробел — бьёт, пока цель жива; после гибели на соседа не переходит', () => {
  const { G, a, b } = setup(); G.P.target = a;
  run(G, 0.05, { attackTap: true }); assert.equal(G.P.auto, a);
  const hp0 = a.hp; run(G, 3); assert.ok(a.hp < hp0 - 1 || a.state === 'dead', 'бьёт без нажатий');
  a.hp = 1; run(G, 2); assert.equal(a.state, 'dead'); assert.equal(G.P.auto, null, 'автоатака кончилась');
  const bh = b.hp; b.state = 'idle'; b.hp = bh; run(G, 2); assert.equal(b.hp, bh, 'соседа не тронул');
});

test('другая цель (Tab), сесть, гибель — автоатака прекращается', () => {
  let { G, a, b } = setup(); G.P.target = a; run(G, 0.05, { attackTap: true });
  run(G, 0.05, { tabTarget: true }); if (G.P.target === a) run(G, 0.05, { tabTarget: true });
  assert.notEqual(G.P.target, a); assert.equal(G.P.auto, null);
  ({ G, a } = setup('mage')); G.P.target = a; run(G, 0.05, { attackTap: true }); assert.equal(G.P.auto, a);
  G.P.dead = false; G.P.hp = 1; G.P.lastCombat = -99; G.P.sit = true; run(G, 0.05); assert.equal(G.P.auto, null, 'сел');
});

test('цель вне досягаемости — ждёт, ближнего не бьёт', () => {
  const { G, a, b } = setup(); G.P.target = a; run(G, 0.05, { attackTap: true });
  a.x = a.hx = G.P.x + 400; a.state = 'idle'; const bh = b.hp; run(G, 2);
  assert.equal(G.P.auto, a); assert.equal(b.hp, bh, 'ближний цел');
  a.x = G.P.x + 30; const ah = a.hp; run(G, 2); assert.ok(a.hp < ah, 'вернулась — снова бьёт');
});

test('удержание пробела работает как раньше: без цели бьёт ближайшего', () => {
  const { G, a, b } = setup(); G.P.target = null; run(G, 2, {}, { attack: true });
  assert.ok(a.hp < a.max || b.hp < b.max);
});
