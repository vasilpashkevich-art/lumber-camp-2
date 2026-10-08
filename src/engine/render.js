// Отрисовка мира: земля кусками, предметы по глубине, мобы, герой, выстрелы, эффекты, всплывающие числа.
import { LOOK } from '../art/look.js';
import { lairSpr } from '../art/lairs.js';
import { LINE } from '../art/hero.js';
import { BLD } from '../art/bld.js';
import { sprite, drawSpr, flashOf, heroSpr, mobSpr, MOB_SCALE, treeSpr, wallSpr, hallSpr, bldSpr, mountainSpr } from '../art/sprites.js';
import { treesIn, GATE_W } from '../world/world.js';
import { lookOf } from '../systems/items.js';
import { interactTarget } from '../systems/game.js';
import { lvlColor, RAR_COL, RAR_IDX } from '../../data/balance.js';
import { rng, dist, inPoly, money } from './util.js';

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
  // стена столицы
  const n = 72;
  for (let i = 0; i < n; i++) {
    const am = (i + 0.5) / n * Math.PI * 2;
    let gate = false; for (const g of c.gates) { const d = Math.abs(((am - g) + Math.PI * 3) % (Math.PI * 2) - Math.PI); if (d < GATE_W) gate = true; }
    if (gate) continue;
    const s = wallSpr(c.R, i, n); if (s) S.push({ y: c.y + s.py, draw: (g) => drawSpr(g, s, c.x + s.px, c.y + s.py) });
  }
  // башни у ворот и стража
  for (const ga of c.gates) for (const sd of [-1, 1]) {
    const a = ga + sd * (GATE_W + 0.03), x = c.x + Math.cos(a) * c.R, y = c.y + Math.sin(a) * c.R;
    const sp = bldSpr('tower', 110, 170, 55, 150, 1.0, B => B.tower(6, 0, -Math.PI / 2, 0));
    S.push({ y: y + 4, draw: g => drawSpr(g, sp, x, y + 4) });
    const gx = c.x + Math.cos(ga + sd * 0.07) * (c.R + 40), gy = c.y + Math.sin(ga + sd * 0.07) * (c.R + 40);
    const gs = bldSpr('guard' + sd, 60, 80, 30, 66, 0.6, B => B.person(B.GUARD[3], 0, 0, 1, sd, 0));
    S.push({ y: gy, draw: g => drawSpr(g, gs, gx, gy) });
  }
  // постройки
  const ART = {
    hall: () => hallSpr(),
    market: () => bldSpr('stall', 200, 150, 100, 116, 1.9, B => { B.stall(0); }),
    forge: () => bldSpr('forge', 300, 260, 150, 214, 1.7, B => B.forge(0)),
    tavern: () => bldSpr('tavern', 290, 270, 145, 220, 2.1, B => B.house(3, 0)),
    miners: () => bldSpr('miners', 300, 250, 150, 200, 1.55, B => B.sklad(0.8, 0)),
    enchant: () => bldSpr('enchant2', 290, 270, 145, 220, 2.0, (B, g) => { B.house(1, 0); enchantSign(g); }),
  };
  for (const b of c.buildings) {
    const x = c.x + b.dx, y = c.y + b.dy, sp = ART[b.art]();
    S.push({ y, draw: g => drawSpr(g, sp, x, y), label: b.name, lx: x, ly: y - ({ hall: 235, market: 125, forge: 130, tavern: 120, miners: 105, enchant: 160 }[b.art] || 120) });
  }
  // кладбище
  const gy = W.graveyard;
  for (let i = 0; i < 9; i++) {
    const x = gy.x - 110 + (i % 3) * 110 + (r() - 0.5) * 20, y = gy.y - 60 + Math.floor(i / 3) * 60 + (r() - 0.5) * 10, cross = r() < 0.5;
    const sp = sprite('grave' + (cross ? 1 : 0), 40, 50, 20, 40, 2, g => grave(g, cross));
    S.push({ y, draw: g => drawSpr(g, sp, x, y) });
  }
  S.push({ y: gy.y + 110, label: gy.name, lx: gy.x, ly: gy.y - 110, draw: () => {} });
  // указатели на выходах
  for (const e of W.exits) {
    const sp = sprite('sign', 120, 110, 60, 90, 2, g => signpost(g));
    S.push({ y: e.y, draw: g => drawSpr(g, sp, e.x - 40, e.y), label: `${e.to} · ${e.lvl}`, lx: e.x - 40, ly: e.y - 100 });
  }
  // приметы логов: нора, логово, лёжка, паутина, шатры; у людей — костёр
  for (const cp of W.camps) {
    const sp = lairSpr(cp.lair), ly = cp.y - 10;
    if (sp) S.push({ y: ly, x: cp.x, draw: g => drawSpr(g, sp, cp.x, ly) });
    if (cp.lair === 'bandit' || cp.lair === 'ataman') { const fx = cp.x + (cp.lair === 'ataman' ? -85 : 0), fy = cp.y + (cp.lair === 'ataman' ? 20 : 40); S.push({ y: fy, fire: true, x: fx, draw: (g, t) => campfire(g, fx, fy, t) }); }
  }
  // горы за северным и западным краем
  const mt = [];
  for (let i = 0; i < W.edge.length; i++) {
    const [x, y] = W.edge[i];
    if (y < 700 || x < 700) { const ox = x < 700 ? -150 - r() * 120 : (r() - 0.5) * 60, oy = y < 700 ? -90 - r() * 120 : (r() - 0.5) * 60; mt.push([x + ox, y + oy, r()]); }
  }
  for (const [x, y, v] of mt) { const sp = mountainSpr(v); S.push({ y, draw: g => drawSpr(g, sp, x, y, 1, 1.3) }); }
  return S;
}

