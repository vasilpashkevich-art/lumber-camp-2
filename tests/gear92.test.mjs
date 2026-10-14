// v92: героические фиолетовые вещи (свой ярус 5, своя модель и расцветка, эффекты, без свечения), гнёзда под камни.
import test from 'node:test';
import assert from 'node:assert/strict';
import { makeItem, hasSocket, socketLine, epicUpgrade, fxListOf, itemLines, makeStack } from '../src/systems/items.js';
import { WEAPONS, HELMS, CHESTS, LEGS, RINGS, NECKS, itemLook, isEpicModel, palette, visTier } from '../src/art/gear.js';
import { heroStats, newHero } from '../src/entities/hero.js';
import { insertGem, socketTargets, addStack, countOf } from '../src/systems/mining.js';
import { GEMS, SOCKET } from '../data/mining.js';
import { migrate } from '../src/engine/save.js';
import { rng } from '../src/engine/util.js';

const CLS = ['warrior', 'mage', 'archer'];
test('у каждого класса свой героический набор: оружие 3, голова 2, грудь 2, ноги 2; кольца и шеи по 2', () => {
  for (const cls of CLS) {
    const mine = (L, slot) => L.filter(m => m.tiers && m.tiers.includes(5) && (m.cls || ['warrior']).includes(cls));
    assert.equal(mine(WEAPONS).length, 3, cls); assert.equal(mine(HELMS).length, 2, cls); assert.equal(mine(CHESTS).length, 2, cls); assert.equal(mine(LEGS).length, 2, cls);
  }
  assert.equal(RINGS.filter(m => m.epic).length, 2); assert.equal(NECKS.filter(m => m.epic).length, 2);
});
test('фиолетовые падают только героическими моделями, остальные — никогда; свечения нет', () => {
  for (const cls of CLS) for (const slot of ['weapon', 'head', 'chest', 'legs', 'ring', 'neck']) for (let s = 1; s <= 12; s++) {
    const e = makeItem(cls, slot, 16, 'epic', rng(s)), b = makeItem(cls, slot, 40, 'rare', rng(s));
    assert.ok(isEpicModel(slot, e.m), `${cls} ${slot} ${e.m}`); assert.ok(!isEpicModel(slot, b.m), `синяя ${cls} ${slot} ${b.m}`);
    assert.equal(itemLook(e).P.glow, null);
  }
  assert.equal(visTier(5, 'epic'), 5); assert.equal(visTier(40, 'rare'), 4); assert.equal(palette('epic', 3).glow, null);
});
test('старая фиолетовая вещь получает героический облик и имя; повтор ничего не меняет; сохранение', () => {
  const it = makeItem('warrior', 'chest', 16, 'epic', rng(4)); it.m = 'plate'; it.name = 'Латы орла'; it.tier = 4;
  epicUpgrade(it); assert.ok(isEpicModel('chest', it.m)); const m1 = it.m, n1 = it.name; assert.notEqual(n1, 'Латы орла');
  epicUpgrade(it); assert.equal(it.m, m1); assert.equal(it.name, n1);
  const h = newHero('Ф', 'mage'); const w = makeItem('mage', 'weapon', 16, 'epic', rng(5)); w.m = 'arch'; h.eq.weapon = w; const old = JSON.parse(JSON.stringify(h));
  const h2 = migrate(old); assert.ok(isEpicModel('weapon', h2.eq.weapon.m)); assert.equal(h2.eq.weapon.dmg, w.dmg, 'цифры не меняются');
});
test('живые эффекты: только у надетых героических вещей', () => {
  const h = newHero('Э', 'warrior'); assert.deepEqual(fxListOf(h), []);
  const w = makeItem('warrior', 'weapon', 16, 'epic', rng(2)); w.m = 'flameblade'; h.eq.weapon = w; const c = makeItem('warrior', 'chest', 16, 'epic', rng(3)); c.m = 'warlord'; h.eq.chest = c;
  assert.deepEqual(fxListOf(h), [['fire', 'weapon'], ['rune', 'chest']]);
});
test('гнёзда: синие и фиолетовые всегда, зелёные ~30%, белые никогда; только оружие, грудь, ноги, шея', () => {
  let good = 0, n = 0;
  for (let s = 1; s <= 400; s++) for (const slot of SOCKET.slots) { const g = makeItem('warrior', slot, 10, 'good', rng(s)); n++; if (hasSocket(g)) good++; assert.ok(hasSocket(makeItem('warrior', slot, 10, 'rare', rng(s)))); assert.ok(!hasSocket(makeItem('warrior', slot, 10, 'common', rng(s)))); }
  assert.ok(good / n > 0.25 && good / n < 0.35, 'зелёных с гнездом ' + good / n);
  for (const slot of ['head', 'ring']) assert.ok(!hasSocket(makeItem('warrior', slot, 10, 'epic', rng(1))));
  const e = makeItem('warrior', 'chest', 10, 'rare', rng(9)); assert.ok(/Пустое гнездо/.test(socketLine(e)[1])); assert.ok(itemLines(e).some(l => l[0] === 'sock'));
});
test('камни: вставить из стопки, бонус в характеристиках, замена — старый пропадает, вынуть нельзя', () => {
  const h = newHero('К', 'warrior'), ch = makeItem('warrior', 'chest', 10, 'rare', rng(7)); h.eq.chest = ch;
  addStack(h, makeStack('gem', 'tigerseye', 2)); addStack(h, makeStack('gem', 'emerald', 1));
  const st0 = heroStats(h), tg = h.bag.find(i => i.metal === 'tigerseye');
  assert.ok(socketTargets(h).includes(ch));
  assert.ok(insertGem(h, tg, ch)); assert.equal(ch.gem, 'tigerseye'); assert.equal(countOf(h, 'gem', 'tigerseye'), 1);
  const st1 = heroStats(h); assert.equal(st1.main, st0.main + GEMS.tigerseye.bonus.main);
  assert.equal(insertGem(h, h.bag.find(i => i.metal === 'tigerseye'), ch), false, 'тот же камень второй раз — нет');
  assert.ok(insertGem(h, h.bag.find(i => i.metal === 'emerald'), ch)); assert.equal(ch.gem, 'emerald'); assert.equal(countOf(h, 'gem', 'emerald'), 0);
  const st2 = heroStats(h); assert.equal(st2.main, st0.main, 'тигровый глаз пропал'); assert.ok(st2.crit > st0.crit);
  const white = makeItem('warrior', 'legs', 10, 'common', rng(3)); assert.equal(insertGem(h, h.bag.find(i => i.metal === 'tigerseye'), white), false, 'без гнезда — нельзя');
  const am = newHero('А', 'mage'); addStack(am, makeStack('gem', 'amethyst', 1)); const nk = makeItem('mage', 'neck', 10, 'epic', rng(1)); am.eq.neck = nk; const s0 = heroStats(am); insertGem(am, am.bag[am.bag.length - 1], nk); assert.ok(heroStats(am).maxHp > s0.maxHp);
});
