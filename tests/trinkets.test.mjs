// v110: аксессуары пассивные, как в WoW — постоянные параметры (главная характеристика + второй по смыслу)
// и срабатывание само с вероятностью и внутренней перезарядкой; старые аксессуары получают параметры и новые названия.
import test from 'node:test';
import assert from 'node:assert/strict';
import { PINE } from '../data/zones.js';
import { TRINKETS } from '../data/trinkets.js';
import { buildWorld } from '../src/world/world.js';
import { newHero, heroStats } from '../src/entities/hero.js';
import { createGame, update, trinketProc } from '../src/systems/game.js';
import { makeTrinket, itemLines } from '../src/systems/items.js';
import { migrate } from '../src/engine/save.js';
import { rng } from '../src/engine/util.js';

const W = buildWorld(PINE);
const game = (cls = 'warrior') => { const G = createGame(newHero('Т', cls), W, { rand: rng(4) }); G.mobs.forEach(m => { m.state = 'dead'; m.respawnAt = 1e9; }); return G; };

test('у всех 12 аксессуаров и всех классов есть постоянные параметры; у Воина вместо уклонения — броня', () => {
  for (const cls of ['warrior', 'mage', 'archer']) for (const T of TRINKETS) {
    const it = makeTrinket(cls, 12, T.rar, rng(3), T.id); assert.ok(it.main > 0, T.id);
    const second = it.armor || it.stam || Object.keys(it.props || {}).length; assert.ok(second, `${T.id}: второй параметр`);
    if (cls === 'warrior' && T.stat === 'dodge') assert.ok(it.armor > 0 && !(it.props || {}).dodge);
    assert.ok(itemLines(it).some(l => l[0] === 'ab' && /Срабатывает само/.test(l[1])), 'подсказка про срабатывание');
  }
});

test('надетый аксессуар добавляет главную характеристику', () => {
  const G = game('mage'), h = G.hero, a = heroStats(h).main; h.eq.trinket = makeTrinket('mage', 10, 'rare', rng(2), 'stormeye');
  assert.equal(heroStats(h).main, a + h.eq.trinket.main);
});

test('в бою: по герою попадают — Гранитное сердце рано или поздно срабатывает; Перо феникса спасает от гибели', () => {
  const G = game(), h = G.hero, P = G.P; h.eq.trinket = makeTrinket('warrior', 6, 'rare', rng(1), 'stoneheart');
  const m = G.mobs.find(x => x.kind === 'wolf'); P.x = m.hx; P.y = m.hy; m.state = 'chase'; m.hp = m.max = 1e6; m.x = P.x + 30; m.y = P.y; G.st.maxHp = P.hp = 1e6;
  let got = false; for (let i = 0; i < 20 * 120 && !got; i++) { update(G, 0.05, {}); G.ev.length = 0; if (P.buf.stone > 0) got = true; }
  assert.ok(got, 'сработало за 2 минуты боя');
  const G2 = game(); G2.hero.eq.trinket = makeTrinket('warrior', 16, 'epic', rng(1), 'phoenix'); G2.st.maxHp = 500; G2.P.hp = 0;
  assert.ok(trinketProc(G2, 'death')); assert.equal(G2.P.hp, 250); assert.ok(!trinketProc(G2, 'death'), 'раз в 10 минут');
});

test('Плащ сумерек: враги теряют след; тень и волки бьют сами', () => {
  const G = game(), P = G.P; G.rand = () => 0.01; G.hero.eq.trinket = makeTrinket('warrior', 16, 'epic', rng(1), 'shadowcloak');
  const m = G.mobs.find(x => x.kind === 'wolf'); m.state = 'chase'; m.hp = m.max = 1e6; m.x = P.x + 60; m.y = P.y;
  P.hp = G.st.maxHp * 0.2; assert.ok(trinketProc(G, 'low')); assert.equal(m.state, 'return');
  for (const id of ['mirror', 'pack']) {
    const G2 = game(); G2.rand = () => 0.01; G2.hero.eq.trinket = makeTrinket('warrior', 16, 'epic', rng(1), id);
    const t = G2.mobs.find(x => x.kind === 'wolf'); G2.P.x = t.hx; G2.P.y = t.hy; t.state = 'chase'; t.hp = t.max = 1e6; t.x = G2.P.x + 60; t.y = G2.P.y; G2.P.target = t; G2.st.maxHp = G2.P.hp = 1e6;
    assert.ok(trinketProc(G2, id === 'pack' ? 'kill' : 'hit')); for (let i = 0; i < 60; i++) { update(G2, 0.05, {}); G2.ev.length = 0; }
    assert.ok(t.hp < 1e6, id + ' бьёт');
  }
});

test('старое сохранение: аксессуар получает параметры и новое название, повторно — то же', () => {
  const h = newHero('С', 'archer'); h.eq.trinket = { id: 'old1', cls: 'archer', slot: 'trinket', ilvl: 8, rar: 'rare', tier: 3, trinket: 'stoneheart', name: 'Каменное сердце', price: 100 };
  const a = migrate(JSON.parse(JSON.stringify(h))), b = migrate(JSON.parse(JSON.stringify(a)));
  assert.equal(a.eq.trinket.name, 'Гранитное сердце'); assert.ok(a.eq.trinket.main > 0 && a.eq.trinket.armor > 0); assert.deepEqual(a.eq.trinket, b.eq.trinket);
});
