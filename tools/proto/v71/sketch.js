// Эскиз v71: рельеф ярусами, древние великаны и слой крон. Сборка: node tools/proto/v71/build.mjs
import { LOOK } from '../../../src/art/look.js';
import { treeSpr, personSpr, beastSpr, MOB_LOOK, drawFrame, drawSpr, TREE_K } from '../../../src/art/sprites.js';
import { lookOf, makeItem } from '../../../src/systems/items.js';
import { makeRelief, bakeLayers, drawFace, drawRim, drawRampWhole, blob, band, smooth, LH } from './relief.js';
import { GIANT, giantBase, giantUpper, giantCrown, giantShade } from './giants.js';

const DPR = Math.min(2, window.devicePixelRatio || 1);
const $ = s => document.querySelector(s);
const rnd = s => () => { s = (s * 16807) % 2147483647; return s / 2147483647; };

// ================================================================= поляна-образец
const W = 2400, H = 1600;
const F = blob(980, 1200, 330, 200, 3), G = band([[1470, 815], [1620, 925], [1760, 1010], [1900, 1125], [2050, 1235], [2250, 1330], [2380, 1360]], 130, 5);
const A = blob(520, 390, 360, 250, 7, 32, 0.14), E = blob(1185, 330, 160, 215, 11), C = blob(1960, 300, 330, 185, 13), B = blob(470, 330, 150, 95, 17);
const regions0 = [{ lvl: -1, poly: F }, { lvl: -1, poly: G }, { lvl: 1, poly: A }, { lvl: 1, poly: E }, { lvl: 2, poly: C }, { lvl: 2, poly: B }];
const probe0 = makeRelief({ W, H, regions: regions0, ramps: [] });
const cSy = x => { let y = 300; while (probe0.levelAt(x, y) === 2 && y < H) y++; return y; };
// уступ вдоль южной стены утёса (серпантин: склон на уступ, по уступу, лестница наверх)
const LEDGE = (() => { const top = [], bot = []; for (let x = 1700; x <= 2160; x += 20) { const e = cSy(x); top.push([x, e - 24]); bot.push([x, e + 70]); } return smooth([...top, ...bot.reverse()], 3); })();
// мелкий рельеф в пол роста: бугры и ложбины — проходимы везде
const SOFT = [
  { lvl: 0.5, soft: true, poly: blob(330, 1180, 185, 118, 21) }, { lvl: 0.5, soft: true, poly: blob(1490, 655, 140, 88, 23) }, { lvl: 0.5, soft: true, poly: blob(2050, 1460, 110, 66, 31) }, { lvl: 0.5, soft: true, poly: blob(1890, 690, 80, 48, 33) },
  { lvl: -0.5, soft: true, poly: blob(1330, 1380, 125, 70, 27) }, { lvl: -0.5, soft: true, poly: blob(770, 850, 90, 54, 29) },
];
const regions = [{ lvl: -1, poly: F }, { lvl: -1, poly: G }, ...SOFT, { lvl: 1, poly: A }, { lvl: 1, poly: E }, { lvl: 1, poly: LEDGE }, { lvl: 1.5, soft: true, poly: blob(250, 440, 85, 58, 25) }, { lvl: 2, poly: C }, { lvl: 2, poly: B }];
const probe = makeRelief({ W, H, regions, ramps: [] });
const edgeY = (x, y, dir, lvl) => { while (probe.levelAt(x, y) === lvl && y > 0 && y < H) y += dir; return y; };   // идти от точки, пока уровень тот же
const edgeX = (x, y, dir, lvl) => { while (probe.levelAt(x, y) === lvl && x > 0 && x < W) x += dir; return x; };
const aS = edgeY(560, 400, 1, 1), bE = edgeX(470, 330, 1, 2), eW = edgeX(1185, 300, -1, 1), cS = edgeY(1800, 300, 1, 2), fN = edgeY(985, 1200, -1, -1), gW = [1470, 815];
const ramps = [
  { kind: 'slope', w: 110, pts: [[560, aS + 120, 0], [560, aS - 1, 1]] },                                   // склон на возвышенность
  { kind: 'stairs', w: 54, pts: [[bE + 80, 330, 1], [bE - 1, 330, 2]] },                                   // лестница на вершину
  { kind: 'stairs', w: 60, pts: [[eW - 80, 300, 0], [eW + 1, 300, 1]] },                                   // лестница из ущелья
  { kind: 'slope', w: 64, pts: [[1600, cSy(1720) + 150, 0], [1712, cSy(1720) + 69, 1]] },               // на уступ утёса
  { kind: 'stairs', w: 54, pts: [[2120, cSy(2120) + 66, 1], [2120, cSy(2120) - 1, 2]] },                 // с уступа наверх
  { kind: 'slope', w: 96, pts: [[985, fN - 24, 0], [985, fN + 120, -1]] },                                  // спуск в низину
  { kind: 'slope', w: 66, pts: [[1484, 826, 0], [1620, 925, -1]] },                                          // спуск в овраг
];
const ponds = [[1010, 1250, 150, 72]];
const hills = [[2150, 760, 150], [620, 960, 120], [1150, 760, 110]];
const RF = makeRelief({ W, H, regions, ramps, hills, ponds });

