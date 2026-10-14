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


// ================================================================ v102: все остальные постройки (тот же вид спереди-сверху)
const LOG = '#a8743e', PLANK = '#b08048', THATCH = '#d8b456', TILE = '#c4503a', SLATE = '#5e6474', SHINGLE = '#7a5236', MOSS = '#6f9a44';
/** Кладка подушками в прямоугольнике (x, y — левый верх). */
function stoneRect(g, x, y, w, h, col, seed, row = 14) { stoneWall(g, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], [1, 0, 0, 1, x, y + h], w, h, col, seed, row); }
/** Бревенчатая стена: круглые брёвна рядами, торцы с кольцами по краям. */
function logWall(g, x, y, w, h, col = LOG, ends = true) {
  g.save(); g.beginPath(); g.rect(x - 8, y, w + 16, h); g.clip();
  for (let yy = y + h - 11, i = 0; yy > y - 11; yy -= 10.5, i++) {
    rr(g, x - 2, yy, w + 4, 11, 5.5); paint(g, sh(col, (i % 2 ? 0.04 : -0.03)), 1.2, yy, yy + 11, 0.22);
    g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x + 4, yy + 2.6); g.lineTo(x + w - 4, yy + 2.6); g.stroke();
    if (ends) for (const ex of [x - 3, x + w + 3]) { g.beginPath(); g.arc(ex, yy + 5.5, 5.4, 0, TAU); paint(g, sh(col, 0.25), 1.1); g.beginPath(); g.arc(ex, yy + 5.5, 2.6, 0, TAU); g.strokeStyle = sh(col, -0.25); g.lineWidth = 0.8; g.stroke(); }
  }
  g.restore();
}
/** Стена из вертикальных досок. */
function plankWall(g, x, y, w, h, col = PLANK) { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.fillStyle = sh(col, -0.4); g.fillRect(x, y, w, h); for (let xx = x; xx < x + w; xx += 12) { rr(g, xx + 0.5, y - 3, 11, h + 6, 4); paint(g, sh(col, ((xx / 12) | 0) % 3 === 0 ? 0.06 : -0.02), 1, y, y + h, 0.12); g.strokeStyle = 'rgba(255,255,255,.2)'; g.lineWidth = 1; g.beginPath(); g.moveTo(xx + 3, y + 2); g.lineTo(xx + 3, y + h - 2); g.stroke(); } g.restore(); rr(g, x, y, w, h, 2); g.strokeStyle = ink(col); g.lineWidth = 1.6; g.stroke(); }
/** Штукатурка с балками фахверка. */
function plasterWall(g, x, y, w, h, col = '#efe2c4', beam = '#6a4224', seed = 3) {
  const r = rnd(seed); rr(g, x, y, w, h, 3); paint(g, col, 1.4, y, y + h, 0.08);
  g.save(); rr(g, x, y, w, h, 3); g.clip(); for (let i = 0; i < 10; i++) { g.fillStyle = r() < 0.5 ? 'rgba(0,0,0,.04)' : 'rgba(255,255,255,.12)'; g.beginPath(); g.ellipse(x + r() * w, y + r() * h, 10 + r() * 14, 5 + r() * 6, 0, 0, TAU); g.fill(); } g.restore();
  const bar = (x1, y1, x2, y2) => { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineCap = 'round'; g.strokeStyle = ink(beam); g.lineWidth = 6.4; g.stroke(); g.strokeStyle = beam; g.lineWidth = 4.4; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1.2; g.stroke(); };
  bar(x + 2, y + 3, x + w - 2, y + 3); bar(x + 2, y + h - 3, x + w - 2, y + h - 3);
  const n = Math.max(2, Math.round(w / 60)); for (let k = 0; k <= n; k++) bar(x + 3 + k * (w - 6) / n, y + 3, x + 3 + k * (w - 6) / n, y + h - 3);
  for (let k = 0; k < n; k += 2) { const a = x + 3 + k * (w - 6) / n, b = x + 3 + (k + 1) * (w - 6) / n; bar(a, y + h - 3, b, y + 3); }
}
/** Черепица и другие кровли в многоугольнике. */
function roofFill(g, pts, col, kind, k = 0) {
  if (kind === 'tile' || kind === 'slate') { scalesH(g, pts, col, k, kind === 'slate' ? 8 : 10, kind === 'slate' ? 11 : 14); return; }
  const base = sh(col, k), ys = pts.map(p => p[1]), xs = pts.map(p => p[0]), y0 = Math.min(...ys), y1 = Math.max(...ys), x0 = Math.min(...xs), x1 = Math.max(...xs), r = rnd(Math.round(x0 * 7 + y0));
  g.save(); poly(g, pts); g.clip(); g.fillStyle = sh(base, -0.25); g.fillRect(x0 - 2, y0 - 2, x1 - x0 + 4, y1 - y0 + 4);
  if (kind === 'shingle') { const rh = 9; for (let y = y1, i = 0; y > y0 - rh; y -= rh, i++) for (let x = x0 - (i % 2) * 10; x < x1 + 20; x += 20) { rr(g, x + 0.5, y - rh - 2, 19, rh + 3, 3.5); paint(g, sh(base, (r() - 0.5) * 0.12 + (y - y0) / (y1 - y0 + 1) * -0.08), 1, y - rh, y + 1, 0.1); } }
  else if (kind === 'thatch') { for (let y = y1, i = 0; y > y0 - 10; y -= 9, i++) { g.beginPath(); g.moveTo(x0 - 4, y); for (let x = x0 - 4; x < x1 + 8; x += 8) g.quadraticCurveTo(x + 4, y + 5, x + 8, y); g.lineTo(x1 + 8, y - 12); g.lineTo(x0 - 4, y - 12); g.closePath(); paint(g, sh(base, i % 2 ? 0.06 : -0.02), 1.1, y - 12, y + 4, 0.14); g.strokeStyle = sh(base, -0.3); g.lineWidth = 0.7; for (let x = x0; x < x1; x += 4.5) { g.beginPath(); g.moveTo(x, y - 9); g.lineTo(x + 1, y - 1); g.stroke(); } } }
  else if (kind === 'moss') { for (let i = 0; i < (x1 - x0) * (y1 - y0) / 140; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), rad = 7 + r() * 8; g.beginPath(); g.arc(x, y, rad, 0, TAU); paint(g, sh(base, (r() - 0.5) * 0.18), 1, y - rad, y + rad); } for (let i = 0; i < 9; i++) { const x = x0 + 12 + r() * (x1 - x0 - 24), y = y0 + 8 + r() * (y1 - y0 - 12); g.beginPath(); g.arc(x, y, 2.6, 0, TAU); paint(g, ['#f0c24a', '#e86a8a', '#f4f0e0'][i % 3], 0.8); } }
  const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(255,255,255,.14)'); gr.addColorStop(1, 'rgba(0,0,20,.1)'); g.fillStyle = gr; poly(g, pts); g.fill();
  g.restore(); poly(g, pts); g.strokeStyle = ink(col); g.lineWidth = 1.9; g.stroke();
}
/** Крыша коньком вдоль фасада (двускатная или вальмой): трапеция над стеной, свес, конёк. Возвращает верх. */
function roofSide(g, w, d, H, rh, col, kind, hip = false, e = 14) {
  const top = -H - rh - d * KY * 0.45, ins = hip ? Math.min(w * 0.28, 56) : 6, fa = [-w / 2 - e, -H + 3], fb = [w / 2 + e, -H + 3], r0 = [-w / 2 + ins - (hip ? 0 : e), top], r1 = [w / 2 - ins + (hip ? 0 : e), top];
  if (hip) { roofFill(g, [fa, r0, [-w / 2 + ins * 0.55, -H + 3]], col, kind, -0.06); roofFill(g, [fb, r1, [w / 2 - ins * 0.55, -H + 3]], col, kind, -0.24); roofFill(g, [[-w / 2 + ins * 0.55, -H + 3], r0, r1, [w / 2 - ins * 0.55, -H + 3]], col, kind, 0.03);
    for (const [a, b] of [[r0, [-w / 2 + ins * 0.55, -H + 3]], [r1, [w / 2 - ins * 0.55, -H + 3]]]) { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.strokeStyle = ink(col); g.lineWidth = 3.2; g.stroke(); g.strokeStyle = sh(col, 0.2); g.lineWidth = 1.5; g.stroke(); } }
  else roofFill(g, [fa, r0, r1, fb], col, kind, 0.02);
  g.beginPath(); g.moveTo(r0[0], r0[1]); g.lineTo(r1[0], r1[1]); g.lineCap = 'round'; g.strokeStyle = ink(col); g.lineWidth = 6.6; g.stroke(); g.strokeStyle = sh(col, 0.18); g.lineWidth = 4.2; g.stroke();
  g.beginPath(); g.moveTo(fa[0] - 1, fa[1] - 2); g.quadraticCurveTo(0, fa[1] + 1, fb[0] + 1, fb[1] - 2); g.lineTo(fb[0] + 1, fb[1] + 4); g.quadraticCurveTo(0, fa[1] + 7, fa[0] - 1, fa[1] + 4); g.closePath(); paint(g, sh(col, -0.32), 1.4);
  return top;
}
/** Крыша фронтоном к нам: два ската уходят назад, треугольник фронтона — стена (fill). */
function roofFront(g, w, d, H, rh, col, kind, gable, e = 12) {
  const dd = d * KY * 0.55, ax = 0, ay = -H - rh, L = [-w / 2 - e, -H + 4], R = [w / 2 + e, -H + 4];
  roofFill(g, [L, [ax, ay], [ax, ay - dd], [L[0] + 6, L[1] - dd]], col, kind, 0.02);
  roofFill(g, [R, [ax, ay], [ax, ay - dd], [R[0] - 6, R[1] - dd]], col, kind, -0.22);
  g.beginPath(); g.moveTo(ax, ay); g.lineTo(ax, ay - dd); g.strokeStyle = ink(col); g.lineWidth = 6; g.lineCap = 'round'; g.stroke(); g.strokeStyle = sh(col, 0.15); g.lineWidth = 3.6; g.stroke();
  // фронтон
  const tri = [[-w / 2, -H], [0, ay + 8], [w / 2, -H]]; g.save(); poly(g, tri); g.clip(); gable(-w / 2, ay + 8, w, -H - ay - 8); g.restore(); poly(g, tri); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; g.stroke();
  // причелины — толстые доски по скатам
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * (w / 2 + e), -H + 4); g.lineTo(0, ay - 1); g.lineCap = 'round'; g.strokeStyle = ink(SHINGLE); g.lineWidth = 7.4; g.stroke(); g.strokeStyle = sh(SHINGLE, 0.15); g.lineWidth = 5; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 1.4; g.stroke(); }
  return ay - dd;
}
/** Труба: кирпичи подушками, шапка, дым. (x, y) — где выходит из крыши. */
function chimneyT(g, x, y, h, col = '#9a7a6a', smoke = 3) {
  for (let i = 0; i < smoke; i++) { const q = (i + 0.4) / smoke, s = 6 + q * 9; g.fillStyle = `rgba(236,232,224,${0.6 * (1 - q)})`; g.beginPath(); g.ellipse(x + q * 12 + Math.sin(i * 2) * 4, y - h - 10 - q * 46, s, s * 0.8, 0, 0, TAU); g.fill(); }
  stoneRect(g, x - 9, y - h, 18, h, col, 77, 8); rr(g, x - 12, y - h - 6, 24, 7, 3); paint(g, sh(col, -0.15), 1.4);
}
/** Окно квадратное: рама, переплёт, глянец, ставни, ящик с цветами. */
function windowSq(g, x, y, w, h, opt = {}) {
  const frame = opt.frame || '#d8c8a0';
  if (opt.shutters) for (const s of [-1, 1]) { const sx = s < 0 ? x - w / 2 - 13 : x + w / 2 + 3; rr(g, sx, y - h - 2, 10, h + 4, 2.5); paint(g, opt.shutters, 1.3, y - h, y); g.strokeStyle = sh(opt.shutters, -0.35); g.lineWidth = 1; g.beginPath(); g.moveTo(sx + 2, y - h * 0.5); g.lineTo(sx + 8, y - h * 0.5); g.stroke(); }
  rr(g, x - w / 2 - 4, y - h - 4, w + 8, h + 8, 3); paint(g, frame, 1.4);
  rr(g, x - w / 2, y - h, w, h, 2); const gr = g.createLinearGradient(x - w / 2, y - h, x + w / 2, y); gr.addColorStop(0, opt.lit ? '#fff0b0' : sh(TB.glass, 0.35)); gr.addColorStop(1, opt.lit ? '#e8a040' : sh(TB.glass, -0.25)); g.fillStyle = gr; g.fill(); g.strokeStyle = ink(frame); g.lineWidth = 1.3; g.stroke();
  g.save(); rr(g, x - w / 2, y - h, w, h, 2); g.clip(); g.fillStyle = 'rgba(255,255,255,.42)'; g.beginPath(); g.moveTo(x - w / 2, y - h * 0.3); g.lineTo(x - w / 2 + w * 0.3, y - h); g.lineTo(x - w / 2 + w * 0.5, y - h); g.lineTo(x - w / 2, y); g.closePath(); g.fill(); g.restore();
  g.strokeStyle = sh(frame, -0.25); g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x, y); g.moveTo(x - w / 2, y - h / 2); g.lineTo(x + w / 2, y - h / 2); g.stroke();
  rr(g, x - w / 2 - 7, y + 2, w + 14, 5, 2.5); paint(g, sh(frame, -0.08), 1.2);
  if (opt.flowers) { rr(g, x - w / 2 - 3, y + 7, w + 6, 7, 2.5); paint(g, '#a8643a', 1.2); for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(x - w / 2 + 2 + i * (w - 4) / 3, y + 5, 3, 0, TAU); paint(g, ['#e86a6a', '#f0c24a', '#e86aa8', '#f4f0e0'][i], 0.9); } }
}
/** Дверь прямоугольная со скруглёнными углами и наличником. */
function doorSq(g, x, w, h, col = TB.wood, frame = '#8a5a30') {
  rr(g, x - w / 2 - 6, -h - 6, w + 12, h + 6, 4); paint(g, frame, 1.4, -h - 6, 0);
  rr(g, x - w / 2, -h, w, h, 3); paint(g, col, 1.5, -h, 0); g.save(); rr(g, x - w / 2, -h, w, h, 3); g.clip(); for (let k = 0; k < 3; k++) { rr(g, x - w / 2 + k * w / 3 + 0.6, -h, w / 3 - 1.2, h, 2); paint(g, sh(col, k % 2 ? 0.06 : -0.03), 1, -h, 0, 0.1); } for (const by of [0.25, 0.72]) { rr(g, x - w / 2, -h * by - 2.4, w, 4.8, 2); paint(g, TB.iron, 1); } g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(x, -h, w / 2, h); g.restore();
  g.beginPath(); g.arc(x + w * 0.3, -h * 0.48, 2.6, 0, TAU); paint(g, TB.gold, 1);
  rr(g, x - w / 2 - 9, -4, w + 18, 5, 2.5); paint(g, '#9a948a', 1.2);
}
/** Вывеска на кронштейне со значком. */
function signT(g, x, y, icon, dir = 1) {
  g.beginPath(); g.moveTo(x, y); g.lineTo(x + dir * 30, y); g.strokeStyle = ink(TB.iron); g.lineWidth = 3; g.stroke(); g.strokeStyle = '#6a6c78'; g.lineWidth = 1.6; g.stroke();
  const bx = x + dir * 18; for (const dx of [-8, 8]) { g.strokeStyle = TB.iron; g.lineWidth = 1; g.beginPath(); g.moveTo(bx + dx, y); g.lineTo(bx + dx, y + 5); g.stroke(); }
  rr(g, bx - 14, y + 5, 28, 22, 5); paint(g, '#c8954a', 1.4, y + 5, y + 27); g.save(); g.translate(bx, y + 16); icon(g); g.restore();
}
function barrelT(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(-9, 0); g.quadraticCurveTo(-12, -12, -9, -24); g.lineTo(9, -24); g.quadraticCurveTo(12, -12, 9, 0); g.quadraticCurveTo(0, 2.5, -9, 0); g.closePath(); const gr = g.createLinearGradient(-11, 0, 11, 0); gr.addColorStop(0, sh(PLANK, 0.2)); gr.addColorStop(1, sh(PLANK, -0.3)); g.fillStyle = gr; g.fill(); g.strokeStyle = ink(PLANK); g.lineWidth = 1.3; g.stroke(); for (const k of [-5, -19]) { g.beginPath(); g.moveTo(-11, k); g.quadraticCurveTo(0, k + 2, 11, k); g.strokeStyle = TB.iron; g.lineWidth = 2.4; g.stroke(); } g.beginPath(); g.ellipse(0, -24, 9, 3, 0, 0, TAU); paint(g, sh(PLANK, 0.15), 1.1); g.restore(); }
function woodpileT(g, x, y) { for (let row = 0; row < 3; row++) for (let k = 0; k < 4 - row; k++) { const lx = x - 15 + row * 5 + k * 10, ly = y - 5 - row * 9; g.beginPath(); g.arc(lx, ly, 5, 0, TAU); paint(g, '#9a6a3a', 1.1); g.beginPath(); g.arc(lx, ly, 3, 0, TAU); g.fillStyle = '#e0b880'; g.fill(); } }
function potT(g, x, y, col = '#5f9a44') { rr(g, x - 6, y - 9, 12, 9, 2.5); paint(g, '#b06a3a', 1.1); for (const [dx, dy] of [[-3, -12], [3, -12], [0, -16]]) { g.beginPath(); g.ellipse(x + dx, y + dy, 3, 5, dx * 0.1, 0, TAU); paint(g, col, 0.9); } }
function hayT(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); rr(g, -14, -16, 28, 16, 6); paint(g, THATCH, 1.3, -16, 0); g.strokeStyle = sh(THATCH, -0.3); g.lineWidth = 0.8; for (let i = -10; i < 12; i += 4) { g.beginPath(); g.moveTo(i, -14); g.lineTo(i + 1, -2); g.stroke(); } g.strokeStyle = '#8a5a30'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-14, -8); g.lineTo(14, -8); g.stroke(); g.restore(); }

