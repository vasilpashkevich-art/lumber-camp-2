// Банк (v72): банкир в Столице, личный банк 64 ячейки, общий сундук всех героев 32, стопки, сохранения и файл.
import test from 'node:test';
import assert from 'node:assert/strict';
import { PINE } from '../data/zones.js';
import { LOOT } from '../data/balance.js';
import { buildWorld, inCity } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { createGame, update } from '../src/systems/game.js';
import { makeItem, makeStack } from '../src/systems/items.js';
import { addStack } from '../src/systems/mining.js';
import { stashPut, stashTake, stashMove, stashSwap, stashMaterials, store, fixSlots } from '../src/systems/bank.js';
import { migrate } from '../src/engine/save.js';
import { rng } from '../src/engine/util.js';

const W = buildWorld(PINE);
const game = () => { const H = newHero('Б', 'warrior'); const G = createGame(H, W, { rand: rng(4) }); G.shared = { items: [] }; return G; };
const item = (G, s = 'chest', r = 0.3) => { const it = makeItem('warrior', s, 5, 'good', () => r); G.hero.bag.push(it); it.pos = G.hero.bag.length - 1 + 10; return it; };

test('банкир стоит в Столице; E у банка открывает банк', () => {
  const b = W.houses.find(h => h.bank); assert.ok(b, 'банк есть'); assert.equal(b.name, 'Банк');
  assert.ok(inCity(W, b.x, b.y), 'внутри стены');
  const G = game(); G.P.x = b.x; G.P.y = b.y + 40; G.ev.length = 0;
  update(G, 0.05, { interact: true });
  assert.ok(G.ev.some(e => e.k === 'bank'), 'открылось окно банка');
  assert.equal(LOOT.bank, 64); assert.equal(LOOT.shared, 32);
});

test('сумка ↔ банк: вещь переходит целиком, ячейки, обмен местами', () => {
  const G = game(), H = G.hero, a = item(G), b = item(G, 'legs', 0.6);
  const bag0 = H.bag.length;
  assert.ok(stashPut(G, a, 'bank', 5)); assert.equal(a.pos, 5); assert.equal(H.bag.length, bag0 - 1); assert.ok(H.bank.includes(a));
  assert.ok(stashPut(G, b, 'bank')); assert.equal(b.pos, 0, 'первая свободная');
  stashMove(G, b, 'bank', 5); assert.equal(b.pos, 5); assert.equal(a.pos, 0, 'поменялись местами');
  assert.ok(stashTake(G, a, 'bank', 31)); assert.equal(a.pos, 31); assert.ok(H.bag.includes(a)); assert.ok(!H.bank.includes(a));
});

test('банк полон — вещь остаётся в сумке; сумка полна — в банке', () => {
  const G = game(), H = G.hero;
  H.bank = Array.from({ length: LOOT.bank }, (_, i) => ({ id: 'x' + i, pos: i, name: 'x', slot: 'head', cls: 'warrior' }));
  const a = item(G); assert.equal(stashPut(G, a, 'bank'), false); assert.ok(H.bag.includes(a)); assert.ok(G.ev.some(e => e.k === 'toast' && /нет места/.test(e.s)));
  H.bag = Array.from({ length: LOOT.bag }, (_, i) => ({ id: 'y' + i, pos: i, name: 'y' }));
  const x = H.bank[3]; assert.equal(stashTake(G, x, 'bank'), false); assert.ok(H.bank.includes(x));
});

test('руда и самоцветы — стопками: доливаются в такие же в банке и в сумке', () => {
  const G = game(), H = G.hero;
  addStack(H, makeStack('ore', 'copper', 15)); addStack(H, makeStack('ore', 'copper', 15)); addStack(H, makeStack('gem', 'tigerseye', 3));
  assert.equal(stashMaterials(G, 'bank'), 3);
  const ore = H.bank.filter(it => it.kind === 'ore'); assert.equal(ore.reduce((s, it) => s + it.n, 0), 30); assert.equal(ore.length, 2);
  addStack(H, makeStack('ore', 'copper', 4)); stashMaterials(G, 'bank');
  assert.equal(H.bank.filter(it => it.kind === 'ore').reduce((s, it) => s + it.n, 0), 34); assert.equal(H.bank.filter(it => it.kind === 'ore').length, 2, 'долилось, новая стопка не нужна');
  const st = H.bank.find(it => it.kind === 'gem'); assert.ok(stashTake(G, st, 'bank')); assert.equal(H.bag.find(it => it.kind === 'gem').n, 3);
});

test('общий сундук: видят все герои; из банка в сундук и обратно; меняется — помечается для записи', () => {
  const G = game(), a = item(G);
  assert.ok(stashPut(G, a, 'shared')); assert.ok(G.sharedDirty); assert.equal(store(G, 'shared').size, 32);
  // другой герой (другой класс) с тем же сундуком забирает вещь
  const H2 = newHero('Маг', 'mage'), G2 = createGame(H2, W, { rand: rng(5) }); G2.shared = G.shared;
  assert.ok(stashTake(G2, a, 'shared')); assert.ok(H2.bag.includes(a)); assert.equal(G.shared.items.length, 0);
  assert.ok(stashPut(G2, a, 'bank')); assert.ok(stashSwap(G2, a, 'bank', 'shared', 7)); assert.equal(a.pos, 7); assert.ok(!H2.bank.includes(a));
});

test('сохранение: банк в герое; старый герой получает пустой банк; ячейки без повторов', () => {
  const h = migrate({ v: 4, id: 'o', name: 'О', cls: 'mage', lvl: 3, eq: {}, bag: [] }); assert.deepEqual(h.bank, []);
  const k = migrate({ v: 4, id: 'p', name: 'П', cls: 'mage', lvl: 3, eq: {}, bag: [], bank: [{ id: 1, pos: 3 }, { id: 2, pos: 3 }, { id: 3, pos: 99 }, null] });
  assert.equal(k.bank.length, 3); assert.equal(new Set(k.bank.map(x => x.pos)).size, 3); assert.ok(k.bank.every(x => x.pos >= 0 && x.pos < 64));
  assert.deepEqual(fixSlots([{ pos: 0 }, { pos: 0 }], 32).map(x => x.pos), [0, 1]);
});

test('файл сохранения несёт общий сундук; повторная загрузка не удваивает вещи', async () => {
  const mem = {}; globalThis.localStorage = { getItem: k => mem[k] ?? null, setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; } };
  const S = await import('../src/engine/save.js');
  S.saveShared({ items: [{ id: 'q1', pos: 0, name: 'Руда', kind: 'ore', metal: 'copper', n: 5 }] });
  const file = S.exportAll(); for (const k of Object.keys(mem)) delete mem[k];
  S.importAll(file); S.importAll(file);
  assert.equal(S.loadShared().items.length, 1);
  delete globalThis.localStorage;
});
