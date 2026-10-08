// Сохранения: слоты героев, перенос файлом, старые сохранения не теряются.
import test from 'node:test';
import assert from 'node:assert/strict';

const store = {};
globalThis.localStorage = { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
const { listHeroes, saveHero, loadHero, deleteHero, exportAll, importAll, migrate, MAX_SLOTS } = await import('../src/engine/save.js');
const { newHero } = await import('../src/entities/hero.js');

test('создать, сохранить, загрузить, удалить', () => {
  const h = newHero('Торвальд', 'warrior'); h.gold = 42; saveHero(h);
  assert.equal(listHeroes().length, 1);
  const l = loadHero(h.id); assert.equal(l.name, 'Торвальд'); assert.equal(l.gold, 42); assert.equal(l.eq.weapon.name, 'Топорик');
  deleteHero(h.id); assert.equal(listHeroes().length, 0); assert.equal(loadHero(h.id), null);
});

test('ключи ветки II не трогают основную игру', () => {
  saveHero(newHero('А', 'mage'));
  for (const k of Object.keys(store)) assert.ok(k.startsWith('lumber-camp2-'), k);
});

test('в файл и обратно: все герои на месте, мусор не принимается', () => {
  for (const k of Object.keys(store)) delete store[k];
  const a = newHero('Мирна', 'mage'), b = newHero('Ясь', 'archer'); a.lvl = 7; saveHero(a); saveHero(b);
  const txt = exportAll();
  for (const k of Object.keys(store)) delete store[k];
  const r = importAll(txt); assert.equal(r.added, 2);
  assert.equal(loadHero(a.id).lvl, 7);
  assert.throws(() => importAll('{"x":1}'), /не файл сохранения/);
  assert.throws(() => importAll('мусор'), /не файл сохранения/);
});

test('не больше 5 героев при загрузке из файла', () => {
  for (const k of Object.keys(store)) delete store[k];
  const many = Array.from({ length: 7 }, (_, i) => newHero('Г' + i, 'warrior'));
  const r = importAll(JSON.stringify({ game: 'lumber-camp-2', v: 1, heroes: many }));
  assert.equal(r.added, MAX_SLOTS); assert.equal(r.skipped, 2);
});

test('старое сохранение без новых полей дополняется', () => {
  const h = migrate({ id: 'x', name: 'Старый', cls: 'archer', lvl: 3, xp: 5, eq: {} });
  assert.deepEqual(h.bag, []); assert.equal(h.potions, 2); assert.equal(h.stats.kills, 0); assert.equal(h.zone, 'pine');
});

test('сумка старого сохранения получает ячейки по порядку, повторы разводятся', () => {
  const h = migrate({ id: 'y', name: 'Старый', cls: 'mage', lvl: 2, eq: {}, bag: [{ id: 'a', slot: 'head' }, { id: 'b', slot: 'legs', pos: 0 }, { id: 'c', slot: 'chest', pos: 0 }, null] });
  assert.equal(h.bag.length, 3, 'ни одна вещь не потерялась');
  assert.deepEqual(h.bag.map(i => i.pos).sort(), [0, 1, 2]);
});
