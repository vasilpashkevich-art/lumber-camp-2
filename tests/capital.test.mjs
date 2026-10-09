// v58: новая столица — дворец на террасе, лестница, фонтан, дорожки; старые сохранения не застревают.
import test from 'node:test';
import assert from 'node:assert/strict';
import { PINE, FARMS } from '../data/zones.js';
import { buildWorld, moveTo, inCity } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { createGame, update, interactTarget } from '../src/systems/game.js';
import { rng } from '../src/engine/util.js';

const W = buildWorld(PINE), c = W.cap, K = W.castle;
const walk = (x, y, dx, dy, n) => { for (let i = 0; i < n; i++) [x, y] = moveTo(W, x, y, x + dx, y + dy); return [x, y]; };

test('столица: дворец, терраса и фонтан непроходимы, по лестнице — к воротам дворца', () => {
  assert.ok(K && K.y < c.y - 400, 'дворец у северной стены');
  assert.ok(W.blocked(c.x, K.y - 100), 'внутрь дворца нельзя');
  assert.ok(W.blocked(c.x, c.y - 18), 'в фонтан нельзя');
  assert.ok(W.blocked(c.x - 250, K.y + 90), 'подпорная стенка террасы');
  // от фонтана по аллее вверх по лестнице до ворот
  let [x, y] = walk(c.x, c.y - 220, 0, -8, 80);
  assert.ok(y < K.y + 40, `дошёл до ворот: ${Math.round(y - K.y)}`);
  const G = createGame(Object.assign(newHero('Т', 'warrior'), { pos: { x, y } }), W, { rand: rng(1) });
  const it = interactTarget(G); assert.ok(it && it.b && it.b.id === 'hall', 'у ворот дворца E — дворец');
  // вбок по стенке террасы с земли не залезть
  [x, y] = walk(c.x - 300, K.y + 200, 0, -8, 40);
  assert.ok(y > K.y + 100, 'на террасу только по лестнице');
});

test('столица: дорожки из плит, ворота шире героя, внутри — город', () => {
  assert.ok(W.onPave(c.x, c.y + 300) && W.onPave(c.x + 500, c.y) && W.onPave(c.x + c.ring.r, c.y + 0.5 * c.ring.w - 5));
  assert.ok(!W.onPave(c.x + 230, c.y + 230), 'газон не дорожка');
  let [x, y] = walk(c.x + c.R + 60, c.y, -10, 0, 50); assert.ok(inCity(W, x, y), 'через восточные ворота');
  for (const b of c.buildings) if (b.col) assert.ok(Math.hypot(b.dx, b.dy) + b.col < c.R - 20, `${b.id} внутри стены`);
});

test('старое сохранение внутри новой постройки — герой появляется на площади', () => {
  for (const pos of [{ x: c.x, y: c.y }, { x: c.x, y: K.y - 60 }, { x: c.x - 430, y: c.y + 450 }]) {
    const G = createGame(Object.assign(newHero('С', 'mage'), { pos }), W, { rand: rng(2) });
    assert.ok(W.walkable(G.P.x, G.P.y), `застрял в ${pos.x},${pos.y}`);
    update(G, 0.05, {});
  }
});

test('хутор: постройки посёлка не налезают друг на друга', () => {
  const V = buildWorld(FARMS), b = FARMS.village.buildings;
  for (let i = 0; i < b.length; i++) for (let j = i + 1; j < b.length; j++) {
    const d = Math.abs(b[i].dx - b[j].dx); if (Math.abs(b[i].dy - b[j].dy) < 60) assert.ok(d > b[i].col + b[j].col, `${b[i].id} и ${b[j].id}`);
  }
  assert.ok(V.walkable(FARMS.arrive.x, FARMS.arrive.y));
});
