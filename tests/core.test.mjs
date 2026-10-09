// Автотесты механик (без браузера). Запуск: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { PINE } from '../data/zones.js';
import { MOBS } from '../data/mobs.js';
import { xpNeed, xpKill, lvlColor, MAX_LVL, RESPAWN, LEASH } from '../data/balance.js';
import { buildWorld, moveTo, inCity } from '../src/world/world.js';
import { newHero, heroStats, addXp } from '../src/entities/hero.js';
import { createGame, update, respawnHero, equip, unequip, sellItem, buyPotion, POTION_PRICE, giveItem, lootTake, lootAll, hasLoot, interactTarget } from '../src/systems/game.js';
import { LOOT } from '../data/balance.js';
import { money, coins } from '../src/engine/util.js';
import { attackOf } from '../src/entities/hero.js';
import { makeItem, rollDrop, starterGear, lookOf, visTier, sellPrice } from '../src/systems/items.js';
import { rng, dist } from '../src/engine/util.js';

const W = buildWorld(PINE);
const game = (cls = 'warrior', seed = 1) => createGame(newHero('Тест', cls), W, { rand: rng(seed) });
const run = (G, sec, I = {}) => { for (let i = 0; i < sec * 20; i++) { update(G, 0.05, typeof I === 'function' ? I(G) : I); G.ev.length = 0; } };

test('кривая опыта: растёт, после 10 и 20 уровней — скачок, 50 — предел', () => {
  for (let L = 1; L < MAX_LVL - 1; L++) assert.ok(xpNeed(L + 1) > xpNeed(L), `уровень ${L}`);
  assert.ok(xpNeed(10) / xpNeed(9) > 2, 'после 10 — заметно тяжелее');
  assert.ok(xpNeed(20) / xpNeed(19) > 1.8, 'после 20 — ещё тяжелее');
  assert.equal(xpNeed(MAX_LVL), Infinity);
  const h = newHero('x', 'mage'); addXp(h, 1e12); assert.equal(h.lvl, MAX_LVL); assert.equal(h.xp, 0);
});

test('опыт и цвет уровня: серые мобы опыта не дают, высокие — больше', () => {
  assert.equal(xpKill(1, 10), 0); assert.equal(lvlColor(1, 10), '#9a9a9a');
  assert.ok(xpKill(5, 3) > xpKill(3, 3));
  assert.equal(lvlColor(9, 3), '#ff3b30');
});

test('мир: столица и кладбище внутри зоны, все лагеря на проходимой земле', () => {
  assert.ok(W.inside(W.cap.x, W.cap.y)); assert.ok(W.inside(W.graveyard.x, W.graveyard.y));
  for (const c of W.camps) for (const s of c.spawns) assert.ok(W.inside(s.x, s.y), `${s.kind} ${s.key}`);
  assert.ok(W.trees.length > 500, 'деревьев достаточно');
  // мир одинаковый при каждой сборке
  const W2 = buildWorld(PINE); assert.equal(W2.trees.length, W.trees.length); assert.equal(W2.trees[100].x, W.trees[100].x);
});

test('стена столицы: сквозь стену не пройти, через ворота — можно', () => {
  const c = W.cap;
  // с севера прямо в стену
  let [x, y] = [c.x, c.y - c.R - 60];
  for (let i = 0; i < 60; i++) [x, y] = moveTo(W, x, y, x, y + 10);
  assert.ok(!inCity(W, x, y), 'с севера не зашли');
  // через южные ворота
  [x, y] = [c.x, c.y + c.R + 60];
  for (let i = 0; i < 60; i++) [x, y] = moveTo(W, x, y, x, y - 10);
  assert.ok(inCity(W, x, y), 'через ворота зашли');
});

test('граница зоны не пускает наружу', () => {
  let [x, y] = [W.cap.x, 600];
  for (let i = 0; i < 200; i++) [x, y] = moveTo(W, x, y, x, y - 10);
  assert.ok(W.inside(x, y));
});

