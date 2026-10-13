// Храм квакунов (v76, эскиз): вход во впадине, предбанник, коридоры и залы. Единицы мира; рост героя ≈ 42.
// Камень храма — зеленоватый тёсаный, с мхом и водой в канавках; узор — кольца и жабьи знаки.
import { masonry } from './castle.js';
const TAU = Math.PI * 2, O = '#24180f';
const rnd = s => { s = Math.abs(s | 0) || 1; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; };
const sh = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join(''); };
function hp(g, fn, fill, lw = 1.3) { g.beginPath(); fn(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = O; g.lineWidth = lw; g.stroke(); } }
export const STONE = '#66705c', STONE_D = '#3e4738', STONE_L = '#8a957e', MOSS = '#4e7a3a', WATER = '#2e5a66', FLOOR = '#5c665a', FLOOR_L = '#6f7a6a';

/** Мох по краю: пятна полукругом внизу прямоугольника. */
function mossEdge(g, x, y, w, seed, n = 8, up = false) { const r = rnd(seed); g.fillStyle = MOSS; for (let i = 0; i < n; i++) { const px = x + r() * w, rx = 4 + r() * 8; g.beginPath(); g.ellipse(px, y, rx, rx * 0.5, 0, up ? Math.PI : 0, up ? TAU : Math.PI); g.fill(); } }
/** Жабий знак: кольцо с тремя точками (глаза и рот). */
export function glyph(g, x, y, r, col = '#b8a860') { g.strokeStyle = col; g.fillStyle = col; g.lineWidth = r * 0.2; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); for (const sx of [-1, 1]) { g.beginPath(); g.arc(x + sx * r * 0.55, y - r * 0.85, r * 0.3, 0, TAU); g.fill(); } g.beginPath(); g.moveTo(x - r * 0.55, y + r * 0.15); g.lineTo(x + r * 0.55, y + r * 0.15); g.stroke(); for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(x + sx * r * 0.55, y + r * 0.15); g.lineTo(x + sx * r * 0.9, y + r * 0.55); g.stroke(); } }
/** Колонна с кольцами: ствол с базой и капителью, высота h. */
export function column(g, x, y, h, w = 22, rings = 3) {
  const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0); gr.addColorStop(0, STONE_L); gr.addColorStop(0.45, STONE); gr.addColorStop(1, STONE_D);
  hp(g, () => g.rect(x - w / 2, y - h, w, h), gr, 1.4);
  hp(g, () => g.rect(x - w / 2 - 4, y - 8, w + 8, 8), STONE_D, 1.2); hp(g, () => g.rect(x - w / 2 - 5, y - h - 7, w + 10, 7), STONE_L, 1.2);
  for (let i = 1; i <= rings; i++) { const yy = y - h * i / (rings + 1); hp(g, () => g.rect(x - w / 2 - 2, yy - 2.5, w + 4, 5), '#8a7a4a', 0.9); }
  mossEdge(g, x - w / 2, y - 8, w, x | 0, 4, true);
}
/** Статуя жабы на постаменте, смотрит вперёд. s — размер (1 ≈ рост героя). */
export function toadStatue(g, x, y, s = 1, col = '#7a8a74') {
  g.save(); g.translate(x, y); g.scale(s, s);
  hp(g, () => g.rect(-26, -14, 52, 14), STONE_D, 1.3); hp(g, () => g.rect(-28, -4, 56, 4), STONE, 1.1);
  const d = sh(col, -0.3);
  for (const sx of [-1, 1]) hp(g, () => { g.moveTo(sx * 10, -16); g.quadraticCurveTo(sx * 24, -22, sx * 22, -34); g.lineTo(sx * 14, -30); g.closePath(); }, d, 1.1);
  hp(g, () => { g.moveTo(-20, -14); g.bezierCurveTo(-24, -36, -10, -48, 0, -48); g.bezierCurveTo(10, -48, 24, -36, 20, -14); g.closePath(); }, col, 1.3);
  hp(g, () => { g.moveTo(-16, -44); g.bezierCurveTo(-18, -60, 18, -60, 16, -44); g.quadraticCurveTo(0, -38, -16, -44); g.closePath(); }, sh(col, 0.08), 1.2);
  for (const sx of [-1, 1]) { hp(g, () => g.arc(sx * 8, -54, 5, 0, TAU), col, 1); g.fillStyle = '#2a3a28'; g.beginPath(); g.arc(sx * 8, -54, 2.2, 0, TAU); g.fill(); }
  g.strokeStyle = O; g.lineWidth = 1; g.beginPath(); g.moveTo(-13, -43); g.quadraticCurveTo(0, -39, 13, -43); g.stroke();
  g.fillStyle = 'rgba(78,122,58,.7)'; for (const [px, py, r] of [[-12, -22, 6], [14, -30, 5], [-4, -46, 3]]) { g.beginPath(); g.ellipse(px, py, r, r * 0.6, 0, 0, TAU); g.fill(); }
  g.restore();
}
/** Жаровня: чаша на ножке, огонь. */
export function brazier(g, x, y, t, lit = true) {
  hp(g, () => g.rect(x - 4, y - 18, 8, 18), '#3a3430', 1); hp(g, () => g.ellipse(x, y - 20, 12, 5, 0, 0, TAU), '#4a4038', 1.1);
  if (!lit) return; const f = Math.sin(t * 9) * 2, f2 = Math.cos(t * 7) * 1.5;
  g.fillStyle = '#ff9a3a'; g.beginPath(); g.moveTo(x - 7, y - 22); g.quadraticCurveTo(x - 4 + f, y - 36, x + f2, y - 44); g.quadraticCurveTo(x + 5 - f, y - 34, x + 7, y - 22); g.closePath(); g.fill();
  g.fillStyle = '#ffe08a'; g.beginPath(); g.moveTo(x - 3, y - 22); g.quadraticCurveTo(x + f2 * 0.5, y - 32, x + f * 0.4, y - 36); g.quadraticCurveTo(x + 3, y - 30, x + 3, y - 22); g.closePath(); g.fill();
  const gl = g.createRadialGradient(x, y - 30, 2, x, y - 30, 70); gl.addColorStop(0, 'rgba(255,170,70,.35)'); gl.addColorStop(1, 'rgba(255,170,70,0)'); g.fillStyle = gl; g.fillRect(x - 70, y - 100, 140, 140);
}
/** Канавка с водой вдоль x от x0 до x1 на высоте y, ширина w. */
export function channel(g, x0, y, x1, w, t = 0) {
  hp(g, () => g.rect(x0, y - w / 2 - 2, x1 - x0, w + 4), STONE_D, 1); g.fillStyle = WATER; g.fillRect(x0, y - w / 2, x1 - x0, w);
  g.strokeStyle = 'rgba(190,230,230,.35)'; g.lineWidth = 1; for (let x = x0 + 10; x < x1; x += 26) { g.beginPath(); g.moveTo(x, y + Math.sin(x * 0.2 + t) * 1.5); g.lineTo(x + 12, y + Math.sin(x * 0.2 + t + 1) * 1.5); g.stroke(); }
}
/** Канавка с водой вдоль y. */
export function channelV(g, x, y0, y1, w, t = 0) {
  hp(g, () => g.rect(x - w / 2 - 2, y0, w + 4, y1 - y0), STONE_D, 1); g.fillStyle = WATER; g.fillRect(x - w / 2, y0, w, y1 - y0);
  g.strokeStyle = 'rgba(190,230,230,.35)'; g.lineWidth = 1; for (let y = y0 + 10; y < y1; y += 26) { g.beginPath(); g.moveTo(x + Math.sin(y * 0.2 + t) * 1.5, y); g.lineTo(x + Math.sin(y * 0.2 + t + 1) * 1.5, y + 12); g.stroke(); }
}
/** Пол: плиты с узором, трещины, мох, лужи. */
export function floor(g, x, y, w, h, seed = 1, big = 40, mark = true) {
  const r = rnd(seed); g.fillStyle = FLOOR; g.fillRect(x, y, w, h);
  for (let yy = y; yy < y + h; yy += big) for (let xx = x; xx < x + w; xx += big) { const v = r(); g.fillStyle = v < 0.3 ? FLOOR_L : v > 0.85 ? sh(FLOOR, -0.1) : FLOOR; g.fillRect(xx + 1, yy + 1, big - 2, big - 2); }
  g.strokeStyle = 'rgba(30,24,20,.35)'; g.lineWidth = 1; for (let yy = y; yy <= y + h; yy += big) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.stroke(); } for (let xx = x; xx <= x + w; xx += big) { g.beginPath(); g.moveTo(xx, y); g.lineTo(xx, y + h); g.stroke(); }
  for (let i = 0; i < w * h / 9000; i++) { const px = x + r() * w, py = y + r() * h; g.strokeStyle = 'rgba(30,24,20,.5)'; g.beginPath(); g.moveTo(px, py); g.lineTo(px + (r() - 0.5) * 30, py + (r() - 0.5) * 20); g.lineTo(px + (r() - 0.5) * 40, py + (r() - 0.5) * 30); g.stroke(); }
  for (let i = 0; i < w * h / 7000; i++) { const px = x + r() * w, py = y + r() * h; g.fillStyle = r() < 0.5 ? 'rgba(78,122,58,.45)' : 'rgba(46,90,102,.4)'; g.beginPath(); g.ellipse(px, py, 8 + r() * 14, 4 + r() * 6, r() * 3, 0, TAU); g.fill(); }
  if (mark && w > 160 && h > 160) { const cx = x + w / 2, cy = y + h / 2; g.strokeStyle = 'rgba(184,168,96,.35)'; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, cy, Math.min(w, h) * 0.3, Math.min(w, h) * 0.17, 0, 0, TAU); g.stroke(); glyph(g, cx, cy, 14, 'rgba(184,168,96,.45)'); }
}
/** Дальняя стена зала (видна лицом): кладка, карниз, знаки, факелы. */
export function backWall(g, x, y, w, h, seed = 2, t = 0, torches = []) {
  masonry(g, x, y - h, w, h, STONE, seed, 16);
  hp(g, () => g.rect(x, y - h - 10, w, 10), STONE_L, 1.2); hp(g, () => g.rect(x, y - 6, w, 6), STONE_D, 1);
  const r = rnd(seed + 9); for (let xx = x + 60; xx < x + w - 40; xx += 120) glyph(g, xx, y - h * 0.62, 10 + r() * 3, 'rgba(184,168,96,.55)');
  mossEdge(g, x, y - h - 10, w, seed + 1, Math.ceil(w / 40)); mossEdge(g, x, y - 6, w, seed + 2, Math.ceil(w / 50), true);
  for (const tx of torches) { hp(g, () => g.rect(tx - 2, y - h * 0.5, 4, 22), '#3a2e22', 0.8); const f = Math.sin(t * 10 + tx) * 1.5; g.fillStyle = '#ff9a3a'; g.beginPath(); g.moveTo(tx - 4, y - h * 0.5); g.quadraticCurveTo(tx + f, y - h * 0.5 - 14, tx + 4, y - h * 0.5); g.fill(); g.fillStyle = '#ffe08a'; g.beginPath(); g.moveTo(tx - 2, y - h * 0.5); g.quadraticCurveTo(tx + f * 0.5, y - h * 0.5 - 8, tx + 2, y - h * 0.5); g.fill(); const gl = g.createRadialGradient(tx, y - h * 0.52, 2, tx, y - h * 0.52, 60); gl.addColorStop(0, 'rgba(255,170,70,.3)'); gl.addColorStop(1, 'rgba(255,170,70,0)'); g.fillStyle = gl; g.fillRect(tx - 60, y - h * 0.52 - 60, 120, 120); }
}
/** Боковая стена: толстая полоса с верхом (видна сверху) — обрезает зал по бокам. */
export function sideWall(g, x, y, w, h, seed = 3) { masonry(g, x, y, w, h, STONE_D, seed, 14); hp(g, () => g.rect(x, y, w, h), null, 1.4); const r = rnd(seed); g.fillStyle = 'rgba(78,122,58,.5)'; for (let i = 0; i < h / 40; i++) { g.beginPath(); g.ellipse(x + r() * w, y + r() * h, 5 + r() * 6, 3 + r() * 4, 0, 0, TAU); g.fill(); } }
/** Проём (дверь вглубь) в дальней стене: тёмный арочный проход с косяками. */
export function doorway(g, x, y, w, h, open = true) {
  hp(g, () => { g.moveTo(x - w / 2, y); g.lineTo(x - w / 2, y - h + w / 2); g.arc(x, y - h + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w / 2, y); g.closePath(); }, open ? '#141a14' : '#3a3028', 1.4);
  for (const sx of [-1, 1]) hp(g, () => g.rect(x + sx * w / 2 - (sx > 0 ? 0 : 8), y - h + w / 2, 8, h - w / 2), STONE_L, 1.1);
  if (!open) { g.strokeStyle = '#8a6a3a'; g.lineWidth = 3; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x - w / 2 + 6, y - 14 - i * 22); g.lineTo(x + w / 2 - 6, y - 14 - i * 22); g.stroke(); } }
}
/** Обвал: груда камней. */
export function rubble(g, x, y, n = 7, seed = 4) { const r = rnd(seed); for (let i = 0; i < n; i++) { const px = x + (r() - 0.5) * 60, py = y - r() * 16, s = 6 + r() * 10; hp(g, () => { g.moveTo(px - s, py); g.lineTo(px - s * 0.4, py - s * 0.9); g.lineTo(px + s * 0.6, py - s * 0.7); g.lineTo(px + s, py); g.closePath(); }, [STONE, STONE_L, STONE_D][i % 3], 1.1); } }
/** Сундук с добычей. */
export function chest(g, x, y, open = false) { hp(g, () => g.rect(x - 16, y - 16, 32, 16), '#6a4a2a', 1.2); hp(g, () => g.roundRect(x - 17, y - 24 - (open ? 6 : 0), 34, 10, 3), '#7a5a32', 1.2); g.fillStyle = '#c8a040'; g.fillRect(x - 3, y - 17, 6, 6); g.strokeStyle = '#c8a040'; g.lineWidth = 1.5; g.strokeRect(x - 16, y - 16, 32, 16); if (open) { g.fillStyle = '#ffe08a'; g.beginPath(); g.ellipse(x, y - 16, 14, 4, 0, 0, TAU); g.fill(); } }
/** Костёр возрождения в предбаннике: кольцо камней, огонь, жабий знак на полу. */
export function restFire(g, x, y, t) { glyph(g, x, y + 2, 26, 'rgba(184,168,96,.35)'); const r = rnd(7); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; hp(g, () => g.ellipse(x + Math.cos(a) * 20, y + Math.sin(a) * 9, 4 + r() * 2, 3, a, 0, TAU), STONE_D, 1); } for (let i = 0; i < 3; i++) hp(g, () => { g.moveTo(x - 14 + i * 6, y - 2); g.lineTo(x + 8 + i * 4, y - 8 - i * 2); }, null, 2.6); const f = Math.sin(t * 9) * 2; g.fillStyle = '#ff9a3a'; g.beginPath(); g.moveTo(x - 9, y - 4); g.quadraticCurveTo(x - 4 + f, y - 20, x + f * 0.5, y - 30); g.quadraticCurveTo(x + 6 - f, y - 18, x + 9, y - 4); g.closePath(); g.fill(); g.fillStyle = '#ffe08a'; g.beginPath(); g.moveTo(x - 4, y - 4); g.quadraticCurveTo(x + f * 0.4, y - 14, x, y - 20); g.quadraticCurveTo(x + 4, y - 12, x + 4, y - 4); g.closePath(); g.fill(); const gl = g.createRadialGradient(x, y - 14, 2, x, y - 14, 110); gl.addColorStop(0, 'rgba(255,170,70,.35)'); gl.addColorStop(1, 'rgba(255,170,70,0)'); g.fillStyle = gl; g.fillRect(x - 110, y - 124, 220, 220); }

