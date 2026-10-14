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
/** Обвал: груда камней. */
export function rubble(g, x, y, n = 7, seed = 4) { const r = rnd(seed); for (let i = 0; i < n; i++) { const px = x + (r() - 0.5) * 60, py = y - r() * 16, s = 6 + r() * 10; hp(g, () => { g.moveTo(px - s, py); g.lineTo(px - s * 0.4, py - s * 0.9); g.lineTo(px + s * 0.6, py - s * 0.7); g.lineTo(px + s, py); g.closePath(); }, [STONE, STONE_L, STONE_D][i % 3], 1.1); } }
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
/** Барельеф жабьей морды (в стене). */
function toadRelief(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); const col = sh(STONE, -0.08); hp(g, () => { g.moveTo(-40, 0); g.bezierCurveTo(-44, -40, 44, -40, 40, 0); g.quadraticCurveTo(0, 14, -40, 0); g.closePath(); }, col, 1.4); for (const sx of [-1, 1]) { hp(g, () => g.arc(sx * 18, -22, 10, 0, TAU), col, 1.2); g.fillStyle = '#2a3a28'; g.beginPath(); g.arc(sx * 18, -22, 4.5, 0, TAU); g.fill(); } g.strokeStyle = O; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-28, 0); g.quadraticCurveTo(0, 8, 28, 0); g.stroke(); g.restore(); }

