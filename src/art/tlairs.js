// v104: приметы логов Соснового дола и Хуторских угодий, мост, скалы и рудные жилы — в мультяшном стиле (STYLE.md).
// Начало координат — точка на земле в середине. Шатры 1,5–2 роста героя (рост ≈ 61 с PEOPLE_K).
import { KIT, TB } from './tbld.js';
import { crate as crateT, barrel as barrelP, haystack as hayP } from './tprops.js';
const { sh, ink, rnd, paint, shine, rr, poly } = KIT;
const TAU = Math.PI * 2, DARK = '#6a4a2c', IRON = '#4a4c58';
const shadow = (g, rx, ry = rx * 0.24, dx = 4) => { g.fillStyle = 'rgba(20,12,6,.06)'; g.beginPath(); g.ellipse(dx, 2, rx, ry, 0, 0, TAU); g.fill(); };
function stick(g, x0, y0, x1, y1, w, col) { g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.strokeStyle = ink(col); g.lineWidth = w + 2.4; g.stroke(); g.strokeStyle = col; g.lineWidth = w; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = Math.max(0.8, w * 0.25); g.beginPath(); g.moveTo(x0 - w * 0.2, y0); g.lineTo(x1 - w * 0.2, y1); g.stroke(); }
function curve(g, pts, w, col) { g.lineCap = 'round'; g.lineJoin = 'round'; const path = () => { g.beginPath(); g.moveTo(pts[0], pts[1]); g.quadraticCurveTo(pts[2], pts[3], pts[4], pts[5]); }; path(); g.strokeStyle = ink(col); g.lineWidth = w + 2.4; g.stroke(); path(); g.strokeStyle = col; g.lineWidth = w; g.stroke(); }
/** Пухлый валун: эллипс-подушка с плоским низом, градиент, блик, тень справа. */
export function boulder(g, x, y, w, h, col, moss = false, seed = 1) {
  const r = rnd(seed); g.beginPath(); g.moveTo(x - w / 2, y); g.bezierCurveTo(x - w / 2 - 2, y - h * 0.7, x - w * 0.25, y - h, x + w * 0.05, y - h); g.bezierCurveTo(x + w * 0.38, y - h, x + w / 2 + 2, y - h * 0.6, x + w / 2, y); g.quadraticCurveTo(x, y + h * 0.12, x - w / 2, y); g.closePath();
  const gr = g.createLinearGradient(x - w / 2, y - h, x + w / 2, y); gr.addColorStop(0, sh(col, 0.22)); gr.addColorStop(0.55, col); gr.addColorStop(1, sh(col, -0.3)); g.fillStyle = gr; g.fill(); g.strokeStyle = ink(col); g.lineWidth = 1.8; g.lineJoin = 'round'; g.stroke();
  shine(g, x - w * 0.18, y - h * 0.72, w * 0.16, h * 0.08, 0.38);
  g.strokeStyle = sh(col, -0.32); g.lineWidth = 1.2; g.lineCap = 'round'; for (let i = 0; i < 2; i++) { const cx = x + (r() - 0.3) * w * 0.5, cy = y - h * (0.25 + r() * 0.3); g.beginPath(); g.moveTo(cx, cy); g.quadraticCurveTo(cx + 4, cy + 5, cx + 2, cy + 10); g.stroke(); }
  if (moss) { g.save(); g.beginPath(); g.ellipse(x - w * 0.05, y - h * 0.94, w * 0.34, h * 0.16, -0.1, 0, TAU); paint(g, '#6f9a44', 1.2); for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(x - w * 0.3 + i * w * 0.18, y - h * 0.86 + (i % 2) * 3, 4, 0, Math.PI); g.fillStyle = '#6f9a44'; g.fill(); } g.restore(); }
}
function boneT(g, x, y, a) { g.save(); g.translate(x, y); g.rotate(a); rr(g, -7, -1.8, 14, 3.6, 1.8); paint(g, '#f0e8d4', 0.9); for (const sx of [-7, 7]) for (const sy of [-1.8, 1.8]) { g.beginPath(); g.arc(sx, sy, 2.3, 0, TAU); paint(g, '#f0e8d4', 0.9); } g.restore(); }
function tuft(g, x, y, col = '#5f9a44') { for (const [dx, h, a] of [[-4, 10, -0.4], [0, 14, 0], [4, 10, 0.4]]) { g.beginPath(); g.moveTo(x + dx - 2, y); g.quadraticCurveTo(x + dx + Math.sin(a) * h * 0.6, y - h * 0.6, x + dx + Math.sin(a) * h, y - h); g.quadraticCurveTo(x + dx + 1, y - h * 0.4, x + dx + 2, y); g.closePath(); paint(g, col, 0.8); } }

