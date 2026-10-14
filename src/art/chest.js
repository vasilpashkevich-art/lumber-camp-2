// v96: сундук подземелья в мультяшном стиле — прямо спереди и чуть сверху (без кривой перспективы), круглые формы,
// толстые стенки, крупные кованые полосы и заклёпки; обводка не чёрная, а тёмная в цвет дерева и железа.
// Закрытый — пухлая крышка-свод; открытый — крышка откинута назад на петлях и стоит за ящиком, видна толщина стенок, внутри золото и свет.
// (x, y) — точка на полу посередине перед сундуком. Свет — слева сверху.
const TAU = Math.PI * 2;
const sh = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join(''); };
const WOOD = '#9a5f30', WOOD_IN = '#6a3c1c', IRON = '#5c6170', IRON_L = '#aab2c2', GOLD = '#f2c447';
const INK_W = '#4a2812', INK_I = '#2e3140';   // обводка: дерево и железо
export const CHEST = { W: 58, H: 26, L: 20, T: 6, Dv: 11 };   // ширина, высота ящика, высота свода, толщина стенок, глубина верха на экране

const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
function fillStroke(g, fill, ink, lw = 1.6) { g.fillStyle = fill; g.fill(); g.strokeStyle = ink; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); }
const vgrad = (g, y0, y1, a, b) => { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, a); gr.addColorStop(1, b); return gr; };
const rivet = (g, x, y, r = 1.7) => { g.beginPath(); g.arc(x, y, r, 0, TAU); fillStroke(g, '#c8ccd6', INK_I, 0.8); g.fillStyle = '#fff'; g.beginPath(); g.arc(x - r * 0.35, y - r * 0.35, r * 0.4, 0, TAU); g.fill(); };
/** Прожилки на доске — мягкие светлые и тёмные дуги. */
function grain(g, x0, y0, w, h, n, seed = 1) {
  g.save(); g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const k = ((i * 0.618 + seed * 0.31) % 1), y = y0 + h * (0.25 + 0.5 * k), xa = x0 + w * (0.08 + 0.3 * ((i * 0.37) % 1)), xb = xa + w * (0.25 + 0.2 * k);
    g.strokeStyle = 'rgba(70,35,12,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(xa, y); g.quadraticCurveTo((xa + xb) / 2, y - 1.5, xb, y); g.stroke(); }
  g.restore();
}

/** Сундук. open — открыт; t — время (свет мерцает); gold — золото внутри. */
export function chestBig(g, x, y, open = false, t = 0, gold = true) {
  const { W, H } = CHEST, xl = x - W / 2, top = y - H;
  // тень
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(x + 3, y + 1, W * 0.6, 8, 0, 0, TAU); g.fill();
  // ножки — круглые
  for (const fx of [xl + 7, x + W / 2 - 7]) { g.beginPath(); g.ellipse(fx, y + 1, 5, 3.4, 0, 0, TAU); fillStroke(g, IRON, INK_I, 1.2); }
  if (open) { lidOpen(g, x, y, t); topOpen(g, x, y, t, gold); }
  // ---- ящик: скруглённое тело, доски толстыми рядами
  rr(g, xl, top, W, H, 7); g.save(); g.clip();
  g.fillStyle = vgrad(g, top, y, sh(WOOD, 0.12), sh(WOOD, -0.18)); g.fillRect(xl, top, W, H);
  for (let i = 1; i < 3; i++) { g.strokeStyle = sh(WOOD, -0.38); g.lineWidth = 1.4; g.beginPath(); g.moveTo(xl, top + i * H / 3); g.lineTo(xl + W, top + i * H / 3); g.stroke(); g.strokeStyle = sh(WOOD, 0.25); g.lineWidth = 0.8; g.beginPath(); g.moveTo(xl, top + i * H / 3 + 1.2); g.lineTo(xl + W, top + i * H / 3 + 1.2); g.stroke(); }
  grain(g, xl, top, W, H, 6, 2);
  g.fillStyle = 'rgba(255,240,210,.18)'; g.fillRect(xl, top, 6, H);                  // свет слева
  g.fillStyle = 'rgba(40,16,0,.18)'; g.fillRect(xl + W - 7, top, 7, H);              // тень справа
  g.restore();
  rr(g, xl, top, W, H, 7); g.strokeStyle = INK_W; g.lineWidth = 2; g.stroke();
  // нижний обод — толстый, скруглённый
  rr(g, xl - 1, y - 6, W + 2, 6, 3); fillStroke(g, vgrad(g, y - 6, y, IRON_L, IRON), INK_I, 1.4);
  // полосы
  for (const bx of [xl + 10, x + W / 2 - 18]) { rr(g, bx, top - 1, 8, H + 1, 2.5); fillStroke(g, vgrad(g, top, y, sh(IRON, 0.25), sh(IRON, -0.15)), INK_I, 1.4); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(bx + 1.5, top + 1, 1.6, H - 3); for (const ry of [top + 5, top + H / 2, y - 9]) rivet(g, bx + 4, ry); }
  // уголки — округлые накладки внизу
  for (const sx of [-1, 1]) { const cx = x + sx * (W / 2 - 4.5); rr(g, cx - 5.5, y - 13, 11, 10, 3.5); fillStroke(g, vgrad(g, y - 13, y - 3, sh(IRON, 0.3), IRON), INK_I, 1.2); rivet(g, cx, y - 8, 1.4); }
  if (!open) lidClosed(g, x, y);
  else rimFront(g, x, y);
  // замок
  const ly = top + (open ? 2 : -1);
  g.beginPath(); g.moveTo(x - 7, ly); g.lineTo(x + 7, ly); g.lineTo(x + 7, ly + 9); g.quadraticCurveTo(x, ly + 15, x - 7, ly + 9); g.closePath(); fillStroke(g, vgrad(g, ly, ly + 14, '#ffe08a', '#c8901e'), '#6a4410', 1.4);
  g.fillStyle = '#4a2c08'; g.beginPath(); g.arc(x, ly + 5, 1.9, 0, TAU); g.fill(); g.beginPath(); g.moveTo(x - 1.2, ly + 6); g.lineTo(x + 1.2, ly + 6); g.lineTo(x + 0.8, ly + 10); g.lineTo(x - 0.8, ly + 10); g.closePath(); g.fill();
  if (open) { g.save(); g.translate(x + 9, ly + 12); g.rotate(0.45); padlock(g, 0, 0, true); g.restore(); }
  else padlock(g, x, ly + 4, false);
}

