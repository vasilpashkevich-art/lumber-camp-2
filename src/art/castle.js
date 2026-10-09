// Королевский замок столицы, фонтан, мощение, лестница, фонари (v58).
// Масштаб: 1 рост героя ≈ 55 единиц мира. Ворота замка 2,3 роста, замок 11–12 ростов в ширину.
// Начало координат у замка — середина фасада у земли (верх лестницы), y вверх отрицательный.
const O = '#24180f';
/** Огни ночью: окна, факелы, фонари — в координатах холста, чтобы дорисовать свет поверх ночной тени. */
export const LIGHTS = [];
const light = (g, x, y, w, h, r, kind) => { const m = g.getTransform(), sx = Math.hypot(m.a, m.b); LIGHTS.push({ x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f, w: w * sx, h: h * sx, r: r * sx, kind }); };
const rnd = s => () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
function hp(g, fn, fill, lw = 2) { g.beginPath(); fn(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = O; g.lineWidth = lw; g.stroke(); } }
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v * k))); return '#' + ((1 << 24) | (f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1); };

// ---------------------------------------------------------------- камень
/** Каменная кладка в прямоугольнике: ряды, сдвинутые швы, светлые и тёмные камни. */
export function masonry(g, x, y, w, h, base, seed, row = 13) {
  const r = rnd(seed);
  hp(g, () => g.rect(x, y, w, h), base, 0);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  for (let yy = y, i = 0; yy < y + h; yy += row, i++) {
    const off = (i % 2) * row;
    for (let xx = x - off; xx < x + w; xx += row * 2) {
      const v = r(); if (v < 0.22) { g.fillStyle = shade(base, 1.08); g.fillRect(xx + 1, yy + 1, row * 2 - 2, row - 2); } else if (v > 0.84) { g.fillStyle = shade(base, 0.9); g.fillRect(xx + 1, yy + 1, row * 2 - 2, row - 2); }
    }
  }
  g.strokeStyle = 'rgba(36,24,15,.22)'; g.lineWidth = 1;
  for (let yy = y + row, i = 1; yy < y + h; yy += row, i++) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.stroke(); }
  for (let yy = y, i = 0; yy < y + h; yy += row, i++) { const off = (i % 2) * row; for (let xx = x - off; xx < x + w; xx += row * 2) { g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx, yy + row); g.stroke(); } }
  // свет слева сверху, тень у земли
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, 'rgba(255,250,235,.10)'); gr.addColorStop(0.7, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(20,12,6,.22)');
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  g.restore();
}
/** Стена: кладка, цоколь, зубцы, обводка. style: square — прямые зубцы, swallow — «ласточкин хвост». */
export function wall(g, x, y, w, h, base, seed, style = 'square') {
  masonry(g, x, y, w, h, base, seed);
  hp(g, () => g.rect(x, y + h - 14, w, 14), shade(base, 0.82), 0);   // цоколь
  hp(g, () => g.rect(x, y, w, h), null, 2);
  merlons(g, x, y, w, base, style);
}
export function merlons(g, x, y, w, base, style = 'square', mw = 16, mh = 15, gap = 11) {
  hp(g, () => g.rect(x - 4, y - 6, w + 8, 8), shade(base, 1.06), 1.6);   // карниз
  const n = Math.max(2, Math.round((w + gap) / (mw + gap))), step = (w - mw) / (n - 1);
  for (let i = 0; i < n; i++) {
    const mx = x + i * step;
    if (style === 'swallow') hp(g, () => { g.moveTo(mx, y - 6); g.lineTo(mx, y - 6 - mh); g.lineTo(mx + mw * 0.32, y - 6 - mh - 5); g.lineTo(mx + mw * 0.5, y - 6 - mh + 3); g.lineTo(mx + mw * 0.68, y - 6 - mh - 5); g.lineTo(mx + mw, y - 6 - mh); g.lineTo(mx + mw, y - 6); g.closePath(); }, shade(base, 1.04), 1.6);
    else hp(g, () => g.rect(mx, y - 6 - mh, mw, mh), shade(base, 1.04), 1.6);
  }
}
/** Круглая башня: тело с объёмом, кладка, бойницы. Возвращает верх тела. */
export function roundTower(g, cx, y0, w, h, base, seed) {
  const x = cx - w / 2, top = y0 - h, bulge = w * 0.16;
  g.save(); g.beginPath(); g.moveTo(x, top); g.lineTo(x, y0); g.quadraticCurveTo(cx, y0 + bulge, x + w, y0); g.lineTo(x + w, top); g.closePath(); g.clip();
  masonry(g, x, top - 4, w, h + bulge + 4, base, seed, 12);
  const gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, 'rgba(255,250,235,.14)'); gr.addColorStop(0.35, 'rgba(255,250,235,0)'); gr.addColorStop(0.75, 'rgba(20,12,6,.12)'); gr.addColorStop(1, 'rgba(20,12,6,.34)');
  g.fillStyle = gr; g.fillRect(x, top - 4, w, h + bulge + 6); g.restore();
  hp(g, () => { g.moveTo(x, top); g.lineTo(x, y0); g.quadraticCurveTo(cx, y0 + bulge, x + w, y0); g.lineTo(x + w, top); }, null, 2);
  return top;
}
function slit(g, x, y, h = 16) { hp(g, () => g.roundRect(x - 2.5, y, 5, h, 2), '#1e1612', 1.2); }