test('вещи: стартовые, ярусы облика, цены', () => {
  const g = starterGear('archer'); assert.equal(g.head, null); assert.equal(g.chest.tier, 0); assert.equal(g.weapon.name, 'Короткий лук');
  assert.equal(visTier(5, 'common'), 1); assert.equal(visTier(5, 'rare'), 3); assert.equal(visTier(40, 'epic'), 4);
  const it = makeItem('warrior', 'chest', 4, 'good', rng(3)); assert.equal(it.name, 'Кольчуга'); assert.ok(it.armor > 0 && it.price > 0);
  const r = rng(9); for (let i = 0; i < 200; i++) { const d = rollDrop('mage', 3, false, r); assert.equal(d.cls, 'mage'); assert.ok(d.name); }
  const h = newHero('x', 'mage'); h.eq.chest = makeItem('mage', 'chest', 5, 'epic', rng(1)); const L = lookOf(h);
  assert.equal(L.chest, 4); assert.equal(L.rar, 'epic');
});

test('бой: воин убивает лису, получает опыт, добыча лежит в теле, моб возрождается через 6 минут', () => {
  const G = game('warrior');
  const m = G.mobs.find(m => m.kind === 'fox'); G.P.x = m.x - 30; G.P.y = m.y; G.P.target = m;
  run(G, 20, G => { const t = G.P.target && G.P.target.state !== 'dead' ? G.P.target : m; return { attack: true, mx: Math.sign(t.x - G.P.x) * (dist(G.P.x, G.P.y, t.x, t.y) > 40 ? 1 : 0), my: Math.sign(t.y - G.P.y) * (dist(G.P.x, G.P.y, t.x, t.y) > 40 ? 1 : 0) }; });
  assert.equal(m.state, 'dead', 'лиса повержена');
  assert.ok(G.hero.xp > 0 || G.hero.lvl > 1);
  assert.equal(G.hero.gold, 0, 'деньги не падают в кошелёк сами');
  const body = G.corpses.find(c => c.kind === 'fox'); assert.ok(body && body.money > 0, 'монеты лежат в теле');
  G.P.x = body.x + 20; G.P.y = body.y; assert.equal(interactTarget(G).k, 'corpse');
  const got = body.money; lootAll(G, body); assert.equal(G.hero.gold, got); assert.ok(!hasLoot(body));
  assert.ok(G.hero.dead[m.key] > G.t);
  run(G, RESPAWN.normal + 2);
  assert.notEqual(m.state, 'dead', 'возродилась');
});

test('поводок: моб не гонится дальше своего предела и уходит домой', () => {
  const G = game('archer');
  const m = G.mobs.find(m => m.kind === 'wolf'); G.P.x = m.x + 100; G.P.y = m.y;
  run(G, 1); assert.equal(m.state, 'chase');
  // убегаем далеко
  run(G, 12, { mx: 0, my: 1 });
  assert.ok(dist(m.x, m.y, m.hx, m.hy) <= LEASH + 60, 'не ушёл дальше поводка');
});

test('гибель и возрождение у кладбища со слабостью', () => {
  const G = game('mage');
  const m = G.mobs.find(m => m.kind === 'boar'); G.P.x = m.x + 20; G.P.y = m.y; G.P.hp = 1;
  run(G, 4);
  assert.ok(G.P.dead); assert.equal(G.hero.stats.deaths, 1);
  respawnHero(G); assert.ok(!G.P.dead); assert.ok(dist(G.P.x, G.P.y, W.graveyard.x, W.graveyard.y) < 200); assert.ok(G.P.weak > 0);
});

test('в столице мобы не нападают, здоровье восстанавливается быстро', () => {
  const G = game('warrior'); G.P.x = W.cap.x; G.P.y = W.cap.y + 200; G.P.hp = 10;
  run(G, 20); assert.ok(G.P.hp > G.st.maxHp * 0.9);
});

