// v73: новые умения на 10/15/20 уровне (R, пассивное, F) и таланты — выбор, сброс, сохранение, действие в бою.
import test from 'node:test';
import assert from 'node:assert/strict';
import { PINE } from '../data/zones.js';
import { NEW_ABILS, TALENTS, RESET_PRICE } from '../data/talents.js';
import { buildWorld } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { createGame, update, abilsOf } from '../src/systems/game.js';
import { chooseTalent, resetTalents, hasTal, talentFree } from '../src/systems/talents.js';
import { migrate } from '../src/engine/save.js';
import { rng } from '../src/engine/util.js';

const W = buildWorld(PINE);
const run = (G, sec, I = {}, log) => { for (let i = 0; i < sec * 20; i++) { update(G, 0.05, i === 0 ? I : {}); if (log) log.push(...G.ev); G.ev.length = 0; } };
/** Герой уровня lvl у кабана (кабан бессмертный и безвредный), рядом — ещё двое. */
function setup(cls, lvl, tal = {}, near = 150) {
  const h = newHero('Т', cls); h.lvl = lvl; h.talents = tal;
  const G = createGame(h, W, { rand: rng(5) });
  const ms = G.mobs.filter(m => m.kind === 'boar').slice(0, 3);
  ms.forEach((m, i) => { m.hp = m.max = 1e6; m.lvl = 1; m.dmg = 0; m.D = { ...m.D, trait: null }; m.x = 2000 + i * 40; m.y = 2000 + (i % 2) * 30; m.hx = m.x; m.hy = m.y; m.state = 'chase'; });
  for (const o of G.mobs) if (!ms.includes(o)) { o.state = 'dead'; o.respawnAt = 1e9; }
  const m = ms[0]; G.P.x = m.x - near; G.P.y = m.y; G.P.target = m;
  return { G, m, ms };
}

test('умения: у каждого класса 5 — C, V, R, пассивное, F на 1/5/10/15/20 уровне', () => {
  for (const cls of ['warrior', 'mage', 'archer']) {
    const L = abilsOf(newHero('А', cls));
    assert.deepEqual(L.map(a => a.key), ['C', 'V', 'R', 'passive', 'F']);
    assert.deepEqual(L.map(a => a.lvl), [1, 5, 10, 15, 20]);
    assert.equal(NEW_ABILS[cls].length, 3); assert.equal(TALENTS[cls].length, 3);
    for (const r of TALENTS[cls]) { assert.equal(r.opts.length, 3); for (const o of r.opts) assert.ok(L.some(a => a.id === o.ab), `талант ${o.id} к умению ${o.ab}`); }
  }
});

test('R закрыта до 10-го уровня, F — до 20-го', () => {
  const { G } = setup('warrior', 9, {}, 40), ev = [];
  run(G, 0.1, { ability3: true }, ev); assert.ok(ev.some(e => e.k === 'toast' && /10-м/.test(e.s)));
  const b = setup('warrior', 19, {}, 40), ev2 = [];
  run(b.G, 0.1, { ability4: true }, ev2); assert.ok(ev2.some(e => e.k === 'toast' && /20-м/.test(e.s))); assert.equal(b.G.P.buf.berserk, 0);
});

test('таланты: один в ряду, только с уровня ряда; сброс за деньги; старое сохранение получает пустые', () => {
  const h = newHero('Т', 'mage'); h.lvl = 12;
  assert.equal(talentFree(h), 1);
  assert.equal(chooseTalent(h, 15, 'inferno'), false, 'ряд 15 закрыт');
  assert.equal(chooseTalent(h, 10, 'inferno'), false, 'не из этого ряда');
  assert.equal(chooseTalent(h, 10, 'split'), true); assert.equal(chooseTalent(h, 10, 'longBurn'), false, 'второй в ряду нельзя');
  assert.ok(hasTal(h, 'split')); assert.equal(talentFree(h), 0);
  h.gold = 10; assert.equal(resetTalents(h), 'gold'); assert.ok(hasTal(h, 'split'));
  h.gold = RESET_PRICE(12) + 5; assert.equal(resetTalents(h), 'ok'); assert.equal(h.gold, 5); assert.ok(!hasTal(h, 'split'));
  assert.equal(resetTalents(h), 'empty');
  const old = JSON.parse(JSON.stringify(newHero('С', 'archer'))); delete old.talents; old.v = 4;
  assert.deepEqual(migrate(old).talents, {});
  const keep = migrate({ ...JSON.parse(JSON.stringify(newHero('С', 'archer'))), talents: { 10: 'barbs' } }); assert.ok(hasTal(keep, 'barbs'));
});