// великаны и обычные деревья
const giants = [{ kind: 'oak', x: 760, y: 548, s: 3 }, { kind: 'pine', x: 600, y: 1080, s: 5 }, { kind: 'oak', x: 1560, y: 1460, s: 8 }, { kind: 'pine', x: 2240, y: 830, s: 11 }];
const nearEdge = (x, y, d) => { const l = RF.levelAt(x, y); for (let a = 0; a < 6.28; a += 0.8) if (RF.levelAt(x + Math.cos(a) * d, y + Math.sin(a) * d) !== l) return true; return false; };
const trees = [];
{ const r = rnd(41);
  const groups = [[260, 260, 120, 1], [820, 250, 90, 2], [1180, 480, 70, 3], [300, 760, 130, 2], [1350, 1150, 110, 3], [200, 1450, 160, 2], [1900, 700, 110, 1], [2250, 1050, 120, 2], [2280, 520, 100, 1], [1750, 1450, 140, 3], [700, 1450, 120, 1], [1500, 560, 90, 2]];
  for (const [gx, gy, gr, kind] of groups) for (let i = 0; i < 9; i++) {
    const a = r() * 6.28, d = Math.sqrt(r()) * gr, x = gx + Math.cos(a) * d, y = gy + Math.sin(a) * d * 0.7;
    if (x < 40 || x > W - 40 || y < 60 || y > H - 30 || nearEdge(x, y, 46) || RF.onRamp(x, y) || RF.onRamp(x, y + 30) || RF.water(x, y) || trees.some(t => Math.hypot(t.x - x, t.y - y) < 60) || giants.some(t => Math.hypot(t.x - x, t.y - y) < 140)) continue;
    trees.push({ x, y, kind: r() < 0.75 ? kind : 1 + Math.floor(r() * 3), v: r(), s: 0.9 + r() * 0.3 });
  }
}
// жители
const HERO_L = lookOf({ cls: 'warrior', eq: { head: makeItem('warrior', 'head', 12, 'rare', () => 0.31), chest: makeItem('warrior', 'chest', 12, 'good', () => 0.4), legs: makeItem('warrior', 'legs', 12, 'good', () => 0.5), weapon: makeItem('warrior', 'weapon', 12, 'rare', () => 0.6) } });
const hero = { x: 900, y: 780, dir: 1, view: 'front', step: 0, moving: false };
const mobs = [
  { kind: 'wolf', x: 360, y: 500 }, { kind: 'wolf', x: 280, y: 440 }, { kind: 'bandit_archer', x: 450, y: 300, person: true },
  { kind: 'kvakun', x: 850, y: 1130 }, { kind: 'kvakun', x: 1190, y: 1150 }, { kind: 'weaver', x: 1820, y: 1070 }, { kind: 'boar', x: 300, y: 1170 },
  { kind: 'bandit', x: 1990, y: 260, person: true },
].map((m, i) => ({ ...m, hx: m.x, hy: m.y, dir: 1, view: 'side', step: 0, t: i * 1.7, moving: false }));

