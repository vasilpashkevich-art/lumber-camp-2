// Отрисовка мира: земля кусками, предметы по глубине, мобы, герой, выстрелы, эффекты, всплывающие числа.
import { LOOK } from '../art/look.js';
import { lairSpr } from '../art/lairs.js';
import { legColor, person } from '../art/body.js';
import { palette } from '../art/gear.js';
import { field, river as riverArt, bridge, haystack, millBase, millBlades, well } from '../art/farmland.js';
import { BLD } from '../art/bld.js';
import { castle, stairs, brazierFire, paving, roundPlaza, ringPath, fountain, lamp, flowerbed, terrace, wallSeg, roundTower, merlons, cone } from '../art/castle.js';
import { house, inn, tavern, enchant, barn, miners, forge, farmstead } from '../art/houses.js';
import { vein, glint, outcrop } from '../art/ore.js';
import { BAR_H } from '../art/beasts.js';
import * as FOR from '../art/forest.js';
import { ORES, veinColor, MINE } from '../../data/mining.js';
import { miningSkill } from '../systems/mining.js';
import { sprite, drawSpr, flashOf, heroSpr, mobSpr, MOB_SCALE, MOB_LOOK, personSpr, beastSpr, drawFrame, GUARD_LOOK, MERCH_LOOK, viewOf, sprBox, FRAMES, treeSpr, TREE_K, bldSpr, mountainSpr } from '../art/sprites.js';
import { treesIn, GATE_W } from '../world/world.js';
import { lookOf } from '../systems/items.js';
import { interactTarget } from '../systems/game.js';
import { lvlColor, RAR_COL, RAR_IDX, LOOT } from '../../data/balance.js';
import { rng, dist, inPoly, money, segDist } from './util.js';

const CHUNK = 512;

export function createRenderer(cv) {
  const ctx = cv.getContext('2d');
  const R = { cv, ctx, chunks: new Map(), cam: { x: 0, y: 0, z: 1 }, floats: [], parts: [], shake: 0, W: null, statics: null, dpr: 1 };
  R.resize = () => {
    const d = Math.min(2, window.devicePixelRatio || 1); R.dpr = d;
    cv.width = Math.round(innerWidth * d); cv.height = Math.round(innerHeight * d);
    cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
    // сколько мира видно: около 1150 единиц по ширине на компьютере, меньше — на телефоне
    R.cam.z = Math.max(0.62, Math.min(1.5, innerWidth / 1150)) * d;
  };
  R.resize();
  return R;
}

