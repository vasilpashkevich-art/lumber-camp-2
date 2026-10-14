// v100: рынок и тележка купца в мультяшном стиле (STYLE.md): толстые доски с обводкой в тон и бликом,
// пухлый полосатый навес с фестонами, корзины яблок, капуста, хлеб, кувшины, рулоны ткани, мешки, бочки, вывеска с монетой.
// Мерки: рост героя ≈ 54 (PEOPLE_K 1,45): стойка по пояс (≈ 34), навес ≈ 2,4 роста, колесо тележки ≈ 0,7 роста.
// (0,0) — середина переднего края у земли. Продавца рисует переданная функция who(g) — в нужный момент по глубине.
const TAU = Math.PI * 2;
const sh = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join(''); };
const ink = col => sh(col, -0.6);
const WOOD = '#b07a42', WOOD_D = '#8a5a30', CLOTH_R = '#d0443a', CLOTH_W = '#f2e8d2', GOLD = '#f0c24a';
function paint(g, col, lw = 1.4, y0, y1, k = 0.18) {
  if (y0 != null) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, sh(col, k)); gr.addColorStop(1, sh(col, -k)); g.fillStyle = gr; } else g.fillStyle = col;
  g.fill(); if (lw) { g.strokeStyle = ink(col); g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); }
}
const shine = (g, x, y, rx, ry, a = 0.4, rot = -0.35) => { g.fillStyle = `rgba(255,255,255,${a})`; g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU); g.fill(); };
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2))); };
const poly = (g, pts) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
const KX = 0.3, KY = 0.5, P = (x, y, z) => [x + y * KX, -z - y * KY];
/** Доска: скруглённый брусок с прожилкой и бликом. */
function plank(g, x, y, w, h, col = WOOD) { rr(g, x, y, w, h, Math.min(3, h / 2)); paint(g, col, 1.3, y, y + h, 0.14); g.strokeStyle = 'rgba(70,35,12,.3)'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(x + w * 0.15, y + h * 0.55); g.quadraticCurveTo(x + w * 0.4, y + h * 0.35, x + w * 0.6, y + h * 0.55); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x + 3, y + 1.6); g.lineTo(x + w * 0.5, y + 1.6); g.stroke(); }
/** Столб: круглое бревно с обводкой. */
function post(g, x, y0, y1, w = 7, col = WOOD_D) { rr(g, x - w / 2, y1, w, y0 - y1, w / 2); const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0); gr.addColorStop(0, sh(col, 0.25)); gr.addColorStop(1, sh(col, -0.25)); g.fillStyle = gr; g.fill(); g.strokeStyle = ink(col); g.lineWidth = 1.4; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - w * 0.2, y1 + 3); g.lineTo(x - w * 0.2, y0 - 3); g.stroke(); }
// ---------------------------------------------------------------- товары
function apple(g, x, y, r = 3.4, col = '#d8402a') { g.beginPath(); g.arc(x, y, r, 0, TAU); paint(g, col, 0.9, y - r, y + r, 0.2); shine(g, x - r * 0.35, y - r * 0.35, r * 0.3, r * 0.2, 0.75); g.strokeStyle = '#5a3a1c'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + 0.6, y - r - 1.6); g.stroke(); }
function basket(g, x, y, w, fruit = '#d8402a') {
  const h = w * 0.42; for (let i = 0; i < 7; i++) apple(g, x - w * 0.32 + (i % 4) * w * 0.21 + (i > 3 ? w * 0.1 : 0), y - h - 1 - (i > 3 ? 3.2 : 0), w * 0.11, i % 3 === 2 ? sh(fruit, 0.15) : fruit);
  g.beginPath(); g.moveTo(x - w / 2, y - h); g.lineTo(x + w / 2, y - h); g.quadraticCurveTo(x + w * 0.46, y, x + w * 0.3, y); g.lineTo(x - w * 0.3, y); g.quadraticCurveTo(x - w * 0.46, y, x - w / 2, y - h); g.closePath(); paint(g, '#c8954a', 1.2, y - h, y);
  g.save(); g.clip(); g.strokeStyle = 'rgba(90,50,20,.45)'; g.lineWidth = 0.8; for (let k = 1; k < 3; k++) { g.beginPath(); g.moveTo(x - w / 2, y - h + k * h / 3); g.lineTo(x + w / 2, y - h + k * h / 3); g.stroke(); } for (let xx = x - w / 2; xx < x + w / 2; xx += 4) { g.beginPath(); g.moveTo(xx, y - h); g.lineTo(xx + 1, y); g.stroke(); } g.restore();
  rr(g, x - w / 2 - 1, y - h - 1.6, w + 2, 3.2, 1.6); paint(g, '#d8a860', 1);
}
function cabbage(g, x, y, r = 6) { for (const [dx, dy, k] of [[-0.5, 0.1, -0.08], [0.5, 0.1, -0.04], [0, -0.25, 0.08]]) { g.beginPath(); g.ellipse(x + dx * r, y + dy * r, r * 0.8, r * 0.7, 0, 0, TAU); paint(g, sh('#7cbf4a', k), 1, y - r, y + r); } g.strokeStyle = 'rgba(40,90,20,.5)'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(x, y - r * 0.6); g.quadraticCurveTo(x - r * 0.3, y, x, y + r * 0.4); g.stroke(); shine(g, x - r * 0.3, y - r * 0.5, r * 0.25, r * 0.14, 0.5); }
function bread(g, x, y, w = 15) { g.beginPath(); g.ellipse(x, y, w / 2, w * 0.28, 0, 0, TAU); paint(g, '#d8954a', 1.1, y - w * 0.28, y + w * 0.28, 0.22); g.strokeStyle = '#a86a2a'; g.lineWidth = 1; for (const k of [-0.25, 0, 0.25]) { g.beginPath(); g.moveTo(x + k * w - 1.6, y - w * 0.12); g.lineTo(x + k * w + 1.6, y + w * 0.06); g.stroke(); } shine(g, x - w * 0.18, y - w * 0.14, w * 0.16, w * 0.06, 0.45); }
function jug(g, x, y, h = 16, col = '#c8724a') { g.beginPath(); g.moveTo(x - h * 0.16, y - h); g.lineTo(x + h * 0.16, y - h); g.quadraticCurveTo(x + h * 0.14, y - h * 0.75, x + h * 0.32, y - h * 0.5); g.quadraticCurveTo(x + h * 0.42, y - h * 0.05, x + h * 0.2, y); g.lineTo(x - h * 0.2, y); g.quadraticCurveTo(x - h * 0.42, y - h * 0.05, x - h * 0.32, y - h * 0.5); g.quadraticCurveTo(x - h * 0.14, y - h * 0.75, x - h * 0.16, y - h); g.closePath(); paint(g, col, 1.2, y - h, y); g.beginPath(); g.ellipse(x, y - h, h * 0.17, h * 0.05, 0, 0, TAU); g.fillStyle = '#4a2a1a'; g.fill(); g.strokeStyle = sh(col, -0.3); g.lineWidth = 1; g.beginPath(); g.moveTo(x - h * 0.34, y - h * 0.45); g.lineTo(x + h * 0.34, y - h * 0.45); g.stroke(); shine(g, x - h * 0.15, y - h * 0.55, h * 0.06, h * 0.14, 0.55, 0); }
function bolt(g, x, y, w, r, col) { rr(g, x - w / 2, y - r * 2, w, r * 2, r); paint(g, col, 1.2, y - r * 2, y); g.beginPath(); g.ellipse(x + w / 2 - 1, y - r, r * 0.45, r, 0, 0, TAU); paint(g, sh(col, 0.12), 1); g.beginPath(); g.ellipse(x + w / 2 - 1, y - r, r * 0.15, r * 0.35, 0, 0, TAU); g.fillStyle = sh(col, -0.35); g.fill(); g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x - w / 2 + 3, y - r * 1.6); g.lineTo(x + w / 2 - 6, y - r * 1.6); g.stroke(); }
function sack(g, x, y, w = 20, col = '#d8c08a') { const h = w * 1.05; g.beginPath(); g.moveTo(x - w * 0.42, y); g.quadraticCurveTo(x - w * 0.6, y - h * 0.5, x - w * 0.25, y - h * 0.82); g.quadraticCurveTo(x - w * 0.3, y - h, x, y - h * 0.95); g.quadraticCurveTo(x + w * 0.3, y - h, x + w * 0.25, y - h * 0.82); g.quadraticCurveTo(x + w * 0.6, y - h * 0.5, x + w * 0.42, y); g.quadraticCurveTo(x, y + 2, x - w * 0.42, y); g.closePath(); paint(g, col, 1.3, y - h, y); g.strokeStyle = '#8a6a3a'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x - w * 0.24, y - h * 0.8); g.quadraticCurveTo(x, y - h * 0.72, x + w * 0.24, y - h * 0.8); g.stroke(); shine(g, x - w * 0.2, y - h * 0.5, w * 0.1, h * 0.16, 0.35, 0.2); }
function barrel(g, x, y, w = 22, h = 28, top = null) {
  g.beginPath(); g.moveTo(x - w * 0.42, y); g.quadraticCurveTo(x - w * 0.58, y - h / 2, x - w * 0.42, y - h); g.lineTo(x + w * 0.42, y - h); g.quadraticCurveTo(x + w * 0.58, y - h / 2, x + w * 0.42, y); g.quadraticCurveTo(x, y + w * 0.12, x - w * 0.42, y); g.closePath();
  const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0); gr.addColorStop(0, sh(WOOD, 0.22)); gr.addColorStop(0.5, WOOD); gr.addColorStop(1, sh(WOOD, -0.3)); g.fillStyle = gr; g.fill(); g.strokeStyle = ink(WOOD); g.lineWidth = 1.4; g.stroke();
  for (const k of [0.2, 0.8]) { g.beginPath(); g.moveTo(x - w * 0.52, y - h * k); g.quadraticCurveTo(x, y - h * k + w * 0.1, x + w * 0.52, y - h * k); g.strokeStyle = '#4a4c58'; g.lineWidth = 2.6; g.stroke(); }
  g.beginPath(); g.ellipse(x, y - h, w * 0.42, w * 0.13, 0, 0, TAU); paint(g, sh(WOOD, 0.15), 1.2);
  if (top) for (let i = 0; i < 5; i++) apple(g, x - w * 0.24 + (i % 3) * w * 0.24, y - h - 1.4 - (i > 2 ? 2.4 : 0) + (i > 2 ? 0 : 0), w * 0.12, top);
  shine(g, x - w * 0.22, y - h * 0.5, w * 0.06, h * 0.25, 0.35, 0);
}
function crate(g, x, y, w = 24, h = 18) { const d = 8; poly(g, [[x - w / 2, y - h], [x - w / 2 + d * 0.6, y - h - d * 0.5], [x + w / 2 + d * 0.6, y - h - d * 0.5], [x + w / 2, y - h]]); paint(g, sh(WOOD, 0.18), 1.2); poly(g, [[x + w / 2, y - h], [x + w / 2 + d * 0.6, y - h - d * 0.5], [x + w / 2 + d * 0.6, y - d * 0.5], [x + w / 2, y]]); paint(g, sh(WOOD, -0.18), 1.2);
  rr(g, x - w / 2, y - h, w, h, 2); paint(g, WOOD, 1.3, y - h, y); g.strokeStyle = ink(WOOD); g.lineWidth = 1; g.beginPath(); g.moveTo(x - w / 2 + 2, y - h + 2); g.lineTo(x + w / 2 - 2, y - 2); g.moveTo(x - w / 2, y - h / 2); g.lineTo(x + w / 2, y - h / 2); g.stroke(); }
