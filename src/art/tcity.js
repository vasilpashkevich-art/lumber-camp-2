// v99: стены и башни столицы в мультяшном стиле (STYLE.md): пухлые камни-подушки с цветной обводкой и бликом,
// толстый карниз на круглых кронштейнах, зубцы-кирпичики с глянцевой шапкой, мох у земли; круглые башни с кладкой
// по изгибу, навесным венцом, черепичной крышей-конусом «чешуйками», золотым шпилем и флажком; надвратная башня
// с аркой из клиньев, решёткой и гербом. Те же размеры и начала, что у city.js (wallFace, wallTop, wallSide, tower, gatehouse).
const TAU = Math.PI * 2;
const rnd = s => { s = Math.abs(s | 0) || 1; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; };
const sh = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join(''); };
const ink = col => sh(col, -0.6);
export const TCITY = { stone: '#a49c8e', roof: '#3a6cc0', gold: '#f0c24a', wood: '#8a5a32', moss: '#6f9a44' };

function paint(g, col, lw = 1.6, y0, y1, k = 0.18) {
  if (y0 != null) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, sh(col, k)); gr.addColorStop(1, sh(col, -k)); g.fillStyle = gr; } else g.fillStyle = col;
  g.fill(); if (lw) { g.strokeStyle = ink(col); g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); }
}
const shine = (g, x, y, rx, ry, a = 0.35, rot = -0.3) => { g.fillStyle = `rgba(255,255,255,${a})`; g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU); g.fill(); };
/** Камень-подушка: скруглённый блок с градиентом, обводкой в тон и бликом слева сверху. */
function block(g, x, y, w, h, col, r = 5) {
  if (w < 0.6 || h < 0.6) return;
  g.beginPath(); g.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2))); paint(g, col, 1.4, y, y + h, 0.16);
  if (w > 8 && h > 6) { g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 1.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + Math.min(r, 5) + 1, y + 2.4); g.lineTo(x + w * 0.45, y + 2.4); g.stroke(); }
}
/** Кладка крупными камнями-подушками: ряды разной длины, немного разные тона. Клип — по прямоугольнику. */
function masonry(g, x, y, w, h, col, seed, row = 18) {
  const r = rnd(seed);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = sh(col, -0.42); g.fillRect(x, y, w, h);   // шов — тёмный тон камня
  for (let yy = y, i = 0; yy < y + h; yy += row, i++) {
    let xx = x - (i % 2 ? row * 0.9 : r() * row);
    while (xx < x + w) { const bw = row * (1.3 + r() * 1.3), v = r(); block(g, xx + 1, yy + 1, bw - 2, row - 2, sh(col, v < 0.2 ? 0.08 : v > 0.82 ? -0.08 : (v - 0.5) * 0.06), 5); xx += bw; }
  }
  // свет слева сверху, тень у земли
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, 'rgba(255,250,235,.10)'); gr.addColorStop(0.75, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(20,12,6,.22)'); g.fillStyle = gr; g.fillRect(x, y, w, h);
  g.restore();
}
/** Мох у земли: зелёные пухлые кочки. */
function moss(g, x0, w, y, seed, n) { const r = rnd(seed); for (let i = 0; i < n; i++) { const x = x0 + r() * w, rx = 10 + r() * 14, ry = 5 + r() * 4; g.beginPath(); g.ellipse(x, y - ry * 0.4, rx, ry, 0, Math.PI, 0); g.closePath(); paint(g, sh(TCITY.moss, (r() - 0.5) * 0.2), 1.2, y - ry, y); shine(g, x - rx * 0.3, y - ry * 0.75, rx * 0.3, ry * 0.2, 0.3, 0); } }
/** Зубец: кирпичик со скруглённым верхом и глянцевой шапкой. */
function merlon(g, x, y, w, h, col) { g.beginPath(); g.roundRect(x, y, w, h, [5, 5, 2, 2]); paint(g, sh(col, 0.06), 1.5, y, y + h); g.beginPath(); g.roundRect(x - 1.5, y - 2, w + 3, 5, 2.5); paint(g, sh(col, 0.22), 1.2, y - 2, y + 3); shine(g, x + w * 0.3, y - 0.4, w * 0.22, 1, 0.45, 0); }

