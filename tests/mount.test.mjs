// v121: скакуны — Конный двор на западном берегу, покупка с 15-го уровня, сесть за 1,5 с, бег ×1,6, слезть от удара, умения, копания.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ZONES, TEMPLE } from '../data/zones.js';
import { MOUNTS } from '../data/mounts.js';
import { buildWorld } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { createGame, update } from '../src/systems/game.js';
import { buyMount, toggleMount } from '../src/systems/mount.js';
import { migrate } from '../src/engine/save.js';
import { rng } from '../src/engine/util.js';

const W = buildWorld(ZONES.pine);
function setup(lvl = 15, gold = 20000) {
  const h = newHero('К', 'warrior'); h.lvl = lvl; h.gold = gold; migrate(h);
  const G = createGame(h, W, { rand: rng(5) }); for (const m of G.mobs) { m.state = 'dead'; m.respawnAt = 1e18; }
  const Y = W.yard; G.P.x = Y.x + Y.stable.dx; G.P.y = Y.y + Y.stable.dy + 60; return G;
}
const run = (G, s, I = {}) => { for (let i = 0; i < s / 0.05; i++) update(G, 0.05, I); };

test('Конный двор: на западном берегу, у конюшни — конюший (событие окна)', () => {
  const Y = W.yard; assert.ok(Y && Y.x < 1400, 'запад'); assert.ok(W.edgeDist(Y.x - 300, Y.y) < 260, 'у воды');
  assert.ok(!W.camps.some(c => Math.hypot(c.x - Y.x, c.y - Y.y) < Y.R + 100), 'рядом нет логов');
  const G = setup(); update(G, 0.05, { interact: true }); assert.ok(G.ev.some(e => e.k === 'stable'));
  assert.equal(W.trees.filter(t => Math.hypot(t.x - Y.x, t.y - Y.y) < Y.R - 60).length, 0, 'деревьев во дворе нет');
});

test('покупка: с 15-го уровня, за деньги, один раз; сохранение не теряет коня', () => {
  const G14 = setup(14); assert.equal(buyMount(G14, 'bay'), false); assert.equal(G14.hero.mounts.length, 0);
  const Gp = setup(15, 100); assert.equal(buyMount(Gp, 'bay'), false);
  const G = setup(15, 20000); assert.ok(buyMount(G, 'bay')); assert.equal(G.hero.gold, 20000 - MOUNTS.bay.price); assert.deepEqual(G.hero.mounts, ['bay']); assert.equal(G.hero.mount, 'bay');
  assert.equal(buyMount(G, 'bay'), false, 'второй раз не продают');
  const h2 = JSON.parse(JSON.stringify(G.hero)); migrate(h2); assert.deepEqual(h2.mounts, ['bay']); assert.equal(h2.mount, 'bay');
  const old = newHero('Ст', 'mage'); delete old.mounts; delete old.mount; migrate(old); assert.deepEqual(old.mounts, []); assert.equal(old.mount, null);
});

test('сесть: 1,5 с; шаг сбивает; верхом быстрее в 1,6 раза; Z — слезть', () => {
  const G = setup(); buyMount(G, 'grey');
  update(G, 0.05, { mount: true }); assert.ok(G.P.mountCast); run(G, 0.5, { mx: 1 }); assert.ok(!G.P.mountCast && !G.P.ride, 'шаг сбил');
  update(G, 0.05, { mount: true }); run(G, 1.6); assert.equal(G.P.ride, 'grey');
  G.P.x = 1500; G.P.y = 3720; const x0 = G.P.x; run(G, 1, { mx: 1 }); const dRide = G.P.x - x0;
  update(G, 0.05, { mount: true }); assert.ok(!G.P.ride);
  G.P.x = 1500; G.P.y = 3720; const x1 = G.P.x; run(G, 1, { mx: 1 }); const dWalk = G.P.x - x1;
  assert.ok(Math.abs(dRide / dWalk - 1.6) < 0.08, `${dRide} / ${dWalk}`);
});

test('с коня сбрасывает удар моба, свой удар и умение; копать — пешком; в бою не сесть', () => {
  const G = setup(); buyMount(G, 'bay'); update(G, 0.05, { mount: true }); run(G, 1.6); assert.ok(G.P.ride);
  update(G, 0.05, { attackTap: true }); assert.ok(!G.P.ride, 'свой удар');
  G.P.lastCombat = -99; update(G, 0.05, { mount: true }); run(G, 1.6); assert.ok(G.P.ride);
  update(G, 0.05, { ability: true }); assert.ok(!G.P.ride, 'умение');
  // удар моба вне двора
  G.P.x = W.yard.x + 900; G.P.y = W.yard.y - 200; G.P.lastCombat = -99; update(G, 0.05, { mount: true }); run(G, 1.6); assert.ok(G.P.ride);
  const m = G.mobs[0]; Object.assign(m, { state: 'chase', x: G.P.x + 30, y: G.P.y, hx: G.P.x + 30, hy: G.P.y, cd: 0, hp: m.max }); run(G, 2);
  assert.ok(!G.P.ride, 'удар моба'); assert.ok(G.ev.some(e => e.k === 'toast' && /сбросили/.test(e.s)));
  G.ev.length = 0; update(G, 0.05, { mount: true }); assert.ok(!G.P.mountCast, 'в бою не сесть'); assert.ok(G.ev.some(e => /В бою/.test(e.s)));
});

test('в подземелье коня не позвать; верхом переходишь в другой край (не в подземелье)', () => {
  const h = newHero('Д', 'archer'); h.lvl = 16; migrate(h); h.mounts = ['black']; h.mount = 'black'; h.riding = true;
  const G = createGame(h, buildWorld(ZONES.farms), { rand: rng(1) }); assert.equal(G.P.ride, 'black', 'верхом и в Хуторе');
  const Gd = createGame(h, buildWorld(TEMPLE), { rand: rng(1) }); assert.ok(!Gd.P.ride, 'в храме — пешком');
  Gd.P.lastCombat = -99; assert.equal(toggleMount(Gd), false);
});
