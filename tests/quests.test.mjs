// v95: задания — данные, взять/сдать, цели всех видов, награда на выбор, цепочка Соснового дола, сохранение.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ZONES } from '../data/zones.js';
import { MOBS } from '../data/mobs.js';
import { buildWorld } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { createGame, update } from '../src/systems/game.js';
import { migrate } from '../src/engine/save.js';
import { rng, dist } from '../src/engine/util.js';
import { LOOT } from '../data/balance.js';
import * as Q from '../src/systems/quests.js';

const W = buildWorld(ZONES.pine);
const game = (cls = 'warrior', seed = 1) => createGame(newHero('Т', cls), W, { rand: rng(seed) });
const kill = (G, m) => { m.hp = 1; m.stun = 2; m.state = 'chase'; G.P.x = m.x - 30; G.P.y = m.y; G.P.target = m; G.P.hp = G.st.maxHp; for (let i = 0; i < 60 && m.state !== 'dead'; i++) update(G, 0.05, { attack: true }); assert.equal(m.state, 'dead'); };
const fresh = (G, kind) => { const m = G.mobs.find(o => o.kind === kind && o.state === 'idle'); if (m) return m; const d = G.mobs.find(o => o.kind === kind); d.respawnAt = G.t; update(G, 0.05, {}); return d; };
const talk = (G, npc) => { const n = Q.NPCS[npc]; G.P.x = n.x; G.P.y = n.y + 40; update(G, 0.05, { interact: true }); };

test('данные: жители и цели на месте, цепочка без разрывов, мобы целей есть в зоне', () => {
  const camps = W.camps.flatMap(c => [].concat(c.mob));
  for (const [id, q] of Object.entries(Q.QUESTS)) {
    assert.ok(Q.NPCS[q.giver] && Q.NPCS[q.turn || q.giver], id + ' житель'); if (q.after) assert.ok(Q.QUESTS[q.after], id + ' after');
    assert.ok(q.text && q.done && q.name && q.goals.length, id + ' тексты');
    for (const g of q.goals) {
      if (g.k === 'kill' || g.k === 'loot') { assert.ok([].concat(g.mob).every(k => MOBS[k]), id + ' моб'); if (q.zone === 'pine') assert.ok([].concat(g.mob).every(k => camps.includes(k)), id + ' моб в зоне ' + g.mob); }
      if (g.k === 'obj' && q.zone === 'pine') { assert.ok(g.spots.length >= g.n); for (const [x, y] of g.spots) assert.ok(W.walkable(x, y + 30), id + ' место ' + x); }
      if (g.k === 'talk') assert.ok(Q.NPCS[g.npc]);
    }
  }
  for (const [id, n] of Object.entries(Q.NPCS)) if (n.zone === 'pine') { assert.ok(W.walkable(n.x, n.y) && W.walkable(n.x, n.y + 40), id); assert.ok(!W.trees.some(t => dist(t.x, t.y, n.x, n.y) < 100), id + ' без деревьев'); }
  assert.ok(Object.values(Q.QUESTS).filter(q => q.zone === 'pine').length >= 10);
});

test('знаки: «!» — есть задание, «?» — сдать; разговор засчитывает «отнести», награда — опыт и деньги', () => {
  const G = game(), h = G.hero;
  assert.equal(Q.npcMark(h, 'gordey'), '!'); assert.equal(Q.npcMark(h, 'frol'), '');
  talk(G, 'gordey'); assert.ok(G.ev.some(e => e.k === 'npc' && e.id === 'gordey'));
  assert.ok(Q.qAccept(G, 'pine_road')); assert.equal(Q.qStatus(h, 'pine_road'), 'active'); assert.deepEqual(h.quests.track, ['pine_road']);
  assert.equal(Q.npcMark(h, 'frol'), 'wait');
  talk(G, 'frol'); assert.equal(Q.qStatus(h, 'pine_road'), 'ready'); assert.equal(Q.npcMark(h, 'frol'), '?');
  const R = Q.qReward(h, 'pine_road'); assert.ok(Q.qTurnIn(G, 'pine_road')); assert.equal(h.xp, R.xp); assert.equal(h.gold, R.money);
  assert.equal(Q.qStatus(h, 'pine_road'), 'done'); assert.equal(Q.npcMark(h, 'frol'), '!'); assert.ok(!Q.qAccept(G, 'pine_road'), 'второй раз нет');
});

test('убить и добыть: считается только по своим мобам и только пока взято; готово — сообщение', () => {
  const G = game(), h = G.hero; h.quests.done.pine_road = 1; h.lvl = 2;
  kill(G, fresh(G, 'wolf')); assert.ok(!h.quests.act.pine_pelts, 'без задания шкуры не идут');
  Q.qAccept(G, 'pine_foxes'); Q.qAccept(G, 'pine_pelts');
  for (let i = 0; i < 6; i++) kill(G, fresh(G, 'fox'));
  assert.equal(Q.qStatus(h, 'pine_foxes'), 'ready'); assert.equal(h.quests.act.pine_foxes.n[0], 6);
  let n = 0; while (Q.qStatus(h, 'pine_pelts') !== 'ready' && n++ < 40) { G.ev.length = 0; kill(G, fresh(G, 'wolf')); }
  assert.ok(n >= 6 && n <= 30, 'волков ' + n); assert.equal(h.quests.act.pine_pelts.n[0], 6);
});

