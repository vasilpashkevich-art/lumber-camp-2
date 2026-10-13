// v89: мобы по кривой героя — моб своего уровня в белых вещах живёт 7–12 с и стоит 10–35% здоровья на всех уровнях;
// моб +4 уровня — тяжёлый, но посильный бой; стаи зовут по одному; подземелье 15–17.
import test from 'node:test';
import assert from 'node:assert/strict';
import { MOBL, xpKill, xpNeed, AGGRO } from '../data/balance.js';
import { MOBS } from '../data/mobs.js';
import { TEMPLE, SHROOM } from '../data/zones.js';

test('кривая мобов: здоровье и урон растут вместе с героем, не быстрее', () => {
  for (const L of [1, 5, 10, 14, 20, 30, 40, 50]) {
    const T = MOBL.hp(L) / (MOBL.ref.dps(L) * MOBL.ref.abil(L)), D = MOBL.ref.ehp(L) / (MOBL.dmg(L) / 1.5);
    assert.ok(T >= 3.99 && T <= 9.01, `ур.${L}: моб живёт ${T.toFixed(1)} с`);
    assert.ok(D >= 37.9 && D <= 110.1, `ур.${L}: герой держится ${D.toFixed(0)} с`);
  }
  // отношение здоровья моба к урону героя не растёт с уровнем (раньше — экспонента ×1,22 против прямой)
  const k = L => MOBL.hp(L) / MOBL.ref.dps(L); assert.ok(k(50) / k(20) < 1.05);
});

test('дуэли: герой своего уровня в белых вещах побеждает одного и держится против +4', async () => {
  process.env.ZONE = 'shroom'; const { duel } = await import('../tools/fight.mjs');
  for (const cls of ['warrior', 'mage', 'archer']) {
    const r = duel(cls, 3, { L: 10, rar: 'common', kind: 'weaver', ML: 10 }); assert.ok(r.win && r.t >= 5 && r.t <= 14 && r.hp >= 55, `${cls} vs 10: ${JSON.stringify(r)}`);
    const r2 = duel(cls, 3, { L: 10, rar: 'common', kind: 'weaver', ML: 14 }); assert.ok(r2.t >= 10, `${cls} vs 14: ${JSON.stringify(r2)}`);
    const r3 = duel(cls, 3, { L: 20, rar: 'common', kind: 'weaver', ML: 20 }); assert.ok(r3.win && r3.t >= 5 && r3.t <= 14 && r3.hp >= 55, `${cls} vs 20: ${JSON.stringify(r3)}`);
  }
});

test('стаи зовут по одному (вороны — двоих), заметность 140, опыт за моба растёт быстрее уровня', () => {
  for (const [k, m] of Object.entries(MOBS)) if (m.trait === 'pack') assert.ok(m.packN >= 1 && m.packN <= 2, k);
  assert.equal(AGGRO, 140);
  assert.ok(xpKill(11, 11) / xpKill(5, 5) > 2.5);
  assert.ok(xpNeed(10) / xpKill(10, 10) < 130, 'на 11-й — меньше 130 мобов своего уровня');
});

test('подземелье 15–17: мобы и подписи', () => {
  assert.deepEqual(TEMPLE.lvl, [15, 17]);
  for (const c of TEMPLE.camps) assert.ok(c.lvl[0] >= 15 && c.lvl[1] <= 17, c.name);
  assert.ok(SHROOM.exits.find(e => e.zone === 'temple').lvl === '15–17');
});
