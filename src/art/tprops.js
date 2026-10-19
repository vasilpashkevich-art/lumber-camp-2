// v103: убранство в мультяшном стиле (STYLE.md) — фонтан, фонари, клумбы, лавки, бочки, ящики, поленницы,
// телега с дровами, забор, стог, колодец, надгробия, указатель, костёр. Вид спереди и чуть сверху, круглое — эллипсом 2:1.
import { KIT, TB } from './tbld.js';
const { sh, ink, rnd, paint, shine, rr, poly, stoneRect, barrelT, woodpileT, hayT } = KIT;
const TAU = Math.PI * 2, STONE = '#c8c0ae', WOOD = '#a8743e', DARK = '#6a4a2c', IRON = '#4a4c58';
const shadow = (g, rx, ry = rx * 0.28, dx = 3) => { g.fillStyle = 'rgba(20,12,6,.06)'; g.beginPath(); g.ellipse(dx, 2, rx, ry, 0, 0, TAU); g.fill(); };
/** Пухлая палка (столб, ножка, перекладина) с бликом. */
function stick(g, x0, y0, x1, y1, w, col) { g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.strokeStyle = ink(col); g.lineWidth = w + 2.4; g.stroke(); g.strokeStyle = col; g.lineWidth = w; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = Math.max(0.8, w * 0.25); g.beginPath(); g.moveTo(x0 - w * 0.18, y0); g.lineTo(x1 - w * 0.18, y1); g.stroke(); }
/** Каменный круг (борт бассейна, колодец): верх-эллипс и стенка подушками по изгибу. */
function ringWall(g, R, ry, h, col, seed, n = 14) {
  const r = rnd(seed);
  g.beginPath(); g.ellipse(0, 0, R, ry, 0, 0, Math.PI); g.lineTo(-R, -h); g.ellipse(0, -h, R, ry, 0, Math.PI, 0, true); g.closePath(); paint(g, sh(col, -0.12), 1.8, -h, ry);
  g.save(); g.beginPath(); g.ellipse(0, 0, R, ry, 0, 0, Math.PI); g.lineTo(-R, -h); g.ellipse(0, -h, R, ry, 0, Math.PI, 0, true); g.closePath(); g.clip();
  const rows = Math.max(1, Math.round(h / 13)); for (let k = 0; k < rows; k++) { const y0 = -h + k * h / rows, off = (k % 2) * 0.5;
    for (let i = 0; i < n; i++) { const a0 = Math.PI * (i + off) / n, a1 = Math.PI * (i + off + 1) / n; const x0 = Math.cos(Math.PI - a0) * R, x1 = Math.cos(Math.PI - a1) * R, yy0 = Math.sin(a0) * ry, yy1 = Math.sin(a1) * ry, dy = (yy0 + yy1) / 2;
      const c = sh(col, (r() - 0.5) * 0.12 - Math.abs(x0 + x1) / (2 * R) * 0.04 - ((x0 + x1) > 0 ? 0.08 : 0)); rr(g, Math.min(x0, x1) + 1, y0 + dy + 1, Math.abs(x1 - x0) - 2, h / rows - 2, 4); paint(g, c, 0.9, y0 + dy, y0 + dy + h / rows, 0.12); } }
  const gr = g.createLinearGradient(-R, 0, R, 0); gr.addColorStop(0, 'rgba(255,255,255,.14)'); gr.addColorStop(0.4, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(20,12,6,.3)'); g.fillStyle = gr; g.fillRect(-R, -h - ry, R * 2, h + ry * 2);
  g.restore();
  g.beginPath(); g.ellipse(0, -h, R, ry, 0, 0, TAU); paint(g, sh(col, 0.14), 1.8, -h - ry, -h + ry, 0.08);
}

// ---------------------------------------------------------------- фонтан (те же размеры, что прежний: R — радиус бассейна)
/** part (v125): без него — всё сразу; 'lo' — чаша с водой (неподвижное), 'rings' — круги по воде, 'hi' — столб, чаши, струи (неподвижное), 'drops' — капли. Неподвижное рисуется один раз в картинку. */
export function fountain(g, t, R = 100, part) {
  const ry = R * 0.5, st = STONE, W = R + 12, all = !part;
  if (part === 'rings') { g.strokeStyle = 'rgba(230,248,255,.6)'; g.lineWidth = 2; for (let k = 0; k < 3; k++) { const q = (t * 0.5 + k / 3) % 1, r0 = 22 + q * (R - 30); g.globalAlpha = 1 - q; g.beginPath(); g.ellipse(0, -24, r0, r0 * 0.5, 0, 0, TAU); g.stroke(); } g.globalAlpha = 1; return; }
  if (part === 'drops') { g.fillStyle = 'rgba(240,252,255,.95)'; fDrops(g, t); return; }
  if (all || part === 'lo') {
  g.fillStyle = 'rgba(20,12,6,.08)'; g.beginPath(); g.ellipse(6, 10, W + 14, ry + 14, 0, 0, TAU); g.fill();
  ringWall(g, W, ry + 8, 24, st, 11, 16);
  // широкий бортик-кольцо и вода
  g.beginPath(); g.ellipse(0, -24, W, ry + 8, 0, 0, TAU); g.ellipse(0, -24, R - 4, ry - 4, 0, 0, TAU, true); paint(g, sh(st, 0.16), 1.6, -24 - ry - 8, -24 + ry + 8, 0.08);
  g.save(); g.beginPath(); g.ellipse(0, -24, R - 4, ry - 4, 0, 0, TAU); g.clip();
  const wg = g.createLinearGradient(0, -24 - ry, 0, -24 + ry); wg.addColorStop(0, '#2f6f98'); wg.addColorStop(1, '#5aaad0'); g.fillStyle = wg; g.fillRect(-R, -24 - ry, R * 2, ry * 2);
  g.fillStyle = 'rgba(20,50,80,.3)'; g.beginPath(); g.ellipse(0, -24 - ry * 0.55, R, ry * 0.5, 0, 0, TAU); g.fill();
  if (all) { g.strokeStyle = 'rgba(230,248,255,.6)'; g.lineWidth = 2;
  for (let k = 0; k < 3; k++) { const q = (t * 0.5 + k / 3) % 1, r0 = 22 + q * (R - 30); g.globalAlpha = 1 - q; g.beginPath(); g.ellipse(0, -24, r0, r0 * 0.5, 0, 0, TAU); g.stroke(); } }
  g.globalAlpha = 1; for (const [x, y, w] of [[-R * 0.55, -24 + ry * 0.25, 16], [R * 0.4, -24 + ry * 0.45, 12], [-R * 0.15, -24 + ry * 0.6, 10]]) shine(g, x, y, w, 2.2, 0.45, 0);
  g.restore(); g.beginPath(); g.ellipse(0, -24, R - 4, ry - 4, 0, 0, TAU); g.strokeStyle = ink(st); g.lineWidth = 1.4; g.stroke();
  }
  if (part === 'lo') return;
  // столб, чаши, шар
  const col = (y, h, w) => { rr(g, -w / 2, y - h, w, h, w / 2.4); paint(g, st, 1.6); const gr = g.createLinearGradient(-w / 2, 0, w / 2, 0); gr.addColorStop(0, 'rgba(255,255,255,.3)'); gr.addColorStop(1, 'rgba(20,12,6,.25)'); g.fillStyle = gr; rr(g, -w / 2, y - h, w, h, w / 2.4); g.fill(); for (const yy of [y - 4, y - h + 4]) { rr(g, -w / 2 - 4, yy - 4, w + 8, 8, 4); paint(g, sh(st, 0.08), 1.3); } };
  const bowl = (y, w) => { g.beginPath(); g.moveTo(-w - 2, y); g.quadraticCurveTo(-w + 2, y + w * 0.5, 0, y + w * 0.52); g.quadraticCurveTo(w - 2, y + w * 0.5, w + 2, y); g.closePath(); paint(g, sh(st, -0.04), 1.7, y, y + w * 0.5); g.beginPath(); g.ellipse(0, y, w + 2, w * 0.26, 0, 0, TAU); paint(g, sh(st, 0.18), 1.6); g.beginPath(); g.ellipse(0, y, w - 6, w * 0.18, 0, 0, TAU); paint(g, '#4f9cc4', 1); shine(g, -w * 0.4, y - 1, w * 0.25, 1.6, 0.5, 0); };
  col(-24, 66, 22); bowl(-90, 48); col(-90, 36, 14); bowl(-126, 26);
  g.beginPath(); g.arc(0, -144, 8, 0, TAU); paint(g, TB.gold, 1.4); shine(g, -2.5, -147, 3, 2, 0.6);
  // струи и капли
  g.lineCap = 'round';
  for (const sd of [-1, 1]) for (const [a, b] of [[[sd * 24, -126], [sd * 38, -94]], [[sd * 48, -90], [sd * 74, -34]]]) { g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(a[0] + sd * 14, a[1] + 2, b[0], b[1]); g.strokeStyle = 'rgba(160,215,245,.7)'; g.lineWidth = 4.6; g.stroke(); g.strokeStyle = 'rgba(240,252,255,.95)'; g.lineWidth = 2; g.stroke(); }
  g.beginPath(); g.moveTo(0, -152); g.lineTo(0, -168); g.strokeStyle = 'rgba(240,252,255,.9)'; g.lineWidth = 3; g.stroke();
  if (part === 'hi') return;
  g.fillStyle = 'rgba(240,252,255,.95)'; fDrops(g, t);
}
function fDrops(g, t) {
  for (let k = 0; k < 14; k++) { const q = (t * 1.3 + k / 14) % 1, sd = k % 2 ? 1 : -1, big = k % 4 < 2; const x = sd * (big ? 48 + q * 28 : 24 + q * 14), y = big ? -90 + q * q * 58 : -126 + q * q * 34; g.beginPath(); g.arc(x, y, 2.2, 0, TAU); g.fill(); }
  for (let k = 0; k < 6; k++) { const q = (t * 2 + k / 6) % 1; g.beginPath(); g.arc(Math.sin(k * 2.3) * 5, -160 - Math.sin(q * Math.PI) * 16, 2, 0, TAU); g.fill(); }
}
// ---------------------------------------------------------------- фонарь
export function lamp(g, t, night) {
  shadow(g, 12);
  rr(g, -9, -10, 18, 12, 5); paint(g, '#5a5c68', 1.3);
  stick(g, 0, -10, 0, -96, 6, '#454752');
  for (const y of [-30, -90]) { rr(g, -5.5, y - 3, 11, 6, 3); paint(g, '#5a5c68', 1); }
  g.beginPath(); g.moveTo(-10, -98); g.quadraticCurveTo(0, -94, 10, -98); g.lineTo(8, -104); g.lineTo(-8, -104); g.closePath(); paint(g, '#454752', 1.2);
  rr(g, -9, -124, 18, 21, 5); const gl = g.createLinearGradient(0, -124, 0, -103); gl.addColorStop(0, night ? '#fff4c0' : '#e8f4f8'); gl.addColorStop(1, night ? '#f0b040' : '#a8c8d8'); g.fillStyle = gl; g.fill(); g.strokeStyle = ink('#454752'); g.lineWidth = 1.4; g.stroke();
  g.strokeStyle = '#454752'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, -124); g.lineTo(0, -103); g.stroke(); shine(g, -4.5, -118, 1.6, 4, 0.55, 0);
  g.beginPath(); g.moveTo(-13, -123); g.quadraticCurveTo(-10, -136, 0, -138); g.quadraticCurveTo(10, -136, 13, -123); g.quadraticCurveTo(0, -120, -13, -123); g.closePath(); paint(g, '#454752', 1.3);
  g.beginPath(); g.arc(0, -140, 3, 0, TAU); paint(g, TB.gold, 1);
  if (night) { const gr = g.createRadialGradient(0, -114, 1, 0, -114, 80); gr.addColorStop(0, 'rgba(255,210,110,.45)'); gr.addColorStop(1, 'rgba(255,210,110,0)'); g.fillStyle = gr; g.fillRect(-80, -194, 160, 160); }
}
// ---------------------------------------------------------------- клумба (в землю): пухлый бортик, кустики, крупные цветы
export function flowerbed(g, w, h, seed = 3) {
  const r = rnd(seed);
  rr(g, -w / 2, -h / 2, w, h, h / 2); paint(g, '#9a948a', 1.6, -h / 2, h / 2, 0.12);
  rr(g, -w / 2 + 5, -h / 2 + 4, w - 10, h - 9, h / 2 - 4); paint(g, '#5a4028', 1, -h / 2, h / 2, 0.1);
  for (let k = 0; k < w / 12; k++) { const x = -w / 2 + 10 + k * (w - 20) / Math.max(1, w / 12 - 1), y = (r() - 0.5) * (h - 18); g.beginPath(); g.arc(x, y + 1, 5, 0, TAU); paint(g, '#4f8a3a', 0.9); }
  const C = ['#e85a5a', '#f4c766', '#fff8f0', '#b86ad8', '#ff9a4a'];
  for (let k = 0; k < w * h / 90; k++) { const x = -w / 2 + 9 + r() * (w - 18), y = -h / 2 + 7 + r() * (h - 15), c = C[Math.floor(r() * 5)]; for (let p = 0; p < 5; p++) { const a = p * TAU / 5; g.beginPath(); g.arc(x + Math.cos(a) * 2.2, y + Math.sin(a) * 1.6, 1.8, 0, TAU); g.fillStyle = c; g.fill(); } g.beginPath(); g.arc(x, y, 1.2, 0, TAU); g.fillStyle = '#f0c24a'; g.fill(); }
}
// ---------------------------------------------------------------- лавка: толстые доски, кованые ножки-завитки
export function bench(g) {
  shadow(g, 28, 6);
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 18, 0); g.quadraticCurveTo(s * 22, -10, s * 18, -18); g.strokeStyle = ink(IRON); g.lineWidth = 4.4; g.lineCap = 'round'; g.stroke(); g.strokeStyle = '#5a5c68'; g.lineWidth = 2.6; g.stroke(); g.beginPath(); g.arc(s * 18 + s * 2, -2, 2.6, 0, TAU); paint(g, '#5a5c68', 1); }
  rr(g, -26, -36, 52, 8, 4); paint(g, '#b0884e', 1.4); rr(g, -26, -26, 52, 5, 2.5); paint(g, '#a07a44', 1.1);
  for (const s of [-1, 1]) stick(g, s * 18, -18, s * 18, -36, 3, '#5a5c68');
  rr(g, -28, -22, 56, 8, 4); paint(g, '#c0945a', 1.5); shine(g, -12, -20, 10, 1.2, 0.35, 0);
}
export function barrel(g, s = 1) { shadow(g, 13 * s); barrelT(g, 0, 0, 1.15 * s); }
/** Ящик спереди-сверху: доски, крестовина, крышка полосой. */
export function crate(g, s = 1) {
  g.save(); g.scale(s, s); shadow(g, 15);
  rr(g, -13, -30, 26, 8, 3); paint(g, '#c8a070', 1.2);
  rr(g, -13, -24, 26, 24, 3); paint(g, '#b08a5a', 1.4, -24, 0);
  g.strokeStyle = '#8a6a40'; g.lineWidth = 1; for (const y of [-16, -8]) { g.beginPath(); g.moveTo(-12, y); g.lineTo(12, y); g.stroke(); }
  stick(g, -10, -21, 10, -3, 2.4, '#8a6a40'); for (const x of [-11, 11]) { rr(g, x - 2, -24, 4, 24, 2); paint(g, '#8a6a40', 1); }
  g.restore();
}
export function woodpile(g, w = 60) { shadow(g, w * 0.6, 7); for (const dx of [-w / 4, w / 4 - 4]) woodpileT(g, dx, 0); }
/** Телега с дровами сбоку: доски кузова, колёса со спицами, оглобля, поленья. */
export function cartWood(g) {
  shadow(g, 50, 8);
  stick(g, 34, -22, 66, -14, 3.6, DARK);
  for (let k = 0; k < 6; k++) { const x = -26 + k * 10, y = -38 - (k % 2) * 4; g.beginPath(); g.arc(x, y, 6, 0, TAU); paint(g, '#9a6a3a', 1.1); g.beginPath(); g.arc(x, y, 3.4, 0, TAU); g.fillStyle = '#e0b880'; g.fill(); }
  rr(g, -38, -34, 76, 22, 5); paint(g, '#a8784a', 1.5, -34, -12); g.strokeStyle = '#7a5232'; g.lineWidth = 1; for (const y of [-27, -20]) { g.beginPath(); g.moveTo(-36, y); g.lineTo(36, y); g.stroke(); }
  for (const x of [-36, 36]) { rr(g, x - 3, -36, 6, 26, 3); paint(g, DARK, 1.1); }
  for (const cx of [-22, 22]) { g.beginPath(); g.arc(cx, -10, 12, 0, TAU); g.strokeStyle = ink(DARK); g.lineWidth = 6; g.stroke(); g.strokeStyle = '#7a5232'; g.lineWidth = 4; g.stroke(); g.strokeStyle = '#8a6a40'; g.lineWidth = 1.8; for (let k = 0; k < 4; k++) { const a = k * Math.PI / 4; g.beginPath(); g.moveTo(cx - Math.cos(a) * 10, -10 - Math.sin(a) * 10); g.lineTo(cx + Math.cos(a) * 10, -10 + Math.sin(a) * 10); g.stroke(); } g.beginPath(); g.arc(cx, -10, 3.2, 0, TAU); paint(g, IRON, 1); }
}
/** Забор из круглых кольев: по горизонтали (len вправо) или в глубину (len вниз). */
export function fence(g, len, horizontal = true, seed = 1) {
  const n = Math.max(2, Math.round(len / 22));
  if (horizontal) {
    g.fillStyle = 'rgba(20,12,6,.06)'; g.fillRect(2, -2, len, 5);
    for (const y of [-24, -12]) { rr(g, -2, y - 3, len + 4, 6, 3); paint(g, '#b08a54', 1.2); }
    for (let k = 0; k <= n; k++) { const x = k * len / n; g.beginPath(); g.moveTo(x - 3.5, 0); g.lineTo(x - 3.5, -28); g.quadraticCurveTo(x, -33, x + 3.5, -28); g.lineTo(x + 3.5, 0); g.closePath(); paint(g, '#9a7448', 1.2, -32, 0); }
  } else {
    for (const x of [-3, 3]) { rr(g, x - 2.5, -26, 5, len + 4, 2.5); paint(g, '#b08a54', 1.1); }
    for (let k = 0; k <= n; k++) { const y = k * len / n; g.beginPath(); g.moveTo(-3.5, y); g.lineTo(-3.5, y - 28); g.quadraticCurveTo(0, y - 33, 3.5, y - 28); g.lineTo(3.5, y); g.closePath(); paint(g, '#9a7448', 1.2, y - 32, y); }
  }
}
/** Стог: пухлая копна, обвязка, жердь сверху. */
export function haystack(g) {
  shadow(g, 30, 8);
  g.beginPath(); g.moveTo(-30, 0); g.quadraticCurveTo(-34, -30, -10, -46); g.quadraticCurveTo(0, -52, 10, -46); g.quadraticCurveTo(34, -30, 30, 0); g.quadraticCurveTo(0, 6, -30, 0); g.closePath(); paint(g, '#e0b850', 1.6, -50, 0, 0.2);
  g.save(); g.clip(); g.strokeStyle = 'rgba(150,110,30,.55)'; g.lineWidth = 1.1; for (let i = 0; i < 11; i++) { const x = -26 + i * 5.2; g.beginPath(); g.moveTo(x, -2); g.quadraticCurveTo(x * 0.7, -24, x * 0.3, -42); g.stroke(); }
  const gr = g.createLinearGradient(-30, 0, 30, 0); gr.addColorStop(0, 'rgba(255,255,255,.12)'); gr.addColorStop(1, 'rgba(60,30,0,.22)'); g.fillStyle = gr; g.fillRect(-34, -52, 68, 56); g.restore();
  g.beginPath(); g.moveTo(-26, -18); g.quadraticCurveTo(0, -12, 26, -18); g.strokeStyle = ink('#8a5a30'); g.lineWidth = 3.4; g.stroke(); g.strokeStyle = '#a07040'; g.lineWidth = 2; g.stroke();
  shine(g, -12, -32, 6, 10, 0.25, -0.4); stick(g, 0, -44, 0, -58, 2.6, DARK);
}
/** Колодец: каменный сруб кольцом, вода, столбы, двускатная крыша, ворот с ведром. */
export function well(g) {
  shadow(g, 26, 8);
  for (const s of [-1, 1]) stick(g, s * 18, -16, s * 18, -50, 4.4, '#7a5232');
  g.beginPath(); g.ellipse(0, -16, 15, 6, 0, 0, TAU); g.fillStyle = '#16303e'; g.fill(); shine(g, -4, -17, 5, 1.4, 0.35, 0);
  ringWall(g, 22, 8, 16, '#a8a294', 5, 9);
  g.beginPath(); g.ellipse(0, -16, 14, 5, 0, 0, TAU); g.fillStyle = '#16303e'; g.fill(); g.strokeStyle = ink('#a8a294'); g.lineWidth = 1; g.stroke(); shine(g, -4, -17, 5, 1.2, 0.35, 0);
  stick(g, -20, -40, 20, -40, 4, '#8a6a40'); g.beginPath(); g.moveTo(4, -40); g.lineTo(4, -28); g.strokeStyle = '#5a4a3a'; g.lineWidth = 1; g.stroke(); rr(g, -1, -30, 10, 8, 2.5); paint(g, '#8a6a40', 1.1); for (const y of [-28, -24]) { g.strokeStyle = IRON; g.lineWidth = 1; g.beginPath(); g.moveTo(-1, y); g.lineTo(9, y); g.stroke(); }
  g.beginPath(); g.moveTo(-28, -46); g.quadraticCurveTo(-14, -56, 0, -64); g.quadraticCurveTo(14, -56, 28, -46); g.quadraticCurveTo(0, -42, -28, -46); g.closePath(); paint(g, '#b8503a', 1.5, -64, -44);
  g.save(); g.clip(); g.strokeStyle = 'rgba(80,20,10,.35)'; g.lineWidth = 1; for (const y of [-50, -55]) { g.beginPath(); g.moveTo(-28, y + 4); g.quadraticCurveTo(0, y - 2, 28, y + 4); g.stroke(); } g.restore();
  stick(g, -28, -46, 0, -64, 2.6, '#7a5232'); stick(g, 28, -46, 0, -64, 2.6, '#7a5232');
}
/** Надгробие: плита с полукруглым верхом или крест; холмик земли. */
export function grave(g, cross) {
  shadow(g, 14, 4);
  g.beginPath(); g.ellipse(0, 0, 13, 5, 0, 0, TAU); paint(g, '#6a5a44', 1.1);
  if (cross) { stick(g, 0, -2, 0, -32, 5, '#9a948a'); stick(g, -9, -24, 9, -24, 5, '#9a948a'); }
  else { g.beginPath(); g.moveTo(-9, 0); g.lineTo(-9, -18); g.quadraticCurveTo(-9, -30, 0, -30); g.quadraticCurveTo(9, -30, 9, -18); g.lineTo(9, 0); g.closePath(); paint(g, '#a8a296', 1.4, -30, 0); shine(g, -4, -24, 2, 4, 0.35, -0.2); g.strokeStyle = sh('#a8a296', -0.35); g.lineWidth = 1.2; g.beginPath(); g.moveTo(-4, -17); g.lineTo(4, -17); g.moveTo(-4, -12); g.lineTo(4, -12); g.stroke(); g.beginPath(); g.ellipse(-6, -2, 4, 2.4, 0, 0, TAU); paint(g, '#6f9a44', 0.8); }
}
/** Указатель у выхода из края: столб, доска-стрелка, завал брёвен. */
export function signpost(g) {
  shadow(g, 32, 7);
  for (let i = 0; i < 3; i++) { g.save(); g.translate(20, -5 - i * 8); g.rotate(-0.06 + i * 0.05); rr(g, -30, -5, 60, 10, 5); paint(g, '#8a5a30', 1.3); g.beginPath(); g.ellipse(30, 0, 3.4, 5, 0, 0, TAU); paint(g, '#e0b880', 1); g.restore(); }
  stick(g, 0, 0, 0, -64, 6, '#6a4a2c');
  g.beginPath(); g.moveTo(-30, -60); g.lineTo(24, -60); g.quadraticCurveTo(36, -51, 24, -42); g.lineTo(-30, -42); g.quadraticCurveTo(-33, -51, -30, -60); g.closePath(); paint(g, '#c8954a', 1.6, -60, -42); shine(g, -16, -57, 10, 1.2, 0.35, 0);
  g.strokeStyle = sh('#c8954a', -0.4); g.lineWidth = 1.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(-20, -51); g.lineTo(16, -51); g.stroke();
}
/** v126: доска заказов — два столба, широкая доска с крышей-козырьком, приколотые листки с печатями. Высота ≈ 1,6 роста. */
export function board(g, t = 0) {
  shadow(g, 48, 9);
  for (const x of [-34, 34]) stick(g, x, 0, x, -74, 7, '#6a4a2c');
  // доска
  g.beginPath(); g.roundRect(-46, -72, 92, 48, 5); paint(g, '#8a5a30', 1.6, -72, -24);
  g.strokeStyle = sh('#8a5a30', -0.4); g.lineWidth = 0.9; for (const y of [-56, -40]) { g.beginPath(); g.moveTo(-42, y); g.lineTo(42, y); g.stroke(); }
  g.beginPath(); g.roundRect(-43, -69, 86, 42, 4); g.strokeStyle = sh('#8a5a30', -0.3); g.lineWidth = 1; g.stroke();
  // козырёк черепицей
  g.beginPath(); g.moveTo(-52, -72); g.lineTo(-44, -86); g.lineTo(44, -86); g.lineTo(52, -72); g.closePath(); paint(g, '#a84a3a', 1.6, -86, -72);
  g.strokeStyle = sh('#a84a3a', -0.4); g.lineWidth = 0.8; for (let x = -40; x <= 40; x += 10) { g.beginPath(); g.moveTo(x, -85); g.lineTo(x + 2, -73); g.stroke(); }
  shine(g, -30, -80, 12, 1.4, 0.3, 0);
  // листки
  for (const [x, y, a, w, h, seal] of [[-30, -62, -0.08, 22, 26, '#b83a3a'], [-4, -64, 0.05, 20, 24, '#3a6ab8'], [20, -60, -0.04, 22, 28, '#b83a3a']]) {
    g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.roundRect(-w / 2, 0, w, h, 2); paint(g, '#f0e4c4', 1, 0, h);
    g.strokeStyle = 'rgba(60,40,20,.45)'; g.lineWidth = 1; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(-w / 2 + 4, 5 + i * 4.5); g.lineTo(w / 2 - 4 - (i % 2) * 5, 5 + i * 4.5); g.stroke(); }
    g.beginPath(); g.arc(w / 2 - 5, h - 5, 3.2, 0, TAU); paint(g, seal, 0.8); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(w / 2 - 6, h - 6, 1, 0, TAU); g.fill();
    g.beginPath(); g.arc(0, 1.5, 1.6, 0, TAU); paint(g, '#e0b840', 0.6); g.restore();
  }
  // золотая печать на козырьке
  g.beginPath(); g.arc(0, -79, 4.2, 0, TAU); paint(g, '#e0b840', 1); g.strokeStyle = sh('#e0b840', -0.5); g.lineWidth = 0.9; g.beginPath(); g.arc(0, -79, 2.2, 0, TAU); g.stroke();
}
/** Костёр: кольцо круглых камней, крест поленьев, пламя слоями (живое). */
/** part (v125): без него — всё; 'back' — отсвет, задние камни, поленья; 'front' — передние камни (неподвижное — один раз в картинку); 'flame' — пламя; 'sparks' — искры. */
export function campfire(g, x, y, t, part) {
  const all = !part;
  if (all || part === 'back') {
  g.fillStyle = 'rgba(255,150,50,.16)'; g.beginPath(); g.arc(x, y - 6, 60, 0, TAU); g.fill();
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + 0.3; if (Math.sin(a) < 0) { g.beginPath(); g.ellipse(x + Math.cos(a) * 16, y + Math.sin(a) * 7, 5, 4, 0, 0, TAU); paint(g, i % 2 ? '#8a867d' : '#9a968c', 1); } }
  for (const s of [-1, 1]) { g.save(); g.translate(x, y - 3); g.rotate(s * 0.35); rr(g, -14, -3.5, 28, 7, 3.5); paint(g, '#7a5232', 1.2); g.restore(); } }
  if (all || part === 'flame') for (let i = 0; i < 3; i++) { const f = 1 + 0.15 * Math.sin(t * 9 + i * 2); g.fillStyle = ['#ff6a2a', '#ffb347', '#fff2a0'][i]; const w = 9 - i * 2.8, h = (22 - i * 6) * f; g.beginPath(); g.moveTo(x - w, y - 2); g.quadraticCurveTo(x - w * 1.1, y - h * 0.5, x + Math.sin(t * 6 + i) * 2, y - h); g.quadraticCurveTo(x + w * 1.1, y - h * 0.5, x + w, y - 2); g.closePath(); g.fill(); }
  if (all || part === 'front') for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + 0.3; if (Math.sin(a) >= 0) { g.beginPath(); g.ellipse(x + Math.cos(a) * 16, y + Math.sin(a) * 7, 5, 4, 0, 0, TAU); paint(g, i % 2 ? '#8a867d' : '#9a968c', 1); } }
  if (all || part === 'sparks') for (let k = 0; k < 4; k++) { const q = (t * 0.8 + k / 4) % 1; g.fillStyle = `rgba(255,200,90,${1 - q})`; g.beginPath(); g.arc(x + Math.sin(k * 3 + t * 2) * 6, y - 20 - q * 30, 1.6, 0, TAU); g.fill(); }
}
/** Ограда кладбища (в землю): круглые столбики с перекладиной по эллипсу, калитка в сторону ga. */
export function graveFence(g, cx, cy, rx, ry, ga) {
  const n = 40, gap = 0.24;
  const at = a => [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
  g.lineCap = 'round';
  g.beginPath(); g.ellipse(cx, cy - 6, rx, ry, 0, ga + gap, ga - gap + TAU); g.strokeStyle = ink('#7a5a3a'); g.lineWidth = 5; g.stroke(); g.strokeStyle = '#9a7448'; g.lineWidth = 3; g.stroke();
  for (let i = 0; i < n; i++) { const a = ga + gap + (TAU - 2 * gap) * i / (n - 1), [x, y] = at(a); rr(g, x - 3.5, y - 12, 7, 14, 3.5); paint(g, '#8a6a44', 1.1); }
  for (const d of [-gap, gap]) { const [x, y] = at(ga + d); rr(g, x - 5, y - 18, 10, 20, 4); paint(g, '#6a6c74', 1.3); g.beginPath(); g.arc(x, y - 20, 4, 0, TAU); paint(g, '#7a7c84', 1.1); }
}

// ================================================================ v130: кварталы Столицы
/** Значки кварталов (руна, молот, лист, кровать) — одинаковые у табличек в мире и на картах. r — размер. */
export function quarterIcon(g, icon, r = 8, col = '#fff') {
  g.save(); g.lineCap = g.lineJoin = 'round'; g.strokeStyle = col; g.fillStyle = col; g.lineWidth = r * 0.28;
  if (icon === 'rune') { g.beginPath(); g.moveTo(0, -r); g.lineTo(r * 0.85, r * 0.7); g.lineTo(-r * 0.85, r * 0.7); g.closePath(); g.stroke(); g.beginPath(); g.moveTo(0, r * 0.7); g.lineTo(0, -r * 0.1); g.stroke(); }
  else if (icon === 'hammer') { g.lineWidth = r * 0.34; g.beginPath(); g.moveTo(-r * 0.8, r * 0.9); g.lineTo(r * 0.45, -r * 0.35); g.stroke(); g.beginPath(); g.roundRect(r * 0.05, -r * 1.05, r * 1.0, r * 0.7, r * 0.15); g.fill(); }
  else if (icon === 'leaf') { g.beginPath(); g.moveTo(0, -r); g.quadraticCurveTo(r * 1.1, -r * 0.2, 0, r); g.quadraticCurveTo(-r * 1.1, -r * 0.2, 0, -r); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = r * 0.12; g.beginPath(); g.moveTo(0, -r * 0.7); g.lineTo(0, r * 0.8); g.stroke(); }
  else if (icon === 'bed') { g.beginPath(); g.roundRect(-r, -r * 0.3, r * 2, r * 0.8, r * 0.15); g.fill(); g.beginPath(); g.roundRect(-r, -r * 0.85, r * 0.6, r * 0.5, r * 0.12); g.fill(); g.lineWidth = r * 0.2; g.beginPath(); g.moveTo(-r, r * 0.5); g.lineTo(-r, r); g.moveTo(r, r * 0.5); g.lineTo(r, r); g.stroke(); }
  g.restore();
}
/** Табличка квартала у входа с главной улицы: столб, щиток в цвете квартала со значком, доска с названием, флажок. Высота ≈ 1,7 роста. */
export function quarterSign(g, q) {
  shadow(g, 26, 6);
  stick(g, 0, 0, 0, -78, 7, DARK);
  // флажок
  g.beginPath(); g.moveTo(3, -78); g.lineTo(30, -72); g.lineTo(3, -64); g.closePath(); paint(g, q.col, 1.2, -78, -64);
  // щиток со значком
  g.beginPath(); g.moveTo(-16, -62); g.lineTo(16, -62); g.lineTo(16, -44); g.quadraticCurveTo(16, -32, 0, -28); g.quadraticCurveTo(-16, -32, -16, -44); g.closePath(); paint(g, q.col, 1.6, -62, -28);
  g.save(); g.translate(0, -46); quarterIcon(g, q.icon, 8, '#fff8e8'); g.restore(); shine(g, -8, -56, 5, 2, 0.35);
  // доска с названием
  const txt = q.name.toUpperCase(); g.font = 'bold 9px Georgia, serif'; const w = Math.max(90, g.measureText(txt).width + 18); g.beginPath(); g.roundRect(-w / 2, -26, w, 20, 5); paint(g, '#c8954a', 1.5, -26, -6);
  g.strokeStyle = sh('#c8954a', -0.4); g.lineWidth = 0.9; g.beginPath(); g.roundRect(-w / 2 + 3, -23, w - 6, 14, 3); g.stroke();
  g.fillStyle = '#3a2410'; g.font = 'bold 9px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, -16); g.textBaseline = 'alphabetic';
}
/** Аптекарский огород: три грядки с травами, сушильня с пучками, котёл под навесом на столбах. Ширина ≈ 260. */
export function herbGarden(g) {
  shadow(g, 120, 16, 6);
  // грядки
  for (const [x, y, w, seed] of [[-100, -6, 70, 2], [-100, -34, 70, 5], [-100, -62, 70, 8]]) { g.save(); g.translate(x, y); flowerbed(g, w, 16, seed); g.restore(); }
  // травы на грядках
  const r = rnd(11); for (const y of [-14, -42, -70]) for (let x = -130; x < -70; x += 11) { const h = 6 + r() * 5, col = ['#5f9a44', '#7ab050', '#4a8a3a'][Math.abs(x / 11 | 0) % 3]; g.strokeStyle = col; g.lineWidth = 1.6; g.lineCap = 'round'; for (const dx of [-3, 0, 3]) { g.beginPath(); g.moveTo(x + dx, y); g.quadraticCurveTo(x + dx * 1.8, y - h * 0.6, x + dx * 2.4, y - h); g.stroke(); } }
  // сушильня: две стойки, перекладина, пучки трав
  for (const x of [-20, 50]) stick(g, x, 0, x, -62, 6, DARK); stick(g, -24, -58, 54, -58, 5, WOOD);
  for (let x = -12; x <= 42; x += 13) { g.beginPath(); g.moveTo(x, -56); g.lineTo(x - 5, -36); g.lineTo(x + 5, -36); g.closePath(); paint(g, ['#7a9a3a', '#9a8a3a', '#5a8a4a', '#b08a40', '#6a9a5a'][(x + 12) / 13 | 0], 1, -56, -36); g.strokeStyle = '#d8c080'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - 2, -52); g.lineTo(x + 2, -52); g.stroke(); }
  // навес над котлом: 4 столба, крыша дранкой
  const cx = 100; for (const x of [cx - 34, cx + 34]) stick(g, x, 0, x, -66, 6, DARK);
  g.beginPath(); g.moveTo(cx - 46, -64); g.lineTo(cx - 34, -84); g.lineTo(cx + 34, -84); g.lineTo(cx + 46, -64); g.closePath(); paint(g, '#7a5236', 1.6, -84, -64);
  g.strokeStyle = sh('#7a5236', -0.35); g.lineWidth = 0.9; for (let x = cx - 36; x <= cx + 36; x += 9) { g.beginPath(); g.moveTo(x, -83); g.lineTo(x + 2, -65); g.stroke(); }
  // котёл на огне
  g.beginPath(); g.ellipse(cx, -4, 22, 6, 0, 0, TAU); paint(g, '#4a3a30', 1.1);
  for (const [dx, dy] of [[-14, -6], [0, -9], [14, -6]]) { g.beginPath(); g.moveTo(cx + dx - 4, dy + 4); g.quadraticCurveTo(cx + dx, dy - 10, cx + dx + 4, dy + 4); paint(g, dx ? '#f0a030' : '#ffd040', 0.9, dy - 10, dy + 4); }
  g.beginPath(); g.moveTo(cx - 20, -14); g.quadraticCurveTo(cx - 24, -36, cx - 16, -40); g.lineTo(cx + 16, -40); g.quadraticCurveTo(cx + 24, -36, cx + 20, -14); g.quadraticCurveTo(cx, -8, cx - 20, -14); g.closePath(); paint(g, '#3e4050', 1.6, -40, -8);
  g.beginPath(); g.ellipse(cx, -40, 17, 5, 0, 0, TAU); paint(g, '#5a9a5a', 1.2); shine(g, cx - 10, -30, 5, 2.4, 0.35);
  g.strokeStyle = IRON; g.lineWidth = 2.2; g.beginPath(); g.moveTo(cx - 18, -40); g.quadraticCurveTo(cx, -62, cx + 18, -40); g.stroke();
  for (const [dx, dy, rr0] of [[-6, -48, 2.5], [4, -54, 2], [9, -46, 1.6]]) { g.beginPath(); g.arc(cx + dx, dy, rr0, 0, TAU); g.fillStyle = 'rgba(190,240,190,.7)'; g.fill(); }
}
/** Вагонетка с рудой у гильдии рудокопов: кузов, колёса, самородки. */
export function oreCart(g) {
  shadow(g, 30, 7);
  g.beginPath(); g.moveTo(-22, -24); g.lineTo(22, -24); g.lineTo(17, -6); g.lineTo(-17, -6); g.closePath(); paint(g, '#5a5c68', 1.4, -24, -6);
  g.strokeStyle = sh('#5a5c68', -0.35); g.lineWidth = 1; g.beginPath(); g.moveTo(-19, -15); g.lineTo(19, -15); g.stroke();
  for (const [dx, dy, col] of [[-9, -27, '#c87a4a'], [0, -30, '#b86a3a'], [9, -27, '#c87a4a'], [-3, -25, '#8a8478']]) { g.beginPath(); g.moveTo(dx - 5, dy + 4); g.lineTo(dx - 2, dy - 4); g.lineTo(dx + 4, dy - 3); g.lineTo(dx + 6, dy + 3); g.closePath(); paint(g, col, 1, dy - 4, dy + 4); }
  for (const x of [-11, 11]) { g.beginPath(); g.arc(x, -4, 5.5, 0, TAU); paint(g, '#3a3c48', 1.2); g.beginPath(); g.arc(x, -4, 2, 0, TAU); g.fillStyle = '#8a8c98'; g.fill(); }
  for (let k = 0; k < 2; k++) { rr(g, -30, 1 + k * 4, 60, 2.6, 1.3); paint(g, '#7a5232', 0.7); }
}