// ---------------------------------------------------------------- изба (Столица): брёвна, крыша коньком вдоль, крыльцо, ставни
function house(g, v = 0, t = 0) {
  const w = 170, d = 130, H = 86, roof = [[SHINGLE, 'shingle'], [THATCH, 'thatch'], [TILE, 'tile']][v] || [SHINGLE, 'shingle'], shut = ['#3f6a8a', '#7a3a2a', '#4a6a3a'][v] || '#3f6a8a';
  shadowAt(g, w, d); logWall(g, -w / 2, -H, w, H - 10); stoneRect(g, -w / 2 - 3, -12, w + 6, 12, '#9a948a', 5, 6);
  const top = roofSide(g, w, d, H, 44, roof[0], roof[1]);
  chimneyT(g, w * 0.24, top + 18, 26);
  doorSq(g, -28, 36, 60, '#6a3e22');
  // крыльцо с навесом
  for (const x of [-56, 0]) { rr(g, x - 2.5, -54, 5, 54, 2.5); paint(g, '#6a4a2c', 1.1); }
  g.beginPath(); g.moveTo(-64, -52); g.lineTo(8, -52); g.quadraticCurveTo(6, -60, 2, -62); g.lineTo(-58, -62); g.quadraticCurveTo(-62, -60, -64, -52); g.closePath(); paint(g, sh(roof[0], -0.1), 1.3);
  windowSq(g, 44, -24, 28, 28, { shutters: shut, flowers: true });
  woodpileT(g, w / 2 + 16, 2);
}
// ---------------------------------------------------------------- кузница: камень, открытый горн, навес, наковальня, бочка, высокая труба
function forge(g, t = 0) {
  const w = 200, d = 140, H = 96;
  shadowAt(g, w, d); stoneRect(g, -w / 2, -H, w, H, '#a49a8c', 21);
  const top = roofSide(g, w, d, H, 50, SLATE, 'slate');
  chimneyT(g, w * 0.3, top + 20, 50, '#8a7a70', 5);
  const aw = 70, ah = 72, ax = -30;
  for (let k = 0; k < 7; k++) { const a0 = Math.PI + k * Math.PI / 7, a1 = a0 + Math.PI / 7; g.beginPath(); g.arc(ax, -ah + aw / 2, aw / 2 + 10, a0 + 0.02, a1 - 0.02); g.arc(ax, -ah + aw / 2, aw / 2, a1 - 0.02, a0 + 0.02, true); g.closePath(); paint(g, '#c8bca8', 1.2); }
  g.beginPath(); g.moveTo(ax - aw / 2, 0); g.lineTo(ax - aw / 2, -ah + aw / 2); g.arc(ax, -ah + aw / 2, aw / 2, Math.PI, 0); g.lineTo(ax + aw / 2, 0); g.closePath(); g.fillStyle = '#1a1210'; g.fill(); g.strokeStyle = ink('#c8bca8'); g.lineWidth = 1.6; g.stroke();
  const gl = g.createRadialGradient(ax, -20, 4, ax, -20, 42); gl.addColorStop(0, 'rgba(255,180,70,.95)'); gl.addColorStop(0.5, 'rgba(255,100,30,.5)'); gl.addColorStop(1, 'rgba(255,60,0,0)'); g.fillStyle = gl; g.beginPath(); g.moveTo(ax - aw / 2, 0); g.lineTo(ax - aw / 2, -ah + aw / 2); g.arc(ax, -ah + aw / 2, aw / 2, Math.PI, 0); g.lineTo(ax + aw / 2, 0); g.closePath(); g.fill();
  rr(g, ax - 24, -22, 48, 22, 4); paint(g, '#5a4a40', 1.3);
  for (const [col, k] of [['#ff7a2a', 1], ['#ffb347', 0.7], ['#fff2a0', 0.4]]) { g.fillStyle = col; g.beginPath(); g.moveTo(ax - 16 * k, -22); g.quadraticCurveTo(ax - 10 * k, -36 * k - 8, ax, -44 * k - 4); g.quadraticCurveTo(ax + 10 * k, -36 * k - 8, ax + 16 * k, -22); g.closePath(); g.fill(); }
  for (const x of [ax - 50, ax + 50]) { rr(g, x - 3.5, -80, 7, 80, 3.5); paint(g, '#6a4a30', 1.2); }
  g.beginPath(); g.moveTo(ax - 62, -78); g.lineTo(ax + 62, -78); g.quadraticCurveTo(ax + 60, -90, ax + 54, -92); g.lineTo(ax - 54, -92); g.quadraticCurveTo(ax - 60, -90, ax - 62, -78); g.closePath(); paint(g, sh(SLATE, 0.1), 1.4, -92, -78);
  // наковальня на колоде
  const nx = ax + 88; rr(g, nx - 11, -18, 22, 18, 4); paint(g, '#7a5232', 1.2); g.beginPath(); g.moveTo(nx - 18, -18); g.lineTo(nx + 14, -18); g.quadraticCurveTo(nx + 22, -22, nx + 20, -26); g.lineTo(nx + 6, -30); g.lineTo(nx - 12, -30); g.quadraticCurveTo(nx - 20, -26, nx - 18, -18); g.closePath(); paint(g, '#5a5c68', 1.3); shine(g, nx - 4, -27.6, 8, 1.2, 0.5, 0);
  barrelT(g, -w / 2 - 6, 2); g.beginPath(); g.ellipse(-w / 2 - 6, -22, 8, 2.4, 0, 0, TAU); g.fillStyle = '#5a9ac8'; g.fill();
  doorSq(g, 68, 36, 62, '#5a3a24');
  g.beginPath(); g.arc(68, -84, 8, Math.PI * 0.85, Math.PI * 2.15); g.strokeStyle = ink('#9a9aa8'); g.lineWidth = 4; g.lineCap = 'round'; g.stroke(); g.strokeStyle = '#b8bac4'; g.lineWidth = 2.4; g.stroke();
}
// ---------------------------------------------------------------- таверна: каменный низ, фахверк, черепица, вывеска с кружкой, бочки, стол
function tavern(g, t = 0) {
  const w = 230, d = 150, H1 = 66, H = 136, o = 8;
  shadowAt(g, w, d); stoneRect(g, -w / 2, -H1, w, H1, '#9a948a', 42);
  plasterWall(g, -w / 2 - o, -H, w + o * 2, H - H1, '#f0e2c2', '#6a4224', 44);
  for (let x = -w / 2 - o + 6; x < w / 2 + o - 6; x += 16) { g.beginPath(); g.moveTo(x, -H1 + 1); g.quadraticCurveTo(x + 4, -H1 + 7, x + 8, -H1 + 1); g.strokeStyle = ink('#6a4224'); g.lineWidth = 1.4; g.stroke(); }
  const top = roofSide(g, w + o * 2, d, H, 60, TILE, 'tile');
  chimneyT(g, -w * 0.28, top + 22, 26);
  for (const x of [-72, -24, 24, 72]) windowSq(g, x, -H1 - 18, 24, 26, { lit: true });
  doorSq(g, -18, 40, 64, '#6a3e22');
  windowSq(g, 50, -18, 30, 26, { lit: true, shutters: '#4a6a3a' });
  signT(g, w / 2 + 2, -H1 - 4, gg => { rr(gg, -6, -7, 10, 13, 2); paint(gg, '#f0c24a', 1); gg.beginPath(); gg.arc(5, -1, 3.4, -1.4, 1.4); gg.strokeStyle = '#8a5a20'; gg.lineWidth = 1.6; gg.stroke(); rr(gg, -6.5, -9, 11, 4, 2); paint(gg, '#fff8e8', 0.8); });
  barrelT(g, -w / 2 + 14, 2); barrelT(g, -w / 2 + 34, 2, 0.9);
  // стол со скамьёй
  const tx = w / 2 + 34; for (const x of [tx - 18, tx + 18]) { rr(g, x - 2.5, -18, 5, 18, 2); paint(g, '#6a4a2c', 1); } rr(g, tx - 26, -22, 52, 6, 3); paint(g, '#a07a4a', 1.3); rr(g, tx - 22, -10, 44, 5, 2.5); paint(g, '#8a6a3a', 1.1);
  g.beginPath(); g.arc(tx - 8, -25, 3, 0, TAU); paint(g, '#f0c24a', 0.9); g.beginPath(); g.arc(tx + 9, -25, 3, 0, TAU); paint(g, '#f0c24a', 0.9);
}
// ---------------------------------------------------------------- мастерская чар: сиреневый камень, фиолетовая черепица, башенка с кристаллом
function enchant(g, t = 0) {
  const w = 160, d = 130, H = 100, stone = '#a898c0', roof = '#6a4a9a';
  shadowAt(g, w + 40, d); stoneRect(g, -w / 2, -H, w, H, stone, 51);
  roofSide(g, w, d, H, 54, roof, 'slate', true);
  // башенка справа
  const tx = w / 2 + 6, R = 26, TH = 160; g.save(); g.beginPath(); g.moveTo(tx - R, -TH); g.lineTo(tx - R, 0); g.quadraticCurveTo(tx, 9, tx + R, 0); g.lineTo(tx + R, -TH); g.closePath(); g.clip(); stoneRect(g, tx - R, -TH - 4, R * 2, TH + 14, sh(stone, -0.05), 53, 12); const gr = g.createLinearGradient(tx - R, 0, tx + R, 0); gr.addColorStop(0, 'rgba(255,255,255,.18)'); gr.addColorStop(1, 'rgba(20,10,40,.4)'); g.fillStyle = gr; g.fillRect(tx - R, -TH - 4, R * 2, TH + 14); g.restore();
  g.beginPath(); g.moveTo(tx - R, -TH); g.lineTo(tx - R, 0); g.quadraticCurveTo(tx, 9, tx + R, 0); g.lineTo(tx + R, -TH); g.strokeStyle = ink(stone); g.lineWidth = 1.8; g.stroke();
  windowT(g, tx, -TH + 64, 14, 26, { lit: true, frame: sh(stone, 0.2) });
  g.beginPath(); g.moveTo(tx - R - 8, -TH); g.quadraticCurveTo(tx - R * 0.4, -TH - 40, tx, -TH - 84); g.quadraticCurveTo(tx + R * 0.4, -TH - 40, tx + R + 8, -TH); g.quadraticCurveTo(tx, -TH + 8, tx - R - 8, -TH); g.closePath(); g.save(); g.clip(); scalesH(g, [[tx - R - 10, -TH + 8], [tx, -TH - 86], [tx + R + 10, -TH + 8]], roof, 0, 8, 11); g.restore(); g.beginPath(); g.moveTo(tx - R - 8, -TH); g.quadraticCurveTo(tx - R * 0.4, -TH - 40, tx, -TH - 84); g.quadraticCurveTo(tx + R * 0.4, -TH - 40, tx + R + 8, -TH); g.strokeStyle = ink(roof); g.lineWidth = 1.8; g.stroke();
  const cy = -TH - 96 + Math.sin(t * 2) * 1.5; g.fillStyle = 'rgba(200,160,255,.35)'; g.beginPath(); g.arc(tx, cy, 14, 0, TAU); g.fill(); g.beginPath(); g.moveTo(tx, cy - 11); g.lineTo(tx + 6, cy); g.lineTo(tx, cy + 11); g.lineTo(tx - 6, cy); g.closePath(); paint(g, '#c8a0ff', 1.2); shine(g, tx - 2, cy - 4, 1.6, 3, 0.8, 0);
  doorT(g, -10, 34, 62, '#4a2a6a', { frame: sh(stone, 0.15) });
  g.fillStyle = 'rgba(200,160,255,.4)'; g.beginPath(); g.arc(-10, -86, 12, 0, TAU); g.fill(); g.beginPath(); g.moveTo(-10, -96); g.lineTo(-4, -86); g.lineTo(-10, -76); g.lineTo(-16, -86); g.closePath(); paint(g, '#d8b0ff', 1.1);
  for (const x of [-54, 34]) windowT(g, x, -30, 22, 36, { lit: true, frame: sh(stone, 0.2) });
  g.fillStyle = '#f4ecff'; g.beginPath(); g.arc(-54, -80, 7, 0.6, 5.7); g.arc(-51, -82, 6, 5.4, 0.9, true); g.fill();
  for (const [x, y] of [[30, -84], [42, -76], [20, -72]]) { g.fillStyle = '#f4ecff'; g.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 1 : 2.6, a = i * Math.PI / 4; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.fill(); }
  potT(g, -w / 2 - 10, 2, '#8a6ac8');
}
// ---------------------------------------------------------------- гильдия рудокопов: камень и брёвна, штольня в холме, рельсы, вагонетка
function miners(g, t = 0) {
  const w = 190, d = 140, H = 90;
  shadowAt(g, w + 80, d);
  // штольня слева: холм-валуны, крепь, рельсы, вагонетка
  const mx = -w / 2 - 44; for (const [dx, dy, r] of [[-30, -18, 30], [10, -30, 38], [40, -16, 26], [-8, -50, 26]]) { g.beginPath(); g.arc(mx + dx, dy, r, 0, TAU); paint(g, sh('#8a8478', (dx % 3) * 0.03), 1.6, dy - r, dy + r); shine(g, mx + dx - r * 0.35, dy - r * 0.5, r * 0.25, r * 0.12, 0.3); }
  g.beginPath(); g.ellipse(mx + 6, -62, 30, 12, 0, Math.PI, 0); paint(g, MOSS, 1.3);
  rr(g, mx - 16, -54, 44, 54, 10); g.fillStyle = '#1a1410'; g.fill();
  for (const x of [mx - 18, mx + 26]) { rr(g, x - 4, -58, 8, 58, 3); paint(g, '#8a5a30', 1.2); } rr(g, mx - 24, -62, 56, 8, 3); paint(g, '#8a5a30', 1.3);
  for (const s of [-6, 6]) { g.beginPath(); g.moveTo(mx + 6 + s, -8); g.lineTo(mx + 6 + s * 2.4, 14); g.strokeStyle = '#6a6c78'; g.lineWidth = 2.4; g.stroke(); } for (let k = 0; k < 4; k++) { rr(g, mx - 12 + k * 1.5, -6 + k * 5, 36 + k * 3, 3, 1.5); paint(g, '#7a5232', 0.8); }
  const cx = mx + 34; g.beginPath(); g.moveTo(cx - 16, -22); g.lineTo(cx + 16, -22); g.lineTo(cx + 12, -6); g.lineTo(cx - 12, -6); g.closePath(); paint(g, '#5a5c68', 1.3); for (const k of [-6, 0, 6]) { g.beginPath(); g.arc(cx + k, -24, 5, 0, TAU); paint(g, '#c87a4a', 1); } for (const k of [-8, 8]) { g.beginPath(); g.arc(cx + k, -4, 4, 0, TAU); paint(g, '#3a3c48', 1); }
  // дом
  stoneRect(g, -w / 2, -40, w, 40, '#9a948a', 61); logWall(g, -w / 2, -H, w, H - 40, '#9a6a40');
  const top = roofSide(g, w, d, H, 50, SHINGLE, 'shingle');
  chimneyT(g, w * 0.2, top + 18, 24);
  doorSq(g, 0, 38, 60, '#5a3a24');
  for (const x of [-56, 56]) windowSq(g, x, -26, 26, 26, { shutters: '#5a5c68' });
  signT(g, w / 2 + 2, -H + 16, gg => { gg.beginPath(); gg.moveTo(-8, -4); gg.quadraticCurveTo(0, -10, 8, -4); gg.strokeStyle = '#5a5c68'; gg.lineWidth = 3; gg.stroke(); gg.beginPath(); gg.moveTo(0, -7); gg.lineTo(0, 7); gg.strokeStyle = '#7a5232'; gg.lineWidth = 2.4; gg.stroke(); });
  lampT(g, -w / 2 + 6, -40, true);
}
// ---------------------------------------------------------------- лавка травницы: брёвна, крыша-дёрн с цветами, пучки трав, котёл
function herbal(g, t = 0) {
  const w = 180, d = 130, H = 84;
  shadowAt(g, w + 40, d); logWall(g, -w / 2, -H, w, H - 10, '#a87a4c'); stoneRect(g, -w / 2 - 3, -12, w + 6, 12, '#9a948a', 7, 6);
  const top = roofSide(g, w, d, H, 46, MOSS, 'moss');
  chimneyT(g, w * 0.26, top + 16, 22);
  for (let i = 0; i < 8; i++) { const x = -w / 2 + 14 + i * (w - 28) / 7, col = ['#7cbf4a', '#c8a0ff', '#e8c040', '#9ad0a0'][i % 4]; g.beginPath(); g.moveTo(x, -H + 2); g.lineTo(x, -H + 8); g.strokeStyle = '#8a6a3a'; g.lineWidth = 1; g.stroke(); g.beginPath(); g.moveTo(x - 5, -H + 8); g.quadraticCurveTo(x, -H + 24, x + 5, -H + 8); g.closePath(); paint(g, col, 1); rr(g, x - 3, -H + 6, 6, 3, 1.5); paint(g, '#c8a060', 0.7); }
  doorSq(g, -26, 36, 60, '#5a3a24');
  windowSq(g, 38, -24, 28, 26, { shutters: '#4a7a3a', flowers: true });
  signT(g, w / 2 + 2, -H + 22, gg => { gg.beginPath(); gg.ellipse(0, 0, 7, 4, -0.6, 0, TAU); paint(gg, '#5fa04a', 1); gg.beginPath(); gg.moveTo(-5, 4); gg.lineTo(5, -4); gg.strokeStyle = '#3a6a2a'; gg.lineWidth = 0.8; gg.stroke(); });
  for (const x of [-w / 2 + 50, -w / 2 + 64]) potT(g, x + 30, 2);
  // котёл на огне
  const kx = -w / 2 - 30; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(kx + s * 16, 0); g.lineTo(kx, -40); g.strokeStyle = ink('#6a4a2c'); g.lineWidth = 4; g.stroke(); g.strokeStyle = '#7a5a3a'; g.lineWidth = 2.4; g.stroke(); }
  for (const [col, k] of [['#ff7a2a', 1], ['#ffd060', 0.5]]) { g.fillStyle = col; g.beginPath(); g.moveTo(kx - 10 * k, 0); g.quadraticCurveTo(kx - 4, -12 * k, kx, -16 * k); g.quadraticCurveTo(kx + 4, -12 * k, kx + 10 * k, 0); g.closePath(); g.fill(); }
  g.beginPath(); g.moveTo(kx - 14, -24); g.quadraticCurveTo(kx - 15, -8, kx, -8); g.quadraticCurveTo(kx + 15, -8, kx + 14, -24); g.closePath(); paint(g, '#3a3c48', 1.4); g.beginPath(); g.ellipse(kx, -24, 14, 4, 0, 0, TAU); paint(g, '#6ac84a', 1.1); for (const [dx, r] of [[-4, 2], [3, 1.5], [0, 2.6]]) { g.beginPath(); g.arc(kx + dx, -28 - r, r, 0, TAU); paint(g, '#9ae07a', 0.7); }
}
// ---------------------------------------------------------------- постоялый двор: два этажа брёвен, балкон, черепица, вывеска с кроватью
function inn(g, t = 0) {
  const w = 240, d = 150, H1 = 72, H = 150;
  shadowAt(g, w, d); logWall(g, -w / 2, -H, w, H - 10, '#a8743e'); stoneRect(g, -w / 2 - 3, -12, w + 6, 12, '#9a948a', 9, 6);
  const top = roofSide(g, w, d, H, 62, TILE, 'tile');
  chimneyT(g, -w * 0.3, top + 24, 28);
  for (const x of [-84, -28, 28, 84]) windowSq(g, x, -H1 - 22, 24, 30, { shutters: '#8a3a2a', lit: x > 0 });
  // балкон
  rr(g, -w / 2 - 6, -H1 - 6, w + 12, 8, 3); paint(g, '#8a5a30', 1.4);
  for (let x = -w / 2; x <= w / 2; x += 14) { rr(g, x - 2, -H1 - 28, 4, 22, 2); paint(g, '#a07a4a', 0.9); }
  rr(g, -w / 2 - 6, -H1 - 32, w + 12, 6, 3); paint(g, '#a07a4a', 1.3);
  for (const x of [-w / 2 + 4, w / 2 - 4]) { rr(g, x - 3.5, -H1, 7, H1, 3); paint(g, '#7a5232', 1.2); }
  doorT(g, 0, 40, 64, '#6a3e22', { frame: '#8a5a30' });
  for (const x of [-70, 70]) windowSq(g, x, -18, 28, 28, { lit: true });
  signT(g, w / 2 + 2, -H1 + 14, gg => { rr(gg, -9, -2, 18, 6, 2); paint(gg, '#c84a3a', 0.9); rr(gg, -9, -6, 6, 5, 2); paint(gg, '#fff8e8', 0.8); gg.strokeStyle = '#5a3a1c'; gg.lineWidth = 1.4; gg.beginPath(); gg.moveTo(-9, 6); gg.lineTo(-9, -7); gg.moveTo(9, 6); gg.lineTo(9, -2); gg.stroke(); });
  for (const x of [-w / 2 - 14, w / 2 + 14]) lampT(g, x, 2, true);
  barrelT(g, w / 2 + 34, 2, 0.9);
}
// ---------------------------------------------------------------- Королевский дворец: крылья, донжон с зубцами и вальмой, башни, ворота, знамёна, балкон, лестница
function palace(g, t = 0) {
  const stone = '#c8bfae', roof = '#3e6aa8', KW = 260, KD = 220, KH = 210, WW = 200, WD = 170, WH = 130;
  shadowAt(g, KW + 2 * WW, KD);
  for (const sd of [-1, 1]) { g.save(); g.translate(sd * (KW / 2 + WW / 2 - 10), -10);
    stoneRect(g, -WW / 2, -WH, WW, WH, sh(stone, -0.04), 90 + sd); roofSide(g, WW, WD, WH, 56, roof, 'slate', true);
    for (const x of [-60, 0, 60]) { windowT(g, x, -WH + 52, 18, 32, { lit: x === 0 }); windowT(g, x, -24, 18, 32, {}); }
    g.restore(); }
  for (const sd of [-1, 1]) { g.save(); g.translate(sd * (KW / 2 + WW - 20), -26); towerP(g, 30, WH + 80, roof, stone); g.restore(); }
  stoneRect(g, -KW / 2, -KH, KW, KH, stone, 97);
  rr(g, -KW / 2 - 6, -KH - 8, KW + 12, 12, 4); paint(g, sh(stone, 0.12), 1.6);
  for (let x = -KW / 2; x < KW / 2 - 12; x += 26) { rr(g, x, -KH - 22, 16, 16, [4, 4, 1, 1]); paint(g, sh(stone, 0.08), 1.3); }
  roofSide(g, KW - 40, KD - 40, KH + 18, 64, roof, 'slate', true, 4);
  for (const x of [-100, -70, 70, 100]) { windowT(g, x, -KH + 70, 16, 30, { lit: x > 0 }); windowT(g, x, -KH + 130, 16, 30, { lit: x < 0 }); }
  for (const sd of [-1, 1]) { g.save(); g.translate(sd * (KW / 2 + 6), 4); towerP(g, 36, KH + 30, roof, stone, sd > 0); g.restore(); }
  // знамёна
  for (const sd of [-1, 1]) { const x = sd * 64, y0 = -170; g.beginPath(); g.moveTo(x - 13, y0); g.lineTo(x + 13, y0); g.lineTo(x + 13, y0 + 66); g.lineTo(x, y0 + 80); g.lineTo(x - 13, y0 + 66); g.closePath(); paint(g, roof, 1.5, y0, y0 + 80); g.beginPath(); g.arc(x, y0 + 30, 7, 0, TAU); paint(g, TB.gold, 1.2); rr(g, x - 16, y0 - 4, 32, 5, 2.5); paint(g, TB.gold, 1.1); }
  // балкон и большое окно
  windowT(g, 0, -150, 40, 50, { lit: true, frame: sh(stone, 0.15) });
  rr(g, -46, -146, 92, 7, 3); paint(g, sh(stone, 0.06), 1.4); for (let x = -40; x <= 40; x += 10) { rr(g, x - 2, -164, 4, 18, 2); paint(g, '#e8e0cc', 0.9); } rr(g, -48, -168, 96, 5, 2.5); paint(g, '#e8e0cc', 1.2);
  // ворота: арка из клиньев
  const gw = 60, gh = 110;
  for (let k = 0; k < 9; k++) { const a0 = Math.PI + k * Math.PI / 9, a1 = a0 + Math.PI / 9; g.beginPath(); g.arc(0, -gh + gw / 2, gw / 2 + 14, a0 + 0.01, a1 - 0.01); g.arc(0, -gh + gw / 2, gw / 2, a1 - 0.01, a0 + 0.01, true); g.closePath(); paint(g, sh(stone, k === 4 ? 0.25 : 0.12), 1.3); }
  doorT(g, 0, gw, gh, '#6a3e22');
  // лестница и жаровни
  for (let k = 0; k < 5; k++) { rr(g, -gw / 2 - 30 - k * 10, k * 7, gw + 60 + k * 20, 7, 3); paint(g, sh(stone, 0.04 - k * 0.03), 1.2); }
  for (const sd of [-1, 1]) { const x = sd * (gw / 2 + 62); rr(g, x - 3, 8, 6, 26, 3); paint(g, TB.iron, 1.1); g.beginPath(); g.ellipse(x, 6, 13, 5, 0, 0, TAU); paint(g, TB.iron, 1.2); for (const [col, k] of [['#ff7a2a', 1], ['#ffd060', 0.55]]) { g.fillStyle = col; g.beginPath(); g.moveTo(x - 10 * k, 4); g.quadraticCurveTo(x - 6, -10 * k, x, -18 * k - Math.sin(t * 8) * 2); g.quadraticCurveTo(x + 6, -10 * k, x + 10 * k, 4); g.closePath(); g.fill(); } }
}
/** Круглая башня дворца (в единицах дворца). */
function towerP(g, R, H, roof, stone, flag = true) {
  g.save(); g.beginPath(); g.moveTo(-R, -H); g.lineTo(-R, 0); g.quadraticCurveTo(0, R * 0.36, R, 0); g.lineTo(R, -H); g.closePath(); g.clip(); stoneRect(g, -R, -H - 4, R * 2, H + R, stone, 101 + R, 13); const gr = g.createLinearGradient(-R, 0, R, 0); gr.addColorStop(0, 'rgba(255,255,255,.2)'); gr.addColorStop(0.35, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(20,12,6,.42)'); g.fillStyle = gr; g.fillRect(-R, -H - 4, R * 2, H + R); g.restore();
  g.beginPath(); g.moveTo(-R, -H); g.lineTo(-R, 0); g.quadraticCurveTo(0, R * 0.36, R, 0); g.lineTo(R, -H); g.strokeStyle = ink(stone); g.lineWidth = 1.8; g.stroke();
  for (let k = 0; k < 3; k++) windowT(g, -R * 0.25 + (k % 2) * R * 0.4, -H + 52 + k * 44, 10, 20, { lit: k === 1 });
  const Rw = R + 6; g.beginPath(); g.moveTo(-Rw, -H - 14); g.lineTo(-Rw, -H); g.quadraticCurveTo(0, -H + Rw * 0.36, Rw, -H); g.lineTo(Rw, -H - 14); g.quadraticCurveTo(0, -H - 14 + Rw * 0.36, -Rw, -H - 14); g.closePath(); paint(g, sh(stone, 0.1), 1.5);
  for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k + 0.5) / 5 * Math.PI, x = Math.sin(a) * (Rw - 4), dip = Rw * 0.36 * Math.cos(a); rr(g, x - 5, -H - 26 + dip, 10, 13, [3, 3, 1, 1]); paint(g, sh(stone, 0.06), 1.1); }
  const h = R * 2.5, y = -H - 22, ew = Rw + 6; g.beginPath(); g.moveTo(-ew, y); g.quadraticCurveTo(-ew * 0.35, y - h * 0.55, 0, y - h); g.quadraticCurveTo(ew * 0.35, y - h * 0.55, ew, y); g.quadraticCurveTo(0, y + ew * 0.22, -ew, y); g.closePath(); g.save(); g.clip(); scalesH(g, [[-ew - 2, y + 8], [0, y - h - 2], [ew + 2, y + 8]], roof, 0, 8, 11); g.restore();
  g.beginPath(); g.moveTo(-ew, y); g.quadraticCurveTo(-ew * 0.35, y - h * 0.55, 0, y - h); g.quadraticCurveTo(ew * 0.35, y - h * 0.55, ew, y); g.strokeStyle = ink(roof); g.lineWidth = 1.8; g.stroke();
  g.beginPath(); g.arc(0, y - h - 4, 4, 0, TAU); paint(g, TB.gold, 1.2);
  if (flag) { g.beginPath(); g.moveTo(0, y - h - 6); g.lineTo(0, y - h - 32); g.strokeStyle = ink('#8a6a3a'); g.lineWidth = 2.6; g.stroke(); g.beginPath(); g.moveTo(1, y - h - 32); g.quadraticCurveTo(12, y - h - 36, 24, y - h - 28); g.quadraticCurveTo(14, y - h - 24, 1, y - h - 20); g.closePath(); paint(g, '#c8382c', 1.2); }
}

