// Объёмные постройки столицы (v86): вид в три четверти — лицо, правая боковая стена, крыша двумя скатами сверху,
// свесы, трубы с дымом, своё лицо у каждой: кузница с горном и наковальней, банк с колоннами, таверна фахверком,
// мастерская чар башенкой, гильдия со штольней, лавка травницы, избы, постоялый двор с балконом, дворец.
// Координаты: начало — середина лицевой стены у земли; x вправо, глубина y уходит вверх-вправо, z — вверх.
const O = '#24180f';
const rnd = s => { s = Math.abs(s | 0) || 1; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; };
function hp(g, fn, fill, lw = 1.6) { g.beginPath(); fn(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = O; g.lineWidth = lw; g.stroke(); } }
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v * k))); return '#' + ((1 << 24) | (f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1); };
/** Проекция точки дома (x вдоль лица, y в глубину, z вверх) на экран. */
const KX = 0.3, KY = 0.5, KZ = 1;
const P = (x, y, z) => [x + y * KX, -z * KZ - y * KY];
const poly = (g, pts, fill, lw = 1.6) => hp(g, () => pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])) || g.closePath(), fill, lw);
const quad = (g, a, b, c, d, fill, lw) => poly(g, [a, b, c, d], fill, lw);

// ---------------------------------------------------------------- фактуры
function logsTex(g, pts, col, seed, rowH = 11) {
  // брёвна: горизонтальные ряды с бликом и тенью внутри многоугольника
  const r = rnd(seed); g.save(); g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.clip();
  const ys = pts.map(p => p[1]), xs = pts.map(p => p[0]), y0 = Math.min(...ys), y1 = Math.max(...ys), x0 = Math.min(...xs), x1 = Math.max(...xs);
  g.fillStyle = col; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let y = y0; y < y1; y += rowH) { g.fillStyle = shade(col, 0.78); g.fillRect(x0, y + rowH - 3, x1 - x0, 3); g.fillStyle = 'rgba(255,240,210,.16)'; g.fillRect(x0, y + 1.5, x1 - x0, 2); if (r() < 0.5) { g.fillStyle = 'rgba(0,0,0,.06)'; g.fillRect(x0 + r() * (x1 - x0), y, 20 + r() * 30, rowH - 3); } }
  g.restore();
}
function stoneTex(g, pts, col, seed, row = 15) {
  const r = rnd(seed); g.save(); g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.clip();
  const ys = pts.map(p => p[1]), xs = pts.map(p => p[0]), y0 = Math.min(...ys), y1 = Math.max(...ys), x0 = Math.min(...xs), x1 = Math.max(...xs);
  g.fillStyle = col; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let y = y0, i = 0; y < y1; y += row, i++) { const off = (i % 2) * row; for (let x = x0 - off; x < x1; x += row * 2) { const v = r(); g.fillStyle = v < 0.25 ? shade(col, 1.08) : v > 0.8 ? shade(col, 0.9) : col; g.fillRect(x + 1, y + 1, row * 2 - 2, row - 2); } }
  g.strokeStyle = 'rgba(36,24,15,.28)'; g.lineWidth = 1;
  for (let y = y0 + row; y < y1; y += row) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); }
  for (let y = y0, i = 0; y < y1; y += row, i++) { const off = (i % 2) * row; for (let x = x0 - off; x < x1; x += row * 2) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + row); g.stroke(); } }
  g.restore();
}
function plasterTex(g, pts, col, seed) {
  const r = rnd(seed); g.save(); g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.clip();
  const ys = pts.map(p => p[1]), xs = pts.map(p => p[0]), y0 = Math.min(...ys), y1 = Math.max(...ys), x0 = Math.min(...xs), x1 = Math.max(...xs);
  g.fillStyle = col; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let i = 0; i < 14; i++) { g.fillStyle = r() < 0.5 ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.08)'; g.beginPath(); g.ellipse(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 8 + r() * 14, 5 + r() * 8, 0, 0, 7); g.fill(); }
  g.restore();
}
/** Скат крыши: черепица/дранка/солома внутри четырёхугольника; k — затемнение. */
function roofTex(g, pts, col, kind, seed, k = 1) {
  const r = rnd(seed); const c = shade(col, k);
  g.save(); g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.clip();
  const ys = pts.map(p => p[1]), xs = pts.map(p => p[0]), y0 = Math.min(...ys), y1 = Math.max(...ys), x0 = Math.min(...xs), x1 = Math.max(...xs);
  g.fillStyle = c; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  if (kind === 'tile') { for (let y = y0, i = 0; y < y1; y += 9, i++) for (let x = x0 - (i % 2) * 8; x < x1; x += 16) { g.fillStyle = r() < 0.3 ? shade(c, 1.1) : shade(c, 0.95); g.beginPath(); g.moveTo(x, y + 9); g.quadraticCurveTo(x + 8, y - 4, x + 16, y + 9); g.closePath(); g.fill(); g.strokeStyle = 'rgba(36,24,15,.35)'; g.lineWidth = 0.8; g.stroke(); } }
  else if (kind === 'thatch') { for (let y = y0; y < y1; y += 5) { g.strokeStyle = r() < 0.5 ? 'rgba(90,60,20,.35)' : 'rgba(255,230,150,.25)'; g.lineWidth = 1.2; g.beginPath(); for (let x = x0; x < x1; x += 6) { g.moveTo(x, y); g.lineTo(x + 3, y + 5); } g.stroke(); } }
  else if (kind === 'slate') { for (let y = y0, i = 0; y < y1; y += 8, i++) for (let x = x0 - (i % 2) * 7; x < x1; x += 14) { g.fillStyle = r() < 0.3 ? shade(c, 1.12) : shade(c, 0.94); g.fillRect(x + 0.5, y + 0.5, 13, 7); g.strokeStyle = 'rgba(36,24,15,.3)'; g.lineWidth = 0.7; g.strokeRect(x + 0.5, y + 0.5, 13, 7); } }
  else { for (let y = y0; y < y1; y += 7) { g.fillStyle = shade(c, 0.85); g.fillRect(x0, y + 5, x1 - x0, 2); g.fillStyle = 'rgba(255,240,210,.14)'; g.fillRect(x0, y + 1, x1 - x0, 1.5); } for (let x = x0; x < x1; x += 60 + r() * 40) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(x, y0, 1.5, y1 - y0); } }
  // свет сверху слева
  const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, 'rgba(255,245,220,.16)'); gr.addColorStop(1, 'rgba(0,0,0,.14)'); g.fillStyle = gr; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  g.restore();
}

