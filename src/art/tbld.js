// v101: постройки столицы в мультяшном стиле (STYLE.md) — набор деталей и первый дом: банк.
// Проекция как в bld2.js: x — вдоль лица, y — в глубину (вверх-вправо), z — вверх; P(x,y,z) → экран. Всё ×1,35 (SC), как BLD2.
// Камни-подушки, толстые карнизы, пухлая черепица «чешуйками», круглые колонны, двери с железом, окна с глянцем.
const TAU = Math.PI * 2, SC = 1.35;
// v101: вид прямо спереди и чуть сверху (как сундук, стены и рынок): лицо целиком, крыша видна сверху, боковых стен нет
const KX = 0, KY = 0.5, P = (x, y, z) => [x + y * KX, -z - y * KY];
const sh = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join(''); };
const ink = col => sh(col, -0.6);
const rnd = s => { s = Math.abs(s | 0) || 1; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; };
export const TB = { gold: '#f0c24a', iron: '#4a4c58', glass: '#5a86b0', wood: '#7a4a28' };
function paint(g, col, lw = 1.4, y0, y1, k = 0.16) {
  if (y0 != null) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, sh(col, k)); gr.addColorStop(1, sh(col, -k)); g.fillStyle = gr; } else g.fillStyle = col;
  g.fill(); if (lw) { g.strokeStyle = ink(col); g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); }
}
const shine = (g, x, y, rx, ry, a = 0.4, rot = -0.35) => { g.fillStyle = `rgba(255,255,255,${a})`; g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU); g.fill(); };
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2))); };
const poly = (g, pts) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
function block(g, x, y, w, h, col, r = 4) { if (w < 1 || h < 1) return; rr(g, x, y, w, h, r); paint(g, col, 1.1, y, y + h, 0.14); if (w > 8 && h > 5) { g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 1.1; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + 3, y + 2); g.lineTo(x + w * 0.45, y + 2); g.stroke(); } }
/** Кладка подушками в плоскости стены: (u, v) — по стене вдоль и вверх; m — как класть в экран. */
function stoneWall(g, pts, m, w, h, col, seed, row = 14) {
  const r = rnd(seed); g.save(); poly(g, pts); g.clip(); poly(g, pts); g.fillStyle = sh(col, -0.38); g.fill();
  g.save(); g.transform(...m);
  for (let v = 0, i = 0; v < h + row; v += row, i++) { let u = -(i % 2 ? row * 0.9 : r() * row); while (u < w) { const bw = row * (1.4 + r() * 1.2); block(g, u + 1, -v - row + 1, bw - 2, row - 2, sh(col, (r() - 0.5) * 0.08), 4); u += bw; } }
  g.restore();
  const ys = pts.map(p => p[1]); const gr = g.createLinearGradient(0, Math.min(...ys), 0, Math.max(...ys)); gr.addColorStop(0, 'rgba(255,250,235,.08)'); gr.addColorStop(1, 'rgba(20,12,6,.16)'); g.fillStyle = gr; poly(g, pts); g.fill();
  g.restore(); poly(g, pts); g.strokeStyle = ink(col); g.lineWidth = 1.8; g.stroke();
}
/** Корпус: лицо и правая стена камнями-подушками, цоколь. */
export function walls(g, w, d, H, col, seed) {
  const s = [P(w / 2, 0, 0), P(w / 2, d, 0), P(w / 2, d, H), P(w / 2, 0, H)], f = [P(-w / 2, 0, 0), P(w / 2, 0, 0), P(w / 2, 0, H), P(-w / 2, 0, H)];
  const o = P(w / 2, 0, 0); if (KX) stoneWall(g, s, [KX, -KY, 0, 1, o[0], o[1]], d, H, sh(col, -0.2), seed + 1);
  stoneWall(g, f, [1, 0, 0, 1, -w / 2, 0], w, H, col, seed);
  const cb = [P(-w / 2 - 2, 0, 0), P(w / 2 + 2, 0, 0), P(w / 2 + 2, 0, 12), P(-w / 2 - 2, 0, 12)]; poly(g, cb); paint(g, sh(col, -0.25), 1.4, -12, 0);
  if (KX) { const sb = [P(w / 2 + 2, 0, 0), P(w / 2 + 2, d, 0), P(w / 2 + 2, d, 12), P(w / 2 + 2, 0, 12)]; poly(g, sb); paint(g, sh(col, -0.4), 1.3); }
  // карниз под крышей
  const kf = [P(-w / 2 - 4, -3, H - 2), P(w / 2 + 4, -3, H - 2), P(w / 2 + 4, -3, H + 6), P(-w / 2 - 4, -3, H + 6)]; poly(g, kf); paint(g, sh(col, 0.12), 1.5);
  if (KX) { const ks = [P(w / 2 + 4, -3, H - 2), P(w / 2 + 4, d + 3, H - 2), P(w / 2 + 4, d + 3, H + 6), P(w / 2 + 4, -3, H + 6)]; poly(g, ks); paint(g, sh(col, -0.15), 1.3); }
}
/** Черепица «чешуйками» в четырёхугольнике (a,b — край свеса, c,d — к коньку). */
function scales(g, quad, col, k = 0, plain = false) {
  const [a, b, c, d] = quad, base = sh(col, k); g.save(); poly(g, quad); g.clip(); poly(g, quad); g.fillStyle = plain ? base : sh(base, -0.3); g.fill();
  const L = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  if (plain) { for (let i = 1; i < 7; i++) { const t = i / 7, p0 = L(a, d, t), p1 = L(b, c, t); g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.strokeStyle = sh(base, -0.3); g.lineWidth = 1.6; g.stroke(); g.beginPath(); g.moveTo(p0[0], p0[1] + 1.6); g.lineTo(p1[0], p1[1] + 1.6); g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1.2; g.stroke(); } }
  else {
  const dv = Math.abs(((a[1] + b[1]) - (c[1] + d[1])) / 2), rows = Math.max(3, Math.round(dv / 11)), rh = Math.max(7, dv / rows);
  for (let i = 0; i <= rows; i++) { const t = i / rows, p0 = L(a, d, t), p1 = L(b, c, t), len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), n = Math.max(1, Math.round(len / 14)), off = i % 2 ? 0.5 : 0;
    for (let j = -1; j <= n; j++) { const q = (j + off) / n, x = p0[0] + (p1[0] - p0[0]) * q, y = p0[1] + (p1[1] - p0[1]) * q, hw = len / n / 2 + 0.5, sh2 = rh * 0.85;
      g.beginPath(); g.moveTo(x - hw, y - rh); g.lineTo(x - hw, y); g.quadraticCurveTo(x - hw, y + sh2, x, y + sh2 + 0.5); g.quadraticCurveTo(x + hw, y + sh2, x + hw, y); g.lineTo(x + hw, y - rh); g.closePath();
      g.fillStyle = sh(base, ((i + j) % 3 === 0 ? 0.08 : 0) - t * 0.06); g.fill(); g.strokeStyle = ink(base); g.lineWidth = 0.9; g.stroke(); } } }
  const ys = quad.map(p => p[1]); const gr = g.createLinearGradient(0, Math.min(...ys), 0, Math.max(...ys)); gr.addColorStop(0, 'rgba(255,255,255,.16)'); gr.addColorStop(1, 'rgba(0,0,20,.08)'); g.fillStyle = gr; poly(g, quad); g.fill();
  g.restore(); poly(g, quad); g.strokeStyle = ink(col); g.lineWidth = 1.8; g.stroke();
}
/** Черепица «чешуйками» горизонтальными рядами в любом многоугольнике (вид спереди-сверху). */
function scalesH(g, pts, col, k = 0, rh = 10, sw = 14) {
  const base = sh(col, k), ys = pts.map(p => p[1]), xs = pts.map(p => p[0]), y0 = Math.min(...ys), y1 = Math.max(...ys), x0 = Math.min(...xs), x1 = Math.max(...xs);
  g.save(); poly(g, pts); g.clip(); g.fillStyle = sh(base, -0.3); g.fillRect(x0 - 2, y0 - 2, x1 - x0 + 4, y1 - y0 + 4);
  const nr = Math.ceil((y1 - y0) / rh) + 2;
  for (let i = nr; i >= 0; i--) { const y = y0 - rh + i * rh, off = i % 2 ? sw / 2 : 0, t = (y - y0) / Math.max(1, y1 - y0);
    for (let x = x0 - sw + off; x < x1 + sw; x += sw) { const hw = sw / 2 + 0.4; g.beginPath(); g.moveTo(x - hw, y - rh); g.lineTo(x - hw, y); g.quadraticCurveTo(x - hw, y + rh * 0.85, x, y + rh * 0.88); g.quadraticCurveTo(x + hw, y + rh * 0.85, x + hw, y); g.lineTo(x + hw, y - rh); g.closePath();
      g.fillStyle = sh(base, (((x / sw | 0) + i) % 3 === 0 ? 0.08 : 0) + (0.5 - t) * 0.12); g.fill(); g.strokeStyle = ink(base); g.lineWidth = 0.9; g.stroke(); } }
  g.restore(); poly(g, pts); g.strokeStyle = ink(col); g.lineWidth = 1.8; g.stroke();
}
/** Вальмовая крыша пухлой черепицей, конёк с шарами. */
export function hipRoof(g, w, d, H, rh, col, e = 14) {
  const inset = Math.min(w * 0.3, 60);
  if (!KX) {   // вид спереди-сверху: крыша — трапеция, бока-вальмы темнее; верх — на высоте ската и половине глубины
    const top = -H - rh - d * KY * 0.45, fa = [-w / 2 - e, -H + 2], fb = [w / 2 + e, -H + 2], r0 = [-w / 2 + inset, top], r1 = [w / 2 - inset, top];
    scalesH(g, [fa, r0, [-w / 2 + inset * 0.55, -H + 2]], col, -0.04);
    scalesH(g, [fb, r1, [w / 2 - inset * 0.55, -H + 2]], col, -0.26);
    scalesH(g, [[-w / 2 + inset * 0.55, -H + 2], r0, r1, [w / 2 - inset * 0.55, -H + 2]], col, 0.04);
    poly(g, [fa, r0, r1, fb]); g.strokeStyle = ink(col); g.lineWidth = 2; g.stroke();
    for (const [a, b] of [[r0, [-w / 2 + inset * 0.55, -H + 2]], [r1, [w / 2 - inset * 0.55, -H + 2]]]) { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.strokeStyle = ink(col); g.lineWidth = 3.4; g.stroke(); g.strokeStyle = sh(col, 0.2); g.lineWidth = 1.6; g.stroke(); }
    g.beginPath(); g.moveTo(r0[0], r0[1]); g.lineTo(r1[0], r1[1]); g.strokeStyle = ink(col); g.lineWidth = 6.4; g.lineCap = 'round'; g.stroke(); g.strokeStyle = sh(col, 0.2); g.lineWidth = 4; g.stroke();
    for (const p of [r0, r1]) { g.beginPath(); g.arc(p[0], p[1] - 3, 4, 0, TAU); paint(g, TB.gold, 1.2); shine(g, p[0] - 1.2, p[1] - 4.4, 1.4, 1, 0.8); }
    g.beginPath(); g.moveTo(fa[0] - 1, fa[1] - 2); g.lineTo(fb[0] + 1, fb[1] - 2); g.lineTo(fb[0] + 1, fb[1] + 5); g.lineTo(fa[0] - 1, fa[1] + 5); g.closePath(); paint(g, sh(col, -0.35), 1.4);
    return { r0, r1 };
  }
  const r0 = P(-w / 2 + inset, d / 2, H + rh), r1 = P(w / 2 - inset, d / 2, H + rh);
  const fa = P(-w / 2 - e, -e * 0.6, H + 2), fb = P(w / 2 + e, -e * 0.6, H + 2), ba = P(-w / 2 - e, d + e * 0.6, H + 2), bb = P(w / 2 + e, d + e * 0.6, H + 2);
  scalesH(g, [ba, bb, r1, r0], col, -0.2);
  scalesH(g, [fb, bb, r1], col, -0.24);
  scalesH(g, [fa, ba, r0], col, -0.06);
  scalesH(g, [fa, fb, r1, r0], col, 0.02);
  g.beginPath(); g.moveTo(r0[0], r0[1]); g.lineTo(r1[0], r1[1]); g.strokeStyle = ink(col); g.lineWidth = 6.4; g.lineCap = 'round'; g.stroke(); g.strokeStyle = sh(col, 0.15); g.lineWidth = 4; g.stroke();
  for (const p of [r0, r1]) { g.beginPath(); g.arc(p[0], p[1] - 3, 4, 0, TAU); paint(g, TB.gold, 1.2); shine(g, p[0] - 1.2, p[1] - 4.4, 1.4, 1, 0.8); }
  // толстый свес спереди
  g.beginPath(); g.moveTo(fa[0] - 1, fa[1] - 1); g.lineTo(fb[0] + 1, fb[1] - 1); g.lineTo(fb[0] + 1, fb[1] + 5); g.lineTo(fa[0] - 1, fa[1] + 5); g.closePath(); paint(g, sh(col, -0.35), 1.4);
  return { r0, r1 };
}
/** Окно: каменный наличник с полукруглым верхом, переплёт, глянец, решётка, подоконник с цветами. */
export function windowT(g, x, y, w, h, opt = {}) {
  const frame = opt.frame || '#e8e0cc', lit = opt.lit;
  g.beginPath(); g.moveTo(x - w / 2 - 5, y + 2); g.lineTo(x - w / 2 - 5, y - h + w / 2); g.arc(x, y - h + w / 2, w / 2 + 5, Math.PI, 0); g.lineTo(x + w / 2 + 5, y + 2); g.closePath(); paint(g, frame, 1.4, y - h - 5, y);
  const hole = () => { g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x - w / 2, y - h + w / 2); g.arc(x, y - h + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w / 2, y); g.closePath(); };
  hole(); const gr = g.createLinearGradient(x - w / 2, y - h, x + w / 2, y); gr.addColorStop(0, lit ? '#fff0b0' : sh(TB.glass, 0.35)); gr.addColorStop(1, lit ? '#e8a040' : sh(TB.glass, -0.25)); g.fillStyle = gr; g.fill(); g.strokeStyle = ink(frame); g.lineWidth = 1.4; g.stroke();
  g.save(); hole(); g.clip(); g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.moveTo(x - w / 2, y - h * 0.3); g.lineTo(x - w / 2 + w * 0.3, y - h); g.lineTo(x - w / 2 + w * 0.48, y - h); g.lineTo(x - w / 2, y - h * 0.05); g.closePath(); g.fill(); g.restore();
  g.strokeStyle = sh(frame, -0.3); g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x, y); g.moveTo(x - w / 2, y - h * 0.45); g.lineTo(x + w / 2, y - h * 0.45); g.stroke();
  if (opt.bars) { g.strokeStyle = TB.iron; g.lineWidth = 1.8; for (let k = 1; k < 4; k++) { if (k === 2) continue; g.beginPath(); g.moveTo(x - w / 2 + k * w / 4, y - h + 3); g.lineTo(x - w / 2 + k * w / 4, y); g.stroke(); } }
  rr(g, x - w / 2 - 8, y, w + 16, 5, 2.5); paint(g, sh(frame, -0.05), 1.3);
  if (opt.flowers) { rr(g, x - w / 2 - 4, y + 5, w + 8, 7, 2.5); paint(g, '#a8643a', 1.2); for (let i = 0; i < 5; i++) { const fx = x - w / 2 + i * (w / 4); g.beginPath(); g.arc(fx, y + 3, 3, 0, TAU); paint(g, i % 2 ? '#e86a6a' : '#f0c24a', 0.9); } }
}
/** Дверь: арка, доски, железные полосы, кольцо-ручка; ступень. */
export function doorT(g, x, w, h, col = TB.wood, opt = {}) {
  const hole = () => { g.beginPath(); g.moveTo(x - w / 2, 0); g.lineTo(x - w / 2, -h + w / 2); g.arc(x, -h + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w / 2, 0); g.closePath(); };
  if (opt.frame) { g.beginPath(); g.moveTo(x - w / 2 - 7, 0); g.lineTo(x - w / 2 - 7, -h + w / 2); g.arc(x, -h + w / 2, w / 2 + 7, Math.PI, 0); g.lineTo(x + w / 2 + 7, 0); g.closePath(); paint(g, opt.frame, 1.6, -h - 7, 0); for (let k = 0; k <= 6; k++) { const a = Math.PI + k * Math.PI / 6; g.strokeStyle = ink(opt.frame); g.lineWidth = 1; g.beginPath(); g.moveTo(x + Math.cos(a) * w / 2, -h + w / 2 + Math.sin(a) * w / 2); g.lineTo(x + Math.cos(a) * (w / 2 + 7), -h + w / 2 + Math.sin(a) * (w / 2 + 7)); g.stroke(); } }
  hole(); paint(g, col, 1.6, -h, 0);
  g.save(); hole(); g.clip(); for (let k = 0; k < 4; k++) { const px = x - w / 2 + k * w / 4; rr(g, px + 0.6, -h, w / 4 - 1.2, h, 2); paint(g, sh(col, k % 2 ? 0.06 : -0.04), 1, -h, 0, 0.1); }
  for (const by of [0.28, 0.7]) { rr(g, x - w / 2, -h * by - 2.6, w, 5.2, 2); paint(g, TB.iron, 1.1); for (const rx of [x - w / 2 + 4, x - 3, x + w / 2 - 6]) { g.beginPath(); g.arc(rx + 1, -h * by, 1.2, 0, TAU); g.fillStyle = '#c8ccd6'; g.fill(); } }
  g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x, -h, w / 2, h); g.restore();
  hole(); g.strokeStyle = ink(col); g.lineWidth = 1.8; g.stroke();
  g.beginPath(); g.arc(x + w * 0.28, -h * 0.5, 3.4, 0, TAU); g.strokeStyle = ink(TB.gold); g.lineWidth = 2.6; g.stroke(); g.strokeStyle = TB.gold; g.lineWidth = 1.4; g.stroke();
}
/** Колонна: база-подушка, ствол с каннелюрами и бликом, капитель с завитками. Начало — низ. */
export function column(g, x, y, h, r, col = '#efe8d8') {
  rr(g, x - r - 4, y - 7, r * 2 + 8, 7, 3); paint(g, sh(col, -0.06), 1.3); rr(g, x - r - 2, y - 12, r * 2 + 4, 6, 3); paint(g, col, 1.2);
  rr(g, x - r, y - h + 12, r * 2, h - 24, r * 0.6); const gr = g.createLinearGradient(x - r, 0, x + r, 0); gr.addColorStop(0, sh(col, 0.2)); gr.addColorStop(0.45, col); gr.addColorStop(1, sh(col, -0.28)); g.fillStyle = gr; g.fill(); g.strokeStyle = ink(col); g.lineWidth = 1.5; g.stroke();
  g.strokeStyle = sh(col, -0.22); g.lineWidth = 1; for (const k of [-0.5, 0, 0.5]) { g.beginPath(); g.moveTo(x + k * r, y - h + 16); g.lineTo(x + k * r, y - 16); g.stroke(); }
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1.8; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - r * 0.55, y - h + 18); g.lineTo(x - r * 0.55, y - 18); g.stroke();
  rr(g, x - r - 2, y - h + 7, r * 2 + 4, 6, 3); paint(g, col, 1.2);
  for (const s of [-1, 1]) { g.beginPath(); g.arc(x + s * (r + 1), y - h + 5, 3.6, 0, TAU); paint(g, sh(col, 0.05), 1.2); g.beginPath(); g.arc(x + s * (r + 1), y - h + 5, 1.4, 0, TAU); g.strokeStyle = ink(col); g.lineWidth = 0.9; g.stroke(); }
  rr(g, x - r - 6, y - h, r * 2 + 12, 5, 2); paint(g, sh(col, 0.08), 1.3);
}
/** Фонарь на столбе с тёплым стеклом. */
export function lampT(g, x, y, lit = false) {
  rr(g, x - 2, y - 30, 4, 30, 2); paint(g, TB.iron, 1.2); rr(g, x - 5, y - 4, 10, 4, 2); paint(g, TB.iron, 1);
  rr(g, x - 6, y - 44, 12, 14, 3); paint(g, lit ? '#ffd870' : '#f4dca0', 1.3, y - 44, y - 30); g.strokeStyle = TB.iron; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y - 44); g.lineTo(x, y - 30); g.stroke();
  g.beginPath(); g.moveTo(x - 8, y - 44); g.quadraticCurveTo(x, y - 54, x + 8, y - 44); g.closePath(); paint(g, TB.iron, 1.1); g.beginPath(); g.arc(x, y - 52, 2, 0, TAU); paint(g, TB.gold, 0.8);
}
/** Куст в кадке. */
function shrub(g, x, y) { rr(g, x - 9, y - 13, 18, 13, 3); paint(g, '#b06a3a', 1.3, y - 13, y); g.strokeStyle = '#7a4420'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 9, y - 9); g.lineTo(x + 9, y - 9); g.stroke(); for (const [dx, dy, r] of [[-5, -18, 7], [5, -18, 7], [0, -25, 8]]) { g.beginPath(); g.arc(x + dx, y + dy, r, 0, TAU); paint(g, '#5f9a44', 1.2, y + dy - r, y + dy + r); } shine(g, x - 3, y - 28, 3, 1.6, 0.35); }
/** Тень у постройки (слабая: мягкий контур её усиливает). */
function shadowAt(g, w, d) { if (!KX) { g.fillStyle = 'rgba(20,12,6,.05)'; g.beginPath(); g.ellipse(6, 2, w * 0.62, 14, 0, 0, TAU); g.fill(); return; } const a = P(-w / 2, 0, 0), b = P(w / 2, 0, 0), c = P(w / 2, d, 0), e = P(-w / 2, d, 0); g.fillStyle = 'rgba(20,12,6,.06)'; g.beginPath(); g.moveTo(a[0] - 12, a[1] + 10); g.lineTo(b[0] + 18, b[1] + 10); g.lineTo(c[0] + 18, c[1]); g.lineTo(e[0] - 12, e[1]); g.closePath(); g.fill(); }

