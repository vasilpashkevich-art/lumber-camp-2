// v59: главный параметр класса, свойства по цвету, потолки, сравнение с надетым, пересчёт старых вещей.
import test from 'node:test';
import assert from 'node:assert/strict';
import { makeItem, remakeItem, visTier } from '../src/systems/items.js';
import { newHero, heroStats, compareItem } from '../src/entities/hero.js';
import { migrate } from '../src/engine/save.js';
import { PROPS } from '../data/balance.js';
import { rng } from '../src/engine/util.js';

test('цвет вещи: белая без свойств, зелёная — 1 обычное, синяя — 2, особое только одно и только на синей', () => {
  const r = rng(5);
  for (let i = 0; i < 300; i++) for (const cls of ['warrior', 'mage', 'archer']) {
    const w = makeItem(cls, 'chest', 6, 'common', r), g = makeItem(cls, 'legs', 6, 'good', r), b = makeItem(cls, 'weapon', 7, 'rare', r);
    assert.ok(w.main > 0 && !w.props);
    assert.equal(Object.keys(g.props).length, 1); assert.ok(!PROPS[Object.keys(g.props)[0]].special);
    assert.equal(Object.keys(b.props).length, 2); assert.ok(Object.keys(b.props).filter(k => PROPS[k].special).length <= 1);
    for (const it of [g, b]) for (const k of Object.keys(it.props)) assert.ok(PROPS[k].cls.includes(cls), `${k} не для ${cls}`);
  }
});

test('синяя сильнее зелёной, зелёная — белой того же уровня; название зависит от уровня', () => {
  const m = rar => makeItem('warrior', 'chest', 10, rar, () => 0.5);
  assert.ok(m('rare').main > m('good').main && m('good').main > m('common').main);
  assert.ok(m('rare').armor > m('good').armor && m('good').armor > m('common').armor);
  assert.equal(visTier(3, 'common'), 1); assert.equal(visTier(9, 'common'), 2); assert.equal(visTier(9, 'rare'), 4);
  assert.notEqual(makeItem('warrior', 'chest', 2, 'common', () => 0.5).name, makeItem('warrior', 'chest', 10, 'common', () => 0.5).name);
});

test('главный параметр поднимает силу удара, Ловкость даёт крит, потолки держатся', () => {
  const h = newHero('Т', 'archer'); const s0 = heroStats(h);
  h.eq.chest = makeItem('archer', 'chest', 10, 'rare', () => 0.5); const s1 = heroStats(h);
  assert.ok(s1.power > s0.power); assert.ok(s1.crit > s0.crit);
  // гора свойств — не выше потолка
  for (const sl of ['head', 'legs', 'weapon']) { const it = makeItem('archer', sl, 50, 'epic', () => 0.99); it.props = { crit: 50, dodge: 50, cdr: 80 }; h.eq[sl] = it; }
  const s2 = heroStats(h); assert.equal(s2.crit, PROPS.crit.cap); assert.equal(s2.p.dodge, PROPS.dodge.cap); assert.equal(s2.p.cdr, PROPS.cdr.cap);
});

test('чужая вещь не даёт главного параметра и не сравнивается', () => {
  const h = newHero('Т', 'warrior'), it = makeItem('mage', 'chest', 6, 'rare', () => 0.5);
  assert.equal(compareItem(h, it), null);
  h.eq.chest = it; assert.equal(heroStats(h).main, 0);
});

test('сравнение с надетым: лучше по урону — стрелка, хуже — нет', () => {
  const h = newHero('Т', 'warrior');
  const good = makeItem('warrior', 'weapon', 8, 'rare', () => 0.5), bad = makeItem('warrior', 'weapon', 1, 'common', () => 0);
  h.eq.weapon = makeItem('warrior', 'weapon', 4, 'common', () => 0.5);
  assert.ok(compareItem(h, good).up && compareItem(h, good).dps > 0);
  assert.ok(!compareItem(h, bad).up && compareItem(h, bad).dps < 0);
  assert.equal(compareItem(h, h.eq.weapon), null, 'надетая сама с собой не сравнивается');
});

test('старое сохранение: вещи пересчитаны, ничего не потерялось, результат одинаковый', () => {
  const old = () => ({ v: 1, id: 'o', name: 'О', cls: 'mage', lvl: 7, eq: { head: null, chest: { id: 'c9', cls: 'mage', slot: 'chest', ilvl: 7, rar: 'rare', armor: 9, stam: 9, pow: 4, tier: 3 } }, bag: [{ id: 'q1', cls: 'mage', slot: 'weapon', ilvl: 5, rar: 'good', dmg: 12, pos: 3 }] });
  const a = migrate(old()), b = migrate(old());
  assert.equal(a.v, 3); assert.ok(a.eq.chest.main > 0 && !a.eq.chest.pow); assert.ok(a.eq.chest.m && a.eq.chest.seed && a.bag[0].m, 'облик моделью'); assert.equal(Object.keys(a.eq.chest.props).length, 2);
  assert.equal(a.bag.length, 1); assert.equal(a.bag[0].pos, 3); assert.equal(a.bag[0].id, 'q1');
  assert.deepEqual(a.eq.chest, b.eq.chest, 'пересчёт одинаковый при каждой загрузке');
  assert.deepEqual(migrate(a).eq.chest, a.eq.chest, 'второй раз не пересчитывает');
  assert.equal(remakeItem({ id: 'z', slot: 'legs', ilvl: 3, rar: 'common' }, 'warrior').cls, 'warrior');
});