// ---------------------------------------------------------------- стена
/** Лицо стены (южная сторона куска). Начало — левый край основания. */
export function wallFace(g, w, H, seed, stone = TCITY.stone) {
  const r = rnd(seed);
  masonry(g, 0, -H, w, H, stone, seed, 19);
  // цоколь — крупные плиты
  g.save(); g.beginPath(); g.rect(0, -20, w, 20); g.clip(); g.fillStyle = sh(stone, -0.45); g.fillRect(0, -20, w, 20); for (let x = -r() * 30; x < w; x += 46) block(g, x + 1, -19, 44, 18, sh(stone, -0.12), 6); g.restore();
  // контрфорсы: пухлые, сужаются кверху, с шапкой
  for (let x = 130; x < w - 100; x += 260) {
    g.beginPath(); g.moveTo(x - 17, 0); g.quadraticCurveTo(x - 15, -H * 0.4, x - 11, -H * 0.7); g.lineTo(x + 11, -H * 0.7); g.quadraticCurveTo(x + 15, -H * 0.4, x + 17, 0); g.closePath(); paint(g, sh(stone, 0.04), 1.6, -H * 0.7, 0);
    g.save(); g.clip(); g.fillStyle = 'rgba(20,12,6,.18)'; g.fillRect(x + 3, -H, 16, H); g.strokeStyle = sh(stone, -0.35); g.lineWidth = 1.2; for (let y = -H * 0.7 + 16; y < 0; y += 18) { g.beginPath(); g.moveTo(x - 17, y); g.lineTo(x + 17, y); g.stroke(); } g.restore();
    g.beginPath(); g.roundRect(x - 14, -H * 0.7 - 7, 28, 9, 4); paint(g, sh(stone, 0.2), 1.4); shine(g, x - 5, -H * 0.7 - 4, 6, 1.4, 0.4, 0);
  }
  // окошки-бойницы со скруглённым верхом
  for (let x = 65 + r() * 30; x < w - 30; x += 130 + r() * 40) { g.beginPath(); g.roundRect(x - 4, -H * 0.62, 8, 22, [4, 4, 1, 1]); g.fillStyle = '#1e1612'; g.fill(); g.strokeStyle = ink(stone); g.lineWidth = 1.4; g.stroke(); g.beginPath(); g.roundRect(x - 7, -H * 0.62 - 3, 14, 5, 2.5); paint(g, sh(stone, 0.15), 1.1); }
  moss(g, 0, w, 0, seed + 5, Math.max(1, Math.round(w / 70)));
  // карниз: толстый, на круглых кронштейнах
  g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0, -H, w, 14);
  for (let x = 14; x < w - 10; x += 34) { g.beginPath(); g.moveTo(x, -H + 2); g.lineTo(x + 14, -H + 2); g.quadraticCurveTo(x + 14, -H + 14, x + 7, -H + 16); g.quadraticCurveTo(x, -H + 14, x, -H + 2); g.closePath(); paint(g, sh(stone, 0.02), 1.2, -H, -H + 16); }
  g.beginPath(); g.roundRect(-5, -H - 11, w + 10, 14, 6); paint(g, sh(stone, 0.16), 1.7, -H - 11, -H + 3); g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(2, -H - 8); g.lineTo(w - 2, -H - 8); g.stroke();
  g.strokeStyle = ink(stone); g.lineWidth = 2; g.beginPath(); g.moveTo(0, -H); g.lineTo(0, 0); g.moveTo(w, -H); g.lineTo(w, 0); g.stroke();
}
/** Верх стены (боевой ход): плиты, бруствер с зубцами снаружи, парапет внутри. Начало — левый дальний угол. */
export function wallTop(g, w, th, seed, outerDown = true, stone = TCITY.stone) {
  const r = rnd(seed), top = sh(stone, 0.14);
  g.beginPath(); g.rect(0, 0, w, th); paint(g, top, 0);
  g.save(); g.beginPath(); g.rect(0, 0, w, th); g.clip(); g.fillStyle = sh(top, -0.35); g.fillRect(0, 0, w, th);
  for (let x = -r() * 20, i = 0; x < w; x += 30, i++) for (let y = 0; y < th; y += 16) block(g, x + 1 + ((y / 16) % 2) * 12, y + 1, 28, 14, sh(top, (r() - 0.5) * 0.08), 4);
  g.restore();
  const yz = outerDown ? th - 16 : 0, yp = outerDown ? 0 : th - 9;
  g.beginPath(); g.roundRect(0, yp, w, 9, 3); paint(g, sh(stone, 0.04), 1.3, yp, yp + 9);   // парапет
  g.beginPath(); g.roundRect(0, yz, w, 16, 4); paint(g, sh(stone, -0.02), 1.4, yz, yz + 16);   // бруствер
  for (let x = 6; x < w - 14; x += 40) merlon(g, x, yz - (outerDown ? 4 : 12), 24, 26, stone);
  g.strokeStyle = ink(stone); g.lineWidth = 1.8; g.strokeRect(0, 0, w, th);
}
/** Торец стены (восток/запад) полосой: верх с зубцами по внешней стороне. */
export function wallSide(g, len, th, seed, outerRight, stone = TCITY.stone) {
  const r = rnd(seed), top = sh(stone, 0.14);
  g.save(); g.beginPath(); g.rect(0, 0, th, len); g.clip(); g.fillStyle = sh(top, -0.35); g.fillRect(0, 0, th, len);
  for (let y = -r() * 20, i = 0; y < len; y += 30, i++) for (let x = 0; x < th; x += 16) block(g, x + 1, y + 1 + ((x / 16) % 2) * 12, 14, 28, sh(top, (r() - 0.5) * 0.08), 4);
  g.restore();
  const xz = outerRight ? th - 16 : 0, xp = outerRight ? 0 : th - 9;
  g.beginPath(); g.roundRect(xp, 0, 9, len, 3); paint(g, sh(stone, 0.04), 1.3);
  g.beginPath(); g.roundRect(xz, 0, 16, len, 4); paint(g, sh(stone, -0.02), 1.4);
  for (let y = 6; y < len - 14; y += 40) { g.beginPath(); g.roundRect(xz - 4, y, 24, 24, 5); paint(g, sh(stone, 0.12), 1.4, y, y + 24); shine(g, xz + 4, y + 6, 5, 2.4, 0.4); }
  g.strokeStyle = ink(stone); g.lineWidth = 1.8; g.strokeRect(0, 0, th, len);
}

