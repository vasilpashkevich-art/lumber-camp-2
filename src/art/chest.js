// v96: сундук подземелья — крупный, добротный: дубовые доски, кованые полосы и уголки, ножки, висячий замок.
// Закрытый — выпуклая крышка; открытый — крышка откинута назад на петлях и стоит за ящиком, внутри монеты и свет.
// Вид три четверти: лицо, правый бок, верх. (x, y) — точка на полу посередине перед лицом. Свет — слева сверху.
const TAU = Math.PI * 2, O = '#24180f';
const sh = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join(''); };
function path(g, pts, fill, lw = 1.2, close = true) { g.beginPath(); pts.forEach(([a, b], i) => i ? g.lineTo(a, b) : g.moveTo(a, b)); if (close) g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = O; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
const WOOD = '#80522c', IRON = '#3e3b38', IRON_L = '#8e8a84', BRASS = '#d6a640';

export const CHEST = { W: 56, H: 24, D: 18, L: 13 };   // ширина, высота ящика, глубина, высота свода крышки

/** Доски с прожилками в прямоугольнике (или в четырёхугольнике по углам). */
function planks(g, x0, y0, w, h, n, col, vertical = false) {
  for (let i = 0; i < n; i++) {
    const c = sh(col, [0.05, -0.04, 0.02, -0.07][i % 4]);
    if (vertical) { const px = x0 + i * w / n; g.fillStyle = c; g.fillRect(px, y0, w / n + 0.3, h); }
    else { const py = y0 + i * h / n; g.fillStyle = c; g.fillRect(x0, py, w, h / n + 0.3); }
  }
  g.strokeStyle = 'rgba(30,18,8,.45)'; g.lineWidth = 0.8;
  for (let i = 1; i < n; i++) { g.beginPath(); if (vertical) { g.moveTo(x0 + i * w / n, y0); g.lineTo(x0 + i * w / n, y0 + h); } else { g.moveTo(x0, y0 + i * h / n); g.lineTo(x0 + w, y0 + i * h / n); } g.stroke(); }
  g.strokeStyle = 'rgba(30,18,8,.18)'; g.lineWidth = 0.6;
  for (let i = 0; i < n * 3; i++) { const t = (i * 0.37) % 1; if (vertical) { const px = x0 + (i % n + 0.3 + t * 0.4) * w / n; g.beginPath(); g.moveTo(px, y0 + 2); g.quadraticCurveTo(px + 1.2, y0 + h / 2, px, y0 + h - 2); g.stroke(); } else { const py = y0 + (i % n + 0.35 + t * 0.3) * h / n; g.beginPath(); g.moveTo(x0 + 3 + t * 8, py); g.quadraticCurveTo(x0 + w / 2, py + 0.8, x0 + w - 3 - t * 6, py); g.stroke(); } }
}
const rivet = (g, x, y, r = 1.1) => { g.fillStyle = '#d8d2c6'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(x + r * 0.35, y + r * 0.35, r * 0.6, 0, TAU); g.fill(); };
/** Кованая вертикальная полоса с бликом слева и заклёпками. */
function band(g, x, y0, y1, w = 4.5) { g.fillStyle = IRON; g.fillRect(x, y0, w, y1 - y0); g.fillStyle = IRON_L; g.fillRect(x, y0, 1.2, y1 - y0); g.strokeStyle = O; g.lineWidth = 0.8; g.strokeRect(x, y0, w, y1 - y0); for (let yy = y0 + 3; yy < y1 - 1; yy += 7) rivet(g, x + w / 2, yy); }

/** Сундук. open — откинута крышка; t — время (свет мерцает); gold — монеты внутри. */
export function chestBig(g, x, y, open = false, t = 0, gold = true) {
  const { W, H, D, L } = CHEST, dx = D * 0.42, dy = D * 0.5;   // глубина уходит вправо-вверх
  const xl = x - W / 2, xr = x + W / 2, top = y - H;
  // тень на полу
  g.fillStyle = 'rgba(0,0,0,.34)'; g.beginPath(); g.ellipse(x + dx * 0.6, y - dy * 0.2 + 2, W * 0.62, 9, 0, 0, TAU); g.fill();
  // ножки
  for (const fx of [xl + 3, xr - 7]) { path(g, [[fx, y], [fx + 5, y], [fx + 5, y + 3], [fx, y + 3]], IRON, 0.8); }
  path(g, [[xr + dx - 6, y - dy], [xr + dx - 2, y - dy], [xr + dx - 2, y - dy + 3], [xr + dx - 6, y - dy + 3]], sh(IRON, -0.2), 0.8);

  if (open) lidOpen(g, x, y, t);
  // ---- ящик
  // правый бок
  path(g, [[xr, y], [xr + dx, y - dy], [xr + dx, top - dy], [xr, top]], sh(WOOD, -0.38), 1.2);
  g.save(); g.beginPath(); g.moveTo(xr, y); g.lineTo(xr + dx, y - dy); g.lineTo(xr + dx, top - dy); g.lineTo(xr, top); g.closePath(); g.clip();
  g.strokeStyle = 'rgba(20,10,4,.4)'; g.lineWidth = 0.8; for (let i = 1; i < 3; i++) { g.beginPath(); g.moveTo(xr, top + i * H / 3); g.lineTo(xr + dx, top - dy + i * H / 3); g.stroke(); }
  g.fillStyle = sh(IRON, -0.25); g.beginPath(); g.moveTo(xr + dx * 0.35, y - dy * 0.35); g.lineTo(xr + dx * 0.6, y - dy * 0.6); g.lineTo(xr + dx * 0.6, top - dy * 0.6); g.lineTo(xr + dx * 0.35, top - dy * 0.35); g.closePath(); g.fill();
  g.restore();
  // ручка на боку
  { const hx = xr + dx * 0.5, hy = top - dy * 0.5 + H * 0.32; g.fillStyle = IRON; g.fillRect(hx - 1.6, hy - 2, 3.2, 3); g.strokeStyle = O; g.lineWidth = 2.6; g.beginPath(); g.ellipse(hx, hy + 4, 2.4, 4, 0, -Math.PI * 0.5, Math.PI * 1.5); g.stroke(); g.strokeStyle = IRON_L; g.lineWidth = 1.1; g.stroke(); }
  if (open) interior(g, x, y, t, gold);
  // лицо: доски
  planks(g, xl, top, W, H, 3, WOOD);
  const lg = g.createLinearGradient(xl, 0, xr, 0); lg.addColorStop(0, 'rgba(255,230,190,.12)'); lg.addColorStop(1, 'rgba(0,0,0,.12)'); g.fillStyle = lg; g.fillRect(xl, top, W, H);
  g.strokeStyle = O; g.lineWidth = 1.3; g.strokeRect(xl, top, W, H);
  // нижний и верхний обод
  g.fillStyle = IRON; g.fillRect(xl, y - 3.5, W, 3.5); g.fillStyle = IRON_L; g.fillRect(xl, y - 3.5, W, 0.9); g.strokeStyle = O; g.lineWidth = 0.8; g.strokeRect(xl, y - 3.5, W, 3.5);
  g.fillStyle = IRON; g.fillRect(xl, top, W, 3); g.fillStyle = IRON_L; g.fillRect(xl, top, W, 0.8); g.strokeRect(xl, top, W, 3);
  // полосы
  for (const bx of [xl + 9, xr - 13.5]) band(g, bx, top, y);
  // уголки
  for (const [cx, sx] of [[xl, 1], [xr, -1]]) { path(g, [[cx, top], [cx + sx * 8, top], [cx + sx * 8, top + 3], [cx + sx * 3, top + 3], [cx + sx * 3, top + 8], [cx, top + 8]], IRON, 0.8); path(g, [[cx, y], [cx + sx * 8, y], [cx + sx * 8, y - 3.5], [cx + sx * 3, y - 3.5], [cx + sx * 3, y - 8], [cx, y - 8]], IRON, 0.8); rivet(g, cx + sx * 1.6, top + 5.5, 0.9); rivet(g, cx + sx * 1.6, y - 5.5, 0.9); }
  // замочная накладка
  path(g, [[x - 5.5, top + 1], [x + 5.5, top + 1], [x + 5.5, top + 10], [x, top + 13], [x - 5.5, top + 10]], BRASS, 1);
  g.fillStyle = sh(BRASS, -0.45); g.beginPath(); g.arc(x, top + 6, 1.6, 0, TAU); g.fill(); g.fillRect(x - 0.7, top + 6.5, 1.4, 3.5);
  if (!open) lidClosed(g, x, y);
  // висячий замок: закрытый — на петле посередине, открытый — висит отомкнутый сбоку
  if (open) { g.save(); g.translate(x + 3, top + 12); g.rotate(0.5); padlock(g, 0, 0, true); g.restore(); }
  else padlock(g, x, top + 4, false);
}

function padlock(g, x, y, opened) {
  g.strokeStyle = O; g.lineWidth = 3; g.beginPath(); g.arc(x + (opened ? 2 : 0), y - 1, 3.6, Math.PI, 0); g.stroke();
  g.strokeStyle = '#9a948a'; g.lineWidth = 1.6; g.stroke();
  path(g, [[x - 5, y - 1], [x + 5, y - 1], [x + 5, y + 6], [x + 3, y + 8], [x - 3, y + 8], [x - 5, y + 6]], BRASS, 1);
  g.fillStyle = 'rgba(255,240,180,.6)'; g.fillRect(x - 4, y, 1.2, 5);
  g.fillStyle = '#3a2810'; g.beginPath(); g.arc(x, y + 3, 1.2, 0, TAU); g.fill(); g.fillRect(x - 0.5, y + 3.5, 1, 2.2);
}

/** Закрытая крышка: свод над ящиком — лицо свода и торец полукругом справа. */
function lidClosed(g, x, y) {
  const { W, H, D, L } = CHEST, dx = D * 0.42, dy = D * 0.5, xl = x - W / 2, xr = x + W / 2, top = y - H;
  // торец свода справа (полуэллипс между передним и задним краем)
  const ex = xr + dx / 2, ey = top - dy / 2;
  g.save(); g.translate(ex, ey); g.rotate(-Math.atan2(dy, dx) * 0.0);
  g.beginPath(); g.moveTo(-dx / 2, dy / 2); g.bezierCurveTo(-dx / 2, dy / 2 - L * 1.3, dx / 2, -dy / 2 - L * 1.3, dx / 2, -dy / 2); g.closePath(); g.fillStyle = sh(WOOD, -0.42); g.fill(); g.strokeStyle = O; g.lineWidth = 1.2; g.stroke();
  g.restore();
  // свод: от переднего края вверх-назад к заднему, видимая поверхность — как цилиндр
  const fy = top, by = top - dy, crest = top - dy / 2 - L;
  const lg = g.createLinearGradient(0, crest, 0, fy); lg.addColorStop(0, sh(WOOD, 0.28)); lg.addColorStop(0.55, sh(WOOD, 0.05)); lg.addColorStop(1, sh(WOOD, -0.18));
  g.beginPath(); g.moveTo(xl, fy); g.bezierCurveTo(xl, fy - L * 1.1, xl + dx * 0.5, crest, xl + dx * 0.5 + 2, crest); g.lineTo(xr + dx * 0.5 - 2, crest);
  g.bezierCurveTo(xr + dx * 0.5, crest, xr, fy - L * 1.1, xr, fy); g.closePath();
  g.fillStyle = lg; g.fill();
  // доски вдоль свода
  g.save(); g.clip(); g.strokeStyle = 'rgba(30,18,8,.35)'; g.lineWidth = 0.8; for (let i = 1; i < 4; i++) { const yy = fy - (fy - crest) * i / 4; g.beginPath(); g.moveTo(xl - 2, yy); g.lineTo(xr + dx, yy); g.stroke(); } g.restore();
  g.beginPath(); g.moveTo(xl, fy); g.bezierCurveTo(xl, fy - L * 1.1, xl + dx * 0.5, crest, xl + dx * 0.5 + 2, crest); g.lineTo(xr + dx * 0.5 - 2, crest); g.bezierCurveTo(xr + dx * 0.5, crest, xr, fy - L * 1.1, xr, fy); g.closePath(); g.strokeStyle = O; g.lineWidth = 1.3; g.stroke();
  // полосы через свод
  for (const bx of [xl + 9, xr - 13.5]) { const k = (bx - xl) / W; g.beginPath(); g.moveTo(bx, fy); g.bezierCurveTo(bx, fy - L * 1.1, bx + dx * 0.5, crest, bx + dx * 0.5 + 0.5, crest); g.lineTo(bx + dx * 0.5 + 5, crest); g.bezierCurveTo(bx + 4.5 + dx * 0.5, crest, bx + 4.5, fy - L * 1.1, bx + 4.5, fy); g.closePath(); g.fillStyle = IRON; g.fill(); g.strokeStyle = O; g.lineWidth = 0.8; g.stroke(); rivet(g, bx + 2.3, fy - 4); rivet(g, bx + 2.3 + dx * 0.3, fy - L * 0.85); void k; }
  // нижний обод крышки
  g.fillStyle = IRON; g.fillRect(xl - 1, fy - 3, W + 2, 3.2); g.fillStyle = IRON_L; g.fillRect(xl - 1, fy - 3, W + 2, 0.9); g.strokeStyle = O; g.lineWidth = 0.8; g.strokeRect(xl - 1, fy - 3, W + 2, 3.2);
  // петля замка
  path(g, [[x - 3, fy - 4], [x + 3, fy - 4], [x + 3, fy + 3], [x - 3, fy + 3]], IRON, 0.8);
}

/** Открытая крышка: откинута назад на петлях, стоит за ящиком — видна изнанка (доски, полосы), край свода сверху. */
function lidOpen(g, x, y, t) {
  const { W, H, D, L } = CHEST, dx = D * 0.42, dy = D * 0.5, top = y - H;
  const hx0 = x - W / 2 + dx, hx1 = x + W / 2 + dx, hy = top - dy;      // петли — задний верхний край
  const lean = 5, up = D + L * 0.9;                                       // откинута чуть дальше вертикали
  const x0 = hx0 + lean, x1 = hx1 + lean, ty = hy - up;
  // торец свода справа (полукруг смотрит назад)
  g.beginPath(); g.moveTo(hx1, hy); g.bezierCurveTo(hx1 + L * 0.55, hy - up * 0.25, x1 + L * 0.5, ty + up * 0.2, x1, ty); g.closePath(); g.fillStyle = sh(WOOD, -0.45); g.fill(); g.strokeStyle = O; g.lineWidth = 1.1; g.stroke();
  // изнанка крышки
  g.save(); g.beginPath(); g.moveTo(hx0, hy); g.lineTo(x0, ty); g.lineTo(x1, ty); g.lineTo(hx1, hy); g.closePath(); g.clip();
  planks(g, hx0 - 2, ty, (hx1 - hx0) + lean + 4, up, 4, sh(WOOD, -0.18), true);
  const sg = g.createLinearGradient(0, ty, 0, hy); sg.addColorStop(0, 'rgba(0,0,0,.05)'); sg.addColorStop(1, 'rgba(0,0,0,.35)'); g.fillStyle = sg; g.fillRect(hx0 - 4, ty, hx1 - hx0 + lean + 8, up);
  // свет из сундука снизу
  const fl = 0.85 + 0.15 * Math.sin(t * 5); const lg = g.createRadialGradient((hx0 + hx1) / 2, hy, 2, (hx0 + hx1) / 2, hy, up); lg.addColorStop(0, `rgba(255,214,120,${0.45 * fl})`); lg.addColorStop(1, 'rgba(255,214,120,0)'); g.fillStyle = lg; g.fillRect(hx0, ty, hx1 - hx0 + lean, up);
  // поперечные полосы изнанки
  for (const k of [0.3, 0.72]) { const yy = hy - up * k, xs = hx0 + lean * k, xe = hx1 + lean * k; g.fillStyle = IRON; g.fillRect(xs, yy - 2, xe - xs, 4); g.fillStyle = IRON_L; g.fillRect(xs, yy - 2, xe - xs, 0.8); for (let xx = xs + 4; xx < xe; xx += 10) rivet(g, xx, yy, 0.9); }
  g.restore();
  g.beginPath(); g.moveTo(hx0, hy); g.lineTo(x0, ty); g.lineTo(x1, ty); g.lineTo(hx1, hy); g.closePath(); g.strokeStyle = O; g.lineWidth = 1.3; g.stroke();
  // кромка свода сверху (видна толщина) и железный обод
  g.fillStyle = sh(WOOD, 0.15); g.beginPath(); g.moveTo(x0, ty); g.lineTo(x1, ty); g.lineTo(x1 + 3, ty - 3); g.lineTo(x0 + 3, ty - 3); g.closePath(); g.fill(); g.strokeStyle = O; g.lineWidth = 0.9; g.stroke();
  g.fillStyle = IRON; g.fillRect(x0, ty, x1 - x0, 3); g.strokeRect(x0, ty, x1 - x0, 3);
  // петли
  for (const px of [hx0 + 10, hx1 - 14]) { path(g, [[px, hy - 6], [px + 6, hy - 6], [px + 6, hy + 2], [px, hy + 2]], IRON, 0.8); g.fillStyle = IRON_L; g.fillRect(px, hy - 1.5, 6, 2); }
}

/** Внутри открытого: тёмный короб, задняя и боковая стенки, горка монет с самоцветом, свет. */
function interior(g, x, y, t, gold) {
  const { W, H, D } = CHEST, dx = D * 0.42, dy = D * 0.5, xl = x - W / 2, xr = x + W / 2, top = y - H;
  // проём сверху
  path(g, [[xl, top], [xr, top], [xr + dx, top - dy], [xl + dx, top - dy]], '#1a0f06', 1.2);
  // задняя внутренняя стенка (видна полоской)
  g.fillStyle = sh(WOOD, -0.5); g.beginPath(); g.moveTo(xl + dx, top - dy); g.lineTo(xr + dx, top - dy); g.lineTo(xr + dx - 2, top - dy + 6); g.lineTo(xl + dx + 2, top - dy + 6); g.closePath(); g.fill();
  if (gold) {
    const fl = 0.85 + 0.15 * Math.sin(t * 5);
    // горка монет — выше переднего края
    const cx = x + dx * 0.45, cy = top - dy * 0.45;
    g.save(); g.beginPath(); g.moveTo(xl + 1, top); g.lineTo(xl + dx, top - dy - 12); g.lineTo(xr + dx, top - dy - 12); g.lineTo(xr, top); g.closePath(); g.clip();
    g.fillStyle = '#b8862a'; g.beginPath(); g.ellipse(cx, cy + 2, W * 0.46, 7, 0, Math.PI, 0); g.fill();
    g.fillStyle = '#e2b443'; g.beginPath(); g.ellipse(cx, cy + 1, W * 0.4, 5.5, 0, Math.PI, 0); g.fill();
    const coins = [[-18, 0], [-12, -2], [-6, -3], [0, -4], [6, -3], [12, -2], [18, 0], [-9, 1], [3, 0], [14, 1], [-15, -1], [9, -1]];
    for (const [ox, oy] of coins) { g.fillStyle = '#f2cc58'; g.beginPath(); g.ellipse(cx + ox, cy + oy, 3.2, 1.6, 0, 0, TAU); g.fill(); g.strokeStyle = '#8a6216'; g.lineWidth = 0.6; g.stroke(); g.fillStyle = '#fff2b0'; g.fillRect(cx + ox - 1.5, cy + oy - 0.8, 1.6, 0.6); }
    // самоцвет и кубок
    g.fillStyle = '#3aa86a'; g.beginPath(); g.moveTo(cx - 4, cy - 4); g.lineTo(cx - 1, cy - 7); g.lineTo(cx + 2, cy - 4); g.lineTo(cx - 1, cy - 2); g.closePath(); g.fill(); g.strokeStyle = O; g.lineWidth = 0.6; g.stroke();
    path(g, [[cx + 8, cy - 2], [cx + 14, cy - 2], [cx + 13, cy - 8], [cx + 15, cy - 11], [cx + 7, cy - 11], [cx + 9, cy - 8]], '#e2b443', 0.7);
    g.restore();
    // свет над сундуком
    g.save(); g.globalCompositeOperation = 'lighter';
    const gl = g.createRadialGradient(cx, cy - 4, 2, cx, cy - 4, 40); gl.addColorStop(0, `rgba(255,220,130,${0.5 * fl})`); gl.addColorStop(1, 'rgba(255,220,130,0)'); g.fillStyle = gl; g.fillRect(cx - 40, cy - 44, 80, 60);
    for (let i = 0; i < 5; i++) { const q = (t * 0.6 + i / 5) % 1, sx = cx - 16 + i * 8, sy = cy - 6 - q * 26; g.fillStyle = `rgba(255,236,160,${Math.sin(q * Math.PI) * 0.8})`; g.beginPath(); g.arc(sx, sy, 1.2, 0, TAU); g.fill(); }
    g.restore();
  }
}
