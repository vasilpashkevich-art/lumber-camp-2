// v140: вода — отмели и глубина, герой по пояс в воде (медленно, без коня, без копания), водные звери живут только в воде,
// замечают того, кто в воде, и отстают, когда он выходит на сушу. Жители, предметы заданий, выходы, доски — на суше.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ZONES } from '../data/zones.js';
import { MOBS } from '../data/mobs.js';
import { WATER } from '../data/balance.js';
import { NPCS, QUESTS } from '../data/quests.js';
import { buildWorld } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { createGame, update } from '../src/systems/game.js';
import { rng } from '../src/engine/util.js';

const ZS = ['farms', 'shroom', 'swamp'];
const WS = Object.fromEntries(ZS.map(z => [z, buildWorld(ZONES[z])]));
const game = (z, lvl = 16) => { const h = newHero('В', 'warrior'); h.lvl = lvl; h.zone = z; const G = createGame(h, WS[z], { rand: rng(3) }); G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); return G; };
const step = (G, sec, I = {}) => { for (let i = 0; i < sec * 20; i++) { update(G, 0.05, I); G.ev.length = 0; G.fx.length = 0; } };
// точка на отмели и на суше рядом с ней — поиском по сетке
const findWet = W => { for (let y = 200; y < W.H; y += 30) for (let x = 200; x < W.W; x += 30) if (W.wet(x, y) && W.walkable(x, y) && W.walkable(x, y - 120) && !W.water(x, y - 120, 30)) return [x, y]; return null; };

test('в каждом крае есть отмели и глубина; отмель проходима, глубина — нет', () => {
  for (const z of ZS) {
    const W = WS[z]; let wet = 0, deep = 0;
    for (let y = 0; y < W.H; y += 40) for (let x = 0; x < W.W; x += 40) { if (!W.inside(x, y)) continue; const d = W.depthAt(x, y); if (d === 1) { wet++; assert.ok(W.walkable(x, y) || W.blocked(x, y), z + ' отмель проходима'); } if (d === 2) { deep++; assert.ok(!W.walkable(x, y), z + ' глубина'); } }
    assert.ok(wet > 50 && deep > 20, `${z}: отмель ${wet}, глубина ${deep}`);
  }
});

test('жители, места заданий, выходы, доски, приход и сухопутные логова — на суше', () => {
  for (const z of ZS) {
    const W = WS[z], Z = ZONES[z], dry = (x, y, s) => assert.ok(!W.water(x, y, 0), `${z}: ${s} в воде (${Math.round(x)}, ${Math.round(y)})`);
    for (const [id, n] of Object.entries(NPCS)) if (n.zone === z) dry(n.x, n.y, id);
    for (const [id, q] of Object.entries(QUESTS)) if (q.zone === z) for (const g of q.goals) for (const [x, y] of g.spots || []) dry(x, y, id);
    for (const e of Z.exits) dry(e.x, e.y, 'выход ' + e.name);
    for (const b of W.boards) dry(b.x, b.y + 40, 'доска');
    dry(Z.arrive.x, Z.arrive.y, 'приход');
    for (const c of W.camps) if (!c.water) for (const s of c.spawns) dry(s.x, s.y, c.name);
  }
});

test('водные логова — в воде, звери водные', () => {
  for (const z of ZS) {
    const W = WS[z], wc = W.camps.filter(c => c.water); assert.ok(wc.length >= 2, z + ' водных логов');
    for (const c of wc) for (const s of c.spawns) { assert.ok(MOBS[s.kind].aquatic, s.kind); assert.ok(W.swimOk(s.x, s.y), `${c.name} в воде`); }
  }
});