// ---------------------------------------------------------------- детали
function door(g, x, w, h, col = '#5a3a22', arch = true, step = true) {
  if (step) hp(g, () => g.rect(x - w / 2 - 8, -6, w + 16, 6), '#9a9488', 1.2);
  hp(g, () => { g.moveTo(x - w / 2, 0); g.lineTo(x - w / 2, -h + (arch ? w / 2 : 0)); if (arch) g.arc(x, -h + w / 2, w / 2, Math.PI, 0); else { g.lineTo(x - w / 2, -h); g.lineTo(x + w / 2, -h); } g.lineTo(x + w / 2, 0); g.closePath(); }, '#2a1c12', 1.6);
  g.save(); g.beginPath(); g.rect(x - w / 2 + 2, -h, w - 4, h); g.clip();
  g.fillStyle = col; g.fillRect(x - w / 2 + 2, -h, w - 4, h); g.strokeStyle = 'rgba(36,24,15,.5)'; g.lineWidth = 1; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x - w / 2 + 2 + k * (w - 4) / 4, -h); g.lineTo(x - w / 2 + 2 + k * (w - 4) / 4, 0); g.stroke(); }
  for (const by of [0.3, 0.72]) { g.fillStyle = '#4a4c50'; g.fillRect(x - w / 2 + 2, -h * by - 2, w - 4, 4); }
  g.restore(); g.fillStyle = '#e8c14a'; g.beginPath(); g.arc(x + w * 0.3, -h * 0.5, 2.2, 0, 7); g.fill();
}
function win(g, x, y, w, h, shutters = null, lit = false, bars = false) {
  hp(g, () => g.rect(x - w / 2 - 3, y - h - 3, w + 6, h + 6), '#cfc6b0', 1.2);
  hp(g, () => g.rect(x - w / 2, y - h, w, h), lit ? '#f0c060' : '#3a5a7a', 1.2);
  g.fillStyle = lit ? 'rgba(255,240,180,.5)' : 'rgba(255,255,255,.35)'; g.fillRect(x - w / 2 + 2, y - h + 2, w * 0.35, h * 0.4);
  g.strokeStyle = O; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x, y); g.moveTo(x - w / 2, y - h / 2); g.lineTo(x + w / 2, y - h / 2); g.stroke();
  if (bars) { g.strokeStyle = '#3a3a40'; g.lineWidth = 1.6; for (let k = 1; k < 3; k++) { g.beginPath(); g.moveTo(x - w / 2 + k * w / 3, y - h); g.lineTo(x - w / 2 + k * w / 3, y); g.stroke(); } }
  if (shutters) for (const sd of [-1, 1]) { hp(g, () => g.rect(x + sd * (w / 2 + 3) - (sd < 0 ? 9 : 0), y - h - 3, 9, h + 6), shutters, 1.1); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(x + sd * (w / 2 + 3) - (sd < 0 ? 9 : 0) + 2, y - h, 5, h); }
  hp(g, () => g.rect(x - w / 2 - 5, y, w + 10, 3), '#a8a090', 1);   // подоконник
}
function chimney(g, x, y, z, h, col = '#7a7670') {
  const [bx, by] = P(x, y, z);
  hp(g, () => g.rect(bx - 8, by - h, 16, h), col, 1.4); hp(g, () => g.rect(bx - 10, by - h - 5, 20, 6), shade(col, 0.85), 1.2);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(bx + 3, by - h, 5, h); g.fillStyle = 'rgba(36,24,15,.22)'; for (let k = 1; k < h / 8; k++) g.fillRect(bx - 8, by - h + k * 8, 16, 1);
  return [bx, by - h - 5];
}
function smoke(g, x, y, t = 0, n = 4) { for (let i = 0; i < n; i++) { const q = ((t * 0.25 + i / n) % 1), s = 5 + q * 10; g.fillStyle = `rgba(230,228,220,${0.55 * (1 - q)})`; g.beginPath(); g.ellipse(x + Math.sin(q * 6 + i) * 8 + q * 10, y - q * 60, s, s * 0.75, 0, 0, 7); g.fill(); } }
function lamp(g, x, y, lit = false) { hp(g, () => g.rect(x - 1.5, y - 20, 3, 20), '#3a3a40', 1); hp(g, () => g.rect(x - 5, y - 30, 10, 11), lit ? '#ffd870' : '#f0d8a0', 1.2); hp(g, () => { g.moveTo(x - 6, y - 30); g.lineTo(x, y - 36); g.lineTo(x + 6, y - 30); }, '#3a3a40', 1); }
function signBoard(g, x, y, draw) { hp(g, () => { g.moveTo(x, y); g.lineTo(x + 26, y); }, null, 3); g.strokeStyle = '#5a3e26'; g.lineWidth = 1.6; g.stroke(); hp(g, () => g.roundRect(x + 6, y + 2, 26, 22, 3), '#c9a06a', 1.3); g.save(); g.translate(x + 19, y + 13); draw(g); g.restore(); }
function shadowAt(g, w, d) { const a = P(-w / 2, 0, 0), b = P(w / 2, 0, 0), c = P(w / 2, d, 0), e = P(-w / 2, d, 0); g.fillStyle = 'rgba(20,12,6,.26)'; g.beginPath(); g.moveTo(a[0] - 12, a[1] + 10); g.lineTo(b[0] + 18, b[1] + 10); g.lineTo(c[0] + 18, c[1]); g.lineTo(e[0] - 12, e[1]); g.closePath(); g.fill(); }

