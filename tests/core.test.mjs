// Автотесты механик (без браузера). Запуск: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { PINE } from '../data/zones.js';
import { MOBS } from '../data/mobs.js';
import { xpNeed, xpKill, lvlColor, MAX_LVL, RESPAWN, LEASH } from '../data/balance.js';
import { buildWorld, moveTo, inCity } from '../src/world/world.js';
import { newHero, heroStats, addXp } from '../src/entities/hero.js';
import { createGame, update, respawnHero, equip, sellItem, buyPotion, POTION_PRICE, giveItem } from '../src/systems/game.js';
import { makeItem, rollDrop, starterGear, lookOf, visTier } from '../src/systems/items.js';
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

test('бой: воин убивает лису, получает опыт и золото, моб возрождается через 6 минут', () => {
  const G = game('warrior');
  const m = G.mobs.find(m => m.kind === 'fox'); G.P.x = m.x - 30; G.P.y = m.y; G.P.target = m;
  run(G, 20, G => { const t = G.P.target && G.P.target.state !== 'dead' ? G.P.target : m; return { attack: true, mx: Math.sign(t.x - G.P.x) * (dist(G.P.x, G.P.y, t.x, t.y) > 40 ? 1 : 0), my: Math.sign(t.y - G.P.y) * (dist(G.P.x, G.P.y, t.x, t.y) > 40 ? 1 : 0) }; });
  assert.equal(m.state, 'dead', 'лиса повержена');
  assert.ok(G.hero.xp > 0 || G.hero.lvl > 1); assert.ok(G.hero.gold > 0);
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