// ---------------------------------------------------------------- статичные предметы зоны
function buildStatics(W) {
  const S = [], c = W.cap, r = rng(W.Z.seed + 99);
  if (c) {
    // стена столицы: 3 роста, кусками по окружности, проёмы ворот
    const n = 120, GW = c.gateW || GATE_W, H = 126, th = 26;
    for (let i = 0; i < n; i++) {
      const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2, am = (a0 + a1) / 2;
      if (c.gates.some(g => Math.abs(((am - g) + Math.PI * 3) % (Math.PI * 2) - Math.PI) < GW)) continue;
      const mx = Math.cos(am) * c.R, my = Math.sin(am) * c.R;
      const p0 = [Math.cos(a0) * c.R - mx, Math.sin(a0) * c.R - my], p1 = [Math.cos(a1) * c.R - mx, Math.sin(a1) * c.R - my], nr = [Math.cos(am), Math.sin(am)];
      const xs = [p0[0], p1[0]].flatMap(x => [x - th, x + th]), ys = [p0[1], p1[1]].flatMap(y => [y - H - th - 20, y + th]);
      const x0 = Math.min(...xs) - 6, y0 = Math.min(...ys) - 6, x1 = Math.max(...xs) + 6, y1 = Math.max(...ys) + 6;
      const sp = sprite('cw|' + c.R + '|' + i, x1 - x0, y1 - y0, -x0, -y0, 1.6, g => wallSeg(g, p0, p1, nr, H, th, 100 + i));
      S.push({ y: c.y + my + (my > 0 ? th / 2 : -th / 2), oc: occ(sp, c.x + mx, c.y + my), soft: c.x + mx, draw: g => drawSpr(g, sp, c.x + mx, c.y + my) });
    }
    // башни: у ворот и по стене
    const towerSpr = sprite('ctower', 130, 320, 65, 290, 1.6, g => { const top = roundTower(g, 0, 0, 72, 170, '#8d8a82', 5); merlons(g, -40, top, 80, '#8d8a82'); cone(g, 0, top - 22, 104, 92, '#2f5d9a', 0, '#e7c35a'); });
    const tw = []; for (const ga of c.gates) for (const sd of [-1, 1]) tw.push(ga + sd * (GW + 0.035));
    for (const a of [Math.PI * 0.25, Math.PI * 0.75, Math.PI, Math.PI * 1.25, Math.PI * 1.5 - 0.5, Math.PI * 1.5 + 0.5, Math.PI * 1.75]) tw.push(a);
    for (const a of tw) { const x = c.x + Math.cos(a) * c.R, y = c.y + Math.sin(a) * c.R + 10; S.push({ y, oc: occ(towerSpr, x, y), draw: g => drawSpr(g, towerSpr, x, y) }); }
    // стража у ворот — в полный рост, по двое снаружи
    for (const ga of c.gates) for (const sd of [-1, 1]) {
      const a = ga + sd * (GW - 0.03), x = c.x + Math.cos(a) * (c.R + 46), y = c.y + Math.sin(a) * (c.R + 46);
      const view = Math.abs(Math.sin(ga)) > 0.5 ? 'front' : 'side';
      S.push({ y, draw: (g, t) => guard(g, x, y, view, Math.cos(ga) < -0.5 ? -1 : 1, t) });
    }
    // дворец, терраса, лестница, жаровни, стража у дворца
    if (W.castle) {
      const K = W.castle, cx = K.x, fy = K.y, cs = 0.8;
      const pal = sprite('palace', 660, 520, 330, 480, 1.4, g => { g.scale(cs, cs); castle(g, 'b', 0, false); });
      S.push({ y: fy, oc: occ(pal, cx, fy), draw: g => drawSpr(g, pal, cx, fy) });
      const ter = sprite('terrace', 2 * K.terrace + 40, 140, K.terrace + 20, 40, 1.6, g => { terrace(g, K.terrace, K.stairs + 36, 67); g.save(); g.translate(0, -56); g.scale(cs, cs); stairs(g, 240, 6, 14); g.restore(); });
      S.push({ y: fy + 56, draw: g => drawSpr(g, ter, cx, fy + 56) });
      for (const sd of [-1, 1]) { const bx = cx + sd * 133, by = fy + 30; S.push({ y: fy + 57, draw: (g, t) => brazierFire(g, bx, by, t, false) }); }
      for (const [dx, dy] of [[-56, 14], [56, 14], [-150, K.front + 22], [150, K.front + 22]]) S.push({ y: fy + dy, draw: (g, t) => guard(g, cx + dx, fy + dy, 'front', 1, t) });
    }
    // фонтан и фонари
    if (c.fountain) S.push({ y: c.y + 30, x: c.x, draw: (g, t) => { g.save(); g.translate(c.x, c.y); g.scale(0.84, 0.84); fountain(g, t, 110); g.restore(); } });
    const lampSpr = sprite('lamp', 50, 130, 25, 120, 2, g => { g.scale(0.8, 0.8); lamp(g, 0, false); });
    for (const [dx, dy] of c.lamps || []) { const x = c.x + dx, y = c.y + dy; S.push({ y, x, draw: g => drawSpr(g, lampSpr, x, y) }); }
  }
  // постройки столицы и посёлка
  const K = 0.78, big = (key, fn, w = 360, h = 300) => sprite('h|' + key, w, h, w / 2, h - 30, 2, g => { g.scale(K, K); fn(g); });
  const ART = {
    market: () => stallSpr(), stall: () => stallSpr(), cart: () => cartSpr(),
    forge: () => big('forge', forge), tavern: () => big('tavern', tavern), miners: () => big('miners', miners, 420),
    enchant: () => big('enchant', enchant), inn: () => big('inn', inn), barn: () => big('barn', barn),
    house: v => big('house' + v, g => house(g, v)),
  };
  const LBL = { castle: 455, market: 105, stall: 105, cart: 110, forge: 170, tavern: 210, miners: 200, enchant: 210, inn: 230, barn: 190 };
  for (const b of W.houses) {
    const sp = ART[b.art] ? ART[b.art](b.v || 0) : null;
    S.push({ y: b.y, oc: sp && occ(sp, b.x, b.y), draw: g => sp && drawSpr(g, sp, b.x, b.y), label: b.name, lx: b.x, ly: b.y - (LBL[b.art] || 120) });
  }
  if (W.village) { const v = W.village, sp = v.well !== false ? sprite('well', 70, 80, 35, 66, 2, g => well(g)) : null; S.push({ y: v.y + 10, draw: g => sp && drawSpr(g, sp, v.x, v.y + 10), label: v.name, lx: v.x, ly: v.y - v.R + 30 });
    if (v.camp) { const fx = v.x + 140, fy = v.y + 120; S.push({ y: fy, fire: true, x: fx, draw: (g, t) => campfire(g, fx, fy, t) }); } }
  // кладбище (у стоянки купца в Грибном лесу его нет — возрождение у тележки)
  const gy = W.graveyard;
  if (!gy.hidden) for (let i = 0; i < 9; i++) {
    const x = gy.x - 110 + (i % 3) * 110 + (r() - 0.5) * 20, y = gy.y - 60 + Math.floor(i / 3) * 60 + (r() - 0.5) * 10, cross = r() < 0.5;
    const sp = sprite('grave' + (cross ? 1 : 0), 40, 50, 20, 40, 2, g => grave(g, cross));
    S.push({ y, draw: g => drawSpr(g, sp, x, y) });
  }
  if (!gy.hidden) S.push({ y: gy.y + 110, label: gy.name, lx: gy.x, ly: gy.y - 110, draw: () => {} });
  // указатели на выходах
  for (const e of W.exits) {
    const sp = sprite('sign', 120, 110, 60, 90, 2, g => signpost(g));
    S.push({ y: e.y, draw: g => drawSpr(g, sp, e.x - 40, e.y), label: `${e.to} · ${e.lvl}`, lx: e.x - 40, ly: e.y - 100 });
  }
  // приметы логов: нора, логово, лёжка, паутина, шатры; у людей — костёр
  for (const cp of W.camps) {
    const sp = lairSpr(cp.lair), ly = cp.y - 10;
    if (sp) S.push({ y: ly, x: cp.x, oc: occ(sp, cp.x, ly), draw: g => drawSpr(g, sp, cp.x, ly) });
    if (cp.lair === 'bandit' || cp.lair === 'ataman' || cp.lair === 'burned') { const fx = cp.x + (cp.lair === 'ataman' ? -140 : 0), fy = cp.y + (cp.lair === 'ataman' ? 46 : 40); S.push({ y: fy, fire: true, x: fx, draw: (g, t) => campfire(g, fx, fy, t) }); }
  }
  // Хуторские угодья: мосты, стога, хутора, мельница
  if (W.river) for (const b of W.river.bridgeAt) { const len = Math.round(b.len), sp = sprite('bridge' + len, 110, len + 40, 55, len / 2 + 20, 2, g => bridge(g, len)); S.push({ y: b.y - len / 2 + 6, x: b.x, draw: g => { g.save(); g.translate(b.x, b.y); g.rotate(b.ra - Math.PI / 2); drawSpr(g, sp, 0, 0); g.restore(); } }); }
  // Грибной лес: поваленные стволы, папоротники, светящиеся грибочки, камыш у прудов
  for (const p of W.props) {
    if (p.kind === 'log') { const L = Math.round(p.len / 10) * 10, sp = sprite('log|' + L + '|' + (p.s % 4), L + 40, 50, L / 2 + 20, 34, 2, g => FOR.fallenLog(g, L, p.s % 4 + 1)); S.push({ y: p.y, x: p.x, oc: occ(sp, p.x, p.y), draw: g => drawSpr(g, sp, p.x, p.y) }); }
    if (p.kind === 'fern') { const sp = sprite('fern|' + (p.s % 6), 50, 34, 25, 24, 2, g => FOR.fern(g, 1, p.s % 6 + 1)); S.push({ y: p.y, x: p.x, draw: g => drawSpr(g, sp, p.x, p.y, 1, p.k) }); }
    if (p.kind === 'glow') S.push({ y: p.y, x: p.x, draw: (g, t) => { g.save(); g.translate(p.x, p.y); FOR.glowShrooms(g, 4, p.s, t); g.restore(); } });
    if (p.kind === 'reeds') { const sp = sprite('reeds|' + (p.s % 5), 40, 44, 20, 38, 2, g => FOR.reeds(g, 8, p.s % 5 + 2, 0)); S.push({ y: p.y, x: p.x, draw: g => drawSpr(g, sp, p.x, p.y) }); }
  }
  for (const p of W.props) if (p.kind === 'hay') { const sp = sprite('hay', 80, 80, 40, 66, 2, g => haystack(g)); S.push({ y: p.y, x: p.x, draw: g => drawSpr(g, sp, p.x, p.y) }); }
  for (const f of W.Z.farmsteads || []) { const sp = sprite('farmst' + (f.burned ? 'B' : ''), 460, 280, 200, 250, 2, g => { g.scale(K, K); farmstead(g, f.burned); }); S.push({ y: f.y, x: f.x, oc: occ(sp, f.x, f.y), draw: g => drawSpr(g, sp, f.x, f.y) }); if (f.burned) S.push({ y: f.y + 1, x: f.x, draw: (g, t) => smoke(g, f.x + 20, f.y - 60, t) }); }
  if (W.Z.mill) { const m = W.Z.mill, ms = 1.5, sp = sprite('millbase', 210, 255, 105, 228, 1.6, g => { g.scale(ms, ms); millBase(g, false); }); S.push({ y: m.y, x: m.x, oc: { x0: m.x - 150, y0: m.y - 340, x1: m.x + 150, y1: m.y }, label: 'Старая мельница', lx: m.x, ly: m.y - 300, draw: (g, t) => { drawSpr(g, sp, m.x, m.y); g.save(); g.translate(m.x, m.y - 112 * ms); g.scale(ms, ms); millBlades(g, t * 0.5, false); g.restore(); } }); }
  // скалы и пригорки (v61)
  for (const o of W.rocks || []) { const sp = sprite('rock|' + o.s + '|' + Math.round(o.w), o.w * 1.5 + 40, o.h * 1.4 + 50, o.w * 0.75 + 20, o.h * 1.3 + 20, 1.6, g => outcrop(g, o.w, o.h, o.s)); S.push({ y: o.y, x: o.x, oc: occ(sp, o.x, o.y), draw: g => drawSpr(g, sp, o.x, o.y) }); }
  // горы за краем зоны (там, где они есть)
  const mt = [], ridges = W.Z.ridges || [];
  for (let i = 0; i < W.edge.length; i++) {
    const [x, y] = W.edge[i];
    if ((y < 700 && ridges.includes('north')) || (x < 700 && ridges.includes('west'))) { const ox = x < 700 ? -150 - r() * 120 : (r() - 0.5) * 60, oy = y < 700 ? -90 - r() * 120 : (r() - 0.5) * 60; mt.push([x + ox, y + oy, r()]); }
  }
  for (const [x, y, v] of mt) { const sp = mountainSpr(v); S.push({ y, draw: g => drawSpr(g, sp, x, y, 1, 1.3) }); }
  return S;
}
// рамка картинки в мире: по ней видно, заслоняет ли постройка героя
function occ(sp, x, y, sc = 1) { const b = sprBox(sp); return b && { x0: x + b.x0 * sc, y0: y + b.y0 * sc, x1: x + b.x1 * sc, y1: y }; }
// заслоняет ли: кто-то из своих (герой, моб в бою с ним) стоит позади картинки — у её основания выше и внутри рамки
function hides(o, pts) { const b = o.oc; if (!b) return false;
  // стена — кусками: прозрачность плавно спадает в стороны от героя, без резких границ
  if (o.soft != null) { let a = 1; for (const [x, y] of pts) if (y < o.y - 4 && y > b.y0 + 10) a = Math.min(a, 0.42 + 0.58 * Math.max(0, Math.min(1, (Math.abs(x - o.soft) - 50) / 150))); return a; }
  for (const [x, y] of pts) if (y < o.y - 4 && x > b.x0 + 14 && x < b.x1 - 14 && y > b.y0 + 10) return 0.42; return 1; }