test('на отмели герой медленнее, конь не идёт в воду', () => {
  const G = game('swamp'), P = G.P, W = G.W, pt = findWet(W); assert.ok(pt, 'нашлась отмель');
  P.x = pt[0]; P.y = pt[1] - 120; const y0 = P.y; step(G, 0.5, { mx: 0, my: -1 }); const dry = y0 - P.y;
  P.x = pt[0]; P.y = pt[1]; step(G, 0.05, {}); assert.ok(P.wet, 'по пояс в воде');
  const yw = P.y; step(G, 0.5, { mx: 0, my: 1 }); const wet = Math.abs(P.y - yw);
  assert.ok(wet < dry * (WATER.slow + 0.1) && wet > dry * (WATER.slow - 0.1), `суша ${dry.toFixed(0)}, вода ${wet.toFixed(0)}`);
  P.ride = { t: 0 }; G.hero.riding = true; step(G, 0.1, {}); assert.ok(!P.ride, 'спешился');
});

test('водный зверь: замечает в воде, не выходит на сушу, отстаёт на берегу', () => {
  for (const z of ZS) {
    const G = game(z, { farms: 8, shroom: 12, swamp: 16 }[z]), P = G.P, W = G.W;
    const m = G.mobs.find(m => m.D.aquatic); m.state = 'idle'; m.respawnAt = 0; m.hp = m.max;
    // герой на суше рядом — не замечает
    const land = (() => { for (let a = 0; a < 6.28; a += 0.2) for (let d = 120; d < 400; d += 20) { const x = m.x + Math.cos(a) * d, y = m.y + Math.sin(a) * d; if (W.walkable(x, y) && !W.water(x, y, WATER.bank + 10)) return [x, y]; } })();
    if (land) { P.x = land[0]; P.y = land[1]; step(G, 1, {}); assert.equal(m.state, 'idle', z + ': на суше не заметил'); }
    // герой в воде рядом — нападает
    const wet = (() => { for (let a = 0; a < 6.28; a += 0.2) for (let d = 40; d < 130; d += 10) { const x = m.x + Math.cos(a) * d, y = m.y + Math.sin(a) * d; if (W.wet(x, y) && W.walkable(x, y)) return [x, y]; } })();
    if (!wet) continue;
    P.x = wet[0]; P.y = wet[1]; step(G, 0.6, {}); assert.equal(m.state, 'chase', z + ': в воде заметил');
    // всё время погони — только в воде
    for (let i = 0; i < 60; i++) { step(G, 0.05, {}); assert.ok(W.swimOk(m.x, m.y), z + ': зверь на суше'); }
    // герой на сухой земле — зверь отстаёт
    if (land) { P.x = land[0]; P.y = land[1]; step(G, 2.5, {}); assert.notEqual(m.state, 'chase', z + ': отстал'); }
  }
});

test('хватка зубатки держит, вертушка крокодила оглушает', () => {
  assert.ok(MOBS.catfish.grab > 0 && MOBS.crocodile.grab > 0); assert.ok(MOBS.crocodile.smash.stun > 0);
  const G = game('swamp'), P = G.P, W = G.W, m = G.mobs.find(m => m.kind === 'crocodile');
  const wet = (() => { for (let a = 0; a < 6.28; a += 0.1) for (let d = 30; d < 200; d += 10) { const x = m.hx + Math.cos(a) * d, y = m.hy + Math.sin(a) * d; if (W.wet(x, y) && W.walkable(x, y)) return [x, y]; } })();
  assert.ok(wet, 'отмель у крокодилов'); P.x = wet[0]; P.y = wet[1]; m.state = 'chase'; m.respawnAt = 0; m.hp = m.max; m.x = P.x + 40; m.y = P.y; m.cd = 0; m.smash.t = 0.1;
  let grabbed = false, stunned = false; for (let i = 0; i < 300; i++) { update(G, 0.05, {}); if ((P.rooted || 0) > 0) grabbed = true; if ((P.stunT || 0) > 0) stunned = true; G.ev.length = 0; G.fx.length = 0; P.hp = G.st.maxHp; }
  assert.ok(grabbed, 'хватка'); assert.ok(stunned, 'оглушение');
});
