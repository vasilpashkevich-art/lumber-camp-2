// Приметы логов в мире: по ним место узнаётся без карты. Рисуются один раз готовыми картинками.
// Начало координат — точка на земле в середине приметы.
import { sprite } from './sprites.js';

const O = '#24180f';
function hp(g, fn, fill, lw = 1.3) { g.beginPath(); fn(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = O; g.lineWidth = lw; g.stroke(); } }
const shadow = (g, w, h = w * 0.22) => { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(4, 3, w, h, 0, 0, 7); g.fill(); };

// лисья нора: земляной холм под корнями, тёмный лаз, косточки
function den(g) {
  shadow(g, 62, 14);
  hp(g, () => { g.moveTo(-60, 0); g.quadraticCurveTo(-50, -38, -6, -44); g.quadraticCurveTo(44, -40, 60, 0); g.closePath(); }, '#7a5a38');
  g.fillStyle = 'rgba(255,255,255,.1)'; g.beginPath(); g.ellipse(-20, -30, 22, 8, -0.2, 0, 7); g.fill();
  hp(g, () => g.ellipse(4, -10, 18, 12, 0, Math.PI, 0), '#1a120a');
  g.fillStyle = '#1a120a'; g.fillRect(-14, -10, 36, 9);
  // корни
  g.strokeStyle = O; g.lineWidth = 4.4; g.lineCap = 'round';
  for (const p of [[-40, -30, -14, -26, 2, -22], [44, -28, 26, -24, 16, -20], [-6, -44, -2, -32, -10, -22]]) { g.beginPath(); g.moveTo(p[0], p[1]); g.quadraticCurveTo(p[2], p[3], p[4], p[5]); g.stroke(); }
  g.strokeStyle = '#6b4a2c'; g.lineWidth = 2.6;
  for (const p of [[-40, -30, -14, -26, 2, -22], [44, -28, 26, -24, 16, -20], [-6, -44, -2, -32, -10, -22]]) { g.beginPath(); g.moveTo(p[0], p[1]); g.quadraticCurveTo(p[2], p[3], p[4], p[5]); g.stroke(); }
  // косточки и рыжая шерсть
  bone(g, 34, 4, 0.4); bone(g, -38, 6, -0.6);
  g.fillStyle = '#d9783a'; for (const [x, y] of [[-24, -2], [22, -4], [12, 6]]) { g.beginPath(); g.ellipse(x, y, 3, 1.4, 0.5, 0, 7); g.fill(); }
}
function bone(g, x, y, a) { g.save(); g.translate(x, y); g.rotate(a); hp(g, () => { g.rect(-6, -1.4, 12, 2.8); }, '#e8e0cc', 0.8); for (const sx of [-6, 6]) hp(g, () => { g.arc(sx, -1.4, 1.9, 0, 7); g.moveTo(sx + 1.9, 1.4); g.arc(sx, 1.4, 1.9, 0, 7); }, '#e8e0cc', 0.8); g.restore(); }

// волчье логово: груда камней с пещеркой, кости, клок шерсти
function wolf(g) {
  shadow(g, 70, 16);
  const rock = (x, y, w, h, col) => hp(g, () => { g.moveTo(x - w, y); g.lineTo(x - w * 0.8, y - h * 0.7); g.lineTo(x - w * 0.2, y - h); g.lineTo(x + w * 0.6, y - h * 0.85); g.lineTo(x + w, y - h * 0.2); g.lineTo(x + w * 0.9, y); g.closePath(); }, col);
  rock(-34, 0, 32, 40, '#7a776f'); rock(36, 0, 30, 34, '#86837a');
  rock(0, -16, 46, 46, '#8e8a80');
  hp(g, () => g.ellipse(2, -8, 16, 13, 0, Math.PI, 0), '#120c08'); g.fillStyle = '#120c08'; g.fillRect(-14, -8, 32, 8);
  g.fillStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.ellipse(-8, -52, 14, 5, -0.3, 0, 7); g.fill();
  g.strokeStyle = 'rgba(36,24,15,.5)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-20, -40); g.lineTo(-10, -30); g.moveTo(24, -34); g.lineTo(30, -22); g.stroke();
  // мох
  g.fillStyle = '#5d8a42'; for (const [x, y, r] of [[-50, -6, 6], [-26, -36, 5], [50, -8, 5], [14, -56, 4]]) { g.beginPath(); g.ellipse(x, y, r * 1.6, r * 0.7, 0, 0, 7); g.fill(); }
  bone(g, 30, 8, 0.2); bone(g, -12, 10, 1.1); bone(g, -46, 10, -0.3);
  hp(g, () => { g.arc(54, 6, 5, 0, 7); }, '#e6dcc4', 1); g.fillStyle = O; g.fillRect(52, 4, 1.6, 1.6); g.fillRect(55.4, 4, 1.6, 1.6);
}

