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

test('столица (v86, квадратная): дворец и фонтан непроходимы, по главной улице — к воротам дворца', () => {
  assert.ok(K && K.y < c.y - 400, 'дворец у северной стены');
  assert.ok(W.blocked(c.x, K.y - 100), 'внутрь дворца нельзя');
  assert.ok(W.blocked(c.x + c.fountain.x, c.y + c.fountain.y - 18), 'в фонтан нельзя');
  assert.ok(W.blocked(c.x + 440, c.y - 320 - 60), 'в банк нельзя');
  // от площади по главной улице до ворот дворца
  let [x, y] = walk(c.x, c.y - 200, 0, -8, 80);
  assert.ok(y < K.y + 60, `дошёл до ворот: ${Math.round(y - K.y)}`);
  const G = createGame(Object.assign(newHero('Т', 'warrior'), { pos: { x, y } }), W, { rand: rng(1) });
  const it = interactTarget(G); assert.ok(it && it.b && it.b.id === 'hall', 'у ворот дворца E — дворец');
});

test('столица: улицы мощёные, ворота шире героя, стена — препятствие, внутри — город', () => {
  const Q = c.square;
  assert.ok(W.onPave(c.x, c.y + 300) && W.onPave(c.x + 500, c.y + 160) && W.onPave(c.x - 200, c.y));
  assert.ok(!W.onPave(c.x + 700, c.y + 400), 'двор не дорожка');
  let [x, y] = walk(c.x + Q.x1 + Q.th + 60, c.y + Q.eastGate, -10, 0, 50); assert.ok(inCity(W, x, y), 'через восточные ворота');
  [x, y] = walk(c.x, c.y + Q.y1 + Q.th + 60, 0, -10, 50); assert.ok(inCity(W, x, y), 'через южные ворота');
  [x, y] = walk(c.x + 300, c.y + Q.y1 + Q.th + 60, 0, -10, 50); assert.ok(!inCity(W, x, y), 'сквозь южную стену нельзя');
  [x, y] = walk(c.x + Q.x1 + Q.th + 60, c.y - 300, -10, 0, 50); assert.ok(!inCity(W, x, y), 'сквозь восточную стену нельзя');
  assert.ok(!inCity(W, c.x, c.y + Q.y1 + 200) && inCity(W, c.x, c.y));
  for (const b of c.buildings) assert.ok(b.dx > Q.x0 + 100 && b.dx < Q.x1 - 100 && b.dy > Q.y0 + 100 && b.dy < Q.y1 - 40, `${b.id} внутри стены`);
  // у каждой постройки с делом можно встать перед дверью и нажать E
  for (const b of W.houses) if (b.name) { const G = createGame(Object.assign(newHero('Т', 'warrior'), { pos: { x: b.x, y: b.y + 40 } }), W, { rand: rng(1) }); assert.ok(W.walkable(b.x, b.y + 40), `${b.id}: перед дверью проходимо`); const it = interactTarget(G); assert.ok(it && it.b && it.b.id === b.id, `${b.id}: E у двери`); }
});

test('старое сохранение внутри новой постройки — герой появляется на площади', () => {
  for (const pos of [{ x: c.x, y: c.y - 18 + c.fountain.y }, { x: c.x, y: K.y - 60 }, { x: c.x - 520, y: c.y + 500 }, { x: c.x + 1080, y: c.y }]) {
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
