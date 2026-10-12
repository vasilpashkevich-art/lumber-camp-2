// Рисовка объёмных частей (эскиз v74): мягкий объём, тёплый свет слева сверху, холодная тень, тонкая тёмная обводка,
// блики на металле — как иконки умений. Всё строится по точкам мира и проецируется камерой из rig.js.
import { proj, CAM, add, mul, mv, dot, norm, sub, cross, clamp } from './rig.js';
export const TAU = Math.PI * 2;
export const OUT = '#1c120b';
const LIGHT2 = norm2([-0.62, -0.78]);   // свет на экране: слева сверху
export const LIGHT3 = norm([-0.55, 0.75, 0.45]);   // свет в мире
function norm2(v) { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; }

// ---------------------------------------------------------------- цвет
const hex = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const toHex = c => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export const mix = (a, b, t) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
/** Светлее (k>0, к тёплому) или темнее (k<0, к холодному лиловому) — как в рисованных играх. */
export function tone(h, k) { return k >= 0 ? mix(h, '#fff4dc', k) : mix(h, '#1a1030', -k); }
export const rgba = (h, a) => { const c = hex(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };

/** Материал: base — цвет; metal — блестит; gloss 0..1; emissive — светится (фиолетовые). */
export const MAT = (base, o = {}) => ({ base, hi: o.hi || tone(base, o.metal ? 0.62 : 0.3), lo: o.lo || tone(base, o.metal ? -0.68 : -0.52), metal: !!o.metal, gloss: o.gloss ?? (o.metal ? 1 : 0.25), rim: o.rim, glow: o.glow || null, tex: o.tex || null });

// ---------------------------------------------------------------- геометрия на экране
/** Выпуклая оболочка точек экрана. */
export function hull(pts) {
  const p = pts.slice().sort((a, b) => a.x - b.x || a.y - b.y); if (p.length < 3) return p;
  const cr = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lo = []; for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  const up = []; for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  up.pop(); lo.pop(); return lo.concat(up);
}
/** Гладкий замкнутый контур через точки (кривые через середины). */
export function smooth(g, pts) {
  const n = pts.length; if (n < 3) return;
  const m = i => { const a = pts[(i + n) % n], b = pts[(i + 1 + n) % n]; return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; };
  const s = m(-1); g.moveTo(s.x, s.y);
  for (let i = 0; i < n; i++) { const e = m(i); g.quadraticCurveTo(pts[i].x, pts[i].y, e.x, e.y); }
  g.closePath();
}
const bbox = pts => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of pts) { if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x; if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y; } return { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0 }; };
export const lw = S => Math.max(1.1, S.k * 0.6);