// кабанья лёжка: грязевая лужа, взрытая земля, сломанный пень
function boar(g) {
  hp(g, () => g.ellipse(0, -2, 70, 24, 0, 0, 7), '#5a4128', 1.2);
  hp(g, () => g.ellipse(-6, -2, 52, 16, 0, 0, 7), '#4a3420', 0);
  g.fillStyle = 'rgba(160,190,200,.35)'; g.beginPath(); g.ellipse(-14, -4, 22, 6, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(22, 2, 12, 3.5, 0, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(-20, -6, 8, 1.6, 0, 0, 7); g.fill();
  // кочки взрытой земли
  for (const [x, y] of [[-66, 10], [-48, 18], [58, 14], [40, 20], [70, -6]]) hp(g, () => g.ellipse(x, y, 7, 4, 0, Math.PI, 0), '#6b4e30', 1);
  // пень
  shadow(g, 18, 5); g.save(); g.translate(48, -20);
  hp(g, () => { g.moveTo(-12, 12); g.lineTo(-11, -8); g.lineTo(-6, -14); g.lineTo(-1, -9); g.lineTo(4, -15); g.lineTo(11, -7); g.lineTo(12, 12); g.closePath(); }, '#6b4a2c');
  hp(g, () => g.ellipse(0, 12, 12, 4, 0, 0, Math.PI), '#5a3e24', 1);
  g.strokeStyle = 'rgba(36,24,15,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-5, -4); g.lineTo(-6, 8); g.moveTo(4, -6); g.lineTo(5, 8); g.stroke();
  g.restore();
  // следы копыт
  g.fillStyle = 'rgba(40,28,16,.6)'; for (let i = 0; i < 6; i++) { const x = -60 + i * 22, y = 30 + (i % 2) * 6; g.beginPath(); g.ellipse(x - 2, y, 1.6, 2.6, 0, 0, 7); g.ellipse(x + 2, y, 1.6, 2.6, 0, 0, 7); g.fill(); }
}

// паучье гнездо: сухая коряга, паутина, коконы
function web(g) {
  shadow(g, 64, 14);
  g.fillStyle = 'rgba(235,235,240,.35)'; g.beginPath(); g.ellipse(0, 0, 66, 20, 0, 0, 7); g.fill();
  // коряга
  g.strokeStyle = O; g.lineWidth = 8; g.lineCap = 'round';
  const br = [[0, 0, -4, -50], [-4, -50, -36, -76], [-4, -50, 30, -82], [-16, -62, -44, -54], [14, -66, 42, -58]];
  for (const b of br) { g.beginPath(); g.moveTo(b[0], b[1]); g.lineTo(b[2], b[3]); g.stroke(); }
  g.strokeStyle = '#5a5048'; g.lineWidth = 5.4; for (const b of br) { g.beginPath(); g.moveTo(b[0], b[1]); g.lineTo(b[2], b[3]); g.stroke(); }
  // паутина между ветвями
  const cx = -4, cy = -62, R = 34;
  g.strokeStyle = 'rgba(250,250,255,.85)'; g.lineWidth = 0.9;
  for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R * 0.8); g.stroke(); }
  for (let k = 1; k <= 4; k++) { g.beginPath(); for (let i = 0; i <= 10; i++) { const a = i / 10 * 6.283, rr = R * k / 4.4; const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.8; i ? g.quadraticCurveTo(cx + Math.cos(a - 0.3) * rr * 0.9, cy + Math.sin(a - 0.3) * rr * 0.72, x, y) : g.moveTo(x, y); } g.stroke(); }
  // коконы
  for (const [x, y, s] of [[-30, -6, 1], [26, -4, 0.8], [40, -48, 0.7]]) { g.save(); g.translate(x, y); g.scale(s, s); hp(g, () => g.ellipse(0, -8, 6, 10, 0.2, 0, 7), '#ece8e0', 1); g.strokeStyle = 'rgba(150,140,130,.7)'; g.lineWidth = 0.8; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-6, -14 + i * 4); g.lineTo(6, -12 + i * 4); g.stroke(); } g.restore(); }
  // нити по земле
  g.strokeStyle = 'rgba(250,250,255,.6)'; g.lineWidth = 0.8; for (const [x1, y1, x2, y2] of [[-60, 4, -20, -10], [56, 6, 20, -18], [-40, 14, 30, 12]]) { g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 + 6, x2, y2); g.stroke(); }
}

