// v111: задания Хуторских угодий («Чёрная мука») и Грибного леса («Голос из болота»), мосты между зонами.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ZONES } from '../data/zones.js';
import { MOBS } from '../data/mobs.js';
import { buildWorld } from '../src/world/world.js';
import { newHero } from '../src/entities/hero.js';
import { createGame, update } from '../src/systems/game.js';
import { rng, dist } from '../src/engine/util.js';
import { QART } from '../src/art/npc.js';
import * as Q from '../src/systems/quests.js';

const WS = { farms: buildWorld(ZONES.farms), shroom: buildWorld(ZONES.shroom), pine: buildWorld(ZONES.pine), swamp: buildWorld(ZONES.swamp) };
const game = (z, cls = 'warrior', seed = 1) => createGame(newHero('Т', cls), WS[z], { rand: rng(seed) });
const talk = (G, npc) => { const n = Q.NPCS[npc]; G.P.x = n.x; G.P.y = n.y + 40; update(G, 0.05, { interact: true }); };

test('данные: жители и места предметов на проходимой земле, без деревьев, достижимы; мобы целей живут в зоне', () => {
  for (const z of ['farms', 'shroom', 'swamp']) {
    const W = WS[z], camps = W.camps.flatMap(c => [].concat(c.mob)), A = ZONES[z].arrive;
    const qs = Object.entries(Q.QUESTS).filter(([, q]) => q.zone === z); assert.ok(qs.length >= 10, z + ' заданий ' + qs.length);
    for (const [id, n] of Object.entries(Q.NPCS)) if (n.zone === z) {
      assert.ok(W.walkable(n.x, n.y) && W.walkable(n.x, n.y + 40), id); assert.ok(!W.trees.some(t => dist(t.x, t.y, n.x, n.y) < 100), id + ' без деревьев');
      assert.ok(!W.camps.some(c => dist(c.x, c.y, n.x, n.y) < (c.r || 150) + 300), id + ' не у логова');
      if (ZONES[z].relief || W.maze) assert.ok(W.path(A.x, A.y, n.x, n.y + 20, 200000), id + ' достижим');
    }
    for (const [id, q] of qs) for (const g of q.goals) {
      if (g.k === 'kill' || g.k === 'loot') for (const k of [].concat(g.mob)) { assert.ok(MOBS[k], id); assert.ok(camps.includes(k), id + ' моб в зоне ' + k); }
      if (g.k === 'obj') { assert.ok(g.spots.length >= g.n, id); assert.ok(QART[g.art], id + ' рисунок'); for (const [x, y] of g.spots) { assert.ok(W.walkable(x, y + 30), id + ' место ' + x); assert.ok(!W.trees.some(t => dist(t.x, t.y, x, y) < 50), id + ' дерево у места'); if (ZONES[z].relief || W.maze) assert.ok(W.path(A.x, A.y, x, y + 20, 200000), id + ' достижимо ' + x); } }
      if (g.k === 'talk') assert.ok(Q.NPCS[g.npc]);
    }
  }
  // мосты: после Атамана Гордей шлёт в Хутор, после Мельника староста — к Савве, Тихон — в Храм
  assert.equal(Q.QUESTS.pine_farms.after, 'pine_ataman'); assert.equal(Q.QUESTS.farm_shroom.turn, 'savva'); assert.equal(Q.QUESTS.sh_temple.zone, 'temple');
  // первые задания зон открыты без цепочки прошлой зоны (кто пропустил — не заперт)
  const h = newHero('Н', 'mage'); h.lvl = 10; for (const id of ['farm_dogs', 'farm_crows', 'sh_road', 'sh_frogs']) assert.equal(Q.qStatus(h, id), 'avail', id);
  h.lvl = 14; for (const id of ['sw_leeches', 'sw_vipers']) assert.equal(Q.qStatus(h, id), 'avail', id);   // v139
  assert.equal(Q.QUESTS.sh_swamp.turn, 'ignat'); assert.equal(Q.QUESTS.farm_swamp.turn, 'nestor');
});