function padlock(g, x, y, opened) {
  g.lineCap = 'round';
  g.strokeStyle = INK_I; g.lineWidth = 4; g.beginPath(); g.arc(x + (opened ? 2.5 : 0), y - 1, 4, Math.PI, opened ? -0.4 : 0); g.stroke();
  g.strokeStyle = '#c8ccd6'; g.lineWidth = 2; g.stroke();
  rr(g, x - 6, y - 1, 12, 10, 3.5); fillStroke(g, vgrad(g, y - 1, y + 9, '#ffe08a', '#c8901e'), '#6a4410', 1.4);
  g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(x - 4, y + 1, 1.6, 5);
  g.fillStyle = '#4a2c08'; g.beginPath(); g.arc(x, y + 3.5, 1.4, 0, TAU); g.fill(); g.fillRect(x - 0.6, y + 4, 1.2, 2.6);
}

/** Закрытая крышка: пухлый свод над ящиком (виден сверху-спереди), полосы через свод. */
function lidClosed(g, x, y) {
  const { W, H, L } = CHEST, xl = x - W / 2 - 2, xr = x + W / 2 + 2, base = y - H + 2, crest = y - H - L;
  const dome = () => { g.beginPath(); g.moveTo(xl, base); g.lineTo(xl, base - 4); g.bezierCurveTo(xl, crest + 2, xl + 6, crest, x - W * 0.3, crest); g.lineTo(x + W * 0.3, crest); g.bezierCurveTo(xr - 6, crest, xr, crest + 2, xr, base - 4); g.lineTo(xr, base); g.closePath(); };
  dome(); g.save(); g.clip();
  g.fillStyle = vgrad(g, crest, base, sh(WOOD, 0.3), sh(WOOD, -0.12)); g.fillRect(xl, crest, xr - xl, base - crest);
  // доски вдоль свода — дуги
  for (const k of [0.38, 0.7]) { const yy = crest + (base - crest) * k; g.strokeStyle = sh(WOOD, -0.35); g.lineWidth = 1.3; g.beginPath(); g.moveTo(xl, yy + 3); g.quadraticCurveTo(x, yy - 2, xr, yy + 3); g.stroke(); g.strokeStyle = sh(WOOD, 0.3); g.lineWidth = 0.8; g.beginPath(); g.moveTo(xl, yy + 4.3); g.quadraticCurveTo(x, yy - 0.7, xr, yy + 4.3); g.stroke(); }
  grain(g, xl, crest, xr - xl, base - crest, 4, 5);
  g.fillStyle = 'rgba(255,245,220,.28)'; g.beginPath(); g.ellipse(x - W * 0.16, crest + 4, W * 0.26, 2.6, 0, 0, TAU); g.fill();   // блик на гребне
  g.restore();
  dome(); g.strokeStyle = INK_W; g.lineWidth = 2; g.stroke();
  // полосы через свод
  for (const bx of [x - W / 2 + 10, x + W / 2 - 18]) { g.beginPath(); g.moveTo(bx, base); g.lineTo(bx, crest + 3); g.quadraticCurveTo(bx + 4, crest - 1.5, bx + 8, crest + 3); g.lineTo(bx + 8, base); g.closePath(); fillStroke(g, vgrad(g, crest, base, sh(IRON, 0.35), sh(IRON, -0.1)), INK_I, 1.4); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(bx + 1.5, crest + 3, 1.6, base - crest - 5); rivet(g, bx + 4, crest + 5); rivet(g, bx + 4, base - 5); }
  // обод крышки — толстый
  rr(g, xl - 1, base - 6, xr - xl + 2, 7, 3.5); fillStroke(g, vgrad(g, base - 6, base + 1, IRON_L, IRON), INK_I, 1.4);
}

