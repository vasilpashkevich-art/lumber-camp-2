// Эскиз v71: рельеф ярусами. Земля — области с уровнем (низина −1, равнина 0, возвышенность 1, вершина 2),
// склоны, лестницы и серпантины — плавный переход высоты. Вид сверху-сбоку: всё на ярусе L рисуется выше на L·LH,
// у края яруса, что смотрит к зрителю (на юг), виден обрыв. Через обрыв не пройти — только по склону.
// Модель (высота, проходимость) — без рисования, её потом возьмёт игра (src/world).
export const LH = 46;                 // высота яруса ≈ рост героя (42 шага × 1,1)
const O = '#24180f';

const rnd = s => () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
function inPoly(x, y, P) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
/** Неровный круг: середина, полуоси, неровность. */
export function blob(cx, cy, rx, ry, seed = 1, n = 28, rough = 0.12) {
  const r = rnd(seed * 97 + 13), ph = [r() * 6, r() * 6, r() * 6], P = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, k = 1 + rough * (Math.sin(a * 2 + ph[0]) * 0.5 + Math.sin(a * 3 + ph[1]) * 0.35 + Math.sin(a * 5 + ph[2]) * 0.25); P.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
  return P;
}
/** Полоса по ломаной (для оврага): точки оси и ширина. */
export function band(pts, w, seed = 1) {
  const r = rnd(seed), L = [], R = [];
  for (let i = 0; i < pts.length; i++) {
    const [x, y] = pts[i], [ax, ay] = pts[Math.max(0, i - 1)], [bx, by] = pts[Math.min(pts.length - 1, i + 1)];
    const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, k = w / 2 * (0.85 + r() * 0.3);
    L.push([x + nx * k, y + ny * k]); R.push([x - nx * k, y - ny * k]);
  }
  return [...L, ...R.reverse()];
}

/**
 * Рельеф: def = { W, H, regions: [{ lvl, poly }], ramps: [{ pts: [[x,y,lvl]...], w, kind: 'slope'|'stairs'|'path' }], hills: [[x,y,r]] }.
 * Области позже в списке перекрывают ранние.
 */
export function makeRelief(def) {
  const R = { ...def, LH };
  // склоны: ломаная из отрезков, высота плавно меняется вдоль
  R.segs = [];
  for (const rp of def.ramps) for (let i = 0; i < rp.pts.length - 1; i++) {
    const [x0, y0, l0] = rp.pts[i], [x1, y1, l1] = rp.pts[i + 1];
    R.segs.push({ x0, y0, l0, x1, y1, l1, w: rp.w, kind: rp.kind, len: Math.hypot(x1 - x0, y1 - y0) });
  }
  R.levelAt = (x, y) => { let l = 0; for (const g of def.regions) if (inPoly(x, y, g.poly)) l = g.lvl; return l; };
  /** Где на склоне: { s, t, h } или null. */
  R.onRamp = (x, y) => {
    let best = null;
    for (const s of R.segs) {
      const dx = s.x1 - s.x0, dy = s.y1 - s.y0, t = ((x - s.x0) * dx + (y - s.y0) * dy) / (s.len * s.len);
      if (t < -0.02 || t > 1.02) continue;
      const px = s.x0 + dx * t, py = s.y0 + dy * t, d = Math.hypot(x - px, y - py);
      if (d < s.w / 2 && (!best || d < best.d)) best = { s, t: Math.max(0, Math.min(1, t)), d };
    }
    if (best) best.h = (best.s.l0 + (best.s.l1 - best.s.l0) * best.t) * LH;
    return best;
  };
  R.height = (x, y) => { const r = R.onRamp(x, y); return r ? r.h : R.levelAt(x, y) * LH; };
  R.water = (x, y) => (def.ponds || []).some(([px, py, rx, ry]) => ((x - px) / rx) ** 2 + ((y - py) / ry) ** 2 < 1);
  /** Можно ли шагнуть: высота не прыгает больше чем на треть яруса. */
  R.canStep = (x0, y0, x1, y1) => !R.water(x1, y1) && x1 > 20 && y1 > 20 && x1 < def.W - 20 && y1 < def.H - 20 && Math.abs(R.height(x1, y1) - R.height(x0, y0)) <= LH * 0.3;
  R.min = Math.min(0, ...def.regions.map(g => g.lvl)); R.max = Math.max(0, ...def.regions.map(g => g.lvl));

  // края ярусов: для каждого уровня L — куски границы «L и выше» с внешней стороной (куда ниже)
  R.edges = {};
  for (let L = R.min + 1; L <= R.max; L++) {
    const E = [];
    for (const g of def.regions) {
      const P = g.poly;
      for (let i = 0; i < P.length; i++) {
        const [ax, ay] = P[i], [bx, by] = P[(i + 1) % P.length], len = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(len / 18));
        for (let k = 0; k < n; k++) {
          const x0 = ax + (bx - ax) * k / n, y0 = ay + (by - ay) * k / n, x1 = ax + (bx - ax) * (k + 1) / n, y1 = ay + (by - ay) * (k + 1) / n;
          const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, nx = -(y1 - y0) / (len / n), ny = (x1 - x0) / (len / n);
          const la = R.levelAt(mx + nx * 4, my + ny * 4), lb = R.levelAt(mx - nx * 4, my - ny * 4);
          if (la >= L && lb < L) E.push({ x0, y0, x1, y1, nx: -nx, ny: -ny, low: lb });
          else if (lb >= L && la < L) E.push({ x0, y0, x1, y1, nx, ny, low: la });
        }
      }
    }
    // убрать повторы (общие границы двух областей)
    const seen = new Set(); R.edges[L] = E.filter(e => { const k = Math.round(e.x0 + e.x1) + ',' + Math.round(e.y0 + e.y1); if (seen.has(k)) return false; seen.add(k); return true; });
  }
  return R;
}