// ======================================================== v78: подробная рисовка подземелья
// Свет слева сверху, факелы и огонь — тёплый свет на полу и стенах. Единицы — мир (рост героя 42).
const JOINT = 'rgba(18,22,16,.9)';
/** Каменный блок с фаской: светлая кромка слева-сверху, тёмная справа-снизу. */
function block(g, x, y, w, h, base, k = 0) {
  g.fillStyle = sh(base, k); g.fillRect(x, y, w, h);
  g.fillStyle = 'rgba(255,250,230,.13)'; g.fillRect(x, y, w, 2); g.fillRect(x, y, 2, h);
  g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(x, y + h - 2, w, 2); g.fillRect(x + w - 2, y, 2, h);
}
/** Кладка крупными тёсаными блоками: ряды разной ширины, тёмные швы, пятна выветривания. */
export function blocks(g, x, y, w, h, base, seed, row = 26) {
  const r = rnd(seed); g.fillStyle = JOINT; g.fillRect(x, y, w, h);
  for (let yy = y, i = 0; yy < y + h; yy += row, i++) {
    let xx = x - (i % 2 ? r() * 30 : 0); const hh = Math.min(row, y + h - yy);
    while (xx < x + w) { const bw = 36 + r() * 40, k = (r() - 0.5) * 0.14; block(g, Math.max(x, xx) + 1, yy + 1, Math.min(x + w, xx + bw) - Math.max(x, xx) - 2, hh - 2, base, k); if (r() < 0.18) { g.fillStyle = 'rgba(40,60,36,.25)'; g.beginPath(); g.ellipse(xx + bw * 0.5, yy + hh * 0.6, bw * 0.3, hh * 0.3, 0, 0, TAU); g.fill(); } xx += bw; }
  }
}
/** Пилястра на дальней стене: выступ с базой и капителью, тень справа. */
function pilaster(g, x, y0, h, w = 18) {
  g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(x + w / 2, y0 - h, 7, h);
  const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0); gr.addColorStop(0, sh(STONE, 0.22)); gr.addColorStop(0.5, sh(STONE, 0.04)); gr.addColorStop(1, sh(STONE, -0.3));
  g.fillStyle = gr; g.fillRect(x - w / 2, y0 - h, w, h);
  g.fillStyle = sh(STONE, 0.2); g.fillRect(x - w / 2 - 4, y0 - h, w + 8, 7); g.fillStyle = sh(STONE, -0.1); g.fillRect(x - w / 2 - 3, y0 - 12, w + 6, 12);
  g.strokeStyle = JOINT; g.lineWidth = 1; g.strokeRect(x - w / 2, y0 - h, w, h);
}
/** Факел на кронштейне: держатель, рукоять, пламя слоями, тёплый свет на стене. */
export function torchAt(g, x, y, t, light = true) {
  const f = Math.sin(t * 11 + x) * 1.6, f2 = Math.cos(t * 7 + x) * 1.2;
  if (light) { const gl = g.createRadialGradient(x, y - 6, 2, x, y - 6, 90); gl.addColorStop(0, 'rgba(255,180,90,.42)'); gl.addColorStop(0.4, 'rgba(255,150,70,.16)'); gl.addColorStop(1, 'rgba(255,150,70,0)'); g.fillStyle = gl; g.fillRect(x - 90, y - 96, 180, 180); }
  g.fillStyle = '#3a3028'; g.fillRect(x - 5, y + 10, 10, 4); g.fillRect(x - 1.5, y + 12, 3, 8);   // кронштейн
  g.fillStyle = '#4a3a28'; g.fillRect(x - 2.5, y - 2, 5, 24); g.fillStyle = '#6a5438'; g.fillRect(x - 2.5, y - 2, 2, 24);
  g.fillStyle = '#2a2420'; g.fillRect(x - 4, y - 6, 8, 6);   // обмотка
  g.fillStyle = '#ff7a1a'; g.beginPath(); g.moveTo(x - 6, y - 4); g.quadraticCurveTo(x - 6 + f, y - 16, x + f2, y - 26); g.quadraticCurveTo(x + 6 - f, y - 16, x + 6, y - 4); g.closePath(); g.fill();
  g.fillStyle = '#ffb03a'; g.beginPath(); g.moveTo(x - 4, y - 4); g.quadraticCurveTo(x - 3 + f * 0.6, y - 13, x + f2 * 0.6, y - 20); g.quadraticCurveTo(x + 4 - f * 0.6, y - 12, x + 4, y - 4); g.closePath(); g.fill();
  g.fillStyle = '#fff0b0'; g.beginPath(); g.moveTo(x - 2, y - 4); g.quadraticCurveTo(x + f * 0.3, y - 9, x + f2 * 0.3, y - 13); g.quadraticCurveTo(x + 2, y - 9, x + 2, y - 4); g.closePath(); g.fill();
}
/** Колонна: круглый ствол (свет слева), каннелюры, база в две ступени, капитель с кольцом и знаком, тень на полу. */
export function column(g, x, y, h, w = 24, rings = 3) {
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(x + 6, y + 2, w * 0.9, w * 0.32, 0, 0, TAU); g.fill();
  const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0); gr.addColorStop(0, sh(STONE, -0.18)); gr.addColorStop(0.22, sh(STONE, 0.3)); gr.addColorStop(0.55, sh(STONE, 0.02)); gr.addColorStop(1, sh(STONE, -0.42));
  g.fillStyle = gr; g.fillRect(x - w / 2, y - h + 10, w, h - 18);
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1; for (let i = 1; i < 5; i++) { const xx = x - w / 2 + w * i / 5; g.beginPath(); g.moveTo(xx, y - h + 14); g.lineTo(xx, y - 10); g.stroke(); }   // каннелюры
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.2; g.strokeRect(x - w / 2, y - h + 10, w, h - 18);
  // база: две ступени
  block(g, x - w / 2 - 3, y - 12, w + 6, 6, STONE, -0.06); block(g, x - w / 2 - 6, y - 7, w + 12, 7, STONE, -0.14);
  // капитель: кольцо, плита, знак
  block(g, x - w / 2 - 3, y - h + 6, w + 6, 5, STONE, 0.08); block(g, x - w / 2 - 7, y - h - 2, w + 14, 8, STONE, 0.18);
  for (let i = 1; i <= rings; i++) { const yy = y - h * i / (rings + 1); const br = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0); br.addColorStop(0, '#6a5a2a'); br.addColorStop(0.3, '#c8a850'); br.addColorStop(1, '#5a4a20'); g.fillStyle = br; g.fillRect(x - w / 2 - 2, yy - 3, w + 4, 6); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x - w / 2 - 2, yy + 2, w + 4, 1.5); }
  glyph(g, x, y - h + 24, 5, 'rgba(192,172,92,.7)');
  g.fillStyle = 'rgba(78,122,58,.6)'; for (const [dx, dy, rr] of [[-w * 0.3, -9, 5], [w * 0.25, -8, 4], [0, -16, 3]]) { g.beginPath(); g.ellipse(x + dx, y + dy, rr, rr * 0.6, 0, 0, TAU); g.fill(); }
}
/** Пламя слоями: наружный оранжевый, средний жёлтый, ядро белое; k — размер, ph — фаза. Несколько язычков. */
function flames(g, x, y, k, t, tongues = 3) {
  for (let i = 0; i < tongues; i++) {
    const ox = (i - (tongues - 1) / 2) * 7 * k, ph = t * 9 + i * 2.1, f = Math.sin(ph) * 3 * k, f2 = Math.cos(ph * 0.7) * 2 * k, H = (26 + Math.sin(ph * 1.3) * 5) * k * (i === Math.floor(tongues / 2) ? 1.25 : 0.85), w = 9 * k;
    for (const [col, kk] of [['#ff6a14', 1], ['#ffa83a', 0.68], ['#fff2b8', 0.36]]) { g.fillStyle = col; g.beginPath(); g.moveTo(x + ox - w * kk, y); g.quadraticCurveTo(x + ox - w * kk * 0.5 + f * kk, y - H * kk * 0.55, x + ox + f2 * kk, y - H * kk); g.quadraticCurveTo(x + ox + w * kk * 0.5 - f * kk * 0.4, y - H * kk * 0.5, x + ox + w * kk, y); g.closePath(); g.fill(); }
  }
}
/** Искры и дым над огнём — по времени, без состояния. */
function sparks(g, x, y, t, n = 7, h = 60, seed = 3) {
  const r = rnd(seed);
  for (let i = 0; i < n; i++) { const sp = 0.6 + r() * 0.8, ph = ((t * sp + r() * 10) % 1.4) / 1.4, px = x + (r() - 0.5) * 20 + Math.sin(ph * 9 + i) * 6, py = y - ph * h - 10; g.fillStyle = `rgba(255,${180 - ph * 120 | 0},60,${(1 - ph) * 0.9})`; g.fillRect(px, py, 1.6, 1.6); }
  for (let i = 0; i < 3; i++) { const ph = ((t * 0.35 + i * 0.33) % 1), R = 8 + ph * 16; g.fillStyle = `rgba(60,56,52,${0.22 * (1 - ph)})`; g.beginPath(); g.arc(x + Math.sin(ph * 4 + i) * 8 + 6, y - 30 - ph * 70, R, 0, TAU); g.fill(); }
}
/** Тёплый дрожащий свет на полу вокруг огня. */
function fireLight(g, x, y, R, t, a = 0.4) {
  const fl = 1 + Math.sin(t * 13) * 0.05 + Math.sin(t * 7.3) * 0.04, gl = g.createRadialGradient(x, y, 2, x, y, R * fl);
  gl.addColorStop(0, `rgba(255,190,100,${a})`); gl.addColorStop(0.45, `rgba(255,150,70,${a * 0.4})`); gl.addColorStop(1, 'rgba(255,150,70,0)');
  g.save(); g.globalCompositeOperation = 'lighter'; g.scale(1, 0.55); g.fillStyle = gl; g.beginPath(); g.arc(x, y / 0.55, R * fl, 0, TAU); g.fill(); g.restore();
}
/** Костёр возрождения: кольцо камней, поленья со срезами, угли, пламя, искры, свет. */
export function restFire(g, x, y, t) {
  fireLight(g, x, y - 2, 170, t, 0.5);
  glyph(g, x, y + 2, 30, 'rgba(184,168,96,.28)');
  const r = rnd(7);
  for (let i = 0; i < 11; i++) { const a = i / 11 * TAU + 0.2, px = x + Math.cos(a) * 24, py = y + Math.sin(a) * 11, sw = 5 + r() * 3, shh = 3.5 + r() * 2; if (Math.sin(a) < 0) { g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(px + 1, py + 1.5, sw + 1, shh * 0.6, 0, 0, TAU); g.fill(); hp(g, () => g.ellipse(px, py, sw, shh, a * 0.3, 0, TAU), sh(STONE_D, 0.05 + r() * 0.12), 1); g.fillStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.ellipse(px - sw * 0.3, py - shh * 0.35, sw * 0.4, shh * 0.3, 0, 0, TAU); g.fill(); } }
  // угли
  g.fillStyle = '#3a1a0a'; g.beginPath(); g.ellipse(x, y - 1, 15, 6, 0, 0, TAU); g.fill();
  for (let i = 0; i < 9; i++) { const px = x + (r() - 0.5) * 22, py = y - 2 + (r() - 0.5) * 7, pul = 0.5 + 0.5 * Math.sin(t * 5 + i * 1.7); g.fillStyle = `rgba(255,${90 + pul * 90 | 0},20,${0.6 + pul * 0.4})`; g.beginPath(); g.arc(px, py, 1.4 + r(), 0, TAU); g.fill(); }
  // поленья: два накрест, срезы с кольцами
  for (const [a, dx, dy] of [[-0.35, -3, -2], [0.45, 2, -4]]) { g.save(); g.translate(x + dx, y + dy); g.rotate(a); hp(g, () => g.roundRect(-16, -3.5, 32, 7, 3), '#4a3222', 1); g.fillStyle = '#5c3e2a'; g.fillRect(-15, -3, 30, 2); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 0.8; for (let k = -12; k < 14; k += 6) { g.beginPath(); g.moveTo(k, -3); g.lineTo(k + 2, 3); g.stroke(); } hp(g, () => g.ellipse(16, 0, 2.6, 3.5, 0, 0, TAU), '#c8a070', 1); g.strokeStyle = '#8a6a40'; g.lineWidth = 0.6; g.beginPath(); g.ellipse(16, 0, 1.4, 2, 0, 0, TAU); g.stroke(); g.restore(); }
  // стоящие поленья (шалашиком) за огнём
  for (const sx of [-1, 1]) { g.save(); g.translate(x + sx * 7, y - 6); g.rotate(sx * 0.5); hp(g, () => g.roundRect(-3, -18, 6, 20, 2), '#3e2a1c', 1); g.restore(); }
  flames(g, x, y - 4, 1.15, t, 3);
  for (const sx of [-1, 1]) { g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(x + sx * 12, y + 3, 10, 3, 0, 0, TAU); g.fill(); }   // камни спереди над огнём — чтобы было видно глубину
  for (let i = 0; i < 11; i++) { const a = i / 11 * TAU + 0.2; if (Math.sin(a) < 0) continue; const px = x + Math.cos(a) * 24, py = y + Math.sin(a) * 11, sw = 5 + r() * 3, shh = 3.5 + r() * 2; hp(g, () => g.ellipse(px, py, sw, shh, a * 0.3, 0, TAU), sh(STONE_D, 0.1 + r() * 0.12), 1); g.fillStyle = 'rgba(255,170,90,.25)'; g.beginPath(); g.ellipse(px, py - shh * 0.4, sw * 0.6, shh * 0.35, 0, 0, TAU); g.fill(); }
  sparks(g, x, y - 20, t, 8, 70, 5);
}
/** Жаровня: кованая чаша на трёх ножках, угли, пламя, свет. */
export function brazier(g, x, y, t, lit = true) {
  if (lit) fireLight(g, x, y, 90, t, 0.32);
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(x + 3, y + 1, 14, 4.5, 0, 0, TAU); g.fill();
  for (const dx of [-9, 0, 9]) { g.strokeStyle = '#2a2622'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(x + dx * 0.5, y - 20); g.lineTo(x + dx, y - 1); g.stroke(); g.fillStyle = '#3a3430'; g.beginPath(); g.arc(x + dx, y - 1, 2, 0, TAU); g.fill(); }
  const bg = g.createLinearGradient(x - 13, 0, x + 13, 0); bg.addColorStop(0, '#5a5048'); bg.addColorStop(0.4, '#3a3430'); bg.addColorStop(1, '#1e1a18');
  hp(g, () => { g.moveTo(x - 13, y - 24); g.quadraticCurveTo(x, y - 8, x + 13, y - 24); g.closePath(); }, bg, 1);
  hp(g, () => g.ellipse(x, y - 24, 13, 4.5, 0, 0, TAU), '#4a4038', 1); g.fillStyle = '#2a1a0a'; g.beginPath(); g.ellipse(x, y - 24, 10, 3, 0, 0, TAU); g.fill();
  g.fillStyle = '#5a5048'; for (const dx of [-8, 0, 8]) { g.beginPath(); g.arc(x + dx, y - 20, 1.1, 0, TAU); g.fill(); }   // заклёпки
  if (!lit) return;
  const r = rnd(x | 0); for (let i = 0; i < 6; i++) { const pul = 0.5 + 0.5 * Math.sin(t * 6 + i * 2); g.fillStyle = `rgba(255,${100 + pul * 80 | 0},30,.9)`; g.beginPath(); g.arc(x + (r() - 0.5) * 14, y - 25 + (r() - 0.5) * 3, 1.2 + r(), 0, TAU); g.fill(); }
  flames(g, x, y - 26, 0.75, t, 3); sparks(g, x, y - 40, t, 4, 50, x | 0);
}
/** Сундук окованный: доски с волокном, железные полосы с заклёпками, замок; открытый — крышка поднята, внутри сияние и монеты. */
export function chest(g, x, y, open = false) {
  g.fillStyle = 'rgba(0,0,0,.32)'; g.beginPath(); g.ellipse(x + 3, y + 1, 22, 6, 0, 0, TAU); g.fill();
  const W2 = 36, H = 20, D = 9, wood = '#6e4a2a', iron = '#4a4642';
  const plank = (px, py, pw, ph, col) => { g.fillStyle = col; g.fillRect(px, py, pw, ph); g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 0.7; for (let k = 2; k < pw; k += 6 + (k % 5)) { g.beginPath(); g.moveTo(px + k, py + 1); g.quadraticCurveTo(px + k + 1.5, py + ph / 2, px + k, py + ph - 1); g.stroke(); } };
  // корпус: передняя стенка из трёх досок, боковая грань темнее
  for (let i = 0; i < 3; i++) plank(x - W2 / 2, y - H + i * (H / 3), W2, H / 3, sh(wood, i === 1 ? 0.06 : -0.04));
  g.fillStyle = sh(wood, -0.35); g.beginPath(); g.moveTo(x + W2 / 2, y - H); g.lineTo(x + W2 / 2 + D * 0.5, y - H - D * 0.4); g.lineTo(x + W2 / 2 + D * 0.5, y - D * 0.4); g.lineTo(x + W2 / 2, y); g.closePath(); g.fill();
  // полосы и заклёпки
  for (const bx of [x - W2 / 2 + 5, x + W2 / 2 - 8]) { g.fillStyle = iron; g.fillRect(bx, y - H, 3.5, H); g.fillStyle = '#8a857e'; g.fillRect(bx, y - H, 1, H); g.fillStyle = '#c8c2b8'; for (const ry of [y - H + 3, y - H / 2, y - 3]) { g.beginPath(); g.arc(bx + 1.8, ry, 0.9, 0, TAU); g.fill(); } }
  g.fillStyle = iron; g.fillRect(x - W2 / 2, y - 2, W2, 2);
  // крышка: выпуклая
  const ly = open ? y - H - 12 : y - H;
  g.save(); if (open) { g.translate(x, ly); g.scale(1, 0.55); g.translate(-x, -ly); }
  const lg = g.createLinearGradient(0, ly - D - 6, 0, ly); lg.addColorStop(0, sh(wood, 0.22)); lg.addColorStop(1, sh(wood, -0.1));
  hp(g, () => { g.moveTo(x - W2 / 2 - 1, ly); g.quadraticCurveTo(x - W2 / 2 - 1, ly - D - 6, x - W2 / 2 + 8, ly - D - 6); g.lineTo(x + W2 / 2 - 8, ly - D - 6); g.quadraticCurveTo(x + W2 / 2 + 1, ly - D - 6, x + W2 / 2 + 1, ly); g.closePath(); }, lg, 1.1);
  for (const bx of [x - W2 / 2 + 5, x + W2 / 2 - 8]) { g.fillStyle = iron; g.fillRect(bx, ly - D - 5, 3.5, D + 5); g.fillStyle = '#8a857e'; g.fillRect(bx, ly - D - 5, 1, D + 5); }
  g.fillStyle = iron; g.fillRect(x - W2 / 2 - 1, ly - 2, W2 + 2, 2.5);
  g.restore();
  // замок
  hp(g, () => g.roundRect(x - 4, y - H - 2, 8, 9, 1.5), '#c8a040', 0.8); g.fillStyle = '#2a2018'; g.beginPath(); g.arc(x, y - H + 1.5, 1.2, 0, TAU); g.fill(); g.fillRect(x - 0.5, y - H + 2, 1, 2.5);
  if (open) { const gl = g.createRadialGradient(x, y - H, 1, x, y - H, 26); gl.addColorStop(0, 'rgba(255,230,150,.7)'); gl.addColorStop(1, 'rgba(255,230,150,0)'); g.fillStyle = gl; g.fillRect(x - 26, y - H - 26, 52, 40); g.fillStyle = '#e8c040'; for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(x - 12 + i * 4, y - H - 1 + (i % 2) * 2, 2.6, 1.3, 0, 0, TAU); g.fill(); } }
}
/** Проём в стене: арка из клиновых камней, косяки, тьма внутри; закрытый — двустворчатая дверь с железом. */
export function doorway(g, x, y, w, h, open = true) {
  const ry = w / 2;
  hp(g, () => { g.moveTo(x - w / 2 - 9, y); g.lineTo(x - w / 2 - 9, y - h + ry); g.arc(x, y - h + ry, w / 2 + 9, Math.PI, 0); g.lineTo(x + w / 2 + 9, y); g.closePath(); }, sh(STONE, -0.3), 1.2);
  for (let i = 0; i < 9; i++) { const a0 = Math.PI + i * Math.PI / 9, a1 = a0 + Math.PI / 9 - 0.03; g.fillStyle = sh(STONE_L, (i % 2) * 0.12 - 0.1); g.beginPath(); g.arc(x, y - h + ry, w / 2 + 9, a0, a1); g.arc(x, y - h + ry, w / 2, a1, a0, true); g.closePath(); g.fill(); g.strokeStyle = JOINT; g.lineWidth = 1; g.stroke(); }
  for (const sx of [-1, 1]) for (let yy = y - h + ry; yy < y; yy += 16) block(g, x + sx * w / 2 + (sx < 0 ? -9 : 0), yy, 9, Math.min(16, y - yy), STONE_L, -0.05);
  if (open) { const dg = g.createLinearGradient(0, y - h, 0, y); dg.addColorStop(0, '#080c08'); dg.addColorStop(1, '#16221a'); hp(g, () => { g.moveTo(x - w / 2, y); g.lineTo(x - w / 2, y - h + ry); g.arc(x, y - h + ry, w / 2, Math.PI, 0); g.lineTo(x + w / 2, y); g.closePath(); }, dg, 0); return; }
  // дверь: доски, полосы, кольца
  g.save(); g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x - w / 2, y - h + ry); g.arc(x, y - h + ry, w / 2, Math.PI, 0); g.lineTo(x + w / 2, y); g.closePath(); g.clip();
  const wd = '#4e3620'; g.fillStyle = wd; g.fillRect(x - w / 2, y - h, w, h);
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; for (let k = -w / 2 + 8; k < w / 2; k += 9) { g.beginPath(); g.moveTo(x + k, y - h); g.lineTo(x + k, y); g.stroke(); }
  g.fillStyle = '#2a1e12'; g.fillRect(x - 1.5, y - h, 3, h);
  for (const yy of [y - h * 0.78, y - h * 0.5, y - h * 0.22]) { g.fillStyle = '#3a3632'; g.fillRect(x - w / 2, yy - 3, w, 6); g.fillStyle = '#7a756e'; g.fillRect(x - w / 2, yy - 3, w, 1.2); g.fillStyle = '#b8b2a8'; for (let k = -w / 2 + 6; k < w / 2; k += 12) { g.beginPath(); g.arc(x + k, yy, 1.3, 0, TAU); g.fill(); } }
  for (const sx of [-1, 1]) { g.strokeStyle = '#8a857e'; g.lineWidth = 2; g.beginPath(); g.arc(x + sx * 12, y - h * 0.42, 5, 0, TAU); g.stroke(); }
  g.restore();
}
/** Пол: плиты разного размера с фаской, щели, трещины, мох по углам, лужи с бликом, стёртая середина. */
export function floor(g, x, y, w, h, seed = 1, big = 48, mark = true) {
  const r = rnd(seed); g.fillStyle = '#2a2e28'; g.fillRect(x, y, w, h);
  for (let yy = y; yy < y + h; yy += big) for (let xx = x; xx < x + w; xx += big) {
    const v = r(), base = sh(FLOOR, (r() - 0.5) * 0.16 + (v < 0.25 ? 0.08 : 0)), ww = Math.min(big, x + w - xx), hh = Math.min(big, y + h - yy);
    if (v < 0.3) { const hb = big / 2; for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) { const px = xx + a * hb, py = yy + b * hb, pw = Math.min(hb, x + w - px), ph = Math.min(hb, y + h - py); if (pw > 2 && ph > 2) block(g, px + 1, py + 1, pw - 2, ph - 2, sh(base, (r() - 0.5) * 0.1)); } }
    else block(g, xx + 1.5, yy + 1.5, ww - 3, hh - 3, base);
    if (v > 0.9) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(xx + 2, yy + 2, ww - 4, hh - 4); }   // просевшая плита
  }
  // трещины
  g.strokeStyle = 'rgba(14,16,12,.7)'; g.lineWidth = 1.1;
  for (let i = 0; i < w * h / 12000; i++) { let px = x + r() * w, py = y + r() * h; g.beginPath(); g.moveTo(px, py); for (let k = 0; k < 4; k++) { px += (r() - 0.5) * 24; py += (r() - 0.5) * 18; g.lineTo(px, py); } g.stroke(); }
  // мох по углам и у стен
  g.fillStyle = 'rgba(78,122,58,.5)'; for (let i = 0; i < w * h / 9000; i++) { const nearWall = r() < 0.6, px = nearWall ? (r() < 0.5 ? x + r() * 30 : x + w - r() * 30) : x + r() * w, py = nearWall && r() < 0.5 ? y + r() * 26 : y + r() * h; g.beginPath(); g.ellipse(px, py, 6 + r() * 12, 3 + r() * 6, r() * 3, 0, TAU); g.fill(); }
  // лужи с бликом
  for (let i = 0; i < w * h / 30000; i++) { const px = x + 30 + r() * (w - 60), py = y + 30 + r() * (h - 60), rx = 10 + r() * 16, ry = rx * 0.45; g.fillStyle = 'rgba(40,70,80,.55)'; g.beginPath(); g.ellipse(px, py, rx, ry, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(190,230,230,.25)'; g.beginPath(); g.ellipse(px - rx * 0.3, py - ry * 0.3, rx * 0.35, ry * 0.3, 0, 0, TAU); g.fill(); }
  // стёртая дорожка посередине
  const wg = g.createRadialGradient(x + w / 2, y + h / 2, 10, x + w / 2, y + h / 2, Math.max(w, h) * 0.55); wg.addColorStop(0, 'rgba(255,245,220,.10)'); wg.addColorStop(1, 'rgba(255,245,220,0)'); g.fillStyle = wg; g.fillRect(x, y, w, h);
  if (mark && w > 160 && h > 160) { const cx = x + w / 2, cy = y + h / 2; g.strokeStyle = 'rgba(184,168,96,.3)'; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, cy, Math.min(w, h) * 0.3, Math.min(w, h) * 0.17, 0, 0, TAU); g.stroke(); glyph(g, cx, cy, 14, 'rgba(184,168,96,.4)'); }
}

