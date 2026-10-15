// v107 (эскиз): звери в мультяшном стиле (STYLE.md) — лиса, волк, кабан. Те же размеры и позы, что в beasts.js
// (длина, высота в холке, кадры шага 8, удара 6, падения 4), но пухлые формы: тело-фасоль, крупная голова,
// толстые лапы капсулами, шерсть крупными «фестонами», обводка в тон, глянец, суровые глаза под бровью.
import { beast as beastOld } from '../../../src/art/beasts.js';
const TAU = Math.PI * 2;
const sh = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join(''); };
const ink = col => sh(col, -0.62);
let c, SHADOW = true;
function paint(col, lw = 0.9, y0, y1, k = 0.18, line) { if (y0 != null) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, sh(col, k)); g.addColorStop(1, sh(col, -k)); c.fillStyle = g; } else c.fillStyle = col; c.fill(); if (lw) { c.strokeStyle = line || ink(col); c.lineWidth = lw; c.lineJoin = 'round'; c.stroke(); } }
const shine = (x, y, rx, ry, a = 0.4, rot = -0.4) => { c.fillStyle = `rgba(255,255,255,${a})`; c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU); c.fill(); };
/** Толстая лапа-капсула от (x1,y1) до (x2,y2): ширина w1 → w2, заливка градиентом, обводка в тон. */
function capsule(x1, y1, x2, y2, w1, w2, col, lw = 0.8) {
  const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a), ny = Math.cos(a);
  c.beginPath(); c.moveTo(x1 + nx * w1 / 2, y1 + ny * w1 / 2); c.lineTo(x2 + nx * w2 / 2, y2 + ny * w2 / 2); c.arc(x2, y2, w2 / 2, a + Math.PI / 2, a - Math.PI / 2, true); c.lineTo(x1 - nx * w1 / 2, y1 - ny * w1 / 2); c.arc(x1, y1, w1 / 2, a - Math.PI / 2, a + Math.PI / 2, true); c.closePath();
  const g = c.createLinearGradient(x1 - nx * w1, y1 - ny * w1, x1 + nx * w1, y1 + ny * w1); g.addColorStop(0, sh(col, 0.14)); g.addColorStop(1, sh(col, -0.16)); c.fillStyle = g; c.fill(); c.strokeStyle = ink(col); c.lineWidth = lw; c.stroke();
}
function shadow(rx, ry = rx * 0.3) { if (!SHADOW) return; c.fillStyle = 'rgba(0,0,0,.07)'; c.beginPath(); c.ellipse(0, 0.6, rx, ry, 0, 0, TAU); c.fill(); }
/** Суровый глаз: белок, крупная тёмная радужка, блик, тяжёлое веко-бровь. dir — куда смотрит. */
function eye(x, y, r, iris, dir = 1, brow = 0.35) {
  c.beginPath(); c.ellipse(x, y, r, r * 0.86, 0, 0, TAU); paint('#fbf6ea', 0.5, null, null, 0, '#3a2414');
  c.beginPath(); c.arc(x + dir * r * 0.22, y + r * 0.08, r * 0.62, 0, TAU); c.fillStyle = iris; c.fill();
  c.beginPath(); c.arc(x + dir * r * 0.28, y + r * 0.1, r * 0.32, 0, TAU); c.fillStyle = '#140c06'; c.fill();
  c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); c.arc(x - dir * r * 0.05, y - r * 0.28, r * 0.24, 0, TAU); c.fill();
  // веко сверху — взгляд исподлобья
  c.beginPath(); c.moveTo(x - r * 1.15, y - r * (0.2 + (dir > 0 ? brow : -brow * 0.2))); c.quadraticCurveTo(x, y - r * 1.25, x + r * 1.15, y - r * (0.2 + (dir > 0 ? -brow * 0.2 : brow))); c.lineTo(x + r * 1.15, y - r * 1.3); c.lineTo(x - r * 1.15, y - r * 1.3); c.closePath(); c.fillStyle = CUR.body; c.fill();
  c.beginPath(); c.moveTo(x - r * 1.15, y - r * (0.2 + (dir > 0 ? brow : -brow * 0.2))); c.quadraticCurveTo(x, y - r * 1.25, x + r * 1.15, y - r * (0.2 + (dir > 0 ? -brow * 0.2 : brow))); c.strokeStyle = ink(CUR.body); c.lineWidth = r * 0.42; c.lineCap = 'round'; c.stroke();
}
/** Шерсть «фестонами» по дуге: n полукругов вдоль линии от (x1,y1) до (x2,y2), выпуклостью наружу (sgn). */
function scallops(x1, y1, x2, y2, n, rad, col, sgn = 1) {
  const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a) * sgn, ny = Math.cos(a) * sgn;
  c.beginPath(); c.moveTo(x1, y1); for (let i = 0; i < n; i++) { const q0 = i / n, q1 = (i + 1) / n, mx = x1 + (x2 - x1) * (q0 + q1) / 2, my = y1 + (y2 - y1) * (q0 + q1) / 2; c.quadraticCurveTo(mx + nx * rad * 2, my + ny * rad * 2, x1 + (x2 - x1) * q1, y1 + (y2 - y1) * q1); } c.closePath(); paint(col, 0.7);
}

