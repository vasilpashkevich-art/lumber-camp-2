// v136: Болотный край — мир, топи, островки и гати, застава, переходы, новые мобы (сеть, хватка, тина), серебро, заказы.
import test from 'node:test';
import assert from 'node:assert/strict';
import { SWAMP, SHROOM, FARMS, ZONES, CONTINENT } from '../data/zones.js';
import { MOBS } from '../data/mobs.js';
import { ORES, MINE } from '../data/mining.js';
import { HERBS } from '../data/herbs.js';
import { ORDERS } from '../data/orders.js';
import { buildWorld, inCity } from '../src/world/world.js';
import { findPath } from '../src/world/relief.js';
import { newHero } from '../src/entities/hero.js';
import { createGame, update } from '../src/systems/game.js';
import { migrate } from '../src/engine/save.js';
import { rng } from '../src/engine/util.js';

const W = buildWorld(SWAMP);
const game = (cls = 'warrior', lvl = 15) => { const h = newHero('Т', cls); h.lvl = lvl; h.zone = 'swamp'; return createGame(h, W, { rand: rng(7) }); };
const run = (G, sec, I = {}) => { for (let i = 0; i < sec * 20; i++) { update(G, 0.05, i === 0 ? I : {}); G.ev.length = 0; } };
const quiet = G => G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; });
const pathOk = (a, b) => { const p = findPath(W, a.x, a.y, b.x, b.y); return p && p.length > 0; };

test('мир: застава безопасна, приход на суше, 12 логов, мобы есть, один редкий', () => {
  assert.equal(ZONES.swamp, SWAMP); assert.equal(SWAMP.camps.length, 12);
  assert.ok(SWAMP.shape && SWAMP.shape.length > 50, 'граница по карте');
  assert.ok(W.walkable(SWAMP.arrive.x, SWAMP.arrive.y), 'место прихода');
  assert.ok(inCity(W, W.village.x, W.village.y + 60), 'застава — безопасное место');
  assert.ok(W.houses.some(b => b.vendor), 'торговец'); assert.ok(W.houses.some(b => b.smelt), 'плавильня'); assert.ok(W.houses.some(b => b.bind), 'ночлег');
  for (const c of W.camps) for (const s of c.spawns) { if (c.water) { assert.ok(W.swimOk(s.x, s.y), `${c.name} в воде`); continue; } assert.ok(W.walkable(s.x, s.y), `${c.name} ${s.kind}`); assert.ok(!W.water(s.x, s.y, 0), `${c.name} не в воде`); }
  for (const c of SWAMP.camps) for (const k of [].concat(c.mob)) assert.ok(MOBS[k], k);
  assert.equal(SWAMP.camps.filter(c => [].concat(c.mob).some(k => MOBS[k].rare)).length, 1, 'одна Хозяйка топи');
  assert.ok(CONTINENT.find(z => z.id === 'swamp').open);
});

test('топь непроходима, островки и гати — проходимы', () => {
  for (const [px, py] of SWAMP.ponds) assert.ok(!W.walkable(px, py) || W.onGat(px, py) || W.islands.some(([x, y, rx, ry]) => ((px - x) / rx) ** 2 + ((py - y) / ry) ** 2 < 1), `вода ${px},${py}`);
  for (const [x, y] of SWAMP.islands) assert.ok(W.walkable(x, y), `островок ${x},${y}`);
  for (const [[ax, ay], [bx, by]] of SWAMP.gati) { const mx = (ax + bx) / 2, my = (ay + by) / 2; assert.ok(W.onGat(mx, my) && W.walkable(mx, my), `гать ${ax},${ay}`); }
  assert.ok(!W.trees.some(t => W.water(t.x, t.y, 0)), 'деревья не в воде');
});

test('оба выхода связаны с заставой и друг с другом, логова достижимы', () => {
  const V = W.village, ex = SWAMP.exits;
  assert.equal(ex.length, 2);
  for (const e of ex) { assert.ok(ZONES[e.zone], e.zone); assert.ok(W.walkable(e.x, e.y), `выход ${e.name} на суше`); assert.ok(pathOk(V, e), `путь к ${e.name}`); }
  assert.ok(ZONES.shroom.exits.some(e => e.zone === 'swamp') && ZONES.farms.exits.some(e => e.zone === 'swamp'), 'входы из Грибного леса и Хутора');
  for (const c of W.camps) if (!c.water) for (const sp of c.spawns) assert.ok(pathOk(V, sp), `логово ${c.name} ${sp.kind}`);
});

test('рыбак кидает сеть — герой не шагнёт; утопленник хватает', () => {
  const G = game(); quiet(G); const P = G.P;
  const m = G.mobs.find(m => m.kind === 'fisher'); m.state = 'chase'; m.respawnAt = 0; m.x = m.hx = P.x + 240; m.y = m.hy = P.y; m.hp = m.max; m.cd = 0;
  let netted = false; for (let i = 0; i < 160; i++) { update(G, 0.05, {}); if (G.shots.some(s => s.kind === 'fishnet')) netted = true; if ((P.rooted || 0) > 0) break; G.ev.length = 0; }
  assert.ok(netted, 'сеть летела'); assert.ok((P.rooted || 0) > 0, 'герой в сети');
  const d = G.mobs.find(m => m.kind === 'drowned'); P.rooted = 0; d.state = 'chase'; d.respawnAt = 0; d.x = d.hx = P.x + 30; d.y = d.hy = P.y; d.hp = d.max; d.cd = 0; m.state = 'dead'; m.respawnAt = 1e9;
  let grabbed = false; for (let i = 0; i < 100; i++) { update(G, 0.05, {}); if (G.fx.some(f => f.k === 'grab')) grabbed = true; G.ev.length = 0; G.fx.length = 0; }
  assert.ok(grabbed, 'хватка');
});

test('увалень бьёт тиной по площади, Хозяйка зовёт утопленников', () => {
  assert.equal(MOBS.bog_hulk.smash.style, 'mud'); assert.ok(MOBS.bog_mistress.rare && MOBS.bog_mistress.fem && MOBS.bog_mistress.summon);
  assert.equal(MOBS.bog_mistress.summon.kind, 'drowned');
});

test('серебро: навык 150, потолок 200; болотник; заказы зоны', () => {
  assert.equal(ORES.silver.req, 150); assert.equal(MINE.cap, 200); assert.ok(SWAMP.ore.some(o => o.metal === 'silver'));
  assert.ok(HERBS.bogweed && HERBS.bogweed.req >= 100); assert.ok(SWAMP.herbs.some(h => h.herb === 'bogweed'));
  assert.ok(ORDERS.swamp && ORDERS.swamp.length >= 9);
  for (const o of ORDERS.swamp) if (o.mob) for (const k of [].concat(o.mob)) assert.ok(MOBS[k], k);
});

test('старое сохранение героя в Грибном лесу грузится, зона swamp — новая', () => {
  const h = migrate({ ...newHero('С', 'mage'), zone: 'shroom', lvl: 14 });
  assert.equal(h.zone, 'shroom'); assert.ok(h.veins);
  const G = game('archer', 14); run(G, 5); assert.ok(G.P.hp > 0);
});