function pot(g, x, y, r = 6, col = '#7a8a9a') { g.beginPath(); g.ellipse(x, y - r, r, r * 0.9, 0, 0, TAU); paint(g, col, 1.1, y - r * 2, y); g.beginPath(); g.ellipse(x, y - r * 1.8, r * 0.6, r * 0.18, 0, 0, TAU); g.fillStyle = sh(col, -0.4); g.fill(); shine(g, x - r * 0.4, y - r * 1.3, r * 0.2, r * 0.3, 0.6, 0); }
function flask(g, x, y, col) { g.beginPath(); g.arc(x, y - 3.4, 3.4, 0, TAU); paint(g, col, 0.9); rr(g, x - 1.1, y - 9, 2.2, 3.4, 0.6); paint(g, '#cfe4ec', 0.7); rr(g, x - 1.4, y - 10.2, 2.8, 1.6, 0.6); paint(g, '#8a5a30', 0.6); shine(g, x - 1.2, y - 4.6, 0.9, 0.7, 0.85); }
/** Вывеска на кронштейне: доска с монетой. */
function sign(g, x, y) {
  g.strokeStyle = ink('#4a4c58'); g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 30, y); g.stroke(); g.strokeStyle = '#6a6c78'; g.lineWidth = 1.6; g.stroke();
  for (const dx of [8, 24]) { g.strokeStyle = '#4a4c58'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + dx, y); g.lineTo(x + dx, y + 5); g.stroke(); }
  rr(g, x + 3, y + 5, 26, 18, 4); paint(g, '#c8954a', 1.4, y + 5, y + 23);
  g.beginPath(); g.arc(x + 16, y + 14, 5.6, 0, TAU); paint(g, GOLD, 1.2); g.fillStyle = sh(GOLD, -0.3); g.font = 'bold 7px Georgia'; g.textAlign = 'center'; g.fillText('$', x + 16, y + 16.6); shine(g, x + 14, y + 11.6, 1.8, 1, 0.8);
}