// ======================================================== данные
export const TQUAD = {
  fox:  { len: 28, h: 17, bh: 8, legW: 3.2, head: 'canine', hr: 5.6, snout: 1.15, ears: 1.25, tail: 'brush', body: '#e0762e', dark: '#9a4418', light: '#fbefdc', socks: '#3a2414', eye: '#e8a030', nose: '#2a1a12' },
  wolf: { len: 38, h: 23, bh: 10.5, legW: 4.2, head: 'canine', hr: 6.8, snout: 1.05, ears: 1.05, tail: 'bushy', mane: true, body: '#8e98a6', dark: '#525c6a', light: '#eef0f2', eye: '#e8c040', nose: '#1e1a1c' },
  boar: { len: 40, h: 25, bh: 15, legW: 5, head: 'boar', hr: 8.6, tail: 'curl', ridge: true, hoof: true, body: '#6e4e38', dark: '#3e2a1e', light: '#a88464', eye: '#3a2010', nose: '#e8a090' },
};
let CUR = TQUAD.fox;

// ======================================================== вид сбоку (смотрит вправо)
function side(S, p, W, bite, t) {
  const L = S.len, H = S.h, B = S.bh, bob = W ? -Math.abs(Math.sin(p * TAU)) * 1.1 : Math.sin(t * 2) * 0.25, top = -H + bob, mid = top + B * 0.5;
  c.translate(bite * 3.5, 0); shadow(L * 0.55);
  const farC = sh(S.body, -0.3), legLen = H - B * 0.45;
  const leg = (x, ph, col, front, near) => {
    const sw = W ? Math.sin(ph * TAU) * 0.48 : 0, lift = W ? Math.max(0, Math.cos(ph * TAU)) * 2.4 : 0;
    const y0 = mid + B * 0.1, kx = x + Math.sin(sw) * legLen * 0.5 + (front ? 0 : -1.2), ky = y0 + legLen * 0.52 - lift * 0.4, fx = x + Math.sin(sw) * legLen * 0.9 + (front ? 0.6 : 0.2), fy = -0.4 - lift;
    capsule(x, y0, kx, ky, S.legW * 2, S.legW * 1.5, col); capsule(kx, ky, fx, fy - S.legW * 0.3, S.legW * 1.45, S.legW * 1.15, col);
    const pc = near && S.socks ? S.socks : sh(col, -0.08);
    if (S.hoof) { c.beginPath(); c.roundRect(fx - S.legW * 0.7, fy - S.legW * 0.9, S.legW * 1.5, S.legW * 1.05, [S.legW * 0.5, S.legW * 0.5, 1, 1]); paint('#2a1c14', 0.7); c.strokeStyle = '#5a4434'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(fx + S.legW * 0.05, fy - S.legW * 0.85); c.lineTo(fx + S.legW * 0.05, fy); c.stroke(); }
    else { c.beginPath(); c.ellipse(fx + S.legW * 0.45, fy - S.legW * 0.35, S.legW * 0.95, S.legW * 0.62, 0, 0, TAU); paint(pc, 0.7, fy - S.legW, fy, 0.14); }
  };
  const xF = L * 0.27, xB = -L * 0.28;
  tailSide(S, L, top, B, p, W, t);
  leg(xF - 1.6, p + 0.5, farC, true, false); leg(xB - 1.6, p, farC, false, false);
  // туловище-фасоль: грудь выше и шире, круп круглый
  const hump = S.ridge ? 0.22 : 0.06;
  const body = () => { c.beginPath(); c.moveTo(L * 0.42, top + B * 0.2);
    c.bezierCurveTo(L * 0.3, top - B * hump - B * 0.08, -L * 0.1, top - B * hump * 0.6, -L * 0.36, top + B * 0.02);
    c.bezierCurveTo(-L * 0.58, top + B * 0.12, -L * 0.58, top + B * 0.92, -L * 0.36, top + B * 0.95);
    c.bezierCurveTo(-L * 0.12, top + B * 1.04, L * 0.16, top + B * 1.06, L * 0.34, top + B * 0.92);
    c.bezierCurveTo(L * 0.5, top + B * 0.8, L * 0.52, top + B * 0.36, L * 0.42, top + B * 0.2); c.closePath(); };
  body(); paint(S.body, 0.95, top - B * 0.1, top + B * 1.15, 0.2);
  c.save(); body(); c.clip();
  c.beginPath(); c.ellipse(L * 0.06, top + B * 1.15, L * 0.38, B * 0.42, 0, 0, TAU); c.fillStyle = S.light; c.fill();
  c.fillStyle = 'rgba(30,14,4,.16)'; c.beginPath(); c.ellipse(L * 0.1, top + B * 1.25, L * 0.6, B * 0.4, 0, 0, TAU); c.fill();
  // мышцы плеча и бедра — мягкие дуги
  c.strokeStyle = sh(S.body, -0.3); c.lineWidth = 0.7; c.beginPath(); c.ellipse(-L * 0.3, top + B * 0.55, L * 0.14, B * 0.4, 0.2, -1.3, 1.5); c.stroke(); c.beginPath(); c.ellipse(L * 0.26, top + B * 0.55, L * 0.11, B * 0.36, -0.2, 1.4, 4.2); c.stroke();
  c.restore();
  shine(-L * 0.1, top + B * 0.18, L * 0.18, B * 0.1, 0.32, -0.08);
  if (S.ridge) bristles(L, top, B, hump);
  leg(xB + 0.8, p + 0.5, S.body, false, true); leg(xF + 0.8, p, S.body, true, true);
  if (S.mane) { scallops(L * 0.12, top + B * 0.05, L * 0.36, top + B * 0.95, 4, B * 0.12, sh(S.body, 0.1), -1); }
  if (S.head === 'boar') headBoarSide(S, L, top, B, bite); else headCanineSide(S, L, top, B, bite, t);
}
function bristles(L, top, B, hump) {
  const n = 9; c.beginPath(); c.moveTo(L * 0.3, top + B * 0.05);
  for (let i = 0; i <= n; i++) { const q = i / n, x = L * 0.3 - q * L * 0.62, y = top - B * hump * (1 - Math.abs(q - 0.35) * 1.2) * 0.9 + B * 0.04, hgt = (3.4 + (i % 2) * 1.6) * (1 - q * 0.45); c.quadraticCurveTo(x + 1.4, y - hgt * 1.2, x - 1.6, y - hgt * 0.2); }
  c.lineTo(-L * 0.32, top + B * 0.2); c.quadraticCurveTo(0, top + B * 0.05, L * 0.3, top + B * 0.05); c.closePath(); paint(CUR.dark, 0.8, top - B * 0.4, top + B * 0.2, 0.15);
}
function tailSide(S, L, top, B, p, W, t) {
  const sw = Math.sin(t * 3 + p * TAU) * (W ? 1.6 : 0.9), x0 = -L * 0.48, y0 = top + B * 0.25;
  if (S.tail === 'brush') { // пушистый хвост лисы с белым кончиком — крупная капля
    const fn = () => { c.beginPath(); c.moveTo(x0 + 2, y0 - 1); c.bezierCurveTo(x0 - 6, y0 - 7 + sw, x0 - 17, y0 - 2 + sw, x0 - 17, y0 + 7 + sw); c.bezierCurveTo(x0 - 16, y0 + 12 + sw, x0 - 6, y0 + 10, x0 + 1, y0 + 5); c.closePath(); };
    fn(); paint(S.body, 0.9, y0 - 7, y0 + 12, 0.2);
    c.save(); fn(); c.clip(); c.beginPath(); c.ellipse(x0 - 16, y0 + 8 + sw, 6, 5.4, -0.4, 0, TAU); c.fillStyle = '#fbf6ea'; c.fill(); c.strokeStyle = sh(S.body, -0.25); c.lineWidth = 0.6; c.beginPath(); c.moveTo(x0 - 3, y0 + 1); c.quadraticCurveTo(x0 - 9, y0 - 1 + sw, x0 - 13, y0 + 4 + sw); c.stroke(); c.restore();
    fn(); c.strokeStyle = ink(S.body); c.lineWidth = 0.9; c.stroke(); shine(x0 - 8, y0 - 3 + sw, 3.4, 1.4, 0.3, -0.3); return;
  }
  if (S.tail === 'bushy') { // волчий: густой, книзу, тёмный кончик
    const fn = () => { c.beginPath(); c.moveTo(x0 + 2, y0 - 1.5); c.bezierCurveTo(x0 - 7, y0 + sw, x0 - 13, y0 + 8 + sw, x0 - 12, y0 + 16 + sw); c.quadraticCurveTo(x0 - 7, y0 + 18 + sw, x0 - 5, y0 + 13); c.quadraticCurveTo(x0 - 3, y0 + 6, x0 + 1, y0 + 4); c.closePath(); };
    fn(); paint(S.body, 0.9, y0, y0 + 17, 0.18); c.save(); fn(); c.clip(); c.beginPath(); c.ellipse(x0 - 10, y0 + 16 + sw, 5, 4, 0, 0, TAU); c.fillStyle = S.dark; c.fill(); c.restore(); fn(); c.strokeStyle = ink(S.body); c.lineWidth = 0.9; c.stroke(); return;
  }
  if (S.tail === 'curl') { c.beginPath(); c.moveTo(x0 + 2, y0 + 1); c.bezierCurveTo(x0 - 4, y0 - 2 + sw * 0.4, x0 - 6, y0 + 4, x0 - 2.6, y0 + 4); c.lineCap = 'round'; c.strokeStyle = ink(S.body); c.lineWidth = 2.6; c.stroke(); c.strokeStyle = S.body; c.lineWidth = 1.4; c.stroke(); c.beginPath(); c.ellipse(x0 - 2.4, y0 + 5.4, 1.6, 2.4, 0.3, 0, TAU); paint(S.dark, 0.6); }
}
function headCanineSide(S, L, top, B, bite, t) {
  const r = S.hr, hx = L * 0.46, hy = top - B * 0.1 + bite * 2.4, sn = S.snout;
  // шея — толстая, с фестонами на груди
  c.beginPath(); c.moveTo(L * 0.16, top + B * 0.15); c.quadraticCurveTo(hx - r * 0.8, hy - r * 0.6, hx - r * 0.2, hy - r * 0.2); c.lineTo(hx + r * 0.4, hy + r * 0.8); c.quadraticCurveTo(L * 0.46, top + B * 0.9, L * 0.34, top + B * 0.95); c.closePath(); paint(S.body, 0.9, top, top + B, 0.16);
  scallops(L * 0.36, top + B * 0.9, hx + r * 0.25, hy + r * 0.7, 3, r * 0.16, S.light, -1);
  // дальнее ухо
  const ear = (dx, col, k = 1) => { const eh = r * 1.1 * S.ears * k; c.beginPath(); c.moveTo(hx + dx - r * 0.5, hy - r * 0.55); c.quadraticCurveTo(hx + dx - r * 0.55, hy - r * 0.6 - eh * 0.7, hx + dx - r * 0.15, hy - r * 0.6 - eh); c.quadraticCurveTo(hx + dx + r * 0.25, hy - r * 0.6 - eh * 0.6, hx + dx + r * 0.42, hy - r * 0.55); c.closePath(); paint(col, 0.8, hy - r - eh, hy, 0.15); };
  ear(r * 0.32, sh(S.body, -0.3), 0.92);
  // нижняя челюсть
  const jaw = bite * 0.5; c.save(); c.translate(hx + r * 0.5, hy + r * 0.45); c.rotate(jaw);
  c.beginPath(); c.moveTo(-r * 0.2, 0); c.lineTo(r * 1.25 * sn, r * 0.08); c.quadraticCurveTo(r * 1.35 * sn, r * 0.42, r * 1.05 * sn, r * 0.48); c.lineTo(-r * 0.1, r * 0.5); c.closePath(); paint(S.light, 0.8);
  if (bite > 0.2) { c.fillStyle = '#fffaf0'; for (let i = 0; i < 2; i++) { c.beginPath(); c.moveTo(r * (0.55 + i * 0.4) * sn, 0); c.lineTo(r * (0.62 + i * 0.4) * sn, -r * 0.24); c.lineTo(r * (0.7 + i * 0.4) * sn, 0); c.fill(); } }
  c.restore();
  // голова — шар + морда-капсула
  const head = () => { c.beginPath(); c.arc(hx, hy, r, Math.PI * 0.62, Math.PI * 2.1); c.quadraticCurveTo(hx + r * 1.1, hy - r * 0.3, hx + r * 1.6 * sn, hy - r * 0.05); c.quadraticCurveTo(hx + r * 2.05 * sn, hy + r * 0.12, hx + r * 1.95 * sn, hy + r * 0.42); c.quadraticCurveTo(hx + r * 1.7 * sn, hy + r * 0.62, hx + r * 0.9, hy + r * 0.62); c.quadraticCurveTo(hx + r * 0.1, hy + r * 1.05, hx - r * 0.37, hy + r * 0.78); c.closePath(); };
  head(); paint(S.body, 0.95, hy - r, hy + r, 0.2);
  c.save(); head(); c.clip(); c.beginPath(); c.ellipse(hx + r * 1.2 * sn, hy + r * 0.62, r * 0.95 * sn, r * 0.42, 0, 0, TAU); c.fillStyle = S.light; c.fill(); c.beginPath(); c.ellipse(hx - r * 0.2, hy + r * 0.62, r * 0.55, r * 0.38, 0, 0, TAU); c.fill(); c.restore();
  head(); c.strokeStyle = ink(S.body); c.lineWidth = 0.95; c.stroke();
  // щека пушком
  scallops(hx - r * 0.85, hy + r * 0.15, hx - r * 0.2, hy + r * 0.95, 2, r * 0.13, S.light, 1);
  shine(hx - r * 0.25, hy - r * 0.55, r * 0.38, r * 0.16, 0.38);
  // нос
  c.beginPath(); c.ellipse(hx + r * 1.93 * sn, hy + r * 0.1, r * 0.26, r * 0.22, 0, 0, TAU); paint(S.nose, 0.6); shine(hx + r * 1.87 * sn, hy + r * 0.03, r * 0.08, r * 0.05, 0.6, 0);
  // рот
  c.strokeStyle = ink(S.body); c.lineWidth = 0.55; c.beginPath(); c.moveTo(hx + r * 1.85 * sn, hy + r * 0.45); c.quadraticCurveTo(hx + r * 1.3, hy + r * 0.6, hx + r * 0.75, hy + r * 0.5); c.stroke();
  eye(hx + r * 0.42, hy - r * 0.12, r * 0.34, S.eye, 1, 0.45);
  ear(-r * 0.08, S.body);
  c.beginPath(); c.moveTo(hx - r * 0.42, hy - r * 0.62); c.quadraticCurveTo(hx - r * 0.42, hy - r * 1.35 * S.ears, hx - r * 0.2, hy - r * 1.5 * S.ears); c.quadraticCurveTo(hx + r * 0.05, hy - r * 1.15 * S.ears, hx + r * 0.2, hy - r * 0.62); c.closePath(); c.fillStyle = '#e8a8a0'; c.fill();
}
function headBoarSide(S, L, top, B, bite) {
  const r = S.hr, hx = L * 0.4, hy = top + B * 0.42 + bite * 2;
  const head = () => { c.beginPath(); c.moveTo(hx - r * 0.6, hy - r * 0.95); c.bezierCurveTo(hx + r * 0.6, hy - r * 1.05, hx + r * 1.3, hy - r * 0.4, hx + r * 1.75, hy + r * 0.05); c.quadraticCurveTo(hx + r * 1.95, hy + r * 0.35, hx + r * 1.8, hy + r * 0.72); c.bezierCurveTo(hx + r * 1.3, hy + r * 1.05, hx + r * 0.2, hy + r * 1.1, hx - r * 0.5, hy + r * 0.8); c.quadraticCurveTo(hx - r * 0.95, hy - r * 0.1, hx - r * 0.6, hy - r * 0.95); c.closePath(); };
  head(); paint(S.body, 0.95, hy - r, hy + r, 0.2);
  c.save(); head(); c.clip(); c.beginPath(); c.ellipse(hx + r * 0.7, hy + r * 1.0, r * 1.1, r * 0.4, 0, 0, TAU); c.fillStyle = sh(S.body, -0.2); c.fill(); c.restore();
  shine(hx + r * 0.1, hy - r * 0.6, r * 0.45, r * 0.16, 0.32, -0.2);
  // пятачок
  c.beginPath(); c.ellipse(hx + r * 1.82, hy + r * 0.38, r * 0.26, r * 0.44, 0, 0, TAU); paint(S.nose, 0.8); c.fillStyle = '#6a2a20'; c.beginPath(); c.ellipse(hx + r * 1.86, hy + r * 0.24, r * 0.07, r * 0.11, 0, 0, TAU); c.ellipse(hx + r * 1.86, hy + r * 0.52, r * 0.07, r * 0.11, 0, 0, TAU); c.fill();
  // клык — толстый, загнутый вверх
  const ty = hy + r * 0.78 - bite * r * 0.2; c.beginPath(); c.moveTo(hx + r * 1.0, ty); c.quadraticCurveTo(hx + r * 1.55, ty - r * 0.1, hx + r * 1.5, ty - r * 0.85); c.quadraticCurveTo(hx + r * 1.32, ty - r * 0.35, hx + r * 0.92, ty - r * 0.25); c.closePath(); paint('#fbf2dc', 0.8); shine(hx + r * 1.3, ty - r * 0.3, r * 0.06, r * 0.18, 0.7, 0.3);
  // ухо
  c.beginPath(); c.moveTo(hx - r * 0.5, hy - r * 0.8); c.quadraticCurveTo(hx - r * 0.65, hy - r * 1.7, hx - r * 0.1, hy - r * 1.75); c.quadraticCurveTo(hx + r * 0.15, hy - r * 1.3, hx + r * 0.05, hy - r * 0.85); c.closePath(); paint(S.dark, 0.8); c.beginPath(); c.moveTo(hx - r * 0.38, hy - r * 0.9); c.quadraticCurveTo(hx - r * 0.45, hy - r * 1.45, hx - r * 0.15, hy - r * 1.5); c.lineTo(hx - r * 0.08, hy - r * 0.95); c.closePath(); c.fillStyle = '#c88a7a'; c.fill();
  eye(hx + r * 0.5, hy - r * 0.32, r * 0.24, '#5a3018', 1, 0.6);
}