test('мост из Соснового дола: взять у Гордея, сдать старосте в Хуторе', () => {
  const G = game('pine'), h = G.hero; h.lvl = 6; h.quests.done.pine_ataman = 1;
  assert.equal(Q.npcMark(h, 'gordey'), '!'); assert.ok(Q.qAccept(G, 'pine_farms'));
  const G2 = createGame(h, WS.farms, { rand: rng(2) }); assert.equal(Q.npcMark(h, 'evsey'), '!', 'у старосты и свои задания');
  talk(G2, 'evsey'); assert.equal(Q.qStatus(h, 'pine_farms'), 'ready'); assert.ok(Q.qTurnIn(G2, 'pine_farms'));
});

test('мешки чёрной муки горят, сундучки достаются, тотемы бьются: E у места', () => {
  const G = game('farms'), h = G.hero; h.lvl = 9; Object.assign(h.quests.done, { farm_crows: 1, farm_scare: 1 });
  assert.ok(Q.qAccept(G, 'farm_flour')); assert.equal(G.qobjs.length, 6); assert.ok(G.qobjs.every(o => o.art === 'sack' && o.fire));
  for (let i = 0; i < 5; i++) { const o = G.qobjs[0]; G.P.x = o.x; G.P.y = o.y + 20; update(G, 0.05, { interact: true }); }
  assert.equal(h.quests.act.farm_flour.n[0], 5); assert.ok(G.qfires.length >= 1); assert.equal(G.qobjs.length, 0);
  const G2 = game('shroom'), h2 = G2.hero; h2.lvl = 12; Object.assign(h2.quests.done, { sh_road: 1, sh_spores: 1, sh_slime: 1 });
  assert.ok(Q.qAccept(G2, 'sh_totems')); const o = G2.qobjs[0]; G2.P.x = o.x; G2.P.y = o.y + 20; update(G2, 0.05, { interact: true }); assert.equal(h2.quests.act.sh_totems.n[0], 1);
});

test('цель «квакуны оврага» считает и копейщиков, и шаманов', () => {
  const G = game('shroom'), h = G.hero; h.lvl = 13; Object.assign(h.quests.done, { sh_tikhon: 1 }); assert.ok(Q.qAccept(G, 'sh_ravine'));
  for (const kind of ['kvakun', 'kvak_shaman']) { const m = G.mobs.find(o => o.kind === kind); Q.qOnKill(G, m); }
  assert.equal(h.quests.act.sh_ravine.n[0], 2);
});

test('цепочки целиком: «Чёрная мука» и «Голос из болота» сдаются по порядку, в конце — синяя вещь', () => {
  for (const [z, order] of [['farms', ['farm_dogs', 'farm_crows', 'farm_scare', 'farm_fire', 'farm_ashes', 'farm_bulls', 'farm_burners', 'farm_flour', 'farm_runaway', 'farm_key', 'farm_garden', 'farm_miller', 'farm_shroom']],
    ['shroom', ['sh_road', 'sh_frogs', 'sh_spores', 'sh_slime', 'sh_totems', 'sh_webs', 'sh_tikhon', 'sh_brood', 'sh_ravine', 'sh_snake', 'sh_temple']],
    ['swamp', ['sw_leeches', 'sw_vipers', 'sw_nets', 'sw_hamlet', 'sw_island', 'sw_nestor', 'sw_channel', 'sw_hulks', 'sw_idols', 'sw_circle', 'sw_mistress']]]) {
    const G = game(z, 'archer', 4), h = G.hero; h.lvl = z === 'farms' ? 6 : z === 'swamp' ? 14 : 10; let xp = 0;
    for (const id of order) {
      const q = Q.QUESTS[id]; h.lvl = Math.max(h.lvl, q.min); assert.equal(Q.qStatus(h, id), 'avail', id); assert.ok(Q.qAccept(G, id), id);
      q.goals.forEach((g, i) => { h.quests.act[id].n[i] = Q.goalNeed(g); });
      xp += Q.qReward(h, id).xp; assert.ok(Q.qTurnIn(G, id, 0), id);
    }
    assert.ok(h.bag.some(i => i.rar === 'rare'), z + ' синяя в конце'); console.log(z, 'опыт за цепочку', xp);
  }
});
