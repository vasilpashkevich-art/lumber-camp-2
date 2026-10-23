// v106: Грибной лес в мультяшном стиле (STYLE.md): грибы-великаны, поваленные стволы, светящиеся грибочки, папоротник,
// камыш, пруд, хижины квакунов, грибной круг, паутина, логово Полоза. Основание — (0,0), размеры прежние (forest.js).
import { KIT } from './tbld.js';
const { sh, ink, rnd, paint, shine, rr } = KIT;
const TAU = Math.PI * 2;
const shadow = (g, rx, ry = rx * 0.26, dx = 3) => { g.fillStyle = 'rgba(20,12,6,.07)'; g.beginPath(); g.ellipse(dx, 1.5, rx, ry, 0, 0, TAU); g.fill(); };
function stick(g, x0, y0, x1, y1, w, col) { g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.strokeStyle = ink(col); g.lineWidth = w + 2; g.stroke(); g.strokeStyle = col; g.lineWidth = w; g.stroke(); }
function mini(g, x, y, cap, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); rr(g, -1.2, -4.5, 2.4, 4.5, 1.2); paint(g, '#f2ead6', 0.6); g.beginPath(); g.moveTo(-3.6, -4); g.quadraticCurveTo(-3.4, -8.6, 0, -8.8); g.quadraticCurveTo(3.4, -8.6, 3.6, -4); g.quadraticCurveTo(0, -3, -3.6, -4); g.closePath(); paint(g, cap, 0.7, -9, -3); g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(-1.4, -6.6, 0.8, 0, TAU); g.fill(); g.restore(); }