test('торговля и надевание', () => {
  const G = game('archer'); G.hero.gold = 100;
  const it = makeItem('archer', 'legs', 3, 'good', rng(2)); giveItem(G, it, 0, 0);
  assert.equal(G.hero.bag.length, 1);
  const hp0 = G.st.maxHp; equip(G, it); assert.equal(G.hero.eq.legs, it); assert.ok(G.st.maxHp > hp0);
  const junk = makeItem('archer', 'head', 2, 'common', rng(4)); giveItem(G, junk, 0, 0); const g0 = G.hero.gold; sellItem(G, junk); assert.equal(G.hero.gold, g0 + junk.price);
  const p0 = G.hero.potions; assert.ok(buyPotion(G)); assert.equal(G.hero.potions, p0 + 1); assert.equal(G.hero.gold, g0 + junk.price - POTION_PRICE(G.hero.lvl));
});

test('у каждого вида моба есть всё нужное', () => {
  for (const [k, D] of Object.entries(MOBS)) for (const f of ['name', 'art', 'r', 'hp', 'dmg', 'speed', 'reach', 'cd', 'trait']) assert.ok(D[f] != null, `${k}.${f}`);
  for (const c of PINE.camps) for (const k of [].concat(c.mob)) assert.ok(MOBS[k], k);
});

test('характеристики: у воина больше здоровья, у мага сильнее удар', () => {
  const w = heroStats(newHero('a', 'warrior')), m = heroStats(newHero('b', 'mage'));
  assert.ok(w.maxHp > m.maxHp); assert.ok(m.hit > w.hit);
});

test('тело: лежит 3 минуты, вещь при полной сумке остаётся в теле, можно взять по одной', () => {
  const G = game('mage'); const it1 = makeItem('mage', 'head', 2, 'good', rng(5)), it2 = makeItem('mage', 'legs', 2, 'common', rng(6));
  const c = { id: 1, x: G.P.x + 10, y: G.P.y, kind: 'wolf', name: 'Волк', lvl: 2, dir: 1, t: LOOT.corpseT, money: 7, items: [it1, it2] };
  G.corpses.push(c);
  lootTake(G, c, 1); assert.equal(G.hero.gold, 7); assert.deepEqual(c.items, [it1]); assert.equal(G.hero.bag[0], it2);
  while (G.hero.bag.length < LOOT.bag) G.hero.bag.push(makeItem('mage', 'chest', 1, 'common', rng(1)));
  assert.equal(lootAll(G, c), 1, 'не влезла'); assert.deepEqual(c.items, [it1]); assert.ok(hasLoot(c));
  run(G, LOOT.corpseT + 1); assert.ok(!G.corpses.includes(c), 'тело исчезло');
});

test('вещи: старая при замене уходит в сумку, любую можно снять; без оружия — кулаки', () => {
  const G = game('warrior'), H = G.hero, shirt = H.eq.chest;
  const it = makeItem('warrior', 'chest', 3, 'good', rng(2)); giveItem(G, it, 0, 0);
  equip(G, it); assert.equal(H.eq.chest, it); assert.ok(H.bag.includes(shirt), 'рубаха в сумке');
  assert.ok(unequip(G, 'chest')); assert.equal(H.eq.chest, null); assert.ok(H.bag.includes(it));
  assert.ok(unequip(G, 'legs')); assert.equal(lookOf(H).chest, -1); assert.equal(lookOf(H).legs, -1);
  const hit0 = G.st.hit; assert.ok(unequip(G, 'weapon')); assert.ok(G.st.unarmed); assert.ok(G.st.hit < hit0); assert.equal(attackOf(H).reach, 50);
  while (H.bag.length < LOOT.bag) H.bag.push(makeItem('warrior', 'head', 1, 'common', rng(1)));
  equip(G, H.bag.find(x => x.slot === 'head')); assert.ok(!unequip(G, 'head') || H.bag.length <= LOOT.bag, 'сумка полна — не снять');
  assert.equal(H.bag.length, LOOT.bag);
  assert.equal(sellPrice(shirt), 1, 'стартовая рубаха стоит 1 медь');
});

test('деньги: медь, серебро, золото', () => {
  assert.equal(money(0), '0 м'); assert.equal(money(57), '57 м'); assert.equal(money(100), '1 с');
  assert.equal(money(12540), '1 з 25 с 40 м'); assert.deepEqual(coins(10003), { g: 1, s: 0, c: 3 });
});