// ---------------------------------------------------------------- прилавок
/** Рыночный прилавок. who(g) — рисует продавца (стоит за стойкой, ступни на земле в точке (0, −24)). */
export function stall(g, t = 0, who = null) {
  const W2 = 74, D = 62, ZC = 34, ZA = 128;   // полуширина, глубина, высота стойки и навеса
  g.fillStyle = 'rgba(20,12,6,.04)'; g.beginPath(); g.ellipse(20, 2, 100, 18, 0, 0, TAU); g.fill();   // тень слабая: мягкий контур её усиливает
  // задние столбы, полка и товар сзади
  for (const x of [-W2, W2]) { const a = P(x, D, 0), b = P(x, D, ZA + 14); post(g, a[0], a[1], b[1], 7); }
  { const a = P(-W2 + 6, D, 66), b = P(W2 - 6, D, 66); plank(g, a[0], a[1] - 5, b[0] - a[0], 7, WOOD_D); for (let i = 0; i < 5; i++) jug(g, a[0] + 12 + i * 24, a[1] - 5, 13 + (i % 2) * 3, ['#c8724a', '#6a8ab0', '#c8a060', '#8a5aa0', '#c8724a'][i]); }
  { const a = P(-W2 + 14, D - 6, 0); sack(g, a[0], a[1], 22); crate(g, a[0] + 26, a[1] + 2, 22, 17); const b = P(W2 - 18, D - 6, 0); barrel(g, b[0], b[1], 22, 28); }
  // продавец
  if (who) { g.save(); g.translate(6, -24); who(g); g.restore(); }
  // стойка: верх (доски в глубину), лицо из досок, рейки, ножки
  const tp = [P(-W2, 0, ZC), P(W2, 0, ZC), P(W2, 24, ZC), P(-W2, 24, ZC)];
  poly(g, tp); paint(g, sh(WOOD, 0.2), 1.6);
  g.save(); poly(g, tp); g.clip(); for (let k = 1; k < 4; k++) { const a = P(-W2, k * 6, ZC), b = P(W2, k * 6, ZC); g.strokeStyle = 'rgba(70,35,12,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); } g.restore();
  const side = [P(W2, 0, 0), P(W2, 24, 0), P(W2, 24, ZC), P(W2, 0, ZC)]; poly(g, side); paint(g, sh(WOOD, -0.22), 1.6);
  for (let k = 0; k < 4; k++) plank(g, -W2, -ZC + k * (ZC / 4), W2 * 2, ZC / 4 - 0.4, k % 2 ? WOOD : sh(WOOD, -0.06));
  for (const x of [-W2 + 4, W2 - 10]) { rr(g, x, -ZC + 2, 6, ZC - 2, 2); paint(g, WOOD_D, 1.2); }
  g.beginPath(); g.roundRect(-W2 - 4, -ZC - 4, W2 * 2 + 8, 6, 3); paint(g, sh(WOOD, 0.1), 1.5, -ZC - 4, -ZC + 2);
  // товар на стойке
  const on = (x, y) => P(x, y, ZC);
  { const p = on(-52, 12); basket(g, p[0], p[1], 26, '#d8402a'); }
  { const p = on(-22, 10); cabbage(g, p[0] - 4, p[1] - 4, 6.4); cabbage(g, p[0] + 7, p[1] - 3, 6); cabbage(g, p[0] + 2, p[1] - 9, 5.6); }
  { const p = on(4, 8); bread(g, p[0], p[1] - 3, 16); bread(g, p[0] + 6, p[1] - 7, 14); }
  { const p = on(28, 14); bolt(g, p[0] - 4, p[1], 20, 4.4, '#3a6cc0'); bolt(g, p[0] + 2, p[1] - 8, 18, 4, '#5fa05a'); }
  { const p = on(56, 10); for (const [dx, col] of [[-6, '#d84a4a'], [0, '#4a8ad8'], [6, '#5fc85f']]) flask(g, p[0] + dx, p[1] - 1, col); }
  // передние столбы, мешок у стойки, бочка с яблоками
  for (const x of [-W2, W2]) { const b = P(x, -2, ZA); post(g, x, 2, b[1], 8); }
  sack(g, -W2 - 18, 2, 22, '#c8a870'); barrel(g, W2 + 22, 4, 24, 30, '#8ac04a');
  // навес: полосы от переднего края назад, пухлые
  const A0 = P(-W2 - 10, -8, ZA), A1 = P(W2 + 10, -8, ZA), B1 = P(W2 + 10, D + 8, ZA + 22), B0 = P(-W2 - 10, D + 8, ZA + 22), n = 8;
  for (let i = 0; i < n; i++) { const q0 = i / n, q1 = (i + 1) / n, L = (a, b, q) => [a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q];
    const f0 = L(A0, A1, q0), f1 = L(A0, A1, q1), b1 = L(B0, B1, q1), b0 = L(B0, B1, q0), col = i % 2 ? CLOTH_W : CLOTH_R, sag = 4;
    g.beginPath(); g.moveTo(b0[0], b0[1]); g.lineTo(b1[0], b1[1]); g.quadraticCurveTo((b1[0] + f1[0]) / 2 + 1, (b1[1] + f1[1]) / 2 + sag, f1[0], f1[1]); g.lineTo(f0[0], f0[1]); g.quadraticCurveTo((b0[0] + f0[0]) / 2 + 1, (b0[1] + f0[1]) / 2 + sag, b0[0], b0[1]); g.closePath();
    paint(g, col, 1.3, b0[1], f0[1], 0.12); }
  g.beginPath(); g.moveTo(A0[0], A0[1]); g.lineTo(B0[0], B0[1]); g.lineTo(B1[0], B1[1]); g.lineTo(A1[0], A1[1]); g.strokeStyle = ink(CLOTH_R); g.lineWidth = 1.8; g.stroke();
  shine(g, (A0[0] + B1[0]) / 2 - 30, (A0[1] + B1[1]) / 2 - 2, 26, 3, 0.25, -0.22);
  // фестоны по переднему краю
  for (let i = 0; i < 12; i++) { const x0 = A0[0] + (A1[0] - A0[0]) * i / 12, x1 = A0[0] + (A1[0] - A0[0]) * (i + 1) / 12, y = A0[1]; g.beginPath(); g.moveTo(x0, y); g.quadraticCurveTo((x0 + x1) / 2, y + 12, x1, y); g.closePath(); paint(g, i % 2 ? CLOTH_W : CLOTH_R, 1.2, y, y + 9); }
  g.beginPath(); g.roundRect(A0[0] - 2, A0[1] - 3, A1[0] - A0[0] + 4, 5, 2.5); paint(g, WOOD_D, 1.3);
  // вывеска на правом столбе
  sign(g, W2 + 2, -ZA * 0.62);
}

// ---------------------------------------------------------------- тележка
/** Тележка купца: кузов с досками, тент на дугах, большие колёса, оглобли, фонарь, товары. who(g) — купец рядом (справа, ступни в (64, 4)). */
export function cart(g, t = 0, who = null) {
  g.fillStyle = 'rgba(20,12,6,.04)'; g.beginPath(); g.ellipse(0, 3, 100, 16, 0, 0, TAU); g.fill();
  const x0 = -84, x1 = 36, yb = -34, yt = -60, Rr = 21, Rf = 17;
  // дальние колёса (сдвинуты вглубь) и оглобли
  wheel(g, -52 + 9, -Rr - 6, Rr, true); wheel(g, 14 + 9, -Rf - 6, Rf, true);
  for (const dy of [0, 5]) { g.beginPath(); g.moveTo(x1 - 4, yb - 2 + dy - (dy ? 3 : 0)); g.quadraticCurveTo(x1 + 30, yb + 8 + dy, x1 + 62, yb + 12 + dy - (dy ? 4 : 0)); g.strokeStyle = ink(WOOD_D); g.lineWidth = 4.6; g.lineCap = 'round'; g.stroke(); g.strokeStyle = WOOD_D; g.lineWidth = 2.8; g.stroke(); }
  // кузов: верхняя кромка в глубину, доски, нижняя балка
  poly(g, [[x0, yt], [x0 + 9, yt - 6], [x1 + 9, yt - 6], [x1, yt]]); paint(g, sh(WOOD, 0.2), 1.3);
  poly(g, [[x1, yt], [x1 + 9, yt - 6], [x1 + 9, yb - 6], [x1, yb]]); paint(g, sh(WOOD, -0.22), 1.3);
  for (let k = 0; k < 3; k++) plank(g, x0, yt + k * ((yb - yt) / 3), x1 - x0, (yb - yt) / 3, k % 2 ? WOOD : sh(WOOD, -0.06));
  rr(g, x0 - 4, yb - 3, x1 - x0 + 8, 7, 3.5); paint(g, WOOD_D, 1.4);
  for (const x of [x0 + 2, (x0 + x1) / 2 - 2, x1 - 6]) { rr(g, x, yt - 2, 4, yb - yt + 2, 1.5); paint(g, WOOD_D, 1); }
  // товары у открытого заднего края
  sack(g, x0 + 14, yt + 1, 18); crate(g, x0 + 36, yt, 18, 13); barrel(g, x0 + 60, yt + 1, 16, 20, '#d8402a'); pot(g, x0 + 82, yt, 6); jug(g, x0 + 98, yt, 13, '#6a8ab0');
  // тент на дугах: высокий, пухлый, с красной полосой
  const tent = () => { g.beginPath(); g.moveTo(x0 + 4, yt - 8); g.bezierCurveTo(x0 - 8, yt - 84, x1 + 12, yt - 84, x1 + 2, yt - 8); g.quadraticCurveTo((x0 + x1) / 2, yt - 22, x0 + 4, yt - 8); g.closePath(); };
  tent(); paint(g, CLOTH_W, 1.8, yt - 76, yt);
  g.save(); tent(); g.clip(); for (let k = 0; k < 5; k++) { const x = x0 + 12 + k * (x1 - x0 - 20) / 4; g.strokeStyle = 'rgba(150,110,70,.45)'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(x - 4, yt - 10); g.quadraticCurveTo(x - 2, yt - 70, x + 2, yt - 80); g.stroke(); }
  g.fillStyle = CLOTH_R; g.fillRect(x0 - 10, yt - 34, x1 - x0 + 24, 9); g.fillStyle = 'rgba(20,12,6,.14)'; g.fillRect((x0 + x1) / 2 + 14, yt - 90, 80, 90); g.restore();
  tent(); g.strokeStyle = ink(CLOTH_W); g.lineWidth = 1.8; g.stroke();
  shine(g, x0 + 30, yt - 58, 18, 5, 0.4, -0.3);
  // фонарь на крюке
  g.strokeStyle = ink('#4a4c58'); g.lineWidth = 2.4; g.beginPath(); g.moveTo(x1 - 2, yt - 36); g.lineTo(x1 + 12, yt - 36); g.lineTo(x1 + 12, yt - 31); g.stroke();
  const pulse = 0.8 + 0.2 * Math.sin(t * 4), gl = g.createRadialGradient(x1 + 12, yt - 24, 0.5, x1 + 12, yt - 24, 20); gl.addColorStop(0, `rgba(255,200,110,${0.55 * pulse})`); gl.addColorStop(1, 'rgba(255,200,110,0)'); g.fillStyle = gl; g.beginPath(); g.arc(x1 + 12, yt - 24, 20, 0, TAU); g.fill();
  rr(g, x1 + 8, yt - 31, 8, 11, 2.5); paint(g, '#ffd58a', 1.2); rr(g, x1 + 7, yt - 33, 10, 3, 1.5); paint(g, '#4a4c58', 1);
  // ближние колёса
  wheel(g, -52, -Rr, Rr, false); wheel(g, 14, -Rf, Rf, false);
  sack(g, x0 - 10, 4, 20, '#c8a870');
  if (who) { g.save(); g.translate(76, 6); who(g); g.restore(); }
}
function wheel(g, x, y, R, far) {
  g.save(); g.translate(x, y); if (far) g.globalAlpha = 0.9;
  const rim = far ? sh(WOOD_D, -0.2) : WOOD_D;
  g.beginPath(); g.arc(0, 0, R, 0, TAU); g.arc(0, 0, R - 4.2, 0, TAU, true); paint(g, rim, 1.6);
  g.beginPath(); g.arc(0, 0, R + 0.6, 0, TAU); g.strokeStyle = '#4a4c58'; g.lineWidth = 1.8; g.stroke();
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + 0.2; g.beginPath(); g.moveTo(Math.cos(a) * 3, Math.sin(a) * 3); g.lineTo(Math.cos(a) * (R - 4), Math.sin(a) * (R - 4)); g.strokeStyle = ink(WOOD); g.lineWidth = 3.4; g.stroke(); g.strokeStyle = far ? sh(WOOD, -0.15) : WOOD; g.lineWidth = 2; g.stroke(); }
  g.beginPath(); g.arc(0, 0, 4.4, 0, TAU); paint(g, '#6a6c78', 1.2); shine(g, -1.4, -1.4, 1.4, 1, 0.7);
  if (!far) { g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 1.6; g.beginPath(); g.arc(0, 0, R - 2, 3.6, 4.6); g.stroke(); }
  g.restore();
}