/** Гриб-великан: пухлая ножка с юбочкой, толстая шляпка-подушка с крупными пятнами, глянец; синий светится. */
/** v129: свечение синего гриба — рисуется отдельно, до мягкого контура (иначе контур давал серую «дымку» квадратом). */
export function shroomGlow(g, cw, cy) { const r = cw * 1.3, gl = g.createRadialGradient(0, cy - cw * 0.2, 4, 0, cy - cw * 0.2, r); gl.addColorStop(0, 'rgba(150,215,255,.38)'); gl.addColorStop(0.55, 'rgba(150,215,255,.12)'); gl.addColorStop(1, 'rgba(150,215,255,0)'); g.fillStyle = gl; g.beginPath(); g.arc(0, cy - cw * 0.2, r, 0, TAU); g.fill(); }
export function giantShroom(g, h = 90, kind = 0, t = 0, noGlow = false) {
  const caps = [['#c8402e', '#fff4e0'], ['#a07a52', '#f2e2c4'], ['#4a78c0', '#d8ecff']], [capC, spot] = caps[kind % 3], cw = h * 0.44, sw = h * 0.12, cy = -h * 0.78;
  shadow(g, cw * 0.9, cw * 0.26);
  g.beginPath(); g.moveTo(-sw * 1.25, 0); g.bezierCurveTo(-sw * 1.35, -h * 0.25, -sw * 0.8, -h * 0.55, -sw * 0.85, cy); g.lineTo(sw * 0.85, cy); g.bezierCurveTo(sw * 0.8, -h * 0.55, sw * 1.35, -h * 0.25, sw * 1.25, 0); g.quadraticCurveTo(0, sw * 0.5, -sw * 1.25, 0); g.closePath();
  const sg = g.createLinearGradient(-sw, 0, sw, 0); sg.addColorStop(0, '#fffaf0'); sg.addColorStop(0.6, '#efe4cc'); sg.addColorStop(1, '#c8b494'); g.fillStyle = sg; g.fill(); g.strokeStyle = ink('#efe4cc'); g.lineWidth = 1.5; g.stroke();
  g.beginPath(); g.moveTo(-sw * 1.7, -h * 0.5); g.quadraticCurveTo(0, -h * 0.44, sw * 1.7, -h * 0.5); g.quadraticCurveTo(sw * 1.4, -h * 0.58, 0, -h * 0.58); g.quadraticCurveTo(-sw * 1.4, -h * 0.58, -sw * 1.7, -h * 0.5); g.closePath(); paint(g, '#f4ead4', 1.2);
  g.beginPath(); g.ellipse(0, cy, cw * 0.86, cw * 0.16, 0, 0, TAU); paint(g, '#e2d0aa', 1.1); g.strokeStyle = 'rgba(140,100,60,.45)'; g.lineWidth = 0.8; for (let i = -6; i <= 6; i++) { g.beginPath(); g.moveTo(i * cw / 8, cy - cw * 0.1); g.lineTo(i * cw / 10, cy + cw * 0.1); g.stroke(); }
  const cap = () => { g.beginPath(); g.moveTo(-cw, cy); g.bezierCurveTo(-cw * 1.04, cy - cw * 0.92, cw * 1.04, cy - cw * 0.92, cw, cy); g.quadraticCurveTo(cw * 0.6, cy + cw * 0.16, 0, cy + cw * 0.14); g.quadraticCurveTo(-cw * 0.6, cy + cw * 0.16, -cw, cy); g.closePath(); };
  if (kind % 3 === 2 && !noGlow) shroomGlow(g, cw, cy);
  cap(); paint(g, capC, 1.8, cy - cw * 0.7, cy + cw * 0.1, 0.22);
  g.save(); cap(); g.clip(); const r = rnd(kind * 7 + 3 + Math.round(h));
  for (let i = 0; i < 7; i++) { const x = (r() - 0.5) * cw * 1.6, y = cy - cw * (0.12 + r() * 0.5), s = cw * (0.08 + r() * 0.06); g.beginPath(); g.ellipse(x, y, s, s * 0.75, 0, 0, TAU); paint(g, spot, 0.9); }
  g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.ellipse(cw * 0.5, cy - cw * 0.1, cw * 0.6, cw * 0.5, 0, 0, TAU); g.fill(); g.restore();
  shine(g, -cw * 0.4, cy - cw * 0.48, cw * 0.28, cw * 0.1, 0.4, -0.45);
  for (const [x, s] of [[-sw * 2.2, 1.2], [sw * 2.4, 0.9]]) mini(g, x, 2, capC, s);
}
/** Поваленный ствол: толстое бревно с мхом шапкой, торец с кольцами, трутовики, сучок, грибочки. */
export function fallenLog(g, len = 90, seed = 2) {
  const r = rnd(seed), d = 16, x0 = -len / 2, x1 = len / 2; shadow(g, len * 0.55, 6);
  rr(g, x0, -d, len, d, d / 2); paint(g, '#8a6040', 1.6, -d, 0, 0.2);
  g.save(); rr(g, x0, -d, len, d, d / 2); g.clip(); g.strokeStyle = 'rgba(60,34,14,.4)'; g.lineWidth = 1; for (let i = 0; i < 7; i++) { const y = -d + 3 + r() * (d - 6), x = x0 + 8 + r() * (len - 30); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 8, y - 1.4, x + 16 + r() * 10, y); g.stroke(); } g.restore();
  g.beginPath(); g.moveTo(x0 + 6, -d + 3); for (let x = x0 + 6; x <= x1 - 4; x += 6) g.quadraticCurveTo(x + 3, -d - 4 - (r() < 0.3 ? 2 : 0), x + 6, -d + 1); g.lineTo(x1 - 6, -d + 5); g.quadraticCurveTo(0, -d + 7, x0 + 6, -d + 5); g.closePath(); paint(g, '#6f9a44', 1.1);
  g.beginPath(); g.ellipse(x0 + 2, -d / 2, 5, d / 2, 0, 0, TAU); paint(g, '#e0b880', 1.3); g.strokeStyle = '#b08850'; g.lineWidth = 0.8; for (let k = 1; k < 3; k++) { g.beginPath(); g.ellipse(x0 + 2, -d / 2, 5 * k / 3, d / 2 * k / 3, 0, 0, TAU); g.stroke(); }
  for (let i = 0; i < 2; i++) { const x = x0 + 18 + r() * (len - 40), y = -d * 0.35; g.beginPath(); g.moveTo(x - 6, y); g.quadraticCurveTo(x, y - 5, x + 6, y); g.quadraticCurveTo(x, y + 2, x - 6, y); g.closePath(); paint(g, '#d8a860', 1); }
  stick(g, x1 - 20, -d + 2, x1 - 13, -d - 10, 3.4, '#6a4a2c');
  for (let i = 0; i < 3; i++) mini(g, x0 + 12 + r() * (len - 24), -d, '#e8a830', 0.9);
}
/** Светящиеся грибочки (живые). */
export function glowShrooms(g, n = 5, seed = 4, t = 0) {
  const r = rnd(seed);
  for (let i = 0; i < n; i++) { const x = (r() - 0.5) * 22, y = (r() - 0.5) * 6, s = 0.8 + r() * 0.7, pulse = 0.6 + 0.4 * Math.sin(t * 2 + i);
    const gr = g.createRadialGradient(x, y - 5 * s, 0.5, x, y - 5 * s, 10 * s); gr.addColorStop(0, `rgba(140,220,255,${0.5 * pulse})`); gr.addColorStop(1, 'rgba(140,220,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y - 5 * s, 10 * s, 0, TAU); g.fill();
    mini(g, x, y, '#7ec8ff', s * 0.9); }
}
/** Папоротник: пухлые листья-капли веером. */
export function fern(g, s = 1, seed = 1) {
  const r = rnd(seed); g.save(); g.scale(s, s); shadow(g, 10, 3);
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.36 + (r() - 0.5) * 0.1, L = 13 + r() * 5, ex = Math.cos(a) * L, ey = Math.sin(a) * L * 0.85;
    const col = i % 2 ? '#5f9a3e' : '#6eaa48';
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(ex * 0.5 - Math.sin(a) * 4, ey * 0.6, ex, ey); g.quadraticCurveTo(ex * 0.5 + Math.sin(a) * 4, ey * 0.6 + 2, 0, 0); g.closePath(); paint(g, col, 0.9);
    g.strokeStyle = sh(col, -0.35); g.lineWidth = 0.6; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(ex * 0.5, ey * 0.62, ex * 0.95, ey * 0.95); g.stroke(); }
  g.restore();
}
/** Камыш: пухлые стебли и бархатные початки. */
export function reeds(g, n = 9, seed = 8, t = 0) {
  const r = rnd(seed);
  for (let i = 0; i < n; i++) { const x = (r() - 0.5) * 22, h = 15 + r() * 12, sw = Math.sin(t * 1.4 + i) * 1.2, col = r() < 0.5 ? '#6a9a3a' : '#88a848';
    g.beginPath(); g.moveTo(x - 1.4, 0); g.quadraticCurveTo(x + sw * 0.3, -h * 0.5, x + sw, -h); g.quadraticCurveTo(x + sw * 0.3 + 1, -h * 0.5, x + 1.4, 0); g.closePath(); paint(g, col, 0.7);
    if (r() < 0.6) { rr(g, x + sw - 1.8, -h - 7, 3.6, 8, 1.8); paint(g, '#8a5430', 0.8); } }
}
/** Пруд: мягкий берег-кайма, вода градиентом, блики, кувшинки. */
/** v140: пруд с прозрачной водой. Видно дно — ил, камни, водоросли, кости; у берега отмель (светлая, песчаное дно), к середине — глубина
 *  (темнее, дно пропадает). Полоса отмели — SHALLOW шагов от края, как в world.js. Рыбы рисуются отдельно (живые, render.js). */
