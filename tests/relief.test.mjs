// Рельеф (v71): Грибной лес — ярусы, откосы, обрывы, склоны. Никто не застревает, всё нужное достижимо.
import test from 'node:test';
import assert from 'node:assert/strict';
import { SHROOM, ZONES } from '../data/zones.js';
import { buildWorld, moveTo } from '../src/world/world.js';
import { LH, STEP, findPath, nextWaypoint } from '../src/world/relief.js';
import { newHero } from '../src/entities/hero.js';
import { createGame, update } from '../src/systems/game.js';
import { initVeins } from '../src/systems/mining.js';
import { migrate } from '../src/engine/save.js';
import { rng } from '../src/engine/util.js';

const W = buildWorld(SHROOM), RF = W.relief;
const home = { x: W.village.x, y: W.village.y + 120 };

/** Пройти по пути шагами героя (скорость 170, 30 кадров/с), как ходит игрок. Возвращает, дошёл ли. */
function walk(x, y, tx, ty, pts) {
  let P = { x, y }, idle = 0; pts = pts.slice();
  for (let k = 0; k < 30 * 240; k++) {
    let [wx, wy] = nextWaypoint(W, P.x, P.y, pts);
    if (!W.stepOk(P.x, P.y, wx, wy)) { const q = findPath(W, P.x, P.y, tx, ty, 80000); if (q && q.length) { pts = q; [wx, wy] = nextWaypoint(W, P.x, P.y, pts); } }   // как в игре: сбился — новый путь
    const d = Math.hypot(wx - P.x, wy - P.y);
    if (pts.length === 1 && d < 8) break;
    const s = Math.min(d, 170 / 30), [nx, ny] = moveTo(W, P.x, P.y, P.x + (wx - P.x) / d * s, P.y + (wy - P.y) / d * s);
    if (Math.hypot(nx - P.x, ny - P.y) < 0.3) { if ((idle += 1 / 30) > 2) return { ok: false, at: [Math.round(P.x), Math.round(P.y)], to: [wx, wy].map(Math.round) }; } else idle = 0;
    P = { x: nx, y: ny };
  }
  return { ok: Math.hypot(P.x - tx, P.y - ty) < 40, at: [Math.round(P.x), Math.round(P.y)] };
}

test('край шире в 1,3 раза; ярусы: низина, долина, холмы, овраг, впадина; склоны найдены', () => {
  assert.equal(SHROOM.W, 10400); assert.equal(SHROOM.H, 6500);
  assert.deepEqual(RF.levels, [-1, -0.5, 0, 0.5, 1]);
  assert.equal(RF.ramps.filter(r => r.kind !== 'road').length, 5); console.log('съездов дорог:', RF.ramps.filter(r => r.kind === 'road').length);
  for (const rp of RF.ramps) { const [a, b] = [rp.pts[0], rp.pts[rp.pts.length - 1]]; assert.equal(RF.levelAt(a[0], a[1]), a[2], 'низ склона на своём ярусе'); assert.equal(RF.levelAt(b[0], b[1]), b[2], 'верх склона на своём ярусе'); }
  const lv = n => RF.levelAt(...[W.camps.find(c => c.name === n)].map(c => [c.x, c.y])[0]);
  assert.equal(lv('Паучий холм'), 1); assert.equal(lv('Логово Полоза'), -1); assert.equal(lv('Сырой овраг'), -1); assert.equal(lv('Камышовое стойбище'), -1);
  assert.equal(RF.levelAt(W.village.x, W.village.y), 0, 'стоянка купца — на равнине');
  assert.ok(RF.levelAt(3000, 6000) < 0, 'юг — низина'); assert.equal(RF.levelAt(5000, 1500), 0, 'север — равнина');
});