test('логова: у каждого лагеря есть название и примета', () => {
  const kinds = new Set(['den', 'wolf', 'boar', 'web', 'bandit', 'ataman']);
  for (const c of PINE.camps) { assert.ok(c.name && c.name.length > 3, 'название'); assert.ok(kinds.has(c.lair), c.name); }
  assert.equal(new Set(PINE.camps.map(c => c.name)).size, PINE.camps.length, 'названия не повторяются');
});

test('добыча Соснового дола: с обычных мобов только белые, с Атамана — зелёная или синяя, фиолетовых нет', () => {
  const r = rng(11), cnt = {};
  for (let i = 0; i < 400; i++) { const d = rollDrop('mage', 3, false, r, PINE.loot); cnt[d.rar] = (cnt[d.rar] || 0) + 1; }
  assert.deepEqual(Object.keys(cnt), ['common']);
  const a = {}; for (let i = 0; i < 1000; i++) { const d = rollDrop('mage', 6, true, r, PINE.loot); a[d.rar] = (a[d.rar] || 0) + 1; }
  assert.ok(!a.epic && !a.common); assert.ok(a.rare > 140 && a.rare < 260, `синих ${a.rare} из 1000`);
});

test('сумка: перекладывание по ячейкам, обмен местами, снятие в выбранную ячейку', async () => {
  const { bagMove, bagAdd } = await import('../src/systems/game.js');
  const G = game('archer'), H = G.hero;
  const a = makeItem('archer', 'head', 2, 'common', rng(1)), b = makeItem('archer', 'legs', 2, 'common', rng(2));
  giveItem(G, a, 0, 0); giveItem(G, b, 0, 0); assert.equal(a.pos, 0); assert.equal(b.pos, 1);
  bagMove(G, a, 10); assert.equal(a.pos, 10);
  bagMove(G, b, 10); assert.equal(b.pos, 10); assert.equal(a.pos, 1, 'поменялись местами');
  unequip(G, 'chest', 5); assert.equal(H.bag.find(x => x.slot === 'chest').pos, 5);
  equip(G, b); assert.equal(H.bag.find(x => x.slot === 'legs').pos, 10, 'снятые штаны встали на место надетых');
});

test('умения: второе закрыто до 5 уровня; рывок оглушает, сеть держит, лёд замедляет', () => {
  const W2 = game('warrior'), P = W2.P, m = W2.mobs.find(m => m.kind === 'boar');
  P.x = m.x - 200; P.y = m.y; P.target = m;
  run(W2, 0.05, { ability2: true }); assert.equal(W2.P.whirl, 0, 'вихрь закрыт на 1 уровне');
  update(W2, 0.05, { ability: true }); run(W2, 0.6);
  assert.ok(m.stun > 0 || m.state === 'dead', 'оглушён'); assert.ok(dist(P.x, P.y, m.x, m.y) < 80, 'долетел');
  const A = game('archer'); A.hero.lvl = 5; const s = A.mobs.find(m => m.kind === 'wolf'); A.P.x = s.x - 250; A.P.y = s.y; A.P.target = s;
  update(A, 0.05, { ability2: true }); run(A, 1); assert.ok(A.mobs.some(m => m.root > 0), 'в сети');
  const M = game('mage'); M.hero.lvl = 5; const f = M.mobs.find(m => m.kind === 'boar'); M.P.x = f.x - 250; M.P.y = f.y; M.P.target = f;
  update(M, 0.05, { ability2: true }); run(M, 1); assert.ok(M.mobs.some(m => m.chill > 0), 'заморожен');
});

test('сидя здоровье восстанавливается быстрее, движение поднимает', () => {
  const a = game('mage'), b = game('mage');
  for (const G of [a, b]) { G.P.x = 4300; G.P.y = 2700; G.P.hp = 20; G.P.lastCombat = -99; G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); }
  update(a, 0.05, { sit: true }); assert.ok(a.P.sit);
  run(a, 5); run(b, 5); assert.ok(a.P.hp > b.P.hp + 5, `${a.P.hp} против ${b.P.hp}`);
  update(a, 0.05, { mx: 1 }); assert.ok(!a.P.sit);
});