/** Вход в Храм квакунов (v76): монументальный фасад, врезанный в скалу впадины. Начало — порог врат у земли.
 *  Врата 2,4 роста (100), статуи жаб 1,5 роста, фасад ≈ 560 в ширину и 300 в высоту со скалой. */
export function entrance(g, t = 0) {
  const r = rnd(76);
  // ---- скала за фасадом: три уступа, трещины, корни и мох
  const crag = (y0, h, col, seed) => { const q = rnd(seed); hp(g, () => { g.moveTo(-360, y0 + 40); g.lineTo(-360, y0); for (let x = -360; x <= 360; x += 28) g.lineTo(x, y0 - h * (0.7 + q() * 0.3) + Math.sin(x * 0.07 + seed) * 8); g.lineTo(360, y0); g.lineTo(360, y0 + 40); g.closePath(); }, col, 1.5); };
  crag(-230, 60, '#38423a', 3); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-360, -230, 720, 14); crag(-170, 60, '#434f42', 5); g.fillRect(-360, -170, 720, 14); crag(-110, 70, '#4c594a', 7); g.fillRect(-360, -110, 720, 14); crag(-40, 50, '#556252', 9);
  g.save(); g.beginPath(); g.rect(-360, -300, 720, 320); g.clip();
  g.strokeStyle = 'rgba(30,22,14,.45)'; g.lineWidth = 1.4; for (let i = 0; i < 40; i++) { const px = -350 + r() * 700, py = -280 + r() * 260; if (px > -300 && px < 300 && py > -270) continue; g.beginPath(); g.moveTo(px, py); g.lineTo(px + 8 + r() * 16, py + 10 + r() * 16); g.lineTo(px + 4 + r() * 10, py + 24 + r() * 14); g.stroke(); }
  g.fillStyle = 'rgba(78,122,58,.55)'; for (let i = 0; i < 70; i++) { const px = -350 + r() * 700, py = -290 + r() * 270; if (px > -290 && px < 290 && py > -265) continue; g.beginPath(); g.ellipse(px, py, 5 + r() * 12, 3 + r() * 5, r() * 3, 0, TAU); g.fill(); }
  g.restore();
  // ---- фасад: нижний ярус (колоннада), верхний ярус (фриз), фронтон
  const X = 280, Y1 = -150, Y2 = -240;
  masonry(g, -X, Y1, 2 * X, 150, STONE, 5, 20);
  masonry(g, -X + 20, Y2, 2 * X - 40, 90, sh(STONE, 0.05), 6, 18);
  hp(g, () => g.rect(-X, Y1, 2 * X, 150), null, 1.8); hp(g, () => g.rect(-X + 20, Y2, 2 * X - 40, 90), null, 1.8);
  hp(g, () => g.rect(-X - 10, Y1 - 12, 2 * X + 20, 12), STONE_L, 1.4);   // карниз между ярусами
  hp(g, () => g.rect(-X + 10, Y2 - 10, 2 * X - 20, 10), STONE_L, 1.4);   // карниз верхний
  hp(g, () => { g.moveTo(-X + 4, Y2 - 10); g.lineTo(0, Y2 - 70); g.lineTo(X - 4, Y2 - 10); g.closePath(); }, sh(STONE, 0.1), 1.8);   // фронтон
  // фриз: жабьи знаки в нишах
  for (let i = -3; i <= 3; i++) { if (i === 0) continue; const x = i * 68; hp(g, () => g.roundRect(x - 20, Y2 + 18, 40, 48, 4), sh(STONE, -0.18), 1.1); glyph(g, x, Y2 + 44, 12, '#c0ac5c'); }
  // большой знак на фронтоне и во лбу верхнего яруса
  glyph(g, 0, Y2 - 32, 20, '#d0bc68'); hp(g, () => g.roundRect(-26, Y2 + 14, 52, 56, 5), sh(STONE, -0.22), 1.2); toadRelief(g, 0, Y2 + 68, 0.5);
  // колоннада: по две колонны с каждой стороны, между ними ниши с факелами
  for (const x of [-220, -130, 130, 220]) column(g, x, 0, 150, 26, 4);
  for (const sx of [-1, 1]) { const x = sx * 175; hp(g, () => { g.moveTo(x - 16, -30); g.lineTo(x - 16, -100); g.arc(x, -100, 16, Math.PI, 0); g.lineTo(x + 16, -30); g.closePath(); }, '#1a201a', 1.3); torchAt(g, x, -74, t); }
  // врата: арка 2,4 роста, косяки с резьбой, тьма внутри с зеленоватым светом
  const GW = 64, GH = 100;
  hp(g, () => { g.moveTo(-GW / 2 - 14, 0); g.lineTo(-GW / 2 - 14, -GH + 10); g.arc(0, -GH + 10, GW / 2 + 14, Math.PI, 0); g.lineTo(GW / 2 + 14, 0); g.closePath(); }, STONE_L, 1.6);
  const dg = g.createLinearGradient(0, -GH, 0, 0); dg.addColorStop(0, '#0c100c'); dg.addColorStop(0.7, '#101810'); dg.addColorStop(1, '#1a2a1e');
  hp(g, () => { g.moveTo(-GW / 2, 0); g.lineTo(-GW / 2, -GH + 10); g.arc(0, -GH + 10, GW / 2, Math.PI, 0); g.lineTo(GW / 2, 0); g.closePath(); }, dg, 1.4);
  const gl = g.createRadialGradient(0, -20, 4, 0, -20, 60); gl.addColorStop(0, 'rgba(120,200,150,.22)'); gl.addColorStop(1, 'rgba(120,200,150,0)'); g.fillStyle = gl; g.fillRect(-40, -80, 80, 80);
  for (let i = 0; i < 7; i++) { const a = Math.PI + i * Math.PI / 6; glyph(g, Math.cos(a) * (GW / 2 + 7), -GH + 10 + Math.sin(a) * (GW / 2 + 7), 4.5, '#9a8a4a'); }   // знаки по дуге
  // статуи жаб у лестницы — 1,5 роста
  for (const sx of [-1, 1]) toadStatue(g, sx * 118, 46, 1.35);
  // лестница: 5 ступеней вниз от порога, расширяется
  for (let i = 0; i < 5; i++) hp(g, () => g.rect(-70 - i * 12, i * 10, 140 + i * 24, 10), i % 2 ? STONE : STONE_L, 1.2);
  // жаровни по краям лестницы
  for (const sx of [-1, 1]) brazier(g, sx * 150, 56, t);
  // жабы-водомёты у подножия: вода льётся в канавки и лужи
  for (const sx of [-1, 1]) { const x = sx * 260, y = -4; hp(g, () => g.ellipse(x, y - 10, 14, 10, 0, 0, TAU), STONE_D, 1.2); glyph(g, x, y - 12, 6, '#9a8a4a'); g.strokeStyle = 'rgba(160,220,230,.75)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y - 2); g.quadraticCurveTo(x, y + 14, x - sx * 6, y + 26); g.stroke(); g.fillStyle = WATER; g.beginPath(); g.ellipse(x - sx * 10, y + 34, 44, 14, 0, 0, TAU); g.fill(); g.fillStyle = '#5a9a4a'; g.beginPath(); g.ellipse(x - sx * 20, y + 32, 8, 4.5, 0, 0.3, TAU - 0.3); g.fill(); }
  // корни и лианы поверх камня
  g.strokeStyle = '#4a3a24'; g.lineWidth = 2.4; for (const [x0, y0, x1, y1] of [[-X, Y2 - 6, -X + 50, Y1 + 40], [X, Y2, X - 40, Y1 + 60], [-120, Y2 - 10, -90, Y2 + 70]]) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + 20, (y0 + y1) / 2, x1, y1); g.stroke(); }
  g.fillStyle = 'rgba(78,122,58,.6)'; for (let i = 0; i < 30; i++) { const px = -X + r() * 2 * X, py = Y2 - 8 + r() * 230; if (Math.abs(px) < GW / 2 + 16 && py > -GH - 4) continue; g.beginPath(); g.ellipse(px, py, 3 + r() * 7, 2 + r() * 3, r() * 3, 0, TAU); g.fill(); }
}
/** Факел в нише. */
function torchAt(g, x, y, t) { hp(g, () => g.rect(x - 2.5, y, 5, 26), '#3a2e22', 0.9); const f = Math.sin(t * 10 + x) * 2; g.fillStyle = '#ff9a3a'; g.beginPath(); g.moveTo(x - 5, y); g.quadraticCurveTo(x + f, y - 18, x + 5, y); g.fill(); g.fillStyle = '#ffe08a'; g.beginPath(); g.moveTo(x - 2.5, y); g.quadraticCurveTo(x + f * 0.5, y - 10, x + 2.5, y); g.fill(); const gl = g.createRadialGradient(x, y - 4, 2, x, y - 4, 70); gl.addColorStop(0, 'rgba(255,170,70,.32)'); gl.addColorStop(1, 'rgba(255,170,70,0)'); g.fillStyle = gl; g.fillRect(x - 70, y - 74, 140, 140); }
/** Барельеф жабьей морды (в стене). */
function toadRelief(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); const col = sh(STONE, -0.08); hp(g, () => { g.moveTo(-40, 0); g.bezierCurveTo(-44, -40, 44, -40, 40, 0); g.quadraticCurveTo(0, 14, -40, 0); g.closePath(); }, col, 1.4); for (const sx of [-1, 1]) { hp(g, () => g.arc(sx * 18, -22, 10, 0, TAU), col, 1.2); g.fillStyle = '#2a3a28'; g.beginPath(); g.arc(sx * 18, -22, 4.5, 0, TAU); g.fill(); } g.strokeStyle = O; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-28, 0); g.quadraticCurveTo(0, 8, 28, 0); g.stroke(); g.restore(); }