test('откосы в пол роста проходимы везде, каменный обрыв — нет', () => {
  let soft = 0, rock = 0, softBad = 0, rockOk = 0;
  for (const L of RF.levels) for (const e of RF.edges[L] || []) {
    const mx = (e.x0 + e.x1) / 2, my = (e.y0 + e.y1) / 2, a = [mx + e.nx * 60, my + e.ny * 60], b = [mx - e.nx * 60, my - e.ny * 60];
    if (!W.walkable(...a) || !W.walkable(...b) || RF.nearRamp(mx, my, 60) || RF.levelAt(...a) !== e.low || RF.levelAt(...b) < L) continue;   // клин между тремя ярусами — мимо
    const ok = RF.canStep(a[0], a[1], b[0], b[1]) && RF.canStep(b[0], b[1], a[0], a[1]);
    if (e.soft) { soft++; if (!ok) softBad++; } else { rock++; if (ok) rockOk++; }
  }
  console.log(`края: откосов ${soft} (непроходимых ${softBad}), каменных ${rock} (проходимых ${rockOk})`);
  assert.ok(soft > 300 && rock > 100); assert.equal(softBad, 0); assert.equal(rockOk, 0);
});

test('от стоянки купца достижимо всё: логова, жилы, выходы, великаны — и герой доходит ногами', () => {
  const G = { W, hero: { veins: {} }, rand: rng(5), t: 0 }; initVeins(G);
  const targets = [
    ...W.camps.flatMap(c => c.spawns.map(s => [c.name, s.x, s.y])),
    ...G.veins.map(v => ['жила ' + v.metal, v.x, v.y + 30]),
    ...W.exits.map(e => ['выход ' + e.to, e.x + (e.x < 1000 ? 120 : -120), e.y]),
    ...W.giants.map(g => ['великан', g.x, g.y + 60]),
  ];
  const bad = [];
  for (const [n, x, y] of targets) {
    const p = findPath(W, home.x, home.y, x, y, 60000);
    if (!p) { bad.push(n + ' — нет пути'); continue; }
    const r = walk(home.x, home.y, x, y, p); if (!r.ok) bad.push(`${n} — застрял у ${r.at} → ${r.to || ''}`);
  }
  console.log('целей:', targets.length, 'жил на холмах:', G.veins.filter(v => RF.levelAt(v.x, v.y) === 1).length);
  assert.deepEqual(bad, []);
  assert.ok(G.veins.filter(v => v.metal === 'iron' && RF.levelAt(v.x, v.y) === 1).length >= 3, 'железо на Железном холме');
  assert.ok(G.veins.every(v => !RF.nearEdge(v.x, v.y, 50) && !RF.nearRamp(v.x, v.y, 40)), 'жилы не у края');
});

test('автоигрок обегает весь край: 600 случайных мест на всех ярусах — дойти и вернуться, не застряв', () => {
  const r = rng(71); const byLvl = {}; let tried = 0, noPath = 0; const bad = [];
  while (tried < 600) {
    const x = 300 + r() * (W.W - 600), y = 300 + r() * (W.H - 600);
    if (!W.walkable(x, y) || W.blocked(x, y)) continue; tried++;
    const L = RF.levelAt(x, y); byLvl[L] = (byLvl[L] || 0) + 1;
    const p = findPath(W, home.x, home.y, x, y, 80000); if (!p) { noPath++; if (noPath < 6) bad.push(`нет пути к ${Math.round(x)},${Math.round(y)} (ярус ${L})`); continue; }
    const a = walk(home.x, home.y, x, y, p); if (!a.ok) { bad.push(`туда: застрял у ${a.at}`); continue; }
    const q = findPath(W, a.at[0], a.at[1], home.x, home.y, 80000); const b = q ? walk(a.at[0], a.at[1], home.x, home.y, q) : { ok: false, at: 'нет пути назад' };
    if (!b.ok) bad.push(`назад: застрял у ${b.at}`);
  }
  console.log('мест по ярусам:', byLvl, 'без пути:', noPath);
  assert.ok(Object.keys(byLvl).length === 5, 'все ярусы');
  assert.ok(noPath <= 3, 'почти всё достижимо: ' + bad.join('; '));
  assert.deepEqual(bad.filter(s => !s.startsWith('нет пути к')), []);
});

