// Столица заново (v86): квадратная стена в толщину 1,3 роста с боевым ходом, круглые угловые башни, надвратные башни,
// мощёные улицы с бордюром, площадь с узором вокруг фонтана, дворы построек (заборы, бочки, телеги, дровники, колодец),
// деревья группами, фонари и лавки вдоль улиц. Мягкий облик, как у людей и зверей (v75): всё рисуется картинками,
// контур — затемнённая копия со сдвигом, свет слева сверху. Масштаб: 1 рост героя ≈ 42–55.
import { masonry, paving, lamp, flowerbed, cone } from './castle.js';
import { BLD2 } from './bld2.js';
import { well, haystack } from './farmland.js';

const O = '#24180f';
const rnd = s => { s = Math.abs(s | 0) || 1; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; };
function hp(g, fn, fill, lw = 1.6) { g.beginPath(); fn(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = O; g.lineWidth = lw; g.stroke(); } }
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v * k))); return '#' + ((1 << 24) | (f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1); };

/** Размеры столицы (мир): внутренний двор стен, толщина, высота, башни, ворота. Центр — (0,0), север — вверх. */
export const CITY = {
  x0: -1100, x1: 1100, y0: -900, y1: 860,    // внутренняя кромка стен
  th: 64, H: 136,                             // толщина и высота стены (1,5 и 3 роста)
  towerR: 80, towerH: 200,                    // угловые башни
  gate: { w: 140, towerR: 58, towerH: 210 },  // проём ворот и надвратные башни
  southGate: 0, eastGate: 165,                // где ворота: x на южной стене, y на восточной
  stone: '#8f8b82', roof: '#2f5fa8',
};