// ---------------------------------------------------------------- крыши
export function cone(g, cx, y, w, h, col, t, flagCol) {
  const ew = w * 0.58;
  hp(g, () => { g.moveTo(cx - ew, y); g.lineTo(cx, y - h); g.lineTo(cx + ew, y); g.quadraticCurveTo(cx, y + 7, cx - ew, y); }, col, 2);
  hp(g, () => { g.moveTo(cx, y - h); g.lineTo(cx + ew, y); g.quadraticCurveTo(cx + ew * 0.5, y + 5, cx + ew * 0.1, y + 6); g.closePath(); }, shade(col, 0.72), 0);
  g.strokeStyle = 'rgba(36,24,15,.28)'; g.lineWidth = 1;   // ряды черепицы
  for (let k = 1; k < 6; k++) { const q = k / 6, yy = y - h + h * q, hw = ew * q; g.beginPath(); g.moveTo(cx - hw, yy + 2 * q); g.quadraticCurveTo(cx, yy + 6 * q, cx + hw, yy + 2 * q); g.stroke(); }
  hp(g, () => { g.moveTo(cx, y - h); g.lineTo(cx + ew, y); g.quadraticCurveTo(cx, y + 7, cx - ew, y); g.closePath(); }, null, 2);
  hp(g, () => g.arc(cx, y - h - 2, 3.5, 0, 7), '#e7c35a', 1.2);
  if (flagCol) flag(g, cx, y - h - 4, t, flagCol, 26);
}
/** Шатёр (высокая гранёная крыша). */
function tent(g, cx, y, w, h, col, t, top = 'gold') {
  const ew = w * 0.55;
  hp(g, () => { g.moveTo(cx - ew, y); g.lineTo(cx, y - h); g.lineTo(cx + ew, y); g.closePath(); }, col, 2);
  hp(g, () => { g.moveTo(cx, y - h); g.lineTo(cx + ew, y); g.lineTo(cx + ew * 0.3, y); g.closePath(); }, shade(col, 0.72), 0);
  g.strokeStyle = 'rgba(36,24,15,.35)'; g.lineWidth = 1.2; for (const k of [-0.5, 0, 0.5]) { g.beginPath(); g.moveTo(cx, y - h); g.lineTo(cx + ew * k, y); g.stroke(); }
  g.strokeStyle = 'rgba(255,250,235,.25)'; for (let k = 1; k < 5; k++) { const q = k / 5; g.beginPath(); g.moveTo(cx - ew * q, y - h + h * q); g.lineTo(cx + ew * q, y - h + h * q); g.stroke(); }
  hp(g, () => { g.moveTo(cx - ew, y); g.lineTo(cx, y - h); g.lineTo(cx + ew, y); g.closePath(); }, null, 2);
  if (top === 'gold') { hp(g, () => g.ellipse(cx, y - h - 5, 5, 6, 0, 0, 7), '#e7c35a', 1.2); hp(g, () => { g.moveTo(cx, y - h - 11); g.lineTo(cx, y - h - 26); }, null, 2); hp(g, () => { g.moveTo(cx - 6, y - h - 22); g.lineTo(cx + 6, y - h - 22); }, null, 2); }
}
/** Луковичный купол. */
function onion(g, cx, y, w, h, col) {
  const hw = w / 2;
  hp(g, () => g.rect(cx - hw * 0.62, y - h * 0.22, hw * 1.24, h * 0.24), shade('#e8e2d4', 0.95), 1.6); // барабан
  hp(g, () => { g.moveTo(cx - hw * 0.66, y - h * 0.22); g.bezierCurveTo(cx - hw * 1.25, y - h * 0.55, cx - hw * 0.2, y - h * 0.82, cx, y - h); g.bezierCurveTo(cx + hw * 0.2, y - h * 0.82, cx + hw * 1.25, y - h * 0.55, cx + hw * 0.66, y - h * 0.22); g.closePath(); }, col, 2);
  g.save(); g.beginPath(); g.moveTo(cx - hw * 0.66, y - h * 0.22); g.bezierCurveTo(cx - hw * 1.25, y - h * 0.55, cx - hw * 0.2, y - h * 0.82, cx, y - h); g.bezierCurveTo(cx + hw * 0.2, y - h * 0.82, cx + hw * 1.25, y - h * 0.55, cx + hw * 0.66, y - h * 0.22); g.closePath(); g.clip();
  g.fillStyle = 'rgba(255,255,230,.45)'; g.beginPath(); g.ellipse(cx - hw * 0.35, y - h * 0.5, hw * 0.16, h * 0.18, -0.3, 0, 7); g.fill();
  g.fillStyle = 'rgba(80,40,0,.25)'; g.beginPath(); g.ellipse(cx + hw * 0.55, y - h * 0.45, hw * 0.4, h * 0.35, 0, 0, 7); g.fill(); g.restore();
  hp(g, () => { g.moveTo(cx, y - h); g.lineTo(cx, y - h - 22); }, null, 2.2); hp(g, () => { g.moveTo(cx - 7, y - h - 15); g.lineTo(cx + 7, y - h - 15); }, null, 2.2);
}
/** Двускатная/вальмовая крыша над корпусом. */
function hipRoof(g, x, y, w, h, col) {
  const inset = w * 0.22;
  hp(g, () => { g.moveTo(x - 8, y); g.lineTo(x + inset, y - h); g.lineTo(x + w - inset, y - h); g.lineTo(x + w + 8, y); g.closePath(); }, col, 2);
  hp(g, () => { g.moveTo(x + w - inset, y - h); g.lineTo(x + w + 8, y); g.lineTo(x + w * 0.62, y); g.closePath(); }, shade(col, 0.74), 0);
  g.strokeStyle = 'rgba(36,24,15,.3)'; g.lineWidth = 1; for (let k = 1; k < 5; k++) { const q = k / 5, yy = y - h + h * q; g.beginPath(); g.moveTo(x + inset * (1 - q) - 8 * q, yy); g.lineTo(x + w - inset * (1 - q) + 8 * q, yy); g.stroke(); }
  hp(g, () => { g.moveTo(x - 8, y); g.lineTo(x + inset, y - h); g.lineTo(x + w - inset, y - h); g.lineTo(x + w + 8, y); g.closePath(); }, null, 2);
  hp(g, () => g.rect(x + inset, y - h - 3, w - inset * 2, 4), '#e7c35a', 1.2);
}

