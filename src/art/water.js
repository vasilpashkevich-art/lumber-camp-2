// v140: живая вода — рыбы в прудах и реке (без состояния, по времени), круги и полоса воды «по пояс» у того, кто стоит на отмели,
// тень водного зверя под водой (пока не напал). Всё рисуется каждый кадр поверх земли.
const TAU = Math.PI * 2;
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** Маленькая рыбка: тёмная спинка, светлое брюшко, хвост виляет. a — куда плывёт, s — размер, под водой — полупрозрачная. */
function smallFish(g, x, y, a, s, t, col) {
  g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s);
  const wag = Math.sin(t * 9) * 2;
  g.fillStyle = col; g.beginPath(); g.moveTo(-7, 0); g.lineTo(-11, -3 + wag); g.lineTo(-11, 3 + wag); g.closePath(); g.fill();
  g.beginPath(); g.ellipse(0, 0, 8, 3, 0, 0, TAU); g.fill();
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(1, 1, 5, 1.2, 0, 0, TAU); g.fill();
  g.fillStyle = 'rgba(0,0,0,.5)'; g.beginPath(); g.arc(5, -0.8, 0.8, 0, TAU); g.fill();
  g.restore();
}

/** Рыбы в пруду: по кругу внутри пруда, каждая со своей скоростью и дорожкой; на глубине темнее и прозрачнее. */
export function pondFish(g, px, py, rx, ry, seed, t, deep) {
  const n = Math.max(2, Math.min(7, Math.round(rx * ry / 50000)));
  for (let i = 0; i < n; i++) {
    const h0 = hash(seed + i * 7), h1 = hash(seed + i * 13), h2 = hash(seed + i * 29), dir = h2 < 0.5 ? 1 : -1;
    const rad = 0.25 + h0 * 0.6, sp = (0.12 + h1 * 0.18) * dir, ph = h2 * TAU, a = ph + t * sp;
    const wob = Math.sin(t * 0.7 + i) * 0.06;
    const x = px + Math.cos(a) * rx * (rad + wob), y = py + Math.sin(a) * ry * (rad + wob);
    const ang = Math.atan2(Math.cos(a) * ry * dir, -Math.sin(a) * rx * dir);
    const inDeep = deep(x, y);
    g.globalAlpha = inDeep ? 0.35 : 0.7;
    smallFish(g, x, y, ang, 0.9 + h1 * 0.6, t + i, inDeep ? '#1e3a3a' : '#3a4a3a');
    g.globalAlpha = 1;
    if (!inDeep && ((t * 0.5 + i * 0.37) % 1) < 0.08) { g.strokeStyle = 'rgba(230,245,245,.35)'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y, 7, 3, 0, 0, TAU); g.stroke(); }
  }
}

/** Рыбы в реке: плывут вдоль русла, каждая на своём отрезке ломаной и со своим смещением от середины. */
export function riverFish(g, R, t, x0, y0, x1, y1) {
  const pts = R.pts; let total = 0; const segs = [];
  for (let i = 0; i < pts.length - 1; i++) { const L = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); segs.push([total, L]); total += L; }
  const n = Math.round(total / 500);
  for (let i = 0; i < n; i++) {
    const h0 = hash(900 + i * 7), h1 = hash(900 + i * 13), dir = h1 < 0.5 ? 1 : -1;
    let s = ((h0 * total + t * (20 + h1 * 25) * dir) % total + total) % total;
    let k = 0; while (k < segs.length - 1 && s > segs[k][0] + segs[k][1]) k++;
    const u = (s - segs[k][0]) / segs[k][1], ax = pts[k][0], ay = pts[k][1], bx = pts[k + 1][0], by = pts[k + 1][1];
    const ang = Math.atan2(by - ay, bx - ax), off = (hash(900 + i * 31) - 0.5) * (R.w + 50), x = ax + (bx - ax) * u - Math.sin(ang) * off, y = ay + (by - ay) * u + Math.cos(ang) * off;
    if (x < x0 || x > x1 || y < y0 || y > y1) continue;
    const inDeep = Math.abs(off) < R.w / 2 - 12;
    g.globalAlpha = inDeep ? 0.35 : 0.7; smallFish(g, x, y, ang + (dir < 0 ? Math.PI : 0), 0.8 + h1 * 0.5, t + i, inDeep ? '#1e3a3a' : '#3a4a3a'); g.globalAlpha = 1;
  }
}