// ---------------------------------------------------------------- земля: трава, улицы, площадь
/** Улицы и площади — прямоугольники мощения в мире (x, y, w, h). Дворец — на террасе у северной стены. */
export const STREETS = [
  { x: -70, y: -440, w: 140, h: 1300, kind: 'main' },     // главная улица: от южных ворот к лестнице дворца
  { x: -980, y: 110, w: 2080, h: 110, kind: 'cross' },    // поперечная: от западного двора к восточным воротам
  { x: -960, y: -300, w: 1920, h: 90, kind: 'lane' },     // северный переулок
  { x: -1040, y: 560, w: 2080, h: 90, kind: 'lane' },     // южный переулок
  { x: -300, y: -140, w: 600, h: 420, kind: 'plaza' },    // площадь с фонтаном
  { x: -400, y: -520, w: 800, h: 80, kind: 'plaza' },     // площадка перед лестницей дворца
];
/** Мощение всей столицы: вызывать в координатах мира (центр столицы — начало). */
export function cityGround(g, cap = null) {
  const ST = cap && cap.streets ? cap.streets.map(s => ({ ...s, kind: s.plaza ? 'plaza' : s.h > 100 ? 'cross' : s.w === 140 ? 'main' : 'lane' })) : STREETS;
  const F = cap && cap.fountain ? cap.fountain : { x: 0, y: 60 };
  for (const s of ST) if (s.kind !== 'plaza') cobbles(g, s.x, s.y, s.w, s.h, s.kind === 'main' ? 7 : 11, s.kind === 'lane' ? 20 : 24);
  for (const s of ST) if (s.kind === 'plaza') paving(g, s.x, s.y, s.w, s.h, 5, true);
  plazaPattern(g, F.x, F.y, 300, 200);
  for (const s of ST) { if (s.kind === 'plaza') continue; g.strokeStyle = '#7a736a'; g.lineWidth = 6; g.strokeRect(s.x, s.y, s.w, s.h); g.strokeStyle = 'rgba(36,24,15,.55)'; g.lineWidth = 1.2; g.strokeRect(s.x - 3, s.y - 3, s.w + 6, s.h + 6); }
  for (const s of ST) if (s.kind === 'plaza') { g.strokeStyle = '#7a736a'; g.lineWidth = 7; g.strokeRect(s.x, s.y, s.w, s.h); }
  for (const [x, y, w, h] of (cap && cap.lawns) || [[-250, 230, 170, 44], [80, 230, 170, 44]]) lawn(g, x, y, w, h);
  for (const [x, y, w, h] of (cap && cap.beds) || [[-165, -100, 110, 34], [165, -100, 110, 34]]) { g.save(); g.translate(x, y); flowerbed(g, w, h, Math.abs(x + y)); g.restore(); }
}
function cobbles(g, x, y, w, h, seed, S) {
  const r = rnd(seed), cols = ['#a89f90', '#b8b0a2', '#9d9486', '#c0b8aa', '#a39a8b'];
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = '#8f8678'; g.fillRect(x, y, w, h);
  for (let yy = y - S, i = 0; yy < y + h + S; yy += S * 0.78, i++) for (let xx = x - S + (i % 2) * S / 2; xx < x + w + S; xx += S) {
    const rx = S * 0.46 + r() * 3, ry = S * 0.34 + r() * 2;
    g.fillStyle = cols[Math.floor(r() * cols.length)]; g.beginPath(); g.ellipse(xx + (r() - 0.5) * 3, yy + (r() - 0.5) * 3, rx, ry, (r() - 0.5) * 0.4, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,250,240,.18)'; g.beginPath(); g.ellipse(xx - rx * 0.25, yy - ry * 0.3, rx * 0.4, ry * 0.3, 0, 0, 7); g.fill();
  }
  // колея посередине чуть темнее
  const gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, 'rgba(40,30,20,.10)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x, y, w, h);
  g.restore();
}
function plazaPattern(g, cx, cy, rx, ry) {
  // узор: кольца плит и звезда из тёмных полос вокруг фонтана
  g.save(); g.translate(cx, cy);
  for (let k = 0; k < 8; k++) { g.save(); g.rotate(k * Math.PI / 4); g.fillStyle = 'rgba(90,70,50,.28)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(rx * 1.4, -9); g.lineTo(rx * 1.4, 9); g.closePath(); g.fill(); g.restore(); }
  for (const R of [120, 190, 260]) { g.strokeStyle = 'rgba(90,70,50,.5)'; g.lineWidth = 7; g.beginPath(); g.ellipse(0, 0, R, R * 0.7, 0, 0, 7); g.stroke(); g.strokeStyle = 'rgba(230,220,200,.35)'; g.lineWidth = 2; g.beginPath(); g.ellipse(0, -3, R, R * 0.7, 0, 0, 7); g.stroke(); }
  g.restore();
}
function lawn(g, x, y, w, h) { g.fillStyle = '#6f9a44'; g.beginPath(); g.roundRect(x, y, w, h, 10); g.fill(); g.strokeStyle = '#7a736a'; g.lineWidth = 4; g.stroke(); g.fillStyle = 'rgba(255,255,200,.25)'; for (let i = 0; i < 8; i++) { g.beginPath(); g.ellipse(x + 15 + i * (w - 30) / 7, y + h * (0.3 + (i % 3) * 0.2), 5, 3, 0, 0, 7); g.fill(); } }

// ---------------------------------------------------------------- стена
/** Лицо стены (южная сторона куска): кладка крупными блоками, цоколь, карниз, зубцы с бойницами. Начало — левый край основания. */
export function wallFace(g, w, H, seed, stone = CITY.stone) {
  const r = rnd(seed);
  masonry(g, 0, -H, w, H, stone, seed, 22);
  // выветренные пятна и мох у земли
  for (let i = 0; i < w / 60; i++) { const x = r() * w, y = -H + 20 + r() * (H - 40); g.fillStyle = r() < 0.5 ? 'rgba(60,50,40,.10)' : 'rgba(255,250,235,.08)'; g.beginPath(); g.ellipse(x, y, 18 + r() * 30, 8 + r() * 12, 0, 0, 7); g.fill(); }
  for (let i = 0; i < w / 90; i++) { const x = r() * w; g.fillStyle = 'rgba(80,120,50,.35)'; g.beginPath(); g.ellipse(x, -8, 14 + r() * 16, 5 + r() * 4, 0, 0, 7); g.fill(); }
  hp(g, () => g.rect(0, -18, w, 18), shade(stone, 0.78), 0);                      // цоколь
  g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, -H, w, 12);                       // тень под карнизом
  // контрфорсы
  for (let x = 130; x < w - 100; x += 260) { hp(g, () => { g.moveTo(x - 14, 0); g.lineTo(x - 10, -H * 0.72); g.lineTo(x + 10, -H * 0.72); g.lineTo(x + 14, 0); g.closePath(); }, shade(stone, 0.96), 1.6); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x + 4, -H * 0.72, 10, H * 0.72); g.fillStyle = 'rgba(255,250,235,.12)'; g.fillRect(x - 12, -H * 0.72, 5, H * 0.72); }
  hp(g, () => g.rect(-4, -H - 10, w + 8, 12), shade(stone, 1.1), 1.4);           // карниз на кронштейнах
  for (let x = 12; x < w - 10; x += 34) { hp(g, () => { g.moveTo(x, -H + 2); g.lineTo(x + 12, -H + 2); g.lineTo(x + 6, -H + 14); g.closePath(); }, shade(stone, 0.9), 1); }
  g.strokeStyle = O; g.lineWidth = 1.8; g.strokeRect(0, -H, w, H);
}
/** Верх стены (боевой ход): дорожка, зубцы с внешней стороны и парапет с внутренней. w — длина, th — толщина; начало — левый дальний угол. */
export function wallTop(g, w, th, seed, outerDown = true, stone = CITY.stone) {
  const r = rnd(seed);
  hp(g, () => g.rect(0, 0, w, th), shade(stone, 1.12), 0);
  g.fillStyle = 'rgba(0,0,0,.08)'; for (let x = 0; x < w; x += 22) g.fillRect(x, 0, 1.2, th);   // плиты дорожки
  for (let x = 0; x < w; x += 22) { if (r() < 0.3) { g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(x, 0, 22, th); } }
  // зубцы: на той кромке, что снаружи (outerDown — снаружи низ)
  const yz = outerDown ? th - 16 : 0, yp = outerDown ? 0 : th - 8;
  hp(g, () => g.rect(0, yz, w, 16), shade(stone, 0.9), 1.2);   // бруствер
  for (let x = 6; x < w - 14; x += 40) hp(g, () => g.rect(x, yz - (outerDown ? 0 : 10), 22, 26), shade(stone, 1.04), 1.3);   // зубцы
  hp(g, () => g.rect(0, yp, w, 8), shade(stone, 0.95), 1.2);   // парапет
  g.strokeStyle = O; g.lineWidth = 1.6; g.strokeRect(0, 0, w, th);
}
/** Торец стены (восток/запад), видимый как узкая полоса: только верх с зубцами по внешней стороне. */
export function wallSide(g, len, th, seed, outerRight, stone = CITY.stone) {
  const r = rnd(seed);
  hp(g, () => g.rect(0, 0, th, len), shade(stone, 1.12), 0);
  for (let y = 0; y < len; y += 22) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, y, th, 1.2); if (r() < 0.3) { g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(0, y, th, 22); } }
  const xz = outerRight ? th - 16 : 0, xp = outerRight ? 0 : th - 8;
  hp(g, () => g.rect(xz, 0, 16, len), shade(stone, 0.9), 1.2);
  for (let y = 6; y < len - 14; y += 40) hp(g, () => g.rect(xz - 4, y, 24, 22), shade(stone, 1.04), 1.3);
  hp(g, () => g.rect(xp, 0, 8, len), shade(stone, 0.95), 1.2);
  g.strokeStyle = O; g.lineWidth = 1.6; g.strokeRect(0, 0, th, len);
}
/** Круглая башня с конической крышей, флажком и бойницами; начало — середина основания. */
export function tower(g, R, H, seed, roof = CITY.roof, stone = CITY.stone, flag = true) {
  g.fillStyle = 'rgba(20,12,6,.28)'; g.beginPath(); g.ellipse(8, 6, R * 1.25, R * 0.5, 0, 0, 7); g.fill();
  const top = -H, bulge = R * 0.36;
  g.save(); g.beginPath(); g.moveTo(-R, top); g.lineTo(-R, 0); g.quadraticCurveTo(0, bulge, R, 0); g.lineTo(R, top); g.closePath(); g.clip();
  masonry(g, -R, top - 4, R * 2, H + bulge + 6, stone, seed, 14);
  const gr = g.createLinearGradient(-R, 0, R, 0); gr.addColorStop(0, 'rgba(255,250,235,.18)'); gr.addColorStop(0.3, 'rgba(255,250,235,0)'); gr.addColorStop(0.7, 'rgba(20,12,6,.12)'); gr.addColorStop(1, 'rgba(20,12,6,.4)');
  g.fillStyle = gr; g.fillRect(-R, top - 4, R * 2, H + bulge + 8); g.restore();
  hp(g, () => { g.moveTo(-R, top); g.lineTo(-R, 0); g.quadraticCurveTo(0, bulge, R, 0); g.lineTo(R, top); }, null, 1.8);
  for (const [fx, fy] of [[-R * 0.45, top + 40], [R * 0.3, top + 70], [-R * 0.1, top + 110]]) hp(g, () => g.roundRect(fx - 2.5, fy, 5, 18, 2), '#1e1612', 1.1);
  // венец: навесные бойницы шире тела, зубцы
  const Rw = R + 8, yw = top;
  hp(g, () => { g.moveTo(-Rw, yw - 18); g.lineTo(-Rw, yw); g.quadraticCurveTo(0, yw + Rw * 0.36, Rw, yw); g.lineTo(Rw, yw - 18); g.closePath(); }, shade(stone, 1.08), 1.6);
  for (let k = 0; k < 6; k++) { const x = -Rw + 6 + k * (Rw * 2 - 12) / 5; g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x - 4, yw + 2 + Math.sin((k + 0.5) / 6 * Math.PI) * Rw * 0.3 - 2, 8, 5); }
  for (let k = 0; k < 7; k++) { const x = -Rw + 2 + k * (Rw * 2 - 16) / 6; hp(g, () => g.rect(x, yw - 32, 12, 14), shade(stone, 1.02), 1.3); }
  // крыша
  cone(g, 0, yw - 30, Rw * 2 + 6, R * 2.4, roof, 0, flag ? '#e8c14a' : null);
}
/** Надвратная башня: две круглые башни по бокам, стена между ними с аркой ворот, поднятая решётка. w — ширина проёма. */
export function gatehouse(g, w, R, H, seed, stone = CITY.stone) {
  const half = w / 2 + R;
  // стена между башнями с воротами
  masonry(g, -half, -H + 12, half * 2, H - 12, stone, seed + 3, 16);
  g.strokeStyle = O; g.lineWidth = 1.8; g.strokeRect(-half, -H + 12, half * 2, H - 12);
  for (let x = -half + 10; x < half - 10; x += 26) hp(g, () => g.rect(x, -H, 16, 12), shade(stone, 1.02), 1.3);
  // арка
  const ah = w * 0.5, hh = H * 0.72;
  hp(g, () => { g.moveTo(-w / 2 - 12, 0); g.lineTo(-w / 2 - 12, -hh + ah); g.arc(0, -hh + ah, w / 2 + 12, Math.PI, 0); g.lineTo(w / 2 + 12, 0); g.closePath(); }, shade(stone, 1.14), 1.8);
  g.strokeStyle = 'rgba(36,24,15,.45)'; g.lineWidth = 1.2; for (let k = 0; k <= 8; k++) { const a = Math.PI + k * Math.PI / 8; g.beginPath(); g.moveTo(Math.cos(a) * w / 2, -hh + ah + Math.sin(a) * w / 2); g.lineTo(Math.cos(a) * (w / 2 + 12), -hh + ah + Math.sin(a) * (w / 2 + 12)); g.stroke(); }
  hp(g, () => { g.moveTo(-w / 2, 0); g.lineTo(-w / 2, -hh + ah); g.arc(0, -hh + ah, w / 2, Math.PI, 0); g.lineTo(w / 2, 0); g.closePath(); }, '#15100c', 2);
  g.save(); g.beginPath(); g.moveTo(-w / 2, 0); g.lineTo(-w / 2, -hh + ah); g.arc(0, -hh + ah, w / 2, Math.PI, 0); g.lineTo(w / 2, 0); g.closePath(); g.clip();
  // сквозь ворота видно мощение
  g.fillStyle = '#a89f90'; g.fillRect(-w / 2, -30, w, 30); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(-w / 2, -hh, w, hh - 30);
  g.strokeStyle = '#3a3a40'; g.lineWidth = 3.4; for (let k = 1; k < 6; k++) { g.beginPath(); g.moveTo(-w / 2 + k * w / 6, -hh - 4); g.lineTo(-w / 2 + k * w / 6, -hh + ah * 0.7); g.stroke(); }
  g.beginPath(); g.moveTo(-w / 2, -hh + ah * 0.35); g.lineTo(w / 2, -hh + ah * 0.35); g.stroke(); g.restore();
  // герб над аркой
  hp(g, () => { g.moveTo(-14, -hh - 8); g.lineTo(14, -hh - 8); g.lineTo(14, -hh + 10); g.quadraticCurveTo(0, -hh + 24, -14, -hh + 10); g.closePath(); }, '#2f5fa8', 1.4); g.fillStyle = '#e8c14a'; g.beginPath(); g.arc(0, -hh + 2, 6, 0, 7); g.fill();
  // башни
  for (const sd of [-1, 1]) { g.save(); g.translate(sd * half, 6); tower(g, R, H + 28, seed + sd, CITY.roof, stone, sd > 0); g.restore(); }
}