// ---------------------------------------------------------------- лисья нора: пухлый холм, тёмный лаз, корни, кости, рыжая шерсть
function den(g) {
  shadow(g, 66, 14);
  g.beginPath(); g.moveTo(-62, 0); g.bezierCurveTo(-60, -40, -20, -50, 4, -48); g.bezierCurveTo(40, -46, 62, -30, 62, 0); g.quadraticCurveTo(0, 8, -62, 0); g.closePath(); paint(g, '#9a7046', 1.8, -48, 0, 0.2);
  shine(g, -24, -36, 18, 5, 0.25); g.beginPath(); g.ellipse(-8, -46, 30, 8, -0.1, Math.PI, 0); paint(g, '#6f9a44', 1.2);
  g.beginPath(); g.moveTo(-18, 0); g.lineTo(-18, -10); g.bezierCurveTo(-18, -26, 26, -26, 26, -10); g.lineTo(26, 0); g.closePath(); g.fillStyle = '#1e140c'; g.fill(); g.strokeStyle = ink('#9a7046'); g.lineWidth = 1.6; g.stroke();
  for (const p of [[-44, -30, -20, -28, -8, -20], [46, -30, 30, -26, 20, -18], [-2, -46, 2, -34, -6, -24]]) curve(g, p, 3.4, '#7a5232');
  boneT(g, 38, 6, 0.4); boneT(g, -40, 6, -0.6);
  for (const [x, y] of [[-26, 2], [32, -2], [12, 8]]) { g.beginPath(); g.ellipse(x, y, 4, 2, 0.5, 0, TAU); paint(g, '#e0843a', 0.8); }
  tuft(g, -54, 4); tuft(g, 56, 4);
}
// ---------------------------------------------------------------- волчье логово: груда валунов с пещерой, мох, кости, череп
function wolf(g) {
  shadow(g, 76, 16);
  boulder(g, -38, 2, 64, 42, '#8a867c', false, 3); boulder(g, 40, 2, 58, 36, '#928e84', false, 5);
  boulder(g, 0, -10, 92, 54, '#9a968a', true, 7);
  g.beginPath(); g.moveTo(-16, -6); g.bezierCurveTo(-16, -30, 20, -30, 20, -6); g.closePath(); g.fillStyle = '#140e0a'; g.fill(); g.fillRect(-16, -8, 36, 8);
  boneT(g, 30, 8, 0.2); boneT(g, -12, 10, 1.1); boneT(g, -50, 10, -0.3);
  g.beginPath(); g.arc(58, 2, 6, 0, TAU); paint(g, '#f0e8d4', 1); g.fillStyle = '#3a2a1a'; g.beginPath(); g.arc(56, 1, 1.4, 0, TAU); g.arc(60, 1, 1.4, 0, TAU); g.fill();
  tuft(g, -66, 4); tuft(g, 70, 4, '#6a9a4a');
}
// ---------------------------------------------------------------- кабанья лёжка: грязевая лужа с бликами, кочки, пень, следы
function boar(g) {
  g.beginPath(); g.ellipse(0, -2, 72, 25, 0, 0, TAU); paint(g, '#7a5a3a', 1.6, -27, 23, 0.1);
  g.beginPath(); g.ellipse(-6, -2, 54, 17, 0, 0, TAU); paint(g, '#5a4028', 1, -19, 15, 0.1);
  for (const [x, y, w] of [[-16, -6, 18], [22, 2, 10]]) shine(g, x, y, w, 2.4, 0.4, 0);
  for (const [x, y] of [[-66, 10], [-48, 18], [58, 14], [40, 20], [72, -6]]) { g.beginPath(); g.ellipse(x, y, 8, 5, 0, Math.PI, 0); paint(g, '#8a6a44', 1.1); }
  g.save(); g.translate(50, -16);
  g.beginPath(); g.moveTo(-13, 12); g.lineTo(-12, -6); g.quadraticCurveTo(-8, -15, -3, -9); g.quadraticCurveTo(2, -16, 6, -10); g.quadraticCurveTo(12, -12, 12, -4); g.lineTo(13, 12); g.closePath(); paint(g, '#8a5a32', 1.6, -15, 12);
  g.beginPath(); g.ellipse(-1, -8, 10, 3.6, 0, 0, TAU); paint(g, '#e0b880', 1); g.strokeStyle = '#b08850'; g.lineWidth = 0.8; g.beginPath(); g.ellipse(-1, -8, 5, 1.8, 0, 0, TAU); g.stroke();
  g.restore();
  g.fillStyle = 'rgba(60,40,20,.5)'; for (let i = 0; i < 6; i++) { const x = -60 + i * 22, y = 32 + (i % 2) * 6; g.beginPath(); g.ellipse(x - 2.4, y, 2, 3, 0, 0, TAU); g.ellipse(x + 2.4, y, 2, 3, 0, 0, TAU); g.fill(); }
}
// ---------------------------------------------------------------- паучье гнездо: толстая коряга, паутина, коконы
function web(g) {
  shadow(g, 66, 14);
  g.fillStyle = 'rgba(245,245,250,.3)'; g.beginPath(); g.ellipse(0, 0, 66, 20, 0, 0, TAU); g.fill();
  const br = [[0, 2, -4, -52], [-4, -52, -38, -80], [-4, -52, 32, -86], [-16, -64, -46, -56], [14, -68, 44, -60]];
  for (const b of br) stick(g, b[0], b[1], b[2], b[3], b === br[0] ? 9 : 5.5, '#6a6058');
  const cx = -4, cy = -64, R = 36; g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 1.2;
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R * 0.8); g.stroke(); }
  for (let k = 1; k <= 4; k++) { g.beginPath(); for (let i = 0; i <= 10; i++) { const a = i / 10 * TAU, r0 = R * k / 4.4, x = cx + Math.cos(a) * r0, y = cy + Math.sin(a) * r0 * 0.8; i ? g.quadraticCurveTo(cx + Math.cos(a - 0.3) * r0 * 0.88, cy + Math.sin(a - 0.3) * r0 * 0.7, x, y) : g.moveTo(x, y); } g.stroke(); }
  for (const [x, y, s] of [[-32, -2, 1], [28, -2, 0.85], [42, -50, 0.7]]) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.ellipse(0, -10, 7.5, 12, 0.15, 0, TAU); paint(g, '#f2eee4', 1.2, -22, 2); g.strokeStyle = 'rgba(160,150,130,.7)'; g.lineWidth = 1; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-7, -17 + i * 5); g.quadraticCurveTo(0, -14 + i * 5, 7, -16 + i * 5); g.stroke(); } shine(g, -3, -15, 2, 4, 0.5, 0.15); g.restore(); }
}
// ---------------------------------------------------------------- шатёр: пухлые скаты, полог, колья, растяжки, флажок
function tent(g, x, y, w, col, flag) {
  const H = w * 1.25; g.save(); g.translate(x, y);
  g.fillStyle = 'rgba(20,12,6,.06)'; g.beginPath(); g.ellipse(6, 2, w * 1.15, w * 0.26, 0, 0, TAU); g.fill();
  for (const s of [-1, 1]) { stick(g, s * w * 0.4, -H * 0.62, s * (w + 18), 4, 1, '#d8c8a0'); stick(g, s * (w + 18), 6, s * (w + 18), -6, 3, DARK); }
  const body = () => { g.beginPath(); g.moveTo(-w, 0); g.quadraticCurveTo(-w * 0.62, -H * 0.42, -6, -H); g.quadraticCurveTo(0, -H - 4, 6, -H); g.quadraticCurveTo(w * 0.62, -H * 0.42, w, 0); g.quadraticCurveTo(0, w * 0.12, -w, 0); g.closePath(); };
  body(); paint(g, col, 1.8, -H, 0, 0.18);
  g.save(); body(); g.clip(); g.fillStyle = 'rgba(20,10,0,.18)'; g.beginPath(); g.moveTo(4, -H); g.quadraticCurveTo(w * 0.62, -H * 0.42, w, 0); g.lineTo(w * 0.3, 2); g.closePath(); g.fill();
  g.strokeStyle = sh(col, -0.25); g.lineWidth = 1.2; for (const s of [-0.55, 0.55]) { g.beginPath(); g.moveTo(s * w * 0.15, -H * 0.9); g.quadraticCurveTo(s * w * 0.55, -H * 0.3, s * w * 0.72, 0); g.stroke(); }
  g.fillStyle = sh(col, -0.15); for (let k = -3; k <= 3; k++) { g.beginPath(); g.arc(k * w * 0.28, -2, w * 0.13, Math.PI, 0); g.fill(); } g.restore();
  shine(g, -w * 0.42, -H * 0.5, w * 0.08, H * 0.18, 0.25, 0.5);
  g.beginPath(); g.moveTo(-w * 0.3, 0); g.quadraticCurveTo(-w * 0.18, -H * 0.5, 0, -H * 0.74); g.quadraticCurveTo(w * 0.18, -H * 0.5, w * 0.3, 0); g.closePath(); g.fillStyle = '#20140c'; g.fill();
  g.beginPath(); g.moveTo(0, -H * 0.74); g.quadraticCurveTo(-w * 0.12, -H * 0.4, -w * 0.38, -H * 0.12); g.quadraticCurveTo(-w * 0.3, -H * 0.42, 0, -H * 0.74); g.closePath(); paint(g, sh(col, 0.12), 1.2);
  g.beginPath(); g.arc(-w * 0.36, -H * 0.13, 3, 0, TAU); paint(g, '#c8a060', 0.9);
  body(); g.strokeStyle = ink(col); g.lineWidth = 1.8; g.stroke();
  stick(g, 0, -H, 0, -H - 14, 3, DARK);
  if (flag) { g.beginPath(); g.moveTo(1, -H - 14); g.quadraticCurveTo(12, -H - 18, 22, -H - 10); g.quadraticCurveTo(12, -H - 6, 1, -H - 4); g.closePath(); paint(g, flag, 1.2); }
  g.restore();
}
function stakes(g, pts) { for (const [x, y] of pts) { g.beginPath(); g.moveTo(x - 3.5, y); g.lineTo(x - 3, y - 18); g.lineTo(x, y - 26); g.lineTo(x + 3, y - 18); g.lineTo(x + 3.5, y); g.closePath(); paint(g, '#9a7448', 1.2, y - 26, y); } }
function crate(g, x, y, s = 0.8) { g.save(); g.translate(x, y); crateT(g, s); g.restore(); }
// лагерь разбойников
function bandit(g) {
  tent(g, -118, -34, 70, '#9a8a62', '#9a2a2a');
  tent(g, 112, -26, 62, '#8a7a56');
  crate(g, -34, -6); crate(g, -16, -2, 0.7); crate(g, 36, 4); g.save(); g.translate(56, 2); barrelP(g, 0.8); g.restore();
  stakes(g, [[-196, 12], [-186, 20], [182, 16], [192, 6]]);
}
// логово Атамана: большой красный шатёр, знамя, сундук, ящики
function ataman(g) {
  tent(g, 0, -14, 92, '#a83a2e', '#f0c24a');
  g.save(); g.translate(0, -14); for (let k = -1; k <= 1; k += 2) { g.beginPath(); g.moveTo(k * 40, -90); g.quadraticCurveTo(k * 46, -60, k * 64, -40); g.strokeStyle = TB.gold; g.lineWidth = 3; g.stroke(); } g.restore();
  g.save(); g.translate(-110, 2); rr(g, -18, -22, 36, 22, 5); paint(g, '#7a4a28', 1.5, -22, 0); g.beginPath(); g.moveTo(-18, -20); g.quadraticCurveTo(0, -34, 18, -20); g.closePath(); paint(g, '#8a5a32', 1.4); for (const x of [-12, 12]) { rr(g, x - 2.5, -30, 5, 30, 2); paint(g, TB.gold, 1); } rr(g, -4, -16, 8, 9, 2); paint(g, TB.gold, 1); g.restore();
  crate(g, 100, -4); crate(g, 118, 4, 0.7);
  for (const x of [-148, 140])  { stick(g, x, 10, x, -40, 3.4, DARK); g.beginPath(); g.moveTo(x + 1, -40); g.lineTo(x + 18, -40); g.quadraticCurveTo(x + 15, -30, x + 18, -20); g.lineTo(x + 1, -20); g.closePath(); paint(g, '#a83a2e', 1.1); }
}
// псарня: будка с крышей, миска, цепь, кости
function kennel(g) {
  shadow(g, 48, 10);
  rr(g, -30, -32, 52, 32, 4); paint(g, '#a8784a', 1.6, -32, 0); g.save(); rr(g, -30, -32, 52, 32, 4); g.clip(); g.strokeStyle = '#7a5232'; g.lineWidth = 1; for (let y = -24; y < 0; y += 8) { g.beginPath(); g.moveTo(-30, y); g.lineTo(22, y); g.stroke(); } g.restore();
  g.beginPath(); g.moveTo(-38, -28); g.quadraticCurveTo(-20, -44, -4, -56); g.quadraticCurveTo(12, -44, 30, -28); g.quadraticCurveTo(-4, -24, -38, -28); g.closePath(); paint(g, '#8a4a32', 1.6, -56, -26);
  g.beginPath(); g.moveTo(-17, 0); g.lineTo(-17, -12); g.bezierCurveTo(-17, -28, 7, -28, 7, -12); g.lineTo(7, 0); g.closePath(); g.fillStyle = '#1a120a'; g.fill();
  rr(g, -12, -46, 16, 7, 3); paint(g, '#c8954a', 1);
  g.beginPath(); g.ellipse(40, -2, 10, 4, 0, 0, TAU); paint(g, '#8a8f9a', 1.2); g.beginPath(); g.ellipse(40, -3, 6.5, 2.2, 0, 0, TAU); g.fillStyle = '#7a4a2a'; g.fill();
  for (let i = 0; i < 6; i++) { const q = i / 5, x = 10 + q * 32, y = -6 + Math.sin(q * Math.PI) * 10; g.beginPath(); g.ellipse(x, y, 2.6, 1.8, i % 2 ? 0 : 1.5, 0, TAU); g.strokeStyle = '#6a6c78'; g.lineWidth = 1.2; g.stroke(); }
  boneT(g, -42, 6, 0.3); boneT(g, 20, 10, -0.8);
}
// вороньё поле: сухое дерево, гнёзда, вороны
function crowfield(g) {
  shadow(g, 32, 8);
  const br = [[0, 2, 2, -64], [2, -64, -24, -92], [2, -64, 28, -98], [-8, -76, -32, -70], [12, -78, 36, -74], [2, -64, 6, -104]];
  br.forEach((b, i) => stick(g, b[0], b[1], b[2], b[3], i ? 4.6 : 9, '#5a4a40'));
  for (const [x, y] of [[-22, -90], [26, -94]]) { g.beginPath(); g.ellipse(x, y, 11, 6, 0, 0, TAU); paint(g, '#8a6a40', 1.3); g.strokeStyle = '#a8844e'; g.lineWidth = 0.9; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(x - 10 + i * 4, y - 3); g.lineTo(x - 8 + i * 4, y + 3); g.stroke(); } }
  for (const [x, y] of [[6, -108], [-32, -76]]) { g.beginPath(); g.ellipse(x, y, 6, 4, 0, 0, TAU); paint(g, '#34303e', 1); g.beginPath(); g.arc(x + 5, y - 3, 3.2, 0, TAU); paint(g, '#34303e', 0.9); g.beginPath(); g.moveTo(x + 7.5, y - 3.5); g.lineTo(x + 12, y - 2); g.lineTo(x + 7.5, y - 1); g.closePath(); paint(g, '#e0b040', 0.6); g.fillStyle = '#fff'; g.beginPath(); g.arc(x + 5.6, y - 3.8, 0.9, 0, TAU); g.fill(); }
  g.fillStyle = '#2a2632'; for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(-30 + i * 10, 5 + (i % 2) * 3, 3.4, 1.3, 0.4, 0, TAU); g.fill(); }
}
// огород пугал: тыквы, колесо, лопата
function scarefield(g) {
  shadow(g, 48, 9);
  g.save(); g.translate(4, -14); g.beginPath(); g.arc(0, 0, 15, 0, TAU); g.strokeStyle = ink('#8a6a3a'); g.lineWidth = 6; g.stroke(); g.strokeStyle = '#9a7a4a'; g.lineWidth = 4; g.stroke(); g.strokeStyle = '#9a7a4a'; g.lineWidth = 2.4; for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; g.beginPath(); g.moveTo(-Math.cos(a) * 13, -Math.sin(a) * 13); g.lineTo(Math.cos(a) * 13, Math.sin(a) * 13); g.stroke(); } g.beginPath(); g.arc(0, 0, 3.4, 0, TAU); paint(g, IRON, 1); g.restore();
  for (const [x, y, s] of [[-30, 2, 1], [-12, 9, 0.8], [26, 5, 1.15]]) { g.save(); g.translate(x, y); g.scale(s, s); for (const dx of [-5, 5, 0]) { g.beginPath(); g.ellipse(dx, -8, dx ? 6 : 6.5, 8, 0, 0, TAU); paint(g, dx ? '#d86a24' : '#ec8030', 1.1, -16, 0); } shine(g, -3, -12, 2, 3, 0.4); stick(g, 0, -15, 1, -20, 2, '#5a8a3a'); g.restore(); }
  stick(g, 42, 6, 54, -36, 2.8, '#8a5a30'); g.beginPath(); g.moveTo(36, 2); g.lineTo(46, 2); g.quadraticCurveTo(46, 14, 41, 16); g.quadraticCurveTo(36, 14, 36, 2); g.closePath(); paint(g, '#a8b0bc', 1.1);
}
// выгон: загон из жердей и корыто
function pasture(g) {
  shadow(g, 62, 12);
  for (const [x1, y1, x2, y2] of [[-60, -10, 60, -16], [-60, -10, -64, 14], [60, -16, 64, 10]]) {
    for (const h of [-10, -20]) stick(g, x1, y1 + h, x2, y2 + h, 3, '#b08a54');
    const n = Math.round(Math.hypot(x2 - x1, y2 - y1) / 24); for (let i = 0; i <= n; i++) { const x = x1 + (x2 - x1) * i / n, y = y1 + (y2 - y1) * i / n; stick(g, x, y, x, y - 26, 3.6, '#8a6a40'); }
  }
  rr(g, -22, -4, 44, 12, 4); paint(g, '#8a5a32', 1.4); g.beginPath(); g.ellipse(0, -3, 18, 3, 0, 0, TAU); g.fillStyle = '#4a8ab0'; g.fill(); shine(g, -6, -3.5, 6, 1, 0.5, 0);
}
// пепелище: обугленные столбы, балка, угли
function burned(g) {
  g.fillStyle = 'rgba(30,22,16,.4)'; g.beginPath(); g.ellipse(0, -2, 60, 17, 0, 0, TAU); g.fill();
  for (const [x, h, a] of [[-38, 48, -0.1], [-12, 64, 0.05], [16, 40, 0.2], [40, 56, -0.05]]) { g.save(); g.translate(x, 0); g.rotate(a); rr(g, -5, -h, 10, h, 4.5); paint(g, '#3a2c24', 1.4, -h, 0); g.fillStyle = 'rgba(255,130,50,.8)'; for (let k = 0; k < 2; k++) { g.beginPath(); g.ellipse(0, -h * (0.45 + k * 0.25), 1.8, 3, 0, 0, TAU); g.fill(); } g.restore(); }
  g.save(); g.translate(-10, -42); g.rotate(-0.22); rr(g, -32, -5, 64, 10, 5); paint(g, '#2e241e', 1.4); g.restore();
  for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#ff8a3a' : '#ffc060'; g.beginPath(); g.arc(-40 + i * 7, 2 + (i % 3) * 3, 1.8, 0, TAU); g.fill(); }
}
/** Приметы логов: [ширина, высота, начало x, начало y, рисунок] картинки. */
export const TLAIRS = {
  den: [160, 90, 80, 70, den], wolf: [180, 100, 90, 76, wolf], boar: [170, 80, 85, 40, boar], web: [150, 120, 75, 100, web],
  bandit: [460, 210, 230, 160, bandit], ataman: [330, 240, 165, 190, ataman], kennel: [130, 90, 65, 70, kennel], crowfield: [110, 140, 55, 120, crowfield],
  scarefield: [140, 80, 70, 50, scarefield], pasture: [160, 80, 80, 50, pasture], burned: [150, 100, 75, 80, burned],
};

