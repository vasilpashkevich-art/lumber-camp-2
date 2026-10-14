// Отрисовка мира: земля кусками, предметы по глубине, мобы, герой, выстрелы, эффекты, всплывающие числа.
import { TOUCH } from '../ui/dom.js';
import { LOOK } from '../art/look.js';
import { lairSpr } from '../art/lairs.js';
import { chestBig } from '../art/chest.js';
import { NPC_LOOK, questMark, snare, questGlint } from '../art/npc.js';
import { npcMark } from '../systems/quests.js';
import { legColor, person } from '../art/body.js';
import { palette } from '../art/gear.js';
import { field, river as riverArt, bridge, haystack, millBase, millBlades, well } from '../art/farmland.js';
import { BLD } from '../art/bld.js';
import { castle, stairs, brazierFire, paving, roundPlaza, ringPath, fountain, lamp, flowerbed, terrace, wallSeg, roundTower, merlons, cone } from '../art/castle.js';
import { house, inn, tavern, enchant, barn, miners, forge, farmstead, bank, herbal } from '../art/houses.js';
import { bush, herbGlint, pickLeaves, herbBurst, drinkFx } from '../art/herbs.js';
import { cityGround, wallFace as wallFace0, wallTop as wallTop0, wallSide as wallSide0, tower as cityTower0, gatehouse as gatehouse0, drawYardItem, FOOT } from '../art/city.js';
import * as TC from '../art/tcity.js';
import * as TM from '../art/tmarket.js';
import { TBLD as TB2, TVIL } from '../art/tbld.js';
import * as TP from '../art/tprops.js';
import * as TL from '../art/tlairs.js';
import * as TF from '../art/tforest.js';
const oldLairs = () => typeof window !== 'undefined' && window.__oldLairs;
const oldProps = () => typeof window !== 'undefined' && window.__oldProps;
// v101: постройки столицы — в мультяшном стиле по одной (tbld.js); прежние — window.__oldBld = true
const oldBld = () => typeof window !== 'undefined' && window.__oldBld;
// v99: стены и башни столицы — в мультяшном стиле (tcity.js); прежние — window.__oldCity = true
const oldCity = () => typeof window !== 'undefined' && window.__oldCity;
const wallFace = (...a) => (oldCity() ? wallFace0 : TC.wallFace)(...a), wallTop = (...a) => (oldCity() ? wallTop0 : TC.wallTop)(...a), wallSide = (...a) => (oldCity() ? wallSide0 : TC.wallSide)(...a);
const cityTower = (...a) => (oldCity() ? cityTower0 : TC.tower)(...a), gatehouse = (...a) => (oldCity() ? gatehouse0 : TC.gatehouse)(...a);
import { BLD2 } from '../art/bld2.js';
import { HERBS, HERBAL } from '../../data/herbs.js';
import { herbSkill, skillColor } from '../systems/herbs.js';
import { vein, glint, outcrop } from '../art/ore.js';
import { BAR_H } from '../art/beasts.js';
import * as MF from '../art/mobfx.js';
import { entrance as templeEntrance, interior as templeInterior, column as templeColumn, brazier as templeBrazier, restFire, rubble as templeRubble, font as templeFont, throne as templeThrone, portal as templePortal } from '../art/temple.js';
import * as FOR from '../art/forest.js';
import { drawFace, drawRim, drawRampWhole, softGlow, footShadow, TINT, poly as rpoly } from '../art/relief.js';
import { GIANT, giantBase, giantUpper, giantCrown, giantShade } from '../art/giants.js';
import { LH } from '../world/relief.js';
import { ORES, veinColor, MINE } from '../../data/mining.js';
import { miningSkill } from '../systems/mining.js';
import { sprite, styled, PEOPLE_K, drawSpr, flashOf, heroSpr, mobSpr, MOB_SCALE, MOB_LOOK, personSpr, beastSpr, drawFrame, GUARD_LOOK, MERCH_LOOK, viewOf, viewOf8, sideways, sprBox, FRAMES, treeSpr, TREE_K, bldSpr, mountainSpr } from '../art/sprites.js';
import { treesIn, GATE_W } from '../world/world.js';
import { lookOf, fxListOf } from '../systems/items.js';
import { gearFx } from '../art/gearfx.js';
import { interactTarget, abilsOf } from '../systems/game.js';
import { hasTal } from '../systems/talents.js';
import * as V from '../art/vfx.js';
import { lvlColor, RAR_COL, RAR_IDX, LOOT } from '../../data/balance.js';
import { rng, dist, inPoly, money, segDist } from './util.js';

export const ZOOM = { def: 1.25, min: 0.8, max: 2, step: 1.12 };
const CHUNK = 512, CQ = 1.5;   // кусок земли рисуется в 1,5 раза подробнее — не мылится при приближении; в запасе 30 кусков (телефон — 16, ≈ 38 МБ)

export function createRenderer(cv) {
  const ctx = cv.getContext('2d');
  const R = { cv, ctx, chunks: new Map(), cam: { x: 0, y: 0, z: 1 }, floats: [], parts: [], shake: 0, W: null, statics: null, dpr: 1 };
  R.resize = () => {
    const d = Math.min(2, window.devicePixelRatio || 1); R.dpr = d;
    cv.width = Math.round(innerWidth * d); cv.height = Math.round(innerHeight * d);
    cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
    // сколько мира видно: от ширины окна (около 1150 единиц) × выбранное игроком приближение
    R.cam.z = Math.max(0.62, Math.min(1.5, innerWidth / 1150)) * d * R.uz;
  };
  // приближение (v67): по умолчанию 1,25 — герой ближе; колесо мыши и +/− меняют, выбор запоминается
  R.uz = ZOOM.def; try { const v = parseFloat(localStorage.getItem('lumber-camp2-zoom')); if (v >= ZOOM.min && v <= ZOOM.max) R.uz = v; } catch (_) { }
  R.zoom = f => { const v = Math.round(Math.max(ZOOM.min, Math.min(ZOOM.max, R.uz * f)) * 100) / 100; if (v === R.uz) return false; R.uz = v; R.resize(); try { localStorage.setItem('lumber-camp2-zoom', String(v)); } catch (_) { } return true; };
  R.resize();
  return R;
}