// ======================================================== спереди и сзади
function frontBack(S, p, W, bite, t, back) {
  const H = S.h, B = S.bh, w = B * (S.head === 'boar' ? 0.95 : 0.9), bob = W ? -Math.abs(Math.sin(p * TAU)) * 1.1 : Math.sin(t * 2) * 0.25, top = -H + bob;
  shadow(w * 1.35, w * 0.5);
  const leg = (x, ph, col, h0, wd, near) => { const lift = W ? Math.max(0, Math.sin(ph * TAU)) * 2.4 : 0; capsule(x, top + h0, x * 1.04, -lift - wd * 0.4, wd, wd * 0.8, col);
    if (S.hoof) { c.beginPath(); c.roundRect(x * 1.04 - wd * 0.48, -lift - wd * 0.6, wd * 0.96, wd * 0.62, [wd * 0.3, wd * 0.3, 1, 1]); paint('#2a1c14', 0.7); }
    else { c.beginPath(); c.ellipse(x * 1.04, -lift - wd * 0.2, wd * 0.62, wd * 0.4, 0, 0, TAU); paint(near && S.socks ? S.socks : sh(col, -0.08), 0.7); } };
  const farC = sh(S.body, -0.3);
  if (!back) {
    if (S.tail !== 'curl') { const sw = Math.sin(t * 3 + p * TAU) * 1.5; c.beginPath(); c.ellipse(w * 0.75 + sw * 0.3, top - B * 0.15, 3.4, 4.6, 0.5, 0, TAU); paint(S.tail === 'brush' ? S.body : sh(S.body, -0.1), 0.8); }
    c.beginPath(); c.ellipse(0, top + B * 0.25, w * 0.82, B * 0.52, 0, 0, TAU); paint(sh(S.body, -0.12), 0.9, top - B * 0.3, top + B * 0.8);
    if (S.ridge) { c.beginPath(); for (let i = 0; i <= 6; i++) { const x = -w * 0.38 + i * w * 0.127; c.lineTo(x, top - B * 0.22 - (i % 2) * 2.4); } c.lineTo(w * 0.4, top + B * 0.05); c.lineTo(-w * 0.4, top + B * 0.05); c.closePath(); paint(S.dark, 0.7); }
    leg(-w * 0.46, p + 0.5, farC, B * 0.5, S.legW * 1.4, false); leg(w * 0.46, p, farC, B * 0.5, S.legW * 1.4, false);
    const chest = () => { c.beginPath(); c.ellipse(0, top + B * 0.58, w * 0.74, B * 0.66, 0, 0, TAU); };
    chest(); paint(S.body, 0.95, top, top + B * 1.2, 0.18);
    c.save(); chest(); c.clip(); c.beginPath(); c.ellipse(0, top + B * 1.0, w * 0.4, B * 0.55, 0, 0, TAU); c.fillStyle = S.head === 'boar' ? sh(S.body, -0.15) : S.light; c.fill(); c.restore();
    if (S.head !== 'boar') scallops(-w * 0.36, top + B * 0.6, w * 0.36, top + B * 0.6, 4, B * 0.06, S.light, 1);
    leg(-w * 0.42, p, S.body, B * 0.85, S.legW * 1.75, true); leg(w * 0.42, p + 0.5, S.body, B * 0.85, S.legW * 1.75, true);
    S.head === 'boar' ? headBoarFront(S, w, top, B, bite) : headCanineFront(S, w, top, B, bite);
  } else {
    headBack(S, w, top, B);
    leg(-w * 0.4, p, farC, B * 0.6, S.legW * 1.5, false); leg(w * 0.4, p + 0.5, farC, B * 0.6, S.legW * 1.5, false);
    const rump = () => { c.beginPath(); c.ellipse(0, top + B * 0.52, w * 0.84, B * 0.72, 0, 0, TAU); };
    rump(); paint(S.body, 0.95, top - B * 0.2, top + B * 1.25, 0.2); shine(-w * 0.35, top + B * 0.05, w * 0.22, B * 0.1, 0.3, -0.3);
    if (S.ridge) { c.beginPath(); for (let i = 0; i <= 6; i++) { const x = -w * 0.36 + i * w * 0.12; c.lineTo(x, top - B * 0.2 - (i % 2) * 2.4); } c.lineTo(w * 0.36, top + B * 0.15); c.lineTo(-w * 0.36, top + B * 0.15); c.closePath(); paint(S.dark, 0.7); }
    c.strokeStyle = sh(S.body, -0.3); c.lineWidth = 0.7; for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(sx * w * 0.4, top + B * 0.7, w * 0.3, B * 0.42, 0, sx > 0 ? -1.4 : 1.7, sx > 0 ? 1.4 : 4.6); c.stroke(); }
    leg(-w * 0.48, p + 0.5, S.body, B * 1.0, S.legW * 1.9, true); leg(w * 0.48, p, S.body, B * 1.0, S.legW * 1.9, true);
    tailBack(S, w, top, B, p, W, t);
  }
}
function tailBack(S, w, top, B, p, W, t) {
  const sw = Math.sin(t * 3 + p * TAU) * 1.8;
  if (S.tail === 'brush') { const fn = () => { c.beginPath(); c.moveTo(-2.4, top + B * 0.15); c.bezierCurveTo(-7 + sw, top + B * 0.8, -4 + sw, top + B * 1.6, sw, top + B * 1.9); c.bezierCurveTo(4 + sw, top + B * 1.6, 7 + sw, top + B * 0.8, 2.4, top + B * 0.15); c.closePath(); }; fn(); paint(S.body, 0.9, top, top + B * 2, 0.2); c.save(); fn(); c.clip(); c.beginPath(); c.ellipse(sw, top + B * 1.8, 5, 4, 0, 0, TAU); c.fillStyle = '#fbf6ea'; c.fill(); c.restore(); fn(); c.strokeStyle = ink(S.body); c.lineWidth = 0.9; c.stroke(); return; }
  if (S.tail === 'bushy') { const fn = () => { c.beginPath(); c.moveTo(-2.4, top + B * 0.15); c.quadraticCurveTo(-6 + sw, top + B, sw, top + B * 1.6); c.quadraticCurveTo(6 + sw, top + B, 2.4, top + B * 0.15); c.closePath(); }; fn(); paint(S.body, 0.9, top, top + B * 1.6, 0.2); c.save(); fn(); c.clip(); c.beginPath(); c.ellipse(sw, top + B * 1.55, 4, 3.4, 0, 0, TAU); c.fillStyle = S.dark; c.fill(); c.restore(); return; }
  if (S.tail === 'curl') { c.beginPath(); c.arc(0, top + B * 0.2, 2.2, 0.2, 5.2); c.strokeStyle = ink(S.body); c.lineWidth = 2.4; c.stroke(); c.strokeStyle = S.body; c.lineWidth = 1.2; c.stroke(); }
}
function headCanineFront(S, w, top, B, bite) {
  const r = S.hr, hy = top - B * 0.1 + bite * 2;
  if (S.mane) { c.beginPath(); for (let i = 0; i <= 12; i++) { const a = Math.PI * (0.02 + i / 12 * 0.96), rad = r * (i % 2 ? 1.25 : 1.45); c.lineTo(Math.cos(a) * rad, hy + r * 0.35 + Math.sin(a) * rad * 0.8); } c.closePath(); paint(sh(S.body, 0.1), 0.8); }
  for (const sx of [-1, 1]) { const eh = r * 0.95 * S.ears; c.beginPath(); c.moveTo(sx * r * 0.3, hy - r * 0.7); c.quadraticCurveTo(sx * r * 0.55, hy - r * 0.7 - eh, sx * r * 0.85, hy - r * 0.8 - eh * 0.95); c.quadraticCurveTo(sx * r * 1.1, hy - r * 0.6 - eh * 0.4, sx * r * 0.95, hy - r * 0.35); c.closePath(); paint(S.body, 0.8, hy - r - eh, hy, 0.15); c.beginPath(); c.moveTo(sx * r * 0.45, hy - r * 0.68); c.quadraticCurveTo(sx * r * 0.62, hy - r * 0.6 - eh * 0.85, sx * r * 0.82, hy - r * 0.7 - eh * 0.8); c.quadraticCurveTo(sx * r * 0.92, hy - r * 0.5 - eh * 0.4, sx * r * 0.82, hy - r * 0.42); c.closePath(); c.fillStyle = '#e8a8a0'; c.fill(); }
  const head = () => { c.beginPath(); c.moveTo(-r, hy - r * 0.05); c.bezierCurveTo(-r * 1.05, hy - r * 1.15, r * 1.05, hy - r * 1.15, r, hy - r * 0.05); c.bezierCurveTo(r * 1.1, hy + r * 0.6, r * 0.5, hy + r * 1.0, 0, hy + r * 1.05); c.bezierCurveTo(-r * 0.5, hy + r * 1.0, -r * 1.1, hy + r * 0.6, -r, hy - r * 0.05); c.closePath(); };
  head(); paint(S.body, 0.95, hy - r, hy + r, 0.2);
  for (const sx of [-1, 1]) scallops(sx * r * 1.0, hy + r * 0.05, sx * r * 0.55, hy + r * 0.85, 2, r * 0.12, S.light, sx);
  c.beginPath(); c.ellipse(0, hy + r * 0.6 * S.snout, r * 0.52, r * 0.44 * S.snout, 0, 0, TAU); paint(S.light, 0.7);
  c.beginPath(); c.ellipse(0, hy + r * 0.38 * S.snout, r * 0.26, r * 0.2, 0, 0, TAU); paint(S.nose, 0.6); shine(-r * 0.06, hy + r * 0.32 * S.snout, r * 0.08, r * 0.05, 0.6, 0);
  if (bite > 0.2) { c.beginPath(); c.ellipse(0, hy + r * 0.82, r * 0.3, r * 0.2 * bite, 0, 0, TAU); paint('#8a2a24', 0.5); }
  else { c.strokeStyle = ink(S.light); c.lineWidth = 0.5; c.beginPath(); c.moveTo(0, hy + r * 0.56); c.lineTo(0, hy + r * 0.74); c.moveTo(-r * 0.2, hy + r * 0.8); c.quadraticCurveTo(0, hy + r * 0.72, r * 0.2, hy + r * 0.8); c.stroke(); }
  shine(-r * 0.4, hy - r * 0.55, r * 0.3, r * 0.13, 0.36);
  for (const sx of [-1, 1]) eye(sx * r * 0.42, hy - r * 0.12, r * 0.28, S.eye, -sx, 0.5);
}
function headBoarFront(S, w, top, B, bite) {
  const r = S.hr, hy = top + B * 0.35 + bite * 2;
  for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * r * 0.45, hy - r * 0.75); c.quadraticCurveTo(sx * r * 1.05, hy - r * 1.55, sx * r * 1.15, hy - r * 1.2); c.quadraticCurveTo(sx * r * 1.05, hy - r * 0.7, sx * r * 0.85, hy - r * 0.5); c.closePath(); paint(S.dark, 0.8); }
  const head = () => { c.beginPath(); c.ellipse(0, hy, r * 0.95, r, 0, 0, TAU); };
  head(); paint(S.body, 0.95, hy - r, hy + r, 0.2); shine(-r * 0.35, hy - r * 0.55, r * 0.3, r * 0.13, 0.32);
  c.beginPath(); c.ellipse(0, hy + r * 0.55, r * 0.48, r * 0.36, 0, 0, TAU); paint(S.nose, 0.8); c.fillStyle = '#6a2a20'; c.beginPath(); c.ellipse(-r * 0.16, hy + r * 0.55, r * 0.08, r * 0.12, 0, 0, TAU); c.ellipse(r * 0.16, hy + r * 0.55, r * 0.08, r * 0.12, 0, 0, TAU); c.fill();
  for (const sx of [-1, 1]) { const ty = hy + r * 0.85 - bite * r * 0.2; c.beginPath(); c.moveTo(sx * r * 0.4, ty); c.quadraticCurveTo(sx * r * 0.95, ty, sx * r * 0.9, ty - r * 0.8); c.quadraticCurveTo(sx * r * 0.75, ty - r * 0.3, sx * r * 0.36, ty - r * 0.25); c.closePath(); paint('#fbf2dc', 0.8); }
  for (const sx of [-1, 1]) eye(sx * r * 0.4, hy - r * 0.2, r * 0.2, '#5a3018', -sx, 0.6);
}
function headBack(S, w, top, B) {
  const r = S.hr, hy = top - B * 0.05 + (S.head === 'boar' ? B * 0.3 : 0);
  for (const sx of [-1, 1]) { const eh = S.head === 'boar' ? r * 0.8 : r * 0.95 * S.ears; c.beginPath(); c.moveTo(sx * r * 0.3, hy - r * 0.5); c.quadraticCurveTo(sx * r * 0.55, hy - r * 0.5 - eh, sx * r * 0.85, hy - r * 0.6 - eh * 0.95); c.quadraticCurveTo(sx * r * 1.1, hy - r * 0.4 - eh * 0.4, sx * r * 0.95, hy - r * 0.15); c.closePath(); paint(S.head === 'boar' ? S.dark : S.body, 0.8); }
  c.beginPath(); c.ellipse(0, hy, r * 0.95, r * 0.8, 0, Math.PI, 0); c.closePath(); paint(sh(S.body, 0.06), 0.9);
}

