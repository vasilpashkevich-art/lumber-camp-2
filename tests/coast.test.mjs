// v114: границы зон по карте континента — неровная кромка (Z.shape), род берега по сторонам (Z.coast), перенесённые выходы.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ZONES } from '../data/zones.js';
import { buildWorld } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { createGame } from '../src/systems/game.js';
import { initVeins } from '../src/systems/mining.js';
import { rng, dist, inPoly } from '../src/engine/util.js';

const IDS = ['pine', 'farms', 'shroom'];
const WS = Object.fromEntries(IDS.map(id => [id, buildWorld(ZONES[id])]));

test('у трёх зон своя граница и берега по карте: Сосновый дол — море на западе, обрыв на севере; Хутор — море на юге и западе, топь на востоке; Грибной лес — гряда на севере, море на востоке, топь на юге', () => {
  assert.deepEqual(ZONES.pine.coast, { north: 'cliff', east: 'forest', south: 'forest', west: 'sea' });
  assert.equal(ZONES.farms.coast.east, 'swamp'); assert.equal(ZONES.farms.coast.south, 'sea');
  assert.equal(ZONES.shroom.coast.north, 'cliff'); assert.equal(ZONES.shroom.coast.east, 'sea'); assert.equal(ZONES.shroom.coast.south, 'swamp');
  for (const id of IDS) {
    const W = WS[id]; assert.ok(ZONES[id].shape.length > 40, id);
    assert.equal(W.sideOf(10, ZONES[id].H / 2), 'west'); assert.equal(W.sideOf(ZONES[id].W / 2, 5), 'north');
    // у моря у кромки деревьев нет, у леса — есть
    const edgeTrees = W.trees.filter(t => t.edge), sea = edgeTrees.filter(t => W.coastAt(t.x, t.y) === 'sea');
    assert.equal(sea.length, 0, id + ' деревья у моря'); assert.ok(edgeTrees.length > 30, id);
  }
});

test('всё важное внутри новой границы: логова (каждая точка появления), посёлки, выходы, дороги', () => {
  for (const id of IDS) {
    const W = WS[id], Z = ZONES[id];
    for (const c of W.camps) for (const s of c.spawns) assert.ok(W.walkable(s.x, s.y), `${id} ${c.name}`);
    for (const e of Z.exits) { assert.ok(W.inside(e.x, e.y), `${id} выход ${e.to}`); if (!e.temple) assert.ok(W.edgeDist(e.x, e.y) < 200, `${id} выход у края ${e.to} ${Math.round(W.edgeDist(e.x, e.y))}`); }
    for (const rd of Z.roads) for (const p of rd) assert.ok(inPoly(p[0], p[1], W.edge) || W.edgeDist(p[0], p[1]) < 120, `${id} дорога ${p}`);
    if (W.town) assert.ok(W.inside(W.town.x, W.town.y, 300), id + ' посёлок');
  }
  // выходы на Болото и в Нагорье — где на карте
  assert.ok(ZONES.farms.exits.find(e => e.to === 'Болотный край').x > 7000, 'Брод — на востоке Хутора');
  assert.ok(ZONES.shroom.exits.find(e => e.to === 'Болотный край').y > 6000, 'Гать — на юге Грибного леса');
  assert.ok(ZONES.shroom.exits.find(e => e.to === 'Скалистое нагорье').y < 600, 'Каменный перевал — на севере');
});

test('старое сохранение: герой за новой границей встаёт в посёлок, жилы за границей встают заново внутри', () => {
  const h = newHero('Т', 'warrior'); h.zone = 'farms'; h.pos = { x: 4000, y: 4720 };   // у старого южного выхода — теперь море
  const W = WS.farms; assert.ok(!W.walkable(4000, 4720), 'там теперь море');
  const G = createGame(h, W, { rand: rng(1) }); assert.ok(W.walkable(G.P.x, G.P.y));
  h.veins = { farms: [{ a: 3, metal: 'tin', x: 3200, y: 4900, at: 0, s: 1 }] };
  initVeins(G); assert.ok(G.veins.every(v => W.walkable(v.x, v.y) && W.edgeDist(v.x, v.y) >= 60));
  assert.ok(!G.veins.some(v => v.y === 4900));
});