/** Открытая крышка: откинута назад — стоит за ящиком изнанкой к нам, слегка уходит назад (верх уже). */
function lidOpen(g, x, y, t) {
  const { W, H, L, Dv } = CHEST, hb = y - H - Dv + 1, up = L + 16, w0 = W / 2 + 1, w1 = W / 2 - 3, ty = hb - up;
  // толщина свода сверху (крышка выпуклая — её спинка видна над изнанкой)
  g.beginPath(); g.moveTo(x - w1 - 1, ty + 3); g.quadraticCurveTo(x, ty - 9, x + w1 + 1, ty + 3); g.closePath(); fillStroke(g, sh(WOOD, 0.05), INK_W, 1.8);
  // изнанка
  const face = () => { g.beginPath(); g.moveTo(x - w0, hb); g.lineTo(x - w1, ty + 4); g.quadraticCurveTo(x - w1, ty, x - w1 + 4, ty); g.lineTo(x + w1 - 4, ty); g.quadraticCurveTo(x + w1, ty, x + w1, ty + 4); g.lineTo(x + w0, hb); g.closePath(); };
  face(); g.save(); g.clip();
  g.fillStyle = vgrad(g, ty, hb, sh(WOOD_IN, 0.15), sh(WOOD_IN, -0.25)); g.fillRect(x - w0, ty, w0 * 2, up + 2);
  for (let i = 1; i < 5; i++) { const fx = x - w0 + i * (w0 * 2) / 5; g.strokeStyle = sh(WOOD_IN, -0.4); g.lineWidth = 1.2; g.beginPath(); g.moveTo(fx, hb); g.lineTo(x - w1 + i * (w1 * 2) / 5, ty); g.stroke(); }
  const fl = 0.85 + 0.15 * Math.sin(t * 5), lg = g.createRadialGradient(x, hb + 4, 2, x, hb, up * 1.1); lg.addColorStop(0, `rgba(255,214,120,${0.55 * fl})`); lg.addColorStop(1, 'rgba(255,214,120,0)'); g.fillStyle = lg; g.fillRect(x - w0, ty, w0 * 2, up + 2);
  for (const k of [0.32, 0.72]) { const yy = hb - up * k, ww = w0 - (w0 - w1) * k; rr(g, x - ww, yy - 2.5, ww * 2, 5, 2); fillStroke(g, IRON, INK_I, 1.1); for (let xx = x - ww + 5; xx < x + ww - 3; xx += 11) rivet(g, xx, yy, 1.3); }
  g.restore();
  face(); g.strokeStyle = INK_W; g.lineWidth = 2; g.stroke();
  // обод по краю крышки
  rr(g, x - w1 - 1, ty - 1, w1 * 2 + 2, 5, 2.5); fillStroke(g, vgrad(g, ty - 1, ty + 4, IRON_L, IRON), INK_I, 1.2);
  // петли
  for (const px of [x - W / 2 + 12, x + W / 2 - 18]) { rr(g, px, hb - 6, 6, 9, 2); fillStroke(g, IRON, INK_I, 1); g.fillStyle = IRON_L; g.fillRect(px + 1, hb - 2, 4, 1.6); }
}

