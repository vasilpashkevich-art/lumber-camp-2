// v108: камень возвращения — у каждого героя, места в сумке не занимает; 10 с переноса, шаг и урон сбивают;
// дом — постоялый двор (Столица, Хутор Подгорный); в своей зоне — сразу на месте, в другой — событием; перезарядка 20 мин.
import test from 'node:test';
import assert from 'node:assert/strict';
import { PINE, FARMS } from '../data/zones.js';
import { HEARTH } from '../data/balance.js';
import { buildWorld } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { createGame, update } from '../src/systems/game.js';
import { isHearth, homeSpot, hearthLeft, bindHome, startHearth } from '../src/systems/hearth.js';
import { migrate } from '../src/engine/save.js';
import { rng, dist } from '../src/engine/util.js';

const WP = buildWorld(PINE), WF = buildWorld(FARMS);
const game = (W = WP, h = newHero('Т', 'warrior')) => { const G = createGame(h, W, { rand: rng(3) }); G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); return G; };
const run = (G, sec, I = {}) => { const evs = []; for (let i = 0; i < sec * 20; i++) { update(G, 0.05, i === 0 ? I : {}); evs.push(...G.ev); G.ev.length = 0; } return evs; };

test('камень всегда при герое и места в сумке не занимает: новый и старый герой могут вернуться', () => {
  const G = game(), H = G.hero; assert.equal(H.bag.length, 0, 'сумка пуста');
  assert.ok(startHearth(G), 'новый герой начинает перенос'); G.P.hearth = null;
  const old = newHero('С', 'mage'); old.bag = [{ id: 'hearth', kind: 'tool', tool: 'hearth', pos: 0 }]; const m = migrate(old); assert.equal(m.bag.filter(isHearth).length, 0, 'старый камень-вещь убран');
  const G2 = game(WP, m); assert.ok(startHearth(G2));
});

test('дом по умолчанию — Постоялый двор Столицы; перенос 10 с, шаг сбивает', () => {
  const G = game(), H = G.hero, P = G.P, home = homeSpot(H);
  assert.equal(home.zone, 'pine'); assert.ok(WP.walkable(home.x, home.y), 'место дома проходимо');
  P.x = WP.cap.x + 600; P.y = WP.cap.y - 3000; if (!WP.walkable(P.x, P.y)) { P.x = WP.cap.x; P.y = WP.cap.y + 1500; }
  run(G, 0.1, { hearth: true }); assert.ok(P.hearth, 'начал');
  run(G, 1); run(G, 0.1, { mx: 1 }); assert.ok(!P.hearth, 'шаг сбил'); assert.equal(hearthLeft(H), 0, 'перезарядки нет — не дошёл');
  run(G, 0.1, { hearth: true }); run(G, HEARTH.cast + 0.2);
  assert.ok(dist(P.x, P.y, home.x, home.y) < 2, 'дома'); assert.ok(hearthLeft(H) > HEARTH.cd - 5, 'перезарядка 20 мин');
  const ev = run(G, 0.1, { hearth: true }); assert.ok(!P.hearth, 'не готов'); assert.ok(ev.some(e => e.k === 'toast' && /не готов/.test(e.s)));
});

test('урон сбивает перенос; дом — в Хуторе; из другой зоны — событие перехода', () => {
  const G = game(WF), H = G.hero, P = G.P, inn = WF.houses.find(b => b.bind);
  assert.ok(inn, 'в Хуторе есть постоялый двор'); assert.ok(bindHome(G, inn)); assert.equal(H.home.zone, 'farms');
  const s = homeSpot(H); assert.ok(WF.walkable(s.x, s.y));
  // урон
  startHearth(G); assert.ok(P.hearth); const m = G.mobs[0]; m.state = 'idle'; m.hp = 999; G.ev.length = 0;
  P.hp = 9999; G.st.maxHp = 9999; P.lastCombat = 0;
  const hit = G.ev; P.hearth.t = 5; m.x = P.x + 20; m.y = P.y; m.hx = m.x; m.hy = m.y; m.state = 'chase'; m.target = true; run(G, 3); assert.ok(!P.hearth, 'урон сбил перенос'); m.state = 'dead'; m.respawnAt = 1e9;
  // в другой зоне: из Соснового дола домой в Хутор — событие
  const G2 = game(WP, H); G2.hero.hearthAt = 0; startHearth(G2); const ev = run(G2, HEARTH.cast + 0.2);
  const e = ev.find(x => x.k === 'hearth'); assert.ok(e, 'событие перехода'); assert.equal(e.zone, 'farms'); assert.deepEqual(e.at, { x: s.x, y: s.y });
});

test('постройки-дома: в Столице два (Постоялый двор, Таверна), в Хуторе один; на Стоянке купца нет', () => {
  assert.equal(PINE.capital.buildings.filter(b => b.bind).length, 2);
  assert.equal(FARMS.village.buildings.filter(b => b.bind).length, 1);
});

test('сохранение: дом и перезарядка переживают выход', () => {
  const G = game(WF), H = G.hero; bindHome(G, WF.houses.find(b => b.bind)); H.hearthAt = Date.now() + 600000;
  const H2 = migrate(JSON.parse(JSON.stringify(H))); assert.equal(H2.home.zone, 'farms'); assert.ok(hearthLeft(H2) > 590);
});
