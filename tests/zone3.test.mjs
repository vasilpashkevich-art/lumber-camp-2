// v65: Грибной лес — мир, пруды и ручей, стоянка купца, переходы, новые мобы, железо и изумруд.
import test from 'node:test';
import assert from 'node:assert/strict';
import { PINE, SHROOM, ZONES } from '../data/zones.js';
import { MOBS } from '../data/mobs.js';
import { ORES, GEMS, MINE, veinColor } from '../data/mining.js';
import { buildWorld, moveTo, inCity } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { createGame, update, interactTarget } from '../src/systems/game.js';
import { learnMining, buyPick, countOf } from '../src/systems/mining.js';
import { rng } from '../src/engine/util.js';

const W = buildWorld(SHROOM);
const game = (cls = 'warrior', lvl = 12) => { const h = newHero('Т', cls); h.lvl = lvl; h.zone = 'shroom'; return createGame(h, W, { rand: rng(7) }); };
const run = (G, sec, I = {}) => { for (let i = 0; i < sec * 20; i++) { update(G, 0.05, i === 0 ? I : {}); G.ev.length = 0; } };
const quiet = G => G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; });

test('мир третьей зоны: стоянка купца безопасна, приход и все мобы на суше, 11 логов', () => {
  assert.equal(ZONES.shroom, SHROOM); assert.equal(SHROOM.camps.length, 11);
  assert.ok(W.walkable(SHROOM.arrive.x, SHROOM.arrive.y), 'место прихода');
  assert.ok(inCity(W, W.village.x, W.village.y + 60), 'стоянка — безопасное место');
  assert.ok(W.houses.some(b => b.vendor && b.id === 'cart'), 'тележка купца торгует');
  assert.ok(!W.houses.some(b => b.forge), 'кузни нет');
  for (const c of W.camps) for (const s of c.spawns) { assert.ok(W.walkable(s.x, s.y), `${c.name} ${s.kind}`); assert.ok(!W.water(s.x, s.y, 0), `${c.name} не в воде`); }
  for (const c of SHROOM.camps) for (const k of [].concat(c.mob)) assert.ok(MOBS[k], k);
  assert.equal(SHROOM.camps.filter(c => [].concat(c.mob).some(k => MOBS[k].rare)).length, 1, 'один редкий — Полоз');
});

test('пруды непроходимы, деревья в них не растут', () => {
  for (const [px, py] of SHROOM.ponds) {
    assert.ok(W.water(px, py, 0), 'пруд — вода'); assert.ok(!W.walkable(px, py));
    for (const t of W.trees) assert.ok(!W.water(t.x, t.y, 0), 'дерево в воде');
  }
  const [px, py, rx] = SHROOM.ponds[0]; let [x, y] = [px - rx - 80, py];
  for (let i = 0; i < 60; i++) [x, y] = moveTo(W, x, y, x + 8, y);
  assert.ok(x < px - rx * 0.7, 'в пруд не зайти');
});

test('переход: из Соснового дола на восток — в Грибной лес и обратно', () => {
  const Wp = buildWorld(PINE), h = newHero('П', 'mage'), G = createGame(h, Wp, { rand: rng(1) });
  const e = Wp.exits.find(e => e.zone === 'shroom'); G.P.x = e.x - 60; G.P.y = e.y;
  assert.equal(interactTarget(G).k, 'exit');
  update(G, 0.05, { interact: true }); const ev = G.ev.find(x => x.k === 'zone'); assert.ok(ev && ev.e.zone === 'shroom');
  assert.ok(W.walkable(ev.e.at.x, ev.e.at.y));
  const back = SHROOM.exits.find(x => x.zone === 'pine'); assert.ok(Wp.walkable(back.at.x, back.at.y));
});

test('шаман зовёт квакуна, Паучиха — выводок; споровик травит издалека', () => {
  const G = game(); G.st.maxHp = G.P.hp = 99999;
  for (const [kind, add] of [['kvak_shaman', 'kvakun'], ['broodmother', 'weaver']]) {
    const m = G.mobs.find(m => m.kind === kind); G.P.x = m.x + 150; G.P.y = m.y; m.state = 'chase';
    run(G, 18); assert.ok(G.mobs.some(o => o.owner === m && o.kind === add), `${kind} позвал ${add}`);
    m.hp = 0; m.state = 'dead'; run(G, 0.2);
  }
  const s = G.mobs.find(m => m.kind === 'sporo'); G.P.x = s.x + 200; G.P.y = s.y; G.P.poison = null; s.state = 'chase';
  let p = false; for (let i = 0; i < 200 && !p; i++) { update(G, 0.05, {}); p = !!G.P.poison; G.ev.length = 0; }
  assert.ok(p, 'отравлен спорами');
});

test('железо: жилы только в Грибном лесу, нужно горное дело 100, навык растёт до 150; изумруд — только с железа', () => {
  assert.equal(ORES.iron.req, 100); assert.equal(MINE.cap, 150);
  assert.ok(GEMS.emerald); for (const [k, O] of Object.entries(ORES)) if (k !== 'iron') assert.ok(!(O.gems || []).some(g => g[0] === 'emerald'));
  assert.equal(veinColor(99, 100).chance, 0); assert.ok(veinColor(100, 100).chance > 0);
  const G = game('archer'); quiet(G);
  const iron = G.veins.filter(v => v.metal === 'iron').length, tin = G.veins.filter(v => v.metal === 'tin').length;
  assert.ok(iron > tin && tin > 0, `железа ${iron}, олова ${tin}`);
  learnMining(G); G.hero.gold = 1000; buyPick(G); G.hero.prof.mining = 99;
  const v = G.veins.find(v => v.metal === 'iron'); G.P.x = v.x + 30; G.P.y = v.y; G.P.lastCombat = -99;
  run(G, 0.2, { interact: true }); assert.equal(G.P.mine, null, 'с 99 нельзя');
  G.hero.prof.mining = 149; run(G, 0.2, { interact: true }); run(G, 3.3);
  assert.ok(countOf(G.hero, 'ore', 'iron') >= 1); assert.ok(G.hero.prof.mining <= 150);
});