/** Корпус: лицо (y=0), правая стена (x=w/2), крыша двускатная с коньком вдоль x; возвращает опорные точки. */
function body(g, w, d, H, tex, col, seed) {
  const f = [P(-w / 2, 0, 0), P(w / 2, 0, 0), P(w / 2, 0, H), P(-w / 2, 0, H)];
  const s = [P(w / 2, 0, 0), P(w / 2, d, 0), P(w / 2, d, H), P(w / 2, 0, H)];
  tex(g, s, shade(col, 0.74), seed + 1); poly(g, s, null, 1.6);
  tex(g, f, col, seed); poly(g, f, null, 1.8);
  // цоколь
  const cb = [P(-w / 2, 0, 0), P(w / 2, 0, 0), P(w / 2, 0, 10), P(-w / 2, 0, 10)]; poly(g, cb, '#7f786c', 1.2);
  const sb = [P(w / 2, 0, 0), P(w / 2, d, 0), P(w / 2, d, 10), P(w / 2, 0, 10)]; poly(g, sb, '#6a645a', 1.2);
  return { f, s };
}
/** Двускатная крыша: конёк вдоль лица на высоте H+rh, свесы e. Видны оба ската сверху. */
function gableRoof(g, w, d, H, rh, col, kind, seed, e = 14) {
  const r0 = P(-w / 2 - e, d / 2, H + rh), r1 = P(w / 2 + e, d / 2, H + rh);
  const fa = P(-w / 2 - e, -e * 0.6, H - 4), fb = P(w / 2 + e, -e * 0.6, H - 4);
  const ba = P(-w / 2 - e, d + e * 0.6, H - 4), bb = P(w / 2 + e, d + e * 0.6, H - 4);
  roofTex(g, [ba, bb, r1, r0], col, kind, seed + 7, 0.8); poly(g, [ba, bb, r1, r0], null, 1.6);   // задний скат (темнее)
  // фронтон справа (торец под крышей)
  const gL = P(w / 2, 0, H), gR = P(w / 2, d, H), gT = P(w / 2, d / 2, H + rh); poly(g, [gL, gR, gT], shade(col, 0.5), 1.4);
  roofTex(g, [fa, fb, r1, r0], col, kind, seed + 3, 1); poly(g, [fa, fb, r1, r0], null, 1.8);   // передний скат
  // конёк и свес
  g.strokeStyle = shade(col, 0.6); g.lineWidth = 3; g.beginPath(); g.moveTo(r0[0], r0[1]); g.lineTo(r1[0], r1[1]); g.stroke(); g.strokeStyle = O; g.lineWidth = 1.2; g.stroke();
  hp(g, () => { g.moveTo(fa[0], fa[1]); g.lineTo(fb[0], fb[1]); g.lineTo(fb[0], fb[1] + 5); g.lineTo(fa[0], fa[1] + 5); g.closePath(); }, shade(col, 0.55), 1.2);
  return { r0, r1, fa, fb };
}
/** Вальмовая (четырёхскатная) крыша. */
function hipRoof(g, w, d, H, rh, col, kind, seed, e = 12) {
  const inset = Math.min(w * 0.3, 60);
  const r0 = P(-w / 2 + inset, d / 2, H + rh), r1 = P(w / 2 - inset, d / 2, H + rh);
  const fa = P(-w / 2 - e, -e * 0.6, H - 4), fb = P(w / 2 + e, -e * 0.6, H - 4), ba = P(-w / 2 - e, d + e * 0.6, H - 4), bb = P(w / 2 + e, d + e * 0.6, H - 4);
  roofTex(g, [ba, bb, r1, r0], col, kind, seed + 7, 0.8); poly(g, [ba, bb, r1, r0], null, 1.4);
  roofTex(g, [fb, bb, r1], col, kind, seed + 9, 0.7); poly(g, [fb, bb, r1], null, 1.4);
  roofTex(g, [fa, ba, r0], col, kind, seed + 11, 0.92); poly(g, [fa, ba, r0], null, 1.4);
  roofTex(g, [fa, fb, r1, r0], col, kind, seed + 3, 1); poly(g, [fa, fb, r1, r0], null, 1.8);
  g.strokeStyle = shade(col, 0.6); g.lineWidth = 3; g.beginPath(); g.moveTo(r0[0], r0[1]); g.lineTo(r1[0], r1[1]); g.stroke();
  hp(g, () => { g.moveTo(fa[0], fa[1]); g.lineTo(fb[0], fb[1]); g.lineTo(fb[0], fb[1] + 5); g.lineTo(fa[0], fa[1] + 5); g.closePath(); }, shade(col, 0.55), 1.2);
}