// ---------------------------------------------------------------- детали
function win(g, x, y, w, h, lit, frame = '#cfc6b0') {
  hp(g, () => { g.moveTo(x - 3, y + h + 3); g.lineTo(x - 3, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2 + 3, Math.PI, 0); g.lineTo(x + w + 3, y + h + 3); g.closePath(); }, frame, 1.4);
  hp(g, () => { g.moveTo(x, y + h); g.lineTo(x, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w, y + h); g.closePath(); }, lit ? '#ffd36a' : '#2a2634', 1.2);
  if (lit) light(g, x, y, w, h, w * 2.2, 'win');
  if (lit) { const gr = g.createRadialGradient(x + w / 2, y + h / 2, 1, x + w / 2, y + h / 2, w * 2); gr.addColorStop(0, 'rgba(255,210,110,.35)'); gr.addColorStop(1, 'rgba(255,210,110,0)'); g.fillStyle = gr; g.fillRect(x - w * 1.5, y - w * 1.5, w * 4, h + w * 3); }
  else { g.fillStyle = 'rgba(160,190,230,.35)'; g.fillRect(x + 2, y + w / 2, 2.5, h - w / 2 - 2); }
  g.strokeStyle = O; g.lineWidth = 1.1; g.beginPath(); g.moveTo(x + w / 2, y + 2); g.lineTo(x + w / 2, y + h); g.moveTo(x, y + h * 0.55); g.lineTo(x + w, y + h * 0.55); g.stroke();
}
/** Ворота: арка из клиньев, двустворчатые двери с оковкой, поднятая решётка. */
export function gate(g, cx, y0, w, h, stone, wood = '#6b4326') {
  const x = cx - w / 2, ah = w / 2;
  // клинья арки
  const R1 = w / 2 + 14;
  hp(g, () => { g.moveTo(x - 14, y0); g.lineTo(x - 14, y0 - h + ah); g.arc(cx, y0 - h + ah, R1, Math.PI, 0); g.lineTo(x + w + 14, y0); g.closePath(); }, shade(stone, 1.12), 2);
  g.strokeStyle = 'rgba(36,24,15,.45)'; g.lineWidth = 1.2;
  for (let k = 0; k <= 9; k++) { const a = Math.PI + k * Math.PI / 9; g.beginPath(); g.moveTo(cx + Math.cos(a) * (w / 2), y0 - h + ah + Math.sin(a) * (w / 2)); g.lineTo(cx + Math.cos(a) * R1, y0 - h + ah + Math.sin(a) * R1); g.stroke(); }
  hp(g, () => { g.moveTo(cx - 7, y0 - h + ah - R1 - 2); g.lineTo(cx + 7, y0 - h + ah - R1 - 2); g.lineTo(cx + 5, y0 - h + ah - w / 2 + 2); g.lineTo(cx - 5, y0 - h + ah - w / 2 + 2); g.closePath(); }, '#e7c35a', 1.4); // замковый камень
  // проём и двери
  const door = () => { g.moveTo(x, y0); g.lineTo(x, y0 - h + ah); g.arc(cx, y0 - h + ah, w / 2, Math.PI, 0); g.lineTo(x + w, y0); g.closePath(); };
  hp(g, door, '#1a1210', 2);
  g.save(); g.beginPath(); door(); g.clip();
  for (const sd of [-1, 1]) {
    const dx = sd < 0 ? x : cx;
    hp(g, () => g.rect(dx + 1, y0 - h, w / 2 - 2, h), sd < 0 ? wood : shade(wood, 0.86), 1.4);
    g.strokeStyle = 'rgba(36,24,15,.45)'; g.lineWidth = 1; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(dx + k * w / 8, y0 - h); g.lineTo(dx + k * w / 8, y0); g.stroke(); }
    for (const by of [0.28, 0.62, 0.9]) { hp(g, () => g.rect(dx + 1, y0 - h * by - 3, w / 2 - 2, 6), '#4a4c50', 1); for (let k = 0; k < 4; k++) hp(g, () => g.arc(dx + 6 + k * (w / 2 - 12) / 3, y0 - h * by, 1.6, 0, 7), '#9aa3aa', 0.6); }
    hp(g, () => g.arc(cx + sd * 9, y0 - h * 0.45, 4.5, 0, 7), null, 1.6);  // кольца
  }
  // поднятая решётка в верхней части
  g.strokeStyle = '#3a3a40'; g.lineWidth = 3; for (let k = 1; k < 6; k++) { g.beginPath(); g.moveTo(x + k * w / 6, y0 - h - 10); g.lineTo(x + k * w / 6, y0 - h + ah * 0.55); g.stroke(); }
  g.beginPath(); g.moveTo(x, y0 - h + ah * 0.25); g.lineTo(x + w, y0 - h + ah * 0.25); g.stroke();
  g.restore();
  hp(g, door, null, 2.2);
}
function banner(g, x, y, w, h, col, t, emblem = 'crown') {
  const sw = Math.sin(t * 1.6 + x) * 1.5;
  hp(g, () => g.rect(x - w / 2 - 4, y - 3, w + 8, 4), '#6b4a2c', 1.2);
  hp(g, () => { g.moveTo(x - w / 2, y); g.lineTo(x + w / 2, y); g.lineTo(x + w / 2 + sw, y + h); g.lineTo(x + sw, y + h - 12); g.lineTo(x - w / 2 + sw, y + h); g.closePath(); }, col, 1.6);
  hp(g, () => { g.moveTo(x + w / 2 - 4, y); g.lineTo(x + w / 2, y); g.lineTo(x + w / 2 + sw, y + h); g.lineTo(x + w / 2 - 4 + sw, y + h - 2); g.closePath(); }, shade(col, 0.75), 0);
  g.strokeStyle = '#e7c35a'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x - w / 2 + 3, y + 3); g.lineTo(x + w / 2 - 3, y + 3); g.stroke();
  const ey = y + h * 0.4, ex = x + sw * 0.5;
  if (emblem === 'crown') hp(g, () => { g.moveTo(ex - 9, ey + 6); g.lineTo(ex - 9, ey - 4); g.lineTo(ex - 4.5, ey + 1); g.lineTo(ex, ey - 7); g.lineTo(ex + 4.5, ey + 1); g.lineTo(ex + 9, ey - 4); g.lineTo(ex + 9, ey + 6); g.closePath(); }, '#e7c35a', 1.2);
  else hp(g, () => { g.moveTo(ex, ey - 9); g.lineTo(ex + 8, ey); g.lineTo(ex, ey + 9); g.lineTo(ex - 8, ey); g.closePath(); }, '#e7c35a', 1.2);
}
function flag(g, x, y, t, col, len = 22) {
  hp(g, () => { g.moveTo(x, y); g.lineTo(x, y - 30); }, null, 2);
  const w = Math.sin(t * 4 + x * 0.1) * 3;
  hp(g, () => { g.moveTo(x, y - 30); g.quadraticCurveTo(x + len / 2, y - 34 + w, x + len, y - 26 + w); g.lineTo(x + len * 0.8, y - 22 + w * 0.6); g.quadraticCurveTo(x + len / 2, y - 18 + w, x, y - 18); g.closePath(); }, col, 1.4);
}
/** Настенный факел или жаровня. */
function torch(g, x, y, t, night) {
  hp(g, () => g.rect(x - 2, y, 4, 12), '#4a3020', 1); hp(g, () => g.rect(x - 4, y - 3, 8, 4), '#4a4c50', 1);
  const f = Math.sin(t * 9 + x) * 1.5;
  if (night) light(g, x, y - 8, 0, 0, 50, 'fire');
  if (night) { const gr = g.createRadialGradient(x, y - 6, 1, x, y - 6, 46); gr.addColorStop(0, 'rgba(255,170,70,.45)'); gr.addColorStop(1, 'rgba(255,170,70,0)'); g.fillStyle = gr; g.fillRect(x - 46, y - 52, 92, 92); }
  hp(g, () => { g.moveTo(x - 4, y - 3); g.quadraticCurveTo(x - 5, y - 12, x + f, y - 18); g.quadraticCurveTo(x + 5, y - 10, x + 4, y - 3); g.closePath(); }, '#ff9a2a', 1); hp(g, () => g.ellipse(x, y - 7, 2, 4, 0, 0, 7), '#ffe27a', 0);
}