// ---------------------------------------------------------------- рисование

/** Путь области «уровень ≥ L» (сдвинутый вверх на dy). */
function levelPath(g, R, L, dy) {
  g.beginPath();
  if (L <= 0) { g.rect(-50, -50 + dy, R.W + 100, R.H + 100); for (const r of R.regions) if (r.lvl < L) poly(g, r.poly, dy); }
  else for (const r of R.regions) if (r.lvl >= L) poly(g, r.poly, dy);
}
function poly(g, P, dy) { g.moveTo(P[0][0], P[0][1] + dy); for (let i = 1; i < P.length; i++) g.lineTo(P[i][0], P[i][1] + dy); g.closePath(); }

/**
 * Готовые слои земли: для каждого уровня — его верх, сдвинутый на высоту (с травой, тенью великанов, прудами).
 * ground(g, W, H) — рисует подложку (трава зоны). Возвращает { layers: {L: canvas}, pad } — холсты на всю поляну с запасом сверху.
 */
export function bakeLayers(R, ground, extra = () => { }) {
  const pad = (R.max + 1) * LH, W = R.W, H = R.H + pad + LH * 2;
  const base = document.createElement('canvas'); base.width = R.W; base.height = R.H; const bg = base.getContext('2d'); ground(bg, R.W, R.H);
  // пригорки: свет слева сверху, тень справа снизу
  for (const [x, y, r] of R.hills || []) {
    let gr = bg.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r); gr.addColorStop(0, 'rgba(255,250,200,.20)'); gr.addColorStop(0.55, 'rgba(255,250,200,.05)'); gr.addColorStop(1, 'rgba(255,250,200,0)'); bg.fillStyle = gr; bg.beginPath(); bg.ellipse(x, y, r, r * 0.8, 0, 0, 7); bg.fill();
    gr = bg.createRadialGradient(x + r * 0.45, y + r * 0.4, r * 0.1, x + r * 0.2, y + r * 0.2, r * 0.95); gr.addColorStop(0, 'rgba(20,30,10,.22)'); gr.addColorStop(1, 'rgba(20,30,10,0)'); bg.fillStyle = gr; bg.beginPath(); bg.ellipse(x + r * 0.2, y + r * 0.2, r, r * 0.8, 0, 0, 7); bg.fill();
  }
  const layers = {};
  for (let L = R.min; L <= R.max; L++) {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
    const dy = pad - L * LH;                       // в холсте слоя: экранный y = мировой y − L·LH + pad
    g.save(); levelPath(g, R, L, dy); g.clip('evenodd');
    g.drawImage(base, 0, dy);
    // ярус чуть другим цветом: низина сырее и темнее, высота суше и светлее, на вершине — камень проступает
    g.fillStyle = L < 0 ? 'rgba(30,50,25,.30)' : L === 1 ? 'rgba(255,240,180,.07)' : L >= 2 ? 'rgba(230,220,190,.13)' : 'rgba(0,0,0,0)'; g.fillRect(0, 0, W, H);
    if (L >= 2) { const r = rnd(L * 31); for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * H; g.fillStyle = 'rgba(140,132,118,.35)'; g.beginPath(); g.ellipse(x, y, 4 + r() * 9, 2 + r() * 4, r(), 0, 7); g.fill(); } }
    if (L < 0) { const r = rnd(77); for (let i = 0; i < 500; i++) { const x = r() * W, y = r() * H; g.fillStyle = r() < 0.5 ? 'rgba(60,50,30,.18)' : 'rgba(90,120,60,.16)'; g.beginPath(); g.ellipse(x, y, 6 + r() * 14, 2 + r() * 5, 0, 0, 7); g.fill(); } }
    // тень вдоль подножия обрывов уровнем выше — на этом слое
    for (const e of R.edges[L + 1] || []) if (e.ny > 0.25) { const gr = g.createLinearGradient(0, e.y0 + dy, 0, e.y0 + dy + 30); gr.addColorStop(0, 'rgba(15,10,5,.40)'); gr.addColorStop(1, 'rgba(15,10,5,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(e.x0, e.y0 + dy - 2); g.lineTo(e.x1, e.y1 + dy - 2); g.lineTo(e.x1, e.y1 + dy + 30); g.lineTo(e.x0, e.y0 + dy + 30); g.closePath(); g.fill(); }
    extra(g, L, dy);
    g.restore();
    layers[L] = cv;
  }
  return { layers, pad };
}

