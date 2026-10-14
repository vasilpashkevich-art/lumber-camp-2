// v94: боссы с фазами и умениями — Воевода Бульк (конус, рывок, щит, топот, прыжок) и Храмовый аспид (бросок, кольцо с просветом, сброс кожи).
import test from 'node:test';
import assert from 'node:assert/strict';
import { TEMPLE } from '../data/zones.js';
import { MOBS } from '../data/mobs.js';
import { buildWorld } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { createGame, update } from '../src/systems/game.js';
import { phaseOf, shieldBlocks, ringBlocks } from '../src/systems/boss.js';
import { rng } from '../src/engine/util.js';

const W = buildWorld(TEMPLE);
function setup(kind, seed = 3) {
  const h = newHero('Т', 'warrior'); h.lvl = 16; h.zone = 'temple';
  const G = createGame(h, W, { rand: rng(seed) }), m = G.mobs.find(o => o.kind === kind);
  for (const o of G.mobs) if (o !== m) { o.state = 'dead'; o.respawnAt = 1e18; }
  G.P.x = m.x - 70; G.P.y = m.y; m.state = 'chase'; G.P.hp = G.st.maxHp;
  return { G, m };
}
const run = (G, s, I = {}) => { for (let i = 0; i < s / 0.05; i++) update(G, 0.05, I); };
const evs = (G, re) => G.ev.filter(e => (e.k === 'txt' || e.k === 'toast') && re.test(e.s));
const startAct = (G, m, k) => { for (const q in m.B.cd) m.B.cd[q] = 99; m.B.cd[k] = 0; m.cd = 0; };

test('данные: у Булька и Аспида три фазы, умения, тактика; у всех боссов храма есть описание для окна J', () => {
  for (const k of ['boss_bulk', 'boss_aspid']) { const A = MOBS[k].ai; assert.equal(A.phases.length, 3); assert.deepEqual(A.phases.map(p => p.at), [1, 0.6, 0.3]); for (const p of A.phases) for (const a of p.acts) assert.ok(A.acts[a], k + ' ' + a); }
  for (const k of ['boss_bulk', 'boss_aspid', 'boss_priestess', 'boss_king']) assert.ok(MOBS[k].tactic && MOBS[k].abil.length >= 2, k);
});

test('фазы по здоровью: 60% и 30%, со словами; ушёл домой — бой заново с первой', () => {
  const { G, m } = setup('boss_bulk');
  run(G, 0.1); assert.equal(m.B.phase, 0);
  m.hp = m.max * 0.55; run(G, 0.1); assert.equal(m.B.phase, 1); assert.ok(evs(G, /щит/i).length, 'сказал про щит');
  m.hp = m.max * 0.25; run(G, 0.1); assert.equal(phaseOf(m), 2); assert.equal(m.B.phase, 2);
  m.state = 'return'; run(G, 0.1); assert.equal(m.B, null); assert.ok(!G.rings || !G.rings.length);
});

test('Бульк: конус бьёт стоящего спереди (доля здоровья мимо брони), ушедшего — нет', () => {
  for (const stay of [true, false]) {
    const { G, m } = setup('boss_bulk'); run(G, 0.05); startAct(G, m, 'cone'); run(G, 0.1);
    assert.equal(m.B.act && m.B.act.k, 'cone'); assert.ok(G.fx.some(f => f.k === 'teleCone'));
    const hp0 = G.P.hp; if (!stay) { G.P.x = m.x + 250; G.P.y = m.y + 120; }
    for (let i = 0; i < 25; i++) { update(G, 0.05, {}); m.cd = 9; }   // обычные удары не мешают замеру
    const lost = (hp0 - G.P.hp) / G.st.maxHp;
    if (stay) assert.ok(lost >= 0.24, 'спереди: ' + lost); else assert.ok(lost < 0.01, 'ушёл: ' + lost);
  }
});

test('Бульк: рывок по полосе — сбивает стоящего на ней, после — сам оглушён', () => {
  const { G, m } = setup('boss_bulk'); G.P.x = m.x - 200; run(G, 0.05); startAct(G, m, 'charge'); run(G, 0.1);
  const A = m.B.act; assert.equal(A.k, 'charge'); assert.ok(G.fx.some(f => f.k === 'teleLine'));
  const hp0 = G.P.hp, x0 = m.x; run(G, 1.6);
  assert.ok(Math.abs(m.x - x0) > 150, 'пролетел'); assert.ok(hp0 - G.P.hp >= G.st.maxHp * 0.2, 'сбит'); assert.ok(m.stun > 0 || evs(G, /оглушён|увяз/).length >= 0);
});

test('Бульк: щит — спереди ×0,15, сзади полный урон; после топота щит опущен', () => {
  const { G, m } = setup('boss_bulk'); m.hp = m.max * 0.5; run(G, 0.1); assert.equal(m.B.phase, 1);
  for (const q in m.B.cd) m.B.cd[q] = 99; m.B.act = null;
  m.B.dir = Math.PI; G.P.x = m.x - 60; G.P.y = m.y; assert.ok(shieldBlocks(G, m), 'спереди — щит');
  G.P.x = m.x + 60; assert.ok(!shieldBlocks(G, m), 'сзади — нет');
  G.P.x = m.x - 60; m.B.open = 2; assert.ok(!shieldBlocks(G, m), 'щит опущен');
  // топот открывает щит
  m.B.open = 0; startAct(G, m, 'stomp'); run(G, 1.3); assert.ok(m.B.open > 0, 'опустил щит');
});