// ---------------------------------------------------------------- замки
const PAL = {
  a: { stone: '#8d8a82', dark: '#76736b', roof: '#a8322a', banner: '#a8282a', flag: '#c43a2c', em: 'crown' },
  b: { stone: '#d8c8a4', dark: '#c2b28e', roof: '#2f5d9a', banner: '#2f4f8a', flag: '#e7c35a', em: 'crown' },
  c: { stone: '#ece6d8', dark: '#d8d0bf', roof: '#3f7a4a', banner: '#a8282a', flag: '#a8282a', em: 'rhomb', trim: '#b5523a' },
};
export const CASTLE_SIZE = { a: { w: 660, h: 480 }, b: { w: 700, h: 470 }, c: { w: 680, h: 500 } };

/** Замок: v — 'a' Твердыня, 'b' Дворец, 'c' Белый кремль. night — огни в окнах. */
export function castle(g, v, t = 0, night = false) {
  const P = PAL[v]; g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  // тень на земле
  g.fillStyle = 'rgba(20,12,6,.28)'; g.beginPath(); g.ellipse(14, 4, CASTLE_SIZE[v].w * 0.55, 30, 0, 0, 7); g.fill();
  if (v === 'a') fortress(g, P, t, night);
  else if (v === 'b') palace(g, P, t, night);
  else kremlin(g, P, t, night);
  g.restore();
}

function fortress(g, P, t, night) {
  // задняя высокая башня-донжон
  masonry(g, -60, -400, 120, 260, P.dark, 11); hp(g, () => g.rect(-60, -400, 120, 260), null, 2); merlons(g, -60, -400, 120, P.dark);
  for (const wx of [-34, 20]) win(g, wx, -370, 14, 26, night);
  cone(g, 0, -421, 150, 120, P.roof, t, P.flag);
  // боковые стены
  for (const sd of [-1, 1]) { const x = sd < 0 ? -300 : 140; wall(g, x, -230, 160, 230, P.stone, 20 + sd); for (const wx of [30, 100]) win(g, x + wx, -170, 16, 30, night); slit(g, x + 70, -90, 18); }
  // фланговые башни
  for (const sd of [-1, 1]) {
    const cx = sd * 300, top = roundTower(g, cx, 0, 120, 360, P.stone, 30 + sd);
    merlons(g, cx - 66, top, 132, P.stone);
    for (const yy of [-300, -220]) win(g, cx - 8, yy, 16, 28, night); slit(g, cx, -120, 20);
    cone(g, cx, top - 22, 170, 150, P.roof, t + sd, P.flag);
  }
  // центральный корпус с воротами
  wall(g, -140, -300, 280, 300, P.stone, 40);
  hp(g, () => g.rect(-140, -200, 280, 10), shade(P.stone, 0.9), 1.4);
  for (const wx of [-110, -60, 46, 96]) win(g, wx, -270, 16, 32, night);
  win(g, -14, -280, 28, 44, night, '#e7c35a');
  gate(g, 0, 0, 74, 126, P.stone);
  for (const sd of [-1, 1]) banner(g, sd * 92, -180, 34, 120, P.banner, t, P.em);
  for (const sd of [-1, 1]) torch(g, sd * 56, -100, t, night);
}