/** Верх открытого ящика: толстый борт светлого дерева вокруг тёмного нутра, золото горкой и свет. */
function topOpen(g, x, y, t, gold) {
  const { W, H, T, Dv } = CHEST, xl = x - W / 2, top = y - H, back = top - Dv;
  // верхняя грань — борт (вид сверху), скруглённая
  rr(g, xl, back, W, Dv + 6, 6); fillStroke(g, vgrad(g, back, top, sh(WOOD, 0.35), sh(WOOD, 0.1)), INK_W, 1.8);
  // нутро
  rr(g, xl + T, back + T * 0.55, W - T * 2, Dv - T * 0.55 + 2, 4); g.fillStyle = '#2a1408'; g.fill();
  // задняя внутренняя стенка (светлее у края)
  g.fillStyle = sh(WOOD_IN, -0.2); g.fillRect(xl + T, back + T * 0.55, W - T * 2, 3);
  if (!gold) return;
  const fl = 0.85 + 0.15 * Math.sin(t * 5), cx = x, cy = top - 1;
  // горка золота — выше борта
  g.beginPath(); g.moveTo(xl + T - 1, cy); g.quadraticCurveTo(cx - W * 0.2, cy - 15, cx, cy - 16); g.quadraticCurveTo(cx + W * 0.2, cy - 15, x + W / 2 - T + 1, cy); g.closePath(); fillStroke(g, vgrad(g, cy - 16, cy, '#ffe27a', '#d89a26'), '#8a5a10', 1.3);
  const coins = [[-17, -3], [-10, -7], [-3, -10], [5, -9], [12, -6], [18, -3], [-14, -1], [-6, -4], [2, -5], [9, -2], [15, -1], [-1, -13], [6, -13]];
  for (const [ox, oy] of coins) { g.beginPath(); g.ellipse(cx + ox, cy + oy, 3.6, 2, 0, 0, TAU); fillStroke(g, GOLD, '#9a6a14', 0.8); g.fillStyle = '#fff7c8'; g.fillRect(cx + ox - 1.8, cy + oy - 1, 2, 0.8); }
  // самоцвет и кубок
  g.beginPath(); g.moveTo(cx - 9, cy - 12); g.lineTo(cx - 6, cy - 16); g.lineTo(cx - 3, cy - 12); g.lineTo(cx - 6, cy - 9.5); g.closePath(); fillStroke(g, '#46c486', '#1d6a44', 1);
  g.fillStyle = '#d8fff0'; g.beginPath(); g.arc(cx - 6.6, cy - 13.3, 0.8, 0, TAU); g.fill();
  g.beginPath(); g.moveTo(cx + 6, cy - 22); g.quadraticCurveTo(cx + 10, cy - 13, cx + 10, cy - 13); g.lineTo(cx + 9, cy - 9); g.lineTo(cx + 13, cy - 9); g.lineTo(cx + 12, cy - 13); g.quadraticCurveTo(cx + 16, cy - 15, cx + 16, cy - 22); g.closePath(); fillStroke(g, vgrad(g, cy - 22, cy - 9, '#ffe9a0', '#d09a2a'), '#8a5a10', 1.1);
  // свет и искорки
  g.save(); g.globalCompositeOperation = 'lighter';
  const gl = g.createRadialGradient(cx, cy - 10, 2, cx, cy - 10, 46); gl.addColorStop(0, `rgba(255,220,130,${0.5 * fl})`); gl.addColorStop(1, 'rgba(255,220,130,0)'); g.fillStyle = gl; g.fillRect(cx - 46, cy - 56, 92, 66);
  for (let i = 0; i < 6; i++) { const q = (t * 0.6 + i / 6) % 1, sx = cx - 20 + i * 8, sy = cy - 12 - q * 30, a = Math.sin(q * Math.PI) * 0.9, r = 1.2 + a; g.fillStyle = `rgba(255,240,170,${a})`; g.beginPath(); for (let k = 0; k < 8; k++) { const rr2 = k % 2 ? r * 0.35 : r * 1.6, an = k * Math.PI / 4; g.lineTo(sx + Math.cos(an) * rr2, sy + Math.sin(an) * rr2); } g.closePath(); g.fill(); }
  g.restore();
}
/** Передний борт открытого ящика поверх золота: толщина стенки — светлая кромка с железной полосой. */
function rimFront(g, x, y) {
  const { W, H } = CHEST, xl = x - W / 2, top = y - H;
  rr(g, xl - 1, top - 2, W + 2, 6, 3); fillStroke(g, vgrad(g, top - 2, top + 4, IRON_L, IRON), INK_I, 1.4);
}
