// v77: Преддверие Храма квакунов — комнаты, стены, путь по коридорам, мобы в комнатах, врата туда и обратно, возрождение у костра.
import test from 'node:test';
import assert from 'node:assert/strict';
import { TEMPLE, SHROOM, ZONES } from '../data/zones.js';
import { MOBS } from '../data/mobs.js';
import { buildWorld } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { createGame, update, respawnHero } from '../src/systems/game.js';
import { rng } from '../src/engine/util.js';

const W = buildWorld(TEMPLE);
test('комнаты проходимы, скала — нет, стыки коридоров открыты', () => {
  for (const q of W.rooms) assert.ok(W.walkable((q.x0 + q.x1) / 2, (q.y0 + q.y1) / 2), q.id);
  assert.ok(!W.walkable(1200, 2100) && !W.walkable(1600, 1000) && !W.walkable(2200, 1500), 'скала');
  assert.ok(W.walkable(1600, 1500) && W.walkable(1600, 1900) && W.walkable(1900, 1360) && W.walkable(2500, 1360), 'стыки');
  assert.ok(!W.stepOk(1600, 2100, 2700, 1300), 'сквозь стену по прямой нельзя');
  const p = W.path(1600, 2230, 2700, 1300, 60000); assert.ok(p && p.length > 10, 'путь по коридорам');
  for (const [x, y] of p) assert.ok(W.walkable(x, y), 'путь по полу');
});
test('мобы подземелья: в комнатах, 20–22 ур., здоровья намного больше обычных; у стража и жреца свои повадки', () => {
  for (const c of W.camps) for (const s of c.spawns) { assert.ok(W.walkable(s.x, s.y), s.kind); assert.ok(s.lvl >= 20 && s.lvl <= 22); }
  assert.ok(MOBS.kvak_guard.hp >= 2 && MOBS.temple_frog.hp >= 1.5 && MOBS.kvak_priest.summon.kind === 'temple_frog');
  assert.equal(ZONES.temple, TEMPLE);
});
test('врата: из Грибного леса — в Преддверие, из Преддверия — к вратам снаружи; врата подземелья заперты', () => {
  const g = SHROOM.exits.find(e => e.zone === 'temple'); assert.ok(g && W.walkable(g.at.x, g.at.y) && W.roomAt(g.at.x, g.at.y).id === 'hall');
  const WS = buildWorld(SHROOM), o = TEMPLE.exits.find(e => e.zone === 'shroom'); assert.ok(WS.walkable(o.at.x, o.at.y), 'снаружи у врат можно стоять');
  assert.ok(Math.hypot(o.at.x - WS.temple.x, o.at.y - WS.temple.y) < 120);
  const G = createGame(newHero('Т', 'warrior'), W, { rand: rng(3) }); G.P.x = 2700; G.P.y = 1160;
  update(G, 0.05, { interact: true }); const t = G.ev.find(e => e.k === 'toast'); assert.ok(t && /заперты/.test(t.s));
  assert.ok(!G.ev.some(e => e.k === 'zone'));
});
test('гибель в подземелье — возрождение у костра Преддверия; мобы в зал не заходят', () => {
  const G = createGame(newHero('Т', 'warrior'), W, { rand: rng(4) }); G.P.x = 2700; G.P.y = 1300; G.P.hp = 1;
  const m = G.mobs.find(o => o.hx > 2400); m.state = 'chase';
  for (let i = 0; i < 20 * 30 && !G.P.dead; i++) { update(G, 0.05, {}); G.ev.length = 0; }
  assert.ok(G.P.dead, 'погиб'); respawnHero(G); assert.ok(Math.hypot(G.P.x - 1460, G.P.y - 2130) < 120, 'у костра'); assert.ok(W.walkable(G.P.x, G.P.y));
  for (let i = 0; i < 20 * 20; i++) { update(G, 0.05, {}); G.ev.length = 0; }
  for (const o of G.mobs) assert.ok(Math.hypot(o.x - 1600, o.y - 2110) > 200, 'моб не в зале');
});
test('опыт и деньги в подземелье больше: ×2 опыт, ×2,5 денег', () => {
  assert.equal(TEMPLE.xpMul, 2); assert.equal(TEMPLE.goldMul, 2.5); assert.ok(TEMPLE.loot.chance > 0.15);
});