// ---------------------------------------------------------------- башня
/** Флажок на ветру. */
function flag(g, x, y, col, L = 30, t = 0) {
  g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 34); g.strokeStyle = ink('#8a6a3a'); g.lineWidth = 3; g.stroke(); g.strokeStyle = '#d8b060'; g.lineWidth = 1.6; g.stroke();
  const w = Math.sin(t * 3) * 2;
  g.beginPath(); g.moveTo(x + 1, y - 34); g.quadraticCurveTo(x + L * 0.5, y - 38 + w, x + L, y - 30 + w); g.quadraticCurveTo(x + L * 0.6, y - 27, x + L * 0.85, y - 22 - w); g.quadraticCurveTo(x + L * 0.45, y - 24 + w, x + 1, y - 20); g.closePath(); paint(g, col, 1.4, y - 38, y - 20);
  shine(g, x + L * 0.3, y - 32, L * 0.15, 1.6, 0.4, 0.1);
}
/** Крыша-конус: черепица чешуйками рядами, тень справа, золотой шар на шпиле. */
function roofCone(g, cx, y, ew, h, col, flagCol) {
  const path = () => { g.beginPath(); g.moveTo(cx - ew, y); g.quadraticCurveTo(cx - ew * 0.35, y - h * 0.55, cx, y - h); g.quadraticCurveTo(cx + ew * 0.35, y - h * 0.55, cx + ew, y); g.quadraticCurveTo(cx, y + ew * 0.22, cx - ew, y); g.closePath(); };
  path(); paint(g, col, 2, y - h, y);
  g.save(); path(); g.clip();
  for (let k = 1, row = 0; k <= 8; k++, row++) { const q = k / 8, yy = y - h + h * q, hw = ew * (0.12 + 0.88 * q), n = Math.max(2, Math.round(hw / 7)); for (let i = 0; i < n; i++) { const x = cx - hw + (i + (row % 2) * 0.5) * (hw * 2 / n); g.beginPath(); g.moveTo(x - hw / n, yy - h / 8 * 0.2); g.quadraticCurveTo(x - hw / n, yy + h / 16, x, yy + h / 14); g.quadraticCurveTo(x + hw / n, yy + h / 16, x + hw / n, yy - h / 8 * 0.2); g.fillStyle = sh(col, (i + row) % 3 === 0 ? 0.1 : -0.02); g.fill(); g.strokeStyle = ink(col); g.lineWidth = 1; g.stroke(); } }
  const gr = g.createLinearGradient(cx - ew, 0, cx + ew, 0); gr.addColorStop(0, 'rgba(255,255,255,.22)'); gr.addColorStop(0.45, 'rgba(255,255,255,0)'); gr.addColorStop(0.6, 'rgba(10,10,30,.08)'); gr.addColorStop(1, 'rgba(10,10,30,.35)'); g.fillStyle = gr; g.fillRect(cx - ew, y - h, ew * 2, h + ew);
  g.restore(); path(); g.strokeStyle = ink(col); g.lineWidth = 2; g.stroke();
  g.beginPath(); g.moveTo(cx - ew * 0.15, y - h * 0.82); g.quadraticCurveTo(cx - ew * 0.5, y - h * 0.4, cx - ew * 0.75, y - h * 0.08); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2.4; g.lineCap = 'round'; g.stroke();
  // шпиль
  g.beginPath(); g.roundRect(cx - 2, y - h - 10, 4, 12, 2); paint(g, TCITY.gold, 1.2);
  g.beginPath(); g.arc(cx, y - h - 12, 5, 0, TAU); paint(g, TCITY.gold, 1.4, y - h - 17, y - h - 7); shine(g, cx - 1.6, y - h - 13.6, 1.8, 1.2, 0.85);
  if (flagCol) flag(g, cx, y - h - 16, flagCol);
}
/** Круглая башня; начало — середина основания. */
export function tower(g, R, H, seed, roof = TCITY.roof, stone = TCITY.stone, withFlag = true) {
  g.fillStyle = 'rgba(20,12,6,.05)'; g.beginPath(); g.ellipse(10, 6, R * 1.3, R * 0.5, 0, 0, TAU); g.fill();   // тень слабая: мягкий контур (styled) её усиливает
  const top = -H, bulge = R * 0.36, r = rnd(seed);
  const body = () => { g.beginPath(); g.moveTo(-R, top); g.lineTo(-R, 0); g.quadraticCurveTo(0, bulge, R, 0); g.lineTo(R, top); g.closePath(); };
  body(); g.fillStyle = sh(stone, -0.34); g.fill();
  // кладка по изгибу: в ряду камни уже к краям, ряд опускается к середине
  g.save(); body(); g.clip();
  const row = 22;
  for (let y = top - 4, i = 0; y < bulge + 4; y += row, i++) {
    const n = 5, off = (i % 2) * 0.5;
    for (let k = -1; k <= n; k++) { const a0 = -Math.PI / 2 + ((k + off) / n) * Math.PI, a1 = a0 + Math.PI / n, x0 = R * Math.sin(Math.max(-Math.PI / 2, a0)), x1 = R * Math.sin(Math.min(Math.PI / 2, a1)); if (x1 - x0 < 1) continue;
      const dip = bulge * Math.cos((a0 + a1) / 2) * 0.9; block(g, x0 + 1, y + dip + 1, x1 - x0 - 2, row - 2, sh(stone, (r() - 0.5) * 0.1), 5); }
  }
  const gr = g.createLinearGradient(-R, 0, R, 0); gr.addColorStop(0, 'rgba(255,250,235,.22)'); gr.addColorStop(0.3, 'rgba(255,250,235,0)'); gr.addColorStop(0.65, 'rgba(20,12,6,.1)'); gr.addColorStop(1, 'rgba(20,12,6,.45)'); g.fillStyle = gr; g.fillRect(-R, top - 4, R * 2, H + bulge + 8);
  g.restore();
  body(); g.strokeStyle = ink(stone); g.lineWidth = 2; g.stroke();
  moss(g, -R * 0.9, R * 1.8, bulge * 0.7, seed + 9, 2);
  // бойницы
  for (const [fx, fy] of [[-R * 0.42, top + 46], [R * 0.32, top + 80], [-R * 0.08, top + 120]]) { if (fy > -16) continue; g.beginPath(); g.roundRect(fx - 4, fy, 8, 22, [4, 4, 1, 1]); g.fillStyle = '#1e1612'; g.fill(); g.strokeStyle = ink(stone); g.lineWidth = 1.4; g.stroke(); g.beginPath(); g.roundRect(fx - 7, fy - 3, 14, 5, 2.5); paint(g, sh(stone, 0.15), 1.1); }
  // венец: навесной пояс на кронштейнах, зубцы
  const Rw = R + 10, yw = top;
  for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k + 0.5) / 7 * Math.PI, x = Math.sin(a) * R, dip = bulge * Math.cos(a) * 0.9; g.beginPath(); g.moveTo(x - 6, yw + dip); g.lineTo(x + 6, yw + dip); g.quadraticCurveTo(x + 5, yw + dip + 12, x, yw + dip + 14); g.quadraticCurveTo(x - 5, yw + dip + 12, x - 6, yw + dip); g.closePath(); paint(g, sh(stone, -0.04), 1.2); }
  g.beginPath(); g.moveTo(-Rw, yw - 20); g.lineTo(-Rw, yw); g.quadraticCurveTo(0, yw + Rw * 0.36, Rw, yw); g.lineTo(Rw, yw - 20); g.quadraticCurveTo(0, yw - 20 + Rw * 0.36, -Rw, yw - 20); g.closePath(); paint(g, sh(stone, 0.1), 1.8, yw - 20, yw + 8);
  g.save(); g.clip(); const gr2 = g.createLinearGradient(-Rw, 0, Rw, 0); gr2.addColorStop(0, 'rgba(255,255,255,.15)'); gr2.addColorStop(0.6, 'rgba(0,0,0,0)'); gr2.addColorStop(1, 'rgba(20,12,6,.35)'); g.fillStyle = gr2; g.fillRect(-Rw, yw - 22, Rw * 2, 40); g.restore();
  for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k + 0.5) / 7 * Math.PI, x = Math.sin(a) * (Rw - 4), dip = Rw * 0.36 * Math.cos(a); merlon(g, x - 7, yw - 20 + dip - 14, 14, 18, stone); }
  roofCone(g, 0, yw - 30, Rw + 6, R * 2.5, roof, withFlag ? '#c8382c' : null);
}
/** Надвратная башня: две башни, стена с аркой из клиньев, решётка поднята, герб. w — ширина проёма. */
export function gatehouse(g, w, R, H, seed, stone = TCITY.stone) {
  const half = w / 2 + R;
  masonry(g, -half, -H + 12, half * 2, H - 12, stone, seed + 3, 19);
  g.strokeStyle = ink(stone); g.lineWidth = 2; g.strokeRect(-half, -H + 12, half * 2, H - 12);
  for (let x = -half + 8; x < half - 16; x += 30) merlon(g, x, -H - 6, 20, 20, stone);
  const ah = w * 0.5, hh = H * 0.72, ar = w / 2 + 16, cy = -hh + ah;
  // клинья арки
  for (let k = 0; k < 9; k++) { const a0 = Math.PI + k * Math.PI / 9, a1 = a0 + Math.PI / 9; g.beginPath(); g.arc(0, cy, ar, a0 + 0.01, a1 - 0.01); g.arc(0, cy, w / 2, a1 - 0.01, a0 + 0.01, true); g.closePath(); paint(g, sh(stone, k === 4 ? 0.25 : 0.14), 1.4); }
  for (const s of [-1, 1]) { g.beginPath(); g.roundRect(s > 0 ? w / 2 : -w / 2 - 16, cy, 16, Math.abs(cy), 3); paint(g, sh(stone, 0.12), 1.4, cy, 0); }
  const hole = () => { g.beginPath(); g.moveTo(-w / 2, 0); g.lineTo(-w / 2, cy); g.arc(0, cy, w / 2, Math.PI, 0); g.lineTo(w / 2, 0); g.closePath(); };
  hole(); g.fillStyle = '#1a120c'; g.fill();
  g.save(); hole(); g.clip(); g.fillStyle = '#b0a694'; g.fillRect(-w / 2, -34, w, 34); const gd = g.createLinearGradient(0, -hh, 0, -10); gd.addColorStop(0, 'rgba(0,0,0,.75)'); gd.addColorStop(1, 'rgba(0,0,0,.15)'); g.fillStyle = gd; g.fillRect(-w / 2, -hh, w, hh);
  // решётка — толстые прутья с остриями
  const py = cy + ah * 0.05; for (let k = 1; k < 6; k++) { const x = -w / 2 + k * w / 6; g.beginPath(); g.roundRect(x - 2.4, -hh - 6, 4.8, py + hh + 6, 2); paint(g, '#4a4c58', 1.2); g.beginPath(); g.moveTo(x - 3, py); g.lineTo(x, py + 7); g.lineTo(x + 3, py); g.closePath(); paint(g, '#5a5c68', 1); }
  for (const yy of [cy - ah * 0.4, cy - ah * 0.05]) { g.beginPath(); g.roundRect(-w / 2, yy - 2.4, w, 4.8, 2); paint(g, '#4a4c58', 1.2); }
  g.restore(); hole(); g.strokeStyle = ink(stone); g.lineWidth = 2.2; g.stroke();
  // герб над аркой: синий щит с золотым солнцем, на кронштейне
  const gy = -hh - 12;
  g.beginPath(); g.moveTo(-17, gy - 10); g.quadraticCurveTo(0, gy - 15, 17, gy - 10); g.lineTo(17, gy + 8); g.quadraticCurveTo(14, gy + 22, 0, gy + 28); g.quadraticCurveTo(-14, gy + 22, -17, gy + 8); g.closePath(); paint(g, TCITY.roof, 1.8, gy - 15, gy + 28);
  g.beginPath(); g.moveTo(-17, gy - 10); g.quadraticCurveTo(0, gy - 15, 17, gy - 10); g.strokeStyle = TCITY.gold; g.lineWidth = 2.2; g.stroke();
  g.beginPath(); g.arc(0, gy + 6, 6.5, 0, TAU); paint(g, TCITY.gold, 1.3); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; g.beginPath(); g.moveTo(Math.cos(a) * 8.5, gy + 6 + Math.sin(a) * 8.5); g.lineTo(Math.cos(a) * 11.5, gy + 6 + Math.sin(a) * 11.5); g.strokeStyle = TCITY.gold; g.lineWidth = 2; g.lineCap = 'round'; g.stroke(); }
  shine(g, -7, gy - 4, 4, 2.4, 0.4);
  for (const sd of [-1, 1]) { g.save(); g.translate(sd * half, 6); tower(g, R, H + 28, seed + sd, TCITY.roof, stone, sd > 0); g.restore(); }
}