// прилавок рынка с купцом за стойкой (v65) и тележка купца с купцом рядом
function stallSpr() { return sprite('stallM', 100, 80, 50, 70, 2.2, g => { g.save(); g.translate(0, -7); g.scale(1.15, 1.15); person(g, MERCH_LOOK, 'front', {}); g.restore(); FOR.stallFront(g); FOR.stallTop(g); }); }
function cartSpr() { return sprite('cartM', 160, 90, 80, 76, 2.2, g => { FOR.cart(g, 0); g.save(); g.translate(46, 6); g.scale(1.15, 1.15); person(g, MERCH_LOOK, 'front', {}); g.restore(); }); }
// городской стражник в полный рост (как герой), чуть дышит
function guard(g, x, y, view, dir, t) {
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, y + 2, 14, 5, 0, 0, 7); g.fill();
  drawFrame(g, personSpr(GUARD_LOOK, view, 'idle', 0), x, y + Math.sin(t * 2 + x) * 0.4, dir, 1.15);
}
// дым над пепелищем
function smoke(g, x, y, t) { for (let i = 0; i < 4; i++) { const q = (t * 0.25 + i / 4) % 1; g.fillStyle = `rgba(90,85,80,${0.35 * (1 - q)})`; g.beginPath(); g.arc(x + Math.sin(t + i) * 6 + q * 14, y - q * 70, 8 + q * 16, 0, 7); g.fill(); } }

function grave(g, cross) {
  const O = '#24180f';
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(2, 2, 13, 4, 0, 0, 7); g.fill();
  g.fillStyle = '#5a4a3a'; g.beginPath(); g.ellipse(0, 0, 12, 4, 0, 0, 7); g.fill();
  if (cross) { g.fillStyle = '#8a8478'; g.strokeStyle = O; g.lineWidth = 1.3; g.beginPath(); g.rect(-2.5, -30, 5, 30); g.rect(-9, -24, 18, 5); g.fill(); g.stroke(); }
  else { g.fillStyle = '#9a948a'; g.strokeStyle = O; g.lineWidth = 1.3; g.beginPath(); g.moveTo(-8, 0); g.lineTo(-8, -18); g.quadraticCurveTo(0, -30, 8, -18); g.lineTo(8, 0); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(36,24,15,.5)'; g.beginPath(); g.moveTo(-4, -16); g.lineTo(4, -16); g.moveTo(-4, -11); g.lineTo(4, -11); g.stroke(); }
}
function signpost(g) {
  const O = '#24180f';
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 2, 30, 6, 0, 0, 7); g.fill();
  // завал из брёвен
  for (let i = 0; i < 3; i++) { g.save(); g.translate(20, -4 - i * 7); g.rotate(-0.08 + i * 0.05); g.fillStyle = '#6b4a2c'; g.strokeStyle = O; g.lineWidth = 1.3; g.beginPath(); g.roundRect(-30, -4, 60, 8, 3); g.fill(); g.stroke(); g.fillStyle = '#c9a06a'; g.beginPath(); g.ellipse(30, 0, 2.5, 4, 0, 0, 7); g.fill(); g.stroke(); g.restore(); }
  g.fillStyle = '#5a3e24'; g.strokeStyle = O; g.lineWidth = 1.4; g.beginPath(); g.rect(-3, -62, 6, 62); g.fill(); g.stroke();
  g.fillStyle = '#b48a5a'; g.beginPath(); g.moveTo(-30, -58); g.lineTo(26, -58); g.lineTo(34, -50); g.lineTo(26, -42); g.lineTo(-30, -42); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(36,24,15,.55)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-22, -50); g.lineTo(20, -50); g.stroke();
}
function campfire(g, x, y, t) {
  LOOK.use(g);
  g.fillStyle = 'rgba(255,150,50,.18)'; g.beginPath(); g.arc(x, y - 6, 60, 0, 7); g.fill();
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; g.fillStyle = i % 2 ? '#7a776f' : '#8a867d'; g.strokeStyle = '#24180f'; g.lineWidth = 0.8; g.beginPath(); g.ellipse(x + Math.cos(a) * 14, y + Math.sin(a) * 6, 4, 3, 0, 0, 7); g.fill(); g.stroke(); }
  for (let i = 0; i < 3; i++) { const f = 1 + 0.15 * Math.sin(t * 9 + i * 2); g.fillStyle = ['#ff6a2a', '#ffb347', '#fff2a0'][i]; const w = 8 - i * 2.5, h = (18 - i * 5) * f; g.beginPath(); g.moveTo(x - w, y); g.quadraticCurveTo(x - w, y - h * 0.6, x, y - h); g.quadraticCurveTo(x + w, y - h * 0.6, x + w, y); g.closePath(); g.fill(); }
}