// ---------------------------------------------------------------- дворы и мелочи
export function fence(g, len, horizontal = true, seed = 1) {
  const r = rnd(seed), n = Math.max(2, Math.round(len / 26));
  if (horizontal) {
    for (let k = 0; k <= n; k++) { const x = k * len / n; hp(g, () => g.rect(x - 3, -30, 6, 32), '#8a6a44', 1.1); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x - 3, -4, 6, 6); }
    for (const y of [-22, -10]) hp(g, () => g.rect(0, y - 2.5, len, 5), '#a07e52', 1.1);
    g.fillStyle = 'rgba(255,240,210,.25)'; for (let k = 0; k < n; k++) if (r() < 0.5) g.fillRect(k * len / n + 4, -24, 10, 1.5);
  } else {
    for (let k = 0; k <= n; k++) { const y = k * len / n; hp(g, () => g.rect(-3, y - 30, 6, 32), '#8a6a44', 1.1); }
    for (const x of [-4, 4]) hp(g, () => g.rect(x - 2, -24, 4, len), '#a07e52', 1);
  }
}
export function barrel(g, s = 1) { g.save(); g.scale(s, s); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(2, 2, 12, 4, 0, 0, 7); g.fill(); hp(g, () => { g.moveTo(-10, -2); g.quadraticCurveTo(-13, -14, -10, -26); g.lineTo(10, -26); g.quadraticCurveTo(13, -14, 10, -2); g.closePath(); }, '#7a5a38', 1.3); hp(g, () => g.ellipse(0, -26, 10, 3.5, 0, 0, 7), '#9a7a52', 1.1); for (const y of [-8, -20]) { g.strokeStyle = '#4a4c50'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(-11.5, y); g.lineTo(11.5, y); g.stroke(); } g.fillStyle = 'rgba(255,240,210,.2)'; g.fillRect(-7, -22, 3, 18); g.restore(); }
export function crate(g, s = 1) { g.save(); g.scale(s, s); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(2, 2, 14, 4, 0, 0, 7); g.fill(); hp(g, () => g.rect(-11, -22, 22, 22), '#a8865a', 1.3); hp(g, () => { g.moveTo(-11, -22); g.lineTo(-5, -28); g.lineTo(17, -28); g.lineTo(11, -22); g.closePath(); }, '#c0a070', 1.2); hp(g, () => { g.moveTo(11, -22); g.lineTo(17, -28); g.lineTo(17, -6); g.lineTo(11, 0); g.closePath(); }, '#8a6a44', 1.2); g.strokeStyle = 'rgba(36,24,15,.4)'; g.lineWidth = 1; g.strokeRect(-8, -19, 16, 16); g.restore(); }
export function woodpile(g, w = 60) { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(4, 2, w * 0.6, 6, 0, 0, 7); g.fill(); let n = 0; for (let row = 0; row < 3; row++) for (let k = 0; k < 5 - row; k++) { const x = -w / 2 + 8 + row * 6 + k * (w - 16) / 4, y = -6 - row * 11; hp(g, () => g.arc(x, y, 6.5, 0, 7), '#8a6a44', 1.1); g.fillStyle = '#d8b080'; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); g.strokeStyle = 'rgba(36,24,15,.4)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x + 3, y); g.moveTo(x, y - 3); g.lineTo(x, y + 3); g.stroke(); n++; } }
export function bench(g) { g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(3, 2, 26, 5, 0, 0, 7); g.fill(); for (const x of [-18, 18]) hp(g, () => g.rect(x - 2, -16, 4, 16), '#6a4a2c', 1); hp(g, () => g.rect(-24, -20, 48, 6), '#a07e52', 1.2); hp(g, () => g.rect(-24, -30, 48, 4), '#a07e52', 1.1); g.fillStyle = 'rgba(255,240,210,.25)'; g.fillRect(-22, -19, 44, 1.5); }
export function cartWood(g) { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(4, 2, 46, 8, 0, 0, 7); g.fill(); hp(g, () => g.arc(-22, -8, 12, 0, 7), '#6a4a2c', 1.4); hp(g, () => g.arc(22, -8, 12, 0, 7), '#6a4a2c', 1.4); for (const cx of [-22, 22]) { g.strokeStyle = '#c0a070'; g.lineWidth = 1.5; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(cx, -8); g.lineTo(cx + Math.cos(k * Math.PI / 4) * 10, -8 + Math.sin(k * Math.PI / 4) * 10); g.moveTo(cx, -8); g.lineTo(cx - Math.cos(k * Math.PI / 4) * 10, -8 - Math.sin(k * Math.PI / 4) * 10); g.stroke(); } } hp(g, () => g.rect(-36, -34, 72, 20), '#a8865a', 1.3); g.strokeStyle = 'rgba(36,24,15,.4)'; g.lineWidth = 1; for (let x = -30; x < 36; x += 9) { g.beginPath(); g.moveTo(x, -34); g.lineTo(x, -14); g.stroke(); } hp(g, () => { g.moveTo(36, -30); g.lineTo(62, -24); }, null, 3); g.fillStyle = '#d8c070'; for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(-26 + k * 13, -36, 7, 4, 0, 0, 7); g.fill(); } }
export function treeGroup(g, seed = 1, n = 3) { const r = rnd(seed); for (let k = 0; k < n; k++) { const x = (r() - 0.5) * 120, y = (r() - 0.5) * 40, s = 0.9 + r() * 0.3; g.save(); g.translate(x, y); g.scale(s, s); treeOne(g, seed + k); g.restore(); } }
function treeOne(g, seed) { const r = rnd(seed); g.fillStyle = 'rgba(20,12,6,.28)'; g.beginPath(); g.ellipse(10, 4, 34, 11, 0, 0, 7); g.fill(); hp(g, () => { g.moveTo(-5, 0); g.lineTo(-4, -40); g.lineTo(4, -40); g.lineTo(5, 0); g.closePath(); }, '#7a5a38', 1.3); const cols = ['#5c8c3a', '#6a9c44', '#4e7c32']; for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2, R = 26; hp(g, () => g.arc(Math.cos(a) * R * 0.9, -62 + Math.sin(a) * R * 0.7, 20 + r() * 6, 0, 7), cols[k % 3], 1.3); } hp(g, () => g.arc(0, -66, 24, 0, 7), '#6a9c44', 1.3); g.fillStyle = 'rgba(255,255,200,.22)'; g.beginPath(); g.arc(-8, -76, 10, 0, 7); g.fill(); }