function palace(g, P, t, night) {
  // крылья
  for (const sd of [-1, 1]) {
    const x = sd < 0 ? -330 : 110;
    masonry(g, x, -250, 220, 250, P.stone, 50 + sd); hp(g, () => g.rect(x, -250, 220, 250), null, 2);
    hp(g, () => g.rect(x, -128, 220, 9), shade(P.stone, 0.88), 1.2);
    hipRoof(g, x, -250, 220, 70, P.roof);
    for (let k = 0; k < 4; k++) { win(g, x + 22 + k * 50, -220, 18, 40, night); win(g, x + 22 + k * 50, -100, 18, 40, night); }
    for (let k = 0; k < 5; k++) hp(g, () => g.rect(x + 8 + k * 50, -250, 6, 250), shade(P.stone, 1.08), 1); // пилястры
  }
  // угловые башни
  for (const sd of [-1, 1]) {
    const cx = sd * 345, top = roundTower(g, cx, 0, 96, 330, P.dark, 60 + sd);
    hp(g, () => g.rect(cx - 52, top - 6, 104, 10), '#e7c35a', 1.4);
    for (const yy of [-280, -200, -110]) win(g, cx - 8, yy, 16, 30, night);
    cone(g, cx, top - 4, 140, 150, P.roof, t + sd, P.flag);
  }
  // центральный корпус
  masonry(g, -120, -380, 240, 380, P.stone, 70); hp(g, () => g.rect(-120, -380, 240, 380), null, 2);
  for (const px of [-120, -70, 62, 112]) hp(g, () => g.rect(px, -380, 8, 380), shade(P.stone, 1.1), 1);
  hipRoof(g, -120, -380, 240, 90, P.roof);
  // шпиль
  hp(g, () => g.rect(-26, -520, 52, 60), P.stone, 2); win(g, -8, -508, 16, 30, night);
  cone(g, 0, -520, 70, 110, P.roof, t, P.flag);
  for (const wx of [-90, 64]) { win(g, wx, -340, 20, 44, night); win(g, wx, -240, 20, 44, night); }
  // большое окно-роза над балконом
  hp(g, () => g.arc(0, -300, 34, 0, 7), '#e7c35a', 2); hp(g, () => g.arc(0, -300, 27, 0, 7), night ? '#ffd36a' : '#3a4a7a', 1.4);
  g.strokeStyle = O; g.lineWidth = 1.2; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; g.beginPath(); g.moveTo(0, -300); g.lineTo(Math.cos(a) * 27, -300 + Math.sin(a) * 27); g.stroke(); }
  hp(g, () => g.arc(0, -300, 8, 0, 7), '#c43a2c', 1.2);
  // королевский балкон над воротами
  hp(g, () => g.rect(-70, -200, 140, 14), shade(P.stone, 1.1), 2);
  for (let k = 0; k <= 10; k++) hp(g, () => g.roundRect(-66 + k * 13, -232, 6, 32, 3), '#efe4c8', 1);
  hp(g, () => g.rect(-72, -238, 144, 7), shade(P.stone, 1.1), 1.6);
  hp(g, () => { g.moveTo(-22, -238); g.lineTo(-22, -270); g.arc(0, -270, 22, Math.PI, 0); g.lineTo(22, -238); g.closePath(); }, night ? '#ffd36a' : '#2a2634', 1.6);  // дверь на балкон
  gate(g, 0, 0, 84, 136, P.stone, '#5a3a22');
  for (const sd of [-1, 1]) banner(g, sd * 92, -186, 32, 130, P.banner, t, P.em);
  for (const sd of [-1, 1]) torch(g, sd * 62, -100, t, night);
}

function kremlin(g, P, t, night) {
  const trim = P.trim;
  // терем за стеной: корпус, купола
  masonry(g, -170, -390, 340, 200, P.stone, 80); hp(g, () => g.rect(-170, -390, 340, 200), null, 2);
  for (let k = 0; k < 6; k++) win(g, -150 + k * 56, -360, 18, 34, night, trim);
  hp(g, () => g.rect(-174, -396, 348, 10), trim, 1.6);
  hipRoof(g, -170, -396, 340, 60, P.roof);
  for (const sd of [-1, 1]) { hp(g, () => g.rect(sd * 110 - 22, -470, 44, 74), P.stone, 2); win(g, sd * 110 - 7, -460, 14, 26, night, trim); onion(g, sd * 110, -470, 56, 84, '#e7c35a'); }
  // крепостная стена с «ласточкиным хвостом»
  for (const sd of [-1, 1]) { const x = sd < 0 ? -300 : 100; wall(g, x, -200, 200, 200, P.stone, 90 + sd, 'swallow'); hp(g, () => g.rect(x, -104, 200, 8), trim, 1.2); for (const wx of [40, 140]) slit(g, x + wx, -70, 22); }
  // угловые башни с шатрами
  for (const sd of [-1, 1]) {
    const cx = sd * 300, x = cx - 60;
    masonry(g, x, -320, 120, 320, P.stone, 100 + sd); hp(g, () => g.rect(x, -320, 120, 320), null, 2);
    for (const yy of [-120, -220]) hp(g, () => g.rect(x, yy, 120, 8), trim, 1.2);
    merlons(g, x, -320, 120, P.stone, 'swallow');
    for (const yy of [-290, -190]) win(g, cx - 8, yy, 16, 28, night, trim); slit(g, cx, -90, 22);
    hp(g, () => g.rect(cx - 34, -380, 68, 50), P.stone, 2); win(g, cx - 7, -370, 14, 24, night, trim);
    tent(g, cx, -380, 96, 150, P.roof, t);
  }
  // надвратная башня
  masonry(g, -90, -340, 180, 340, P.stone, 120); hp(g, () => g.rect(-90, -340, 180, 340), null, 2);
  for (const yy of [-190, -270]) hp(g, () => g.rect(-90, yy, 180, 8), trim, 1.2);
  merlons(g, -90, -340, 180, P.stone, 'swallow');
  hp(g, () => g.rect(-50, -420, 100, 74), P.stone, 2); hp(g, () => g.rect(-50, -380, 100, 6), trim, 1);
  // часы-солнце
  hp(g, () => g.arc(0, -396, 20, 0, 7), '#2f4f8a', 1.6); g.strokeStyle = '#e7c35a'; g.lineWidth = 2; for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; g.beginPath(); g.moveTo(Math.cos(a) * 14, -396 + Math.sin(a) * 14); g.lineTo(Math.cos(a) * 18, -396 + Math.sin(a) * 18); g.stroke(); }
  hp(g, () => { g.moveTo(0, -396); g.lineTo(0, -410); }, null, 2); hp(g, () => g.arc(0, -396, 4, 0, 7), '#e7c35a', 1);
  tent(g, 0, -426, 120, 170, P.roof, t);
  for (const wx of [-56, 40]) win(g, wx, -250, 16, 32, night, trim);
  gate(g, 0, 0, 78, 128, P.stone, '#6b4326');
  hp(g, () => { g.moveTo(-58, -150); g.lineTo(0, -178); g.lineTo(58, -150); }, null, 3); // кокошник над воротами
  g.strokeStyle = trim; g.lineWidth = 3; g.beginPath(); g.moveTo(-56, -151); g.lineTo(0, -177); g.lineTo(56, -151); g.stroke();
  for (const sd of [-1, 1]) banner(g, sd * 74, -170, 26, 110, P.banner, t, P.em);
  for (const sd of [-1, 1]) torch(g, sd * 56, -96, t, night);
}