// ---------------------------------------------------------------- посёлок: изба фронтоном, постоялый двор, кузня-навес, амбар, хутор, пепелище, мельница
function vhouse(g, v = 0, t = 0) {
  const w = 150, d = 120, H = 70, roof = [[SHINGLE, 'shingle'], [THATCH, 'thatch'], [TILE, 'tile']][v] || [SHINGLE, 'shingle'];
  shadowAt(g, w, d); logWall(g, -w / 2, -H, w, H - 10, '#a8743e'); stoneRect(g, -w / 2 - 3, -12, w + 6, 12, '#9a948a', 3 + v, 6);
  roofFront(g, w, d, H, 58, roof[0], roof[1], (x, y, ww, hh) => { logWall(g, x, y, ww, hh, '#b88450', false); windowSq(g, 0, -H - 10, 16, 16, {}); });
  chimneyT(g, w * 0.26, -H - 40, 22, '#9a7a6a', 2);
  doorSq(g, -24, 34, 64, '#6a3e22');
  windowSq(g, 34, -22, 24, 24, { shutters: ['#3f6a8a', '#7a3a2a', '#4a6a3a'][v] || '#3f6a8a', flowers: true });
}
function vinn(g, t = 0) {
  const w = 200, d = 140, H = 118;
  shadowAt(g, w, d); logWall(g, -w / 2, -H, w, H - 10, '#a8743e'); stoneRect(g, -w / 2 - 3, -12, w + 6, 12, '#9a948a', 13, 6);
  roofFront(g, w, d, H, 70, TILE, 'tile', (x, y, ww, hh) => { logWall(g, x, y, ww, hh, '#b88450', false); windowSq(g, 0, -H - 12, 18, 20, { lit: true }); });
  chimneyT(g, -w * 0.28, -H - 44, 26);
  for (const x of [-62, -20, 20, 62]) windowSq(g, x, -68, 22, 24, { shutters: '#8a3a2a', lit: x < 0 });
  rr(g, -w / 2 - 4, -58, w + 8, 6, 3); paint(g, '#8a5a30', 1.3);
  doorT(g, 0, 36, 56, '#6a3e22', { frame: '#8a5a30' });
  for (const x of [-60, 60]) windowSq(g, x, -16, 24, 22, { lit: true });
  signT(g, w / 2 + 2, -70, gg => { rr(gg, -6, -7, 10, 13, 2); paint(gg, '#f0c24a', 1); gg.beginPath(); gg.arc(5, -1, 3.4, -1.4, 1.4); gg.strokeStyle = '#8a5a20'; gg.lineWidth = 1.6; gg.stroke(); });
  barrelT(g, -w / 2 - 10, 2, 0.9);
}
function vforge(g, t = 0) {
  const w = 200, d = 120, H = 80;
  shadowAt(g, w, d); stoneRect(g, -w / 2 + 10, -H, w - 20, H, '#9a9288', 23);
  const top = roofSide(g, w, d, H, 34, SLATE, 'slate');
  chimneyT(g, -w * 0.3, top + 14, 40, '#8a7a70', 4);
  for (const x of [-w / 2 + 6, w / 2 - 6]) { rr(g, x - 4, -H, 8, H, 4); paint(g, '#6a4a30', 1.3); }
  const ax = -50; rr(g, ax - 26, -30, 52, 30, 5); paint(g, '#7a6a5a', 1.3); const gl = g.createRadialGradient(ax, -30, 2, ax, -30, 34); gl.addColorStop(0, 'rgba(255,180,70,.9)'); gl.addColorStop(1, 'rgba(255,80,20,0)'); g.fillStyle = gl; g.beginPath(); g.arc(ax, -30, 34, 0, TAU); g.fill();
  for (const [col, k] of [['#ff7a2a', 1], ['#ffd060', 0.5]]) { g.fillStyle = col; g.beginPath(); g.moveTo(ax - 14 * k, -30); g.quadraticCurveTo(ax - 4, -44 * k, ax, -50 * k); g.quadraticCurveTo(ax + 4, -44 * k, ax + 14 * k, -30); g.closePath(); g.fill(); }
  const nx = 30; rr(g, nx - 10, -16, 20, 16, 4); paint(g, '#7a5232', 1.2); g.beginPath(); g.moveTo(nx - 16, -16); g.lineTo(nx + 12, -16); g.quadraticCurveTo(nx + 20, -20, nx + 18, -24); g.lineTo(nx + 6, -27); g.lineTo(nx - 10, -27); g.quadraticCurveTo(nx - 18, -23, nx - 16, -16); g.closePath(); paint(g, '#5a5c68', 1.2);
  for (const [x, l] of [[0, 14], [10, 18], [64, 12]]) { g.beginPath(); g.moveTo(x, -H + 10); g.lineTo(x, -H + 10 + l); g.strokeStyle = '#5a5c68'; g.lineWidth = 2; g.stroke(); }
  barrelT(g, 70, 2, 0.8);
}
function barn(g, t = 0) {
  const w = 200, d = 150, H = 96, red = '#b04a3a';
  shadowAt(g, w, d); plankWall(g, -w / 2, -H, w, H, red);
  roofFront(g, w, d, H, 70, SHINGLE, 'shingle', (x, y, ww, hh) => { plankWall(g, x, y, ww, hh, sh(red, 0.05)); rr(g, -16, -H - 40, 32, 28, 4); g.fillStyle = '#2a1a12'; g.fill(); g.beginPath(); g.ellipse(0, -H - 14, 14, 8, 0, Math.PI, 0); paint(g, THATCH, 1); });
  // ворота с белым крестом
  for (const s of [-1, 1]) { const x0 = s < 0 ? -36 : 0; rr(g, x0, -76, 36, 76, 3); paint(g, sh(red, -0.08), 1.6); g.strokeStyle = ink('#f2e8d2'); g.lineWidth = 6.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0 + 4, -72); g.lineTo(x0 + 32, -4); g.moveTo(x0 + 32, -72); g.lineTo(x0 + 4, -4); g.stroke(); g.strokeStyle = '#f2e8d2'; g.lineWidth = 4.2; g.stroke(); rr(g, x0, -76, 36, 76, 3); g.strokeStyle = '#f2e8d2'; g.lineWidth = 3; g.stroke(); }
  for (const x of [-70, 70]) windowSq(g, x, -44, 18, 18, { frame: '#f2e8d2' });
  hayT(g, -w / 2 - 6, 2); hayT(g, -w / 2 + 14, 2, 0.8);
}
function farmstead(g, burned = false, t = 0) {
  if (burned) {
    g.fillStyle = 'rgba(30,20,14,.25)'; g.beginPath(); g.ellipse(0, 0, 150, 24, 0, 0, TAU); g.fill();
    for (const [x, h, a] of [[-90, 70, -0.08], [-40, 88, 0.05], [30, 64, 0.12], [90, 50, -0.1], [130, 34, 0.2]]) { g.save(); g.translate(x, 0); g.rotate(a); rr(g, -5, -h, 10, h, 4); paint(g, '#2e241e', 1.4, -h, 0); for (let k = 0; k < 3; k++) { g.fillStyle = 'rgba(255,120,40,.7)'; g.beginPath(); g.arc(-2 + k * 2, -h * (0.3 + k * 0.2), 1.6, 0, TAU); g.fill(); } g.restore(); }
    g.save(); g.translate(-10, -60); g.rotate(0.12); rr(g, -86, -5, 172, 10, 5); paint(g, '#3a2c22', 1.4); g.restore();
    for (const [x, w] of [[-60, 80], [20, 90]]) { rr(g, x - w / 2, -12, w, 11, 5.5); paint(g, '#4a362a', 1.3); }
    for (let i = 0; i < 14; i++) { g.fillStyle = i % 2 ? '#ff8a3a' : '#ffc060'; g.beginPath(); g.arc(-120 + i * 18, -2 + (i % 3) * 3, 1.8, 0, TAU); g.fill(); }
    return;
  }
  g.save(); g.translate(-50, 0); g.scale(0.86, 0.86); vhouse(g, 1, t); g.restore();
  g.save(); g.translate(96, -10); g.scale(0.62, 0.62); barn(g, t); g.restore();
  for (let k = 0; k < 6; k++) { const x = -170 + k * 10; rr(g, x - 2.5, -22, 5, 22, 2.5); paint(g, '#8a6a3a', 1); } rr(g, -174, -18, 58, 4, 2); paint(g, '#a07a4a', 1); rr(g, -174, -9, 58, 4, 2); paint(g, '#a07a4a', 1);
  rr(g, -80, 8, 90, 14, 5); paint(g, '#6a4a2c', 1.3); for (let k = 0; k < 8; k++) { g.beginPath(); g.arc(-72 + k * 11, 12, 3.4, 0, TAU); paint(g, '#7cbf4a', 0.8); }
}
/** Мельница: круглая каменная башня-конус, деревянный колпак, дверь, окно, мешки. Ступица крыльев — в (0, −112). */
function millBaseT(g) {
  g.fillStyle = 'rgba(20,12,6,.05)'; g.beginPath(); g.ellipse(4, 2, 52, 12, 0, 0, TAU); g.fill();
  const path = () => { g.beginPath(); g.moveTo(-38, 0); g.lineTo(-26, -104); g.lineTo(26, -104); g.lineTo(38, 0); g.quadraticCurveTo(0, 12, -38, 0); g.closePath(); };
  g.save(); path(); g.clip(); stoneRect(g, -40, -108, 80, 122, '#b8ae98', 71, 12); const gr = g.createLinearGradient(-38, 0, 38, 0); gr.addColorStop(0, 'rgba(255,255,255,.18)'); gr.addColorStop(0.35, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(20,12,6,.4)'); g.fillStyle = gr; g.fillRect(-40, -110, 80, 125); g.restore();
  path(); g.strokeStyle = ink('#b8ae98'); g.lineWidth = 1.8; g.stroke();
  g.beginPath(); g.moveTo(-34, -100); g.quadraticCurveTo(-30, -128, 0, -138); g.quadraticCurveTo(30, -128, 34, -100); g.quadraticCurveTo(0, -92, -34, -100); g.closePath(); g.save(); g.clip(); roofFill(g, [[-36, -92], [-36, -140], [36, -140], [36, -92]], SHINGLE, 'shingle'); g.restore(); g.beginPath(); g.moveTo(-34, -100); g.quadraticCurveTo(-30, -128, 0, -138); g.quadraticCurveTo(30, -128, 34, -100); g.strokeStyle = ink(SHINGLE); g.lineWidth = 1.8; g.stroke();
  doorT(g, 0, 24, 46, '#6a3e22');
  windowSq(g, 0, -64, 12, 14, {});
  for (const x of [-36, 32]) { g.save(); g.translate(x, 2); g.beginPath(); g.moveTo(-7, 0); g.quadraticCurveTo(-10, -9, -4, -15); g.lineTo(4, -15); g.quadraticCurveTo(10, -9, 7, 0); g.quadraticCurveTo(0, 2, -7, 0); g.closePath(); paint(g, '#efe6d0', 1.1); g.restore(); }
}
/** Крылья мельницы: 4 решётчатых крыла с парусиной вокруг ступицы; a — поворот. */
function millBladesT(g, a = 0) {
  for (let k = 0; k < 4; k++) { g.save(); g.rotate(a + k * Math.PI / 2);
    rr(g, -2.5, -82, 5, 82, 2.5); paint(g, '#7a5232', 1.2);
    g.beginPath(); g.roundRect(3, -80, 20, 60, 3); paint(g, '#f2ead6', 1.3); g.strokeStyle = '#a07a4a'; g.lineWidth = 1.1; for (let y = -74; y < -20; y += 9) { g.beginPath(); g.moveTo(3, y); g.lineTo(23, y); g.stroke(); } g.beginPath(); g.moveTo(13, -80); g.lineTo(13, -20); g.stroke();
    g.restore(); }
  g.beginPath(); g.arc(0, 0, 7, 0, TAU); paint(g, '#6a4a2c', 1.4); g.beginPath(); g.arc(0, 0, 3, 0, TAU); paint(g, TB.iron, 1);
}

const scaled = f => (g, a, b) => { g.save(); g.scale(SC, SC); f(g, a, b); g.restore(); };
export const TBLD = { bank: scaled(bank), house: scaled(house), forge: scaled(forge), tavern: scaled(tavern), enchant: scaled(enchant), miners: scaled(miners), herbal: scaled(herbal), inn: scaled(inn), palace: scaled(palace) };
/** Посёлок (Хутор Подгорный, хутора): в своих размерах, без ×1,35. */
export const TVIL = { house: vhouse, inn: vinn, forge: vforge, barn, farmstead, millBase: millBaseT, millBlades: millBladesT };
