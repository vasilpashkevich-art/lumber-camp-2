// Хуторские угодья: мир, река с мостами, переход между зонами, новые повадки мобов.
import test from 'node:test';
import assert from 'node:assert/strict';
import { PINE, FARMS, ZONES } from '../data/zones.js';
import { MOBS } from '../data/mobs.js';
import { buildWorld, moveTo, inCity } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { createGame, update, interactTarget } from '../src/systems/game.js';
import { rollDrop } from '../src/systems/items.js';
import { rng, dist } from '../src/engine/util.js';
import { runBot } from '../tools/sim.mjs';

const W = buildWorld(FARMS);
const game = (cls = 'warrior', lvl = 7) => { const h = newHero('Т', cls); h.lvl = lvl; h.zone = 'farms'; return createGame(h, W, { rand: rng(3) }); };
const run = (G, sec, I = {}) => { for (let i = 0; i < sec * 20; i++) { update(G, 0.05, typeof I === 'function' ? I(G) : I); G.ev.length = 0; } };

test('мир второй зоны: посёлок, кладбище, приход и все мобы на проходимой земле, ключи с именем зоны', () => {
  assert.ok(W.walkable(FARMS.arrive.x, FARMS.arrive.y), 'место прихода');
  assert.ok(inCity(W, W.village.x, W.village.y + 60), 'посёлок — безопасное место');
  assert.ok(W.walkable(W.graveyard.x + 40, W.graveyard.y + 70), 'кладбище');
  for (const c of W.camps) for (const s of c.spawns) { assert.ok(W.walkable(s.x, s.y), `${c.name} ${s.kind}`); assert.ok(s.key.startsWith('farms:')); }
  for (const c of FARMS.camps) for (const k of [].concat(c.mob)) assert.ok(MOBS[k], k);
  assert.ok(W.props.length > 3, 'стога');
});

test('река: вброд не перейти, по мосту — можно', () => {
  let [x, y] = [1400, 2050];
  for (let i = 0; i < 80; i++) [x, y] = moveTo(W, x, y, x, y + 8);
  assert.ok(y < 2200, 'остался на северном берегу');
  const b = W.river.bridgeAt[0]; [x, y] = [b.x, b.y - 160];
  for (let i = 0; i < 80; i++) [x, y] = moveTo(W, x, y, x, y + 8);
  assert.ok(y > b.y + 100, 'перешёл по мосту');
});

test('переход: из Соснового дола по южной дороге — в Хуторские угодья и обратно', () => {
  const Wp = buildWorld(PINE), h = newHero('П', 'archer'), G = createGame(h, Wp, { rand: rng(1) });
  const e = Wp.exits.find(e => e.zone === 'farms'); G.P.x = e.x; G.P.y = e.y - 60;
  assert.equal(interactTarget(G).k, 'exit');
  update(G, 0.05, { interact: true }); const ev = G.ev.find(x => x.k === 'zone'); assert.ok(ev && ev.e.zone === 'farms');
  assert.ok(W.walkable(ev.e.at.x, ev.e.at.y), 'место прихода проходимо');
  const back = FARMS.exits.find(x => x.zone === 'pine'); assert.ok(Wp.walkable(back.at.x, back.at.y));
  assert.equal(ZONES[h.zone].id, 'pine');
});

test('пугало стоит неживым, пока не подойдёшь вплотную', () => {
  const G = game(); const m = G.mobs.find(m => m.kind === 'scarecrow'); const x0 = m.x, y0 = m.y;
  G.P.x = m.x + 160; G.P.y = m.y; run(G, 3);
  assert.equal(m.state, 'idle'); assert.equal(dist(m.x, m.y, x0, y0), 0, 'не бродит');
  G.P.x = m.x + 60; run(G, 0.5); assert.equal(m.state, 'chase', 'проснулось');
});

test('поджигатель поджигает героя', () => {
  const G = game('warrior', 9); G.st.maxHp = G.P.hp = 99999; const m = G.mobs.find(m => m.kind === 'firestarter'); G.P.x = m.x + 200; G.P.y = m.y; m.state = 'chase';
  let fire = false; for (let i = 0; i < 200 && !fire; i++) { update(G, 0.05, {}); fire = !!(G.P.poison && G.P.poison.fire); G.ev.length = 0; }
  assert.ok(fire, 'загорелся');
});

test('Мельник зовёт ворон; вороны исчезают, когда он погиб; с него — зелёная или синяя вещь', () => {
  const G = game('warrior', 10); G.st.maxHp = G.P.hp = 99999; const m = G.mobs.find(m => m.kind === 'miller'); G.P.x = m.x + 150; G.P.y = m.y; m.state = 'chase';
  run(G, 14); const crows = G.mobs.filter(o => o.owner === m); assert.ok(crows.length >= 2, 'вороны прилетели');
  m.hp = 0; m.state = 'dead'; run(G, 0.2); assert.equal(G.mobs.filter(o => o.owner === m).length, 0, 'улетели');
  const r = rng(5); for (let i = 0; i < 300; i++) { const d = rollDrop('mage', 10, true, r, FARMS.loot); assert.ok(d.rar === 'good' || d.rar === 'rare'); }
  const cnt = {}; for (let i = 0; i < 1000; i++) { const d = rollDrop('mage', 8, false, r, FARMS.loot); cnt[d.rar] = (cnt[d.rar] || 0) + 1; }
  assert.ok(!cnt.rare && !cnt.epic && cnt.good > 90 && cnt.good < 220, JSON.stringify(cnt));
});

test('автоигрок 6-го уровня во второй зоне: за 40 минут растёт и не застревает', () => {
  const r = runBot('warrior', 40, 2, false, 'farms', 6);
  assert.ok(r.lvl >= 8, `уровень ${r.lvl}`); assert.ok(r.kills > 150, `убито ${r.kills}`);
});
