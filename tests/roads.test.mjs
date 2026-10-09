// v63: дороги — мосты поперёк реки и по дороге, концы дорог доведены до места, площадки, развилка не у ворот.
import test from 'node:test';
import assert from 'node:assert/strict';
import { PINE, FARMS } from '../data/zones.js';
import { buildWorld, moveTo } from '../src/world/world.js';
import { dist } from '../src/engine/util.js';

const F = buildWorld(FARMS), P = buildWorld(PINE);

test('мосты стоят на дорогах, дорога идёт почти поперёк реки, по мосту можно перейти', () => {
  assert.equal(F.river.bridgeAt.length, 2);
  for (const b of F.river.bridgeAt) {
    assert.ok(F.roadD(b.x, b.y) < 1, 'мост на дороге');
    assert.ok(Math.abs(Math.sin(b.ra - b.a)) > 0.85, 'дорога пересекает реку почти под прямым углом');
    // идём по дороге через мост: с одного берега на другой
    const ca = Math.cos(b.ra), sa = Math.sin(b.ra); let x = b.x - ca * 130, y = b.y - sa * 130;
    for (let i = 0; i < 65; i++) [x, y] = moveTo(F, x, y, x + ca * 4, y + sa * 4);
    assert.ok(dist(x, y, b.x + ca * 130, b.y + sa * 130) < 20, 'перешёл по мосту');
    // мимо моста — вода
    assert.ok(F.water(b.x - sa * 80, b.y + ca * 80), 'рядом с мостом — вода');
  }
});

test('концы дорог: у двери мельницы, у калитки кладбища; площадки у колодца и на пепелище', () => {
  const end = rd => rd[rd.length - 1];
  assert.ok(F.roads.some(rd => dist(...end(rd), FARMS.mill.x, FARMS.mill.y) < 50), 'дорога к мельнице');
  const gy = PINE.graveyard, e = P.roads.map(end).find(p => dist(p[0], p[1], gy.x, gy.y) < 260);
  assert.ok(e, 'дорога к кладбищу'); assert.ok(Math.abs(((e[0] - gy.x) / 190) ** 2 + ((e[1] - gy.y) / 104) ** 2 - 1) < 0.1, 'конец — на ограде');
  assert.equal(F.roadD(3000, 1075), 0); assert.equal(F.roadD(6250, 3230), 0);
});

test('развилка у южных ворот столицы отодвинута: у ворот одна дорога', () => {
  const c = P.cap, gx = c.x, gy = c.y + c.R;
  const starts = P.roads.filter(rd => rd.some(p => dist(p[0], p[1], gx, gy) < 300)).length;
  assert.equal(starts, 1);
});