// ---------------------------------------------------------------- земля
// калитка кладбища: угол на эллипсе ограды к ближайшей точке дорог
function gateAngle(W, gy) {
  let best = 1e9, bx = gy.x, by = gy.y - 100;
  for (const rd of W.roads) for (let i = 0; i < rd.length - 1; i++) for (let k = 0; k <= 20; k++) { const x = rd[i][0] + (rd[i + 1][0] - rd[i][0]) * k / 20, y = rd[i][1] + (rd[i + 1][1] - rd[i][1]) * k / 20, d = Math.hypot(x - gy.x, y - gy.y); if (d < best) { best = d; bx = x; by = y; } }
  return Math.atan2((by - gy.y) / 104, (bx - gy.x) / 190);
}
function chunk(R, i, j) {
  const key = i + ',' + j; let cv = R.chunks.get(key);
  if (cv) { R.chunks.delete(key); R.chunks.set(key, cv); return cv; }
  const W = R.W, x0 = i * CHUNK, y0 = j * CHUNK;
  cv = document.createElement('canvas'); cv.width = CHUNK; cv.height = CHUNK;
  const g = cv.getContext('2d'); g.translate(-x0, -y0); LOOK.use(g);
  LOOK.ground(x0, y0, CHUNK, CHUNK, W.Z.ground, W.Z.seed, 3);
  if (W.Z.moss) { FOR.ground(g, x0, y0, CHUNK, CHUNK, W.Z.seed, false); LOOK.use(g); }
  if (W.creek) { FOR.creek(g, W.creek.pts, W.creek.w); LOOK.use(g); }
  // за краем зоны — тёмный лес и скалы
  g.save(); g.beginPath(); g.rect(x0 - 2, y0 - 2, CHUNK + 4, CHUNK + 4);
  g.moveTo(W.edge[0][0], W.edge[0][1]); for (const p of W.edge) g.lineTo(p[0], p[1]); g.closePath();
  g.fillStyle = 'rgba(28,40,26,.88)'; g.fill('evenodd'); g.restore();
  // дороги: одним путём на все дороги и площадки — слои кладутся разом, стыки без швов
  g.lineJoin = 'round'; g.lineCap = 'round';
  const PL = W.Z.plazas || [];
  const roadPath = () => { g.beginPath(); for (const rd of W.roads) { g.moveTo(rd[0][0], rd[0][1]); for (const p of rd.slice(1)) g.lineTo(p[0], p[1]); } };
  const plazaPath = (d = 0) => { g.beginPath(); for (const [x, y, r] of PL) { g.moveTo(x + r + d, y); g.ellipse(x, y, r + d, (r + d) * 0.72, 0, 0, 7); } };
  roadPath(); g.strokeStyle = 'rgba(90,70,40,.55)'; g.lineWidth = 78; g.stroke(); plazaPath(39); g.fillStyle = 'rgba(90,70,40,.55)'; g.fill();
  // середина: дорога и площадки одним цветом, без наложения
  g.save(); roadPath(); g.strokeStyle = '#b39a6a'; g.lineWidth = 64; g.stroke(); plazaPath(32); g.fillStyle = '#b39a6a'; g.fill(); g.restore();
  roadPath(); g.strokeStyle = 'rgba(210,190,140,.45)'; g.lineWidth = 30; g.stroke();
  if (PL.length) { plazaPath(-14); g.fillStyle = 'rgba(210,190,140,.32)'; g.fill(); }
  for (const [px, py, rx, ry] of W.ponds || []) if (Math.abs(px - (x0 + CHUNK / 2)) < rx + CHUNK && Math.abs(py - (y0 + CHUNK / 2)) < ry + CHUNK) { g.save(); g.translate(px, py); FOR.pond(g, rx, ry, Math.round(px) % 97, 0); g.restore(); LOOK.use(g); }
  const r = rng(i * 7919 + j * 104729 + 5);
  // камушки на дорогах
  for (let k = 0; k < 120; k++) { const x = x0 + r() * CHUNK, y = y0 + r() * CHUNK; if (W.roadD(x, y) < 28) { g.fillStyle = r() < 0.5 ? 'rgba(120,100,70,.55)' : 'rgba(230,215,180,.5)'; g.beginPath(); g.ellipse(x, y, 2 + r() * 2, 1.4 + r(), 0, 0, 7); g.fill(); } }
  // столица: газоны, плиточные дорожки, площадь у фонтана, терраса дворца, клумбы
  const c = W.cap;
  if (c && Math.abs(c.x - (x0 + CHUNK / 2)) < c.R + CHUNK && Math.abs(c.y - (y0 + CHUNK / 2)) < c.R + CHUNK) {
    g.save(); g.beginPath(); g.arc(c.x, c.y, c.R - 4, 0, 7); g.clip();
    g.fillStyle = 'rgba(110,160,60,.16)'; g.fillRect(x0, y0, CHUNK, CHUNK);
    for (const p of c.paths || []) { g.save(); g.translate(c.x, c.y); g.rotate(p.a); paving(g, 0, -p.w / 2, p.to + 40, p.w, 11 + Math.abs(Math.round(p.a * 10)) + (p.a < 0 ? 40 : 0)); g.restore(); }
    if (c.ring) ringPath(g, c.x, c.y, c.ring.r - c.ring.w / 2, c.ring.r + c.ring.w / 2, 5);
    if (c.fountain) roundPlaza(g, c.x, c.y, c.fountain.plaza, 9);
    if (W.castle) paving(g, c.x - W.castle.terrace, W.castle.y - 10, W.castle.terrace * 2, 68, 13, false);
    for (const [dx, dy, w, h] of c.beds || []) { g.save(); g.translate(c.x + dx, c.y + dy); flowerbed(g, w, h, Math.abs(dx * 3 + dy)); g.restore(); }
    g.restore();
  }
  // посёлок: утоптанная земля
  const v = W.village;
  if (v && Math.abs(v.x - (x0 + CHUNK / 2)) < v.R + CHUNK && Math.abs(v.y - (y0 + CHUNK / 2)) < v.R + CHUNK) {
    const gr = g.createRadialGradient(v.x, v.y, 20, v.x, v.y, v.R); gr.addColorStop(0, 'rgba(150,120,80,.55)'); gr.addColorStop(0.8, 'rgba(150,120,80,.35)'); gr.addColorStop(1, 'rgba(150,120,80,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(v.x, v.y, v.R, 0, 7); g.fill();
  }
  // поля и река (в землю)
  for (const F of W.fields) if (Math.abs(F.x - (x0 + CHUNK / 2)) < (F.w + F.h) / 2 + CHUNK && Math.abs(F.y - (y0 + CHUNK / 2)) < (F.w + F.h) / 2 + CHUNK) field(g, F);
  if (W.river) { const R = W.river, near = R.pts.some(([x, y], i) => i < R.pts.length - 1 && segDist(x0 + CHUNK / 2, y0 + CHUNK / 2, x, y, R.pts[i + 1][0], R.pts[i + 1][1]) < CHUNK); if (near) riverArt(g, R, 0); }
  // кладбище: тёмная земля
  const gy = W.graveyard;
  if (!gy.hidden && Math.abs(gy.x - (x0 + CHUNK / 2)) < 500 && Math.abs(gy.y - (y0 + CHUNK / 2)) < 500) {
    g.fillStyle = 'rgba(60,50,35,.45)'; g.beginPath(); g.ellipse(gy.x, gy.y, 200, 110, 0, 0, 7); g.fill();
    // ограда с калиткой — в сторону ближней дороги
    const ga = gateAngle(W, gy);
    g.strokeStyle = '#4a3a2a'; g.lineWidth = 4; g.setLineDash([10, 8]); g.beginPath(); g.ellipse(gy.x, gy.y, 190, 104, 0, ga + 0.24, ga - 0.24 + Math.PI * 2); g.stroke(); g.setLineDash([]);
    for (const d of [-0.24, 0.24]) { const x = gy.x + Math.cos(ga + d) * 190, y = gy.y + Math.sin(ga + d) * 104; g.fillStyle = '#5a4630'; g.strokeStyle = '#24180f'; g.lineWidth = 1.2; g.beginPath(); g.rect(x - 4, y - 6, 8, 9); g.fill(); g.stroke(); }
  }
  // вытоптанная земля в лагерях
  for (const cp of W.camps) if (Math.abs(cp.x - (x0 + CHUNK / 2)) < 700 && Math.abs(cp.y - (y0 + CHUNK / 2)) < 700) {
    const gr = g.createRadialGradient(cp.x, cp.y, 10, cp.x, cp.y, cp.r * 0.9); gr.addColorStop(0, 'rgba(120,95,60,.35)'); gr.addColorStop(1, 'rgba(120,95,60,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(cp.x, cp.y, cp.r * 0.9, 0, 7); g.fill();
  }
  // трава и цветы
  for (let k = 0; k < 70; k++) {
    const x = x0 + r() * CHUNK, y = y0 + r() * CHUNK;
    if (!inPoly(x, y, W.edge) || W.roadD(x, y) < 44 || (W.town && !W.cap && dist(x, y, W.town.x, W.town.y) < W.town.R + 20) || (W.cap && (W.onPave(x, y) || W.blocked(x, y) || Math.abs(dist(x, y, W.cap.x, W.cap.y) - W.cap.R) < 30)) || (W.ponds && W.ponds.length && W.water(x, y, 6)) || (W.river && W.riverD(x, y) < W.river.w / 2 + 16) || W.inField(x, y, 4)) continue;
    LOOK.tuft(x, y, 0.9 + r() * 0.6, W.Z.ground, r());
  }
  R.chunks.set(key, cv); if (R.chunks.size > 48) R.chunks.delete(R.chunks.keys().next().value);
  return cv;
}

// ---------------------------------------------------------------- кадр
let R_PARTS = null;
export function render(R, G, now) {
  const { ctx: c, cv } = R, W = G.W, P = G.P; R_PARTS = R.parts;
  if (R.W !== W) { R.W = W; R.chunks.clear(); R.statics = buildStatics(W); }
  // события → всплывающие числа и частицы
  for (const e of G.ev) {
    if (e.k === 'dmg') R.floats.push({ x: e.x + (Math.random() - 0.5) * 16, y: e.y, s: String(Math.round(e.v)), col: e.bleed ? '#ff5a5a' : e.crit ? '#ffd34d' : '#fff', big: e.crit, t: 0.9 });
    if (e.k === 'coins') R.floats.push({ x: P.x, y: P.y - 64, s: '+' + money(e.v), col: '#ffd34d', t: 1.4 });
    if (e.k === 'txt') R.floats.push({ x: e.x, y: e.y, s: e.s, col: e.col, t: 1.4 });
    if (e.k === 'hdmg') { R.floats.push({ x: P.x + (Math.random() - 0.5) * 20, y: P.y - 50, s: '−' + Math.round(e.v), col: '#ff6a5a', t: 0.9 }); R.shake = Math.max(R.shake, 0.12); }
    if (e.k === 'lvl') { for (let i = 0; i < 40; i++) R.parts.push(part(P.x, P.y - 20, ['#ffd34d', '#fff2a0', '#c8a0ff'])); R.floats.push({ x: P.x, y: P.y - 80, s: `Уровень ${e.L}!`, col: '#ffd34d', big: true, t: 2.4 }); }
  }
  const zw = cv.width / R.cam.z, zh = cv.height / R.cam.z;
  R.cam.x += (P.x - R.cam.x) * 0.18; R.cam.y += (P.y - 30 - R.cam.y) * 0.18;
  if (Math.abs(P.x - R.cam.x) > 600) { R.cam.x = P.x; R.cam.y = P.y - 30; }
  const sh = R.shake > 0 ? (R.shake -= 1 / 60, 3) : 0;
  const x0 = R.cam.x - zw / 2 + (Math.random() - 0.5) * sh, y0 = R.cam.y - zh / 2 + (Math.random() - 0.5) * sh;
  c.setTransform(R.cam.z, 0, 0, R.cam.z, -x0 * R.cam.z, -y0 * R.cam.z);
  c.imageSmoothingEnabled = true;
  c.fillStyle = '#1c2a1a'; c.fillRect(x0, y0, zw, zh);
  // земля
  for (let i = Math.floor(x0 / CHUNK); i <= Math.floor((x0 + zw) / CHUNK); i++)
    for (let j = Math.floor(y0 / CHUNK); j <= Math.floor((y0 + zh) / CHUNK); j++) {
      if (i < -1 || j < -1 || i * CHUNK > W.W + CHUNK || j * CHUNK > W.H + CHUNK) continue;
      c.drawImage(chunk(R, i, j), i * CHUNK, j * CHUNK, CHUNK + 1, CHUNK + 1);
    }
  const t = now / 1000, vis = (x, y, m = 200) => x > x0 - m && x < x0 + zw + m && y > y0 - m && y < y0 + zh + m * 1.5;
  // кольцо под целью
  if (P.target && P.target.state !== 'dead') { const m = P.target; c.strokeStyle = lvlColor(m.lvl, G.hero.lvl); c.lineWidth = 2.5; c.globalAlpha = 0.85; c.beginPath(); c.ellipse(m.x, m.y + 2, m.r + 10, (m.r + 10) * 0.42, 0, 0, 7); c.stroke(); c.globalAlpha = 1; }
  // предупреждения об ударах по площади
  for (const f of G.fx) if (f.k === 'tele') { const q = 1 - f.t / f.max; c.fillStyle = `rgba(255,80,40,${0.12 + q * 0.18})`; c.strokeStyle = 'rgba(255,120,60,.8)'; c.lineWidth = 2; c.beginPath(); c.ellipse(f.x, f.y, f.r, f.r * 0.5, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = 'rgba(255,80,40,.25)'; c.beginPath(); c.ellipse(f.x, f.y, f.r * q, f.r * q * 0.5, 0, 0, 7); c.fill(); }
  // предметы по глубине
  const L = [];
  for (const s of R.statics) if (vis(s.lx ?? s.x ?? R.cam.x, s.y, 400)) L.push(s);
  for (const tr of treesIn(W, x0 - 150, y0 - 60, x0 + zw + 150, y0 + zh + 240)) L.push({ y: tr.y, tree: tr });
  for (const k of G.corpses) if (vis(k.x, k.y)) L.push({ y: k.y - 1, corpse: k });
  for (const v of G.veins || []) if ((!v.at || v.at <= G.t) && vis(v.x, v.y)) { const sp = sprite('vein|' + v.metal + '|' + (v.s % 5), 110, 90, 55, 70, 2, gg => vein(gg, v.metal, v.s % 5 + 1)); L.push({ y: v.y, x: v.x, oc: occ(sp, v.x, v.y), draw: (g, t) => { drawSpr(g, sp, v.x, v.y); g.save(); g.translate(v.x, v.y); glint(g, v.metal, t, v.s % 7); g.restore(); } }); }
  for (const m of G.mobs) if (m.state !== 'dead' && vis(m.x, m.y)) L.push({ y: m.y, mob: m });
  L.push({ y: P.y, hero: true });
  L.sort((a, b) => a.y - b.y);
  const look = lookOf(G.hero);
  const see = P.dead ? [] : [[P.x, P.y], ...G.mobs.filter(m => m.state === 'chase' && dist(m.x, m.y, P.x, P.y) < 500).map(m => [m.x, m.y])];
  const fdt = Math.min(0.1, Math.max(0, t - (R.lastT || t))); R.lastT = t;
  for (const o of L) {
    if (o.tree) { const tr = o.tree, sp = treeSpr(tr.kind, tr.v), fade = !P.dead && Math.abs(P.x - tr.x) < 26 * tr.s * TREE_K && P.y < tr.y - 4 && P.y > tr.y - 80 * tr.s * TREE_K ? 0.42 : 1; drawSpr(c, sp, tr.x, tr.y, fade, tr.s); }
    else if (o.mob) drawMob(c, G, o.mob, t);
    else if (o.hero) drawHero(c, G, look, t);
    else if (o.corpse) drawCorpse(c, o.corpse, t);
    else if (o.oc) { // постройка, стена, скала, шатёр: прозрачнее, если за ней герой
      const want = hides(o, see); o.fa = o.fa == null ? want : o.fa + (want - o.fa) * Math.min(1, fdt * 8);
      if (o.fa < 0.99) { c.save(); c.globalAlpha = o.fa; o.draw(c, t); c.restore(); } else o.draw(c, t);
    }
    else o.draw(c, t);
  }
  // выстрелы
  for (const s of G.shots) {
    if (s.kind === 'net') { const a = (performance.now() / 120) % 6.28; c.save(); c.translate(s.x, s.y); c.rotate(a); c.strokeStyle = '#e8dcc0'; c.lineWidth = 1.4; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(-10, i * 6); c.lineTo(10, i * 6); c.moveTo(i * 6, -10); c.lineTo(i * 6, 10); c.stroke(); } c.fillStyle = '#a8845a'; for (const [x, y] of [[-10, -10], [10, -10], [-10, 10], [10, 10]]) { c.beginPath(); c.arc(x, y, 2.4, 0, 7); c.fill(); } c.restore(); continue; }
    if (s.kind === 'bottle') { const a = performance.now() / 90; c.save(); c.translate(s.x, s.y); c.rotate(a); c.fillStyle = '#6a8a6a'; c.strokeStyle = '#24180f'; c.lineWidth = 1; c.beginPath(); c.ellipse(0, 0, 4, 6, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#ffb347'; c.beginPath(); c.moveTo(-2, -6); c.quadraticCurveTo(0, -14, 2, -6); c.fill(); c.restore(); if (Math.random() < 0.6) R.parts.push({ x: s.x, y: s.y, vx: (Math.random() - 0.5) * 20, vy: -20, t: 0.4, col: Math.random() < 0.5 ? '#ff7a2a' : '#ffd34d', s: 2.5 }); continue; }
    if (s.kind === 'spore') { for (let i = 0; i < 5; i++) { const a = performance.now() / 200 + i * 1.26; c.fillStyle = `rgba(210,232,140,${0.75 - i * 0.1})`; c.beginPath(); c.arc(s.x + Math.cos(a) * 5, s.y + Math.sin(a) * 4, 4.5 - i * 0.4, 0, 7); c.fill(); } if (Math.random() < 0.5) R.parts.push({ x: s.x, y: s.y, vx: (Math.random() - 0.5) * 30, vy: -20, t: 0.5, col: '#c8e070', s: 2.4 }); continue; }
    if (s.kind === 'curse') { const g2 = c.createRadialGradient(s.x, s.y, 1, s.x, s.y, 14); g2.addColorStop(0, 'rgba(200,255,220,1)'); g2.addColorStop(0.5, 'rgba(120,255,170,.85)'); g2.addColorStop(1, 'rgba(60,200,120,0)'); c.fillStyle = g2; c.beginPath(); c.arc(s.x, s.y, 14, 0, 7); c.fill(); if (Math.random() < 0.6) R.parts.push({ x: s.x, y: s.y, vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30, t: 0.4, col: '#9affc8', s: 2.2 }); continue; }
    if (s.kind === 'frost') { const a = Math.atan2(s.vy, s.vx); c.save(); c.translate(s.x, s.y); c.rotate(a); const g = c.createRadialGradient(0, 0, 1, 0, 0, 14); g.addColorStop(0, 'rgba(230,248,255,1)'); g.addColorStop(1, 'rgba(120,190,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 14, 0, 7); c.fill(); c.fillStyle = '#e8f8ff'; c.strokeStyle = '#4a8ac0'; c.lineWidth = 1; c.beginPath(); c.moveTo(12, 0); c.lineTo(-6, -4); c.lineTo(-2, 0); c.lineTo(-6, 4); c.closePath(); c.fill(); c.stroke(); c.restore(); if (Math.random() < 0.5) R.parts.push({ x: s.x, y: s.y, vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20, t: 0.4, col: '#cfeaff', s: 2 }); continue; }
    if (s.kind === 'arrow') { const a = Math.atan2(s.vy, s.vx); c.save(); c.translate(s.x, s.y); c.rotate(a); c.strokeStyle = '#24180f'; c.lineWidth = 3; c.beginPath(); c.moveTo(-14, 0); c.lineTo(6, 0); c.stroke(); c.strokeStyle = s.from === 'mob' ? '#8a5a3a' : s.red ? '#d83a3a' : '#e8e0cc'; c.lineWidth = 1.6; c.stroke(); c.fillStyle = s.red ? '#ff6a6a' : '#cfd8de'; c.beginPath(); c.moveTo(9, 0); c.lineTo(4, -3); c.lineTo(4, 3); c.fill(); c.restore(); }
    else { const big = s.kind === 'fire', rr = s.big ? 22 : big ? 15 : 10, g = c.createRadialGradient(s.x, s.y, 1, s.x, s.y, rr); g.addColorStop(0, big ? 'rgba(255,240,160,1)' : 'rgba(220,240,255,1)'); g.addColorStop(0.45, big ? 'rgba(255,140,40,.9)' : 'rgba(120,180,255,.85)'); g.addColorStop(1, 'rgba(255,60,20,0)'); c.fillStyle = g; c.beginPath(); c.arc(s.x, s.y, rr, 0, 7); c.fill(); if (Math.random() < 0.5) R.parts.push({ x: s.x, y: s.y, vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30, t: 0.35, col: big ? '#ffb347' : '#9ad0ff', s: 2.5 }); }
  }
  // эффекты
  for (const f of G.fx) {
    if (f.k === 'ring') { const q = 1 - f.t / 0.35; c.strokeStyle = f.col; c.globalAlpha = 1 - q; c.lineWidth = 6; c.beginPath(); c.ellipse(f.x, f.y, f.r + (f.max - f.r) * q, (f.r + (f.max - f.r) * q) * 0.5, 0, 0, 7); c.stroke(); c.globalAlpha = 1; }
    if (f.k === 'boom' && f.t > 0.3) for (let i = 0; i < (f.big ? 30 : 14); i++) R.parts.push(part(f.x, f.y, ['#ffd34d', '#ff7a2a', '#cf4b3f']));
    if (f.k === 'bolt') { const q = f.t / f.max; c.strokeStyle = `rgba(255,240,140,${q})`; c.lineWidth = 3; c.beginPath(); c.moveTo(f.x, f.y); const n = 6; for (let i = 1; i <= n; i++) { const k = i / n; c.lineTo(f.x + (f.x2 - f.x) * k + (i < n ? (Math.random() - 0.5) * 22 : 0), f.y + (f.y2 - f.y) * k + (i < n ? (Math.random() - 0.5) * 22 : 0)); } c.stroke(); c.strokeStyle = `rgba(255,255,255,${q})`; c.lineWidth = 1.2; c.stroke(); }
    if (f.k === 'trail') { c.fillStyle = `rgba(255,240,200,${f.t * 1.4})`; c.beginPath(); c.ellipse(f.x, f.y - 14, 12, 18, 0, 0, 7); c.fill(); }
    if (f.k === 'spawn') { c.fillStyle = `rgba(255,255,255,${f.t})`; c.beginPath(); c.ellipse(f.x, f.y, 26 * (1.4 - f.t), 10, 0, 0, 7); c.fill(); }
  }
  if (P.whirl > 0) for (let k = 0; k < 3; k++) { c.strokeStyle = `rgba(255,240,200,${0.45 - k * 0.12})`; c.lineWidth = 9 - k * 3; const a0 = now / 90 + k * 0.8; c.beginPath(); c.ellipse(P.x, P.y - 14, 70 + k * 7, (70 + k * 7) * 0.6, 0, a0, a0 + 3.2); c.stroke(); }
  // частицы
  for (const p of R.parts) { p.t -= 1 / 60; p.x += p.vx / 60; p.y += p.vy / 60; p.vy += 300 / 60; c.globalAlpha = Math.max(0, p.t * 2); c.fillStyle = p.col; c.fillRect(p.x, p.y, p.s, p.s); }
  c.globalAlpha = 1; R.parts = R.parts.filter(p => p.t > 0);
  // туман Грибного леса: лёгкий везде, густые клочья в низинах (полоски здоровья и уровни рисуются поверх)
  if (W.Z.fog) { const dense = W.Z.fog.filter(([x, y, R]) => x + R > x0 - 100 && x - R < x0 + zw + 100 && y + R > y0 - 100 && y - R < y0 + zh + 100); // рисуется в холст в 4 раза меньше и растягивается — туман мягкий, а кадр дешевле
    const k = 0.25, fw = Math.ceil(zw * k) + 2, fh = Math.ceil(zh * k) + 2; let fc = R.fogCv; if (!fc || fc.width !== fw || fc.height !== fh) { fc = R.fogCv = document.createElement('canvas'); fc.width = fw; fc.height = fh; }
    const q = fc.getContext('2d'); q.setTransform(1, 0, 0, 1, 0, 0); q.clearRect(0, 0, fw, fh); q.setTransform(k, 0, 0, k, -x0 * k, -y0 * k); FOR.fog(q, x0, y0, zw, zh, t * 8, dense);
    c.drawImage(fc, x0, y0, fw / k, fh / k); }
  // подписи построек
  c.textAlign = 'center';
  const bar = barRect(), z = R.cam.z / R.dpr;
  for (const s of R.statics) if (s.label && vis(s.lx, s.ly, 100)) { const sx = (s.lx - x0) * z, sy = (s.ly - y0) * z; if (bar && sx > bar.left - 90 && sx < bar.right + 90 && sy > bar.top - 14) continue; label(c, s.label, s.lx, s.ly, '#ffe9a8', 15); }
  // название жилы вблизи — цветом по навыку (как в WoW)
  for (const v of G.veins || []) if ((!v.at || v.at <= G.t) && dist(v.x, v.y, P.x, P.y) < 320 && !(P.mine && P.mine.v === v)) { const col = MINE.colorHex[miningSkill(G.hero) ? veinColor(miningSkill(G.hero), ORES[v.metal].req).c : 'gray']; label(c, ORES[v.metal].vein, v.x, v.y + 22, col, 13); }
  // таблички над мобами
  for (const m of G.mobs) if (m.state !== 'dead' && vis(m.x, m.y) && (m === P.target || m.state === 'chase' || m.hp < m.max || dist(m.x, m.y, P.x, P.y) < 260)) plate(c, G, m);
  // подсказка «E»
  const it = !P.dead && interactTarget(G);
  if (it && !P.mine) label(c, it.k === 'b' ? `E — ${it.b.name}` : it.k === 'exit' ? 'E — дорога' : it.k === 'vein' ? 'E — копать' : 'E — обыскать', P.x, P.y - 78, '#fff2a0', 14);
  // полоска копания
  if (P.mine) { const q = Math.min(1, P.mine.t / P.mine.max), x = P.x - 40, y = P.y - 86; c.fillStyle = 'rgba(20,14,8,.9)'; c.fillRect(x - 1, y - 1, 82, 10); c.fillStyle = '#e0a060'; c.fillRect(x, y, 80 * q, 8); label(c, ORES[P.mine.v.metal].ore, P.x, y - 5, '#ffe9a8', 13); }
  // всплывающие числа
  for (const f of R.floats) { f.t -= 1 / 60; f.y -= 32 / 60; c.globalAlpha = Math.min(1, f.t * 2); label(c, f.s, f.x, f.y, f.col, f.big ? 22 : 15, true); }
  c.globalAlpha = 1; R.floats = R.floats.filter(f => f.t > 0);
}

let BAR = null, BAR_T = 0;
function barRect() { const n = performance.now(); if (n - BAR_T > 1000) { BAR_T = n; const e = typeof document !== 'undefined' && document.getElementById('relicBar'); BAR = e ? e.getBoundingClientRect() : null; } return BAR; }

function part(x, y, cols) { const a = Math.random() * 6.28, s = 60 + Math.random() * 160; return { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 120, t: 0.5 + Math.random() * 0.5, col: cols[Math.floor(Math.random() * cols.length)], s: 2.5 }; }

function label(c, s, x, y, col, size, bold) {
  c.font = `${bold ? 'bold ' : ''}${size}px Georgia, 'Times New Roman', serif`; c.textAlign = 'center';
  c.lineWidth = 4; c.strokeStyle = 'rgba(20,14,8,.9)'; c.strokeText(s, x, y); c.fillStyle = col; c.fillText(s, x, y);
}

function plate(c, G, m) {
  const y = m.y - (m.D.humanoid ? 62 * (MOB_SCALE[m.kind] || 1) : BAR_H[m.kind] || 44) - (m.D.rare ? 14 : 0), w = m.D.rare ? 64 : 46;
  const col = lvlColor(m.lvl, G.hero.lvl);
  c.font = 'bold 12px Georgia, serif'; c.textAlign = 'center'; c.lineWidth = 3; c.strokeStyle = 'rgba(20,14,8,.9)';
  const txt = (m.D.rare ? '★ ' : '') + m.lvl;
  c.strokeText(txt, m.x - w / 2 - 9, y + 5); c.fillStyle = col; c.fillText(txt, m.x - w / 2 - 9, y + 5);
  c.fillStyle = 'rgba(20,14,8,.85)'; c.fillRect(m.x - w / 2 - 1, y - 1, w + 2, 7);
  c.fillStyle = m.state === 'return' ? '#9a9a9a' : '#c8323a'; c.fillRect(m.x - w / 2, y, w * Math.max(0, m.hp / m.max), 5);
  if (m.bleed) { const dx = m.x + w / 2 + 8; c.fillStyle = '#e83a3a'; c.strokeStyle = '#24180f'; c.lineWidth = 1; c.beginPath(); c.moveTo(dx, y - 5); c.quadraticCurveTo(dx + 5, y + 2, dx, y + 6); c.quadraticCurveTo(dx - 5, y + 2, dx, y - 5); c.fill(); c.stroke(); }
  if (m === G.P.target || m.D.rare) { c.font = '12px Georgia, serif'; c.strokeText(m.D.name, m.x, y - 6); c.fillStyle = m.D.rare ? '#ffb347' : '#f4ecd8'; c.fillText(m.D.name, m.x, y - 6); }
}

function mobFrame(kind, view, mode, f) { return MOB_LOOK[kind] ? personSpr(MOB_LOOK[kind], view, mode, f) : beastSpr(kind, view, mode, f); }
const frameOf = (mode, k) => Math.min(FRAMES[mode] - 1, Math.max(0, Math.floor(k * FRAMES[mode])));

function drawMob(c, G, m, t) {
  const hum = !!MOB_LOOK[m.kind], sc = MOB_SCALE[m.kind] || 1;
  let dx = m.mdx, dy = m.mdy;
  if (!m.moving && (m.state === 'chase' || m.atkT > 0)) { dx = G.P.x - m.x; dy = G.P.y - m.y; }
  const view = viewOf(dx, dy), dir = view === 'side' ? (dx < 0 ? -1 : 1) : 1;
  const mode = m.atkT > 0 ? 'atk' : m.moving ? 'walk' : 'idle';
  const f = mode === 'atk' ? frameOf('atk', 1 - m.atkT / (m.atkDur || 0.35)) : mode === 'walk' ? frameOf('walk', m.walkPh) : 0;
  const sp = mobFrame(m.kind, view, mode, f);
  if (hum) { c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(m.x, m.y + 2, 14 * sc, 5 * sc, 0, 0, 7); c.fill(); }
  c.save(); if (m.state === 'return') c.globalAlpha = 0.6;
  if (m.burn) { c.fillStyle = 'rgba(255,120,40,.3)'; c.beginPath(); c.arc(m.x, m.y - 12, 18, 0, 7); c.fill(); }
  if (m.bleed && Math.random() < 0.25) R_PARTS && R_PARTS.push({ x: m.x + (Math.random() - 0.5) * m.r, y: m.y - m.r * 1.2, vx: (Math.random() - 0.5) * 20, vy: -30, t: 0.5, col: Math.random() < 0.5 ? '#c41a1a' : '#e83a3a', s: 2.6 });
  const breathe = mode === 'idle' ? Math.sin(t * 2 + m.walkPh * 6) * 0.4 : 0;
  drawFrame(c, m.hurt > 0 ? flashOf(sp) : sp, m.x - (m.hurt > 0 ? dir * 2 : 0), m.y + breathe, dir, sc, m.state === 'return' ? 0.6 : 1);
  c.restore();
  const tt = performance.now() / 1000, top = m.y - (m.D.humanoid ? 58 * sc : (BAR_H[m.kind] || 44) - 10);
  if (m.chill > 0) { c.fillStyle = 'rgba(140,200,255,.28)'; c.beginPath(); c.ellipse(m.x, m.y - 12, m.r + 8, m.r + 2, 0, 0, 7); c.fill(); c.fillStyle = '#e8f8ff'; for (let i = 0; i < 3; i++) { const q = (tt * 0.8 + i / 3) % 1; c.fillRect(m.x - 10 + i * 10, m.y - 6 - q * 30, 2, 2); } }
  if (m.root > 0) { c.strokeStyle = 'rgba(232,220,192,.9)'; c.lineWidth = 1.2; const w = m.r + 8; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(m.x - w, m.y - 10 + i * 6); c.quadraticCurveTo(m.x, m.y - 4 + i * 6, m.x + w, m.y - 10 + i * 6); c.stroke(); c.beginPath(); c.moveTo(m.x + i * 7, m.y - 26); c.lineTo(m.x + i * 8, m.y + 4); c.stroke(); } }
  if (m.stun > 0) for (let i = 0; i < 3; i++) { const a = tt * 4 + i * 2.09, x = m.x + Math.cos(a) * 12, y = top + Math.sin(a) * 4; c.fillStyle = '#ffe066'; c.strokeStyle = '#24180f'; c.lineWidth = 0.8; c.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 1.6 : 4, b = k * Math.PI / 5; c.lineTo(x + Math.cos(b) * r, y + Math.sin(b) * r); } c.closePath(); c.fill(); c.stroke(); }
}

const PICK_P = palette('common', 11);
function drawHero(c, G, look, t) {
  const P = G.P;
  // куда смотрит: при ударе и рывке — на цель, иначе — куда шёл
  const aim = P.atkT > 0 || P.dash || P.mine, dx = aim ? Math.cos(P.face) : P.mvx, dy = aim ? Math.sin(P.face) : P.mvy;
  const view = viewOf(dx, dy), dir = view === 'side' ? (Math.abs(dx) > 0.05 ? (dx < 0 ? -1 : 1) : P.dir) : 1;
  const mode = P.dead ? 'dead' : (P.atkT > 0 || P.mine) ? 'atk' : (P.moving || P.dash) ? 'walk' : 'idle';
  const f = mode === 'dead' ? frameOf('dead', P.deadT / 0.7) : mode === 'atk' ? frameOf('atk', P.mine ? (P.mine.t / 0.6) % 1 : 1 - P.atkT / P.atkDur) : mode === 'walk' ? frameOf('walk', (P.step / 3) % 1) : 0;
  c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(P.x, P.y + 2, 15, 5, 0, 0, 7); c.fill();
  const B = P.buf || {};
  if (B.stone > 0) { c.strokeStyle = 'rgba(190,185,170,.85)'; c.lineWidth = 4; c.beginPath(); c.ellipse(P.x, P.y - 18, 24, 30, 0, 0, 7); c.stroke(); c.fillStyle = 'rgba(160,155,140,.18)'; c.fill(); }
  if (B.rage > 0) { c.fillStyle = `rgba(255,70,40,${0.18 + 0.08 * Math.sin(t * 12)})`; c.beginPath(); c.ellipse(P.x, P.y - 18, 26, 32, 0, 0, 7); c.fill(); }
  if (B.wind > 0) { c.strokeStyle = 'rgba(220,240,255,.7)'; c.lineWidth = 1.6; for (let i = 0; i < 3; i++) { const yy = P.y - 8 - i * 12; c.beginPath(); c.moveTo(P.x - P.mvx * 20 - 6, yy); c.lineTo(P.x - P.mvx * 46 - 14, yy + (i - 1) * 3); c.stroke(); } }
  if (B.thorns > 0) { c.fillStyle = '#c8b890'; c.strokeStyle = '#24180f'; c.lineWidth = 0.8; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283 + t; const x = P.x + Math.cos(a) * 22, y = P.y - 16 + Math.sin(a) * 26; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 9, y + Math.sin(a) * 9); c.lineTo(x + Math.cos(a + 1.5) * 3, y + Math.sin(a + 1.5) * 3); c.closePath(); c.fill(); c.stroke(); } }
  if (P.weak > 0) { c.strokeStyle = 'rgba(160,160,255,.5)'; c.lineWidth = 2; c.beginPath(); c.ellipse(P.x, P.y + 2, 20, 8, 0, 0, 7); c.stroke(); }
  if (P.sit) { // сидит: ноги поджаты, тело ниже
    const sp = personSpr(look, 'side', 'idle', 0), lc = legColor(look);
    c.save(); c.beginPath(); c.rect(P.x - 60, P.y - 120, 120, 120 + 5); c.clip(); drawFrame(c, sp, P.x, P.y + 7, P.dir, 1.15); c.restore();
    c.fillStyle = lc; c.strokeStyle = '#24180f'; c.lineWidth = 1.2; for (const ox of [-7, 7]) { c.beginPath(); c.ellipse(P.x + ox * P.dir, P.y + 7, 8, 4, 0, 0, 7); c.fill(); c.stroke(); }
    c.fillStyle = 'rgba(160,220,255,.7)'; const q = (t * 0.7) % 1; c.globalAlpha = 1 - q; c.font = 'bold 11px Georgia'; c.fillText('z', P.x + 14, P.y - 40 - q * 16); c.globalAlpha = 1;
    return;
  }
  if (P.mine) look = { ...look, weapon: { m: 'pick', P: PICK_P }, swing: 'chop', key: look.key + '|pick' };
  const sp = personSpr(look, view, mode, f), breathe = mode === 'idle' ? Math.sin(t * 2) * 0.4 : 0;
  drawFrame(c, P.hurt > 0 ? flashOf(sp) : sp, P.x - (P.hurt > 0 && view === 'side' ? dir * 2 : 0), P.y + breathe, dir, 1.15, P.dead ? Math.max(0.35, 1 - P.deadT / 3) : 1);
  if (P.poison) { c.fillStyle = 'rgba(120,220,80,.6)'; for (let i = 0; i < 3; i++) c.fillRect(P.x - 10 + i * 9, P.y - 60 - ((t * 40 + i * 13) % 20), 3, 3); }
  if (P.mine) mineSparks(c, P);
}

// искры и каменная крошка в миг удара киркой (каждый удар — своя россыпь)
function mineSparks(c, P) {
  const v = P.mine.v, ph = P.mine.t / 0.6, n = Math.floor(ph), q = (ph - n - 0.5) / 0.4; if (q < 0 || q > 1) return;
  const hx = P.x + (v.x - P.x) * 0.55, hy = Math.min(P.y, v.y) - 22, r = rng((n + 1) * 7919 + (v.s || 0));
  for (let i = 0; i < 9; i++) { // искры: короткие светлые черты, гаснут
    const a = -Math.PI / 2 + (r() - 0.5) * 2.6, sp = 30 + r() * 40, d = sp * q, x = hx + Math.cos(a) * d, y = hy + Math.sin(a) * d + 30 * q * q;
    c.strokeStyle = `rgba(255,${200 + (i % 3) * 20},120,${1 - q})`; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, y); c.lineTo(x - Math.cos(a) * 5, y - Math.sin(a) * 5); c.stroke();
  }
  for (let i = 0; i < 5; i++) { // крошка: серые камушки летят дугой и падают
    const a = -Math.PI / 2 + (r() - 0.5) * 2.2, sp = 18 + r() * 22, x = hx + Math.cos(a) * sp * q, y = hy + Math.sin(a) * sp * q + 70 * q * q, s = 1.6 + r() * 1.6;
    c.fillStyle = i % 2 ? '#8c8478' : '#a39b8e'; c.strokeStyle = '#24180f'; c.lineWidth = 0.6; c.beginPath(); c.rect(x - s, y - s, s * 2, s * 1.6); c.fill(); c.stroke();
  }
}

// тело моба: лежит на боку; если в нём есть добыча — над ним мерцает искорка цвета лучшей вещи
function drawCorpse(c, k, t) {
  const a = Math.min(1, k.t / 1.5);
  if (!k.kind) drawBag(c, k.x, k.y, t);
  else {
    const sc = MOB_SCALE[k.kind] || 1, view = viewOf(k.vx || 0, k.vy || 1), dir = view === 'side' ? (k.vx < 0 ? -1 : 1) : 1;
    const sp = mobFrame(k.kind, view, 'dead', frameOf('dead', (LOOT.corpseT - k.t) / 0.7));
    drawFrame(c, sp, k.x, k.y, dir, sc, a * 0.95);
    c.save(); c.globalAlpha = a * 0.5; c.fillStyle = 'rgba(30,20,12,.5)'; c.beginPath(); c.ellipse(k.x, k.y + 2, 20 * sc, 6 * sc, 0, 0, 7); c.fill(); c.restore();
  }
  if (k.money > 0 || k.items.length) {
    const best = k.items.reduce((b, it) => (RAR_IDX[it.rar] > RAR_IDX[b] ? it.rar : b), 'start');
    const col = k.items.length ? (best === 'common' || best === 'start' ? '#fff2c0' : RAR_COL[best]) : '#ffd34d';
    const q = 0.6 + 0.4 * Math.sin(t * 5 + k.id), y = k.y - 26 - Math.sin(t * 2.5 + k.id) * 3;
    const g = c.createRadialGradient(k.x, y, 0.5, k.x, y, 20); g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.globalAlpha = q * a; c.fillStyle = g; c.beginPath(); c.arc(k.x, y, 20, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.moveTo(k.x, y - 7); c.lineTo(k.x + 1.6, y - 1.6); c.lineTo(k.x + 7, y); c.lineTo(k.x + 1.6, y + 1.6); c.lineTo(k.x, y + 7); c.lineTo(k.x - 1.6, y + 1.6); c.lineTo(k.x - 7, y); c.lineTo(k.x - 1.6, y - 1.6); c.closePath(); c.fill();
    c.globalAlpha = 1;
  }
}

function drawBag(c, x, y, t) {
  c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(x, y + 2, 12, 4, 0, 0, 7); c.fill();
  const b = Math.sin(t * 3) * 2;
  c.fillStyle = '#8a6a3a'; c.strokeStyle = '#24180f'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x - 10, y); c.quadraticCurveTo(x - 13, y - 14 - b, x - 4, y - 18 - b); c.lineTo(x + 4, y - 18 - b); c.quadraticCurveTo(x + 13, y - 14 - b, x + 10, y); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#ffd34d'; c.beginPath(); c.arc(x, y - 20 - b, 3, 0, 7); c.fill();
}