export const SHALLOW = 120;
export function pond(g, rx = 90, ry = 44, seed = 6, t = 0) {
  const r = rnd(seed), band = Math.min(0.5, SHALLOW / Math.min(rx, ry)), rim = 1 + 14 / Math.min(rx, ry);
  const edge = (k0 = 1) => { g.beginPath(); for (let i = 0; i <= 32; i++) { const a = i / 32 * TAU, k = k0 * (0.93 + Math.sin(a * 3 + seed) * 0.04 + Math.sin(a * 5) * 0.025); i ? g.lineTo(Math.cos(a) * rx * k, Math.sin(a) * ry * k) : g.moveTo(rx * k, 0); } g.closePath(); };
  const ell = f => { g.beginPath(); g.ellipse(0, 0, rx * f, ry * f, 0, 0, TAU); };
  const mix = (a, b, q) => a.map((v, i) => Math.round(v + (b[i] - v) * q));
  edge(rim); paint(g, '#7a6a44', 1.4);   // берег — кайма
  g.save(); edge(1); g.clip();
  // дно: песок у берега, ил к середине — кольцами
  const N = 30; for (let k = 0; k <= N; k++) { const f = 1 - k / N, q = Math.min(1, (1 - f) / Math.max(0.05, band)); const c0 = mix([128, 124, 84], [70, 76, 56], q); g.fillStyle = `rgb(${c0.join(',')})`; ell(f); g.fill(); }
  // камни, водоросли, кости на дне
  for (let i = 0; i < 12; i++) { const a = r() * TAU, d = 0.25 + r() * 0.7, x = Math.cos(a) * rx * d, y = Math.sin(a) * ry * d, s0 = 3 + r() * 5; g.fillStyle = r() < 0.5 ? '#8a8878' : '#6a6a5a'; g.beginPath(); g.ellipse(x, y, s0, s0 * 0.6, r(), 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(x - s0 * 0.3, y - s0 * 0.25, s0 * 0.4, s0 * 0.2, 0, 0, TAU); g.fill(); }
  for (let i = 0; i < 14; i++) { const a = r() * TAU, d = 0.2 + r() * 0.75, x = Math.cos(a) * rx * d, y = Math.sin(a) * ry * d; g.strokeStyle = r() < 0.5 ? '#3f6a34' : '#5a8a3a'; g.lineWidth = 1.6; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x + k * 3 - 3, y); g.quadraticCurveTo(x + k * 3 - 3 + (r() - 0.5) * 8, y - 8, x + k * 3 - 3 + (r() - 0.5) * 6, y - 14 - r() * 8); g.stroke(); } }
  if (r() < 0.5) { const x = (r() - 0.5) * rx, y = (r() - 0.5) * ry * 0.8; g.strokeStyle = '#d8d0b8'; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 8, y); g.lineTo(x + 8, y); g.stroke(); for (const dx of [-7, 7]) { g.beginPath(); g.moveTo(x + dx, y - 3); g.lineTo(x + dx, y + 3); g.stroke(); } }
  // вода кольцами: у берега тонкая и прозрачная, на глубине густая и тёмная
  g.fillStyle = 'rgba(60,130,130,.42)'; ell(1.05); g.fill();   // отмель — тонкая прозрачная вода
  const core = 1 - band; if (core > 0.02) { const soft = Math.min(core, 24 / Math.min(rx, ry)); for (let k = 0; k <= 8; k++) { g.fillStyle = 'rgba(22,58,70,.2)'; ell(core + soft * (1 - k / 8) * 0.5 - soft * 0.25); g.fill(); } g.fillStyle = 'rgba(16,44,54,.35)'; ell(core * 0.7); g.fill(); }   // глубина — густая тёмная вода, мягкий край
  // тень от берега и блики
  g.fillStyle = 'rgba(10,30,30,.2)'; g.beginPath(); g.ellipse(0, -ry * 0.8, rx, ry * 0.35, 0, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(220,245,245,.35)'; g.lineWidth = 1.2; for (let i = 0; i < 5; i++) { const x = (r() - 0.5) * rx * 1.3, y = (r() - 0.5) * ry * 1.1, s0 = 7 + Math.sin(t + i) * 2; g.beginPath(); g.ellipse(x, y, s0, s0 * 0.45, 0, 0, TAU); g.stroke(); }
  shine(g, -rx * 0.35, -ry * 0.2, rx * 0.3, 2.6, 0.35, 0); shine(g, rx * 0.2, ry * 0.3, rx * 0.16, 2, 0.3, 0); g.restore();
  g.strokeStyle = ink('#3e8088'); g.lineWidth = 1.6; edge(1); g.stroke();
  for (let i = 0; i < 6; i++) { const a = r() * TAU, d = 0.3 + r() * 0.5, x = Math.cos(a) * rx * d, y = Math.sin(a) * ry * d; g.beginPath(); g.moveTo(x, y); g.arc(x, y, 4.6, 0.35, TAU - 0.1); g.closePath(); paint(g, '#5a9a4a', 0.8); }   // кувшинки
}
/** v140: мель посреди воды — светлое песчаное дно под тонкой водой, камыш по краю. */
export function shoal(g, rx, ry, seed = 1) {
  const r = rnd(seed);
  g.save(); g.scale(1, ry / rx); const sg = g.createRadialGradient(0, 0, 1, 0, 0, rx); sg.addColorStop(0, 'rgba(190,175,120,.85)'); sg.addColorStop(0.7, 'rgba(160,160,120,.6)'); sg.addColorStop(1, 'rgba(90,150,150,0)'); g.fillStyle = sg; g.beginPath(); g.ellipse(0, 0, rx, rx, 0, 0, TAU); g.fill(); g.restore();
  for (let i = 0; i < 6; i++) { const a = r() * TAU, x = Math.cos(a) * rx * 0.8, y = Math.sin(a) * ry * 0.8; for (let k = 0; k < 3; k++) stick(g, x + k * 3, y, x + k * 3 + (r() - 0.5) * 3, y - 10 - r() * 6, 1.3, '#8a9a4a'); }
  for (let i = 0; i < 4; i++) { const x = (r() - 0.5) * rx * 1.2, y = (r() - 0.5) * ry * 1.2; g.fillStyle = '#8a8878'; g.beginPath(); g.ellipse(x, y, 4, 2.4, 0, 0, TAU); g.fill(); }
}
/** Хижина квакунов: купол из камыша рядами-подушками, обвязки, вход, шест с рыбой, ракушки. */
export function reedHut(g, seed = 1) {
  const r = rnd(seed), w = 40, h = 36; shadow(g, w * 0.75, 8);
  const dome = () => { g.beginPath(); g.moveTo(-w / 2, 0); g.bezierCurveTo(-w / 2 - 2, -h * 0.95, w / 2 + 2, -h * 0.95, w / 2, 0); g.quadraticCurveTo(0, 3, -w / 2, 0); g.closePath(); };
  dome(); paint(g, '#c8ac64', 1.6, -h, 0, 0.2);
  g.save(); dome(); g.clip(); for (let y = 0, k = 0; y > -h; y -= 7, k++) { g.beginPath(); g.moveTo(-w, y); for (let x = -w; x < w; x += 6) g.quadraticCurveTo(x + 3, y + 3.6, x + 6, y); g.strokeStyle = sh('#c8ac64', -0.3); g.lineWidth = 1; g.stroke(); }
  for (const y of [-8, -18]) { g.beginPath(); g.moveTo(-w, y); g.quadraticCurveTo(0, y + 3, w, y); g.strokeStyle = ink('#7a5a30'); g.lineWidth = 2.6; g.stroke(); g.strokeStyle = '#8a6a3a'; g.lineWidth = 1.4; g.stroke(); }
  g.fillStyle = 'rgba(30,15,0,.18)'; g.beginPath(); g.ellipse(w * 0.35, -h * 0.3, w * 0.35, h * 0.55, 0, 0, TAU); g.fill(); g.restore();
  shine(g, -w * 0.2, -h * 0.55, 5, 8, 0.3, -0.4);
  g.beginPath(); g.moveTo(-7, 0); g.bezierCurveTo(-7, -16, 7, -16, 7, 0); g.closePath(); g.fillStyle = '#1e140a'; g.fill(); g.strokeStyle = ink('#c8ac64'); g.lineWidth = 1.2; g.stroke();
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.3; stick(g, 0, -h * 0.7, Math.cos(a) * 6, -h * 0.7 + Math.sin(a) * 10, 1.4, '#a8904e'); }
  stick(g, w / 2 + 6, 0, w / 2 + 6, -28, 2.4, '#8a6a42');
  for (let i = 0; i < 2; i++) { const y = -24 + i * 8; g.beginPath(); g.moveTo(w / 2 + 6, y); g.quadraticCurveTo(w / 2 + 10, y + 3, w / 2 + 7, y + 8); g.quadraticCurveTo(w / 2 + 3, y + 4, w / 2 + 6, y); g.closePath(); paint(g, '#a8b4c0', 0.8); }
  for (let i = 0; i < 4; i++) { const x = -w / 2 + 4 + r() * (w - 8); g.beginPath(); g.moveTo(x - 2, 1); g.quadraticCurveTo(x, -2, x + 2, 1); g.closePath(); paint(g, '#f4e6d4', 0.6); }
}
/** Грибной круг: тёмная трава и кольцо грибочков. */
export function shroomRing(g, R = 46, seed = 3) {
  const r = rnd(seed); g.fillStyle = 'rgba(40,70,20,.3)'; g.beginPath(); g.ellipse(0, 0, R, R * 0.5, 0, 0, TAU); g.fill();
  const items = []; for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + (r() - 0.5) * 0.1; items.push([Math.cos(a) * R, Math.sin(a) * R * 0.5, r()]); }
  items.sort((a, b) => a[1] - b[1]); for (const [x, y, q] of items) mini(g, x, y, q < 0.5 ? '#c8402e' : '#9a6aaa', 1.4 + q * 0.6);
}
/** Паутина: толстые светлые нити между ветками, кокон. */
export function web(g, w = 60, h = 50, seed = 2) {
  const cx = 0, cy = -h * 0.55, anchors = [[-w / 2, -h], [w / 2, -h * 0.95], [w / 2 + 2, -h * 0.3], [w / 3, 0], [-w / 3, 0], [-w / 2 - 2, -h * 0.35]];
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.1; g.lineCap = 'round';
  for (const [x, y] of anchors) { g.beginPath(); g.moveTo(cx, cy); g.lineTo(x, y); g.stroke(); }
  for (let k = 1; k <= 5; k++) { g.beginPath(); anchors.forEach(([x, y], i) => { const px = cx + (x - cx) * k / 6, py = cy + (y - cy) * k / 6; if (!i) g.moveTo(px, py); else { const [qx, qy] = anchors[i - 1]; g.quadraticCurveTo(cx + ((x + qx) / 2 - cx) * k / 6.6, cy + ((y + qy) / 2 - cy) * k / 6.6, px, py); } }); const [x, y] = anchors[0], [qx, qy] = anchors[anchors.length - 1]; g.quadraticCurveTo(cx + ((x + qx) / 2 - cx) * k / 6.6, cy + ((y + qy) / 2 - cy) * k / 6.6, cx + (x - cx) * k / 6, cy + (y - cy) * k / 6); g.stroke(); }
  g.save(); g.translate(w * 0.2, -h * 0.4); g.beginPath(); g.ellipse(0, 0, 3.6, 5.4, 0.3, 0, TAU); paint(g, '#f2eee4', 0.9); g.restore();
}
/** Логово Полоза: пухлые камни с мхом, кости, сброшенная кожа. */
export function snakeLair(g, seed = 4) {
  const r = rnd(seed); shadow(g, 48, 12);
  const rocks = []; for (let i = 0; i < 6; i++) rocks.push([(r() - 0.5) * 70, -2 + (r() - 0.5) * 14, 10 + r() * 10]); rocks.sort((a, b) => a[1] - b[1]);
  for (const [x, y, s] of rocks) { g.beginPath(); g.moveTo(x - s, y); g.bezierCurveTo(x - s, y - s * 0.9, x - s * 0.2, y - s * 1.05, x + s * 0.2, y - s); g.bezierCurveTo(x + s * 0.8, y - s * 0.9, x + s, y - s * 0.4, x + s, y); g.quadraticCurveTo(x, y + s * 0.15, x - s, y); g.closePath(); paint(g, '#8a867c', 1.4, y - s, y, 0.2); shine(g, x - s * 0.35, y - s * 0.7, s * 0.25, s * 0.1, 0.35); g.beginPath(); g.ellipse(x - s * 0.1, y - s * 0.9, s * 0.45, s * 0.16, 0, 0, TAU); paint(g, '#6f9a44', 0.8); }
  for (let i = 0; i < 3; i++) { const x = (r() - 0.5) * 60, y = 8 + r() * 5; g.save(); g.translate(x, y); g.rotate(r() * 3); rr(g, -4, -1, 8, 2, 1); paint(g, '#f0e8d4', 0.6); for (const sx of [-4, 4]) { g.beginPath(); g.arc(sx, 0, 1.6, 0, TAU); paint(g, '#f0e8d4', 0.6); } g.restore(); }
  g.beginPath(); g.moveTo(-32, 10); g.bezierCurveTo(-16, 3, -10, 17, 6, 10); g.bezierCurveTo(16, 5, 22, 15, 32, 11); g.lineCap = 'round'; g.strokeStyle = ink('#e8dcb0'); g.lineWidth = 5.4; g.stroke(); g.strokeStyle = '#e8dcb0'; g.lineWidth = 3.6; g.stroke(); g.strokeStyle = 'rgba(160,140,90,.6)'; g.lineWidth = 0.8; g.setLineDash([1.5, 1.5]); g.stroke(); g.setLineDash([]);
}

