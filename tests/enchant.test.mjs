// v107: зачарование — учитель, жезл из медных слитков, распыление (цвет и ярус → материалы), чары (место, навык,
// материалы, замена), бонус в характеристиках, сохранение и загрузка.
import test from 'node:test';
import assert from 'node:assert/strict';
import { PINE } from '../data/zones.js';
import { ENCH, ENCHANTS, ENCH_MATS } from '../data/enchanting.js';
import { buildWorld } from '../src/world/world.js';
import { newHero, heroStats } from '../src/entities/hero.js';
import { createGame } from '../src/systems/game.js';
import { learnEnchant, craftRod, hasRod, disenchant, disenchantAll, canDisenchant, enchant, enchTargets, enchSkill, tierOf } from '../src/systems/enchant.js';
import { addStack, countOf } from '../src/systems/mining.js';
import { makeStack, makeItem, itemLines } from '../src/systems/items.js';
import { migrate } from '../src/engine/save.js';
import { rng } from '../src/engine/util.js';

const W = buildWorld(PINE);
const game = (h = newHero('Т', 'warrior'), seed = 5) => createGame(h, W, { rand: rng(seed) });
const put = (H, it) => { it.pos = H.bag.length + 10; H.bag.push(it); return it; };

test('учитель и жезл: жезл — из 10 медных слитков, без слитков нельзя, второй не нужен', () => {
  const G = game(), H = G.hero;
  assert.equal(enchSkill(H), 0); learnEnchant(G); assert.equal(enchSkill(H), 1);
  addStack(H, makeStack('bar', 'copper', ENCH.rodBars - 1)); assert.ok(!craftRod(G)); assert.ok(!hasRod(H));
  addStack(H, makeStack('bar', 'copper', 1)); assert.ok(craftRod(G)); assert.ok(hasRod(H)); assert.equal(countOf(H, 'bar', 'copper'), 0);
  addStack(H, makeStack('bar', 'copper', 10)); assert.ok(!craftRod(G), 'второй жезл не делается'); assert.equal(countOf(H, 'bar', 'copper'), 10);
});

test('распыление: нужен навык и жезл; белые нельзя; зелёная → пыль своего яруса, синяя → осколок, фиолетовая → кристалл', () => {
  const G = game(), H = G.hero;
  const g1 = put(H, makeItem('warrior', 'chest', 6, 'good', rng(1)));
  assert.equal(disenchant(G, g1), null, 'без навыка'); learnEnchant(G);
  assert.equal(disenchant(G, g1), null, 'без жезла'); addStack(H, makeStack('bar', 'copper', 10)); craftRod(G);
  const w = put(H, makeItem('warrior', 'chest', 6, 'common', rng(2))); assert.ok(!canDisenchant(H, w), 'белую нельзя');
  assert.equal(tierOf(g1), 1); const got = disenchant(G, g1); assert.ok(got && got.dust1 >= 2 && got.dust1 <= 4, JSON.stringify(got)); assert.ok(!H.bag.includes(g1), 'вещь пропала');
  const g2 = put(H, makeItem('warrior', 'legs', 14, 'good', rng(3))); assert.equal(tierOf(g2), 2); assert.ok(disenchant(G, g2).dust2 >= 2);
  const r = put(H, makeItem('warrior', 'head', 14, 'rare', rng(4))); assert.equal(disenchant(G, r).shard2, 1);
  const e = put(H, makeItem('warrior', 'weapon', 16, 'epic', rng(5))); const ge = disenchant(G, e); assert.equal(ge.crystal, 1); assert.ok(ge.shard2 >= 1);
  // надетое не распыляется
  assert.ok(!canDisenchant(H, H.eq.weapon || {}), 'надетое — нет');
});

test('распыление растит навык; «все зелёные» не трогает синие и надетые', () => {
  const G = game(), H = G.hero; learnEnchant(G); addStack(H, makeStack('bar', 'copper', 10)); craftRod(G);
  for (let i = 0; i < 12; i++) put(H, makeItem('warrior', 'legs', 5, 'good', rng(100 + i)));
  const blue = put(H, makeItem('warrior', 'legs', 5, 'rare', rng(9)));
  const { n } = disenchantAll(G, 'good'); assert.equal(n, 12); assert.ok(H.bag.includes(blue), 'синяя осталась');
  assert.ok(enchSkill(H) >= 8, 'навык вырос: ' + enchSkill(H));
  assert.ok(countOf(H, 'ench', 'dust1') >= 24);
});

test('чары: место, навык, материалы; бонус в характеристиках; замена; строка в подсказке', () => {
  const G = game(), H = G.hero; learnEnchant(G); addStack(H, makeStack('bar', 'copper', 10)); craftRod(G);
  const wpn = H.eq.weapon; assert.ok(wpn, 'есть оружие');
  assert.ok(!enchant(G, 'w_power1', wpn), 'без пыли нельзя');
  addStack(H, makeStack('ench', 'dust1', 10));
  const before = heroStats(H).main;
  assert.ok(enchTargets(H, 'w_power1').includes(wpn));
  assert.ok(!enchant(G, 'c_hp1', wpn), 'чары груди на оружие — нельзя');
  assert.ok(enchant(G, 'w_power1', wpn)); assert.equal(wpn.ench, 'w_power1'); assert.equal(countOf(H, 'ench', 'dust1'), 8);
  assert.equal(heroStats(H).main, before + ENCHANTS.w_power1.bonus.main);
  assert.ok(itemLines(wpn).some(l => l[0] === 'ench'), 'строка чар');
  assert.ok(!enchant(G, 'w_power2', wpn), 'навыка 60 нет');
  H.prof.enchant = 60; addStack(H, makeStack('ench', 'shard1', 1)); assert.ok(enchant(G, 'w_power2', wpn)); assert.equal(wpn.ench, 'w_power2', 'новые чары заменили');
  assert.equal(heroStats(H).main, before + ENCHANTS.w_power2.bonus.main);
  // все рецепты: материалы существуют, места — из списка, навык ≤ потолка
  for (const R of Object.values(ENCHANTS)) { assert.ok(ENCH.slots.includes(R.slot)); assert.ok(R.req <= ENCH.cap); for (const m of Object.keys(R.mats)) assert.ok(ENCH_MATS[m], m); }
});

test('сохранение: навык, жезл, материалы и чары переживают выход', () => {
  const G = game(), H = G.hero; learnEnchant(G); addStack(H, makeStack('bar', 'copper', 10)); craftRod(G); addStack(H, makeStack('ench', 'dust1', 5));
  enchant(G, 'w_power1', H.eq.weapon);
  const H2 = migrate(JSON.parse(JSON.stringify(H)));
  assert.equal(enchSkill(H2), enchSkill(H)); assert.ok(hasRod(H2)); assert.equal(countOf(H2, 'ench', 'dust1'), 3); assert.equal(H2.eq.weapon.ench, 'w_power1');
  assert.equal(heroStats(H2).main, heroStats(H).main);
});
