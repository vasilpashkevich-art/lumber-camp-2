// v75: умения мобов дают события для рисовки (замах по площади, удар, разбег, таран, укус, выстрелы, призыв),
// а сами эффекты рисуются без ошибок на любом возрасте.
import test from 'node:test';
import assert from 'node:assert/strict';
import { PINE, FARMS, SHROOM } from '../data/zones.js';
import { buildWorld } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { createGame, update } from '../src/systems/game.js';
import { rng } from '../src/engine/util.js';
import * as MF from '../src/art/mobfx.js';

const setup = (Z, kind, seed = 2) => {
  const G = createGame(newHero('Т', 'warrior'), buildWorld(Z), { rand: rng(seed) }); G.st.maxHp = G.P.hp = 99999; G.hero.lvl = 20;
  G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; });
  const m = G.mobs.find(o => o.kind === kind); assert.ok(m, kind);
  m.state = 'idle'; m.hp = m.max = 1e6; m.x = m.hx = 3000; m.y = m.hy = 3800; m.aggroOff = 1;
  G.P.x = 3000 + 60; G.P.y = 3800; return { G, m };
};
const kinds = G => new Set(G.fxLog);
const run = (G, sec) => { G.fxLog = G.fxLog || []; for (let i = 0; i < sec * 20; i++) { update(G, 0.05, {}); for (const f of G.fx) if (!f._seen) { f._seen = 1; G.fxLog.push(f.k); } G.ev.length = 0; } };

test('Атаман: замах показывает площадь, удар — волну (без красного пятна)', () => {
  const { G, m } = setup(PINE, 'ataman'); m.state = 'chase'; G.P.x = m.x + 100;
  run(G, 12); const K = kinds(G);
  assert.ok(K.has('tele') && K.has('slam'), [...K].join());
  assert.ok(!K.has('ring'));
  const tele = G.fxLog.indexOf('tele'), slam = G.fxLog.indexOf('slam'); assert.ok(tele < slam);
});

test('Полоз: бросок кольцами — свой стиль', () => {
  const { G, m } = setup(SHROOM, 'snake'); m.state = 'chase'; G.P.x = m.x + 100;
  G.fxLog = []; let seen = null; for (let i = 0; i < 240; i++) { update(G, 0.05, {}); const f = G.fx.find(o => o.k === 'tele'); if (f) seen = f; G.ev.length = 0; }
  assert.ok(seen && seen.style === 'coil');
});

test('кабан: пыль на разбеге и таран; паук: яд', () => {
  const { G, m } = setup(PINE, 'boar'); m.state = 'chase'; G.P.x = m.x + 250; m.charge.cd = 0;
  run(G, 6); let K = kinds(G); assert.ok(K.has('hoof'), 'пыль из-под копыт'); assert.ok(K.has('ram'), 'таран');
  const S = setup(PINE, 'spider'); S.m.state = 'chase'; S.G.P.x = S.m.x + 20; run(S.G, 4); K = kinds(S.G); assert.ok(K.has('venom'));
});

test('поджигатель, споровик, шаман: попадание даёт свой эффект; призыв — появление', () => {
  for (const [Z, k, hit] of [[FARMS, 'firestarter', 'fireSplash'], [SHROOM, 'sporo', 'sporeBurst'], [SHROOM, 'kvak_shaman', 'curseHit']]) {
    const { G, m } = setup(Z, k); m.state = 'chase'; G.P.x = m.x + 120; run(G, k === 'kvak_shaman' ? 14 : 8); const K = kinds(G);
    assert.ok(K.has(hit), k + ': ' + [...K].join());
    if (k === 'kvak_shaman') assert.ok(K.has('summon'), 'призыв сородича');
  }
});

test('эффекты рисуются без ошибок на любом возрасте (заглушка холста)', () => {
  const calls = []; const g = new Proxy({}, { get: (_, p) => p === 'canvas' ? {} : (...a) => { calls.push(p); return p.startsWith('create') ? { addColorStop() {} } : undefined; }, set: () => true });
  const e = { x: 0, y: 0, r: 110, seed: 5, max: 1.6, style: 'slam', kind: 'crow' };
  for (const a of [0, 0.05, 0.3, 0.8, 1.5, 3]) {
    MF.telegraph(g, e, Math.min(1, a), a); MF.gather(g, e, Math.min(1, a)); MF.slam(g, e, a); MF.slam(g, { ...e, style: 'coil' }, a);
    MF.hoofDust(g, 0, 0, a, 1); MF.ram(g, e, a); MF.venom(g, e, a); MF.sporeBurst(g, e, a); MF.fireSplash(g, e, a); MF.curseHit(g, e, a);
    for (const k of ['crow', 'kvakun', 'weaver']) MF.summonFx(g, { ...e, kind: k }, a);
    const s = { x: 0, y: 0, vx: 300, vy: 0, age: a }; MF.sporeShot(g, s, a); MF.bottleShot(g, s, a); MF.curseShot(g, s, a);
  }
  assert.ok(calls.length > 100);
});