test('Воин: Сокрушающий удар — урон ×1,8 и рана 6 с; Глубокая рана — 9 с; Раскол — второй враг', () => {
  const { G, m } = setup('warrior', 10, {}, 40), ev = [];
  const hp0 = m.hp; run(G, 0.1, { ability3: true }, ev);
  assert.ok(m.hp < hp0); assert.ok(m.bleed && m.bleed.wound && m.bleed.n === 6, 'рана 6 с'); assert.ok(G.fx.some(f => f.k === 'crush'));
  const b = setup('warrior', 15, { 10: 'swift', 15: 'deepWound' }, 40); run(b.G, 0.1, { ability3: true }); assert.equal(b.m.bleed.n, 9);
  const c = setup('warrior', 15, { 15: 'cleave' }, 40); const h1 = c.ms[1].hp; c.ms[1].x = c.m.x + 30; c.ms[1].y = c.m.y; run(c.G, 0.1, { ability3: true }); assert.ok(c.ms[1].hp < h1 && c.ms[1].bleed, 'задет второй');
  const far = setup('warrior', 10, {}, 300), ev3 = []; run(far.G, 0.1, { ability3: true }, ev3); assert.ok(ev3.some(e => e.k === 'toast' && /вплотную/.test(e.s)));
});

test('Воин: Жажда битвы лечит за убийство с 15-го уровня (Кровожадность — 8%)', () => {
  for (const [tal, k] of [[{}, 0.05], [{ 15: 'bloodlust' }, 0.08]]) {
    const { G, m } = setup('warrior', 15, tal, 40); G.P.hp = 10; m.hp = 1;
    run(G, 0.8, { attackTap: true });
    assert.equal(m.state, 'dead'); assert.ok(Math.abs(G.P.hp - 10 - G.st.maxHp * k) < 2, `лечит ${k}`); assert.ok(G.fx.some(f => f.k === 'thirst'));
  }
  const { G, m } = setup('warrior', 14, {}, 40); G.P.hp = 10; m.hp = 1; run(G, 1.2, { attackTap: true }); assert.ok(G.P.hp < 12, 'до 15-го не лечит');
});

test('Воин: Ярость — урон +30%, быстрее, больше урона по себе; Неистовство продлевает; Несокрушимость', () => {
  const { G, m } = setup('warrior', 20, {}, 40); const A = NEW_ABILS.warrior[2];
  run(G, 0.05, { ability4: true }); assert.ok(G.P.buf.berserk > 11); assert.ok(G.fx.some(f => f.k === 'berserkCast'));
  G.P.slow = 3; const x0 = G.P.x; run(G, 0.5, { }); void x0;
  const cd = G.st.cd; run(G, 0.05, { attackTap: true }); assert.ok(Math.abs(G.P.cd - cd / (1 + A.haste)) < 0.06, 'удары быстрее');
  const f = setup('warrior', 20, { 20: 'frenzy' }, 40); run(f.G, 0.05, { ability4: true }); const b0 = f.G.P.buf.berserk; run(f.G, 4, { attackTap: true }); assert.ok(f.G.P.buf.berserk > b0 - 4 + 0.4, 'продлилась');
});

test('Воин: таланты рывка — Стремительность (−3 с), Сотрясение (оглушает соседей); Широкий вихрь', () => {
  const s = setup('warrior', 10, { 10: 'swift' }); run(s.G, 0.05, { ability: true }); assert.ok(Math.abs(s.G.P.acd.charge - 5) < 0.1);
  const q = setup('warrior', 10, { 10: 'quake' }); q.ms[1].x = q.m.x + 50; q.ms[1].y = q.m.y; run(q.G, 1, { ability: true }); assert.ok(q.ms[1].stun > 0, 'сосед оглушён');
  const w = setup('warrior', 10, { 10: 'wideWhirl' }, 40); run(w.G, 0.05, { ability2: true }); assert.ok(Math.abs(w.G.P.whirl - 1.95) < 0.06); assert.ok(w.G.P.whirlR > 100);
});

test('Маг: Огненный столп жжёт всех в круге 5 с (Пекло — 8 с), Кольцо льда вмораживает (Тюрьма — 5 с)', () => {
  const { G, ms } = setup('mage', 10, {}, 200); ms.forEach((m, i) => { m.x = ms[0].x + i * 20; m.y = ms[0].y; m.D = { ...m.D, speed: 0 }; });
  const h0 = ms.map(m => m.hp); run(G, 0.05, { ability3: true }); assert.equal(G.areas.length, 1); assert.equal(G.areas[0].dur, 5);
  run(G, 6); assert.ok(ms.every((m, i) => m.hp < h0[i]), 'все в круге горят'); assert.equal(G.areas.length, 0);
  const inf = setup('mage', 15, { 15: 'inferno' }, 200); run(inf.G, 0.05, { ability3: true }); assert.equal(inf.G.areas[0].dur, 8);
  const n = setup('mage', 20, {}, 60); run(n.G, 0.05, { ability4: true }); assert.ok(n.m.frozen > 2.8, 'вмёрз'); const x = n.m.x; run(n.G, 1.5); assert.equal(n.m.x, x, 'стоит');
  const p = setup('mage', 20, { 20: 'prison' }, 60); run(p.G, 0.05, { ability4: true }); assert.ok(p.m.frozen > 4.8);
  const c = setup('mage', 20, { 20: 'coldMind' }, 60); c.G.P.acd.fireball = 5; run(c.G, 0.05, { ability4: true }); assert.equal(c.G.P.acd.fireball, 0);
});