/** v136: островок суши посреди топи — кочка с мшистой каймой и камышом по краю. (0,0) — середина. */
export function island(g, rx, ry, seed = 1) {
  const r = rnd(seed);
  const edge = (k0 = 1) => { g.beginPath(); for (let i = 0; i <= 28; i++) { const a = i / 28 * TAU, k = k0 * (0.94 + Math.sin(a * 4 + seed) * 0.05 + Math.sin(a * 7) * 0.02); i ? g.lineTo(Math.cos(a) * rx * k, Math.sin(a) * ry * k) : g.moveTo(rx * k, 0); } g.closePath(); };
  edge(1.08); g.fillStyle = '#4e5a3c'; g.fill();
  edge(1); const gr = g.createLinearGradient(0, -ry, 0, ry); gr.addColorStop(0, '#6a7c4c'); gr.addColorStop(1, '#55683e'); g.fillStyle = gr; g.fill(); g.strokeStyle = ink('#55683e'); g.lineWidth = 1.6; g.stroke();
  for (let i = 0; i < 8; i++) { const a = r() * TAU, d = 0.3 + r() * 0.5; g.fillStyle = `rgba(120,150,80,${0.25 + r() * 0.2})`; g.beginPath(); g.ellipse(Math.cos(a) * rx * d, Math.sin(a) * ry * d, 10 + r() * 14, 5 + r() * 6, 0, 0, TAU); g.fill(); }
  for (let i = 0; i < 10; i++) { const a = r() * TAU, x = Math.cos(a) * rx * 0.95, y = Math.sin(a) * ry * 0.95; for (let j = 0; j < 3; j++) stick(g, x + j * 3 - 3, y, x + j * 3 - 3 + (r() - 0.5) * 4, y - 12 - r() * 8, 1.4, '#8a9a4a'); }
}
/** v136: гать — настил из брёвен поперёк тропы через топь, по двум столбикам на концах. Рисуется от (ax,ay) до (bx,by), ширина w. */
export function gat(g, ax, ay, bx, by, w, seed = 1) {
  const r = rnd(seed), L = Math.hypot(bx - ax, by - ay), a = Math.atan2(by - ay, bx - ax);
  g.save(); g.translate(ax, ay); g.rotate(a);
  g.fillStyle = 'rgba(20,30,20,.25)'; g.fillRect(-6, -w / 2 + 4, L + 12, w);   // тень на воде
  g.strokeStyle = ink('#6a4a28'); g.lineWidth = 4; for (const yy of [-w / 2 + 8, w / 2 - 8]) { g.beginPath(); g.moveTo(-4, yy); g.lineTo(L + 4, yy); g.stroke(); }   // лаги
  for (let x = 0; x < L; x += 11) { const c = ['#8a6238', '#7a5630', '#946c3e'][Math.floor(r() * 3)], dy = (r() - 0.5) * 2; rr(g, x, -w / 2 + dy, 9, w - dy, 3.5); g.fillStyle = c; g.fill(); g.strokeStyle = ink(c); g.lineWidth = 1.2; g.stroke(); g.fillStyle = 'rgba(255,240,200,.18)'; g.fillRect(x + 1.5, -w / 2 + dy + 1, 2, w - 2); }
  g.restore();
}
