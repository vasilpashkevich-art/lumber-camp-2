// v64: облик вещей моделями — у каждой вещи модель своего класса и яруса, всё рисуется во всех видах, старые вещи получают облик.
import test from 'node:test';
import assert from 'node:assert/strict';
import { WEAPONS, HELMS, CHESTS, LEGS, RINGS, NECKS, modelOf, itemLook, drawHelm, drawRing, drawNeck, palette } from '../src/art/gear.js';
import { person } from '../src/art/body.js';
import { makeItem, lookOf, starterGear } from '../src/systems/items.js';
import { MOB_LOOK, GUARD_LOOK } from '../src/art/sprites.js';
import { migrate } from '../src/engine/save.js';
import { rng } from '../src/engine/util.js';

// холст-заглушка: любые вызовы проходят, ошибки рисования всплывут
const grad = { addColorStop() {} };
const ctx = new Proxy({}, { get: (o, k) => k in o ? o[k] : (k === 'createLinearGradient' || k === 'createRadialGradient' ? () => grad : () => {}), set: (o, k, v) => (o[k] = v, true) });
const CLS = ['warrior', 'mage', 'archer'], RAR = ['common', 'good', 'rare', 'epic'];

test('каждая новая вещь получает модель своего класса; название — по модели', () => {
  const r = rng(4);
  for (const cls of CLS) for (const slot of ['head', 'chest', 'legs', 'weapon', 'ring', 'neck']) for (const rar of RAR) for (const ilvl of [1, 9, 17, 30]) {
    const it = makeItem(cls, slot, ilvl, rar, r), md = modelOf(slot, it.m);
    assert.ok(md, `${cls} ${slot} ${rar}: нет модели`);
    if (slot !== 'ring' && slot !== 'neck') assert.ok((md.cls || ['warrior']).includes(cls), `${it.m} не для ${cls}`);
    assert.ok(it.name.startsWith(md.name), `${it.name} ≠ ${md.name}`);
  }
  for (const cls of CLS) { const g = starterGear(cls); assert.equal(g.weapon.name, { warrior: 'Топорик', mage: 'Палка', archer: 'Короткий лук' }[cls]); assert.equal(g.chest.m, 'shirt'); }
});

test('все модели рисуются во всех видах и движениях без ошибок', () => {
  const views = ['front', 'side', 'back'], poses = [{}, { walk: 0.3 }, { atk: 0.2 }, { atk: 0.5 }, { atk: 0.8 }, { dead: 0.6 }, { hit: 1 }];
  const P = r => palette(r, 7, 3);
  for (const cls of CLS) for (const r of RAR) {
    for (const w of WEAPONS) for (const v of views) for (const ps of poses) person(ctx, { cls, weapon: { m: w.id, P: P(r) } }, v, ps);
    for (const h of HELMS) for (const v of views) { person(ctx, { cls, head: { m: h.id, P: P(r) } }, v, {}); drawHelm(ctx, h.id, P(r), v); }
    for (const ch of CHESTS) for (const v of views) for (const ps of poses) person(ctx, { cls, chest: { m: ch.id, P: P(r) }, quiver: true }, v, ps);
    for (const lg of LEGS) for (const v of views) person(ctx, { cls, legs: { m: lg.id, P: P(r) } }, v, { walk: 0.6 });
    for (const m of RINGS) drawRing(ctx, m.id, P(r)); for (const m of NECKS) drawNeck(ctx, m.id, P(r));
    person(ctx, { chest: { m: 'plate', P: P(r) }, part: 'chest' }, 'front', {}); person(ctx, { legs: { m: 'greaves', P: P(r) }, part: 'legs' }, 'front', {});
  }
  for (const L of [...Object.values(MOB_LOOK), GUARD_LOOK]) for (const v of views) for (const ps of poses) person(ctx, L, v, ps);
});

test('облик героя: свой для каждого набора вещей, один и тот же при повторе', () => {
  const h = { cls: 'archer', eq: starterGear('archer') }, a = lookOf(h), b = lookOf(h);
  assert.equal(a, b); assert.equal(a.weapon.m, 'shortbow');
  h.eq.weapon = makeItem('archer', 'weapon', 30, 'epic', rng(2)); assert.notEqual(lookOf(h).key, a.key);
  // две вещи одной модели и цвета — разная расцветка (зерно)
  const x = itemLook({ slot: 'weapon', m: 'sword', rar: 'rare', seed: 11, ilvl: 12 }), y = itemLook({ slot: 'weapon', m: 'sword', rar: 'rare', seed: 999, ilvl: 12 });
  assert.notEqual(x.key, y.key);
});

test('старое сохранение (v2): вещи получают модель и название, остальное не меняется, повторно — то же', () => {
  const old = () => ({ v: 2, id: 'o', name: 'О', cls: 'warrior', lvl: 9, eq: { chest: { id: 'c1', cls: 'warrior', slot: 'chest', ilvl: 9, rar: 'good', tier: 2, armor: 30, main: 5, stam: 6, props: { crit: 1.2 }, name: 'Кольчуга ястреба' }, weapon: { id: 'w1', cls: 'warrior', slot: 'weapon', ilvl: 9, rar: 'rare', tier: 3, wt: 3, dmg: 20, main: 4, stam: 2, name: 'Секира' } }, bag: [{ id: 'q1', cls: 'warrior', slot: 'head', ilvl: 4, rar: 'common', tier: 1, armor: 4, main: 1, stam: 1, pos: 2, name: 'Кожаная шапка' }, { id: 'ore', kind: 'ore', metal: 'copper', n: 5, pos: 3, name: 'Медная руда' }] });
  const a = migrate(old()), b = migrate(old());
  assert.equal(a.v, 3); assert.ok(a.eq.chest.m && a.eq.weapon.m && a.bag[0].m);
  assert.equal(a.eq.chest.armor, 30); assert.equal(a.eq.weapon.dmg, 20); assert.deepEqual(a.eq.chest.props, { crit: 1.2 });
  assert.equal(a.bag[1].kind, 'ore'); assert.ok(!a.bag[1].m, 'руда без модели');
  assert.deepEqual(a.eq, b.eq, 'облик одинаковый при каждой загрузке');
  assert.ok(a.eq.chest.name.startsWith(modelOf('chest', a.eq.chest.m).name));
});