// вывеска мастерской чар: светящийся кристалл над входом
function enchantSign(g) {
  const y = -62, gl = g.createRadialGradient(0, y, 1, 0, y, 26); gl.addColorStop(0, 'rgba(190,140,255,.75)'); gl.addColorStop(1, 'rgba(150,100,255,0)');
  g.fillStyle = gl; g.beginPath(); g.arc(0, y, 26, 0, 7); g.fill();
  g.fillStyle = '#b48aff'; g.strokeStyle = '#24180f'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, y - 10); g.lineTo(6, y); g.lineTo(0, y + 10); g.lineTo(-6, y); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(-1.5, y - 6, 2, 5);
}
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
function chunk(R, i, j) {
  const key = i + ',' + j; let cv = R.chunks.get(key);
  if (cv) { R.chunks.delete(key); R.chunks.set(key, cv); return cv; }
  const W = R.W, x0 = i * CHUNK, y0 = j * CHUNK;
  cv = document.createElement('canvas'); cv.width = CHUNK; cv.height = CHUNK;
  const g = cv.getContext('2d'); g.translate(-x0, -y0); LOOK.use(g);
  LOOK.ground(x0, y0, CHUNK, CHUNK, W.Z.ground, W.Z.seed, 3);
  // за краем зоны — тёмный лес и скалы
  g.save(); g.beginPath(); g.rect(x0 - 2, y0 - 2, CHUNK + 4, CHUNK + 4);
  g.moveTo(W.edge[0][0], W.edge[0][1]); for (const p of W.edge) g.lineTo(p[0], p[1]); g.closePath();
  g.fillStyle = 'rgba(28,40,26,.88)'; g.fill('evenodd'); g.restore();
  // дороги
  for (const rd of W.roads) {
    g.lineJoin = 'round'; g.lineCap = 'round';
    const path = () => { g.beginPath(); g.moveTo(rd[0][0], rd[0][1]); for (const p of rd.slice(1)) g.lineTo(p[0], p[1]); };
    path(); g.strokeStyle = 'rgba(90,70,40,.55)'; g.lineWidth = 78; g.stroke();
    path(); g.strokeStyle = '#b39a6a'; g.lineWidth = 64; g.stroke();
    path(); g.strokeStyle = 'rgba(210,190,140,.45)'; g.lineWidth = 30; g.stroke();
  }
  const r = rng(i * 7919 + j * 104729 + 5);
  // камушки на дорогах
  for (let k = 0; k < 120; k++) { const x = x0 + r() * CHUNK, y = y0 + r() * CHUNK; if (W.roadD(x, y) < 28) { g.fillStyle = r() < 0.5 ? 'rgba(120,100,70,.55)' : 'rgba(230,215,180,.5)'; g.beginPath(); g.ellipse(x, y, 2 + r() * 2, 1.4 + r(), 0, 0, 7); g.fill(); } }
  // столица: брусчатка
  const c = W.cap;
  if (Math.abs(c.x - (x0 + CHUNK / 2)) < c.R + CHUNK && Math.abs(c.y - (y0 + CHUNK / 2)) < c.R + CHUNK) {
    g.save(); g.beginPath(); g.arc(c.x, c.y, c.R - 4, 0, 7); g.clip();
    g.fillStyle = '#9a8c74'; g.fillRect(x0, y0, CHUNK, CHUNK);
    const st = 24;
    for (let yy = Math.floor(y0 / st) * st; yy < y0 + CHUNK; yy += st)
      for (let xx = Math.floor(x0 / st) * st - st + ((yy / st) % 2) * st / 2; xx < x0 + CHUNK; xx += st) {
        const v = Math.abs(Math.sin(xx * 12.9898 + yy * 78.233) * 43758.5453 % 1);
        g.fillStyle = `rgb(${150 + v * 30 | 0},${138 + v * 26 | 0},${114 + v * 20 | 0})`; g.strokeStyle = 'rgba(60,45,30,.45)'; g.lineWidth = 1.2;
        g.beginPath(); g.roundRect(xx + 1.5, yy + 1.5, st - 3, st - 3, 5); g.fill(); g.stroke();
      }
    g.restore();
    LOOK.plaza(c.x, c.y, 150, 6, 31);
  }
  // кладбище: тёмная земля
  const gy = W.graveyard;
  if (Math.abs(gy.x - (x0 + CHUNK / 2)) < 500 && Math.abs(gy.y - (y0 + CHUNK / 2)) < 500) {
    g.fillStyle = 'rgba(60,50,35,.45)'; g.beginPath(); g.ellipse(gy.x, gy.y, 200, 110, 0, 0, 7); g.fill();
    g.strokeStyle = '#4a3a2a'; g.lineWidth = 4; g.setLineDash([10, 8]); g.beginPath(); g.ellipse(gy.x, gy.y, 190, 104, 0, 0, 7); g.stroke(); g.setLineDash([]);
  }
  // вытоптанная земля в лагерях
  for (const cp of W.camps) if (Math.abs(cp.x - (x0 + CHUNK / 2)) < 700 && Math.abs(cp.y - (y0 + CHUNK / 2)) < 700) {
    const gr = g.createRadialGradient(cp.x, cp.y, 10, cp.x, cp.y, cp.r * 0.9); gr.addColorStop(0, 'rgba(120,95,60,.35)'); gr.addColorStop(1, 'rgba(120,95,60,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(cp.x, cp.y, cp.r * 0.9, 0, 7); g.fill();
  }
  // трава и цветы
  for (let k = 0; k < 70; k++) {
    const x = x0 + r() * CHUNK, y = y0 + r() * CHUNK;
    if (!inPoly(x, y, W.edge) || W.roadD(x, y) < 44 || dist(x, y, c.x, c.y) < c.R + 20) continue;
    LOOK.tuft(x, y, 0.9 + r() * 0.6, W.Z.ground, r());
  }
  R.chunks.set(key, cv); if (R.chunks.size > 48) R.chunks.delete(R.chunks.keys().next().value);
  return cv;
}

// ---------------------------------------------------------------- кадр
export function render(R, G, now) {
  const { ctx: c, cv } = R, W = G.W, P = G.P;
  if (R.W !== W) { R.W = W; R.chunks.clear(); R.statics = buildStatics(W); }
  // события → всплывающие числа и частицы
  for (const e of G.ev) {
    if (e.k === 'dmg') R.floats.push({ x: e.x + (Math.random() - 0.5) * 16, y: e.y, s: String(Math.round(e.v)), col: e.crit ? '#ffd34d' : '#fff', big: e.crit, t: 0.9 });
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
  for (const tr of treesIn(W, x0 - 100, y0 - 60, x0 + zw + 100, y0 + zh + 160)) L.push({ y: tr.y, tree: tr });
  for (const k of G.corpses) if (vis(k.x, k.y)) L.push({ y: k.y - 1, corpse: k });
  for (const m of G.mobs) if (m.state !== 'dead' && vis(m.x, m.y)) L.push({ y: m.y, mob: m });
  if (!P.dead) L.push({ y: P.y, hero: true });
  L.sort((a, b) => a.y - b.y);
  const look = lookOf(G.hero);
  for (const o of L) {
    if (o.tree) { const tr = o.tree, sp = treeSpr(tr.kind, tr.v), fade = !P.dead && Math.abs(P.x - tr.x) < 26 * tr.s && P.y < tr.y - 4 && P.y > tr.y - 80 * tr.s ? 0.42 : 1; drawSpr(c, sp, tr.x, tr.y, fade, tr.s); }
    else if (o.mob) drawMob(c, G, o.mob, t);
    else if (o.hero) drawHero(c, G, look, t);
    else if (o.corpse) drawCorpse(c, o.corpse, t);
    else o.draw(c, t);
  }
  // выстрелы
  for (const s of G.shots) {
    if (s.kind === 'net') { const a = (performance.now() / 120) % 6.28; c.save(); c.translate(s.x, s.y); c.rotate(a); c.strokeStyle = '#e8dcc0'; c.lineWidth = 1.4; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(-10, i * 6); c.lineTo(10, i * 6); c.moveTo(i * 6, -10); c.lineTo(i * 6, 10); c.stroke(); } c.fillStyle = '#a8845a'; for (const [x, y] of [[-10, -10], [10, -10], [-10, 10], [10, 10]]) { c.beginPath(); c.arc(x, y, 2.4, 0, 7); c.fill(); } c.restore(); continue; }
    if (s.kind === 'frost') { const a = Math.atan2(s.vy, s.vx); c.save(); c.translate(s.x, s.y); c.rotate(a); const g = c.createRadialGradient(0, 0, 1, 0, 0, 14); g.addColorStop(0, 'rgba(230,248,255,1)'); g.addColorStop(1, 'rgba(120,190,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 14, 0, 7); c.fill(); c.fillStyle = '#e8f8ff'; c.strokeStyle = '#4a8ac0'; c.lineWidth = 1; c.beginPath(); c.moveTo(12, 0); c.lineTo(-6, -4); c.lineTo(-2, 0); c.lineTo(-6, 4); c.closePath(); c.fill(); c.stroke(); c.restore(); if (Math.random() < 0.5) R.parts.push({ x: s.x, y: s.y, vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20, t: 0.4, col: '#cfeaff', s: 2 }); continue; }
    if (s.kind === 'arrow') { const a = Math.atan2(s.vy, s.vx); c.save(); c.translate(s.x, s.y); c.rotate(a); c.strokeStyle = '#24180f'; c.lineWidth = 3; c.beginPath(); c.moveTo(-14, 0); c.lineTo(6, 0); c.stroke(); c.strokeStyle = s.from === 'mob' ? '#8a5a3a' : '#e8e0cc'; c.lineWidth = 1.6; c.stroke(); c.fillStyle = '#cfd8de'; c.beginPath(); c.moveTo(9, 0); c.lineTo(4, -3); c.lineTo(4, 3); c.fill(); c.restore(); }
    else { const big = s.kind === 'fire', rr = s.big ? 22 : big ? 15 : 10, g = c.createRadialGradient(s.x, s.y, 1, s.x, s.y, rr); g.addColorStop(0, big ? 'rgba(255,240,160,1)' : 'rgba(220,240,255,1)'); g.addColorStop(0.45, big ? 'rgba(255,140,40,.9)' : 'rgba(120,180,255,.85)'); g.addColorStop(1, 'rgba(255,60,20,0)'); c.fillStyle = g; c.beginPath(); c.arc(s.x, s.y, rr, 0, 7); c.fill(); if (Math.random() < 0.5) R.parts.push({ x: s.x, y: s.y, vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30, t: 0.35, col: big ? '#ffb347' : '#9ad0ff', s: 2.5 }); }
  }
  // эффекты
  for (const f of G.fx) {
    if (f.k === 'ring') { const q = 1 - f.t / 0.35; c.strokeStyle = f.col; c.globalAlpha = 1 - q; c.lineWidth = 6; c.beginPath(); c.ellipse(f.x, f.y, f.r + (f.max - f.r) * q, (f.r + (f.max - f.r) * q) * 0.5, 0, 0, 7); c.stroke(); c.globalAlpha = 1; }
    if (f.k === 'boom' && f.t > 0.3) for (let i = 0; i < (f.big ? 30 : 14); i++) R.parts.push(part(f.x, f.y, ['#ffd34d', '#ff7a2a', '#cf4b3f']));
    if (f.k === 'trail') { c.fillStyle = `rgba(255,240,200,${f.t * 1.4})`; c.beginPath(); c.ellipse(f.x, f.y - 14, 12, 18, 0, 0, 7); c.fill(); }
    if (f.k === 'spawn') { c.fillStyle = `rgba(255,255,255,${f.t})`; c.beginPath(); c.ellipse(f.x, f.y, 26 * (1.4 - f.t), 10, 0, 0, 7); c.fill(); }
  }
  if (P.whirl > 0) for (let k = 0; k < 3; k++) { c.strokeStyle = `rgba(255,240,200,${0.45 - k * 0.12})`; c.lineWidth = 9 - k * 3; const a0 = now / 90 + k * 0.8; c.beginPath(); c.ellipse(P.x, P.y - 14, 70 + k * 7, (70 + k * 7) * 0.6, 0, a0, a0 + 3.2); c.stroke(); }
  // частицы
  for (const p of R.parts) { p.t -= 1 / 60; p.x += p.vx / 60; p.y += p.vy / 60; p.vy += 300 / 60; c.globalAlpha = Math.max(0, p.t * 2); c.fillStyle = p.col; c.fillRect(p.x, p.y, p.s, p.s); }
  c.globalAlpha = 1; R.parts = R.parts.filter(p => p.t > 0);
  // подписи построек
  c.textAlign = 'center';
  for (const s of R.statics) if (s.label && vis(s.lx, s.ly, 100)) label(c, s.label, s.lx, s.ly, '#ffe9a8', 15);
  // таблички над мобами
  for (const m of G.mobs) if (m.state !== 'dead' && vis(m.x, m.y) && (m === P.target || m.state === 'chase' || m.hp < m.max || dist(m.x, m.y, P.x, P.y) < 260)) plate(c, G, m);
  // подсказка «E»
  const it = !P.dead && interactTarget(G);
  if (it) label(c, it.k === 'b' ? `E — ${it.b.name}` : it.k === 'exit' ? 'E — дорога' : 'E — обыскать', P.x, P.y - 78, '#fff2a0', 14);
  // всплывающие числа
  for (const f of R.floats) { f.t -= 1 / 60; f.y -= 32 / 60; c.globalAlpha = Math.min(1, f.t * 2); label(c, f.s, f.x, f.y, f.col, f.big ? 22 : 15, true); }
  c.globalAlpha = 1; R.floats = R.floats.filter(f => f.t > 0);
}

function part(x, y, cols) { const a = Math.random() * 6.28, s = 60 + Math.random() * 160; return { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 120, t: 0.5 + Math.random() * 0.5, col: cols[Math.floor(Math.random() * cols.length)], s: 2.5 }; }

function label(c, s, x, y, col, size, bold) {
  c.font = `${bold ? 'bold ' : ''}${size}px Georgia, 'Times New Roman', serif`; c.textAlign = 'center';
  c.lineWidth = 4; c.strokeStyle = 'rgba(20,14,8,.9)'; c.strokeText(s, x, y); c.fillStyle = col; c.fillText(s, x, y);
}

function plate(c, G, m) {
  const y = m.y - (m.D.humanoid ? 62 * (MOB_SCALE[m.kind] || 1) : 44) - (m.D.rare ? 14 : 0), w = m.D.rare ? 64 : 46;
  const col = lvlColor(m.lvl, G.hero.lvl);
  c.font = 'bold 12px Georgia, serif'; c.textAlign = 'center'; c.lineWidth = 3; c.strokeStyle = 'rgba(20,14,8,.9)';
  const txt = (m.D.rare ? '★ ' : '') + m.lvl;
  c.strokeText(txt, m.x - w / 2 - 9, y + 5); c.fillStyle = col; c.fillText(txt, m.x - w / 2 - 9, y + 5);
  c.fillStyle = 'rgba(20,14,8,.85)'; c.fillRect(m.x - w / 2 - 1, y - 1, w + 2, 7);
  c.fillStyle = m.state === 'return' ? '#9a9a9a' : '#c8323a'; c.fillRect(m.x - w / 2, y, w * Math.max(0, m.hp / m.max), 5);
  if (m === G.P.target || m.D.rare) { c.font = '12px Georgia, serif'; c.strokeText(m.D.name, m.x, y - 6); c.fillStyle = m.D.rare ? '#ffb347' : '#f4ecd8'; c.fillText(m.D.name, m.x, y - 6); }
}

function drawMob(c, G, m, t) {
  const moving = m.state === 'chase' || m.state === 'return' || (m.state === 'idle' && Math.hypot(m.wander.x - m.x, m.wander.y - m.y) > 4);
  const frame = moving ? Math.floor(m.anim * (m.state === 'idle' ? 4 : 8)) % 4 : 0;
  const sp = mobSpr(m.kind, m.face, frame, m.bite > 0), sc = MOB_SCALE[m.kind] || 1;
  const bob = m.D.humanoid && moving ? Math.abs(Math.sin(m.anim * 9)) * 2 : 0;
  if (m.D.humanoid) { c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(m.x, m.y + 2, 14 * sc, 5 * sc, 0, 0, 7); c.fill(); }
  c.save(); if (m.state === 'return') c.globalAlpha = 0.6;
  if (m.burn) { c.fillStyle = 'rgba(255,120,40,.3)'; c.beginPath(); c.arc(m.x, m.y - 12, 18, 0, 7); c.fill(); }
  drawSpr(c, m.hurt > 0 ? flashOf(sp) : sp, m.x, m.y - bob, 1, sc);
  c.restore();
  const tt = performance.now() / 1000, top = m.y - (m.D.humanoid ? 58 * sc : 34);
  if (m.chill > 0) { c.fillStyle = 'rgba(140,200,255,.28)'; c.beginPath(); c.ellipse(m.x, m.y - 12, m.r + 8, m.r + 2, 0, 0, 7); c.fill(); c.fillStyle = '#e8f8ff'; for (let i = 0; i < 3; i++) { const q = (tt * 0.8 + i / 3) % 1; c.fillRect(m.x - 10 + i * 10, m.y - 6 - q * 30, 2, 2); } }
  if (m.root > 0) { c.strokeStyle = 'rgba(232,220,192,.9)'; c.lineWidth = 1.2; const w = m.r + 8; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(m.x - w, m.y - 10 + i * 6); c.quadraticCurveTo(m.x, m.y - 4 + i * 6, m.x + w, m.y - 10 + i * 6); c.stroke(); c.beginPath(); c.moveTo(m.x + i * 7, m.y - 26); c.lineTo(m.x + i * 8, m.y + 4); c.stroke(); } }
  if (m.stun > 0) for (let i = 0; i < 3; i++) { const a = tt * 4 + i * 2.09, x = m.x + Math.cos(a) * 12, y = top + Math.sin(a) * 4; c.fillStyle = '#ffe066'; c.strokeStyle = '#24180f'; c.lineWidth = 0.8; c.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 1.6 : 4, b = k * Math.PI / 5; c.lineTo(x + Math.cos(b) * r, y + Math.sin(b) * r); } c.closePath(); c.fill(); c.stroke(); }
}

function drawHero(c, G, look, t) {
  const P = G.P, sp = heroSpr(look, P.dir), bob = P.moving ? Math.abs(Math.sin(P.step * 1.6)) * 2.5 : Math.sin(t * 2) * 0.4;
  c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(P.x, P.y + 2, 15, 5, 0, 0, 7); c.fill();
  if (P.weak > 0) { c.strokeStyle = 'rgba(160,160,255,.5)'; c.lineWidth = 2; c.beginPath(); c.ellipse(P.x, P.y + 2, 20, 8, 0, 0, 7); c.stroke(); }
  if (P.sit) { // сидит: ноги поджаты, тело ниже
    const lc = look.legs < 0 ? '#f2c9a0' : LINE[look.cls].legs[look.legs];
    c.save(); c.beginPath(); c.rect(P.x - 60, P.y - 120, 120, 120 + 5); c.clip(); drawSpr(c, sp, P.x, P.y + 7, 1, 1.15); c.restore();
    c.fillStyle = lc; c.strokeStyle = '#24180f'; c.lineWidth = 1.2; for (const dx of [-7, 7]) { c.beginPath(); c.ellipse(P.x + dx * P.dir, P.y + 7, 8, 4, 0, 0, 7); c.fill(); c.stroke(); }
    c.fillStyle = 'rgba(160,220,255,.7)'; const q = (t * 0.7) % 1; c.globalAlpha = 1 - q; c.font = 'bold 11px Georgia'; c.fillText('z', P.x + 14, P.y - 40 - q * 16); c.globalAlpha = 1;
    return;
  }
  c.save(); c.translate(P.x, P.y - bob);
  if (P.swing > 0) c.rotate(P.dir * (0.22 - P.swing) * 0.9);
  drawSpr(c, P.hurt > 0 ? flashOf(sp) : sp, 0, 0, 1, 1.15);
  c.restore();
  if (P.swing > 0) { const q = 1 - P.swing / 0.22, a = P.face; c.strokeStyle = `rgba(255,250,230,${0.7 * (1 - q)})`; c.lineWidth = 6; c.beginPath(); c.arc(P.x, P.y - 16, 42, a - 1 + q * 0.8, a + 0.2 + q * 0.8); c.stroke(); }
  if (P.poison) { c.fillStyle = 'rgba(120,220,80,.6)'; for (let i = 0; i < 3; i++) c.fillRect(P.x - 10 + i * 9, P.y - 60 - ((t * 40 + i * 13) % 20), 3, 3); }
}

// тело моба: лежит на боку; если в нём есть добыча — над ним мерцает искорка цвета лучшей вещи
function drawCorpse(c, k, t) {
  const a = Math.min(1, k.t / 1.5);
  if (!k.kind) drawBag(c, k.x, k.y, t);
  else {
    const sp = mobSpr(k.kind, k.dir, 0, false), sc = MOB_SCALE[k.kind] || 1;
    c.save(); c.globalAlpha = a * 0.92; c.translate(k.x, k.y - 4); c.rotate(k.dir * 1.45); c.scale(0.92, 0.92);
    drawSpr(c, sp, 0, 0, 1, sc); c.restore();
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