/** Обрыв: каменная стенка одного яруса под краем e уровня L. Рисуется в мировых координатах (y экрана = y − h). */
export function drawFace(g, e, L, seed) {
  if (e.ny < -0.05) return;                       // стенки, что смотрят от зрителя, не видно
  const top = L * LH, bot = (L - 1) * LH, r = rnd(seed);
  // свет слева сверху: стенка, что смотрит на юго-запад, светлее
  const lit = Math.max(0, Math.min(1, 0.55 - e.nx * 0.45 + e.ny * 0.1));
  const col = [Math.round(108 + lit * 40), Math.round(98 + lit * 36), Math.round(86 + lit * 30)];
  const q = (a, b) => { g.beginPath(); g.moveTo(e.x0, e.y0 - top + a); g.lineTo(e.x1, e.y1 - top + a); g.lineTo(e.x1, e.y1 - top + b); g.lineTo(e.x0, e.y0 - top + b); g.closePath(); };
  const H = top - bot;
  const gr = g.createLinearGradient(0, e.y0 - top, 0, e.y0 - bot); gr.addColorStop(0, `rgb(${col})`); gr.addColorStop(1, `rgb(${col.map(v => Math.round(v * 0.62))})`);
  q(-1, H + 1); g.fillStyle = gr; g.fill();
  // слои породы и трещины
  g.strokeStyle = 'rgba(36,24,15,.28)'; g.lineWidth = 1;
  for (const k of [0.33, 0.62, 0.84]) { const off = (r() - 0.5) * 4; g.beginPath(); g.moveTo(e.x0, e.y0 - top + H * k + off); g.lineTo(e.x1, e.y1 - top + H * k + off + (r() - 0.5) * 3); g.stroke(); }
  if (r() < 0.55) { const x = e.x0 + (e.x1 - e.x0) * r(), y = e.y0 - top + 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 6, y + H * 0.4); g.lineTo(x + (r() - 0.5) * 8, y + H * 0.75); g.stroke(); }
  g.fillStyle = 'rgba(255,245,220,.10)'; q(0, 5); g.fill();
  // глыбы у подножия
  if (r() < 0.35) { const x = e.x0 + (e.x1 - e.x0) * r(), y = e.y0 - bot + 2, s = 4 + r() * 6; g.fillStyle = `rgb(${col.map(v => Math.round(v * 0.9))})`; g.strokeStyle = O; g.lineWidth = 1.2; g.beginPath(); g.ellipse(x, y, s, s * 0.65, 0, 0, 7); g.fill(); g.stroke(); }
}
/** Кромка яруса: обводка, свет на ребре и травяной козырёк. */
export function drawRim(g, e, L) {
  const top = L * LH;
  g.lineCap = 'round';
  if (e.ny > -0.05) {
    g.strokeStyle = O; g.lineWidth = 3; g.beginPath(); g.moveTo(e.x0, e.y0 - top + 1); g.lineTo(e.x1, e.y1 - top + 1); g.stroke();
    g.strokeStyle = L > 1 ? '#7a8a50' : L <= 0 ? '#4e6e30' : '#5f8a3a'; g.lineWidth = 3.4; g.beginPath(); g.moveTo(e.x0, e.y0 - top - 1); g.lineTo(e.x1, e.y1 - top - 1); g.stroke();
    g.strokeStyle = 'rgba(220,240,160,.45)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(e.x0, e.y0 - top - 2.5); g.lineTo(e.x1, e.y1 - top - 2.5); g.stroke();
  } else { // дальний край: только тонкая тёмная линия — верх обрыва, что смотрит от нас
    g.strokeStyle = 'rgba(36,24,15,.55)'; g.lineWidth = 2; g.beginPath(); g.moveTo(e.x0, e.y0 - top); g.lineTo(e.x1, e.y1 - top); g.stroke();
  }
}