// ---------------------------------------------------------------- постройки
/** Изба: брёвна, крыльцо, ставни, труба; v — крыша (0 дранка, 1 солома, 2 черепица). */
export function house2(g, v = 0, t = 0) {
  const w = 170, d = 130, H = 86, roofs = [['#6a4a30', 'plank'], ['#c9a24a', 'thatch'], ['#a8432a', 'tile']][v];
  shadowAt(g, w, d); body(g, w, d, H, logsTex, '#8a6440', 3 + v);
  gableRoof(g, w, d, H, 58, roofs[0], roofs[1], 5 + v);
  const [cx, cy] = chimney(g, w * 0.22, d * 0.6, H + 50, 26); smoke(g, cx, cy, t);
  door(g, -28, 38, 74, '#5a3a22', false);
  win(g, 44, -22, 26, 26, ['#3f6a8a', '#7a3a2a', '#4a6a3a'][v]);
  // окно на боковой стене
  const sw = P(w / 2 + 0.5, d * 0.5, 56); g.save(); g.translate(sw[0], sw[1]); g.transform(KX, KY * -1 / 1, 0, 1, 0, 0); win(g, 0, 0, 22, 24, null); g.restore();
  // крыльцо с навесом
  hp(g, () => g.rect(-58, -4, 60, 4), '#a07e52', 1.1); for (const x of [-56, -2]) hp(g, () => g.rect(x - 2, -44, 4, 40), '#6a4a2c', 1); hp(g, () => { g.moveTo(-62, -44); g.lineTo(4, -44); g.lineTo(0, -52); g.lineTo(-58, -52); g.closePath(); }, shade(roofs[0], 0.9), 1.2);
  // цветы под окном, дрова
  hp(g, () => g.roundRect(28, -12, 32, 10, 2), '#5d8a3a', 1); g.fillStyle = '#e85a5a'; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(33 + k * 8, -13, 2.4, 0, 7); g.fill(); }
}
/** Кузница: каменная, открытый горн с огнём под навесом, высокая труба, наковальня, бочка с водой, подкова. */
export function forge2(g, t = 0) {
  const w = 200, d = 140, H = 96;
  shadowAt(g, w, d); body(g, w, d, H, stoneTex, '#8a8378', 21);
  gableRoof(g, w, d, H, 52, '#5a4a3a', 'slate', 23);
  const [cx, cy] = chimney(g, w * 0.3, d * 0.55, H + 48, 44, '#6a6460'); smoke(g, cx, cy, t, 6);
  // открытый горн: большая арка, внутри свет
  const aw = 70, ah = 70, ax = -30;
  hp(g, () => { g.moveTo(ax - aw / 2, 0); g.lineTo(ax - aw / 2, -ah + aw / 2); g.arc(ax, -ah + aw / 2, aw / 2, Math.PI, 0); g.lineTo(ax + aw / 2, 0); g.closePath(); }, '#1a1210', 1.8);
  const gl = g.createRadialGradient(ax, -22, 4, ax, -22, 40); gl.addColorStop(0, 'rgba(255,170,60,.95)'); gl.addColorStop(0.5, 'rgba(255,90,20,.5)'); gl.addColorStop(1, 'rgba(255,60,0,0)'); g.fillStyle = gl; g.beginPath(); g.rect(ax - aw / 2, -ah, aw, ah); g.fill();
  hp(g, () => g.rect(ax - 24, -22, 48, 22), '#4a3a30', 1.2); g.fillStyle = '#ffb040'; g.beginPath(); g.moveTo(ax - 14, -22); g.quadraticCurveTo(ax - 6, -40 - Math.sin(t * 9) * 3, ax, -30); g.quadraticCurveTo(ax + 6, -44, ax + 14, -22); g.closePath(); g.fill(); g.fillStyle = '#fff0a0'; g.beginPath(); g.moveTo(ax - 6, -22); g.quadraticCurveTo(ax, -34, ax + 6, -22); g.closePath(); g.fill();
  // навес на столбах перед горном
  for (const x of [ax - 50, ax + 50]) hp(g, () => g.rect(x - 3, -76, 6, 76), '#5a4a3a', 1.2);
  hp(g, () => { g.moveTo(ax - 58, -76); g.lineTo(ax + 58, -76); g.lineTo(ax + 52, -88); g.lineTo(ax - 64, -88); g.closePath(); }, '#6a5a4a', 1.3);
  // наковальня на колоде, молот, бочка, подкова над дверью
  hp(g, () => g.rect(ax + 92 - 12, -16, 24, 16), '#6a4a2c', 1.2); hp(g, () => { g.moveTo(ax + 92 - 16, -16); g.lineTo(ax + 92 + 14, -16); g.lineTo(ax + 92 + 20, -22); g.lineTo(ax + 92 + 8, -28); g.lineTo(ax + 92 - 12, -28); g.lineTo(ax + 92 - 20, -22); g.closePath(); }, '#4a4c52', 1.3); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(ax + 92 - 10, -27, 14, 2);
  hp(g, () => { g.moveTo(ax + 108, -28); g.lineTo(ax + 118, -46); }, null, 2.4); hp(g, () => g.rect(ax + 112, -50, 12, 7), '#4a4c52', 1.1);
  hp(g, () => { g.moveTo(-88, -2); g.quadraticCurveTo(-92, -14, -88, -26); g.lineTo(-66, -26); g.quadraticCurveTo(-62, -14, -66, -2); g.closePath(); }, '#6a4a2c', 1.3); hp(g, () => g.ellipse(-77, -26, 11, 3.5, 0, 0, 7), '#4a7a9a', 1.1);
  door(g, 68, 36, 74, '#4a3a2a', true);
  hp(g, () => { g.arc(68, -78, 8, Math.PI * 0.9, Math.PI * 2.1); }, null, 3); g.strokeStyle = '#8a8a90'; g.lineWidth = 1.6; g.stroke();
  // окно на боку
  const sw = P(w / 2 + 0.5, d * 0.5, 60); g.save(); g.translate(sw[0], sw[1]); g.transform(KX, -KY, 0, 1, 0, 0); win(g, 0, 0, 22, 22, null, true); g.restore();
}
/** Банк: светлый камень, портик на четырёх колоннах, фронтон с монетой, ступени, решётки, фонари. */
export function bank2(g, t = 0) {
  const w = 220, d = 150, H = 110;
  shadowAt(g, w, d); body(g, w, d, H, stoneTex, '#cfc6b2', 31);
  hipRoof(g, w, d, H, 40, '#3a5a8a', 'slate', 33);
  // ступени
  for (let k = 0; k < 3; k++) hp(g, () => g.rect(-w / 2 - 6 + k * 4, -k * 6 - 6, w + 12 - k * 8, 6), shade('#cfc6b2', 1 - k * 0.04), 1.1);
  // портик: 4 колонны, антаблемент, фронтон
  const cols = [-78, -26, 26, 78];
  hp(g, () => g.rect(-w / 2 + 8, -H + 2, w - 16, 14), '#e8e0cc', 1.4);
  for (const x of cols) { hp(g, () => g.rect(x - 7, -H + 16, 14, H - 34), '#ece6d6', 1.2); g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(x + 2, -H + 16, 4, H - 34); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(x - 5, -H + 16, 3, H - 34); hp(g, () => g.rect(x - 10, -H + 10, 20, 8), '#e8e0cc', 1.1); hp(g, () => g.rect(x - 10, -18, 20, 6), '#e8e0cc', 1.1); hp(g, () => g.rect(x - 11, -12, 22, 6), '#d8d0bc', 1.1); }
  hp(g, () => { g.moveTo(-w / 2 + 2, -H + 2); g.lineTo(w / 2 - 2, -H + 2); g.lineTo(0, -H - 34); g.closePath(); }, '#e8e0cc', 1.6);
  g.fillStyle = '#e8c14a'; g.beginPath(); g.arc(0, -H - 10, 9, 0, 7); g.fill(); g.strokeStyle = O; g.lineWidth = 1.2; g.stroke(); g.fillStyle = '#b89020'; g.font = 'bold 11px Georgia'; g.textAlign = 'center'; g.fillText('₵', 0, -H - 6);
  door(g, 0, 38, 76, '#3a2a1a', true, false); g.strokeStyle = '#8a8a90'; g.lineWidth = 2; for (const y of [-52, -24]) { g.beginPath(); g.moveTo(-16, y); g.lineTo(16, y); g.stroke(); }
  for (const x of [-52, 52]) win(g, x, -34, 22, 30, null, false, true);
  for (const x of [-100, 100]) lamp(g, x, -12, false);
  const sw = P(w / 2 + 0.5, d * 0.5, 64); g.save(); g.translate(sw[0], sw[1]); g.transform(KX, -KY, 0, 1, 0, 0); win(g, 0, 0, 20, 26, null, false, true); g.restore();
}
/** Таверна: каменный низ, фахверковый второй этаж навесом, черепица, вывеска с кружкой, бочки, фонарь, стол со скамьёй. */
export function tavern2(g, t = 0) {
  const w = 230, d = 150, H1 = 66, H = 136;
  shadowAt(g, w, d);
  // первый этаж камень
  const f1 = [P(-w / 2, 0, 0), P(w / 2, 0, 0), P(w / 2, 0, H1), P(-w / 2, 0, H1)], s1 = [P(w / 2, 0, 0), P(w / 2, d, 0), P(w / 2, d, H1), P(w / 2, 0, H1)];
  stoneTex(g, s1, shade('#9a948a', 0.74), 41); poly(g, s1, null, 1.4); stoneTex(g, f1, '#9a948a', 42); poly(g, f1, null, 1.6);
  // второй этаж выступает на 8
  const o = 8, f2 = [P(-w / 2 - o, -o, H1), P(w / 2 + o, -o, H1), P(w / 2 + o, -o, H), P(-w / 2 - o, -o, H)], s2 = [P(w / 2 + o, -o, H1), P(w / 2 + o, d + o, H1), P(w / 2 + o, d + o, H), P(w / 2 + o, -o, H)];
  plasterTex(g, s2, shade('#e8dcc0', 0.76), 43); poly(g, s2, null, 1.4); plasterTex(g, f2, '#e8dcc0', 44); poly(g, f2, null, 1.6);
  // балки фахверка
  g.strokeStyle = '#5a3e26'; g.lineWidth = 5; const yb0 = -H1 - 2, yb1 = -H;
  for (const x of [-w / 2 - o + 3, -40, 40, w / 2 + o - 3]) { g.beginPath(); g.moveTo(x, yb0); g.lineTo(x, yb1); g.stroke(); }
  for (const [a, b] of [[-w / 2 - o + 3, -40], [40, w / 2 + o - 3]]) { g.beginPath(); g.moveTo(a, yb0); g.lineTo(b, yb1); g.moveTo(a, yb1); g.lineTo(b, yb0); g.stroke(); }
  g.beginPath(); g.moveTo(-w / 2 - o, yb0 + 2); g.lineTo(w / 2 + o, yb0 + 2); g.moveTo(-w / 2 - o, yb1 + 1); g.lineTo(w / 2 + o, yb1 + 1); g.stroke();
  // боковые балки
  const sb = [P(w / 2 + o, 0, H1), P(w / 2 + o, d, H1), P(w / 2 + o, d, H), P(w / 2 + o, 0, H)]; g.strokeStyle = '#4a3220'; g.lineWidth = 3.5; for (const q of [0.33, 0.66]) { const a = P(w / 2 + o, d * q, H1), b = P(w / 2 + o, d * q, H); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
  gableRoof(g, w + 2 * o, d + 2 * o, H, 62, '#a8432a', 'tile', 45, 12);
  const [cx, cy] = chimney(g, w * 0.3, d * 0.55, H + 56, 30); smoke(g, cx, cy, t, 5);
  door(g, -34, 40, 72, '#5a3a22', true);
  win(g, 50, -14, 32, 28, '#4a6a3a', true);
  for (const x of [-80, -20, 40, 95]) win(g, x, -H1 - 18, 22, 26, null, true);
  signBoard(g, w / 2 + o, -H1 - 40, s => { hp(s, () => s.rect(-6, -6, 10, 12), '#e8d8a8', 1); hp(s, () => s.arc(6, 0, 4, -1.4, 1.4), null, 1.4); s.fillStyle = '#fff'; s.fillRect(-6, -8, 10, 3); });
  lamp(g, -w / 2 - 4, -H1 - 10, false);
  // бочки у стены, стол со скамьями
  for (const [x, s] of [[-100, 1], [-84, 0.85]]) { g.save(); g.translate(x, -2); g.scale(s, s); hp(g, () => { g.moveTo(-10, -2); g.quadraticCurveTo(-13, -14, -10, -26); g.lineTo(10, -26); g.quadraticCurveTo(13, -14, 10, -2); g.closePath(); }, '#7a5a38', 1.2); hp(g, () => g.ellipse(0, -26, 10, 3.5, 0, 0, 7), '#9a7a52', 1); g.strokeStyle = '#4a4c50'; g.lineWidth = 2; for (const y of [-8, -20]) { g.beginPath(); g.moveTo(-11.5, y); g.lineTo(11.5, y); g.stroke(); } g.restore(); }
  g.save(); g.translate(w / 2 + 50, 0); hp(g, () => g.rect(-26, -26, 52, 6), '#a07e52', 1.2); for (const x of [-18, 18]) hp(g, () => g.rect(x - 2, -20, 4, 20), '#6a4a2c', 1); hp(g, () => g.rect(-30, -12, 60, 4), '#a07e52', 1.1); hp(g, () => g.arc(-8, -29, 3.5, 0, 7), '#e8d8a8', 1); hp(g, () => g.arc(10, -30, 3.5, 0, 7), '#e8d8a8', 1); g.restore();
}
/** Мастерская чар: восьмигранная башенка с фиолетовой конической крышей, кристалл, круглое окно, лунные знаки. */
export function enchant2(g, t = 0) {
  const w = 160, d = 130, H = 110;
  shadowAt(g, w, d); body(g, w, d, H, stoneTex, '#8a8494', 51);
  // башенка-пристройка справа сзади
  const tx = w / 2 - 20, ty = d * 0.7, [bx, by] = P(tx, ty, 0), R = 30, TH = 150;
  hp(g, () => { g.moveTo(bx - R, by); g.lineTo(bx - R, by - TH); g.lineTo(bx + R, by - TH); g.lineTo(bx + R, by); g.quadraticCurveTo(bx, by + 10, bx - R, by); }, '#7a7488', 1.4);
  stoneTex(g, [[bx - R, by - TH], [bx + R, by - TH], [bx + R, by], [bx - R, by]], '#8a8494', 52, 12);
  g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(bx + 10, by - TH, 20, TH); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(bx - R + 4, by - TH, 6, TH);
  hp(g, () => { g.moveTo(bx - R - 8, by - TH); g.lineTo(bx, by - TH - 70); g.lineTo(bx + R + 8, by - TH); g.closePath(); }, '#5a3a7a', 1.6); roofTex(g, [[bx - R - 8, by - TH], [bx, by - TH - 70], [bx + R + 8, by - TH]], '#5a3a7a', 'slate', 53);
  g.fillStyle = '#c8a0ff'; g.beginPath(); g.moveTo(bx, by - TH - 84); g.lineTo(bx + 5, by - TH - 72); g.lineTo(bx, by - TH - 62); g.lineTo(bx - 5, by - TH - 72); g.closePath(); g.fill(); g.strokeStyle = O; g.lineWidth = 1; g.stroke();
  hp(g, () => g.arc(bx, by - TH + 40, 10, 0, 7), '#cfc6b0', 1.2); hp(g, () => g.arc(bx, by - TH + 40, 7, 0, 7), '#3a2a5a', 1); g.fillStyle = '#c8a0ff'; g.beginPath(); g.arc(bx, by - TH + 40, 2.5, 0, 7); g.fill();
  gableRoof(g, w, d, H, 56, '#5a3a7a', 'slate', 55);
  // кристалл над дверью со свечением
  const y = -H + 18, gl = g.createRadialGradient(0, y, 1, 0, y, 32); gl.addColorStop(0, 'rgba(190,140,255,.8)'); gl.addColorStop(1, 'rgba(150,100,255,0)'); g.fillStyle = gl; g.beginPath(); g.arc(0, y, 32, 0, 7); g.fill();
  hp(g, () => { g.moveTo(0, y - 14); g.lineTo(8, y); g.lineTo(0, y + 14); g.lineTo(-8, y); g.closePath(); }, '#b48aff', 1.2);
  door(g, 0, 38, 76, '#3a2a4a', true);
  for (const x of [-52, 52]) win(g, x, -30, 22, 32, '#5a3a7a', true);
  // луна и звёзды на стене
  g.fillStyle = '#e8d8ff'; g.beginPath(); g.arc(-60, -84, 7, 0, 7); g.fill(); g.fillStyle = '#8a8494'; g.beginPath(); g.arc(-57, -86, 6, 0, 7); g.fill(); for (const [sx, sy] of [[60, -90], [70, -78], [55, -72]]) { g.fillStyle = '#f0e0ff'; g.beginPath(); g.arc(sx, sy, 1.6, 0, 7); g.fill(); }
  for (const x of [-w / 2 + 14, w / 2 - 14]) { hp(g, () => g.rect(x - 6, -30, 12, 30), '#6a6474', 1.2); g.fillStyle = '#9a7aff'; g.beginPath(); g.moveTo(x, -44); g.lineTo(x + 5, -32); g.lineTo(x - 5, -32); g.closePath(); g.fill(); g.stroke(); }
}
/** Гильдия рудокопов: камень с бревенчатым верхом, пристроенная штольня с крепью, рельсы и вагонетка, вывеска-кирка, фонарь. */
export function miners2(g, t = 0) {
  const w = 190, d = 140, H = 100;
  shadowAt(g, w + 90, d);
  // штольня слева: вход в холм с крепью
  g.save(); g.translate(-w / 2 - 50, 0);
  hp(g, () => { g.moveTo(-48, 0); g.quadraticCurveTo(-50, -60, -10, -72); g.quadraticCurveTo(30, -70, 48, 0); g.closePath(); }, '#7a8a5a', 1.4);
  g.fillStyle = 'rgba(96,130,60,.6)'; for (let k = 0; k < 6; k++) { g.beginPath(); g.ellipse(-30 + k * 12, -40 - (k % 2) * 14, 10, 5, 0, 0, 7); g.fill(); }
  hp(g, () => { g.moveTo(-22, 0); g.lineTo(-22, -40); g.lineTo(22, -40); g.lineTo(22, 0); g.closePath(); }, '#1a1410', 1.6);
  for (const x of [-22, 22]) hp(g, () => g.rect(x - 4, -42, 8, 42), '#6a4a2c', 1.2); hp(g, () => g.rect(-28, -48, 56, 8), '#6a4a2c', 1.2);
  // рельсы наружу и вагонетка
  g.strokeStyle = '#4a4c52'; g.lineWidth = 2; for (const x of [-9, 9]) { g.beginPath(); g.moveTo(x, -2); g.lineTo(x + 30, 40); g.stroke(); } g.strokeStyle = '#7a5a38'; g.lineWidth = 2.6; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(-12 + k * 6, 4 + k * 8.5); g.lineTo(12 + k * 6, 4 + k * 8.5); g.stroke(); }
  g.save(); g.translate(22, 22); hp(g, () => { g.moveTo(-16, -22); g.lineTo(16, -22); g.lineTo(12, -4); g.lineTo(-12, -4); g.closePath(); }, '#5a5a62', 1.3); g.fillStyle = '#a8502a'; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(-8 + k * 5.5, -24, 3.2, 0, 7); g.fill(); g.stroke(); } for (const x of [-9, 9]) hp(g, () => g.arc(x, -2, 3.5, 0, 7), '#2a2a30', 1); g.restore();
  g.restore();
  body(g, w, d, H, stoneTex, '#8a8378', 61);
  // бревенчатый верх
  const f2 = [P(-w / 2, 0, 60), P(w / 2, 0, 60), P(w / 2, 0, H), P(-w / 2, 0, H)], s2 = [P(w / 2, 0, 60), P(w / 2, d, 60), P(w / 2, d, H), P(w / 2, 0, H)];
  logsTex(g, s2, shade('#8a6440', 0.74), 62); poly(g, s2, null, 1.3); logsTex(g, f2, '#8a6440', 63); poly(g, f2, null, 1.4);
  gableRoof(g, w, d, H, 50, '#5a4a3a', 'plank', 65);
  const [cx, cy] = chimney(g, w * 0.25, d * 0.6, H + 44, 30); smoke(g, cx, cy, t, 3);
  door(g, 0, 42, 76, '#4a3a2a', false);
  for (const x of [-60, 60]) win(g, x, -30, 24, 26, '#5a4a3a');
  signBoard(g, w / 2, -H + 16, s => { s.strokeStyle = O; s.lineWidth = 2.2; s.beginPath(); s.moveTo(-8, 8); s.lineTo(8, -8); s.stroke(); hp(s, () => { s.moveTo(-10, -4); s.quadraticCurveTo(0, -12, 10, -4); s.lineTo(8, -1); s.quadraticCurveTo(0, -8, -8, -1); s.closePath(); }, '#a8b0b6', 1); });
  lamp(g, -w / 2 - 4, -40, true);
  // кирки и ящик у стены
  hp(g, () => g.rect(w / 2 - 40, -22, 22, 22), '#a8865a', 1.2); g.strokeStyle = '#6a4a2c'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(w / 2 - 60, -2); g.lineTo(w / 2 - 50, -40); g.stroke(); hp(g, () => { g.moveTo(w / 2 - 60, -40); g.quadraticCurveTo(w / 2 - 50, -50, w / 2 - 40, -42); }, null, 3);
}
/** Лавка травницы: бревенчатая, зелёная соломенная крыша с мхом, пучки трав под стрехой, котёл на треноге, горшки, сушилка. */
export function herbal2(g, t = 0) {
  const w = 180, d = 130, H = 90;
  shadowAt(g, w, d); body(g, w, d, H, logsTex, '#7b5634', 71);
  gableRoof(g, w, d, H, 60, '#8aa048', 'thatch', 73, 18);
  g.fillStyle = 'rgba(70,110,40,.5)'; for (let k = 0; k < 5; k++) { const p = P(-w / 2 + 20 + k * 36, d / 2 - 20 + (k % 2) * 30, H + 30); g.beginPath(); g.ellipse(p[0], p[1], 14, 6, 0, 0, 7); g.fill(); }
  const [cx, cy] = chimney(g, w * 0.3, d * 0.6, H + 52, 26); smoke(g, cx, cy, t, 3);
  // пучки трав на верёвке под стрехой
  g.strokeStyle = '#5a3e26'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-w / 2 + 10, -H + 4); g.lineTo(w / 2 - 10, -H + 4); g.stroke();
  const r = rnd(5); for (let i = 0; i < 7; i++) { const x = -w / 2 + 22 + i * 22 + (r() - 0.5) * 6, len = 14 + r() * 8, col = ['#9cc4a4', '#8aa060', '#c8a040', '#7ad8c0'][i % 4]; for (let k = -2; k <= 2; k++) hp(g, () => { g.moveTo(x, -H + 8); g.quadraticCurveTo(x + k * 3 + (k || 1) * 1.5, -H + 8 + len * 0.5, x + k * 2.6, -H + 8 + len); g.quadraticCurveTo(x + k, -H + 8 + len * 0.5, x, -H + 8); }, col, 0.9); }
  door(g, -30, 38, 74, '#5a3a22', true);
  win(g, 44, -22, 28, 28, '#4a6a3a');
  signBoard(g, w / 2, -H + 14, s => { hp(s, () => { s.moveTo(-8, 8); s.quadraticCurveTo(-10, -6, 8, -8); s.quadraticCurveTo(10, 6, -8, 8); }, '#6ab060', 1); s.strokeStyle = '#c8f0b0'; s.lineWidth = 0.8; s.beginPath(); s.moveTo(-7, 7); s.lineTo(6, -6); s.stroke(); });
  // котёл на треноге
  g.save(); g.translate(-w / 2 - 34, -4);
  g.strokeStyle = O; g.lineWidth = 2.4; for (const dx of [-13, 0, 13]) { g.beginPath(); g.moveTo(dx * 1.2, 0); g.lineTo(dx * 0.3, -40); g.stroke(); } g.strokeStyle = '#6a6a6a'; g.lineWidth = 1.2; for (const dx of [-13, 0, 13]) { g.beginPath(); g.moveTo(dx * 1.2, 0); g.lineTo(dx * 0.3, -40); g.stroke(); }
  g.fillStyle = '#ffb040'; g.beginPath(); g.moveTo(-9, -1); g.quadraticCurveTo(-5, -14, 0, -6); g.quadraticCurveTo(4, -16, 9, -1); g.closePath(); g.fill();
  hp(g, () => { g.moveTo(-14, -22); g.quadraticCurveTo(-16, -6, 0, -5); g.quadraticCurveTo(16, -6, 14, -22); g.closePath(); }, '#3a3a3e', 1.5); hp(g, () => g.ellipse(0, -22, 14, 4.5, 0, 0, 7), '#6ab060', 1.3);
  g.strokeStyle = '#5a5a5e'; g.lineWidth = 2; g.beginPath(); g.arc(0, -24, 13, Math.PI, 0); g.stroke();
  g.fillStyle = 'rgba(230,240,230,.45)'; for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(-4 + i * 4, -34 - i * 9 - (t * 10 % 9), 5 - i, 3.5 - i * 0.6, 0, 0, 7); g.fill(); }
  g.restore();
  for (const x of [w / 2 - 50, w / 2 - 26]) { hp(g, () => { g.moveTo(x - 8, -14); g.lineTo(x + 8, -14); g.lineTo(x + 6, 0); g.lineTo(x - 6, 0); g.closePath(); }, '#b06a3a', 1.2); g.strokeStyle = '#7ab860'; g.lineWidth = 1.4; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x, -14); g.quadraticCurveTo(x + (k - 1.5) * 5, -24, x + (k - 1.5) * 6, -30); g.stroke(); } }
}
/** Постоялый двор: два этажа, галерея-балкон на столбах, черепица, вывеска с кроватью, фонари. */
export function inn2(g, t = 0) {
  const w = 240, d = 150, H1 = 70, H = 150;
  shadowAt(g, w, d); body(g, w, d, H, logsTex, '#7b5634', 81);
  // балкон второго этажа
  const by = -H1 - 6;
  hp(g, () => g.rect(-w / 2 - 10, by - 6, w + 20, 7), '#5a3e26', 1.3);
  for (let x = -w / 2 - 6; x <= w / 2 + 6; x += 16) hp(g, () => g.rect(x - 1.5, by - 30, 3, 24), '#a07e52', 1);
  hp(g, () => g.rect(-w / 2 - 10, by - 32, w + 20, 4), '#a07e52', 1.1);
  for (const x of [-w / 2 + 10, w / 2 - 10]) hp(g, () => g.rect(x - 3, by, 6, H1 + 6), '#5a3e26', 1.2);
  gableRoof(g, w, d, H, 72, '#a8432a', 'tile', 83);
  const [cx, cy] = chimney(g, -w * 0.3, d * 0.5, H + 60, 34); smoke(g, cx, cy, t, 5);
  for (const x of [-85, -30, 30, 85]) win(g, x, -H1 - 40, 22, 26, '#7a3a2a', x > 0);
  door(g, 0, 46, 78, '#5a3a22', true);
  for (const x of [-82, 76]) win(g, x, -22, 28, 28, '#7a3a2a', true);
  signBoard(g, w / 2, -H1 + 2, s => { hp(s, () => s.rect(-9, 0, 18, 7), '#e8e0cc', 1); hp(s, () => s.rect(-9, -4, 6, 5), '#c43a2c', 1); });
  for (const x of [-w / 2 - 6, w / 2 + 6]) lamp(g, x, -18, false);
  hp(g, () => g.rect(-w / 2 + 8, -14, 22, 14), '#6b4a2c', 1.2); hp(g, () => g.ellipse(-w / 2 + 19, -14, 11, 3, 0, 0, 7), '#8a6a3a', 1);
}
/** Прилавок рынка: навес на столбах, товары, ящики. */
export function stall2(g, t = 0) {
  g.fillStyle = 'rgba(20,12,6,.25)'; g.beginPath(); g.ellipse(6, 4, 70, 14, 0, 0, 7); g.fill();
  hp(g, () => g.rect(-56, -28, 112, 28), '#a07e52', 1.4); g.strokeStyle = 'rgba(36,24,15,.4)'; g.lineWidth = 1; for (let x = -50; x < 56; x += 12) { g.beginPath(); g.moveTo(x, -28); g.lineTo(x, 0); g.stroke(); }
  hp(g, () => g.rect(-60, -32, 120, 5), '#c0a070', 1.2);
  for (const x of [-56, 56]) hp(g, () => g.rect(x - 3, -96, 6, 64), '#6a4a2c', 1.2);
  const top = [P(-66, -10, 96), P(66, -10, 96), P(66, 60, 110), P(-66, 60, 110)];
  g.save(); g.beginPath(); top.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.clip(); g.fillStyle = '#d84a3a'; g.fillRect(-80, -130, 160, 60); g.fillStyle = '#f0e8d8'; for (let x = -80; x < 80; x += 24) g.fillRect(x, -130, 12, 60); g.restore(); poly(g, top, null, 1.6);
  for (let x = -60; x < 66; x += 12) hp(g, () => { g.moveTo(x, -96 + 0); g.lineTo(x + 6, -88); g.lineTo(x + 12, -96); }, '#d84a3a', 1);
  // товары
  for (const [x, c] of [[-40, '#e8c14a'], [-24, '#d84a3a'], [-8, '#5fd35f'], [10, '#f0a060'], [28, '#9ad0ff'], [44, '#c8a0ff']]) { hp(g, () => g.arc(x, -36, 6, 0, 7), c, 1); g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.arc(x - 2, -38, 2, 0, 7); g.fill(); }
  hp(g, () => g.rect(-50, -50, 24, 12), '#b06a3a', 1); hp(g, () => g.rect(20, -52, 28, 14), '#8a6a44', 1);
}
/** Круглая башня дворца: тело с объёмом, венец с зубцами, коническая крыша с флагом. Начало — середина основания. */
function roundTower2(g, R, H, roof, seed, stone = '#b8b0a0') {
  const top = -H, bulge = R * 0.36;
  g.save(); g.beginPath(); g.moveTo(-R, top); g.lineTo(-R, 0); g.quadraticCurveTo(0, bulge, R, 0); g.lineTo(R, top); g.closePath(); g.clip();
  stoneTex(g, [[-R, top - 4], [R, top - 4], [R, bulge + 4], [-R, bulge + 4]], stone, seed, 13);
  const gr = g.createLinearGradient(-R, 0, R, 0); gr.addColorStop(0, 'rgba(255,250,235,.2)'); gr.addColorStop(0.3, 'rgba(255,250,235,0)'); gr.addColorStop(0.7, 'rgba(20,12,6,.12)'); gr.addColorStop(1, 'rgba(20,12,6,.42)');
  g.fillStyle = gr; g.fillRect(-R, top - 4, R * 2, H + bulge + 8); g.restore();
  hp(g, () => { g.moveTo(-R, top); g.lineTo(-R, 0); g.quadraticCurveTo(0, bulge, R, 0); g.lineTo(R, top); }, null, 1.8);
  for (let k = 0; k < 3; k++) win(g, -R * 0.3 + (k % 2) * R * 0.5, top + 50 + k * 44, 10, 20, null, k === 1);
  const Rw = R + 7; hp(g, () => { g.moveTo(-Rw, top - 16); g.lineTo(-Rw, top); g.quadraticCurveTo(0, top + Rw * 0.36, Rw, top); g.lineTo(Rw, top - 16); g.closePath(); }, shade(stone, 1.08), 1.5);
  for (let k = 0; k < 6; k++) { const x = -Rw + 2 + k * (Rw * 2 - 12) / 5; hp(g, () => g.rect(x, top - 28, 10, 13), shade(stone, 1.02), 1.2); }
  // крыша конусом с черепицей
  const h = R * 2.6, rw = Rw + 4; hp(g, () => { g.moveTo(-rw, top - 26); g.lineTo(0, top - 26 - h); g.lineTo(rw, top - 26); g.closePath(); }, roof, 1.6);
  g.save(); g.beginPath(); g.moveTo(-rw, top - 26); g.lineTo(0, top - 26 - h); g.lineTo(rw, top - 26); g.closePath(); g.clip(); g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.moveTo(0, top - 26 - h); g.lineTo(rw, top - 26); g.lineTo(rw * 0.25, top - 26); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.16)'; g.beginPath(); g.moveTo(0, top - 26 - h); g.lineTo(-rw, top - 26); g.lineTo(-rw * 0.5, top - 26); g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 1; for (let y = top - 30; y > top - 26 - h; y -= 9) { g.beginPath(); g.moveTo(-rw, y); g.lineTo(rw, y); g.stroke(); } g.restore();
  hp(g, () => g.rect(-1.5, top - 26 - h - 26, 3, 28), '#3a3a40', 1); hp(g, () => { g.moveTo(1, top - 26 - h - 26); g.lineTo(22, top - 26 - h - 20); g.lineTo(1, top - 26 - h - 12); g.closePath(); }, '#e8c14a', 1);
}
/** Королевский дворец в объёме: донжон с вальмовой крышей и зубцами, два крыла с двускатными крышами, четыре башни,
 *  парадные ворота с аркой и знамёнами, ряды окон, балкон. Ширина ≈ 12 ростов. Начало — середина фасада у земли. */