// подписи форм рельефа
const LABELS = [
  [520, 520, 'Возвышенность'], [470, 300, 'Вершина-курган'], [560, aS + 70, 'Склон'], [bE + 40, 360, 'Лестница'], [eW - 40, 330, 'Лестница'], [1900, cS + 40, 'Уступ и лестница'],
  [1960, 200, 'Утёс в 2 яруса'], [950, 240, 'Ущелье'], [1000, 1110, 'Низина: пруд, туман'], [985, fN + 50, 'Спуск'], [1830, 1060, 'Овраг'], [330, 1110, 'Бугор в пол роста'], [1330, 1340, 'Ложбина'], [770, 820, 'Ложбина'], [1490, 600, 'Бугор'], [2150, 700, 'Пригорок'],
  [760, 380, 'Древний дуб'], [600, 950, 'Вековая сосна'], [1185, 250, 'Возвышенность'],
];

// ================================================================= готовые слои и картинки
const groundFn = (g, w, h) => {
  LOOK.use(g); LOOK.ground(0, 0, w, h, 'z1', 53, 3);
  const r = rnd(9); for (let i = 0; i < 2200; i++) { const x = r() * w, y = r() * h; LOOK.tuft(x, y, 0.9 + r() * 0.6, 'z1', r()); }
};
const creek = G.slice(0, G.length / 2).map((p, i) => [p[0] * 0.5 + G[G.length - 1 - i][0] * 0.5, p[1] * 0.5 + G[G.length - 1 - i][1] * 0.5]);
const extra = (g, L, dy) => {
  if (L === -1) {
    for (const [x, y, rx, ry] of ponds) {   // пруд
      g.fillStyle = '#4a5a2e'; g.beginPath(); g.ellipse(x, y + dy + 4, rx + 12, ry + 8, 0, 0, 7); g.fill();
      const gr = g.createRadialGradient(x - rx * 0.3, y + dy - ry * 0.3, 10, x, y + dy, rx); gr.addColorStop(0, '#5a8aa0'); gr.addColorStop(1, '#2a4a5a'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y + dy, rx, ry, 0, 0, 7); g.fill();
      g.strokeStyle = '#24180f'; g.lineWidth = 2; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; for (const k of [0.3, 0.55]) { g.beginPath(); g.ellipse(x - rx * 0.2, y + dy - ry * 0.2, rx * k, ry * k * 0.5, 0, 3.6, 5.2); g.stroke(); }
    }
    g.lineCap = 'round'; g.lineJoin = 'round';   // ручей по дну оврага
    for (const [w, c] of [[16, '#4a5a2e'], [11, '#3a6a80'], [4, 'rgba(200,230,255,.35)']]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); creek.forEach(([x, y], i) => i ? g.lineTo(x, y + dy) : g.moveTo(x, y + dy)); g.stroke(); }
  }
  for (const t of giants) if (RF.levelAt(t.x, t.y) === L) giantShade(g, t.kind, t.x, t.y + dy, t.s);
};
const { layers, pad } = bakeLayers(RF, groundFn, extra);
const sprites = {};
function canvasOf(w, h, ox, oy, q, draw) { const cv = document.createElement('canvas'); cv.width = Math.ceil(w * q); cv.height = Math.ceil(h * q); const g = cv.getContext('2d'); g.setTransform(q, 0, 0, q, 0, 0); g.translate(ox, oy); g.lineJoin = g.lineCap = 'round'; draw(g); return { cv, w, h, ox, oy }; }
for (const t of giants) {
  const Gd = GIANT[t.kind];
  sprites['base' + t.s] = canvasOf(Gd.trunkW * 4, Gd.low + 40, Gd.trunkW * 2, Gd.low + 20, 1.6, g => giantBase(g, t.kind, t.s));
  sprites['crown' + t.s] = canvasOf(Gd.crownR * 2.6, Gd.crownR * 2.4, Gd.crownR * 1.3, Gd.crownR * 1.25, 1.2, g => giantCrown(g, t.kind, t.s));
}
const rampLvl = rp => RF.levels.find(L => L >= Math.max(...rp.pts.map(p => p[2])) - 0.001);

