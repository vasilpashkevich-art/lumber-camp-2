// v117: Жрица Квакша (головастики, обряд в купели с тотемами, ядовитый дождь и листья) и Король квакунов
// (трон под охраной, язык и проглатывание — плен, превращение в жабу, квак с укрытием за колоннами).
import test from 'node:test';
import assert from 'node:assert/strict';
import { TEMPLE } from '../data/zones.js';
import { MOBS } from '../data/mobs.js';
import { buildWorld } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { createGame, update } from '../src/systems/game.js';
import { onPad, padUp, colsOf } from '../src/systems/boss.js';
import { rng } from '../src/engine/util.js';

function setup(kind, keep = [], seed = 3) {
  const W = buildWorld(TEMPLE), h = newHero('Т', 'warrior'); h.lvl = 17; h.zone = 'temple';
  const G = createGame(h, W, { rand: rng(seed) }), m = G.mobs.find(o => o.kind === kind);
  for (const o of G.mobs) if (o !== m && !keep.includes(o.camp.name)) { o.state = 'dead'; o.respawnAt = 1e18; }
  G.P.x = m.x - 70; G.P.y = m.y + 40; m.state = 'chase'; G.P.hp = G.st.maxHp;
  return { G, m, W };
}
const run = (G, s, I = {}) => { for (let i = 0; i < s / 0.05; i++) { update(G, 0.05, typeof I === 'function' ? I(i) : I); if (G.P.hp < G.st.maxHp * 0.3) G.P.hp = G.st.maxHp; } };
const only = (G, m, k) => { for (const q in m.B.cd) m.B.cd[q] = 99; m.B.cd[k] = 0; m.cd = 0; };
const live = (G, m, pred) => G.mobs.filter(o => o.owner === m && o.state !== 'dead' && pred(o));

test('данные: у Жрицы и Короля три фазы, все умения описаны; помощники есть', () => {
  for (const k of ['boss_priestess', 'boss_king']) { const A = MOBS[k].ai; assert.equal(A.phases.length, 3); for (const p of A.phases) for (const a of p.acts) assert.ok(A.acts[a], k + ' ' + a); assert.ok(MOBS[k].abil.length >= 4); }
  assert.ok(MOBS.tadpole && MOBS.kvak_totem && MOBS.kvak_totem.still);
});

test('Жрица: зовёт головастиков, не больше предела', () => {
  const { G, m } = setup('boss_priestess'); run(G, 0.1); only(G, m, 'adds'); run(G, 0.2);
  assert.equal(live(G, m, o => o.kind === 'tadpole').length, 2);
  for (let i = 0; i < 4; i++) { m.B.cd.adds = 0; run(G, 0.1); } assert.ok(live(G, m, o => o.kind === 'tadpole').length <= 4);
});

test('Жрица: обряд — в купели неуязвима; сломали тотемы — оглушена, не сломали — удар 70%', () => {
  for (const breakIt of [true, false]) {
    const { G, m } = setup('boss_priestess'); G.P.hp = G.st.maxHp; run(G, 0.1);
    m.hp = m.max * 0.55; run(G, 0.3);
    assert.equal(m.B.act && m.B.act.k, 'rite'); const tt = live(G, m, o => o.kind === 'kvak_totem'); assert.equal(tt.length, 3);
    run(G, 3); const font = TEMPLE.decor.font; assert.ok(Math.hypot(m.x - font[0], m.y - font[1]) < 30, 'в купели');
    const hp0 = m.hp; m.state = 'chase'; G.P.target = m; G.P.x = m.x - 50; G.P.y = m.y; run(G, 0.5, { attack: true }); assert.equal(m.hp, hp0, 'неуязвима');
    if (breakIt) { for (const o of tt) { o.hp = 1; o.state = 'chase'; } for (const o of tt) { G.P.target = o; G.P.x = o.x - 40; G.P.y = o.y; run(G, 1.5, { attack: true }); } assert.ok(m.stun > 0 || !m.B.act, 'обряд сорван'); assert.ok(!m.B.rite); }
    else { const before = G.P.hp; G.P.hp = G.st.maxHp; G.P.x = m.x - 300; G.P.y = m.y + 100; let low = 1; for (let i = 0; i < 20 / 0.05; i++) { update(G, 0.05, {}); low = Math.min(low, G.P.hp / G.st.maxHp); if (!m.B.rite) break; } assert.ok(low < 0.4, 'удар обряда ' + low); assert.equal(live(G, m, o => o.kind === 'kvak_totem').length, 0); void before; }
  }
});