test('награда на выбор: вещи одни и те же, без выбора не сдать, полная сумка — не сдать', () => {
  const G = game(), h = G.hero; Object.assign(h.quests.done, { pine_road: 1 }); h.lvl = 2; Q.qAccept(G, 'pine_pelts'); h.quests.act.pine_pelts.n[0] = 6;
  const a = Q.qChoice(h, 'pine_pelts'), b = Q.qChoice(h, 'pine_pelts'); assert.equal(a.length, 3); assert.deepEqual(a.map(i => i.name), b.map(i => i.name)); assert.ok(a.every(i => i.rar === 'good' && i.cls === 'warrior'));
  assert.ok(!Q.qTurnIn(G, 'pine_pelts'), 'нужен выбор');
  const full = []; while (h.bag.length < LOOT.bag) { const it = { ...a[0], id: 'x' + h.bag.length, pos: h.bag.length }; h.bag.push(it); full.push(it); }
  assert.ok(!Q.qTurnIn(G, 'pine_pelts', 1), 'сумка полна'); h.bag.length = 0;
  assert.ok(Q.qTurnIn(G, 'pine_pelts', 1)); assert.equal(h.bag.length, 1); assert.equal(h.bag[0].name, a[1].name);
});

test('предметы в мире (силки, шатры) и разведка: E у места; взятое место не возвращается', () => {
  const G = game(), h = G.hero; Object.assign(h.quests.done, { pine_road: 1, pine_foxes: 1 }); h.lvl = 2;
  Q.qAccept(G, 'pine_snares'); assert.equal(G.qobjs.length, 7);
  const o = G.qobjs[0]; G.P.x = o.x; G.P.y = o.y + 20; update(G, 0.05, { interact: true });
  assert.equal(h.quests.act.pine_snares.n[0], 1); assert.equal(G.qobjs.length, 6); assert.ok(!G.qobjs.some(q => q.j === o.j));
  for (let i = 0; i < 4; i++) { const p = G.qobjs[0]; G.P.x = p.x; G.P.y = p.y + 20; update(G, 0.05, { interact: true }); }
  assert.equal(Q.qStatus(h, 'pine_snares'), 'ready'); assert.equal(G.qobjs.length, 0, 'остальные силки пропали');
  // разведка
  Object.assign(h.quests.done, { pine_pelts: 1, pine_boars: 1, pine_spiders: 1, pine_letter: 1 }); h.lvl = 4; Q.qAccept(G, 'pine_scout');
  G.P.x = 6750; G.P.y = 1900; G.qT = 0; update(G, 0.05, {}); assert.equal(Q.qStatus(h, 'pine_scout'), 'ready');
  // шатры горят
  Q.qTurnIn(G, 'pine_scout'); Q.qAccept(G, 'pine_tents'); assert.equal(G.qobjs.length, 4); const t = G.qobjs[0]; G.P.x = t.x; G.P.y = t.y + 30; update(G, 0.05, { interact: true }); assert.equal(G.qfires.length, 1);
});

test('бросить, не больше 20, следить — до трёх; сохранение и старое сохранение', () => {
  const G = game(), h = G.hero; Q.qAccept(G, 'pine_road'); assert.ok(Q.qAbandon(G, 'pine_road')); assert.equal(Q.qStatus(h, 'pine_road'), 'avail'); assert.deepEqual(h.quests.track, []);
  h.lvl = 6; Object.assign(h.quests.done, { pine_road: 1, pine_foxes: 1, pine_pelts: 1 }); let k = 0;
  for (const id of ['pine_snares', 'pine_boars']) if (Q.qAccept(G, id)) k++;
  for (const id of ['pine_scout', 'pine_letter']) { h.quests.act[id] = { n: [0], got: [[]] }; if (!h.quests.track.includes(id)) Q.qTrack(G, id); }
  assert.equal(h.quests.track.length, 3, 'следить — не больше трёх');
  const h2 = migrate(JSON.parse(JSON.stringify(h))); assert.deepEqual(Object.keys(h2.quests.act), Object.keys(h.quests.act));
  const old = JSON.parse(JSON.stringify(newHero('С', 'mage'))); delete old.quests; const m = migrate(old); assert.deepEqual(m.quests, { act: {}, done: {}, track: [] });
  assert.equal(k, 2);
});

test('вся цепочка «Рваное Ухо»: от Гордея до Атамана, опыт — заметная доля зоны', () => {
  const G = game('mage', 3), h = G.hero; let xp = 0; const before = () => h.xp;
  const order = ['pine_road', 'pine_foxes', 'pine_pelts', 'pine_snares', 'pine_boars', 'pine_spiders', 'pine_letter', 'pine_scout', 'pine_tents', 'pine_orders', 'pine_ataman'];
  for (const id of order) {
    const q = Q.QUESTS[id]; h.lvl = Math.max(h.lvl, q.min); assert.equal(Q.qStatus(h, id), 'avail', id);
    assert.ok(Q.qAccept(G, id), id);
    q.goals.forEach((g, i) => { h.quests.act[id].n[i] = Q.goalNeed(g); });
    const x0 = before(), L0 = h.lvl; xp += Q.qReward(h, id).xp; assert.ok(Q.qTurnIn(G, id, 0), id); assert.ok(h.lvl > L0 || h.xp > x0, id + ' опыт');
  }
  assert.equal(Q.npcMark(h, 'zhdan'), ''); assert.ok(h.bag.some(i => i.rar === 'rare'), 'синяя за Атамана');
  assert.ok(xp > 1000 && xp < 3500, 'опыт за цепочку ' + xp);
});
