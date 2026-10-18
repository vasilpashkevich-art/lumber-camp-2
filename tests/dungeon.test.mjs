// v90: подземелье целиком — убитые не возвращаются, боссы и добыча, запечатанный ход, сундуки, портал, обновление через час, окно.
import test from 'node:test';
import assert from 'node:assert/strict';
import { TEMPLE } from '../data/zones.js';
import { MOBS } from '../data/mobs.js';
import { buildWorld } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { createGame, update, chestNear, openChest, trinketProc } from '../src/systems/game.js';
import { dgState, dgEnter, dgLeave, dgLeft, dgBosses, dgUnsealed, dgDone, fmtLeft, NEVER, DUNGEONS } from '../src/systems/dungeon.js';
import { makeTrinket } from '../src/systems/items.js';
import { migrate } from '../src/engine/save.js';
import { rng } from '../src/engine/util.js';

const W = () => buildWorld(TEMPLE);
const hero = () => { const h = newHero('Т', 'warrior'); h.lvl = 16; h.zone = 'temple'; return h; };
const kill = (G, m) => { for (let i = 0; i < 200 && m.state !== 'dead'; i++) { m.hp = 0; m.stun = 1; G.P.x = m.x - 40; G.P.y = m.y; G.P.target = m; G.P.hp = G.st.maxHp; update(G, 0.05, { attack: true }); } assert.equal(m.state, 'dead', 'убит ' + m.kind); G.ev.length = 0; };

test('устройство: 4 босса, запечатанный коридор и ход, 5 сундуков, купель, трон, портал; боссы крупные и с одним умением', () => {
  const B = dgBosses(TEMPLE); assert.deepEqual(B.map(b => b.kind), ['boss_bulk', 'boss_aspid', 'boss_priestess', 'boss_king']); assert.ok(B[3].final && !B[0].final);
  assert.ok(TEMPLE.rooms.find(q => q.id === 'c9').sealed && TEMPLE.doors.find(d => d.kind === 'sealed'));
  assert.equal(TEMPLE.decor.chests.length, 5); assert.ok(TEMPLE.decor.font && TEMPLE.decor.throne && TEMPLE.decor.portal);
  for (const b of B) assert.ok(MOBS[b.kind].boss && MOBS[b.kind].hp >= 3 && (MOBS[b.kind].smash || MOBS[b.kind].summon || MOBS[b.kind].ai));
  assert.equal(DUNGEONS.length, 1); assert.equal(TEMPLE.reset, 3600);
  const w = W(); assert.ok(w.sealed.has('c9')); assert.ok(!w.walkable(3300, 1100), 'запечатанный ход — скала'); assert.ok(!w.path(3300, 1600, 3300, 600, 60000), 'в Тронный зал не пройти');
});

test('убитые в подземелье не возрождаются; боссы: синяя вещь, трое открывают ход, Король — фиолетовая и портал', () => {
  const h = hero(), w = W(), G = createGame(h, w, { rand: rng(5) });
  const guard = G.mobs.find(m => m.kind === 'kvak_guard'); kill(G, guard);
  assert.equal(guard.state, 'dead'); assert.equal(guard.respawnAt, NEVER); assert.equal(h.dead[guard.key], NEVER);
  G.t += 100000; update(G, 0.05, {}); assert.equal(guard.state, 'dead', 'не возродился');
  const bulk = G.mobs.find(m => m.kind === 'boss_bulk'); kill(G, bulk);
  const c = G.corpses.find(c => c.kind === 'boss_bulk'); assert.ok(c && c.items.some(i => i.rar === 'rare'), 'синяя с босса');
  assert.ok(G.dg.bosses.boss_bulk && !dgUnsealed(h, TEMPLE) && w.sealed.size);
  kill(G, G.mobs.find(m => m.kind === 'boss_aspid')); kill(G, G.mobs.find(m => m.kind === 'boss_priestess'));
  assert.ok(dgUnsealed(h, TEMPLE)); assert.equal(w.sealed.size, 0); assert.ok(w.walkable(3300, 1100) && w.walkable(3300, 600), 'ход и Тронный зал открылись');
  const p = w.path(3300, 1600, 3300, 600, 60000); assert.ok(p && p.length >= 2, 'путь к трону');
  assert.ok(!w.exits.some(e => e.portal), 'портала ещё нет');
  kill(G, G.mobs.find(m => m.kind === 'boss_king'));
  const ck = G.corpses.find(c => c.kind === 'boss_king'); assert.ok(ck.items.some(i => i.rar === 'epic') && ck.items.some(i => i.rar === 'rare'), 'с Короля — синяя и фиолетовая');
  assert.ok(dgDone(h, TEMPLE) && w.exits.some(e => e.portal && e.zone === 'shroom'), 'портал');
  // портал — это выход: E рядом ведёт наружу
  G.P.x = TEMPLE.decor.portal[0]; G.P.y = TEMPLE.decor.portal[1] + 30; update(G, 0.05, { interact: true }); assert.ok(G.ev.some(e => e.k === 'zone' && e.e.portal));
  // Король из 10 попыток хоть раз даёт фиолетовый аксессуар (20%)
  let tr = 0; for (let s = 1; s <= 30; s++) { const G2 = createGame(hero(), W(), { rand: rng(s) }); const k = G2.mobs.find(m => m.kind === 'boss_king'); kill(G2, k); if (G2.corpses.find(c => c.kind === 'boss_king').items.some(i => i.slot === 'trinket' && i.rar === 'epic')) tr++; }
  assert.ok(tr >= 2 && tr <= 14, 'аксессуар ' + tr);
});