// шатёр
function tent(g, x, y, w, col, flag) {
  g.save(); g.translate(x, y);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(6, 2, w * 1.1, w * 0.24, 0, 0, 7); g.fill();
  hp(g, () => { g.moveTo(-w, 0); g.lineTo(0, -w * 1.1); g.lineTo(w, 0); g.closePath(); }, col);
  hp(g, () => { g.moveTo(0, -w * 1.1); g.lineTo(w, 0); g.lineTo(w * 0.35, 0); g.closePath(); }, 'rgba(0,0,0,.18)', 0);
  hp(g, () => { g.moveTo(-w * 0.28, 0); g.lineTo(0, -w * 0.62); g.lineTo(w * 0.28, 0); g.closePath(); }, '#24180f', 1);
  g.strokeStyle = 'rgba(36,24,15,.45)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-w * 0.5, -w * 0.55); g.lineTo(-w * 0.65, 0); g.moveTo(w * 0.5, -w * 0.55); g.lineTo(w * 0.62, 0); g.stroke();
  g.strokeStyle = O; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -w * 1.1); g.lineTo(0, -w * 1.1 - 10); g.stroke();
  if (flag) hp(g, () => { g.moveTo(0, -w * 1.1 - 10); g.lineTo(16, -w * 1.1 - 6); g.lineTo(0, -w * 1.1 - 2); g.closePath(); }, flag, 1);
  g.restore();
}
function crate(g, x, y) { hp(g, () => g.rect(x - 8, y - 14, 16, 14), '#8a6a3a', 1.1); g.strokeStyle = 'rgba(36,24,15,.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 8, y - 14); g.lineTo(x + 8, y); g.moveTo(x + 8, y - 14); g.lineTo(x - 8, y); g.stroke(); }

// лагерь разбойников: два шатра, ящики, частокол из кольев (костёр рисуется отдельно, он горит)
function bandit(g) {
  tent(g, -70, -30, 34, '#8a7a5a', '#7a2a2a');
  tent(g, 64, -24, 30, '#7a6a4e');
  crate(g, -30, -8); crate(g, -18, -4); crate(g, 30, 2);
  g.strokeStyle = O; g.lineWidth = 3.6; for (const [x, y] of [[-100, 10], [-92, 18], [96, 14], [104, 4]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 3, y - 18); g.stroke(); }
  g.strokeStyle = '#7a5530'; g.lineWidth = 2; for (const [x, y] of [[-100, 10], [-92, 18], [96, 14], [104, 4]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 3, y - 18); g.stroke(); }
}
// логово Атамана: большой красный шатёр со знаменем, сундук
function ataman(g) {
  tent(g, 0, -34, 52, '#8a2a24', '#f4c766');
  hp(g, () => g.rect(-56, -14, 22, 14), '#6b4a2c', 1.2); hp(g, () => g.rect(-56, -14, 22, 4), '#c9a24a', 1); g.fillStyle = '#c9a24a'; g.fillRect(-46.5, -8, 3, 4);
  crate(g, 50, -4); crate(g, 62, 4);
  for (const [x, y] of [[-30, 6], [34, 8]]) { g.save(); g.translate(x, y); hp(g, () => { g.moveTo(0, 0); g.lineTo(0, -26); }, null, 2.4); g.restore(); }
}

// псарня: покосившаяся будка, миска, цепь, кости
function kennel(g) {
  shadow(g, 46, 10);
  hp(g, () => { g.moveTo(-30, 0); g.lineTo(-30, -30); g.lineTo(-4, -50); g.lineTo(22, -32); g.lineTo(22, 0); g.closePath(); }, '#7a5530');
  g.strokeStyle = 'rgba(36,24,15,.5)'; g.lineWidth = 1; for (let y = -26; y < 0; y += 7) { g.beginPath(); g.moveTo(-30, y); g.lineTo(22, y); g.stroke(); }
  hp(g, () => { g.moveTo(-36, -28); g.lineTo(-4, -54); g.lineTo(28, -30); g.lineTo(24, -26); g.lineTo(-4, -48); g.lineTo(-32, -24); g.closePath(); }, '#5a3a20');
  hp(g, () => { g.moveTo(-16, 0); g.lineTo(-16, -16); g.quadraticCurveTo(-5, -28, 6, -16); g.lineTo(6, 0); g.closePath(); }, '#1a120a');
  hp(g, () => g.ellipse(36, -2, 9, 3.5, 0, 0, 7), '#8a8f96', 1); g.fillStyle = '#5a3a2a'; g.beginPath(); g.ellipse(36, -3, 6, 2, 0, 0, 7); g.fill();
  g.strokeStyle = '#6c757c'; g.lineWidth = 1.4; g.setLineDash([2, 2]); g.beginPath(); g.moveTo(10, -6); g.quadraticCurveTo(24, 8, 44, 4); g.stroke(); g.setLineDash([]);
  bone(g, -40, 6, 0.3); bone(g, 18, 8, -0.8);
}
// вороньё поле: сухое дерево с гнёздами
function crowfield(g) {
  shadow(g, 30, 8);
  g.strokeStyle = O; g.lineWidth = 9; const br = [[0, 0, 2, -60], [2, -60, -22, -86], [2, -60, 26, -92], [-8, -72, -30, -66], [12, -74, 34, -70], [2, -60, 6, -96]];
  for (const b of br) { g.beginPath(); g.moveTo(b[0], b[1]); g.lineTo(b[2], b[3]); g.stroke(); }
  g.strokeStyle = '#4a3a30'; g.lineWidth = 6; for (const b of br) { g.beginPath(); g.moveTo(b[0], b[1]); g.lineTo(b[2], b[3]); g.stroke(); }
  for (const [x, y] of [[-20, -84], [24, -88]]) { hp(g, () => g.ellipse(x, y, 10, 5, 0, 0, 7), '#6a5030', 1); g.strokeStyle = '#8a6a40'; g.lineWidth = 0.8; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(x - 10 + i * 4, y - 2); g.lineTo(x - 8 + i * 4, y + 3); g.stroke(); } }
  for (const [x, y] of [[6, -100], [-30, -70]]) { hp(g, () => g.ellipse(x, y, 4.5, 3, 0, 0, 7), '#2e2a36', 0.9); hp(g, () => g.arc(x + 4, y - 2, 2.4, 0, 7), '#2e2a36', 0.8); g.fillStyle = '#c9a24a'; g.beginPath(); g.moveTo(x + 6, y - 2); g.lineTo(x + 9, y - 1); g.lineTo(x + 6, y); g.fill(); }
  g.fillStyle = '#1e1a24'; for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(-30 + i * 10, 4 + (i % 2) * 3, 3, 1, 0.4, 0, 7); g.fill(); }
}
// огород пугал: тыквы, тележное колесо, лопата
function scarefield(g) {
  shadow(g, 46, 9);
  for (const [x, y, s] of [[-30, 2, 1], [-14, 8, 0.8], [26, 4, 1.1]]) { hp(g, () => g.ellipse(x, y - 7 * s, 10 * s, 8 * s, 0, 0, 7), '#e07a2a', 1.1); g.strokeStyle = '#a8542a'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(x - 4 * s, y - 14 * s); g.quadraticCurveTo(x - 6 * s, y - 7 * s, x - 4 * s, y); g.moveTo(x + 4 * s, y - 14 * s); g.quadraticCurveTo(x + 6 * s, y - 7 * s, x + 4 * s, y); g.stroke(); hp(g, () => g.rect(x - 1.2, y - 18 * s, 2.4, 4), '#5a8a3a', 0.6); }
  g.save(); g.translate(4, -14); g.strokeStyle = O; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, 14, 0, 7); g.stroke(); g.strokeStyle = '#8a6a3a'; g.lineWidth = 2.4; g.stroke(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 13, Math.sin(a) * 13); g.stroke(); } g.restore();
  g.strokeStyle = O; g.lineWidth = 3.4; g.beginPath(); g.moveTo(40, 6); g.lineTo(52, -34); g.stroke(); g.strokeStyle = '#7a5530'; g.lineWidth = 2; g.stroke(); hp(g, () => { g.moveTo(36, 4); g.lineTo(44, 4); g.lineTo(42, 14); g.lineTo(38, 14); g.closePath(); }, '#9aa3aa', 0.9);
}
// выгон: плетёный загон и корыто
function pasture(g) {
  shadow(g, 60, 12);
  for (const [x1, y1, x2, y2] of [[-60, -10, 60, -16], [-60, -10, -64, 14], [60, -16, 64, 10]]) {
    const L = Math.hypot(x2 - x1, y2 - y1), n = Math.round(L / 20);
    for (let i = 0; i <= n; i++) { const x = x1 + (x2 - x1) * i / n, y = y1 + (y2 - y1) * i / n; g.strokeStyle = O; g.lineWidth = 3.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 22); g.stroke(); g.strokeStyle = '#7a5530'; g.lineWidth = 2; g.stroke(); }
    for (const h of [-8, -16]) { g.strokeStyle = O; g.lineWidth = 3.4; g.beginPath(); g.moveTo(x1, y1 + h); g.lineTo(x2, y2 + h); g.stroke(); g.strokeStyle = '#9a7a4a'; g.lineWidth = 2; g.stroke(); }
  }
  hp(g, () => g.rect(-20, -2, 40, 10), '#6b4a2c', 1.2); g.fillStyle = '#4a7a92'; g.fillRect(-17, 0, 34, 4);
}
// пепелище: обгоревшие столбы, угли
function burned(g) {
  shadow(g, 56, 12);
  g.fillStyle = 'rgba(30,24,20,.6)'; g.beginPath(); g.ellipse(0, -2, 58, 16, 0, 0, 7); g.fill();
  for (const [x, h, a] of [[-38, 46, -0.1], [-12, 62, 0.05], [16, 38, 0.2], [40, 54, -0.05]]) { g.save(); g.translate(x, 0); g.rotate(a); hp(g, () => g.rect(-4, -h, 8, h), '#2a201a', 1.2); g.fillStyle = 'rgba(255,120,40,.7)'; g.fillRect(-1.5, -h * 0.6, 3, 6); g.restore(); }
  hp(g, () => { g.moveTo(-40, -36); g.lineTo(20, -50); g.lineTo(22, -46); g.lineTo(-38, -32); g.closePath(); }, '#2a201a', 1);
  g.fillStyle = '#ff7a2a'; for (let i = 0; i < 12; i++) { g.beginPath(); g.arc(-40 + i * 7, 2 + (i % 3) * 3, 1.4, 0, 7); g.fill(); }
}

const ART = {
  kennel: [120, 80, 60, 64, kennel], crowfield: [100, 130, 50, 110, crowfield], scarefield: [130, 70, 65, 46, scarefield], pasture: [150, 70, 75, 46, pasture], burned: [140, 90, 70, 74, burned], den: [140, 70, 70, 56, den], wolf: [150, 80, 75, 64, wolf], boar: [160, 70, 80, 36, boar], web: [140, 110, 70, 92, web], bandit: [230, 116, 115, 88, bandit], ataman: [160, 120, 80, 104, ataman] };
/** Готовая картинка приметы логова. */
export function lairSpr(kind) {
  const a = ART[kind]; if (!a) return null;
  return sprite('lair|' + kind, a[0], a[1], a[2], a[3], 2, a[4]);
}