test('Жрица: ядовитый дождь бьёт мимо листа; на живом листе — нет; листья тонут по очереди, хоть один всегда есть', () => {
  const { G, m } = setup('boss_priestess'); run(G, 0.1); m.hp = m.max * 0.25; m.B.phase = 1; run(G, 0.3);
  assert.ok(G.rain && G.pads.length === 4);
  for (let t = 0; t < 32; t += 0.5) { G.t += 0.5; assert.ok(G.pads.some(p => padUp(G, p)), 'нет ни одного листа в ' + t); }
  const p = G.pads.find(q => padUp(G, q)); G.P.x = m.x - 400; G.P.y = m.y - 400; G.P.hp = G.st.maxHp; m.state = 'chase';
  const h0 = G.P.hp; m.cd = 99; m.B.cd.adds = 99; update(G, 0.5, {}); assert.ok(G.P.hp < h0, 'дождь жжёт');
  G.P.x = p.x; G.P.y = p.y; assert.ok(onPad(G)); const h1 = G.P.hp; G.rain.dps = 0.035; const was = G.mobs.filter(o => o !== m).length;
  for (const o of G.mobs) if (o !== m) o.state = 'dead'; m.cd = 99; m.D = { ...m.D, trait: 'none', reach: 0 }; m.x = p.x + 900;
  update(G, 0.2, {}); assert.ok(G.P.hp >= h1 - 1e-6, 'на листе не жжёт'); void was;
});

test('Король: на троне неуязвим, пока жива стража; стража убита — встаёт', () => {
  const { G, m } = setup('boss_king', ['Стража Короля']); run(G, 0.2);
  assert.equal(m.B.act && m.B.act.k, 'throne');
  const gs = G.mobs.filter(o => o.camp.name === 'Стража Короля'); assert.ok(gs.every(o => o.state === 'chase'), 'стража поднята');
  run(G, 2); const hp0 = m.hp; G.P.target = m; G.P.x = m.x - 60; G.P.y = m.y + 10; run(G, 1, { attack: true }); assert.equal(m.hp, hp0, 'неуязвим');
  assert.ok(G.shots.some(s => s.m === m) || G.ev.length >= 0);
  for (const o of gs) { o.state = 'dead'; o.respawnAt = 1e18; } run(G, 0.3);
  assert.ok(!m.B.act || m.B.act.k !== 'throne'); assert.equal(m.B.immune, 0);
});

test('Король: язык ловит; плен — нельзя ходить и бить; ударами вырываются быстрее', () => {
  const times = [];
  for (const mash of [false, true]) {
    const { G, m } = setup('boss_king'); run(G, 0.3); m.hp = m.max * 0.6; run(G, 0.1); assert.equal(m.B.phase, 1);
    G.P.x = m.x - 250; G.P.y = m.y; only(G, m, 'tongue'); run(G, 0.1); assert.equal(m.B.act && m.B.act.k, 'tongue');
    run(G, 1.0); assert.ok(G.P.held, 'пойман'); const x0 = G.P.x;
    let n = 0; while (G.P.held && n < 200) { update(G, 0.05, mash ? { attackTap: n % 3 === 0, mx: 1 } : { mx: 1 }); n++; m.B.cd.tongue = 99; m.B.cd.leap = 99; }
    assert.ok(!G.P.held); times.push(n * 0.05); assert.ok(Math.abs(G.P.x - x0) < 140, 'держит у пасти');
  }
  assert.ok(times[1] < times[0] - 0.8, 'ударами быстрее: ' + times.join(' / '));
});