// ======================================================== внутренность храма — пол комнат и стены по их краям
export const WALL_H = 130;   // высота дальней (северной) стены
const SIDE_W = 20, TOP_H = 26;
function roomsPath(g, R) { for (const q of R) g.rect(q.x0, q.y0, q.x1 - q.x0, q.y1 - q.y0); }
/** Проёмы между комнатами: отрезки общих границ (для косяков). */
function openings(R) {
  const out = [];
  for (let i = 0; i < R.length; i++) for (let j = 0; j < R.length; j++) { if (i === j) continue; const a = R[i], b = R[j];
    if (Math.abs(a.y1 - b.y0) < 1 && a.x0 < b.x1 && b.x0 < a.x1) out.push({ h: true, y: a.y1, x0: Math.max(a.x0, b.x0), x1: Math.min(a.x1, b.x1) });
    if (Math.abs(a.x1 - b.x0) < 1 && a.y0 < b.y1 && b.y0 < a.y1) out.push({ h: false, x: a.x1, y0: Math.max(a.y0, b.y0), y1: Math.min(a.y1, b.y1) }); }
  return out;
}
/** Кусок подземелья в мировых координатах (g уже переведён). Скала, стены всех комнат в кадре, затем полы, проёмы, свет. */
export function interior(g, W, x0, y0, CW, CH) {
  const ALL = W.rooms, R = ALL.filter(q => q.x1 + SIDE_W + 60 > x0 && q.x0 - SIDE_W - 60 < x0 + CW && q.y1 + TOP_H + 60 > y0 && q.y0 - WALL_H - 60 < y0 + CH);
  // скала: тёмная, с гранями
  g.fillStyle = '#121611'; g.fillRect(x0, y0, CW, CH);
  const r = rnd(x0 * 7 + y0 * 13 + 1); for (let i = 0; i < 50; i++) { const px = x0 + r() * CW, py = y0 + r() * CH, s = 12 + r() * 34; g.fillStyle = `rgba(70,80,66,${0.12 + r() * 0.16})`; g.beginPath(); g.moveTo(px, py); g.lineTo(px + s, py + s * 0.3); g.lineTo(px + s * 0.7, py + s); g.lineTo(px - s * 0.2, py + s * 0.6); g.closePath(); g.fill(); }
  if (!R.length) return;
  const torches = [];
  // стены (всё, что не пол, потом накрывается полами)
  for (const q of R) {
    const w = q.x1 - q.x0;
    blocks(g, q.x0 - SIDE_W, q.y0 - WALL_H, w + SIDE_W * 2, WALL_H, STONE, (q.x0 * 3 + q.y0) | 0, 26);   // дальняя стена лицом
    block(g, q.x0 - SIDE_W, q.y0 - 14, w + SIDE_W * 2, 14, STONE_D, -0.05);                               // цоколь
    block(g, q.x0 - SIDE_W - 4, q.y0 - WALL_H - 12, w + SIDE_W * 2 + 8, 7, STONE_L, 0.05); block(g, q.x0 - SIDE_W - 2, q.y0 - WALL_H - 5, w + SIDE_W * 2 + 4, 5, STONE, 0.1);   // карниз в две ступени
    const n = Math.max(1, Math.round(w / 190)); for (let i = 0; i <= n; i++) { const x = q.x0 + w * i / n; pilaster(g, Math.max(q.x0 - SIDE_W + 10, Math.min(q.x1 + SIDE_W - 10, x)), q.y0 - 14, WALL_H - 26); if (i < n && q.name) torches.push([q.x0 + w * (i + 0.5) / n, q.y0 - WALL_H * 0.52]); }
    for (const x of [q.x0 - SIDE_W, q.x1]) {   // боковые стены — верх с кладкой
      g.fillStyle = JOINT; g.fillRect(x, q.y0 - WALL_H - 12, SIDE_W, q.y1 - q.y0 + WALL_H + 12 + TOP_H);
      for (let yy = q.y0 - WALL_H - 12; yy < q.y1 + TOP_H; yy += 30) block(g, x + 1, yy + 1, SIDE_W - 2, Math.min(30, q.y1 + TOP_H - yy) - 2, STONE_D, 0.1);
      g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x === q.x1 ? x : x + SIDE_W - 4, q.y0 - WALL_H, 4, q.y1 - q.y0 + WALL_H + TOP_H);
    }
    g.fillStyle = JOINT; g.fillRect(q.x0 - SIDE_W, q.y1, w + SIDE_W * 2, TOP_H);   // ближняя стена — верх
    for (let xx = q.x0 - SIDE_W; xx < q.x1 + SIDE_W; xx += 44) block(g, xx + 1, q.y1 + 1, Math.min(44, q.x1 + SIDE_W - xx) - 2, TOP_H - 2, STONE_D, 0.12);
    g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(q.x0 - SIDE_W, q.y1 + TOP_H - 5, w + SIDE_W * 2, 5);
  }
  // полы
  for (const q of R) floor(g, q.x0, q.y0, q.x1 - q.x0, q.y1 - q.y0, (q.x0 + q.y0 * 7) | 0, 48, !!q.name);
  // тени от стен на пол: слева у левой стены и под дальней
  for (const q of R) { let sg = g.createLinearGradient(q.x0, 0, q.x0 + 26, 0); sg.addColorStop(0, 'rgba(0,0,0,.35)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sg; g.fillRect(q.x0, q.y0, 26, q.y1 - q.y0);
    sg = g.createLinearGradient(0, q.y0, 0, q.y0 + 30); sg.addColorStop(0, 'rgba(0,0,0,.4)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sg; g.fillRect(q.x0, q.y0, q.x1 - q.x0, 30);
    sg = g.createLinearGradient(q.x1 - 14, 0, q.x1, 0); sg.addColorStop(0, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(0,0,0,.25)'); g.fillStyle = sg; g.fillRect(q.x1 - 14, q.y0, 14, q.y1 - q.y0); }
  // знаки, факелы и мох на дальних стенах — только там, где стена видна (не накрыта полом соседней комнаты)
  g.save(); g.beginPath(); roomsPath(g, ALL); g.rect(x0 - 3000, y0 - 3000, CW + 6000, CH + 6000); g.clip('evenodd');
  for (const q of R) { const w = q.x1 - q.x0, n = Math.max(1, Math.round(w / 190)); for (let i = 0; i < n; i++) glyph(g, q.x0 + w * (i + 0.5) / n, q.y0 - WALL_H * 0.78, 11, 'rgba(192,172,92,.55)'); mossEdge(g, q.x0 - SIDE_W, q.y0 - WALL_H - 12, w + SIDE_W * 2, q.x0 | 0, Math.ceil(w / 50)); mossEdge(g, q.x0 - SIDE_W, q.y0 - 14, w + SIDE_W * 2, q.y0 | 0, Math.ceil(w / 60), true); }
  for (const [tx, ty] of torches) torchAt(g, tx, ty, 0);
  g.restore();
  // свет факелов на полу
  for (const [tx, ty] of torches) { const gl = g.createRadialGradient(tx, ty + WALL_H * 0.52, 4, tx, ty + WALL_H * 0.52, 120); gl.addColorStop(0, 'rgba(255,170,80,.22)'); gl.addColorStop(1, 'rgba(255,170,80,0)'); g.save(); g.beginPath(); roomsPath(g, ALL); g.clip(); g.fillStyle = gl; g.fillRect(tx - 120, ty, 240, 150); g.restore(); }
  // косяки у проёмов между комнатами
  for (const o of openings(ALL)) {
    if (o.h) { for (const px of [o.x0, o.x1]) { const sx = px === o.x0 ? -1 : 1; block(g, px + (sx < 0 ? -SIDE_W : 0), o.y - 10, SIDE_W, 20, STONE_L, 0.05); } }
    else { for (const py of [o.y0, o.y1]) block(g, o.x - 10, py + (py === o.y0 ? -TOP_H : 0), 20, TOP_H, STONE_L, 0.05); }
  }
  // проёмы: наружу — тёмный проход в ближней стене со ступенями вниз; врата подземелья — запертые в дальней стене
  for (const d of W.Z.doors || []) {
    if (d.kind === 'out') { g.fillStyle = JOINT; g.fillRect(d.x - 46, d.y - 2, 92, TOP_H + 4); hp(g, () => g.rect(d.x - 40, d.y - 1, 80, TOP_H + 2), '#0a0e0a', 0); for (let i = 0; i < 4; i++) block(g, d.x - 34, d.y + 1 + i * 6, 68, 5, i % 2 ? STONE : STONE_L); for (const sx of [-1, 1]) block(g, d.x + sx * 46 - (sx < 0 ? 0 : 8), d.y - 12, 8, TOP_H + 14, STONE_L, 0.05); const gl = g.createLinearGradient(0, d.y - 40, 0, d.y); gl.addColorStop(0, 'rgba(120,200,150,0)'); gl.addColorStop(1, 'rgba(120,200,150,.2)'); g.fillStyle = gl; g.fillRect(d.x - 40, d.y - 40, 80, 40); }
    else if (d.kind === 'sealed') { if (W.sealed && W.sealed.size) { doorway(g, d.x, d.y, 84, 116, false); glyph(g, d.x, d.y - 130, 14, '#d0bc68'); g.fillStyle = 'rgba(224,184,64,.5)'; for (const sx of [-1, 1]) glyph(g, d.x + sx * 62, d.y - 60, 7, 'rgba(224,184,64,.6)'); } }   // v90: запечатано, пока не повержены трое
    else if (!d.open) { doorway(g, d.x, d.y, 84, 116, false); glyph(g, d.x, d.y - 130, 14, '#d0bc68'); }
  }
  // канавки с водой
  for (const [cx0, cy, cx1, w] of (W.Z.decor && W.Z.decor.channels) || []) channel(g, cx0, cy, cx1, w, 0);
}

// ---------------------------------------------------------------- v90: убранство залов боссов
/** Купель Жрицы: круглый каменный бортик, зелёная вода с рябью и пузырями, жабьи знаки по кругу. */
export function font(g, x, y, R, t = 0) {
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(x + 4, y + 4, R + 10, (R + 10) * 0.5, 0, 0, TAU); g.fill();
  hp(g, () => g.ellipse(x, y, R + 12, (R + 12) * 0.5, 0, 0, TAU), STONE_D, 1.4);
  hp(g, () => g.ellipse(x, y - 6, R + 12, (R + 12) * 0.5, 0, 0, TAU), STONE, 1.4);
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; glyph(g, x + Math.cos(a) * (R + 2), y - 6 + Math.sin(a) * (R + 2) * 0.5, 4, 'rgba(192,172,92,.6)'); }
  const wg = g.createRadialGradient(x, y - 6, 4, x, y - 6, R); wg.addColorStop(0, '#5a9a70'); wg.addColorStop(1, '#1e4a3e');
  hp(g, () => g.ellipse(x, y - 6, R - 4, (R - 4) * 0.5, 0, 0, TAU), wg, 1);
  const gl = g.createRadialGradient(x, y - 6, 2, x, y - 6, R * 1.6); gl.addColorStop(0, 'rgba(120,255,160,.22)'); gl.addColorStop(1, 'rgba(120,255,160,0)'); g.fillStyle = gl; g.fillRect(x - R * 1.6, y - 6 - R, R * 3.2, R * 1.6);
  g.strokeStyle = 'rgba(200,255,220,.35)'; g.lineWidth = 1.2; for (let i = 0; i < 3; i++) { const q = (t * 0.25 + i / 3) % 1; g.beginPath(); g.ellipse(x, y - 6, (R - 4) * q, (R - 4) * q * 0.5, 0, 0, TAU); g.stroke(); }
  const r = rnd(7); for (let i = 0; i < 6; i++) { const q = (t * 0.4 + r()) % 1, px = x + (r() - 0.5) * R * 1.2, py = y - 6 - q * 24 + (r() - 0.5) * R * 0.4; g.fillStyle = `rgba(180,255,200,${0.6 * (1 - q)})`; g.beginPath(); g.arc(px, py, 1.5 + r() * 2, 0, TAU); g.fill(); }
}
/** Трон Короля: каменное возвышение в три ступени, спинка с жабьим знаком, подлокотники. */
export function throne(g, x, y) {
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(x + 6, y + 6, 90, 26, 0, 0, TAU); g.fill();
  for (let i = 0; i < 3; i++) { const w = 150 - i * 30, h = 10; block(g, x - w / 2, y - i * h - h, w, h, i % 2 ? STONE : STONE_L, 0.05); }
  const by = y - 30;
  hp(g, () => { g.moveTo(x - 34, by); g.lineTo(x - 34, by - 96); g.quadraticCurveTo(x, by - 130, x + 34, by - 96); g.lineTo(x + 34, by); g.closePath(); }, STONE_D, 1.4);
  hp(g, () => { g.moveTo(x - 28, by - 6); g.lineTo(x - 28, by - 92); g.quadraticCurveTo(x, by - 120, x + 28, by - 92); g.lineTo(x + 28, by - 6); g.closePath(); }, '#5a3a3a', 1);
  glyph(g, x, by - 80, 11, '#e0b840');
  for (const sx of [-1, 1]) { hp(g, () => g.rect(x + sx * 40 - 8, by - 44, 16, 44), STONE, 1.2); hp(g, () => g.ellipse(x + sx * 40, by - 46, 10, 6, 0, 0, TAU), STONE_L, 1); }
  hp(g, () => g.rect(x - 28, by - 24, 56, 24), '#4a3030', 1);
  const gl = g.createRadialGradient(x, by - 80, 2, x, by - 80, 40); gl.addColorStop(0, 'rgba(224,184,64,.3)'); gl.addColorStop(1, 'rgba(224,184,64,0)'); g.fillStyle = gl; g.fillRect(x - 40, by - 120, 80, 80);
}
/** Портал наружу: каменная арка с жабьими знаками и зелёный вихрь внутри. */
export function portal(g, x, y, t = 0) {
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(x + 4, y + 4, 58, 16, 0, 0, TAU); g.fill();
  const W2 = 48, H = 110;
  const sw = g.createRadialGradient(x, y - H / 2, 4, x, y - H / 2, W2); sw.addColorStop(0, 'rgba(200,255,220,.95)'); sw.addColorStop(0.5, 'rgba(70,200,140,.85)'); sw.addColorStop(1, 'rgba(20,80,60,.9)');
  hp(g, () => { g.moveTo(x - W2, y); g.lineTo(x - W2, y - H + W2); g.arc(x, y - H + W2, W2, Math.PI, 0); g.lineTo(x + W2, y); g.closePath(); }, sw, 0);
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; for (let i = 0; i < 4; i++) { const a0 = t * 2 + i * 1.6; g.beginPath(); g.ellipse(x, y - H / 2, W2 * 0.7, H * 0.3, a0, 0, Math.PI * 1.2); g.stroke(); }
  for (const sx of [-1, 1]) { block(g, x + sx * (W2 + 8) - 8, y - H + W2 - 4, 16, H - W2 + 4, STONE, 0.05); for (let k = 0; k < 4; k++) block(g, x + sx * (W2 + 8) - 7, y - H + W2 + k * 24, 14, 22, k % 2 ? STONE_L : STONE, 0.05); }
  g.save(); g.beginPath(); g.arc(x, y - H + W2, W2 + 16, Math.PI, 0); g.arc(x, y - H + W2, W2, 0, Math.PI, true); g.closePath(); g.fillStyle = STONE; g.fill(); g.strokeStyle = O; g.lineWidth = 1.3; g.stroke(); g.restore();
  for (let i = 0; i < 5; i++) { const a = Math.PI + (i + 0.5) / 5 * Math.PI; glyph(g, x + Math.cos(a) * (W2 + 8), y - H + W2 + Math.sin(a) * (W2 + 8), 4, 'rgba(192,172,92,.7)'); }
  const gl = g.createRadialGradient(x, y - 20, 4, x, y - 20, 140); gl.addColorStop(0, 'rgba(120,255,180,.25)'); gl.addColorStop(1, 'rgba(120,255,180,0)'); g.fillStyle = gl; g.fillRect(x - 140, y - 160, 280, 200);
}