export function palace2(g, t = 0) {
  const stone = '#b8b0a0', roof = '#2f5fa8';
  const KW = 260, KD = 220, KH = 210, WW = 200, WD = 170, WH = 130;
  shadowAt(g, KW + 2 * WW, KD);
  // крылья (сзади по бокам), затем донжон спереди
  for (const sd of [-1, 1]) {
    g.save(); g.translate(sd * (KW / 2 + WW / 2 - 10), 0);
    body(g, WW, WD, WH, stoneTex, stone, 90 + sd);
    gableRoof(g, WW, WD, WH, 60, roof, 'slate', 93 + sd, 12);
    for (const x of [-60, 0, 60]) win(g, x, -WH + 56, 18, 30, null, x === 0);
    for (const x of [-60, 0, 60]) win(g, x, -22, 18, 30, null, false);
    g.restore();
  }
  // башни по углам крыльев (дальние)
  for (const sd of [-1, 1]) { const p = P(sd * (KW / 2 + WW - 20), WD, 0); g.save(); g.translate(p[0], p[1]); roundTower2(g, 30, WH + 80, roof, 95 + sd); g.restore(); }
  // донжон
  body(g, KW, KD, KH, stoneTex, stone, 97);
  // зубцы по верху донжона и вальмовая крыша выше
  const z = P(-KW / 2, 0, KH), z2 = P(KW / 2, 0, KH); hp(g, () => g.rect(z[0] - 4, z[1] - 10, KW + 8, 12), shade(stone, 1.08), 1.4); for (let x = -KW / 2 + 4; x < KW / 2 - 10; x += 26) hp(g, () => g.rect(x, z[1] - 24, 14, 14), shade(stone, 1.02), 1.2);
  hipRoof(g, KW - 30, KD - 30, KH + 4, 70, roof, 'slate', 99, 6);
  // передние башни донжона
  for (const sd of [-1, 1]) { g.save(); g.translate(sd * (KW / 2 + 6), 4); roundTower2(g, 36, KH + 30, roof, 101 + sd); g.restore(); }
  // ворота: арка 2,4 роста, знамёна, балкон
  const gw = 60, gh = 110;
  hp(g, () => { g.moveTo(-gw / 2 - 14, 0); g.lineTo(-gw / 2 - 14, -gh + gw / 2); g.arc(0, -gh + gw / 2, gw / 2 + 14, Math.PI, 0); g.lineTo(gw / 2 + 14, 0); g.closePath(); }, shade(stone, 1.14), 1.8);
  g.strokeStyle = 'rgba(36,24,15,.45)'; g.lineWidth = 1.2; for (let k = 0; k <= 8; k++) { const a = Math.PI + k * Math.PI / 8; g.beginPath(); g.moveTo(Math.cos(a) * gw / 2, -gh + gw / 2 + Math.sin(a) * gw / 2); g.lineTo(Math.cos(a) * (gw / 2 + 14), -gh + gw / 2 + Math.sin(a) * (gw / 2 + 14)); g.stroke(); }
  door(g, 0, gw, gh, '#5a3a22', true, false);
  for (const sd of [-1, 1]) { const x = sd * 62; hp(g, () => g.rect(x - 12, -gh - 50, 24, 70), roof, 1.3); hp(g, () => { g.moveTo(x - 12, -gh + 20); g.lineTo(x, -gh + 34); g.lineTo(x + 12, -gh + 20); }, roof, 1.2); g.fillStyle = '#e8c14a'; g.beginPath(); g.arc(x, -gh - 18, 7, 0, 7); g.fill(); g.strokeStyle = O; g.lineWidth = 1; g.stroke(); hp(g, () => g.rect(x - 16, -gh - 54, 32, 5), '#6a4a2c', 1.1); }
  // балкон над воротами, большое окно
  hp(g, () => g.rect(-44, -gh - 64, 88, 8), shade(stone, 0.9), 1.3); for (let x = -40; x <= 40; x += 10) hp(g, () => g.rect(x - 1.5, -gh - 84, 3, 20), '#cfc6b0', 1); hp(g, () => g.rect(-46, -gh - 88, 92, 4), '#cfc6b0', 1);
  win(g, 0, -gh - 92, 40, 44, null, true); hp(g, () => { g.moveTo(-24, -gh - 136); g.arc(0, -gh - 136, 24, Math.PI, 0); }, '#cfc6b0', 1.2);
  for (const x of [-100, -70, 70, 100]) win(g, x, -KH + 60, 16, 28, null, x > 0); for (const x of [-100, -70, 70, 100]) win(g, x, -KH + 120, 16, 28, null, x < 0);
  // лестница и жаровни
  for (let k = 0; k < 5; k++) hp(g, () => g.rect(-gw / 2 - 30 - k * 10, k * 7, gw + 60 + k * 20, 7), shade(stone, 1.02 - k * 0.03), 1.1);
  for (const sd of [-1, 1]) { const x = sd * (gw / 2 + 60); hp(g, () => g.rect(x - 3, 8, 6, 24), '#4a4c50', 1.1); hp(g, () => g.ellipse(x, 6, 12, 5, 0, 0, 7), '#4a4c50', 1.2); g.fillStyle = '#ffb040'; g.beginPath(); g.moveTo(x - 8, 4); g.quadraticCurveTo(x - 3, -12 - Math.sin(t * 8) * 3, x, -4); g.quadraticCurveTo(x + 3, -16, x + 8, 4); g.closePath(); g.fill(); g.fillStyle = '#fff0a0'; g.beginPath(); g.moveTo(x - 3, 4); g.quadraticCurveTo(x, -6, x + 3, 4); g.closePath(); g.fill(); }
}
/** Все постройки крупнее в 1,35 раза: стены 1,5–2 роста, двери 1,2–1,4 роста. */
const SC = 1.35;
const scaled = f => (g, a, b) => { g.save(); g.scale(SC, SC); f(g, a, b); g.restore(); };
export const BLD2 = { house: scaled(house2), forge: scaled(forge2), bank: scaled(bank2), tavern: scaled(tavern2), enchant: scaled(enchant2), miners: scaled(miners2), herbal: scaled(herbal2), inn: scaled(inn2), stall: scaled(stall2), palace: scaled(palace2) };
