// v112: ремесло со временем — плавка 3 с, варка 4 с, чары 5 с, распыление 2 с, жезл 5 с; очередь «Сделать всё»,
// прерывание шагом и уроном (сделанное остаётся, материал на прерванную вещь не тратится), «Распылить все» с итогом.
import test from 'node:test';
import assert from 'node:assert/strict';
import { PINE } from '../data/zones.js';
import { CRAFT } from '../data/balance.js';
import { ENCH } from '../data/enchanting.js';
import { buildWorld } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { createGame, update } from '../src/systems/game.js';
import { learnEnchant, hasRod } from '../src/systems/enchant.js';
import { addStack, countOf } from '../src/systems/mining.js';
import { makeStack, makeItem } from '../src/systems/items.js';
import { startCraft, startDeAll, stopCraft, craftLeft } from '../src/systems/craft.js';
import { rng } from '../src/engine/util.js';

const W = buildWorld(PINE);
const game = () => { const G = createGame(newHero('Т', 'warrior'), W, { rand: rng(3) }); G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); return G; };
const run = (G, sec, I = {}) => { for (let t = 0; t < sec; t += 0.05) update(G, 0.05, I); };
const put = (H, it) => { it.pos = H.bag.length + 10; H.bag.push(it); return it; };

test('плавка: одна штука — через 3 с, «всё» — по очереди, руда тратится только по готовности', () => {
  const G = game(), H = G.hero; H.prof = { mining: 1 }; addStack(H, makeStack('ore', 'copper', 7));
  assert.ok(startCraft(G, 'smelt', 'copper', 999)); assert.equal(craftLeft(G), 3);
  run(G, CRAFT.smelt - 0.2); assert.equal(countOf(H, 'bar', 'copper'), 0, 'ещё не готово'); assert.equal(countOf(H, 'ore', 'copper'), 7, 'руда пока цела');
  run(G, 0.4); assert.equal(countOf(H, 'bar', 'copper'), 1);
  run(G, CRAFT.smelt * 2 + 0.3); assert.equal(countOf(H, 'bar', 'copper'), 3); assert.equal(countOf(H, 'ore', 'copper'), 1); assert.ok(!G.P.craft, 'очередь кончилась');
});

test('прерывание: шаг и урон останавливают; сделанное остаётся, материал на прерванное цел', () => {
  const G = game(), H = G.hero; H.prof = { mining: 1 }; addStack(H, makeStack('ore', 'copper', 10));
  startCraft(G, 'smelt', 'copper', 999); run(G, CRAFT.smelt + 1);
  assert.equal(countOf(H, 'bar', 'copper'), 1);
  run(G, 0.2, { mx: 1, my: 0 }); assert.ok(!G.P.craft, 'шаг прервал'); assert.equal(countOf(H, 'ore', 'copper'), 8);
  startCraft(G, 'smelt', 'copper', 999); run(G, 1);
  const m = G.mobs.find(o => o.kind === 'wolf'); G.P.x = m.hx; G.P.y = m.hy + 30; m.x = m.hx; m.y = m.hy; m.state = 'chase'; m.respawnAt = 0; m.hp = m.maxHp; m.atkT = 0; m.target = 1;
  for (let i = 0; i < 200 && G.P.craft; i++) update(G, 0.05, {});
  assert.ok(!G.P.craft, 'удар прервал'); assert.ok(G.ev.length >= 0);
});

test('варка, чары, жезл и распыление — каждое своё время; «Распылить все» — итог одним сообщением', () => {
  const G = game(), H = G.hero; H.prof = { alchemy: 1 }; addStack(H, makeStack('flask', 'flask', 2)); addStack(H, makeStack('herb', 'silverleaf', 10));
  const p0 = H.potions; assert.ok(startCraft(G, 'brew', 'heal', 1)); run(G, CRAFT.brew - 0.2); assert.equal(H.potions, p0); run(G, 0.4); assert.equal(H.potions, p0 + 1);
  // жезл
  learnEnchant(G); addStack(H, makeStack('bar', 'copper', ENCH.rodBars)); assert.ok(startCraft(G, 'rod', null)); run(G, CRAFT.rod - 0.2); assert.ok(!hasRod(H)); run(G, 0.4); assert.ok(hasRod(H));
  // распыление трёх зелёных подряд
  const L = [1, 2, 3].map(i => put(H, makeItem('warrior', 'chest', 6, 'good', rng(i))));
  G.ev.length = 0; assert.equal(startDeAll(G, L), 3); assert.equal(craftLeft(G), 3);
  run(G, CRAFT.de + 0.1); assert.equal(H.bag.filter(x => L.includes(x)).length, 2);
  run(G, CRAFT.de * 2 + 0.2); assert.equal(H.bag.filter(x => L.includes(x)).length, 0);
  assert.ok(G.P.craft === null || G.P.craft === undefined);
  // одну и ту же вещь дважды в очередь не поставить
  const g = put(H, makeItem('warrior', 'legs', 6, 'good', rng(9))); assert.ok(startCraft(G, 'de', g)); assert.ok(!startCraft(G, 'de', g)); stopCraft(G); assert.ok(H.bag.includes(g), 'прервали — вещь цела');
  // нельзя — ничего не встаёт в очередь
  assert.ok(!startCraft(G, 'smelt', 'copper', 1)); assert.ok(!G.P.craft);
});