/** Склон, лестница или тропа-серпантин: полоса, у которой каждый конец поднят на свою высоту, с бортами. */
export function drawRamp(g, s, seed = 1) {
  const dx = s.x1 - s.x0, dy = s.y1 - s.y0, nx = -dy / s.len, ny = dx / s.len, w = s.w / 2, h0 = s.l0 * LH, h1 = s.l1 * LH, r = rnd(seed);
  const A = [s.x0 + nx * w, s.y0 + ny * w - h0], B = [s.x1 + nx * w, s.y1 + ny * w - h1], C = [s.x1 - nx * w, s.y1 - ny * w - h1], D = [s.x0 - nx * w, s.y0 - ny * w - h0];
  const upward = Math.max(s.l0, s.l1) > 0 && Math.min(s.l0, s.l1) >= 0;   // насыпь над землёй (у спуска в низину бортов нет — он врезан в землю)
  if (upward) for (const side of [1, -1]) {
    const P = side > 0 ? [A, B] : [D, C], floor = Math.min(s.l0, s.l1) * LH;
    g.beginPath(); g.moveTo(P[0][0], P[0][1]); g.lineTo(P[1][0], P[1][1]); g.lineTo(P[1][0], P[1][1] + h1 - floor); g.lineTo(P[0][0], P[0][1] + h0 - floor); g.closePath();
    const gr = g.createLinearGradient(0, Math.min(P[0][1], P[1][1]), 0, Math.max(P[0][1] + h0, P[1][1] + h1) - floor); gr.addColorStop(0, '#8a8174'); gr.addColorStop(1, '#5e574d'); g.fillStyle = gr; g.fill(); g.strokeStyle = 'rgba(36,24,15,.55)'; g.lineWidth = 1.2; g.stroke();
  }
  const surf = () => { g.beginPath(); g.moveTo(...A); g.lineTo(...B); g.lineTo(...C); g.lineTo(...D); g.closePath(); };
  surf();
  if (s.kind === 'stairs') g.fillStyle = '#a49c90';
  else { const gr = g.createLinearGradient(...A, ...D); gr.addColorStop(0, '#6f9244'); gr.addColorStop(0.22, '#a88a58'); gr.addColorStop(0.78, '#a88a58'); gr.addColorStop(1, '#5f8238'); g.fillStyle = gr; }
  g.fill();
  g.save(); surf(); g.clip();
  if (s.kind === 'stairs') {   // ступени поперёк
    const n = Math.max(3, Math.round(Math.abs(h1 - h0) / 8 + s.len / 16));
    for (let i = 1; i < n; i++) { const t = i / n, x = s.x0 + dx * t, y = s.y0 + dy * t - (h0 + (h1 - h0) * t); g.strokeStyle = 'rgba(36,24,15,.55)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x + nx * w, y + ny * w); g.lineTo(x - nx * w, y - ny * w); g.stroke(); g.strokeStyle = 'rgba(255,250,235,.4)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + nx * w, y + ny * w - 2); g.lineTo(x - nx * w, y - ny * w - 2); g.stroke(); }
  } else {   // утоптанная земля посередине, трава по краям, камушки; поперёк — тени, если круто
    for (let i = 0; i < 30; i++) { const t = r(), k = (r() - 0.5) * 1.2, x = s.x0 + dx * t + nx * w * k, y = s.y0 + dy * t + ny * w * k - (h0 + (h1 - h0) * t); g.fillStyle = r() < 0.5 ? 'rgba(80,60,35,.35)' : 'rgba(240,225,190,.35)'; g.beginPath(); g.ellipse(x, y, 1.5 + r() * 2.5, 1 + r(), 0, 0, 7); g.fill(); }
    for (let i = 0; i < 18; i++) { const t = r(), k = (r() < 0.5 ? -1 : 1) * (0.75 + r() * 0.2), x = s.x0 + dx * t + nx * w * k, y = s.y0 + dy * t + ny * w * k - (h0 + (h1 - h0) * t); g.strokeStyle = '#4f7a2a'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 2, y - 5); g.moveTo(x, y); g.lineTo(x + 2, y - 5); g.stroke(); }
    const steep = Math.abs(h1 - h0) / s.len; if (steep > 0.25) for (let i = 1; i < 5; i++) { const t = i / 5, x = s.x0 + dx * t, y = s.y0 + dy * t - (h0 + (h1 - h0) * t); g.strokeStyle = 'rgba(60,40,20,.14)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + nx * w * 0.6, y + ny * w * 0.6); g.lineTo(x - nx * w * 0.6, y - ny * w * 0.6); g.stroke(); }
  }
  g.restore();
  if (upward || s.kind === 'stairs') { g.strokeStyle = 'rgba(36,24,15,.7)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(...A); g.lineTo(...B); g.moveTo(...D); g.lineTo(...C); g.stroke(); }
}