// ---------------------------------------------------------------- статичные предметы зоны
/** v86: квадратная столица — стены (лицо и боевой ход), угловые башни, надвратная, восточные ворота, дворец, стража, фонтан, дворы. */
function cityStatics(S, W, c) {
  const C = c.square, th = C.th, H = C.H, cx = c.x, cy = c.y, gw = C.gate.w + 2 * C.gate.towerR;
  const Lw = C.x1 - C.x0 + 2 * th, Lh = C.y1 - C.y0 + 2 * th;
  const put = (key, w, h, ox, oy, x, y, draw, depthY, extra = {}) => { const sp = sprite(key, w, h, ox, oy, 1.6, styled(draw)); S.push({ y: depthY, oc: occ(sp, x, y), soft: x, draw: g => drawSpr(g, sp, x, y), ...extra }); };
  // северная стена: лицо и верх — одной картинкой на всю длину (кусками по 600, чтобы не делать гигантский холст)
  const seg = 600;
  for (let x = 0; x < Lw; x += seg) {
    const w = Math.min(seg, Lw - x), k = Math.round(x / seg);
    put('cwN' + k + '|' + w, w + 20, H + th + 40, 10, H + th + 30, cx + C.x0 - th + x, cy + C.y0, g => { wallFace(g, w, H, 3 + k); g.save(); g.translate(0, -H - th); wallTop(g, w, th, 40 + k, false); g.restore(); }, cy + C.y0 - 1);
    // южная: с проёмом ворот
    const gx0 = C.southGate - gw / 2 - (C.x0 - th), gx1 = gx0 + gw;
    if (x + w <= gx0 || x >= gx1) put('cwS' + k + '|' + w, w + 20, H + th + 40, 10, H + th + 30, cx + C.x0 - th + x, cy + C.y1 + th, g => { wallFace(g, w, H, 8 + k); g.save(); g.translate(0, -H - th); wallTop(g, w, th, 50 + k, true); g.restore(); }, cy + C.y1 + th);
    else { const a = Math.max(0, gx0 - x), b = Math.max(0, x + w - gx1);
      if (a > 0) put('cwSa' + k + '|' + a, a + 20, H + th + 40, 10, H + th + 30, cx + C.x0 - th + x, cy + C.y1 + th, g => { wallFace(g, a, H, 8 + k); g.save(); g.translate(0, -H - th); wallTop(g, a, th, 50 + k, true); g.restore(); }, cy + C.y1 + th);
      if (b > 0) put('cwSb' + k + '|' + b, b + 20, H + th + 40, 10, H + th + 30, cx + C.x0 - th + x + w - b, cy + C.y1 + th, g => { wallFace(g, b, H, 9 + k); g.save(); g.translate(0, -H - th); wallTop(g, b, th, 51 + k, true); g.restore(); }, cy + C.y1 + th); }
  }
  // западная и восточная: верх полосой кусками по 600 (у восточной — проём ворот)
  for (let y = 0; y < Lh; y += seg) {
    const h = Math.min(seg, Lh - y), k = Math.round(y / seg), wy = cy + C.y0 - th - H + y;
    put('cwW' + k + '|' + h, th + 20, h + 20, 10, 10, cx + C.x0 - th, wy, g => wallSide(g, h, th, 60 + k, false), cy + C.y0 + y + h - H - th);
    const gy0 = C.eastGate - gw / 2 - (C.y0 - th), gy1 = gy0 + gw;
    if (y + h <= gy0 || y >= gy1) put('cwE' + k + '|' + h, th + 20, h + 20, 10, 10, cx + C.x1, wy, g => wallSide(g, h, th, 70 + k, true), cy + C.y0 + y + h - H - th);
    else { const a = Math.max(0, gy0 - y), b = Math.max(0, y + h - gy1);
      if (a > 0) put('cwEa' + k + '|' + a, th + 20, a + 20, 10, 10, cx + C.x1, wy, g => wallSide(g, a, th, 70 + k, true), cy + C.y0 + y + a - H - th);
      if (b > 0) put('cwEb' + k + '|' + b, th + 20, b + 20, 10, 10, cx + C.x1, wy + h - b, g => wallSide(g, b, th, 71 + k, true), cy + C.y0 + y + h - H - th); }
  }
  // башни по углам, у восточных ворот, надвратная
  const TR = C.towerR, TH = C.towerH;
  for (const [sx, sy, sd] of [[C.x0 - th / 2, C.y0 - th / 2, 20], [C.x1 + th / 2, C.y0 - th / 2, 21], [C.x0 - th / 2, C.y1 + th / 2, 22], [C.x1 + th / 2, C.y1 + th / 2, 23]])
    put('ctw' + sd, TR * 2.6 + 40, TH + TR * 3, TR * 1.3 + 20, TH + TR * 2.6, cx + sx, cy + sy + TR * 0.3, g => cityTower(g, TR, TH, sd), cy + sy + TR * 0.3);
  const GR = C.gate.towerR, GH = C.gate.towerH;
  for (const sd of [-1, 1]) put('cgE' + sd, GR * 2.6 + 40, GH + GR * 3, GR * 1.3 + 20, GH + GR * 2.6, cx + C.x1 + th / 2, cy + C.eastGate + sd * (C.gate.w / 2 + GR), g => cityTower(g, GR, GH, 12 + sd), cy + C.eastGate + sd * (C.gate.w / 2 + GR) + 10);
  put('cgS', gw + 160, GH + 140, gw / 2 + 80, GH + 120, cx + C.southGate, cy + C.y1 + th, g => gatehouse(g, C.gate.w, GR, H + 10, 30), cy + C.y1 + th + 1);
  // стража у ворот и у дворца
  const K = W.castle;
  for (const sd of [-1, 1]) { const x = cx + C.southGate + sd * 110, y = cy + C.y1 + th + 40; S.push({ y, draw: (g, t) => guard(g, x, y, 'front', 1, t) }); }
  for (const sd of [-1, 1]) { const x = cx + C.x1 + th + 40, y = cy + C.eastGate + sd * 80; S.push({ y, draw: (g, t) => guard(g, x, y, 'side', -1, t) }); }
  if (K) for (const dx of [-56, 56]) S.push({ y: K.y + 14, draw: (g, t) => guard(g, cx + dx, K.y + 14, 'front', 1, t) });
  // фонтан
  if (c.fountain) { const fx = cx + c.fountain.x, fy = cy + c.fountain.y; S.push({ y: fy + 30, x: fx, draw: (g, t) => { g.save(); g.translate(fx, fy); g.scale(0.84, 0.84); (oldProps() ? fountain : TP.fountain)(g, t, 110); g.restore(); } }); }
  // дворы и убранство
  for (const d of c.decor || []) {
    const [k, dx, dy, a] = d, x = cx + dx, y = cy + dy;
    if (k === 'lamp') { const lampSpr = sprite('lamp', 50, 130, 25, 120, 2, oldProps() ? g => { g.scale(0.8, 0.8); lamp(g, 0, false); } : styled(g => { g.scale(0.8, 0.8); TP.lamp(g, 0, false); })); S.push({ y, x, draw: g => drawSpr(g, lampSpr, x, y) }); continue; }
    const sp = sprite('cd|' + k + '|' + (a || 0), 200, 120, 100, 100, 2, styled(g => drawYardItem(g, [k, 0, 0, a], 0)));
    S.push({ y: y + 1, x, draw: g => drawSpr(g, sp, x, y) });
  }
}
function buildStatics(W) {
  const S = [], c = W.cap, r = rng(W.Z.seed + 99);
  if (c && c.square) cityStatics(S, W, c);
  else if (c) {
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
    if (c.fountain) S.push({ y: c.y + 30, x: c.x, draw: (g, t) => { g.save(); g.translate(c.x, c.y); g.scale(0.84, 0.84); (oldProps() ? fountain : TP.fountain)(g, t, 110); g.restore(); } });
    const lampSpr = sprite('lamp', 50, 130, 25, 120, 2, oldProps() ? g => { g.scale(0.8, 0.8); lamp(g, 0, false); } : styled(g => { g.scale(0.8, 0.8); TP.lamp(g, 0, false); }));
    for (const [dx, dy] of c.lamps || []) { const x = c.x + dx, y = c.y + dy; S.push({ y, x, draw: g => drawSpr(g, lampSpr, x, y) }); }
  }
  // постройки столицы и посёлка
  const K = 0.78, big = (key, fn, w = 360, h = 300) => sprite('h|' + key, w, h, w / 2, h - 30, 2, g => { g.scale(K, K); fn(g); });
  const ART = {
    market: () => stallSpr(), stall: () => stallSpr(), cart: () => cartSpr(),
    forge: () => big('forge', forge), tavern: () => big('tavern', tavern), miners: () => big('miners', miners, 420),
    enchant: () => big('enchant', enchant), inn: () => big('inn', inn), barn: () => big('barn', barn), bank: () => big('bank', bank),
    house: v => big('house' + v, g => house(g, v)), herbal: () => big('herbal', herbal),
  };
  // v102: посёлок мультяшными постройками (вид спереди-сверху), ×1,15 — двери 1,2–1,3 роста героя
  const KV = 1.15, vil = (key, fn) => sprite('v|' + key, 460, 440, 230, 400, 1.8, styled(g => { g.scale(KV, KV); fn(g); }));
  if (!oldBld()) Object.assign(ART, { house: v => vil('house' + v, g => TVIL.house(g, v)), inn: () => vil('inn', TVIL.inn), barn: () => vil('barn', TVIL.barn), forge: () => vil('forge', TVIL.forge) });
  const LBLV = { inn: 290, barn: 200, house: 170, forge: 170 };
  // v86: объёмные постройки столицы (мягкий облик), размер картинки — по основанию
  const B2 = (key, v) => { if (key === 'stall' && !oldMarket()) return tStallSpr(); const [w, d, lh] = FOOT[key] || [200, 150, 200]; const pw = w + d * 0.3 + 280, ph = lh + 220; return sprite('b2|' + key + (v || 0), pw, ph, w / 2 + 140, ph - 60, 1.6, styled(g => { if (key === 'stall') { g.save(); g.translate(0, -44); g.scale(PEOPLE_K, PEOPLE_K); person(g, MERCH_LOOK, 'front', {}); g.restore(); } ((!oldBld() && TB2[key]) || BLD2[key])(g, v || 0, 0.4); })); };
  const LBL = { herbal: 185, bank: 205, castle: 455, market: 195, stall: 195, cart: 150, forge: 170, tavern: 210, miners: 200, enchant: 210, inn: 230, barn: 190 };
  for (const b of W.houses) {
    const sq = c && c.square && BLD2[b.art];
    const sp = sq ? B2(b.art, b.v) : ART[b.art] ? ART[b.art](b.v || 0) : null;
    // у объёмных построек рамка заслона — по стенам и крыше, без дыма из трубы (иначе герой на улице перед домом «прячется» за ним)
    const oc = sp && (sq ? (() => { const [w, d, lh] = FOOT[b.art] || [200, 150, 200]; return { x0: b.x - w / 2 - 10, y0: b.y - lh + 30, x1: b.x + w / 2 + (oldBld() ? d * 0.3 : 0) + 10, y1: b.y }; })() : occ(sp, b.x, b.y));
    S.push({ y: b.y, oc, draw: g => sp && drawSpr(g, sp, b.x, b.y), label: b.name, lx: b.x + (sq && oldBld() ? (FOOT[b.art] || [0, 0])[1] * 0.15 : 0), ly: b.y - (sq ? (FOOT[b.art] || [0, 0, 120])[2] : (!oldBld() && LBLV[b.art]) || LBL[b.art] || 120) });
  }
  if (W.village) { const v = W.village, sp = v.well !== false ? sprite('well', 80, 90, 40, 74, 2, oldProps() ? g => well(g) : styled(g => TP.well(g))) : null; S.push({ y: v.y + 10, draw: g => sp && drawSpr(g, sp, v.x, v.y + 10), label: v.name, lx: v.x, ly: v.y - v.R + 30 });
    if (v.camp) { const fx = v.x + 140, fy = v.y + 120; S.push({ y: fy, fire: true, x: fx, draw: (g, t) => campfire(g, fx, fy, t) }); } }
  // кладбище (у стоянки купца в Грибном лесу его нет — возрождение у тележки)
  const gy = W.graveyard;
  if (!gy.hidden) for (let i = 0; i < 9; i++) {
    const x = gy.x - 110 + (i % 3) * 110 + (r() - 0.5) * 20, y = gy.y - 60 + Math.floor(i / 3) * 60 + (r() - 0.5) * 10, cross = r() < 0.5;
    const sp = sprite('grave' + (cross ? 1 : 0), 44, 54, 22, 44, 2, oldProps() ? g => grave(g, cross) : styled(g => TP.grave(g, cross)));
    S.push({ y, draw: g => drawSpr(g, sp, x, y) });
  }
  if (!gy.hidden) S.push({ y: gy.y + 110, label: gy.name, lx: gy.x, ly: gy.y - 110, draw: () => {} });
  // указатели на выходах
  if (W.rooms) {   // v77: убранство подземелья — колонны, жаровни, костёр возрождения, обвалы, сундуки
    const D = W.Z.decor || {}, col = sprite('tcol', 60, 160, 30, 150, 2, g => templeColumn(g, 0, 0, 130, 24, 3));
    for (const [x, y] of D.columns || []) S.push({ y, x, oc: occ(col, x, y), draw: g => drawSpr(g, col, x, y) });
    for (const [x, y] of D.braziers || []) S.push({ y, x, draw: (g, t) => templeBrazier(g, x, y, t) });
    for (const [x, y] of D.rubble || []) { const sp = sprite('trub' + x, 100, 50, 50, 40, 2, g => templeRubble(g, 0, 0, 7, x | 0)); S.push({ y, x, draw: g => drawSpr(g, sp, x, y) }); }
    (D.chests || []).forEach(([x, y], i) => S.push({ y, x, draw: (g, t) => chestBig(g, x, y, !!(W.dg && W.dg.chests[i]), t) }));   // v96: мультяшный сундук   // v90: открытый — по состоянию похода
    if (D.font) S.push({ y: D.font[1] + D.font[2] * 0.5, x: D.font[0], draw: (g, t) => templeFont(g, D.font[0], D.font[1], D.font[2], t) });
    if (D.throne) S.push({ y: D.throne[1], x: D.throne[0], draw: g => templeThrone(g, D.throne[0], D.throne[1]) });
    if (D.portal) S.push({ y: D.portal[1], x: D.portal[0], draw: (g, t) => { if (W.exits.some(e => e.portal)) templePortal(g, D.portal[0], D.portal[1], t); }, label: 'Портал', lx: D.portal[0], ly: D.portal[1] - 130, when: () => W.exits.some(e => e.portal) });
    const gy = W.graveyard; if (gy.fire) S.push({ y: gy.y, x: gy.x, draw: (g, t) => restFire(g, gy.x, gy.y, t), label: 'Костёр', lx: gy.x, ly: gy.y - 60 });
    for (const q of W.rooms) if (q.name) S.push({ y: q.y0 - 60, label: q.name, lx: (q.x0 + q.x1) / 2, ly: q.y0 - 150, draw: () => {} });
  }
  if (W.temple) { const T = W.temple, sp = sprite('temple', 760, 400, 380, 320, 1.5, g => templeEntrance(g, 0)); S.push({ y: T.y, x: T.x, oc: occ(sp, T.x, T.y), label: T.name, lx: T.x, ly: T.y - 330, draw: g => drawSpr(g, sp, T.x, T.y) }); }
  for (const e of W.exits) {
    if (e.temple || e.door) continue;
    const sp = sprite('sign', 120, 110, 60, 90, 2, oldProps() ? g => signpost(g) : styled(g => TP.signpost(g)));
    S.push({ y: e.y, draw: g => drawSpr(g, sp, e.x - 40, e.y), label: `${e.to} · ${e.lvl}`, lx: e.x - 40, ly: e.y - 100 });
  }
  // приметы логов: нора, логово, лёжка, паутина, шатры; у людей — костёр
  for (const cp of W.camps) {
    const sp = lairSpr(cp.lair), ly = cp.y - 10;
    if (sp) S.push({ y: ly, x: cp.x, oc: occ(sp, cp.x, ly), draw: g => drawSpr(g, sp, cp.x, ly) });
    if (cp.lair === 'bandit' || cp.lair === 'ataman' || cp.lair === 'burned') { const fx = cp.x + (cp.lair === 'ataman' ? -140 : 0), fy = cp.y + (cp.lair === 'ataman' ? 46 : 40); S.push({ y: fy, fire: true, x: fx, draw: (g, t) => campfire(g, fx, fy, t) }); }
  }
  // Хуторские угодья: мосты, стога, хутора, мельница
  if (W.river) for (const b of W.river.bridgeAt) { const len = Math.round(b.len), sp = sprite('bridge' + len, 110, len + 40, 55, len / 2 + 20, 2, oldLairs() ? g => bridge(g, len) : styled(g => TL.bridge(g, len))); S.push({ y: b.y - len / 2 + 6, x: b.x, draw: g => { g.save(); g.translate(b.x, b.y); g.rotate(b.ra - Math.PI / 2); drawSpr(g, sp, 0, 0); g.restore(); } }); }
  // Грибной лес: поваленные стволы, папоротники, светящиеся грибочки, камыш у прудов
  for (const p of W.props) {
    if (p.kind === 'log') { const L = Math.round(p.len / 10) * 10, sp = sprite('log|' + L + '|' + (p.s % 4), L + 40, 50, L / 2 + 20, 34, 2, oldLairs() ? g => FOR.fallenLog(g, L, p.s % 4 + 1) : styled(g => TF.fallenLog(g, L, p.s % 4 + 1))); S.push({ y: p.y, x: p.x, oc: occ(sp, p.x, p.y), draw: g => drawSpr(g, sp, p.x, p.y) }); }
    if (p.kind === 'fern') { const sp = sprite('fern|' + (p.s % 6), 50, 34, 25, 24, 2, oldLairs() ? g => FOR.fern(g, 1, p.s % 6 + 1) : styled(g => TF.fern(g, 1, p.s % 6 + 1))); S.push({ y: p.y, x: p.x, draw: g => drawSpr(g, sp, p.x, p.y, 1, p.k) }); }
    if (p.kind === 'glow') S.push({ y: p.y, x: p.x, draw: (g, t) => { g.save(); g.translate(p.x, p.y); (oldLairs() ? FOR : TF).glowShrooms(g, 4, p.s, t); g.restore(); } });
    if (p.kind === 'reeds') { const sp = sprite('reeds|' + (p.s % 5), 40, 44, 20, 38, 2, oldLairs() ? g => FOR.reeds(g, 8, p.s % 5 + 2, 0) : styled(g => TF.reeds(g, 8, p.s % 5 + 2, 0))); S.push({ y: p.y, x: p.x, draw: g => drawSpr(g, sp, p.x, p.y) }); }
  }
  for (const p of W.props) if (p.kind === 'hay') { const sp = sprite('hay', 84, 84, 42, 70, 2, oldProps() ? g => haystack(g) : styled(g => TP.haystack(g))); S.push({ y: p.y, x: p.x, draw: g => drawSpr(g, sp, p.x, p.y) }); }
  for (const f of W.Z.farmsteads || []) { const sp = oldBld() ? sprite('farmst' + (f.burned ? 'B' : ''), 460, 280, 200, 250, 2, g => { g.scale(K, K); farmstead(g, f.burned); }) : sprite('tfarm' + (f.burned ? 'B' : ''), 520, 300, 260, 260, 1.8, styled(g => { g.scale(KV, KV); TVIL.farmstead(g, f.burned); })); S.push({ y: f.y, x: f.x, oc: occ(sp, f.x, f.y), draw: g => drawSpr(g, sp, f.x, f.y) }); if (f.burned) S.push({ y: f.y + 1, x: f.x, draw: (g, t) => smoke(g, f.x + 20, f.y - 60, t) }); }
  if (W.Z.mill) { const m = W.Z.mill, ms = 1.5, nm = !oldBld(), sp = nm ? sprite('tmill', 210, 270, 105, 240, 1.6, styled(g => { g.scale(ms, ms); TVIL.millBase(g); })) : sprite('millbase', 210, 255, 105, 228, 1.6, g => { g.scale(ms, ms); millBase(g, false); }); S.push({ y: m.y, x: m.x, oc: { x0: m.x - 150, y0: m.y - 340, x1: m.x + 150, y1: m.y }, label: 'Старая мельница', lx: m.x, ly: m.y - 300, draw: (g, t) => { drawSpr(g, sp, m.x, m.y); g.save(); g.translate(m.x, m.y - 112 * ms); g.scale(ms, ms); nm ? TVIL.millBlades(g, t * 0.5) : millBlades(g, t * 0.5, false); g.restore(); } }); }
  // скалы и пригорки (v61)
  for (const o of W.rocks || []) { const sp = sprite('rock|' + o.s + '|' + Math.round(o.w), o.w * 1.5 + 40, o.h * 1.4 + 50, o.w * 0.75 + 20, o.h * 1.3 + 20, 1.6, oldLairs() ? g => outcrop(g, o.w, o.h, o.s) : styled(g => TL.outcrop(g, o.w, o.h, o.s))); S.push({ y: o.y, x: o.x, oc: occ(sp, o.x, o.y), draw: g => drawSpr(g, sp, o.x, o.y) }); }
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
// v100: рынок и тележка — в мультяшном стиле (tmarket.js); прежние — window.__oldMarket = true
const oldMarket = () => typeof window !== 'undefined' && window.__oldMarket;
const merchant = g => { g.translate(0, -12.6 * PEOPLE_K); g.scale(PEOPLE_K, PEOPLE_K); person(g, MERCH_LOOK, 'front', {}); };
const tStallSpr = () => sprite('tstall', 280, 260, 140, 225, 1.8, styled(g => TM.stall(g, 0.4, merchant)));
const tCartSpr = () => sprite('tcart', 260, 220, 125, 175, 1.8, styled(g => TM.cart(g, 0.4, merchant)));
function stallSpr() { if (!oldMarket()) return tStallSpr(); return sprite('stallM', 120, 110, 60, 100, 2.2, g => { g.save(); g.translate(0, -7); g.scale(1.2, 1.2); person(g, MERCH_LOOK, 'front', {}); g.restore(); FOR.stallFront(g); FOR.stallTop(g); }); }
function cartSpr() { if (!oldMarket()) return tCartSpr(); return sprite('cartM', 170, 115, 85, 101, 2.2, g => { FOR.cart(g, 0); g.save(); g.translate(46, 6); g.scale(1.25, 1.25); person(g, MERCH_LOOK, 'front', {}); g.restore(); }); }
// городской стражник в полный рост (как герой), чуть дышит
function guard(g, x, y, view, dir, t) {
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, y + 2, 14, 5, 0, 0, 7); g.fill();
  drawFrame(g, personSpr(GUARD_LOOK, view, 'idle', 0), x, y + Math.sin(t * 2 + x) * 0.4, dir, PEOPLE_K);
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
  if (!oldProps()) return TP.campfire(g, x, y, t);
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
  cv = document.createElement('canvas'); cv.width = cv.height = CHUNK * CQ;
  const g = cv.getContext('2d');
  if (W.relief) reliefChunk(R, g, i, j);
  else { g.scale(CQ, CQ); g.translate(-x0, -y0); paintGround(g, W, x0, y0, CHUNK, CHUNK, i, j); }
  R.chunks.set(key, cv); R.built = (R.built || 0) + 1; if (R.chunks.size > (TOUCH ? 16 : 30)) R.chunks.delete(R.chunks.keys().next().value);
  return cv;
}
// земля зоны в прямоугольнике мира (x0, y0, w, h): трава, дороги, ручей, пруды, лагеря; g уже в координатах мира
function paintGround(g, W, x0, y0, CW, CH, i, j) {
  if (W.rooms) { templeInterior(g, W, x0, y0, CW, CH); return; }   // v77: подземелье
  LOOK.use(g);
  LOOK.ground(x0, y0, CW, CH, W.Z.ground, W.Z.seed, 3);
  if (W.Z.moss) { FOR.ground(g, x0, y0, CW, CH, W.Z.seed, false); LOOK.use(g); }
  if (W.creek) { FOR.creek(g, W.creek.pts, W.creek.w); LOOK.use(g); }
  // за краем зоны — тёмный лес и скалы
  g.save(); g.beginPath(); g.rect(x0 - 2, y0 - 2, CW + 4, CH + 4);
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
  for (const [px, py, rx, ry] of W.ponds || []) if (Math.abs(px - (x0 + CW / 2)) < rx + CW && Math.abs(py - (y0 + CH / 2)) < ry + CH) { g.save(); g.translate(px, py); (oldLairs() ? FOR : TF).pond(g, rx, ry, Math.round(px) % 97, 0); g.restore(); LOOK.use(g); }
  const r = rng(i * 7919 + j * 104729 + 5);
  // камушки на дорогах
  for (let k = 0; k < 120 * CH / CHUNK; k++) { const x = x0 + r() * CW, y = y0 + r() * CH; if (W.roadD(x, y) < 28) { g.fillStyle = r() < 0.5 ? 'rgba(120,100,70,.55)' : 'rgba(230,215,180,.5)'; g.beginPath(); g.ellipse(x, y, 2 + r() * 2, 1.4 + r(), 0, 0, 7); g.fill(); } }
  // столица: газоны, плиточные дорожки, площадь у фонтана, терраса дворца, клумбы
  const c = W.cap;
  if (c && c.square && Math.abs(c.x - (x0 + CW / 2)) < c.R + CW && Math.abs(c.y - (y0 + CH / 2)) < c.R + CH) {
    const Q = c.square; g.save(); g.beginPath(); g.rect(c.x + Q.x0, c.y + Q.y0, Q.x1 - Q.x0, Q.y1 - Q.y0); g.clip(); g.translate(c.x, c.y); cityGround(g, c); g.restore();
  } else if (c && Math.abs(c.x - (x0 + CW / 2)) < c.R + CW && Math.abs(c.y - (y0 + CH / 2)) < c.R + CH) {
    g.save(); g.beginPath(); g.arc(c.x, c.y, c.R - 4, 0, 7); g.clip();
    g.fillStyle = 'rgba(110,160,60,.16)'; g.fillRect(x0, y0, CW, CH);
    for (const p of c.paths || []) { g.save(); g.translate(c.x, c.y); g.rotate(p.a); paving(g, 0, -p.w / 2, p.to + 40, p.w, 11 + Math.abs(Math.round(p.a * 10)) + (p.a < 0 ? 40 : 0)); g.restore(); }
    if (c.ring) ringPath(g, c.x, c.y, c.ring.r - c.ring.w / 2, c.ring.r + c.ring.w / 2, 5);
    if (c.fountain) roundPlaza(g, c.x, c.y, c.fountain.plaza, 9);
    if (W.castle) paving(g, c.x - W.castle.terrace, W.castle.y - 10, W.castle.terrace * 2, 68, 13, false);
    for (const [dx, dy, w, h] of c.beds || []) { g.save(); g.translate(c.x + dx, c.y + dy); (oldProps() ? flowerbed : TP.flowerbed)(g, w, h, Math.abs(dx * 3 + dy)); g.restore(); }
    g.restore();
  }
  // посёлок: утоптанная земля
  const v = W.village;
  if (v && Math.abs(v.x - (x0 + CW / 2)) < v.R + CW && Math.abs(v.y - (y0 + CH / 2)) < v.R + CH) {
    const gr = g.createRadialGradient(v.x, v.y, 20, v.x, v.y, v.R); gr.addColorStop(0, 'rgba(150,120,80,.55)'); gr.addColorStop(0.8, 'rgba(150,120,80,.35)'); gr.addColorStop(1, 'rgba(150,120,80,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(v.x, v.y, v.R, 0, 7); g.fill();
  }
  // поля и река (в землю)
  for (const F of W.fields) if (Math.abs(F.x - (x0 + CW / 2)) < (F.w + F.h) / 2 + Math.max(CW, CH) && Math.abs(F.y - (y0 + CH / 2)) < (F.w + F.h) / 2 + Math.max(CW, CH)) field(g, F);
  if (W.river) { const R = W.river, near = R.pts.some(([x, y], i) => i < R.pts.length - 1 && segDist(x0 + CW / 2, y0 + CH / 2, x, y, R.pts[i + 1][0], R.pts[i + 1][1]) < Math.max(CW, CH)); if (near) riverArt(g, R, 0); }
  // кладбище: тёмная земля
  const gy = W.graveyard;
  if (!gy.hidden && Math.abs(gy.x - (x0 + CW / 2)) < 500 && Math.abs(gy.y - (y0 + CH / 2)) < 500) {
    g.fillStyle = 'rgba(60,50,35,.45)'; g.beginPath(); g.ellipse(gy.x, gy.y, 200, 110, 0, 0, 7); g.fill();
    // ограда с калиткой — в сторону ближней дороги
    const ga = gateAngle(W, gy);
    if (!oldProps()) TP.graveFence(g, gy.x, gy.y, 190, 104, ga); else {
    g.strokeStyle = '#4a3a2a'; g.lineWidth = 4; g.setLineDash([10, 8]); g.beginPath(); g.ellipse(gy.x, gy.y, 190, 104, 0, ga + 0.24, ga - 0.24 + Math.PI * 2); g.stroke(); g.setLineDash([]);
    for (const d of [-0.24, 0.24]) { const x = gy.x + Math.cos(ga + d) * 190, y = gy.y + Math.sin(ga + d) * 104; g.fillStyle = '#5a4630'; g.strokeStyle = '#24180f'; g.lineWidth = 1.2; g.beginPath(); g.rect(x - 4, y - 6, 8, 9); g.fill(); g.stroke(); } }
  }
  // вытоптанная земля в лагерях
  for (const cp of W.camps) if (Math.abs(cp.x - (x0 + CW / 2)) < 700 && Math.abs(cp.y - (y0 + CH / 2)) < 700) {
    const gr = g.createRadialGradient(cp.x, cp.y, 10, cp.x, cp.y, cp.r * 0.9); gr.addColorStop(0, 'rgba(120,95,60,.35)'); gr.addColorStop(1, 'rgba(120,95,60,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(cp.x, cp.y, cp.r * 0.9, 0, 7); g.fill();
  }
  // трава и цветы
  for (let k = 0; k < 70 * CH / CHUNK; k++) {
    const x = x0 + r() * CW, y = y0 + r() * CH;
    if (!inPoly(x, y, W.edge) || W.roadD(x, y) < 44 || (W.town && !W.cap && dist(x, y, W.town.x, W.town.y) < W.town.R + 20) || (W.cap && (W.onPave(x, y) || W.blocked(x, y) || (W.cap.square ? W.townD(x, y) < 70 && W.townD(x, y) > 0 : Math.abs(dist(x, y, W.cap.x, W.cap.y) - W.cap.R) < 30))) || (W.ponds && W.ponds.length && W.water(x, y, 6)) || (W.river && W.riverD(x, y) < W.river.w / 2 + 16) || W.inField(x, y, 4)) continue;
    LOOK.tuft(x, y, 0.9 + r() * 0.6, W.Z.ground, r());
  }
}


// ---------------------------------------------------------------- рельеф (v71): земля ярусами
// Кусок экрана (в координатах «мир минус высота»): для каждого яруса снизу вверх — стенки его краёв, верх яруса
// (земля зоны, сдвинутая на высоту, по маске «здесь ярус ≥ L»), склоны и кромки. Земля зоны рисуется один раз
// на кусок с запасом по высоте и кладётся на каждый ярус со сдвигом.
let SCR = null;   // общие черновые холсты: земля, маска
function scratch(k, w, h) { SCR = SCR || {}; let c = SCR[k]; if (!c) c = SCR[k] = document.createElement('canvas'); if (c.width < w || c.height < h) { c.width = Math.max(c.width, w); c.height = Math.max(c.height, h); } const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, c.width, c.height); return [c, g]; }
const bbHit = (b, x0, y0, x1, y1) => b[2] >= x0 && b[0] <= x1 && b[3] >= y0 && b[1] <= y1;
/** Маска «ярус ≥ L» (сдвинутая на −L·LH) в холсте g, уже переведённом в координаты экрана-мира. Возвращает, есть ли что-то в прямоугольнике. */
function levelMask(g, RF, L, x0, y0, x1, y1, exact = false) {
  const dy = -L * LH; let any = false;
  if (exact ? L === 0 : L <= 0) { g.fillStyle = '#fff'; g.fillRect(x0 - 2, y0 - 2, x1 - x0 + 4, y1 - y0 + 4); any = true; }
  for (const q of RF.regions) {
    if (!bbHit(q.bb, x0, y0 - dy, x1, y1 - dy)) continue;
    const up = exact ? q.lvl === L : q.lvl >= L; if (!up && !any) continue;
    g.globalCompositeOperation = up ? 'source-over' : 'destination-out'; g.fillStyle = '#fff';
    g.beginPath(); rpoly(g, q.poly, dy); g.fill(); if (up) any = true;
  }
  g.globalCompositeOperation = 'source-over';
  return any;
}
function rampTop(rp) { return Math.max(...rp.pts.map(p => p[2])); }
function rampBox(rp) { const lo = Math.min(...rp.pts.map(p => p[2])), hi = rampTop(rp), b = rp.bb; return [b[0] - 20, b[1] - hi * LH - 30, b[2] + 20, b[3] - lo * LH + 30]; }
function edgeBox(e, L) { return [Math.min(e.x0, e.x1) - 16, Math.min(e.y0, e.y1) - L * LH - 8, Math.max(e.x0, e.x1) + 16, e.ym - e.bot * LH + 16]; }
function reliefChunk(Rd, g, i, j) {
  const W = Rd.W, RF = W.relief, x0 = i * CHUNK, y0 = j * CHUNK, x1 = x0 + CHUNK, y1 = y0 + CHUNK;
  const near = (q, m = 80) => bbHit(q.bb, x0 - m, y0 + q.lvl * LH - m, x1 + m, y1 + q.lvl * LH + m);
  // земля зоны с запасом сверху и снизу — на те ярусы, что есть рядом (на равнине — без запаса)
  let lo = 0, hi = 0; for (const q of RF.regions) if (near(q, 140)) { lo = Math.min(lo, q.lvl); hi = Math.max(hi, q.lvl); }
  for (const rp of RF.ramps) if (bbHit(rampBox(rp), x0 - 60, y0 - 60, x1 + 60, y1 + 60)) for (const p of rp.pts) { lo = Math.min(lo, p[2]); hi = Math.max(hi, p[2]); }
  const gy0 = y0 + lo * LH - 8, gh = CHUNK + (hi - lo) * LH + 16;
  if (lo === 0 && hi === 0) { g.setTransform(CQ, 0, 0, CQ, -x0 * CQ, -y0 * CQ); paintGround(g, W, x0, y0, CHUNK, CHUNK, i, j); return; }   // рельефа рядом нет
  const [base, bg] = scratch('base', Math.ceil(CHUNK * CQ), Math.ceil(gh * CQ)); bg.scale(CQ, CQ); bg.translate(-x0, -gy0); paintGround(bg, W, x0, gy0, CHUNK, gh, i, j);
  g.setTransform(CQ, 0, 0, CQ, -x0 * CQ, -y0 * CQ); g.lineJoin = 'round';
  // подложка — равнина везде; ярусы — только свои места, снизу вверх
  g.drawImage(base, 0, 0, CHUNK * CQ, gh * CQ, x0, gy0, CHUNK, gh);
  const extras = (m, L, dy) => {
    const tint = TINT(L); if (tint) { m.fillStyle = tint; m.fillRect(x0, y0, CHUNK, CHUNK); }
    if (L <= -1) { const r = rng(i * 31 + j * 17 + 7); for (let k = 0; k < 40; k++) { const x = x0 + r() * CHUNK, y = y0 + r() * CHUNK; m.fillStyle = r() < 0.5 ? 'rgba(60,50,30,.16)' : 'rgba(90,120,60,.14)'; m.beginPath(); m.ellipse(x, y, 6 + r() * 14, 2 + r() * 5, 0, 0, 7); m.fill(); } }
    for (const q of RF.regions) if (q.soft && q.lvl === L && q.kind === 'blob' && near(q, 0)) softGlow(m, q, L, dy);
    for (const [Lk, E] of Object.entries(RF.edges)) { if (+Lk <= L) continue; for (const e of E) if (!e.soft && e.bot === L && e.ny > 0.25 && bbHit(edgeBox(e, +Lk), x0, y0 - 40, x1, y1 + 40)) footShadow(m, e, dy); }
    for (const gi of W.giants) if (Math.abs(W.hAt(gi.x, gi.y) - L * LH) < 2 && Math.abs(gi.x - (x0 + CHUNK / 2)) < 500 && Math.abs(gi.y + dy - (y0 + CHUNK / 2)) < 500) giantShade(m, gi.kind, gi.x, gi.y + dy, gi.s);
  };
  extras(g, 0, 0);
  const lower = RF.regions.some(q => q.lvl < 0 && near(q));
  for (const L of RF.levels) {
    const dy = -L * LH;
    // стенки краёв этого яруса
    if (L > RF.min) {
      const soft = [];
      for (const e of RF.edges[L] || []) if (bbHit(edgeBox(e, L), x0, y0, x1, y1)) { if (e.soft) { if (e.ny > -0.05) soft.push(e); } else drawFace(g, e, L, e.seed); }
      if (soft.length) softBank(g, soft, L, base, x0, gy0, gh);
    }
    // верх яруса — только где земля этого яруса (равнина — заново, если её могли закрыть низины)
    if (L === 0 ? lower : RF.regions.some(q => q.lvl === L && near(q))) {
      const [mc, m] = scratch('mask', Math.ceil(CHUNK * CQ), Math.ceil(CHUNK * CQ)); m.setTransform(CQ, 0, 0, CQ, -x0 * CQ, -y0 * CQ);
      if (levelMask(m, RF, L, x0, y0, x1, y1, true)) {
        m.globalCompositeOperation = 'source-in'; m.drawImage(base, 0, 0, CHUNK * CQ, gh * CQ, x0, gy0 + dy, CHUNK, gh);
        m.globalCompositeOperation = 'source-atop'; extras(m, L, dy);
        m.setTransform(1, 0, 0, 1, 0, 0); m.globalCompositeOperation = 'source-over';
        g.drawImage(mc, 0, 0, CHUNK * CQ, CHUNK * CQ, x0, y0, CHUNK, CHUNK);
      }
    }
    // склоны и лестницы этого яруса, кромки
    for (const rp of RF.ramps) if (rampTop(rp) === L && bbHit(rampBox(rp), x0, y0, x1, y1)) { const sp = rampSpr(rp), b = rampBox(rp); g.drawImage(sp, b[0], b[1], b[2] - b[0], b[3] - b[1]); }
    if (L > RF.min) for (const e of RF.edges[L] || []) if (bbHit(edgeBox(e, L), x0, y0, x1, y1)) drawRim(g, e, L);
  }
}
/** Травяной откос в пол яруса: та же земля, что сверху, плавно уходит вниз; тень у подножия, свет на кромке. */
function softBank(g, E, L, base, x0, gy0, gh) {
  const top = L * LH;
  g.save(); g.beginPath();
  for (const e of E) { const bot = e.bot * LH; g.moveTo(e.x0, e.y0 - top - 1); g.lineTo(e.x1, e.y1 - top - 1); g.lineTo(e.x1, e.y1 - bot + 1.5); g.lineTo(e.x0, e.y0 - bot + 1.5); g.closePath(); }
  g.clip();
  g.drawImage(base, 0, 0, base.width, Math.ceil(gh * CQ), x0, gy0 - top, CHUNK, gh);   // земля верхнего яруса продолжается вниз по откосу
  for (const e of E) {
    const bot = e.bot * LH, lit = Math.max(-1, Math.min(1, -e.nx * 0.8 - e.ny * 0.2));
    const gr = g.createLinearGradient(0, Math.min(e.y0, e.y1) - top, 0, Math.max(e.y0, e.y1) - bot);
    gr.addColorStop(0, lit > 0 ? `rgba(255,250,200,${0.10 * lit})` : 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(16,26,8,${0.30 - 0.08 * lit})`);
    g.fillStyle = gr; g.beginPath(); g.moveTo(e.x0, e.y0 - top - 1); g.lineTo(e.x1, e.y1 - top - 1); g.lineTo(e.x1, e.y1 - bot + 1.5); g.lineTo(e.x0, e.y0 - bot + 1.5); g.closePath(); g.fill();
  }
  g.restore();
  g.lineCap = 'round'; g.strokeStyle = 'rgba(18,28,10,.22)'; g.lineWidth = 3; g.beginPath(); for (const e of E) { const bot = e.bot * LH; g.moveTo(e.x0, e.y0 - bot + 1); g.lineTo(e.x1, e.y1 - bot + 1); } g.stroke();
}
/** Склон или лестница — готовой картинкой; концы плавно уходят в землю (без прямого среза). */
function rampSpr(rp) {
  if (rp.spr) return rp.spr;
  const b = rampBox(rp), q = CQ, cv = document.createElement('canvas'); cv.width = Math.ceil((b[2] - b[0]) * q); cv.height = Math.ceil((b[3] - b[1]) * q);
  const g = cv.getContext('2d'); g.setTransform(q, 0, 0, q, -b[0] * q, -b[1] * q); g.lineJoin = 'round';
  drawRampWhole(g, rp, rp.k + 3);
  const P = rp.pts, lo = P[0][2] <= P[P.length - 1][2] ? P[0] : P[P.length - 1], hi = lo === P[0] ? P[P.length - 1] : P[0];
  const ax = lo[0], ay = lo[1] - lo[2] * LH, bx = hi[0], by = hi[1] - hi[2] * LH;
  g.globalCompositeOperation = 'destination-out';
  for (const [sx, sy, ex, ey, k, a] of rp.kind === 'road' ? [[ax, ay, bx, by, 0.2, 0.7], [bx, by, ax, ay, 0.2, 0.7]] : [[ax, ay, bx, by, 0.32, 1], [bx, by, ax, ay, 0.16, 0.85]]) {
    const gr = g.createLinearGradient(sx, sy, sx + (ex - sx) * k, sy + (ey - sy) * k); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(b[0], b[1], b[2] - b[0], b[3] - b[1]);
  }
  return (rp.spr = cv);
}
/** Края ярусов по клеткам экрана — для быстрой проверки заслона. */
function edgeCells(RF) {
  if (RF.cellsE) return RF.cellsE; const M = new Map();
  for (const L of RF.levels) for (const e of RF.edges[L] || []) { const b = edgeBox(e, L); for (let x = Math.floor(b[0] / 256); x <= Math.floor(b[2] / 256); x++) for (let y = Math.floor(b[1] / 256); y <= Math.floor(b[3] / 256); y++) { const k = x + ',' + y; let a = M.get(k); if (!a) M.set(k, a = []); a.push([L, e]); } }
  return (RF.cellsE = M);
}
/**
 * Заслон: кто стоит ниже яруса, что лежит перед ним (южнее), — того ярус прячет. Фигура рисуется в отдельный
 * холст, из неё вырезается всё, что перед ней (верх яруса, стенки, склоны), и холст кладётся в кадр.
 * (x, y) — земля под ногами, h — высота, bw/bh — полуширина и высота фигуры. null — заслона нет, рисовать как обычно.
 */
const FEET = 10;   // ноги фигуры нарисованы чуть ниже её точки на земле
function occInfo(W, x, y0, h, bw, bh) {
  const RF = W.relief, lv = h / LH, y = y0 + FEET, sy = y0 - h, B = [x - bw, sy - bh, x + bw, sy + 20];
  const ups = RF.levels.filter(L => L > lv + 0.04); if (!ups.length) return null;
  let tops = false;
  for (const L of ups) { for (let a = 0; a <= 4 && !tops; a++) for (let b = 0; b <= 4; b++) { const px = B[0] + (B[2] - B[0]) * a / 4, ys = B[1] + (B[3] - B[1]) * b / 4, gy = ys + L * LH; if (gy > y + 1 && RF.levelAt(px, gy) === L) { tops = true; break; } } if (tops) break; }
  const faces = [], cells = edgeCells(RF), seen = new Set();
  for (let cx = Math.floor(B[0] / 256); cx <= Math.floor(B[2] / 256); cx++) for (let cy = Math.floor(B[1] / 256); cy <= Math.floor(B[3] / 256); cy++) for (const f of cells.get(cx + ',' + cy) || []) { const [L, e] = f; if (L <= lv + 0.04 || e.ym <= y + 1 || seen.has(e) || e.ny < -0.05 || !bbHit(edgeBox(e, L), B[0], B[1], B[2], B[3])) continue; seen.add(e); faces.push(f); }
  const here = RF.onRamp(x, y), ramps = RF.ramps.filter(rp => rampTop(rp) > lv + 0.04 && (!here || here.s.rp !== rp) && rp.bb[3] > y + 1 && bbHit(rampBox(rp), B[0], B[1], B[2], B[3]));
  if (!tops && !faces.length && !ramps.length) return null;
  return { B, ups, tops, faces, ramps, y: y0 };
}
function drawOccluded(Rd, c, W, O, h, draw, ghost) {
  const RF = W.relief, B = O.B, z = Rd.cam.z, w = Math.ceil((B[2] - B[0]) * z), hh = Math.ceil((B[3] - B[1]) * z), y = O.y + FEET;
  const [ec, e] = scratch('occE', w, hh), [mc, m] = scratch('occM', w, hh);
  e.setTransform(z, 0, 0, z, -B[0] * z, -B[1] * z); e.translate(0, -h); draw(e);
  if (ghost) { c.globalAlpha = 0.3; c.drawImage(ec, 0, 0, w, hh, B[0], B[1], w / z, hh / z); c.globalAlpha = 1; }   // герой и кто с ним бьётся — тенью сквозь холм
  // маска того, что перед фигурой
  if (O.tops) { const [tc, t] = scratch('occT', w, hh);
    for (const L of O.ups) {
      t.setTransform(1, 0, 0, 1, 0, 0); t.clearRect(0, 0, w, hh); t.setTransform(z, 0, 0, z, -B[0] * z, -B[1] * z);
      if (!levelMask(t, RF, L, B[0], B[1], B[2], B[3], true)) continue;
      const cut = y - L * LH; if (cut > B[1]) t.clearRect(B[0] - 2, B[1] - 2, B[2] - B[0] + 4, cut - B[1] + 2);   // только то, что лежит южнее ног
      t.setTransform(1, 0, 0, 1, 0, 0); m.drawImage(tc, 0, 0);
    } }
  m.setTransform(z, 0, 0, z, -B[0] * z, -B[1] * z); m.lineJoin = 'round';
  for (const [L, ed] of O.faces) { drawFace(m, ed, L, ed.seed); drawRim(m, ed, L); }
  for (const rp of O.ramps) { const sp = rampSpr(rp), b = rampBox(rp); m.drawImage(sp, b[0], b[1], b[2] - b[0], b[3] - b[1]); }
  m.setTransform(1, 0, 0, 1, 0, 0);
  e.setTransform(1, 0, 0, 1, 0, 0); e.globalCompositeOperation = 'destination-out'; e.drawImage(mc, 0, 0); e.globalCompositeOperation = 'source-over';
  c.drawImage(ec, 0, 0, w, hh, B[0], B[1], w / z, hh / z);
}
/** Кроны великанов — над всем миром, со сдвигом от середины экрана (кажутся высокими); у героя — «окно» в листве. */
function canopy(Rd, c, G, x0, y0, zw, zh, t) {
  const W = G.W, P = G.P, list = W.giants.filter(gi => Math.abs(gi.x - (x0 + zw / 2)) < zw / 2 + 700 && gi.y > y0 - 200 && gi.y < y0 + zh + 900);
  if (!list.length) return;
  const cv = Rd.cv, z = Rd.cam.z, zoomRel = Rd.uz / ZOOM.def, PAR = 0.0006 * zoomRel, cx0 = x0 + zw / 2, cy0 = y0 + zh / 2;
  let cc = Rd.canopyCv; if (!cc || cc.width !== cv.width || cc.height !== cv.height) { cc = Rd.canopyCv = document.createElement('canvas'); cc.width = cv.width; cc.height = cv.height; }
  const q = cc.getContext('2d'); q.setTransform(1, 0, 0, 1, 0, 0); q.clearRect(0, 0, cc.width, cc.height); q.setTransform(z, 0, 0, z, -x0 * z, -y0 * z); q.lineJoin = q.lineCap = 'round';
  const hh = W.hAt(P.x, P.y), hx = P.x, hy = P.y - hh - 30;
  let under = false;
  for (const gi of list.sort((a, b) => a.y - b.y)) {
    const Gd = GIANT[gi.kind], h = W.hAt(gi.x, gi.y), bx = gi.x, by = gi.y - h - Gd.low;
    let cx = gi.x, cy = gi.y - h - Gd.high; const k = Gd.high * PAR; cx += (cx - cx0) * k; cy += (cy - cy0) * k;
    const sp = sprite('gcrown|' + gi.kind + '|' + gi.s, Gd.crownR * 2.6, Gd.crownR * 2.4, Gd.crownR * 1.3, Gd.crownR * 1.25, 1.2, g => giantCrown(g, gi.kind, gi.s));
    giantUpper(q, gi.kind, bx, by, cx, cy + Gd.crownR * 0.25); drawSpr(q, sp, cx, cy);
    if (Math.hypot(hx - cx, (hy - cy) * 0.8) < Gd.crownR * 1.1) under = true;
  }
  if (!P.dead && (under || zoomRel > 1.3)) {   // ныряешь под листву
    const Rr = zoomRel > 1.3 ? 175 : 150, a = zoomRel > 1.3 ? Math.min(0.85, 0.55 + (zoomRel - 1.3) * 0.6) : 0.55;
    q.globalCompositeOperation = 'destination-out';
    const gr = q.createRadialGradient(hx, hy, Rr * 0.25, hx, hy, Rr); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    q.fillStyle = gr; q.fillRect(hx - Rr, hy - Rr, Rr * 2, Rr * 2); q.globalCompositeOperation = 'source-over';
  }
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(cc, 0, 0); c.restore();
  // лучи света сквозь листву вблизи
  if (zoomRel > 1.3) for (const gi of list) { const h = W.hAt(gi.x, gi.y); if (Math.hypot(P.x - gi.x, P.y - gi.y) > 420) continue; c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) { const x = gi.x - 120 + i * 80 + Math.sin(t * 0.4 + i) * 10, gr = c.createLinearGradient(x, gi.y - h - 400, x + 60, gi.y - h + 40); gr.addColorStop(0, 'rgba(255,240,170,.10)'); gr.addColorStop(1, 'rgba(255,240,170,0)'); c.fillStyle = gr; c.beginPath(); c.moveTo(x, gi.y - h - 400); c.lineTo(x + 30, gi.y - h - 400); c.lineTo(x + 110, gi.y - h + 40); c.lineTo(x + 60, gi.y - h + 40); c.fill(); }
    c.globalCompositeOperation = 'source-over'; }
}

// ---------------------------------------------------------------- кадр
let R_PARTS = null, EXEC = 0;
/** Эффекты над фигурами (v73): взрывы, удары, вспышки. thirst — от тела к герою (в мировых координатах). */
const OVER = { venom: MF.venom, sporeBurst: MF.sporeBurst, curseHit: MF.curseHit, impact: V.impact, explosion: V.explosion, frostHit: V.frostHit, bloodHit: V.bloodHit, critBurst: V.critBurst, igniteFlash: V.igniteFlash, trapSnap: V.trapSnap, thirst: V.thirst, herbPick: herbBurst, drink: drinkFx };
export function render(R, G, now) {
  const { ctx: c, cv } = R, W = G.W, P = G.P; R_PARTS = R.parts;
  if (R.W !== W) { R.W = W; R.chunks.clear(); R.statics = buildStatics(W); }
  if (W.sealedVer !== R.sealedVer) { R.sealedVer = W.sealedVer; R.chunks.clear(); }   // v90: запечатанный ход открылся — землю перерисовать
  // события → всплывающие числа и частицы
  for (const e of G.ev) {
    if (e.k === 'dmg') R.floats.push({ x: e.x + (Math.random() - 0.5) * 16, y: e.y, s: String(Math.round(e.v)), col: e.bleed ? '#ff5a5a' : e.crit ? '#ffd34d' : '#fff', big: e.crit, t: 0.9 });
    if (e.k === 'coins') R.floats.push({ x: P.x, y: P.y - 64, s: '+' + money(e.v), col: '#ffd34d', t: 1.4 });
    if (e.k === 'txt') R.floats.push({ x: e.x, y: e.y, s: e.s, col: e.col, t: 1.4 });
    if (e.k === 'hdmg') { R.floats.push({ x: P.x + (Math.random() - 0.5) * 20, y: P.y - 50, s: '−' + Math.round(e.v), col: '#ff6a5a', t: 0.9 }); R.shake = Math.max(R.shake, 0.12); }
    if (e.k === 'lvl') { for (let i = 0; i < 40; i++) R.parts.push(part(P.x, P.y - 20, ['#ffd34d', '#fff2a0', '#c8a0ff'])); R.floats.push({ x: P.x, y: P.y - 80, s: `Уровень ${e.L}!`, col: '#ffd34d', big: true, t: 2.4 }); }
  }
  const zw = cv.width / R.cam.z, zh = cv.height / R.cam.z; G.view = R.view = { w: zw, h: zh }; UIK = ZOOM.def / R.uz;   // мини-карта рисует рамку видимого
  // рельеф (v71): всё на высоте h рисуется выше на h; числа и искры, что родились в мире, — тоже
  const RF = W.relief, lift = RF ? (x, y) => W.hAt(x, y) : () => 0;
  if (RF) { for (const f of R.floats) if (!f.lf) { f.lf = 1; f.y -= lift(f.x, f.y + 60); } }
  const hP = lift(P.x, P.y);
  R.cam.x += (P.x - R.cam.x) * 0.18; R.cam.y += (P.y - 30 - hP - R.cam.y) * 0.18;
  if (Math.abs(P.x - R.cam.x) > 600 || Math.abs(P.y - hP - 30 - R.cam.y) > 600) { R.cam.x = P.x; R.cam.y = P.y - 30 - hP; }
  const sh = R.shake > 0 ? (R.shake -= 1 / 60, 3) : 0;
  const x0 = R.cam.x - zw / 2 + (Math.random() - 0.5) * sh, y0 = R.cam.y - zh / 2 + (Math.random() - 0.5) * sh;
  c.setTransform(R.cam.z, 0, 0, R.cam.z, -x0 * R.cam.z, -y0 * R.cam.z);
  c.imageSmoothingEnabled = true;
  c.fillStyle = '#1c2a1a'; c.fillRect(x0, y0, zw, zh);
  // земля
  const nC = R.built || 0;
  for (let i = Math.floor(x0 / CHUNK); i <= Math.floor((x0 + zw) / CHUNK); i++)
    for (let j = Math.floor(y0 / CHUNK); j <= Math.floor((y0 + zh) / CHUNK); j++) {
      if (i < -1 || j < -1 || i * CHUNK > W.W + CHUNK || j * CHUNK > W.H + CHUNK) continue;
      c.drawImage(chunk(R, i, j), i * CHUNK, j * CHUNK, CHUNK + 1, CHUNK + 1);
    }
  // заранее — по одному куску вокруг экрана (сначала туда, куда идёт герой), чтобы на ходу земля не дорисовывалась рывком
  if ((R.built || 0) === nC && R.chunks.size < (TOUCH ? 16 : 30) - 1) {
    const i0 = Math.floor(x0 / CHUNK) - 1, i1 = Math.floor((x0 + zw) / CHUNK) + 1, j0 = Math.floor(y0 / CHUNK) - 1, j1 = Math.floor((y0 + zh) / CHUNK) + 1, cand = [];
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) if ((i === i0 || i === i1 || j === j0 || j === j1) && i >= -1 && j >= -1 && i * CHUNK <= W.W + CHUNK && j * CHUNK <= W.H + CHUNK && !R.chunks.has(i + ',' + j)) cand.push([i, j, ((i + 0.5) * CHUNK - P.x) * (P.mvx || 0) + ((j + 0.5) * CHUNK - P.y) * (P.mvy || 0)]);
    if (cand.length) { cand.sort((a, b) => b[2] - a[2]); chunk(R, cand[0][0], cand[0][1]); }
  }
  const t = now / 1000, vis = (x, y, m = 200) => x > x0 - m && x < x0 + zw + m && y > y0 - m && y < y0 + zh + m * 1.5;
  // кольцо под целью
  if (P.target && P.target.state !== 'dead') { const m = P.target; c.strokeStyle = lvlColor(m.lvl, G.hero.lvl); c.lineWidth = 2.5; c.globalAlpha = 0.85; c.beginPath(); c.ellipse(m.x, m.y + 2 - lift(m.x, m.y), m.r + 10, (m.r + 10) * 0.42, 0, 0, 7); c.stroke(); c.globalAlpha = 1; }
  // предупреждения об ударах по площади
  // v94: лужи яда, кольца змеи, конусы и полосы боссов
  for (const h of G.hazards || []) if (vis(h.x, h.y, 100)) MF.puddle(c, h, t);
  for (const r of G.rings || []) if (vis(r.x, r.y, 300)) MF.coilRing(c, r, 1 - r.t / r.max, t);
  for (const f of G.fx) if ((f.k === 'teleCone' || f.k === 'teleLine') && vis(f.x, f.y, 500)) (f.k === 'teleCone' ? MF.teleCone : MF.teleLine)(c, f, 1 - f.t / f.max, f.max - f.t);
  for (const f of G.fx) if (f.k === 'tele' && vis(f.x, f.y, 300)) { const h = lift(f.x, f.y); c.save(); c.translate(0, -h); MF.telegraph(c, f, 1 - f.t / f.max, f.max - f.t); MF.gather(c, f, 1 - f.t / f.max); c.restore(); }
  // эффекты умений на земле (v73): под фигурами — руны и задние языки столпа, круг залпа, капканы, кольцо льда, трещины, пыль рывка, рёв ярости
  const UNDER = { crush: V.crush, dashDust: V.dashDust, nova: V.nova, berserkCast: V.berserkCast, slam: MF.slam, ram: MF.ram, hoof: (g, f, a) => MF.hoofDust(g, f.x, f.y, a, f.seed), summon: MF.summonFx, fireSplash: MF.fireSplash, shed: MF.shed };
  for (const f of G.fx) { const fn = UNDER[f.k]; if (!fn || !vis(f.x, f.y, 260)) continue; const h = lift(f.x, f.y); if (h) { c.save(); c.translate(0, -h); } fn(c, f, f.max - f.t); if (h) c.restore(); }
  for (const tr of G.traps || []) if (vis(tr.x, tr.y)) { const h = lift(tr.x, tr.y); c.save(); c.translate(0, -h); c.globalAlpha = Math.min(1, tr.t / 0.5); V.trap(c, tr.x, tr.y, tr.sprung ? Math.max(0, 1 - tr.sprung / 0.06) : 1, t); c.restore(); }
  for (const ar of G.areas || []) if (vis(ar.x, ar.y, 300)) { const h = lift(ar.x, ar.y), a = ar.max - ar.t; c.save(); c.translate(0, -h);
    if (ar.k === 'pillar') V.pillar(c, { x: ar.x, y: ar.y, r: ar.r, dur: ar.max, seed: ar.seed }, a, 'back'); else V.volley(c, { x: ar.x, y: ar.y, r: ar.r, dur: ar.dur, hx: ar.hx, hy: ar.hy, seed: ar.seed }, a, 'ground'); c.restore(); }
  if (P.whirl > 0) { c.save(); c.translate(0, -hP); V.whirl(c, { x: P.x, y: P.y, r: P.whirlR || 92, dur: P.whirlMax || 1.2, seed: 4 }, (P.whirlMax || 1.2) - P.whirl, 'back'); c.restore(); }
  EXEC = G.hero.cls === 'archer' && G.hero.lvl >= 15 ? (hasTal(G.hero, 'aim') ? 0.5 : abilsOf(G.hero)[3].below) : 0;
  // предметы по глубине
  const L = [];
  for (const s of R.statics) if (vis(s.lx ?? s.x ?? R.cam.x, s.y, 400)) L.push(s);
  for (const tr of treesIn(W, x0 - 150, y0 - 60, x0 + zw + 150, y0 + zh + 240)) L.push({ y: tr.y, tree: tr });
  for (const k of G.corpses) if (vis(k.x, k.y)) L.push({ y: k.y - 1, corpse: k });
  for (const gi of W.giants || []) if (vis(gi.x, gi.y, 300)) { const Gd = GIANT[gi.kind], sp = sprite('gbase|' + gi.kind + '|' + gi.s, Gd.trunkW * 4, Gd.low + 40, Gd.trunkW * 2, Gd.low + 20, 1.6, g => giantBase(g, gi.kind, gi.s)); L.push({ y: gi.y, x: gi.x, draw: g => drawSpr(g, sp, gi.x, gi.y) }); }
  for (const v of G.plants || []) if ((!v.at || v.at <= G.t) && vis(v.x, v.y)) { const sp = sprite('herb|' + v.herb + '|' + (v.s % 4), 60, 50, 30, 40, 2, gg => bush(gg, v.herb, v.s % 4 + 1)); L.push({ y: v.y, x: v.x, draw: (g, t) => { drawSpr(g, sp, v.x, v.y); g.save(); g.translate(v.x, v.y); herbGlint(g, v.herb, t, v.s % 7); g.restore(); } }); }
  for (const v of G.veins || []) if ((!v.at || v.at <= G.t) && vis(v.x, v.y)) { const sp = sprite('vein|' + v.metal + '|' + (v.s % 5), 110, 90, 55, 70, 2, gg => vein(gg, v.metal, v.s % 5 + 1)); /* руда — прежняя, с острыми гранями (решение Василия 14.10.2026) */ L.push({ y: v.y, x: v.x, oc: occ(sp, v.x, v.y), draw: (g, t) => { drawSpr(g, sp, v.x, v.y); g.save(); g.translate(v.x, v.y); glint(g, v.metal, t, v.s % 7); g.restore(); } }); }
  for (const m of G.mobs) if (m.state !== 'dead' && vis(m.x, m.y)) L.push({ y: m.y, mob: m });
  // v95: жители с заданиями (поворачиваются к герою, знак над головой) и предметы заданий
  for (const n of G.npcs || []) if (vis(n.x, n.y)) L.push({ y: n.y, x: n.x, draw: (g, tt) => drawNpc(g, G, n, tt) });
  for (const o of G.qobjs || []) if (vis(o.x, o.y)) L.push({ y: o.y, x: o.x, draw: (g, tt) => { if (o.art === 'snare') drawSpr(g, sprite('qsnare', 80, 40, 40, 30, 2, gg => { gg.scale(1.35, 1.35); snare(gg); }), o.x, o.y); questGlint(g, o.x, o.y - (o.art === 'tent' ? 50 : 0), tt, o.j); } });
  L.push({ y: P.y, hero: true });
  L.sort((a, b) => a.y - b.y);
  const look = lookOf(G.hero);
  const see = P.dead ? [] : [[P.x, P.y], ...G.mobs.filter(m => m.state === 'chase' && dist(m.x, m.y, P.x, P.y) < 500).map(m => [m.x, m.y])];
  const fdt = Math.min(0.1, Math.max(0, t - (R.lastT || t))); R.lastT = t;
  for (const o of L) {
    const ox = o.tree ? o.tree.x : o.mob ? o.mob.x : o.hero ? P.x : o.corpse ? o.corpse.x : (o.x ?? o.lx), hh = RF && ox != null ? lift(ox, o.y) : 0;
    // заслон рельефом: фигура ниже яруса, что лежит перед ней, — рисуется отдельно и обрезается
    if (RF && (o.mob || o.hero || o.corpse)) { const sc = o.mob ? (MOB_SCALE[o.mob.kind] || 1) * (o.mob.D.rare ? 1.4 : 1) : 1, O = occInfo(W, ox, o.y, hh, 62 * sc, 118 * sc);
      if (O) { drawOccluded(R, c, W, O, hh, g => o.mob ? drawMob(g, G, o.mob, t) : o.hero ? drawHero(g, G, look, t) : drawCorpse(g, o.corpse, t), o.hero || (o.mob && (o.mob === P.target || o.mob.state === 'chase'))); continue; } }
    if (hh) { c.save(); c.translate(0, -hh); }
    if (o.tree) { const tr = o.tree, sp = treeSpr(tr.kind, tr.v), fade = !P.dead && Math.abs(P.x - tr.x) < 26 * tr.s * TREE_K && P.y < tr.y - 4 && P.y > tr.y - 80 * tr.s * TREE_K ? 0.42 : 1; drawSpr(c, sp, tr.x, tr.y, fade, tr.s); }
    else if (o.mob) drawMob(c, G, o.mob, t);
    else if (o.hero) drawHero(c, G, look, t);
    else if (o.corpse) drawCorpse(c, o.corpse, t);
    else if (o.oc) { // постройка, стена, скала, шатёр: прозрачнее, если за ней герой
      const want = hides(o, see); o.fa = o.fa == null ? want : o.fa + (want - o.fa) * Math.min(1, fdt * 8);
      if (o.fa < 0.99) { c.save(); c.globalAlpha = o.fa; o.draw(c, t); c.restore(); } else o.draw(c, t);
    }
    else o.draw(c, t);
    if (hh) c.restore();
  }
  for (const f of G.qfires || []) if (vis(f.x, f.y)) { const a = Math.min(1, f.t / 3); for (let i = 0; i < 4; i++) V.flame(c, f.x - 30 + i * 20, f.y - 6 - (i % 2) * 18, 46 + (i % 2) * 18, 18, t * 7 + i, a, 0.4); }
  // выстрелы
  const nP = R.parts.length;
  for (const s0 of G.shots) {
    const sh = lift(s0.x, s0.y), s = sh ? { ...s0, y: s0.y - sh } : s0;
    if (s.kind === 'net') { V.netFly(c, s, s.age || 0); continue; }
    if (s.kind === 'bottle') { MF.bottleShot(c, s, t); continue; }
    if (s.kind === 'spore') { MF.sporeShot(c, s, t); continue; }
    if (s.kind === 'curse') { MF.curseShot(c, s, t); continue; }
    if (s.kind === 'frost') { V.frostBolt(c, s, t); continue; }
    if (s.kind === 'arrow') { V.arrow(c, s, t, !!s.red); continue; }
    if (s.kind === 'fire') { V.fireball(c, s, t); continue; }
    { const rr = 10, g = c.createRadialGradient(s.x, s.y, 1, s.x, s.y, rr); g.addColorStop(0, 'rgba(220,240,255,1)'); g.addColorStop(0.45, 'rgba(120,180,255,.85)'); g.addColorStop(1, 'rgba(255,60,20,0)'); c.fillStyle = g; c.beginPath(); c.arc(s.x, s.y, rr, 0, 7); c.fill(); if (Math.random() < 0.5) R.parts.push({ x: s.x, y: s.y, vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30, t: 0.35, col: '#9ad0ff', s: 2.5 }); }
  }
  // эффекты
  for (const f0 of G.fx) {
    const fh = lift(f0.x, f0.y), f = fh ? { ...f0, y: f0.y - fh, y2: f0.y2 != null ? f0.y2 - lift(f0.x2, f0.y2) : f0.y2, ty: f0.ty != null ? f0.ty - lift(f0.tx, f0.ty) : f0.ty } : f0;
    if (f.k === 'ring') { const q = 1 - f.t / 0.35; c.strokeStyle = f.col; c.globalAlpha = 1 - q; c.lineWidth = 6; c.beginPath(); c.ellipse(f.x, f.y, f.r + (f.max - f.r) * q, (f.r + (f.max - f.r) * q) * 0.5, 0, 0, 7); c.stroke(); c.globalAlpha = 1; }
    if (f.k === 'boom' && f.t > 0.3) for (let i = 0; i < (f.big ? 30 : 14); i++) R.parts.push(part(f.x, f.y, ['#ffd34d', '#ff7a2a', '#cf4b3f']));
    if (f.k === 'bolt') { const q = f.t / f.max; c.strokeStyle = `rgba(255,240,140,${q})`; c.lineWidth = 3; c.beginPath(); c.moveTo(f.x, f.y); const n = 6; for (let i = 1; i <= n; i++) { const k = i / n; c.lineTo(f.x + (f.x2 - f.x) * k + (i < n ? (Math.random() - 0.5) * 22 : 0), f.y + (f.y2 - f.y) * k + (i < n ? (Math.random() - 0.5) * 22 : 0)); } c.stroke(); c.strokeStyle = `rgba(255,255,255,${q})`; c.lineWidth = 1.2; c.stroke(); }
    if (f.k === 'trail') { c.fillStyle = `rgba(255,240,200,${f.t * 1.4})`; c.beginPath(); c.ellipse(f.x, f.y - 14, 12, 18, 0, 0, 7); c.fill(); }
    const fo = OVER[f.k]; if (fo && vis(f.x, f.y, 260)) fo(c, f, f.max - f.t);
    if (f.k === 'spawn') { c.fillStyle = `rgba(255,255,255,${f.t})`; c.beginPath(); c.ellipse(f.x, f.y, 26 * (1.4 - f.t), 10, 0, 0, 7); c.fill(); }
  }
  if (P.whirl > 0) { c.save(); c.translate(0, -hP); V.whirl(c, { x: P.x, y: P.y, r: P.whirlR || 92, dur: P.whirlMax || 1.2, seed: 4 }, (P.whirlMax || 1.2) - P.whirl, 'front'); c.restore(); }
  for (const ar of G.areas || []) if (vis(ar.x, ar.y, 300)) { const h = lift(ar.x, ar.y); c.save(); c.translate(0, -h); if (ar.k === 'pillar') V.pillar(c, { x: ar.x, y: ar.y, r: ar.r, dur: ar.max, seed: ar.seed }, ar.max - ar.t, 'front'); else V.volley(c, { x: ar.x, y: ar.y, r: ar.r, dur: ar.dur, hx: ar.hx, hy: ar.hy, seed: ar.seed }, ar.max - ar.t, 'air'); c.restore(); }
  // частицы (искры от выстрелов уже в координатах экрана-мира)
  if (RF) for (let i = 0; i < R.parts.length; i++) { const p = R.parts[i]; if (!p.lf) { p.lf = 1; if (i < nP || p.world) p.y -= lift(p.x, p.y + 20); } }
  for (const p of R.parts) { p.t -= 1 / 60; p.x += p.vx / 60; p.y += p.vy / 60; p.vy += 300 / 60; c.globalAlpha = Math.max(0, p.t * 2); c.fillStyle = p.col; c.fillRect(p.x, p.y, p.s, p.s); }
  c.globalAlpha = 1; R.parts = R.parts.filter(p => p.t > 0);
  // туман Грибного леса: лёгкий везде, густые клочья в низинах (полоски здоровья и уровни рисуются поверх)
  if (W.Z.fog) { const dense = W.Z.fog.map(([x, y, r]) => [x, y - lift(x, y), r]).filter(([x, y, R]) => x + R > x0 - 100 && x - R < x0 + zw + 100 && y + R > y0 - 100 && y - R < y0 + zh + 100); // рисуется в холст в 4 раза меньше и растягивается — туман мягкий, а кадр дешевле
    const k = 0.25, fw = Math.ceil(zw * k) + 2, fh = Math.ceil(zh * k) + 2; let fc = R.fogCv; if (!fc || fc.width !== fw || fc.height !== fh) { fc = R.fogCv = document.createElement('canvas'); fc.width = fw; fc.height = fh; }
    const q = fc.getContext('2d'); q.setTransform(1, 0, 0, 1, 0, 0); q.clearRect(0, 0, fw, fh); q.setTransform(k, 0, 0, k, -x0 * k, -y0 * k); FOR.fog(q, x0, y0, zw, zh, t * 8, dense);
    c.drawImage(fc, x0, y0, fw / k, fh / k); }
  if (RF && W.giants.length) canopy(R, c, G, x0, y0, zw, zh, t);
  // подписи построек
  c.textAlign = 'center';
  const bar = barRect(), z = R.cam.z / R.dpr;
  for (const s of R.statics) if (s.label && (!s.when || s.when()) && vis(s.lx, s.ly, 100)) { const sx = (s.lx - x0) * z, sy = (s.ly - y0) * z; if (bar && sx > bar.left - 90 && sx < bar.right + 90 && sy > bar.top - 14) continue; label(c, s.label, s.lx, s.ly - lift(s.lx, s.y), '#ffe9a8', 15); }
  // название жилы вблизи — цветом по навыку (как в WoW)
  for (const v of G.veins || []) if ((!v.at || v.at <= G.t) && dist(v.x, v.y, P.x, P.y) < 320 && !(P.mine && P.mine.v === v)) { const col = MINE.colorHex[miningSkill(G.hero) ? veinColor(miningSkill(G.hero), ORES[v.metal].req).c : 'gray']; label(c, ORES[v.metal].vein, v.x, v.y + 22 - lift(v.x, v.y), col, 13); }
  for (const v of G.plants || []) if ((!v.at || v.at <= G.t) && dist(v.x, v.y, P.x, P.y) < 260) { const col = MINE.colorHex[herbSkill(G.hero) ? skillColor(herbSkill(G.hero), HERBS[v.herb].req).c : 'gray']; label(c, HERBS[v.herb].name, v.x, v.y + 18 - lift(v.x, v.y), col, 12); }
  // таблички над мобами
  for (const m of G.mobs) if (m.state !== 'dead' && vis(m.x, m.y) && (m === P.target || m.state === 'chase' || m.hp < m.max || dist(m.x, m.y, P.x, P.y) < 260)) { const mh = lift(m.x, m.y); if (mh) { c.save(); c.translate(0, -mh); plate(c, G, m); c.restore(); } else plate(c, G, m); }
  // кто гонится за героем из-за края экрана — красный уголок у края (v67: при сильном приближении стрелков не видно)
  { const zs = R.cam.z / R.dpr, pad = 34 / zs, cx = x0 + zw / 2, cy = y0 + zh / 2;
    for (const m of G.mobs) if (m.state === 'chase' && !vis(m.x, m.y, -10)) {
      const a = Math.atan2(m.y - 20 - lift(m.x, m.y) - cy, m.x - cx), hx = zw / 2 - pad, hy = zh / 2 - pad, t = Math.min(hx / Math.abs(Math.cos(a) || 1e-6), hy / Math.abs(Math.sin(a) || 1e-6));
      const ex = cx + Math.cos(a) * t, ey = cy + Math.sin(a) * t, s = 16 / zs;
      c.save(); c.translate(ex, ey); c.rotate(a); c.globalAlpha = 0.85 + 0.15 * Math.sin(now / 160);
      c.fillStyle = '#e2453a'; c.strokeStyle = '#2a0c08'; c.lineWidth = 2 / zs; c.beginPath(); c.moveTo(s, 0); c.lineTo(-s * 0.8, -s * 0.8); c.lineTo(-s * 0.4, 0); c.lineTo(-s * 0.8, s * 0.8); c.closePath(); c.fill(); c.stroke(); c.restore();
    } }
  // куда идёт герой по касанию — кольцо на земле
  if (P.goal && P.goal.k === 'ground') { c.strokeStyle = 'rgba(255,233,168,.8)'; c.lineWidth = 2; c.beginPath(); c.ellipse(P.goal.x, P.goal.y - lift(P.goal.x, P.goal.y), 14 + 3 * Math.sin(now / 150), 6, 0, 0, 7); c.stroke(); }
  // подсказка «E»
  const it = !P.dead && interactTarget(G);
  if (it && !P.mine && !P.gather && !TOUCH) label(c, it.k === 'npc' ? `E — поговорить: ${it.n.name}` : it.k === 'qobj' ? `E — ${it.o.verb}` : it.k === 'b' ? `E — ${it.b.name}` : it.k === 'exit' ? (it.e.temple ? 'E — врата' : it.e.portal ? 'E — портал' : it.e.door ? 'E — выход' : 'E — дорога') : it.k === 'vein' ? 'E — копать' : it.k === 'plant' ? 'E — собрать' : it.k === 'chest' ? 'E — открыть сундук' : 'E — обыскать', P.x, P.y - 78 - hP, '#fff2a0', 14);   // на телефоне вместо надписи — кнопка действия
  // полоска копания
  if (P.mine) { const q = Math.min(1, P.mine.t / P.mine.max), x = P.x - 40, y = P.y - 86 - hP; c.fillStyle = 'rgba(20,14,8,.9)'; c.fillRect(x - 1, y - 1, 82, 10); c.fillStyle = '#e0a060'; c.fillRect(x, y, 80 * q, 8); label(c, ORES[P.mine.v.metal].ore, P.x, y - 5, '#ffe9a8', 13); }
  if (P.gather) { const q = Math.min(1, P.gather.t / P.gather.max), x = P.x - 40, y = P.y - 86 - hP; c.fillStyle = 'rgba(20,14,8,.9)'; c.fillRect(x - 1, y - 1, 82, 10); c.fillStyle = '#9ad87a'; c.fillRect(x, y, 80 * q, 8); label(c, HERBS[P.gather.v.herb].name, P.x, y - 5, '#ffe9a8', 13); }
  // всплывающие числа
  for (const f of R.floats) { f.t -= 1 / 60; f.y -= 32 / 60; c.globalAlpha = Math.min(1, f.t * 2); label(c, f.s, f.x, f.y, f.col, f.big ? 22 : 15, true); }
  c.globalAlpha = 1; R.floats = R.floats.filter(f => f.t > 0);
}

let BAR = null, BAR_T = 0;
function barRect() { const n = performance.now(); if (n - BAR_T > 1000) { BAR_T = n; const e = typeof document !== 'undefined' && document.getElementById('relicBar'); BAR = e ? e.getBoundingClientRect() : null; } return BAR; }

function part(x, y, cols) { const a = Math.random() * 6.28, s = 60 + Math.random() * 160; return { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 120, t: 0.5 + Math.random() * 0.5, col: cols[Math.floor(Math.random() * cols.length)], s: 2.5 }; }

// надписи и полоски держат свой размер на экране при любом приближении (v67)
let UIK = 1;
function around(c, x, y) { c.save(); c.translate(x, y); c.scale(UIK, UIK); c.translate(-x, -y); }
function label(c, s, x, y, col, size, bold) {
  if (UIK !== 1) { around(c, x, y); UIK0(() => label(c, s, x, y, col, size, bold)); c.restore(); return; }
  c.font = `${bold ? 'bold ' : ''}${size}px Georgia, 'Times New Roman', serif`; c.textAlign = 'center';
  c.lineWidth = 4; c.strokeStyle = 'rgba(20,14,8,.9)'; c.strokeText(s, x, y); c.fillStyle = col; c.fillText(s, x, y);
}

const UIK0 = f => { const k = UIK; UIK = 1; f(); UIK = k; };
function plate(c, G, m) {
  if (UIK !== 1) { const ay = m.y - (m.D.humanoid ? 62 * (MOB_SCALE[m.kind] || 1) : BAR_H[m.kind] || 44); around(c, m.x, ay); UIK0(() => plate(c, G, m)); c.restore(); return; }
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

// v95: житель с заданием — то же тело, что у героя; смотрит на героя, когда тот рядом; имя, звание и знак «!»/«?»
function drawNpc(c, G, n, t) {
  const P = G.P, L = NPC_LOOK[n.look] || NPC_LOOK.captain, dx = P.x - n.x, dy = P.y - n.y, near = dx * dx + dy * dy < 300 * 300;
  const view = near ? viewOf8(dx, dy) : (n.face || 'front'), dir = sideways(view) ? (dx < 0 ? -1 : 1) : 1;
  c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(n.x, n.y + 2, 15, 5, 0, 0, 7); c.fill();
  drawFrame(c, personSpr(L, view, 'idle', 0), n.x, n.y + Math.sin(t * 2 + n.x) * 0.4, dir, PEOPLE_K);
  const top = n.y - 62 * PEOPLE_K / 1.15 - 18;
  label(c, n.name, n.x, top + 2, '#ffe9a8', 13, true); label(c, `‹${n.title}›`, n.x, top + 16, '#d8ccb0', 11, false);
  const mk = npcMark(G.hero, n.id); if (mk) { if (UIK !== 1) { around(c, n.x, top - 14); UIK0(() => questMark(c, n.x, top - 14, mk, t)); c.restore(); } else questMark(c, n.x, top - 14, mk, t); }
}
function drawMob(c, G, m, t) {
  const hum = !!MOB_LOOK[m.kind], sc = MOB_SCALE[m.kind] || 1;
  let dx = m.mdx, dy = m.mdy;
  if (!m.moving && (m.state === 'chase' || m.atkT > 0)) { dx = G.P.x - m.x; dy = G.P.y - m.y; }
  const view = hum ? viewOf8(dx, dy) : viewOf(dx, dy), dir = sideways(view) ? (dx < 0 ? -1 : 1) : 1;
  const mode = m.atkT > 0 ? 'atk' : m.moving ? 'walk' : 'idle';
  const f = mode === 'atk' ? frameOf('atk', 1 - m.atkT / (m.atkDur || 0.35)) : mode === 'walk' ? frameOf('walk', m.walkPh) : 0;
  const sp = mobFrame(m.kind, view, mode, f);
  if (hum) { c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(m.x, m.y + 2, 14 * sc, 5 * sc, 0, 0, 7); c.fill(); }
  c.save(); if (m.state === 'return') c.globalAlpha = 0.6;
  const seed = (m.key ? m.key.length * 31 : 7) + Math.round(m.hx) % 97;
  if (m.chill > 0 || m.frozen > 0) V.chilled(c, m.x, m.y, t, seed);
  const breathe = mode === 'idle' ? Math.sin(t * 2 + m.walkPh * 6) * 0.4 : 0;
  if (m.B && m.state === 'chase') { const ph = m.D.ai.phases[m.B.phase]; if (ph && ph.shield) MF.shieldArc(c, m.x, m.y, m.B.dir, m.r + 34, t, m.B.open > 0 || m.stun > 0); }   // v94: щит Воеводы спереди
  if (m.jumpH) { c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(m.x, m.y + 2, 26 * sc, 9 * sc, 0, 0, 7); c.fill(); }
  drawFrame(c, m.hurt > 0 ? flashOf(sp) : sp, m.x - (m.hurt > 0 ? dir * 2 : 0), m.y + breathe - (m.jumpH || 0), dir, sc, m.state === 'return' ? 0.6 : 1);
  c.restore();
  const tt = performance.now() / 1000, top = m.y - (m.D.humanoid ? 58 * sc : (BAR_H[m.kind] || 44) - 10);
  const hgt = m.D.humanoid ? 60 * sc : Math.max(26, (BAR_H[m.kind] || 44) - 12), wid = m.D.humanoid ? 34 * sc : m.r * 2.4 + 8;
  if (m.burn) V.burning(c, m.x, m.y, tt, seed, Math.min(1, m.burn.t / 0.6));
  if (m.venom) { c.fillStyle = 'rgba(120,220,80,.7)'; for (let i = 0; i < 3; i++) { const q = (tt * 0.9 + i / 3) % 1; c.beginPath(); c.arc(m.x - 8 + i * 8, m.y - hgt * 0.6 - q * 22, 2.2, 0, 7); c.fill(); } }
  if (m.bleed) V.wound(c, m.x, m.y, tt, seed, hgt * 0.7);
  if (m.frozen > 0) V.iceBlock(c, m.x, m.y + 4, wid + 6, hgt + 6, tt, Math.min(1, m.frozen / 0.3, ((m.frozenMax || 3) - m.frozen) / 0.15 + 0.2));
  if (m.root > 0 && !(m.trapT > 0)) V.netWrap(c, m.x, m.y, wid, hgt * 0.75, tt);
  if (m.stun > 0) V.stunStars(c, m.x, top - 6, tt);
  if (m.B && m.B.immune > 0) MF.immuneShell(c, m.x, m.y, wid, hgt, tt);
  if (EXEC && m.hp < m.max * EXEC && m.state === 'chase') V.executeMark(c, m.x, m.y - hgt * 0.35, tt, Math.max(0.9, hgt / 60));
}

const PICK_P = palette('common', 11);
function drawHero(c, G, look, t) {
  const P = G.P;
  // куда смотрит: при ударе и рывке — на цель, иначе — куда шёл
  const aim = P.atkT > 0 || P.dash || P.mine || P.gather, dx = aim ? Math.cos(P.face) : P.mvx, dy = aim ? Math.sin(P.face) : P.mvy;
  const view = viewOf8(dx, dy), dir = sideways(view) ? (Math.abs(dx) > 0.05 ? (dx < 0 ? -1 : 1) : P.dir) : 1;
  const mode = P.dead ? 'dead' : (P.atkT > 0 || P.mine) ? 'atk' : (P.moving || P.dash) ? 'walk' : 'idle';
  const f = mode === 'dead' ? frameOf('dead', P.deadT / 0.7) : mode === 'atk' ? frameOf('atk', P.mine ? (P.mine.t / 0.6) % 1 : 1 - P.atkT / P.atkDur) : mode === 'walk' ? frameOf('walk', (P.step / 3) % 1) : 0;
  c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(P.x, P.y + 2, 15 * PEOPLE_K / 1.15, 5 * PEOPLE_K / 1.15, 0, 0, 7); c.fill();
  const B = P.buf || {};
  if (B.stone > 0) { c.strokeStyle = 'rgba(190,185,170,.85)'; c.lineWidth = 4; c.beginPath(); c.ellipse(P.x, P.y - 18, 24, 30, 0, 0, 7); c.stroke(); c.fillStyle = 'rgba(160,155,140,.18)'; c.fill(); }
  if (B.berserk > 0) V.berserkAura(c, P.x, P.y, t, Math.min(1, B.berserk / 0.5, (12.5 - B.berserk) / 0.3 + 0.1));
  if (B.rage > 0) { c.fillStyle = `rgba(255,70,40,${0.18 + 0.08 * Math.sin(t * 12)})`; c.beginPath(); c.ellipse(P.x, P.y - 18, 26, 32, 0, 0, 7); c.fill(); }
  if (B.wind > 0) { c.strokeStyle = 'rgba(220,240,255,.7)'; c.lineWidth = 1.6; for (let i = 0; i < 3; i++) { const yy = P.y - 8 - i * 12; c.beginPath(); c.moveTo(P.x - P.mvx * 20 - 6, yy); c.lineTo(P.x - P.mvx * 46 - 14, yy + (i - 1) * 3); c.stroke(); } }
  if (B.thorns > 0) { c.fillStyle = '#c8b890'; c.strokeStyle = '#24180f'; c.lineWidth = 0.8; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283 + t; const x = P.x + Math.cos(a) * 22, y = P.y - 16 + Math.sin(a) * 26; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 9, y + Math.sin(a) * 9); c.lineTo(x + Math.cos(a + 1.5) * 3, y + Math.sin(a + 1.5) * 3); c.closePath(); c.fill(); c.stroke(); } }
  if (P.weak > 0) { c.strokeStyle = 'rgba(160,160,255,.5)'; c.lineWidth = 2; c.beginPath(); c.ellipse(P.x, P.y + 2, 20, 8, 0, 0, 7); c.stroke(); }
  if (P.sit) { // сидит: ноги поджаты, тело ниже
    const sp = personSpr(look, 'side', 'idle', 0), lc = legColor(look);
    c.save(); c.beginPath(); c.rect(P.x - 60, P.y - 120, 120, 120 + 5); c.clip(); drawFrame(c, sp, P.x, P.y + 10, P.dir, PEOPLE_K); c.restore();
    c.fillStyle = lc; c.strokeStyle = '#24180f'; c.lineWidth = 1.2; for (const ox of [-7, 7]) { c.beginPath(); c.ellipse(P.x + ox * P.dir, P.y + 7, 8, 4, 0, 0, 7); c.fill(); c.stroke(); }
    c.fillStyle = 'rgba(160,220,255,.7)'; const q = (t * 0.7) % 1; c.globalAlpha = 1 - q; c.font = 'bold 11px Georgia'; c.fillText('z', P.x + 14, P.y - 40 - q * 16); c.globalAlpha = 1;
    return;
  }
  if (P.mine) look = { ...look, weapon: { m: 'pick', P: PICK_P }, swing: 'chop', key: look.key + '|pick' };
  const sp = personSpr(look, view, mode, f), breathe = mode === 'idle' ? Math.sin(t * 2) * 0.4 : 0;
  drawFrame(c, P.hurt > 0 ? flashOf(sp) : sp, P.x - (P.hurt > 0 && view === 'side' ? dir * 2 : 0), P.y + breathe, dir, PEOPLE_K, P.dead ? Math.max(0.35, 1 - P.deadT / 3) : 1);
  if (B.berserk > 0) V.berserkAura(c, P.x, P.y + 3, t + 0.5, Math.min(1, B.berserk / 0.5) * 0.3, 9);
  if (!P.dead) gearFx(c, fxListOf(G.hero), P.x, P.y + breathe, t, 37 * PEOPLE_K, dir);   // v92: живые эффекты героических вещей
  if (P.poison) { c.fillStyle = 'rgba(120,220,80,.6)'; for (let i = 0; i < 3; i++) c.fillRect(P.x - 10 + i * 9, P.y - 60 - ((t * 40 + i * 13) % 20), 3, 3); }
  if (P.mine) mineSparks(c, P);
  if (P.gather) pickLeaves(c, P.gather.v, P, P.gather.t / P.gather.max, HERBS[P.gather.v.herb].col);
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
  if (k.chest) return;   // v90: содержимое сундука — сам сундук уже нарисован открытым
  if (!k.kind) drawBag(c, k.x, k.y, t);
  else {
    const sc = MOB_SCALE[k.kind] || 1, view = MOB_LOOK[k.kind] ? viewOf8(k.vx || 0, k.vy || 1) : viewOf(k.vx || 0, k.vy || 1), dir = sideways(view) ? (k.vx < 0 ? -1 : 1) : 1;
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