// ---------------------------------------------------------------- мост: толстые доски с зазорами, брёвна-перила на столбах (вид сверху, повёрнут по дороге)
export function bridge(g, len) {
  const w = 70; g.fillStyle = 'rgba(20,12,6,.18)'; g.fillRect(-w / 2 + 6, -len / 2 + 8, w, len);
  rr(g, -w / 2, -len / 2, w, len, 6); g.fillStyle = '#4a3420'; g.fill();
  for (let y = -len / 2 + 3, i = 0; y < len / 2 - 4; y += 12, i++) { rr(g, -w / 2 + 3, y, w - 6, 10.5, 4); paint(g, i % 3 === 1 ? '#b08850' : i % 3 ? '#a07a46' : '#a8804a', 1, y, y + 10, 0.1); g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-w / 2 + 8, y + 2.5); g.lineTo(w / 2 - 12, y + 2.5); g.stroke(); for (const x of [-w / 2 + 9, w / 2 - 9]) { g.beginPath(); g.arc(x, y + 5, 1.4, 0, TAU); g.fillStyle = IRON; g.fill(); } }
  for (const sx of [-1, 1]) { rr(g, sx * w / 2 - 5, -len / 2 - 6, 10, len + 12, 5); paint(g, '#8a5a32', 1.4); g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(sx * w / 2 - 2, -len / 2); g.lineTo(sx * w / 2 - 2, len / 2); g.stroke();
    for (let y = -len / 2; y <= len / 2 + 1; y += len / 4) { g.beginPath(); g.arc(sx * w / 2, y, 7, 0, TAU); paint(g, '#7a4e2a', 1.3); g.beginPath(); g.arc(sx * w / 2, y, 3.6, 0, TAU); paint(g, '#c8a070', 0.8); } }
}

// ---------------------------------------------------------------- скалы: пухлые валуны (рудные жилы остаются прежними, с острыми гранями — ore.js)
/** Скала у края: большой валун и два поменьше, мох, камешки. */
export function outcrop(g, w = 170, h = 110, seed = 5, moss = true) {
  const r = rnd(seed); shadow(g, w * 0.62, w * 0.14, w * 0.08);
  boulder(g, w * 0.3, 6, w * 0.55, h * 0.55, '#8e877a', false, seed + 3);
  boulder(g, 0, 0, w, h, '#9a9286', moss, seed);
  boulder(g, -w * 0.34, 10, w * 0.42, h * 0.42, '#948c80', moss && r() < 0.5, seed + 7);
  for (let i = 0; i < 6; i++) { const x = (r() - 0.5) * w * 1.2, y = 10 + r() * 10, s = 3 + r() * 4; g.beginPath(); g.ellipse(x, y, s, s * 0.7, 0, 0, TAU); paint(g, '#a8a094', 1); }
}