// ---------------------------------------------------------------- лестница, мощение, фонтан, фонари
/** Лестница вниз от фасада: n ступеней, ширина w наверху, расширяется к низу. Парапеты с вазами. */
export function stairs(g, w, n = 6, step = 14, stone = '#b9b3a6') {
  for (let i = 0; i < n; i++) {
    const ww = w + i * 10, y = i * step;
    hp(g, () => g.rect(-ww / 2, y, ww, step - 5), shade(stone, 1.06), 1.4);
    hp(g, () => g.rect(-ww / 2, y + step - 5, ww, 5), shade(stone, 0.78), 1.4);
  }
  const bw = w + n * 10;
  for (const sd of [-1, 1]) {
    const x0 = sd * (w / 2 + 2), x1 = sd * (bw / 2 + 4);
    hp(g, () => { g.moveTo(x0, -8); g.lineTo(x1, n * step - 6); g.lineTo(x1 + sd * 16, n * step - 6); g.lineTo(x0 + sd * 16, -8); g.closePath(); }, shade(stone, 0.92), 1.6);
    // постамент с чашей-жаровней
    const px = x1 + sd * 8, py = n * step;
    hp(g, () => g.rect(px - 16, py - 34, 32, 34), shade(stone, 0.95), 1.6); hp(g, () => g.rect(px - 19, py - 38, 38, 6), shade(stone, 1.1), 1.4);
    hp(g, () => { g.moveTo(px - 14, py - 38); g.quadraticCurveTo(px, py - 30, px + 14, py - 38); g.lineTo(px + 10, py - 46); g.lineTo(px - 10, py - 46); g.closePath(); }, '#5a5a62', 1.4);
  }
}
export function brazierFire(g, x, y, t, night) {
  if (night) light(g, x, y - 8, 0, 0, 80, 'fire');
  if (night) { const gr = g.createRadialGradient(x, y, 1, x, y, 70); gr.addColorStop(0, 'rgba(255,170,70,.5)'); gr.addColorStop(1, 'rgba(255,170,70,0)'); g.fillStyle = gr; g.fillRect(x - 70, y - 70, 140, 140); }
  for (let k = 0; k < 3; k++) { const f = Math.sin(t * 8 + k * 2) * 2; hp(g, () => { g.moveTo(x - 9 + k * 6, y); g.quadraticCurveTo(x - 8 + k * 6, y - 12, x - 6 + k * 6 + f, y - 20 - k % 2 * 4); g.quadraticCurveTo(x - 2 + k * 6, y - 8, x - 3 + k * 6, y); g.closePath(); }, k === 1 ? '#ffd36a' : '#ff8a2a', 1); }
}
/** Плиточное мощение прямоугольником: крупные плиты вразбежку, бордюр. */
export function paving(g, x, y, w, h, seed = 1, curb = true) {
  const r = rnd(seed), S = 26, cols = ['#b9b3a6', '#aea89a', '#c4beb0', '#a39d90'];
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  for (let yy = y, i = 0; yy < y + h; yy += S, i++) for (let xx = x - (i % 2) * S / 2; xx < x + w; xx += S) {
    g.fillStyle = cols[Math.floor(r() * 4)]; g.fillRect(xx, yy, S, S);
    g.strokeStyle = 'rgba(60,50,40,.45)'; g.lineWidth = 1.2; g.strokeRect(xx + 0.5, yy + 0.5, S - 1, S - 1);
    if (r() < 0.12) { g.strokeStyle = 'rgba(60,50,40,.3)'; g.beginPath(); g.moveTo(xx + 4, yy + 6); g.lineTo(xx + 12, yy + 14); g.stroke(); }
  }
  g.restore();
  if (curb) { g.strokeStyle = '#7f786c'; g.lineWidth = 7; g.strokeRect(x, y, w, h); g.strokeStyle = O; g.lineWidth = 1.2; g.strokeRect(x - 3.5, y - 3.5, w + 7, h + 7); }
}
/** Круглая площадь из колец плит вокруг (cx,cy), радиус R. */
export function roundPlaza(g, cx, cy, R, seed = 2) {
  const r = rnd(seed), cols = ['#b9b3a6', '#aea89a', '#c4beb0', '#a39d90'], S = 26;
  hp(g, () => g.arc(cx, cy, R + 6, 0, 7), '#7f786c', 1.4);
  for (let rr = R; rr > 0; rr -= S) {
    const n = Math.max(6, Math.round(2 * Math.PI * rr / S)), off = r() * 0.5;
    for (let k = 0; k < n; k++) {
      const a0 = (k + off) / n * Math.PI * 2, a1 = (k + 1 + off) / n * Math.PI * 2, ri = Math.max(0, rr - S);
      g.beginPath(); g.arc(cx, cy, rr, a0, a1); g.arc(cx, cy, ri, a1, a0, true); g.closePath();
      g.fillStyle = (rr / S | 0) % 4 === 1 ? '#9a8a6a' : cols[Math.floor(r() * 4)]; g.fill(); g.strokeStyle = 'rgba(60,50,40,.45)'; g.lineWidth = 1.2; g.stroke();
    }
  }
}
/** Фонтан: чаша, вода с рябью, столб с двумя чашами, струи. Начало — центр чаши на земле. */
export function fountain(g, t, R = 100) {
  const ry = R * 0.55, st = '#c9c2b2';
  g.fillStyle = 'rgba(20,12,6,.25)'; g.beginPath(); g.ellipse(6, 12, R + 16, ry + 12, 0, 0, 7); g.fill();
  // борт
  hp(g, () => { g.ellipse(0, 0, R + 10, ry + 8, 0, 0, Math.PI); g.lineTo(-R - 10, -22); g.ellipse(0, -22, R + 10, ry + 8, 0, Math.PI, 0, true); g.closePath(); }, shade(st, 0.85), 2);
  g.strokeStyle = 'rgba(36,24,15,.3)'; g.lineWidth = 1; for (let k = -5; k <= 5; k++) { const x = k / 6 * (R + 10); const yb = Math.sqrt(Math.max(0, 1 - (x / (R + 10)) ** 2)) * (ry + 8); g.beginPath(); g.moveTo(x, yb - 22); g.lineTo(x, yb); g.stroke(); }
  hp(g, () => g.ellipse(0, -22, R + 10, ry + 8, 0, 0, 7), st, 2);
  // вода
  hp(g, () => g.ellipse(0, -22, R - 2, ry - 4, 0, 0, 7), '#4f8fb0', 1.6);
  g.save(); g.beginPath(); g.ellipse(0, -22, R - 2, ry - 4, 0, 0, 7); g.clip();
  g.fillStyle = 'rgba(30,70,100,.35)'; g.beginPath(); g.ellipse(0, -14, R - 2, ry - 10, 0, 0, Math.PI); g.fill();
  g.strokeStyle = 'rgba(220,240,255,.55)'; g.lineWidth = 1.4;
  for (let k = 0; k < 3; k++) { const q = (t * 0.5 + k / 3) % 1, rr = 18 + q * (R - 22); g.globalAlpha = 1 - q; g.beginPath(); g.ellipse(0, -22, rr, rr * 0.55, 0, 0, 7); g.stroke(); }
  g.globalAlpha = 1; g.restore();
  // столб и чаши
  const col = (y, h, w) => { hp(g, () => g.rect(-w / 2, y - h, w, h), st, 1.6); hp(g, () => g.rect(-w / 2, y - h, w * 0.35, h), shade(st, 1.08), 0); };
  col(-22, 70, 18);
  const bowl = (y, w) => { hp(g, () => { g.moveTo(-w, y); g.quadraticCurveTo(0, y + w * 0.5, w, y); g.closePath(); }, shade(st, 0.9), 1.6); hp(g, () => g.ellipse(0, y, w, w * 0.22, 0, 0, 7), st, 1.6); hp(g, () => g.ellipse(0, y, w - 5, w * 0.16, 0, 0, 7), '#5f9fc0', 1); };
  bowl(-88, 46);
  col(-88, 40, 12);
  bowl(-126, 24);
  hp(g, () => g.ellipse(0, -140, 6, 8, 0, 0, 7), '#e7c35a', 1.2);
  // струи: с верхней чаши в нижнюю, с нижней в бассейн
  g.strokeStyle = 'rgba(200,232,255,.85)'; g.lineWidth = 2;
  for (const sd of [-1, 1]) {
    g.beginPath(); g.moveTo(sd * 22, -126); g.quadraticCurveTo(sd * 34, -120, sd * 36, -92); g.stroke();
    g.beginPath(); g.moveTo(sd * 44, -88); g.quadraticCurveTo(sd * 66, -80, sd * 70, -30); g.stroke();
  }
  g.beginPath(); g.moveTo(0, -148); g.quadraticCurveTo(0, -170, 0, -156); g.stroke();
  g.fillStyle = 'rgba(230,245,255,.9)';
  for (let k = 0; k < 14; k++) { const q = (t * 1.3 + k / 14) % 1, sd = k % 2 ? 1 : -1, big = k % 4 < 2; const x = sd * (big ? 44 + q * 28 : 22 + q * 14), y = big ? -88 + q * q * 60 : -126 + q * q * 36; g.beginPath(); g.arc(x, y, 1.6, 0, 7); g.fill(); }
  for (let k = 0; k < 6; k++) { const q = (t * 2 + k / 6) % 1; g.beginPath(); g.arc(Math.sin(k * 2.3) * 4, -150 - Math.sin(q * Math.PI) * 18, 1.5, 0, 7); g.fill(); }
}
/** Уличный фонарь: столб, кованый кронштейн, фонарь со стёклами. */
export function lamp(g, t, night) {
  hp(g, () => g.rect(-6, -6, 12, 8), '#5a5a62', 1.2);
  hp(g, () => g.rect(-2.5, -96, 5, 92), '#3a3a40', 1.2);
  hp(g, () => { g.moveTo(-9, -96); g.lineTo(9, -96); g.lineTo(7, -104); g.lineTo(-7, -104); g.closePath(); }, '#3a3a40', 1.2);
  hp(g, () => g.rect(-7, -120, 14, 16), night ? '#ffd36a' : '#cfe0e8', 1.4);
  hp(g, () => { g.moveTo(-10, -120); g.lineTo(0, -130); g.lineTo(10, -120); g.closePath(); }, '#3a3a40', 1.2);
  if (night) light(g, -7, -120, 14, 16, 90, 'lamp');
  if (night) { const gr = g.createRadialGradient(0, -112, 1, 0, -112, 80); gr.addColorStop(0, 'rgba(255,210,110,.45)'); gr.addColorStop(1, 'rgba(255,210,110,0)'); g.fillStyle = gr; g.fillRect(-80, -192, 160, 160); }
}
/** Цветник: клумба с бортиком и цветами. */
export function flowerbed(g, w, h, seed = 3) {
  const r = rnd(seed);
  hp(g, () => g.roundRect(-w / 2, -h / 2, w, h, h / 2), '#5a3e26', 1.4);
  hp(g, () => g.roundRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, h / 2 - 4), '#4a6a2a', 0);
  const C = ['#e85a5a', '#f4c766', '#ffffff', '#b86ad8', '#ff9a4a'];
  for (let k = 0; k < w * h / 70; k++) { const x = -w / 2 + 8 + r() * (w - 16), y = -h / 2 + 7 + r() * (h - 14); g.fillStyle = '#3a5a22'; g.beginPath(); g.arc(x, y + 2, 2.6, 0, 7); g.fill(); g.fillStyle = C[Math.floor(r() * 5)]; g.beginPath(); g.arc(x, y, 2.2, 0, 7); g.fill(); }
}

