// Дома и постройки в настоящем масштабе (v58): 1 рост героя ≈ 55. Двери 1,25–1,4 роста, дома 3–4 роста с крышей.
// Начало координат — середина фасада у земли. Тот же стиль: тёмная обводка, 2–3 тона, свет слева сверху.
import { masonry } from './castle.js';
const O = '#24180f';
function hp(g, fn, fill, lw = 1.8) { g.beginPath(); fn(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = O; g.lineWidth = lw; g.stroke(); } }
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v * k))); return '#' + ((1 << 24) | (f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1); };
const rnd = s => () => { s = (s * 16807) % 2147483647; return s / 2147483647; };

// ---------------------------------------------------------------- части
function shadow(g, w) { g.fillStyle = 'rgba(20,12,6,.26)'; g.beginPath(); g.ellipse(10, 4, w * 0.62, 22, 0, 0, 7); g.fill(); }
/** Бревенчатая стена с торцами брёвен на углах. */
function logs(g, x, y, w, h, col = '#7b5634', seed = 1) {
  const r = rnd(seed), lh = 11;
  hp(g, () => g.rect(x, y, w, h), col, 0);
  for (let yy = y, i = 0; yy < y + h - 1; yy += lh, i++) {
    g.fillStyle = r() < 0.5 ? shade(col, 1.07) : shade(col, 0.95); g.fillRect(x, yy + 1, w, lh - 2);
    g.fillStyle = 'rgba(255,240,210,.12)'; g.fillRect(x, yy + 1, w, 2.4);
    g.strokeStyle = 'rgba(36,24,15,.55)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, yy + lh); g.lineTo(x + w, yy + lh); g.stroke();
  }
  for (const ex of [x - 4, x + w + 4]) for (let yy = y, i = 0; yy < y + h - 4; yy += lh, i++) hp(g, () => g.ellipse(ex, yy + lh / 2, 5, lh / 2 - 0.3, 0, 0, 7), '#c9a06a', 1);
  hp(g, () => g.rect(x, y, w, h), null, 1.8);
}
function planks(g, x, y, w, h, col) {
  hp(g, () => g.rect(x, y, w, h), col, 0);
  g.strokeStyle = 'rgba(36,24,15,.4)'; g.lineWidth = 1; for (let xx = x + 9; xx < x + w; xx += 9) { g.beginPath(); g.moveTo(xx, y); g.lineTo(xx, y + h); g.stroke(); }
  hp(g, () => g.rect(x, y, w, h), null, 1.6);
}
/** Дверь: высота h (1,25+ роста), доски, оковка, ручка, порог. */
function door(g, cx, w, h, col = '#5a3a22', arch = true) {
  const x = cx - w / 2;
  const sh = () => { g.moveTo(x, 0); if (arch) { g.lineTo(x, -h + w / 2); g.arc(cx, -h + w / 2, w / 2, Math.PI, 0); } else { g.lineTo(x, -h); g.lineTo(x + w, -h); } g.lineTo(x + w, 0); g.closePath(); };
  hp(g, () => { g.moveTo(x - 5, 2); if (arch) { g.lineTo(x - 5, -h + w / 2); g.arc(cx, -h + w / 2, w / 2 + 5, Math.PI, 0); } else { g.lineTo(x - 5, -h - 5); g.lineTo(x + w + 5, -h - 5); } g.lineTo(x + w + 5, 2); g.closePath(); }, '#4a3020', 1.6);
  hp(g, sh, col, 1.6);
  g.save(); g.beginPath(); sh(); g.clip(); g.strokeStyle = 'rgba(36,24,15,.45)'; g.lineWidth = 1; for (let xx = x + w / 4; xx < x + w; xx += w / 4) { g.beginPath(); g.moveTo(xx, 0); g.lineTo(xx, -h); g.stroke(); } g.restore();
  for (const by of [0.25, 0.7]) hp(g, () => g.rect(x + 2, -h * by - 2.5, w - 4, 5), '#3e3f44', 1);
  hp(g, () => g.arc(x + w - 8, -h * 0.48, 2.6, 0, 7), '#c9a24a', 1);
  hp(g, () => g.rect(x - 7, -2, w + 14, 5), '#7a7468', 1.2);
}
/** Окно со ставнями. lit — тёплый свет. */
function window_(g, cx, y, w, h, shutters = '#3f6a8a') {
  hp(g, () => g.rect(cx - w / 2 - 3, y - 3, w + 6, h + 6), '#5a3e26', 1.4);
  hp(g, () => g.rect(cx - w / 2, y, w, h), '#2a2230', 1.2);
  g.fillStyle = 'rgba(170,200,235,.35)'; g.fillRect(cx - w / 2 + 2, y + 2, 3, h - 4);
  g.strokeStyle = O; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx, y); g.lineTo(cx, y + h); g.moveTo(cx - w / 2, y + h / 2); g.lineTo(cx + w / 2, y + h / 2); g.stroke();
  if (shutters) for (const sd of [-1, 1]) { hp(g, () => g.rect(cx + sd * (w / 2 + 3) - (sd < 0 ? w / 2 : 0), y - 2, w / 2, h + 4), shutters, 1.2); g.strokeStyle = 'rgba(36,24,15,.4)'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx + sd * (w / 2 + 3) - (sd < 0 ? w / 2 : 0) + 2, y + h / 2); g.lineTo(cx + sd * (w / 2 + 3) + (sd < 0 ? 0 : w / 2) - 2, y + h / 2); g.stroke(); }
  hp(g, () => g.rect(cx - w / 2 - 5, y + h + 2, w + 10, 4), '#6b4a2c', 1);
}
/** Двускатная крыша фронтоном к зрителю: видны оба ската уходящими назад (глубина d) и фронтон. */
function gable(g, w, H, rh, d, roof, kind = 'plank', gableCol = '#8a6440') {
  const ov = 14, L = -w / 2 - ov, R = w / 2 + ov, ey = -H + 6, top = -H - rh;
  // скаты назад
  hp(g, () => { g.moveTo(L, ey); g.lineTo(0, top); g.lineTo(0, top - d); g.lineTo(L, ey - d); g.closePath(); }, roof, 1.8);
  hp(g, () => { g.moveTo(R, ey); g.lineTo(0, top); g.lineTo(0, top - d); g.lineTo(R, ey - d); g.closePath(); }, shade(roof, 0.74), 1.8);
  // фактура скатов
  g.save(); g.beginPath(); g.moveTo(L, ey); g.lineTo(0, top); g.lineTo(0, top - d); g.lineTo(L, ey - d); g.closePath(); g.moveTo(R, ey); g.lineTo(0, top); g.lineTo(0, top - d); g.lineTo(R, ey - d); g.closePath(); g.clip();
  if (kind === 'thatch') { g.strokeStyle = 'rgba(90,60,20,.45)'; g.lineWidth = 1; for (let k = 0; k < 40; k++) { const q = k / 40, x = L + (R - L) * q; g.beginPath(); g.moveTo(x, ey + 2); g.lineTo(x * 0.2, top - d * 0.5); g.stroke(); } }
  else { g.strokeStyle = kind === 'tile' ? 'rgba(60,20,10,.45)' : 'rgba(36,24,15,.4)'; g.lineWidth = 1.2; for (let k = 1; k < 6; k++) { const q = k / 6; for (const sd of [-1, 1]) { const x = sd * (w / 2 + ov) * (1 - q), y = ey + (top - ey) * q; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - d); g.stroke(); } } if (kind === 'tile') for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(L, ey - d * k / 4); g.lineTo(0, top - d * k / 4); g.lineTo(R, ey - d * k / 4); g.stroke(); } }
  g.restore();
  // фронтон
  hp(g, () => { g.moveTo(-w / 2, -H); g.lineTo(0, top + 10); g.lineTo(w / 2, -H); g.closePath(); }, gableCol, 1.6);
  g.save(); g.beginPath(); g.moveTo(-w / 2, -H); g.lineTo(0, top + 10); g.lineTo(w / 2, -H); g.closePath(); g.clip(); g.strokeStyle = 'rgba(36,24,15,.35)'; g.lineWidth = 1; for (let xx = -w / 2 + 10; xx < w / 2; xx += 10) { g.beginPath(); g.moveTo(xx, -H); g.lineTo(xx, top); g.stroke(); } g.restore();
  // причелины
  const edge = kind === 'thatch' ? '#8a6a2a' : shade(roof, 0.6);
  hp(g, () => { g.moveTo(L - 2, ey + 4); g.lineTo(0, top - 4); g.lineTo(R + 2, ey + 4); g.lineTo(R - 6, ey + 6); g.lineTo(0, top + 5); g.lineTo(L + 6, ey + 6); g.closePath(); }, edge, 1.6);
}
function chimney(g, x, y, h, stone = '#7a7670') { hp(g, () => g.rect(x - 9, y - h, 18, h), stone, 1.6); hp(g, () => g.rect(x - 11, y - h - 5, 22, 6), shade(stone, 0.85), 1.4); g.fillStyle = 'rgba(36,24,15,.25)'; for (let k = 1; k < h / 9; k++) g.fillRect(x - 9, y - h + k * 9, 18, 1); }
function stoneBase(g, w, h = 10) { masonry(g, -w / 2 - 6, -h, w + 12, h, '#8a857a', 7, 9); hp(g, () => g.rect(-w / 2 - 6, -h, w + 12, h), null, 1.4); }
function sign(g, x, y, kind) {
  hp(g, () => { g.moveTo(x, y); g.lineTo(x + 30, y); }, null, 3); g.strokeStyle = '#5a3e26'; g.lineWidth = 1.6; g.stroke();
  hp(g, () => g.rect(x + 8, y + 2, 26, 22), '#c9a06a', 1.4);
  if (kind === 'mug') { hp(g, () => g.rect(x + 14, y + 8, 11, 12), '#e8d8a8', 1.1); hp(g, () => g.arc(x + 26, y + 14, 4, -1.4, 1.4), null, 1.4); g.fillStyle = '#fff'; g.fillRect(x + 14, y + 6, 11, 3); }
  if (kind === 'pick') { g.strokeStyle = O; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 12, y + 20); g.lineTo(x + 30, y + 6); g.moveTo(x + 30, y + 20); g.lineTo(x + 12, y + 6); g.stroke(); hp(g, () => { g.moveTo(x + 9, y + 9); g.quadraticCurveTo(x + 13, y + 3, x + 18, y + 6); }, null, 2.4); hp(g, () => { g.moveTo(x + 33, y + 9); g.quadraticCurveTo(x + 29, y + 3, x + 24, y + 6); }, null, 2.4); }
  if (kind === 'bed') { hp(g, () => g.rect(x + 12, y + 12, 18, 7), '#e8e0cc', 1); hp(g, () => g.rect(x + 12, y + 9, 6, 5), '#c43a2c', 1); }
}