// ---------------------------------------------------------------- постройки с дворами
/** Постройки столицы: место фасада (середина у земли), рисунок, двор (мелочи относительно фасада). */
export const CITY_BUILDINGS = [
  { id: 'enchant', name: 'Мастерская чар', x: -760, y: -320, art: 'enchant', yard: [['fenceH', -190, 10, 60], ['crate', -140, -6], ['tree', -250, -80]] },
  { id: 'bank', name: 'Банк', x: 440, y: -320, art: 'bank', yard: [['lamp', -170, 14], ['lamp', 170, 14]] },
  { id: 'forge', name: 'Кузница', x: 820, y: -320, art: 'forge', yard: [['woodpile', 185, -6], ['barrel', 156, -4], ['barrel', 172, 8], ['cartWood', -200, -12]] },
  { id: 'market1', name: 'Рынок', x: -220, y: -60, art: 'stall', yard: [['crate', -90, -4], ['barrel', 80, -2]] },
  { id: 'market2', x: 220, y: -60, art: 'stall', yard: [['crate', 90, -4], ['barrel', -80, -2]] },
  { id: 'herbal', name: 'Лавка травницы', x: -880, y: 90, art: 'herbal', yard: [['tree', -200, -60]] },
  { id: 'mentor', name: 'Наставник', x: -560, y: 90, art: 'house', v: 0, yard: [['bench', 150, 6]] },
  { id: 'h4', x: 560, y: 90, art: 'house', v: 2, yard: [['haystack', 185, -14]] },
  { id: 'h5', x: 880, y: 90, art: 'house', v: 1, yard: [['well', 180, -20], ['fenceH', -190, 10, 50]] },
  { id: 'h3', x: -900, y: 540, art: 'house', v: 1, yard: [['woodpile', 160, -4], ['tree', -60, -280]] },
  { id: 'tavern', name: 'Таверна', x: -520, y: 540, art: 'tavern', yard: [['lamp', 215, 20]] },
  { id: 'miners', name: 'Гильдия рудокопов', x: 520, y: 540, art: 'miners', yard: [['cartWood', 200, -12]] },
  { id: 'inn', name: 'Постоялый двор', x: 900, y: 540, art: 'inn', yard: [['lamp', -195, 14]] },
];
const ART = { ...BLD2 };
export function drawBuilding(g, b, t = 0) { const f = ART[b.art]; if (f) f(g, b.art === 'house' ? (b.v || 0) : t, t); }
export function drawYardItem(g, it, t = 0) {
  const [k, x, y, a] = it; g.save(); g.translate(x, y);
  if (k === 'fenceH') fence(g, a, true, Math.abs(x)); else if (k === 'fenceV') fence(g, a, false, Math.abs(y));
  else if (k === 'barrel') barrel(g); else if (k === 'crate') crate(g); else if (k === 'woodpile') woodpile(g); else if (k === 'bench') bench(g); else if (k === 'cartWood') cartWood(g);
  else if (k === 'tree') treeGroup(g, Math.abs(x * 3 + y), 3); else if (k === 'lamp') lamp(g, t, false); else if (k === 'haystack') haystack(g); else if (k === 'well') well(g);
  g.restore();
}
/** Фонари вдоль главной улицы и площади, лавки у фонтана, деревья группами по пустым углам. */
export const CITY_DECOR = [
  ...[-380, -200, 330, 430, 520, 700, 780].flatMap(y => [['lamp', -92, y], ['lamp', 92, y]]),
  ['lamp', -320, -125], ['lamp', 320, -125], ['lamp', -320, 300], ['lamp', 320, 300],
  ['bench', -120, 130], ['bench', 120, 130], ['bench', -120, 20], ['bench', 120, 20],
  ['tree', -1000, -700], ['tree', -840, -760], ['tree', 1000, -700], ['tree', 840, -760], ['tree', -1020, -500], ['tree', 1020, -500], ['tree', -600, -620], ['tree', 600, -620],
  ['tree', -700, 380], ['tree', 700, 380], ['tree', -1020, 800], ['tree', -700, 820], ['tree', 1020, 800], ['tree', 700, 820], ['tree', -350, 800], ['tree', 350, 800], ['tree', -1020, 330], ['tree', 1020, 330],
  ['well', 0, 400], ['haystack', -500, 790], ['cartWood', 500, 790], ['barrel', -160, 790], ['crate', 160, 790],
];