// ---------------------------------------------------------------- в игре (v58)
/** Кольцо плит между радиусами r0 и r1 с бордюрами. */
export function ringPath(g, cx, cy, r0, r1, seed = 4) {
  const r = rnd(seed), cols = ['#b9b3a6', '#aea89a', '#c4beb0', '#a39d90'], S = (r1 - r0) / 3;
  for (let k = 0; k < 3; k++) {
    const ri = r0 + k * S, ro = ri + S, n = Math.round(2 * Math.PI * ro / 26), off = k * 0.37;
    for (let i = 0; i < n; i++) {
      const a0 = (i + off) / n * Math.PI * 2, a1 = (i + 1 + off) / n * Math.PI * 2;
      g.beginPath(); g.arc(cx, cy, ro, a0, a1); g.arc(cx, cy, ri, a1, a0, true); g.closePath();
      g.fillStyle = cols[Math.floor(r() * 4)]; g.fill(); g.strokeStyle = 'rgba(60,50,40,.45)'; g.lineWidth = 1.2; g.stroke();
    }
  }
  g.strokeStyle = '#7f786c'; g.lineWidth = 6; for (const rr of [r0, r1]) { g.beginPath(); g.arc(cx, cy, rr, 0, 7); g.stroke(); }
}
/** Подпорная стенка террасы с балюстрадой по обе стороны лестницы. Начало — середина верхней кромки стенки.
 *  T — полуширина террасы, sw — полуширина проёма под лестницу, h — высота стенки. */