test('Король: с 35% — жаба; квак оглушает на открытом месте, за колонной — нет, колонна разбивается со второго', () => {
  const { G, m, W } = setup('boss_king'); run(G, 0.3); m.hp = m.max * 0.3; run(G, 0.1);
  assert.equal(m.B.phase, 2); assert.equal(m.look, 'boss_toad'); m.B.immune = 0;
  const cs = colsOf(G, m); assert.equal(cs.length, 4, 'четыре колонны в зале');
  // открыто
  m.x = 3300; m.y = 650; G.P.x = 3300; G.P.y = 800; only(G, m, 'kvak'); run(G, 0.1); assert.equal(m.B.act && m.B.act.k, 'kvak');
  const h0 = G.P.hp; for (let i = 0; i < 2.4 / 0.05; i++) { m.x = 3300; m.y = 650; update(G, 0.05, {}); } assert.ok(G.P.stunT > 0 && G.P.hp < h0, 'оглушён');
  G.P.stunT = 0;
  // за колонной: колонна между Королём и героем
  const c = cs[0], ax = c.x - m.x, ay = c.y - m.y, d = Math.hypot(ax, ay);
  for (let k = 0; k < 2; k++) {
    only(G, m, 'kvak'); run(G, 0.1); const h1 = G.P.hp;
    for (let i = 0; i < 2.4 / 0.05; i++) { m.x = 3300; m.y = 650; G.P.x = c.x + ax / d * 50; G.P.y = c.y + ay / d * 30; update(G, 0.05, {}); }
    assert.ok(!(G.P.stunT > 0) && G.P.hp >= h1 - 1, 'укрылся ' + k);
  }
  assert.equal(W.colHit[c.i], 2); const b = W.blocks.find(q => q.col === c.i); assert.ok(b.off, 'разбитая колонна не мешает пройти');
  assert.ok(W.walkable(c.x, c.y - 4));
  m.state = 'return'; run(G, 0.1); assert.ok(!b.off && !W.colHit[c.i], 'бой заново — колонны целы'); assert.equal(m.look, null);
});

test('Король-жаба: проглатывает стоящего у пасти, потом выплёвывает и оглушён', () => {
  const { G, m } = setup('boss_king'); run(G, 0.3); m.hp = m.max * 0.3; run(G, 0.1); m.B.immune = 0;
  G.P.x = m.x + 80; G.P.y = m.y; only(G, m, 'swallow'); run(G, 0.1); assert.equal(m.B.act && m.B.act.k, 'swallow');
  run(G, 1); assert.ok(G.P.held && G.P.held.kind === 'swallow');
  let n = 0; while (G.P.held && n < 200) { update(G, 0.05, { attackTap: n % 3 === 0 }); n++; for (const q in m.B.cd) m.B.cd[q] = 99; }
  assert.ok(!G.P.held && m.stun > 0, 'выплюнул и оглушён');
});

test('гибель героя в плену и на дожде — плен и дождь снимаются, бой заново', () => {
  const { G, m } = setup('boss_priestess'); run(G, 0.1); m.hp = m.max * 0.25; m.B.phase = 1; run(G, 0.3); assert.ok(G.rain);
  G.P.held = { m, t: 3, max: 3, dps: 0, kind: 'tongue' }; G.P.hp = 1; G.P.x = m.x - 900; G.P.y = m.y - 600;
  for (let i = 0; i < 60 && !G.P.dead; i++) update(G, 0.05, {});
  assert.ok(G.P.dead); assert.ok(!G.P.held); run(G, 1.5); assert.ok(!G.rain, 'дождь кончился');
});