// ---------------------------------------------------------------- постройки
/** Изба: v — 0 тёсовая крыша, 1 соломенная, 2 черепичная. */
export function house(g, v = 0) {
  const w = 170, H = 96, roofs = [['#5a3e2a', 'plank'], ['#c9a24a', 'thatch'], ['#a8432a', 'tile']][v];
  shadow(g, w + 30);
  stoneBase(g, w);
  logs(g, -w / 2, -H, w, H - 10, '#7b5634', 3 + v);
  chimney(g, w * 0.26, -H - 30, 50);
  gable(g, w, H, 58, 34, roofs[0], roofs[1]);
  window_(g, 0, -H - 30, 20, 20, null);
  door(g, -22, 40, 74, '#5a3a22', false);
  window_(g, 46, -64, 28, 28, ['#3f6a8a', '#7a3a2a', '#4a6a3a'][v]);
  hp(g, () => g.roundRect(-w / 2 + 6, -26, 30, 16, 3), '#5d8a3a', 1.2); g.fillStyle = '#e85a5a'; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(-w / 2 + 12 + k * 6, -27, 2.4, 0, 7); g.fill(); }
}
/** Постоялый двор: два этажа, галерея, вывеска с кроватью. */
export function inn(g) {
  const w = 240, H = 150;
  shadow(g, w + 30); stoneBase(g, w, 14);
  logs(g, -w / 2, -H, w, H - 14, '#7b5634', 21);
  hp(g, () => g.rect(-w / 2 - 6, -78, w + 12, 8), '#5a3e26', 1.4);   // междуэтажный пояс
  chimney(g, -w * 0.3, -H - 40, 70);
  gable(g, w, H, 74, 40, '#a8432a', 'tile');
  window_(g, 0, -H - 40, 24, 24, null);
  for (const x of [-80, -30, 30, 80]) window_(g, x, -132, 24, 26, '#7a3a2a');
  door(g, 0, 46, 76, '#5a3a22', true);
  for (const x of [-82, 76]) window_(g, x, -60, 28, 28, '#7a3a2a');
  sign(g, w / 2 - 4, -96, 'bed');
  hp(g, () => g.rect(-w / 2 + 8, -14, 22, 14), '#6b4a2c', 1.2); hp(g, () => g.ellipse(-w / 2 + 19, -14, 11, 3, 0, 0, 7), '#8a6a3a', 1);   // бочка
}
/** Таверна столицы: каменный низ, фахверк сверху, кружка на вывеске. */
export function tavern(g) {
  const w = 230, H = 146;
  shadow(g, w + 30);
  masonry(g, -w / 2, -72, w, 72, '#9a948a', 31, 12); hp(g, () => g.rect(-w / 2, -72, w, 72), null, 1.8);
  hp(g, () => g.rect(-w / 2 - 8, -H, w + 16, H - 72), '#e8dcc0', 1.8);   // штукатурка второго этажа (выступает)
  g.strokeStyle = '#5a3e26'; g.lineWidth = 6; for (const x of [-w / 2 - 4, -40, 40, w / 2 + 4]) { g.beginPath(); g.moveTo(x, -H); g.lineTo(x, -72); g.stroke(); }
  for (const [x0, x1] of [[-w / 2 - 4, -40], [40, w / 2 + 4]]) { g.beginPath(); g.moveTo(x0, -72); g.lineTo(x1, -H); g.moveTo(x0, -H); g.lineTo(x1, -72); g.stroke(); }
  g.beginPath(); g.moveTo(-w / 2 - 8, -74); g.lineTo(w / 2 + 8, -74); g.stroke(); g.strokeStyle = O; g.lineWidth = 1.6; g.strokeRect(-w / 2 - 8, -H, w + 16, H - 72);
  chimney(g, w * 0.28, -H - 40, 66);
  gable(g, w + 16, H, 70, 40, '#5a3e2a', 'plank', '#e8dcc0');
  window_(g, 0, -122, 26, 30, null);
  door(g, -30, 46, 74, '#5a3a22', true);
  window_(g, 50, -60, 30, 28, '#4a6a3a');
  sign(g, w / 2 - 2, -96, 'mug');
  for (const x of [-w / 2 + 14, -w / 2 + 34]) { hp(g, () => g.rect(x - 9, -18, 18, 18), '#6b4a2c', 1.2); hp(g, () => g.ellipse(x, -18, 9, 3, 0, 0, 7), '#8a6a3a', 1); }
}
/** Мастерская чар: каменная, фиолетовая крыша, кристалл над дверью, круглое окно. */
export function enchant(g) {
  const w = 190, H = 120;
  shadow(g, w + 30);
  masonry(g, -w / 2, -H, w, H, '#8a8494', 41, 12); hp(g, () => g.rect(-w / 2, -H, w, H), null, 1.8);
  gable(g, w, H, 80, 40, '#5a3a7a', 'tile', '#8a8494');
  hp(g, () => g.arc(0, -H - 26, 16, 0, 7), '#cfc6b0', 1.6); hp(g, () => g.arc(0, -H - 26, 12, 0, 7), '#3a2a5a', 1.2);
  g.fillStyle = '#c8a0ff'; g.beginPath(); g.arc(0, -H - 26, 4, 0, 7); g.fill();
  door(g, 0, 42, 76, '#3a2a4a', true);
  for (const x of [-62, 62]) window_(g, x, -88, 24, 32, '#5a3a7a');
  const y = -96, gl = g.createRadialGradient(0, y, 1, 0, y, 30); gl.addColorStop(0, 'rgba(190,140,255,.75)'); gl.addColorStop(1, 'rgba(150,100,255,0)');
  g.fillStyle = gl; g.beginPath(); g.arc(0, y, 30, 0, 7); g.fill();
  hp(g, () => { g.moveTo(0, y - 12); g.lineTo(7, y); g.lineTo(0, y + 12); g.lineTo(-7, y); g.closePath(); }, '#b48aff', 1.2);
  for (const x of [-w / 2 + 16, w / 2 - 16]) { hp(g, () => g.rect(x - 6, -30, 12, 30), '#6a6474', 1.2); g.fillStyle = '#9a7aff'; g.beginPath(); g.moveTo(x, -44); g.lineTo(x + 5, -32); g.lineTo(x - 5, -32); g.closePath(); g.fill(); g.stroke(); }
}
/** Амбар: широкие ворота для телеги, сеновал. Без табличек. */
export function barn(g) {
  const w = 230, H = 120;
  shadow(g, w + 30); stoneBase(g, w, 10);
  planks(g, -w / 2, -H, w, H - 10, '#8a4a32');
  gable(g, w, H, 78, 44, '#5a3e2a', 'plank', '#8a4a32');
  // сеновал
  hp(g, () => g.rect(-26, -H - 52, 52, 36), '#3a2418', 1.6); g.fillStyle = '#e0bc5a'; g.beginPath(); g.moveTo(-24, -H - 16); g.quadraticCurveTo(0, -H - 44, 24, -H - 16); g.fill();
  // ворота (2 створки, 1,8 роста)
  const gw = 96, gh = 100;
  hp(g, () => g.rect(-gw / 2 - 5, -gh - 5, gw + 10, gh + 5), '#4a2a1a', 1.6);
  for (const sd of [-1, 1]) { const x = sd < 0 ? -gw / 2 : 0; planks(g, x, -gh, gw / 2, gh, '#a86040'); g.strokeStyle = '#e8dcc0'; g.lineWidth = 4; g.beginPath(); g.moveTo(x + 3, -gh + 3); g.lineTo(x + gw / 2 - 3, -3); g.moveTo(x + 3, -3); g.lineTo(x + gw / 2 - 3, -gh + 3); g.stroke(); g.strokeRect(x + 3, -gh + 3, gw / 2 - 6, gh - 6); g.strokeStyle = O; g.lineWidth = 1.4; g.strokeRect(x, -gh, gw / 2, gh); }
  for (const x of [-92, 92]) window_(g, x, -86, 20, 20, null);
  // мешки и вилы у стены
  for (const [x, s] of [[-w / 2 + 14, 1], [-w / 2 + 30, 0.85]]) hp(g, () => { g.moveTo(x - 9 * s, 0); g.quadraticCurveTo(x - 11 * s, -18 * s, x - 3 * s, -22 * s); g.lineTo(x + 3 * s, -22 * s); g.quadraticCurveTo(x + 11 * s, -18 * s, x + 9 * s, 0); g.closePath(); }, '#d8c8a0', 1.2);
  hp(g, () => { g.moveTo(w / 2 - 10, 0); g.lineTo(w / 2 - 2, -70); }, null, 3); g.strokeStyle = '#8a6a3a'; g.lineWidth = 1.6; g.stroke();
}
/** Гильдия рудокопов: камень, сланцевая крыша, вход-штольня, кирки на вывеске, вагонетка с рудой. */
export function miners(g) {
  const w = 230, H = 128;
  shadow(g, w + 40);
  masonry(g, -w / 2, -H, w, H, '#7a7266', 51, 12); hp(g, () => g.rect(-w / 2, -H, w, H), null, 1.8);
  chimney(g, -w * 0.3, -H - 40, 64, '#6a6660');
  gable(g, w, H, 66, 40, '#4a4c56', 'tile', '#7a7266');
  window_(g, 0, -H - 38, 22, 22, null);
  // вход с деревянной крепью, как в шахту
  hp(g, () => g.rect(-34, -86, 68, 86), '#1e1612', 1.6);
  for (const x of [-38, 30]) hp(g, () => g.rect(x, -90, 8, 90), '#6b4a2c', 1.4); hp(g, () => g.rect(-44, -96, 88, 10), '#6b4a2c', 1.4);
  door(g, 0, 50, 80, '#4a3020', false);
  for (const x of [-80, 80]) window_(g, x, -96, 24, 26, '#4a4c56');
  sign(g, -w / 2 - 30, -100, 'pick');
  // фонарь и вагонетка
  hp(g, () => g.rect(46, -84, 10, 14), '#ffd36a', 1.2);
  const cx = w / 2 + 14;
  hp(g, () => { g.moveTo(cx - 26, -30); g.lineTo(cx + 26, -30); g.lineTo(cx + 20, -8); g.lineTo(cx - 20, -8); g.closePath(); }, '#5a5a62', 1.6);
  for (const [x, y, c] of [[-12, -34, '#a8604a'], [2, -36, '#8a8a92'], [14, -33, '#c9a24a'], [-4, -40, '#a8604a']]) hp(g, () => g.arc(cx + x, y, 7, 0, 7), c, 1.1);
  for (const x of [-14, 14]) hp(g, () => g.arc(cx + x, -6, 6, 0, 7), '#3a3a40', 1.4);
}
/** Кузница: навес на столбах, горн с трубой, наковальня, бочка. */
export function forge(g) {
  const w = 230, H = 104;
  shadow(g, w + 30);
  // задняя стена и горн
  masonry(g, -w / 2, -H, w, H - 4, '#6a6660', 61, 12); hp(g, () => g.rect(-w / 2, -H, w, H - 4), null, 1.6);
  masonry(g, -w / 2 + 14, -82, 70, 82, '#5c5852', 62, 10); hp(g, () => g.rect(-w / 2 + 14, -82, 70, 82), null, 1.6);
  hp(g, () => g.rect(-w / 2 + 28, -46, 42, 30), '#2a1a10', 1.4);
  const gl = g.createRadialGradient(-w / 2 + 49, -30, 2, -w / 2 + 49, -30, 40); gl.addColorStop(0, 'rgba(255,170,60,.9)'); gl.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gl; g.fillRect(-w / 2 + 9, -70, 80, 80);
  g.fillStyle = '#ffb347'; g.fillRect(-w / 2 + 32, -28, 34, 8);
  chimney(g, -w / 2 + 49, -H - 20, 70, '#5c5852');
  // навес
  for (const x of [-w / 2 + 4, w / 2 - 10]) hp(g, () => g.rect(x, -H, 8, H), '#6b4a2c', 1.4);
  hp(g, () => { g.moveTo(-w / 2 - 16, -H + 4); g.lineTo(-w / 2 + 10, -H - 50); g.lineTo(w / 2 - 10, -H - 50); g.lineTo(w / 2 + 16, -H + 4); g.closePath(); }, '#5a4a42', 1.8);
  g.strokeStyle = 'rgba(36,24,15,.35)'; g.lineWidth = 1.2; for (let k = 1; k < 4; k++) { const y = -H + 4 - k * 13.5; g.beginPath(); g.moveTo(-w / 2 - 16 + k * 6.5, y); g.lineTo(w / 2 + 16 - k * 6.5, y); g.stroke(); }
  // наковальня, бочка, инструменты
  hp(g, () => { g.moveTo(10, 0); g.lineTo(46, 0); g.lineTo(42, -12); g.lineTo(14, -12); g.closePath(); }, '#4a4c50', 1.4);
  hp(g, () => { g.moveTo(2, -12); g.lineTo(54, -12); g.lineTo(60, -22); g.lineTo(6, -22); g.closePath(); }, '#5c5e64', 1.4);
  hp(g, () => g.rect(68, -26, 22, 26), '#6b4a2c', 1.2); g.fillStyle = '#4a7a92'; g.fillRect(70, -24, 18, 4);
  g.strokeStyle = O; g.lineWidth = 2; for (const x of [20, 34, 48]) { g.beginPath(); g.moveTo(x, -H + 8); g.lineTo(x, -H + 30); g.stroke(); } hp(g, () => g.rect(14, -H + 30, 12, 6), '#8e959b', 1);
}
/** Хутор: изба с амбарчиком и плетнём; burned — пепелище с остовом. Начало — середина избы. */
export function farmstead(g, burned) {
  if (burned) {
    shadow(g, 260);
    g.fillStyle = 'rgba(30,24,20,.6)'; g.beginPath(); g.ellipse(20, -4, 150, 30, 0, 0, 7); g.fill();
    for (const [x, h, a] of [[-70, 96, -0.06], [-20, 120, 0.04], [30, 80, 0.12], [80, 104, -0.04], [150, 70, 0.2]]) { g.save(); g.translate(x, 0); g.rotate(a); hp(g, () => g.rect(-6, -h, 12, h), '#2a201a', 1.4); g.fillStyle = 'rgba(255,120,40,.7)'; g.fillRect(-2, -h * 0.55, 4, 8); g.restore(); }
    hp(g, () => { g.moveTo(-76, -88); g.lineTo(84, -100); g.lineTo(84, -94); g.lineTo(-74, -82); g.closePath(); }, '#2a201a', 1.2);
    logs(g, -80, -40, 70, 30, '#3a2a20', 9);
    g.fillStyle = '#ff7a2a'; for (let i = 0; i < 16; i++) { g.beginPath(); g.arc(-90 + i * 14, 4 + (i % 3) * 4, 1.8, 0, 7); g.fill(); }
    return;
  }
  // амбарчик справа сзади
  g.save(); g.translate(150, -10); g.scale(0.62, 0.62); barn(g); g.restore();
  g.save(); g.scale(0.94, 0.94); house(g, 1); g.restore();
  // плетень и грядка
  g.strokeStyle = O; g.lineWidth = 3; for (let x = -150; x < -96; x += 10) { g.beginPath(); g.moveTo(x, 10); g.lineTo(x, -16); g.stroke(); }
  g.strokeStyle = '#9a7a4a'; g.lineWidth = 2.4; for (const y of [-4, -10]) { g.beginPath(); g.moveTo(-152, y); g.lineTo(-96, y - 2); g.stroke(); }
  hp(g, () => g.rect(-60, 14, 110, 22), '#6a4e30', 1.2); g.fillStyle = '#7ab04a'; for (let k = 0; k < 9; k++) { g.beginPath(); g.arc(-52 + k * 12, 25, 4, 0, 7); g.fill(); }
}
/** Стражник города: сине-золотая накидка — рисуется через person() героя (rig), здесь только облик. */
export const GUARD_LOOK = { cls: 'warrior', chest: 3, legs: 3, head: 2, wt: 1, band: '#2f4f8a' };