test('по обрыву не пройти и не спрыгнуть: шаг больше трети яруса — стоп', () => {
  const hill = RF.regions.find(g => g.name === 'Железный холм'), [x0, y0, x1, y1] = hill.bb, cx = (x0 + x1) / 2;
  // с холма прямо на юг (не по склону)
  let P = { x: cx + 300, y: (y0 + y1) / 2 };
  assert.equal(RF.levelAt(P.x, P.y), 1);
  for (let i = 0; i < 400; i++) [P.x, P.y] = moveTo(W, P.x, P.y, P.x, P.y + 6);
  assert.equal(RF.levelAt(P.x, P.y), 1, 'остался наверху');
  assert.ok(Math.abs(STEP - LH * 0.3) < 1e-9);
});

test('моб гонится в обход обрыва по склону; ближний бой через обрыв не достаёт', () => {
  const H = newHero('Т', 'warrior'); H.zone = 'shroom'; H.lvl = 14;
  const G = createGame(H, W, { rand: rng(3) }); G.st.maxHp = G.P.hp = 1e6;
  const hill = W.camps.find(c => c.name === 'Паучий холм');
  // герой на холме у логова, моб — внизу, южнее склона
  G.P.x = hill.x + 60; G.P.y = hill.y; const m = G.mobs.find(m => m.camp === hill);
  for (const o of G.mobs) if (o !== m) { o.state = 'dead'; o.respawnAt = 1e9; }
  m.x = m.hx = 6640; m.y = m.hy = 1700; m.state = 'chase';
  let hit = false; const hp0 = G.P.hp;
  for (let i = 0; i < 20 * 30; i++) { update(G, 1 / 20, {}); if (G.P.hp < hp0) { hit = true; break; } }
  assert.equal(RF.levelAt(m.x, m.y) >= 0.5 || RF.onRamp(m.x, m.y) != null, true, 'моб поднялся на холм');
  assert.ok(hit, 'дошёл и ударил');
});

test('старое сохранение в Грибном лесу: место ×1,3, жилы заново; в других краях без изменений', () => {
  const h = migrate({ v: 3, id: 'a', name: 'А', cls: 'mage', lvl: 11, zone: 'shroom', pos: { x: 3000, y: 2600 }, veins: { shroom: [{ a: 0, metal: 'tin', x: 1, y: 1 }], pine: [{ a: 0, metal: 'copper', x: 5, y: 5 }] }, eq: {}, bag: [] });
  assert.deepEqual(h.pos, { x: 3900, y: 3380 }); assert.equal(h.veins.shroom, undefined); assert.equal(h.veins.pine.length, 1);
  const k = migrate({ v: 3, id: 'b', name: 'Б', cls: 'mage', lvl: 3, zone: 'pine', pos: { x: 100, y: 200 }, eq: {}, bag: [] });
  assert.deepEqual(k.pos, { x: 100, y: 200 });
  assert.equal(migrate(JSON.parse(JSON.stringify(h))).pos.x, 3900, 'повторно не растягивается');
  assert.ok(W.walkable(h.pos.x, h.pos.y));
});

test('в других краях рельефа нет — ничего не меняется', () => {
  for (const id of ['pine', 'farms']) { const w = buildWorld(ZONES[id]); assert.equal(w.relief, null); assert.equal(w.hAt(100, 100), 0); assert.ok(w.stepOk(0, 0, 500, 500)); }
});

test('автоигрок 15 минут в Грибном лесу (3 класса): бьёт мобов на всех ярусах и почти не упирается', async () => {
  const { runBot } = await import('../tools/sim.mjs');
  for (const c of ['warrior', 'mage', 'archer']) {
    const r = runBot(c, 15, 2, false, 'shroom', 11);
    console.log(`${c}: убито ${r.kills}, смертей ${r.deaths}, упирался ${r.stuck} с из ${r.walk} с`);
    assert.ok(r.kills > 40, 'бьёт'); assert.ok(r.stuck <= Math.max(3, r.walk * 0.01), 'не застревает');
  }
});