test('сундуки: E открывает, вещь и монеты в подсумке, второй раз не открыть; состояние в сохранении', () => {
  const h = hero(), w = W(), G = createGame(h, w, { rand: rng(6) });
  const [cx, cy] = TEMPLE.decor.chests[1]; G.P.x = cx; G.P.y = cy + 30;
  assert.equal(chestNear(G).i, 1);
  update(G, 0.05, { interact: true }); assert.ok(G.dg.chests[1]); const c = G.corpses.find(c => c.chest); assert.ok(c && c.items.length === 1 && c.money > 0 && ['good', 'rare'].includes(c.items[0].rar));
  assert.ok(G.ev.some(e => e.k === 'lootOpen')); assert.equal(chestNear(G), null, 'открытый не предлагается');
  openChest(G, 1); assert.equal(G.corpses.filter(c => c.chest).length, 1, 'второй раз нет');
  const h2 = migrate(JSON.parse(JSON.stringify(h))); assert.ok(h2.dungeons.temple.chests[1]);
  const G2 = createGame(h2, W(), { rand: rng(6) }); assert.equal(chestNear({ ...G2, P: { x: cx, y: cy + 30 } }), null);
});

test('обновление: после выхода идёт час; внутри таймер стоит; по сроку — всё заново; окно: статус', () => {
  const h = hero(), w = W(), G = createGame(h, w, { rand: rng(7) });
  kill(G, G.mobs.find(m => m.kind === 'boss_bulk')); kill(G, G.mobs.find(m => m.kind === 'kvak_guard'));
  assert.equal(dgLeft(h, TEMPLE), null, 'внутри — таймер не идёт');
  const t0 = Date.now(); dgLeave(h, TEMPLE, t0); h.zone = 'shroom';
  assert.equal(dgLeft(h, TEMPLE, t0 + 1000), 3599); assert.equal(fmtLeft(3599), '59:59'); assert.equal(fmtLeft(7205), '2 ч 00 мин');
  // вернулся раньше срока — поход продолжается
  assert.equal(dgEnter(h, TEMPLE, t0 + 1800 * 1000), false); assert.ok(h.dungeons.temple.bosses.boss_bulk); assert.ok(Object.keys(h.dead).some(k => k.startsWith('temple:')));
  const Gb = createGame(h, W(), { rand: rng(7) }); assert.equal(Gb.mobs.find(m => m.kind === 'boss_bulk').state, 'dead', 'Бульк всё ещё повержен');
  // срок вышел — заново
  assert.equal(dgEnter(h, TEMPLE, t0 + 3600 * 1000 + 1), true); assert.deepEqual(h.dungeons.temple.bosses, {}); assert.ok(!Object.keys(h.dead).some(k => k.startsWith('temple:'))); assert.equal(h.dungeons.temple.runs, 1);
  const Gc = createGame(h, W(), { rand: rng(7) }); assert.equal(Gc.mobs.find(m => m.kind === 'boss_bulk').state, 'idle'); assert.ok(Gc.W.sealed.size, 'ход снова запечатан');
  assert.equal(dgLeft(h, TEMPLE), 0, 'готово');
  // старое сохранение без поля
  const old = JSON.parse(JSON.stringify(newHero('С', 'mage'))); delete old.dungeons; assert.deepEqual(migrate(old).dungeons, {});
});

test('фиолетовые аксессуары (v110 — сами, с вероятностью): Песочные часы сбрасывают все умения, Камень притяжения стягивает и оглушает', () => {
  const h = hero(), G = createGame(h, W(), { rand: () => 0.01 });
  h.lvl = 20; h.eq.trinket = makeTrinket('warrior', 16, 'epic', rng(1), 'hourglass'); G.P.acd.charge = 5; G.P.acd.whirl = 5; G.P.acd.crush = 5; G.P.acd.berserk = 40; assert.ok(trinketProc(G, 'ability')); for (const k of ['charge', 'whirl', 'crush', 'berserk']) assert.equal(G.P.acd[k], 0, k); assert.ok(G.P.tcd > 0); assert.ok(G.fx.some(f => f.k === 'hourglass'), 'часы видно');   // v123: все умения
  const G2 = createGame(hero(), W(), { rand: () => 0.01 }); G2.hero.eq.trinket = makeTrinket('warrior', 16, 'epic', rng(1), 'gravity');
  const ms = G2.mobs.filter(m => m.camp.name === 'Казармы'); G2.P.x = 2000; G2.P.y = 2400; for (const m of ms) m.state = 'chase';
  assert.ok(trinketProc(G2, 'hit')); for (const m of ms) assert.ok(m.stun > 0, 'оглушён'); const cx = ms.reduce((a, m) => a + m.x, 0) / ms.length; for (const m of ms) assert.ok(Math.hypot(m.x - cx, m.y - ms[0].y) < 60, 'стянуты');
});