export function terrace(g, T, sw, h) {
  for (const sd of [-1, 1]) {
    const x0 = sd < 0 ? -T : sw, x1 = sd < 0 ? -sw : T;
    masonry(g, x0, 0, x1 - x0, h, '#a39d90', 30 + sd, 11);
    g.strokeStyle = O; g.lineWidth = 2; g.strokeRect(x0, 0, x1 - x0, h);
    g.fillStyle = '#c9c2b2'; g.fillRect(x0, -7, x1 - x0, 7); g.lineWidth = 1.4; g.strokeRect(x0, -7, x1 - x0, 7);
    for (let x = x0 + 7; x < x1 - 4; x += 12) { g.beginPath(); g.roundRect(x, -25, 6, 18, 3); g.fillStyle = '#ddd6c6'; g.fill(); g.lineWidth = 0.9; g.stroke(); }
    g.fillStyle = '#c9c2b2'; g.fillRect(x0, -30, x1 - x0, 6); g.lineWidth = 1.4; g.strokeRect(x0, -30, x1 - x0, 6);
  }
}
/** Кусок городской стены по окружности: p0→p1 в своих координатах (середина основания — начало), высота H, толщина th. */
export function wallSeg(g, p0, p1, nrm, H, th, seed) {
  // лицевая сторона — та кромка, что ниже на экране
  const inn = [[p0[0] - nrm[0] * th / 2, p0[1] - nrm[1] * th / 2], [p1[0] - nrm[0] * th / 2, p1[1] - nrm[1] * th / 2]];
  const out = [[p0[0] + nrm[0] * th / 2, p0[1] + nrm[1] * th / 2], [p1[0] + nrm[0] * th / 2, p1[1] + nrm[1] * th / 2]];
  const [f, b] = (out[0][1] + out[1][1]) > (inn[0][1] + inn[1][1]) ? [out, inn] : [inn, out];
  const base = '#8d8a82';
  // верх стены (дорожка)
  g.beginPath(); g.moveTo(f[0][0], f[0][1] - H); g.lineTo(f[1][0], f[1][1] - H); g.lineTo(b[1][0], b[1][1] - H); g.lineTo(b[0][0], b[0][1] - H); g.closePath();
  g.fillStyle = '#a7a398'; g.fill();
  g.strokeStyle = O; g.lineWidth = 1.6; g.beginPath(); g.moveTo(b[0][0], b[0][1] - H); g.lineTo(b[1][0], b[1][1] - H); g.stroke();
  // лицо
  const dx = f[1][0] - f[0][0], dy = f[1][1] - f[0][1], L = Math.hypot(dx, dy);
  if (L > 1 && Math.abs(dx) > 2) {
    g.save(); g.transform(dx / L, dy / L, 0, 1, f[0][0], f[0][1] - H);
    masonry(g, -1, 0, L + 2, H, base, seed, 12);
    g.fillStyle = shade(base, 0.82); g.fillRect(-1, H - 12, L + 2, 12);
    g.strokeStyle = O; g.lineWidth = 2; g.beginPath(); g.moveTo(-1, 0); g.lineTo(L + 1, 0); g.moveTo(-1, H); g.lineTo(L + 1, H); g.stroke();
    // зубцы
    const n = Math.max(1, Math.round(L / 26));
    for (let i = 0; i < n; i++) { const mx = (i + 0.5) * L / n - 7; g.beginPath(); g.rect(mx, -13, 14, 13); g.fillStyle = shade(base, 1.06); g.fill(); g.lineWidth = 1.4; g.stroke(); }
    g.restore();
  }
}