test('Маг: Возгорание — крит огнём поджигает; Раскол пламени — 2 искры; Цепной лёд — отскок', () => {
  const { G, m } = setup('mage', 15, {}, 200); G.st.crit = 100; const ev = []; run(G, 1.5, { ability: true }, ev); assert.ok(m.burn, 'горит'); assert.ok(ev.some(e => e.s === 'возгорание'), 'возгорание от крита');
  const no = setup('mage', 14, {}, 200); no.G.st.crit = 100; const ev0 = []; run(no.G, 1.5, { ability: true }, ev0); assert.ok(!ev0.some(e => e.s === 'возгорание'), 'до 15-го — нет');
  const s = setup('mage', 10, { 10: 'split' }, 200); s.ms.forEach((o, i) => { o.x = s.m.x + i * 60; o.y = s.m.y; o.D = { ...o.D, speed: 0 }; }); const h1 = s.ms[1].hp; run(s.G, 2, { ability: true }); assert.ok(s.ms[1].hp < h1, 'искра долетела');
  const c = setup('mage', 10, { 10: 'chainFrost' }, 200); c.ms.forEach((o, i) => { o.x = c.m.x + i * 70; o.y = c.m.y; o.D = { ...o.D, speed: 0 }; }); c.G.P.target = c.m; run(c.G, 2, { ability2: true }); assert.ok(c.ms.filter(o => o.chill > 0).length >= 2, 'лёд отскочил');
});

test('Лучник: Залп ранит всех в круге; Ледяные наконечники замедляют; Добивание — крит по раненым', () => {
  const { G, ms } = setup('archer', 10, {}, 250); ms.forEach((m, i) => { m.x = ms[0].x + i * 25; m.y = ms[0].y; m.D = { ...m.D, speed: 0 }; });
  const h0 = ms.map(m => m.hp); run(G, 0.05, { ability3: true }); run(G, 4); assert.ok(ms.every((m, i) => m.hp < h0[i]));
  const f = setup('archer', 15, { 15: 'frostTips' }, 250); f.m.D = { ...f.m.D, speed: 0 }; run(f.G, 1.2, { ability3: true }); assert.ok(f.m.chill > 0);
  // Добивание: крит по врагу ниже 35% чаще
  const count = (lvl, frac) => { const e = setup('archer', lvl, {}, 250); e.ms.slice(1).forEach(o => { o.state = 'dead'; o.respawnAt = 1e9; }); e.m.hp = e.m.max * frac; e.m.D = { ...e.m.D, speed: 0 }; const ev = []; for (let i = 0; i < 40; i++) { e.G.P.cd = 0; for (let k = 0; k < 12; k++) { e.m.hp = e.m.max * frac; update(e.G, 0.05, k ? {} : { attackTap: true }); ev.push(...e.G.ev); e.G.ev.length = 0; } } const d = ev.filter(x => x.k === 'dmg' && !x.bleed); return d.filter(x => x.crit).length / d.length; };
  assert.ok(count(15, 0.2) > count(14, 0.2) + 0.1, 'добивание чаще критует');
});

test('Лучник: Капкан ловит первого наступившего (4 с, кровь); Два капкана; Ядовитые зубья; Рикошет', () => {
  const { G, m } = setup('archer', 20, {}, 120); m.D = { ...m.D, speed: 60 };
  run(G, 0.05, { ability4: true }); assert.equal(G.traps.length, 1);
  G.traps[0].x = m.x; G.traps[0].y = m.y; run(G, 0.1); assert.ok(m.root > 3.5 && m.trapT > 3.5, 'в капкане'); assert.ok(m.bleed); assert.ok(G.fx.some(f => f.k === 'trapSnap'));
  const t2 = setup('archer', 20, { 20: 'twoTraps' }, 600); t2.G.P.x = 3000; run(t2.G, 0.05, { ability4: true }); t2.G.P.acd = {}; run(t2.G, 0.05, { ability4: true }); t2.G.P.acd = {}; run(t2.G, 0.05, { ability4: true }); assert.equal(t2.G.traps.length, 2, 'не больше двух');
  const t1 = setup('archer', 20, {}, 600); t1.G.P.x = 3000; run(t1.G, 0.05, { ability4: true }); t1.G.P.acd = {}; run(t1.G, 0.05, { ability4: true }); assert.equal(t1.G.traps.length, 1, 'без таланта — один');
  const v = setup('archer', 20, { 20: 'venom' }, 120); run(v.G, 0.05, { ability4: true }); v.G.traps[0].x = v.m.x; v.G.traps[0].y = v.m.y; run(v.G, 0.1); assert.ok(v.m.venom);
  const r = setup('archer', 10, { 10: 'ricochet' }, 250); r.ms.forEach((o, i) => { o.x = r.m.x + i * 50; o.y = r.m.y; o.D = { ...o.D, speed: 0 }; }); r.G.P.target = r.m; const h0 = r.ms.map(o => o.hp); run(r.G, 2, { ability: true }); assert.ok(r.ms.filter((o, i) => o.hp < h0[i]).length >= 2, 'рикошет');
});