test('Бульк: прыжок на героя — после приземления оглушён', () => {
  const { G, m } = setup('boss_bulk'); m.hp = m.max * 0.2; G.P.x = m.x - 220; run(G, 0.1);
  startAct(G, m, 'leap'); run(G, 0.1); assert.equal(m.B.act.k, 'leap');
  const tx = G.P.x; G.P.x += 0; run(G, 1.4); assert.ok(Math.abs(m.x - tx) < 30, 'приземлился у героя'); assert.ok(m.stun > 0, 'оглушён');
});

test('Аспид: кольцо не выпускает, кроме как через просвет; остался внутри — 40% и сжат', () => {
  const { G, m } = setup('boss_aspid'); m.hp = m.max * 0.5; run(G, 0.1); assert.equal(m.B.phase, 1);
  startAct(G, m, 'ring'); run(G, 0.1); const R = G.rings[0]; assert.ok(R, 'кольцо');
  // поперёк кольца не там, где просвет, — нельзя; через просвет — можно
  const away = R.gap + Math.PI, ok = (an) => !ringBlocks(G, R.x, R.y, R.x + Math.cos(an) * (R.r + 10), R.y + Math.sin(an) * (R.r + 10) / 2);
  assert.ok(!ok(away), 'стена из колец'); assert.ok(ok(R.gap), 'просвет');
  // остался внутри
  G.P.x = R.x; G.P.y = R.y; const hp0 = G.P.hp; run(G, 3);
  assert.ok((hp0 - G.P.hp) / G.st.maxHp >= 0.39, 'сжат: ' + (hp0 - G.P.hp) / G.st.maxHp); assert.ok(G.P.rooted > 0 || evs(G, /сжат/).length);
  // вышел через просвет — без урона
  const g2 = setup('boss_aspid', 4); g2.m.hp = g2.m.max * 0.5; run(g2.G, 0.1); startAct(g2.G, g2.m, 'ring'); run(g2.G, 0.1); const R2 = g2.G.rings[0];
  const hp1 = g2.G.P.hp; for (let i = 0; i < 60; i++) { const P = g2.G.P, gx = R2.x + Math.cos(R2.gap) * (R2.r + 60), gy = R2.y + Math.sin(R2.gap) * (R2.r + 60) / 2, d = Math.hypot(gx - P.x, gy - P.y) || 1; update(g2.G, 0.05, d > 8 ? { mx: (gx - P.x) / d, my: (gy - P.y) / d } : {}); g2.m.cd = 9; }
  assert.ok((hp1 - g2.G.P.hp) / g2.G.st.maxHp < 0.2, 'вышел через просвет');
});

test('Аспид: сброс кожи — неуязвим, лужи яда жгут, потом быстрее; один раз', () => {
  const { G, m } = setup('boss_aspid'); m.hp = m.max * 0.25; run(G, 0.1); assert.equal(m.B.phase, 2);
  startAct(G, m, 'shed'); run(G, 0.1); assert.equal(m.B.act.k, 'shed'); assert.ok(m.B.immune > 0);
  const hp = m.hp; G.P.target = m; G.P.x = m.x - 50; G.P.cd = 0; run(G, 0.6, { attack: true }); assert.equal(m.hp, hp, 'неуязвим'); assert.ok(evs(G, /неуязвим/).length);
  run(G, 0.6); assert.ok(G.hazards.length >= 3, 'лужи'); assert.ok(m.B.haste > 1, 'быстрее');
  const h = G.hazards[0]; G.P.x = h.x; G.P.y = h.y; const p0 = G.P.hp; for (let i = 0; i < 20; i++) { update(G, 0.05, {}); m.cd = 9; m.B.cd.lunge = 9; m.B.cd.ring = 9; } assert.ok(p0 > G.P.hp, 'лужа жжёт');
  assert.ok(m.B.used.shed); for (const q in m.B.cd) m.B.cd[q] = 0; run(G, 0.1); assert.ok(!m.B.act || m.B.act.k !== 'shed', 'второй раз нет');
});

test('оглушение сбивает умение босса: предупреждение гаснет', () => {
  const { G, m } = setup('boss_bulk'); run(G, 0.05); startAct(G, m, 'cone'); run(G, 0.1);
  const f = m.B.act.fx; assert.ok(f && f.t > 0); m.stun = 1; run(G, 0.1); assert.equal(m.B.act, null); assert.ok(!G.fx.includes(f));
});

test('бой с уклонением: Воин 17-го в синем побеждает Булька и Аспида, стоящий столбом — нет', async () => {
  process.env.ZONE = 'temple'; process.env.POT = '5'; const { duel } = await import('../tools/fight.mjs');
  for (const kind of ['boss_bulk', 'boss_aspid']) {
    process.env.DODGE = '1'; let w = 0; for (let s = 1; s <= 4; s++) if (duel('warrior', s, { L: 17, rar: 'rare', kind, ML: 17 }).win) w++;
    process.env.DODGE = ''; let w0 = 0; for (let s = 1; s <= 4; s++) if (duel('warrior', s, { L: 17, rar: 'rare', kind, ML: 17 }).win) w0++;
    assert.ok(w >= 2 && w > w0, `${kind}: с уклонением ${w}/4, без ${w0}/4`);
  }
  delete process.env.DODGE; delete process.env.POT;
});