/** Круги на воде у ног того, кто стоит на отмели (герой, моб); w — ширина фигуры. */
export function ripples(g, x, y, w, t, seed = 0) {
  g.strokeStyle = 'rgba(230,245,245,.45)'; g.lineWidth = 1.2;
  for (let i = 0; i < 2; i++) { const q = ((t * 0.6 + i * 0.5 + seed * 0.13) % 1); g.globalAlpha = 0.6 * (1 - q); g.beginPath(); g.ellipse(x, y + 2, w * (0.5 + q * 0.9), w * (0.2 + q * 0.35), 0, 0, TAU); g.stroke(); }
  g.globalAlpha = 1;
}

/** Полоса воды «по пояс»: закрывает ноги фигуры тонкой голубой водой с волнистым верхом. x, y — ноги; w — ширина; h — высота воды (≈ по колено-пояс). */
export function waist(g, x, y, w, h, t) {
  // v140: ноги «в воде» — вода тонирует низ фигуры, края мягко пропадают (без прямоугольника), по линии воды — круг-кольцо с бликом
  const wl = y - h, wob = k => Math.sin(t * 3 + k * 0.5) * 1.3;
  g.save(); g.beginPath(); g.moveTo(x - w, wl + wob(0));
  for (let k = -w; k <= w; k += 6) g.lineTo(x + k, wl + wob(k));
  g.ellipse(x, wl, w, h + 6, 0, 0, Math.PI, false); g.closePath(); g.clip();
  g.translate(x, wl); g.scale(1, (h + 8) / w);
  const rg = g.createRadialGradient(0, 0, 0, 0, 0, w); rg.addColorStop(0, 'rgba(50,110,120,.78)'); rg.addColorStop(0.6, 'rgba(60,125,135,.6)'); rg.addColorStop(1, 'rgba(70,140,150,0)');
  g.fillStyle = rg; g.fillRect(-w, -2, w * 2, w * 2); g.restore();
  // кольцо воды вокруг тела по линии воды
  g.save(); g.strokeStyle = 'rgba(225,248,250,.6)'; g.lineWidth = 1.4; g.beginPath(); g.ellipse(x, wl + 1, w * 0.78, w * 0.22, 0, Math.PI * 0.05, Math.PI * 0.95); g.stroke();
  g.strokeStyle = 'rgba(225,248,250,.3)'; g.beginPath(); g.ellipse(x, wl + 1, w * 0.78, w * 0.22, 0, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.restore();
}

/** Тень водного зверя под водой: тёмное пятно по форме тела, два глаза над водой, круги. len — длина тени, a — куда смотрит. */
export function lurk(g, x, y, len, a, t, seed = 0) {
  const sway = Math.sin(t * 1.3 + seed) * 0.08;
  g.save(); g.translate(x, y); g.rotate(a + sway);
  g.fillStyle = 'rgba(10,30,30,.45)'; g.beginPath(); g.ellipse(0, 0, len * 0.5, len * 0.16, 0, 0, TAU); g.fill();
  g.fillStyle = 'rgba(10,30,30,.3)'; g.beginPath(); g.ellipse(-len * 0.45, 0, len * 0.2, len * 0.07, 0, 0, TAU); g.fill();
  g.restore();
  // глаза над водой
  const ex = x + Math.cos(a) * len * 0.3, ey = y + Math.sin(a) * len * 0.1 - 3;
  g.fillStyle = '#e8d040'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(ex + Math.cos(a + Math.PI / 2) * 4 * s, ey + Math.sin(a + Math.PI / 2) * 1.5 * s, 2.2, 1.6, 0, 0, TAU); g.fill(); }
  g.fillStyle = '#1a1a10'; for (const s of [-1, 1]) { g.beginPath(); g.arc(ex + Math.cos(a + Math.PI / 2) * 4 * s, ey + Math.sin(a + Math.PI / 2) * 1.5 * s, 0.8, 0, TAU); g.fill(); }
  g.strokeStyle = 'rgba(230,245,245,.35)'; g.lineWidth = 1; const q = (t * 0.4 + seed * 0.1) % 1; g.globalAlpha = 1 - q; g.beginPath(); g.ellipse(x, y, len * (0.3 + q * 0.5), len * (0.1 + q * 0.18), 0, 0, TAU); g.stroke(); g.globalAlpha = 1;
}