/** Основание построек в мире (ширина лица, глубина, высота подписи): прямоугольник препятствия — от лица вглубь. */
export const FOOT = { house: [230, 175, 215], forge: [270, 190, 230], bank: [300, 200, 250], tavern: [330, 225, 290], enchant: [216, 175, 260], miners: [256, 190, 225], herbal: [243, 175, 230], inn: [324, 200, 320], stall: [150, 80, 195], palace: [900, 300, 560] };
/** Препятствия квадратной столицы (в мире, относительно центра): стены с проёмами ворот, башни, дворец, постройки, фонтан. */
export function cityBlocks(C) {
  const th = C.th, R = [], E = [];
  const rect = (x0, y0, x1, y1) => R.push([x0, y0, x1, y1]), ell = (x, y, rx, ry) => E.push([x, y, rx, ry]);
  const gw = C.gate.w;
  rect(C.x0 - th, C.y0 - th, C.x1 + th, C.y0);                                  // северная
  rect(C.x0 - th, C.y0 - th, C.x0, C.y1 + th);                                  // западная
  rect(C.x1, C.y0 - th, C.x1 + th, C.eastGate - gw / 2); rect(C.x1, C.eastGate + gw / 2, C.x1 + th, C.y1 + th);   // восточная с проёмом
  rect(C.x0 - th, C.y1, C.southGate - gw / 2, C.y1 + th); rect(C.southGate + gw / 2, C.y1, C.x1 + th, C.y1 + th); // южная с проёмом
  for (const [x, y] of [[C.x0 - th / 2, C.y0 - th / 2], [C.x1 + th / 2, C.y0 - th / 2], [C.x0 - th / 2, C.y1 + th / 2], [C.x1 + th / 2, C.y1 + th / 2]]) ell(x, y + C.towerR * 0.3, C.towerR + 6, C.towerR * 0.5 + 6);
  for (const sd of [-1, 1]) ell(C.southGate + sd * (gw / 2 + C.gate.towerR), C.y1 + th + 6, C.gate.towerR + 4, C.gate.towerR * 0.5 + 4);
  for (const sd of [-1, 1]) ell(C.x1 + th / 2, C.eastGate + sd * (gw / 2 + C.gate.towerR), C.gate.towerR + 4, C.gate.towerR * 0.5 + 4);
  return { rects: R, ells: E };
}
/** Прямоугольник основания постройки: [x0, y0, x1, y1] относительно середины лица (x, y). */
export function footRect(art, x, y) { const [w, d] = FOOT[art] || [120, 100]; return [x - w / 2, y - d * 0.5, x + w / 2 + d * 0.3, y]; }