// ---------------------------------------------------------------- банк
/** Банк: светлый камень, синяя черепица вальмой, портик из 4 колонн с фронтоном и золотой монетой, широкие ступени,
 *  окованная дверь, окна с решётками, фонари, кусты в кадках, мешки с монетами у дверей. Начало — середина фасада у земли. */
function bank(g, t = 0) {
  const w = 220, d = 150, H = 110, stone = '#d8cfba';
  shadowAt(g, w, d);
  walls(g, w, d, H, stone, 31);
  // окно на правой стене (в перспективе)
  hipRoof(g, w, d, H, 46, '#3e6aa8');
  // окна по бокам портика
  for (const x of [-52, 52]) windowT(g, x, -30, 24, 40, { bars: true, flowers: true });
  // дверь
  doorT(g, 0, 40, 78, '#6a3e22', { frame: sh(stone, 0.08) });
  // ступени: три широкие, скруглённые
  for (let k = 0; k < 3; k++) { rr(g, -w / 2 - 10 + k * 7, -k * 6 - 6, w + 20 - k * 14, 7, 3); paint(g, sh(stone, 0.06 - k * 0.03), 1.4); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-w / 2 - 6 + k * 7, -k * 6 - 4.8); g.lineTo(w / 2 + 2 - k * 7, -k * 6 - 4.8); g.stroke(); }
  // портик: антаблемент, колонны, фронтон
  const cols = [-80, -28, 28, 80];
  for (const x of cols) column(g, x, -18, H - 8, 7.5, '#f2ecdc');
  rr(g, -w / 2 + 2, -H - 6, w - 4, 16, 4); paint(g, '#efe7d4', 1.7, -H - 6, -H + 10); for (let x = -w / 2 + 14; x < w / 2 - 8; x += 18) { if (Math.abs(x + 4) < 36) continue; rr(g, x, -H + 1, 8, 5, 2); paint(g, '#e2d8c2', 0.9); }
  g.fillStyle = '#5a3a1c'; g.font = 'bold 11px Georgia, serif'; g.textAlign = 'center'; g.fillText('Б А Н К', 0, -H + 7);
  g.beginPath(); g.moveTo(-w / 2 - 4, -H - 6); g.lineTo(w / 2 + 4, -H - 6); g.quadraticCurveTo(w / 4, -H - 26, 0, -H - 42); g.quadraticCurveTo(-w / 4, -H - 26, -w / 2 - 4, -H - 6); g.closePath(); paint(g, '#f2ead8', 1.8, -H - 42, -H - 6);
  g.beginPath(); g.moveTo(-w / 2 + 14, -H - 10); g.lineTo(w / 2 - 14, -H - 10); g.quadraticCurveTo(w / 4 - 6, -H - 24, 0, -H - 34); g.quadraticCurveTo(-w / 4 + 6, -H - 24, -w / 2 + 14, -H - 10); g.closePath(); paint(g, '#e2d8c2', 1.2);
  // золотая монета в фронтоне с венком
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { const a = Math.PI / 2 + s * (0.6 + k * 0.32), x = Math.cos(a) * 15, y = -H - 20 + Math.sin(a) * 9; g.beginPath(); g.ellipse(x, y, 3.6, 1.8, a, 0, TAU); paint(g, '#7cb05a', 0.9); }
  g.beginPath(); g.arc(0, -H - 22, 10, 0, TAU); paint(g, TB.gold, 1.6, -H - 32, -H - 12); g.beginPath(); g.arc(0, -H - 22, 7, 0, TAU); g.strokeStyle = sh(TB.gold, -0.3); g.lineWidth = 1.2; g.stroke();
  g.fillStyle = sh(TB.gold, -0.45); g.font = 'bold 10px Georgia, serif'; g.fillText('₵', 0, -H - 18.5); shine(g, -3.6, -H - 26, 3, 1.8, 0.75);
  // кусты в кадках, мешки с монетами (фонари — у улицы)
  shrub(g, -w / 2 - 16, 8); shrub(g, w / 2 + 22, 8);
  for (const [x, s] of [[30, 1], [40, 0.8]]) { g.save(); g.translate(x, -18); g.scale(s, s); g.beginPath(); g.moveTo(-6, 0); g.quadraticCurveTo(-9, -8, -3, -12); g.lineTo(3, -12); g.quadraticCurveTo(9, -8, 6, 0); g.quadraticCurveTo(0, 2, -6, 0); g.closePath(); paint(g, '#c8a060', 1.1); g.strokeStyle = '#7a5a2a'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(-3.4, -11); g.lineTo(3.4, -11); g.stroke(); g.beginPath(); g.arc(0, -5, 2.6, 0, TAU); paint(g, TB.gold, 0.8); g.restore(); }
}

const scaled = f => (g, a, b) => { g.save(); g.scale(SC, SC); f(g, a, b); g.restore(); };
export const TBLD = { bank: scaled(bank) };