// туман низины
let PUFF = null;
function puff() { if (PUFF) return PUFF; const cv = document.createElement('canvas'); cv.width = cv.height = 128; const q = cv.getContext('2d'); const gr = q.createRadialGradient(64, 64, 3, 64, 64, 64); gr.addColorStop(0, 'rgba(226,236,230,1)'); gr.addColorStop(1, 'rgba(226,236,230,0)'); q.fillStyle = gr; q.fillRect(0, 0, 128, 128); return (PUFF = cv); }

// ================================================================= кадр
function render(cv, cam, zk, t, opts = {}) {
  const g = cv.getContext('2d'), cw = cv.width / DPR, ch = cv.height / DPR, z = zk, vw = cw / z, vh = ch / z, x0 = cam.x - vw / 2, y0 = cam.y - vh / 2;
  g.setTransform(DPR, 0, 0, DPR, 0, 0); g.fillStyle = '#1c2a1a'; g.fillRect(0, 0, cw, ch);
  g.setTransform(z * DPR, 0, 0, z * DPR, -x0 * z * DPR, -y0 * z * DPR); g.lineJoin = 'round';
  // 1. земля по ярусам: обрывы → верх яруса → склоны → кромки
  const terrain = (L, filter) => {
    if (L > RF.min) (RF.edges[L] || []).forEach((e, i) => (!filter || filter(e.y0, e.y1)) && drawFace(g, e, L, i * 7 + Math.round(L * 10)));
    if (!filter) g.drawImage(layers[L], 0, -pad);
    RF.ramps.forEach((rp, i) => { if (rampLvl(rp) !== L) return; const ys = rp.pts.map(p => p[1]); if (!filter || filter(Math.min(...ys), Math.max(...ys))) drawRampWhole(g, RF, rp, i + 3); });
    if (L > RF.min) (RF.edges[L] || []).forEach(e => (!filter || filter(e.y0, e.y1)) && drawRim(g, e, L));
  };
  for (const L of RF.levels) terrain(L);
  // 2. всё, что стоит на земле, — по глубине; после каждого — ярусы выше него, что стоят южнее, закрывают его
  const list = [];
  for (const tr of trees) list.push({ y: tr.y, x: tr.x, tree: tr, bw: 60 * tr.s, bh: 170 * tr.s });
  for (const gi of giants) list.push({ y: gi.y, x: gi.x, giant: gi, bw: 120, bh: GIANT[gi.kind].low + 30 });
  for (const m of mobs) list.push({ y: m.y, x: m.x, mob: m, bw: 70, bh: 90 });
  list.push({ y: hero.y, x: hero.x, hero: true, bw: 60, bh: 90 });
  list.sort((a, b) => a.y - b.y);
  for (const o of list) {
    if (o.x < x0 - 300 || o.x > x0 + vw + 300 || o.y < y0 - 100 || o.y > y0 + vh + 500) continue;
    const h = RF.height(o.x, o.y), sy = o.y - h;
    if (o.tree) { const tr = o.tree, sp = treeSpr(tr.kind, tr.v), fade = Math.abs(hero.x - tr.x) < 26 * tr.s * TREE_K && hero.y < tr.y - 4 && hero.y > tr.y - 80 * tr.s * TREE_K ? 0.42 : 1; drawSpr(g, sp, tr.x, sy, fade, tr.s); }
    else if (o.giant) { const s = sprites['base' + o.giant.s]; g.drawImage(s.cv, o.x - s.ox, sy - s.oy, s.w, s.h); }
    else if (o.mob) { const m = o.mob, f = m.moving ? Math.floor(m.step * 8) % 8 : 0, mode = m.moving ? 'walk' : 'idle'; if (m.person) drawFrame(g, personSpr(MOB_LOOK[m.kind], m.view, mode, f), m.x, sy, m.dir, 1.15); else drawFrame(g, beastSpr(m.kind, m.view, mode, f), m.x, sy, m.dir); }
    else { const f = hero.moving ? Math.floor(hero.step) % 8 : 0; drawFrame(g, personSpr(HERO_L, hero.view, hero.moving ? 'walk' : 'idle', f), hero.x, sy, hero.dir, 1.15); }
    // заслон: ярусы выше этого, что лежат южнее него
    const lv = h / LH;
    for (const L of RF.levels) { if (L <= lv + 0.05) continue;
      g.save(); g.beginPath(); g.rect(o.x - o.bw, sy - o.bh, o.bw * 2, o.bh + 14); g.clip();
      g.beginPath(); g.rect(o.x - o.bw, o.y - L * LH, o.bw * 2, 2000); g.clip();
      g.drawImage(layers[L], 0, -pad);
      g.restore();
      g.save(); g.beginPath(); g.rect(o.x - o.bw, sy - o.bh, o.bw * 2, o.bh + 14); g.clip();
      terrain(L, (a, b) => Math.max(a, b) > o.y + 2);
      g.restore();
    }
  }
  // 3. туман в низине
  const pf = puff(), fr = rnd(5);
  for (let i = 0; i < 16; i++) { const [cx, cy] = F[Math.floor(fr() * F.length)], x = cx * 0.55 + 980 * 0.45 + Math.sin(t * 0.2 + i) * 30, y = cy * 0.55 + 1200 * 0.45 + LH, s = 120 + fr() * 120; g.globalAlpha = 0.22; g.drawImage(pf, x - s, y - s * 0.4, s * 2, s * 0.8); }
  for (let i = 0; i < 6; i++) { const x = 1550 + i * 140 + Math.sin(t * 0.3 + i) * 20, y = 960 + i * 75 + LH, s = 110; g.globalAlpha = 0.16; g.drawImage(pf, x - s, y - s * 0.4, s * 2, s * 0.8); }
  g.globalAlpha = 1;
  // 4. кроны великанов — над всем; чем выше, тем сильнее уходят от середины экрана
  const zoomRel = zk / Z0, PAR = 0.0006 * zoomRel;
  const cc = opts.canopy || (opts.canopy = document.createElement('canvas'));
  if (cc.width !== cv.width || cc.height !== cv.height) { cc.width = cv.width; cc.height = cv.height; }
  const q = cc.getContext('2d'); q.setTransform(1, 0, 0, 1, 0, 0); q.clearRect(0, 0, cc.width, cc.height); q.setTransform(z * DPR, 0, 0, z * DPR, -x0 * z * DPR, -y0 * z * DPR); q.lineJoin = q.lineCap = 'round';
  const hh = RF.height(hero.x, hero.y), hx = hero.x, hy = hero.y - hh - 30;
  for (const gi of [...giants].sort((a, b) => a.y - b.y)) {
    const Gd = GIANT[gi.kind], h = RF.height(gi.x, gi.y), bx = gi.x, by = gi.y - h - Gd.low;
    let cx = gi.x, cy = gi.y - h - Gd.high; const k = Gd.high * PAR; cx += (cx - cam.x) * k; cy += (cy - cam.y) * k;
    const s = sprites['crown' + gi.s];
    q.save(); giantUpper(q, gi.kind, bx, by, cx, cy + Gd.crownR * 0.25); q.drawImage(s.cv, cx - s.ox, cy - s.oy, s.w, s.h); q.restore();
  }
  // ныряешь под листву: вблизи — широкое окно вокруг героя, издалека — только если герой под кроной (полупрозрачно)
  const under = giants.some(gi => { const Gd = GIANT[gi.kind], h = RF.height(gi.x, gi.y); return Math.hypot(hx - gi.x, (hy - (gi.y - h - Gd.high)) * 0.8) < Gd.crownR * 1.1; });
  if (under || zoomRel > 1.3) {
    const R = zoomRel > 1.3 ? 175 : 150, a = zoomRel > 1.3 ? Math.min(0.85, 0.55 + (zoomRel - 1.3) * 0.6) : 0.55;
    q.globalCompositeOperation = 'destination-out';
    const gr = q.createRadialGradient(hx, hy, R * 0.25, hx, hy, R); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    q.fillStyle = gr; q.fillRect(hx - R, hy - R, R * 2, R * 2); q.globalCompositeOperation = 'source-over';
  }
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(cc, 0, 0);
  // лучи света сквозь листву вблизи
  if (zoomRel > 1.3) { g.setTransform(z * DPR, 0, 0, z * DPR, -x0 * z * DPR, -y0 * z * DPR); for (const gi of giants) { const h = RF.height(gi.x, gi.y); if (Math.hypot(hero.x - gi.x, hero.y - gi.y) > 420) continue; g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) { const x = gi.x - 120 + i * 80 + Math.sin(t * 0.4 + i) * 10, gr = g.createLinearGradient(x, gi.y - h - 400, x + 60, gi.y - h + 40); gr.addColorStop(0, 'rgba(255,240,170,.10)'); gr.addColorStop(1, 'rgba(255,240,170,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x, gi.y - h - 400); g.lineTo(x + 30, gi.y - h - 400); g.lineTo(x + 110, gi.y - h + 40); g.lineTo(x + 60, gi.y - h + 40); g.fill(); } g.globalCompositeOperation = 'source-over'; } }
  // 5. подписи
  if (opts.labels) {
    g.setTransform(z * DPR, 0, 0, z * DPR, -x0 * z * DPR, -y0 * z * DPR);
    const k = 1 / Math.max(0.45, Math.min(1.6, z));
    for (const [x, y, s] of LABELS) { const sy = y - RF.height(x, y); g.save(); g.translate(x, sy); g.scale(k, k); g.font = 'bold 15px Georgia'; g.textAlign = 'center'; g.lineWidth = 4; g.strokeStyle = 'rgba(20,14,8,.85)'; g.strokeText(s, 0, 0); g.fillStyle = '#ffe9a8'; g.fillText(s, 0, 0); g.restore(); }
  }
}

// ================================================================= управление и цикл
const Z0 = 1.3;   // «как в игре» на экране этой ширины
const view = $('#view'), over = $('#over');
let zoomK = Z0, labels = true, goal = null; const keys = new Set();
function size() { const w = Math.min(1180, $('#main').clientWidth), h = Math.round(w * 0.6); view.width = w * DPR; view.height = h * DPR; view.style.width = w + 'px'; view.style.height = h + 'px'; over.width = w * DPR; over.height = Math.round(w * H / W) * DPR; over.style.width = w + 'px'; over.style.height = Math.round(w * H / W) + 'px'; }
size(); addEventListener('resize', size);
addEventListener('keydown', e => { keys.add(e.code); if (e.code.startsWith('Arrow')) e.preventDefault(); goal = null; });
addEventListener('keyup', e => keys.delete(e.code));
const cam = { x: hero.x, y: hero.y };
view.addEventListener('pointerdown', e => { const r = view.getBoundingClientRect(), vw = r.width / zoomK, vh = r.height / zoomK; const sx = cam.x - vw / 2 + (e.clientX - r.left) / zoomK, sy = cam.y - vh / 2 + (e.clientY - r.top) / zoomK; let best = null, bd = 1e9; for (let y = sy; y < sy + 3 * LH; y += 4) { const d = Math.abs(y - RF.height(sx, y) - sy); if (d < bd) { bd = d; best = y; } } goal = { x: sx, y: best }; });
view.addEventListener('wheel', e => { e.preventDefault(); setZoom(zoomK * (e.deltaY < 0 ? 1.12 : 1 / 1.12)); }, { passive: false });
over.addEventListener('pointerdown', e => { const r = over.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H; for (let k = 0; k < 40; k++) { const a = k * 0.7, d = k * 8, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d; if (RF.canStep(px, py, px, py) && !RF.onRamp(px, py)) { hero.x = px; hero.y = py; cam.x = px; cam.y = py - RF.height(px, py); break; } } });
function setZoom(z) { zoomK = Math.max(0.5, Math.min(2.6, z)); $('#zv').textContent = Math.round(zoomK / Z0 * 100) + '%'; $('#zoom').value = zoomK; }
$('#zoom').oninput = e => setZoom(+e.target.value);
document.querySelectorAll('[data-z]').forEach(b => b.onclick = () => setZoom(Z0 * +b.dataset.z));
$('#lab').onchange = e => labels = e.target.checked;
document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { const [x, y] = b.dataset.go.split(',').map(Number); hero.x = x; hero.y = y; cam.x = x; cam.y = y - RF.height(x, y); goal = null; });
setZoom(Z0);

let last = performance.now(), bump = 0, msgT = 0;
const step = (o, dx, dy, sp, dt) => {
  const h0 = RF.height(o.x, o.y), nx = o.x + dx * sp * dt, ny = o.y + dy * sp * dt;
  const ok = (x, y) => RF.canStep(o.x, o.y, x, y) && !giants.some(gi => Math.hypot((x - gi.x) / 1.6, (y - gi.y) * 1.4) < GIANT[gi.kind].trunkW * 0.42) && !trees.some(tr => Math.hypot(x - tr.x, (y - tr.y) * 2) < 12);
  if (ok(nx, ny)) { o.x = nx; o.y = ny; } else if (ok(nx, o.y)) o.x = nx; else if (ok(o.x, ny)) o.y = ny; else return false;
  return RF.height(o.x, o.y) - h0;
};
function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; const t = now / 1000;
  let mx = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0), my = (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) - (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0);
  if (!mx && !my && goal) { const d = Math.hypot(goal.x - hero.x, goal.y - hero.y); if (d < 8) goal = null; else { mx = (goal.x - hero.x) / d; my = (goal.y - hero.y) / d; } }
  const m = Math.hypot(mx, my); hero.moving = m > 0;
  if (m) {
    mx /= m; my /= m;
    // вверх по склону медленнее, вниз — быстрее
    const ahead = RF.height(hero.x + mx * 10, hero.y + my * 10) - RF.height(hero.x, hero.y), sp = 190 * (ahead > 1 ? 0.78 : ahead < -1 ? 1.15 : 1);
    const dh = step(hero, mx, my, sp, dt);
    if (dh === false) { bump += dt; if (bump > 0.25 && now - msgT > 1500) { msgT = now; $('#msg').textContent = 'Обрыв — не пройти. Ищите склон, лестницу или тропу.'; $('#msg').classList.add('on'); setTimeout(() => $('#msg').classList.remove('on'), 1400); goal = null; } } else bump = 0;
    hero.step += dt * sp / 40; hero.view = Math.abs(my) > Math.abs(mx) * 0.9 ? (my > 0 ? 'front' : 'back') : 'side'; if (Math.abs(mx) > 0.1) hero.dir = mx < 0 ? -1 : 1;
  }
  for (const mo of mobs) {   // жители бродят у дома
    mo.t += dt; const phase = mo.t % 7;
    if (phase < 2.2) { const a = Math.floor(mo.t / 7) * 2.4 + mo.hx, tx = mo.hx + Math.cos(a) * 46, ty = mo.hy + Math.sin(a) * 30, d = Math.hypot(tx - mo.x, ty - mo.y); if (d > 4) { const dx = (tx - mo.x) / d, dy = (ty - mo.y) / d; mo.moving = step(mo, dx, dy, 60, dt) !== false; mo.step += dt * 1.6; mo.view = Math.abs(dy) > Math.abs(dx) * 0.9 ? (dy > 0 ? 'front' : 'back') : 'side'; if (Math.abs(dx) > 0.1) mo.dir = dx < 0 ? -1 : 1; } else mo.moving = false; }
    else mo.moving = false;
  }
  const hy = hero.y - RF.height(hero.x, hero.y) - 20; cam.x += (hero.x - cam.x) * 0.12; cam.y += (hy - cam.y) * 0.12;
  render(view, cam, zoomK, t, VO);
  { const hl = RF.height(hero.x, hero.y) / LH, n = hl <= -0.75 ? 'низина' : hl < -0.1 ? 'ложбина' : hl < 0.25 ? 'равнина' : hl < 0.75 ? 'бугор' : hl < 1.25 ? 'возвышенность' : hl < 1.75 ? 'бугор на возвышенности' : 'вершина'; $('#hud').textContent = `Под героем: ${n} (высота ${Math.round(hl * 10) / 10} роста)${RF.onRamp(hero.x, hero.y) ? ' · на склоне' : ''}`; }
  if (Math.floor(t * 2) !== Math.floor((t - dt) * 2)) render(over, { x: W / 2, y: H / 2 - 30 }, over.width / DPR / W * 0.98, t, OO);
  requestAnimationFrame(tick);
}
const VO = { get labels() { return labels; } }, OO = { labels: true };
requestAnimationFrame(tick);
window.__sk = { hero, setZoom, RF, cam, goal: g => goal = g, Z0 };