/** Заливка объёмом: свет слева сверху по рамке фигуры; металл — с бликом-полосой. */
export function fillVol(g, S, mat, b, round = true, pth) {
  const r = Math.max(b.w, b.h) * 0.5 + 0.01;
  let gr;
  if (round) { gr = g.createRadialGradient(b.cx + LIGHT2[0] * r * 0.45, b.cy + LIGHT2[1] * r * 0.45, r * 0.05, b.cx, b.cy, r * 1.15); }
  else { gr = g.createLinearGradient(b.cx + LIGHT2[0] * r, b.cy + LIGHT2[1] * r, b.cx - LIGHT2[0] * r, b.cy - LIGHT2[1] * r); }
  stops(gr, mat); g.fillStyle = gr; pth ? g.fill(pth) : g.fill();
}
/** Переходы цвета: блик → цвет → тень → отражённый свет у края. */
export function stops(gr, mat) {
  if (mat.metal) { gr.addColorStop(0, mat.hi); gr.addColorStop(0.2, tone(mat.base, 0.22)); gr.addColorStop(0.5, mat.base); gr.addColorStop(0.8, mat.lo); gr.addColorStop(1, tone(mat.lo, 0.22)); }
  else { gr.addColorStop(0, mat.hi); gr.addColorStop(0.42, mat.base); gr.addColorStop(0.86, mat.lo); gr.addColorStop(1, tone(mat.lo, 0.12)); }
}
/** Обводка и мягкий отражённый свет по нижнему краю (как у иконок). */
export function edge(g, S, mat, b, pth) {
  if (mat.rim !== false) { g.save(); g.clip(pth); g.strokeStyle = rgba(mat.rim || tone(mat.base, 0.15), 0.35); g.lineWidth = lw(S) * 2.2; g.translate(-LIGHT2[0] * lw(S) * 1.1, -LIGHT2[1] * lw(S) * 1.1); g.stroke(pth); g.restore(); }
  g.strokeStyle = OUT; g.lineWidth = lw(S); g.stroke(pth);
}
/** Блик: светлое пятно у края, обращённого к свету. */
export function spec(g, S, b, a = 0.55, size = 0.3) {
  const r = Math.max(b.w, b.h) * size, x = b.cx + LIGHT2[0] * b.w * 0.26, y = b.cy + LIGHT2[1] * b.h * 0.26;
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(255,252,240,${a})`); gr.addColorStop(1, 'rgba(255,252,240,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
}

// ---------------------------------------------------------------- объёмные примитивы
/** Капсула от a до b (мир), радиусы ra, rb — рука, нога, древко. tex(g, путь, рамка) — узор поверх. */
export function capsule(g, S, a, b, ra, rb, mat, tex) {
  const A = proj(a, S), Bp = proj(b, S), r1 = ra * S.k, r2 = rb * S.k;
  const dx = Bp.x - A.x, dy = Bp.y - A.y, L = Math.hypot(dx, dy);
  const pth = new Path2D();
  if (L < Math.abs(r1 - r2) + 0.01) { const r = Math.max(r1, r2), c = r1 > r2 ? A : Bp; pth.arc(c.x, c.y, r, 0, TAU); }
  else {
    const ux = dx / L, uy = dy / L, ang = Math.atan2(uy, ux), sa = Math.asin(clamp((r1 - r2) / L, -1, 1));
    pth.arc(A.x, A.y, r1, ang + Math.PI / 2 + sa, ang - Math.PI / 2 - sa + TAU);
    pth.arc(Bp.x, Bp.y, r2, ang - Math.PI / 2 - sa, ang + Math.PI / 2 + sa);
    pth.closePath();
  }
  // свет поперёк капсулы
  const nx = -dy / (L || 1), ny = dx / (L || 1), side = nx * LIGHT2[0] + ny * LIGHT2[1] > 0 ? 1 : -1, r = Math.max(r1, r2);
  const mx = (A.x + Bp.x) / 2, my = (A.y + Bp.y) / 2;
  const gr = g.createLinearGradient(mx + nx * side * r, my + ny * side * r, mx - nx * side * r, my - ny * side * r);
  stops(gr, mat); g.fillStyle = gr; g.fill(pth);
  const bb = { x0: Math.min(A.x, Bp.x) - r, x1: Math.max(A.x, Bp.x) + r, y0: Math.min(A.y, Bp.y) - r, y1: Math.max(A.y, Bp.y) + r }; bb.cx = (bb.x0 + bb.x1) / 2; bb.cy = (bb.y0 + bb.y1) / 2; bb.w = bb.x1 - bb.x0; bb.h = bb.y1 - bb.y0;
  if (tex) { g.save(); g.clip(pth); tex(g, S, { A, B: Bp, ux: dx / (L || 1), uy: dy / (L || 1), nx, ny, r1, r2, L, bb }); g.restore(); }
  if (mat.metal) { g.save(); g.clip(pth); g.strokeStyle = 'rgba(255,255,245,.3)'; g.lineWidth = r * 0.22; g.lineCap = 'round'; g.beginPath(); g.moveTo(A.x + nx * side * r * 0.5, A.y + ny * side * r * 0.5); g.lineTo(Bp.x + nx * side * r * 0.5, Bp.y + ny * side * r * 0.5); g.stroke(); g.restore(); }
  edge(g, S, mat, bb, pth);
  return { A, B: Bp, nx, ny, side, r, L };
}

/** Конечность с профилем: радиусы r0 (начало), rm (середина — мышца), r1 (конец). Скруглена на концах. */
export function limb(g, S, a, b, r0, rm, r1, mat, tex) {
  const A = proj(a, S), Bp = proj(b, S), dx = Bp.x - A.x, dy = Bp.y - A.y, L = Math.hypot(dx, dy) || 0.001, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  const R = s => (r0 + (r1 - r0) * s + (rm - (r0 + r1) / 2) * Math.sin(Math.PI * s) ** 1.3) * S.k;
  const left = [], right = [], N = 12;
  for (let i = 0; i <= N; i++) { const q = i / N, x = A.x + dx * q, y = A.y + dy * q, r = R(q); left.push([x + nx * r, y + ny * r]); right.push([x - nx * r, y - ny * r]); }
  const pth = new Path2D(); pth.moveTo(left[0][0], left[0][1]); for (const p of left) pth.lineTo(p[0], p[1]);
  const ang = Math.atan2(ny, nx); pth.arc(Bp.x, Bp.y, R(1), ang, ang - Math.PI, true);
  for (let i = N; i >= 0; i--) pth.lineTo(right[i][0], right[i][1]);
  pth.arc(A.x, A.y, R(0), ang + Math.PI, ang, true); pth.closePath();
  const side = nx * LIGHT2[0] + ny * LIGHT2[1] > 0 ? 1 : -1, r = Math.max(R(0), R(0.5), R(1)), mx = (A.x + Bp.x) / 2, my = (A.y + Bp.y) / 2;
  const gr = g.createLinearGradient(mx + nx * side * r, my + ny * side * r, mx - nx * side * r, my - ny * side * r); stops(gr, mat); g.fillStyle = gr; g.fill(pth);
  const bb = { x0: Math.min(A.x, Bp.x) - r, x1: Math.max(A.x, Bp.x) + r, y0: Math.min(A.y, Bp.y) - r, y1: Math.max(A.y, Bp.y) + r }; bb.cx = (bb.x0 + bb.x1) / 2; bb.cy = (bb.y0 + bb.y1) / 2; bb.w = bb.x1 - bb.x0; bb.h = bb.y1 - bb.y0;
  if (tex && S.k >= 1.1) { g.save(); g.clip(pth); tex(g, S, { A, B: Bp, ux, uy, nx, ny, r1: R(0), r2: R(1), L, bb }); g.restore(); }
  if (mat.metal) { g.save(); g.clip(pth); g.strokeStyle = 'rgba(255,255,245,.32)'; g.lineWidth = r * 0.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(A.x + nx * side * R(0) * 0.5, A.y + ny * side * R(0) * 0.5); g.lineTo(Bp.x + nx * side * R(1) * 0.5, Bp.y + ny * side * R(1) * 0.5); g.stroke(); g.restore(); }
  edge(g, S, mat, bb, pth);
  return { A, B: Bp, nx, ny, side, r, L, R };
}
/** Мягкая тень-«затенение» в месте стыка (под головой, под наплечником). */
export function aoAt(g, S, w, rx, ry, a = 0.35) { const p = proj(w, S); const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, rx * S.k); gr.addColorStop(0, `rgba(30,16,30,${a})`); gr.addColorStop(1, 'rgba(30,16,30,0)'); g.save(); g.translate(p.x, p.y); g.scale(1, ry / rx); g.translate(-p.x, -p.y); g.fillStyle = gr; g.fillRect(p.x - rx * S.k, p.y - rx * S.k, rx * 2 * S.k, rx * 2 * S.k); g.restore(); }

/** Точки на сфере (центр c, радиус r, рамка M), где pred(направление в рамке) — оболочка на экране. */
const SPH = []; for (let i = 0; i <= 16; i++) for (let j = 0; j < 28; j++) { const th = i / 16 * Math.PI, ph = j / 28 * TAU; SPH.push([Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)]); }
export function sphereHull(S, c, r, M, pred, extra = [], visOnly = false) {
  const pts = [];
  for (const d of SPH) if (!pred || pred(d)) { const wd = mv(M, d); if (visOnly && dot(wd, CAM.toCam) < -0.04) continue; pts.push(proj(add(c, mul(wd, r)), S)); }
  for (const e of extra) pts.push(proj(add(c, mv(M, e)), S));
  return hull(pts);
}
/** Скруглённый брус (кулак, пряжка): оси ax — три вектора полуразмеров, e — «квадратность» (1 — эллипсоид, 0,5 — почти куб). */
export function boxHull(S, c, ax, e = 0.6, pred = null) {
  const pts = [], f = v => Math.sign(v) * Math.abs(v) ** e;
  for (const d of SPH) { if (pred && !pred(d)) continue; const q = [f(d[0]), f(d[1]), f(d[2])]; pts.push(proj(add(c, add(mul(ax[0], q[0]), add(mul(ax[1], q[1]), mul(ax[2], q[2])))), S)); }
  return hull(pts);
}
/** Нарисовать часть сферы как объём (голова, кулак, наплечник, шлем). */
export function blob(g, S, pts, mat, o = {}) {
  if (pts.length < 3) return null;
  const b = bbox(pts), pth = new Path2D(); smooth(pth, pts); fillVol(g, S, mat, b, true, pth);
  if (o.tex && S.k >= 1.1) { g.save(); g.clip(pth); o.tex(g, S, b); g.restore(); }
  if (mat.metal || o.spec) { g.save(); g.clip(pth); spec(g, S, b, mat.metal ? 0.75 : 0.35, mat.metal ? 0.28 : 0.35); g.restore(); }
  if (mat.glow) { g.save(); g.shadowColor = mat.glow; g.shadowBlur = 6 * S.k / 3; g.strokeStyle = rgba(mat.glow, 0.5); g.lineWidth = lw(S); g.stroke(pth); g.restore(); }
  edge(g, S, mat, b, pth); b.pth = pth; return b;
}
/** Плоский многоугольник в мире (лезвие, пластина): свет по нормали к миру. */
export function plate(g, S, wpts, mat, o = {}) {
  const P = wpts.map(w => proj(w, S));
  const n = norm(cross(sub(wpts[1], wpts[0]), sub(wpts[2], wpts[0])));
  const lit = Math.abs(dot(n, LIGHT3));
  const b = bbox(P), pth = new Path2D(); if (o.round) smooth(pth, P); else { pth.moveTo(P[0].x, P[0].y); for (let i = 1; i < P.length; i++) pth.lineTo(P[i].x, P[i].y); pth.closePath(); }
  const base = tone(mat.base, (lit - 0.5) * (mat.metal ? 0.7 : 0.4));
  const gr = g.createLinearGradient(b.x0, b.y0, b.x1, b.y1); gr.addColorStop(0, tone(base, mat.metal ? 0.45 : 0.2)); gr.addColorStop(0.5, base); gr.addColorStop(1, tone(base, mat.metal ? -0.45 : -0.3));
  g.fillStyle = gr; g.fill(pth);
  if (o.tex) { g.save(); g.clip(pth); o.tex(g, S, b, P, pth); g.restore(); }
  if (mat.glow) { g.save(); g.shadowColor = mat.glow; g.shadowBlur = 8 * S.k / 3; g.strokeStyle = rgba(mat.glow, 0.6); g.lineWidth = lw(S); g.stroke(pth); g.restore(); }
  g.strokeStyle = OUT; g.lineWidth = lw(S); g.stroke(pth);
  return { P, b, lit };
}

/** Кольцо вокруг оси (центр c, рамка M: x,z — плоскость кольца), радиусы rx, rz. Точки мира по углу a (0 — вперёд). */
export const ringPt = (c, M, rx, rz, a, y = 0) => add(c, mv(M, [Math.sin(a) * rx, y, Math.cos(a) * rz]));
/** Видимая (обращённая к зрителю) часть пояса между двумя кольцами: полоса ремня, кромка доспеха, манжета. */
export function band(g, S, c, M, r0, r1, y0, y1, mat, o = {}) {
  const N = 28, A = [], Bv = [];
  for (let i = 0; i <= N; i++) {
    const a = -Math.PI + i / N * TAU, nrm = mv(M, [Math.sin(a), 0, Math.cos(a)]);
    if (dot(nrm, CAM.toCam) < (o.min ?? 0.02)) continue;
    if (o.from != null && (a < o.from || a > o.to)) continue;
    A.push(proj(ringPt(c, M, r0[0], r0[1], a, y0), S)); Bv.push(proj(ringPt(c, M, r1[0], r1[1], a, y1), S));
  }
  if (A.length < 2) return null;
  const P = A.concat(Bv.reverse()), b = bbox(P);
  const pth = new Path2D(); pth.moveTo(P[0].x, P[0].y); for (let i = 1; i < P.length; i++) pth.lineTo(P[i].x, P[i].y); pth.closePath();
  fillVol(g, S, mat, b, false, pth);
  if (o.tex && S.k >= 1.1) { g.save(); g.clip(pth); o.tex(g, S, b, A, Bv); g.restore(); }
  if (mat.metal) { g.save(); g.clip(pth); spec(g, S, b, 0.5, 0.25); g.restore(); }
  g.strokeStyle = OUT; g.lineWidth = lw(S) * (o.thin ? 0.7 : 1); g.stroke(pth);
  return { A, B: Bv, b };
}
/** Точка на поверхности кольца-эллипса, видна ли она зрителю (для пряжек, заклёпок, камней). */
export function surf(c, M, rx, rz, a, y = 0, out = 1) {
  const w = ringPt(c, M, rx * out, rz * out, a, y), n = mv(M, [Math.sin(a), 0, Math.cos(a)]);
  return { w, vis: dot(n, CAM.toCam) };
}

// ---------------------------------------------------------------- мелочи
export function dotAt(g, S, w, r, col, outline = true) { const p = proj(w, S); g.beginPath(); g.arc(p.x, p.y, Math.max(0.6, r * S.k), 0, TAU); g.fillStyle = col; g.fill(); if (outline) { g.strokeStyle = OUT; g.lineWidth = lw(S) * 0.6; g.stroke(); } return p; }
export function gemAt(g, S, w, r, col, glow) {
  const p = proj(w, S), R = Math.max(0.8, r * S.k);
  if (glow) { const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, R * 3.2); gr.addColorStop(0, rgba(glow, 0.7)); gr.addColorStop(1, rgba(glow, 0)); g.fillStyle = gr; g.fillRect(p.x - R * 3.2, p.y - R * 3.2, R * 6.4, R * 6.4); }
  const gr = g.createRadialGradient(p.x - R * 0.3, p.y - R * 0.35, R * 0.1, p.x, p.y, R); gr.addColorStop(0, tone(col, 0.6)); gr.addColorStop(0.5, col); gr.addColorStop(1, tone(col, -0.55));
  g.beginPath(); g.moveTo(p.x, p.y - R); g.lineTo(p.x + R, p.y); g.lineTo(p.x, p.y + R); g.lineTo(p.x - R, p.y); g.closePath(); g.fillStyle = gr; g.fill(); g.strokeStyle = OUT; g.lineWidth = lw(S) * 0.6; g.stroke();
  g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(p.x - R * 0.3, p.y - R * 0.35, R * 0.25, 0, TAU); g.fill();
}
export function lineW(g, S, pts, col, w, cap = 'round') { g.strokeStyle = col; g.lineWidth = w * S.k; g.lineCap = cap; g.beginPath(); pts.forEach((w0, i) => { const p = proj(w0, S); i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y); }); g.stroke(); }