// ======================================================== общий вход: как beast() в beasts.js
export const TKINDS = Object.keys(TQUAD);
export function tbeast(ctx, kind, view, pose = {}) {
  const S = TQUAD[kind]; if (!S) return beastOld(ctx, kind, view, pose);
  c = ctx; CUR = S; const W = pose.walk >= 0, p = W ? pose.walk : 0, bite = pose.atk >= 0 ? Math.sin(Math.min(1, pose.atk) * Math.PI) : 0, hit = pose.hit || 0, dead = pose.dead || 0, t = pose.t || 0;
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round'; SHADOW = !(dead > 0);
  if (dead > 0) { const R = S.len * 0.5; c.fillStyle = 'rgba(0,0,0,.07)'; c.beginPath(); c.ellipse(0, 0.6, R, R * 0.3, 0, 0, TAU); c.fill(); const k = Math.min(1, dead * 1.6); c.translate(0, -12); c.rotate(k * Math.PI * (view === 'back' ? -1 : 1)); c.translate(0, 12 - 9 * k); }
  if (hit) c.translate(view === 'side' ? -hit * 3 : 0, view === 'front' ? -hit * 2 : view === 'back' ? hit * 2 : 0);
  view === 'side' ? side(S, p, W, bite, t) : frontBack(S, p, W, bite, t, view === 'back');
  c.restore();
}
