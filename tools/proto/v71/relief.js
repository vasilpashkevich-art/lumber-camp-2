// Эскиз v71: рельеф ярусами. Земля — области с уровнем: низина −1, равнина 0, возвышенность 1, вершина 2,
// и мелкий рельеф в пол яруса (бугры, ложбины, пологие откосы) — его можно пройти где угодно.
// Склоны, лестницы, тропы — плавный переход высоты. Вид сверху-сбоку: всё на высоте h рисуется выше на h;
// у края, что смотрит к зрителю (на юг), виден обрыв (камень) или откос (трава). Все края скруглены.
// Модель (высота, проходимость) — без рисования, её потом возьмёт игра (src/world).
export const LH = 46;                 // высота яруса ≈ рост героя (42 шага × 1,1)
const O = '#24180f';

const rnd = s => () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
const sstep = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
function inPoly(x, y, P) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
function segD(x, y, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l)); return Math.hypot(x - ax - dx * t, y - ay - dy * t); }
function polyD(x, y, P) { let d = 1e9; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; d = Math.min(d, segD(x, y, a[0], a[1], b[0], b[1])); } return d; }

/** Срезать углы: замкнутая ломаная → плавная (метод Чайкина). */
export function smooth(P, it = 3) {
  for (let k = 0; k < it; k++) { const Q = []; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; Q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); } P = Q; }
  return P;
}
/** Неровный круг со скруглёнными краями. */
export function blob(cx, cy, rx, ry, seed = 1, n = 16, rough = 0.12) {
  const r = rnd(seed * 97 + 13), ph = [r() * 6, r() * 6, r() * 6], P = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, k = 1 + rough * (Math.sin(a * 2 + ph[0]) * 0.5 + Math.sin(a * 3 + ph[1]) * 0.35 + Math.sin(a * 5 + ph[2]) * 0.25); P.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
  return smooth(P, 3);
}
/** Полоса по ломаной (овраг, уступ): точки оси, ширина; концы — полукругом. */
export function band(pts, w, seed = 1) {
  const r = rnd(seed), L = [], R = [];
  const nrm = i => { const [ax, ay] = pts[Math.max(0, i - 1)], [bx, by] = pts[Math.min(pts.length - 1, i + 1)], d = Math.hypot(bx - ax, by - ay) || 1; return [-(by - ay) / d, (bx - ax) / d]; };
  for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i], [nx, ny] = nrm(i), k = w / 2 * (0.85 + r() * 0.3); L.push([x + nx * k, y + ny * k]); R.push([x - nx * k, y - ny * k]); }
  const cap = (i, s) => { const [x, y] = pts[i], [nx, ny] = nrm(i), out = []; for (let a = 1; a < 6; a++) { const t = a / 6 * Math.PI, c = Math.cos(t), sn = Math.sin(t); out.push([x + (nx * c - s * ny * sn) * w / 2 * s, y + (ny * c + s * nx * sn) * w / 2 * s]); } return out; };
  const [ex, ey] = pts[pts.length - 1], [px, py] = pts[pts.length - 2], dl = Math.hypot(ex - px, ey - py), fx = (ex - px) / dl, fy = (ey - py) / dl;
  const [sx, sy] = pts[0], [qx, qy] = pts[1], dl0 = Math.hypot(qx - sx, qy - sy), bx = (sx - qx) / dl0, by = (sy - qy) / dl0;
  const endCap = [], startCap = [];
  for (let a = 1; a < 6; a++) { const t = a / 6 * Math.PI; const [nx, ny] = nrm(pts.length - 1); endCap.push([ex + nx * Math.cos(t) * w / 2 + fx * Math.sin(t) * w / 2, ey + ny * Math.cos(t) * w / 2 + fy * Math.sin(t) * w / 2]); const [mx, my] = nrm(0); startCap.push([sx - mx * Math.cos(t) * w / 2 + bx * Math.sin(t) * w / 2, sy - my * Math.cos(t) * w / 2 + by * Math.sin(t) * w / 2]); }
  return smooth([...L, ...endCap, ...R.reverse(), ...startCap], 2);
}

/**
 * Рельеф: def = { W, H, regions: [{ lvl, poly, soft }], ramps: [{ pts: [[x,y,lvl]...], w, kind: 'slope'|'stairs' }], hills, ponds }.
 * soft — откос в пол яруса: проходим везде, высота плавно растёт к середине (fall шагов от края).
 * Области позже в списке перекрывают ранние.
 */
export function makeRelief(def) {
  const R = { ...def, LH }, FALL = 38;
  R.segs = [];
  for (const rp of def.ramps) { const tot = rp.pts.reduce((s, p, i) => i ? s + Math.hypot(p[0] - rp.pts[i - 1][0], p[1] - rp.pts[i - 1][1]) : 0, 0); let acc = 0;
    for (let i = 0; i < rp.pts.length - 1; i++) { const [x0, y0, l0] = rp.pts[i], [x1, y1, l1] = rp.pts[i + 1], len = Math.hypot(x1 - x0, y1 - y0); R.segs.push({ x0, y0, l0, x1, y1, l1, w: rp.w, kind: rp.kind, len, a0: acc / tot, a1: (acc + len) / tot, rp }); acc += len; } }
  // ширина склона: внизу шире (выходит из земли раструбом)
  const flare = (s, t) => { const lowEnd = s.rp.pts[0][2] <= s.rp.pts[s.rp.pts.length - 1][2] ? 0 : 1, a = s.a0 + (s.a1 - s.a0) * t, k = lowEnd === 0 ? 1 - a : a; return 1 + 0.5 * k * k; };
  R.flare = flare;
  R.regionAt = (x, y, upTo = def.regions.length) => { let g = null; for (let i = 0; i < upTo; i++) if (inPoly(x, y, def.regions[i].poly)) g = i; return g; };
  R.levelAt = (x, y) => { const i = R.regionAt(x, y); return i == null ? 0 : def.regions[i].lvl; };
  R.onRamp = (x, y) => {
    let best = null;
    for (const s of R.segs) {
      const dx = s.x1 - s.x0, dy = s.y1 - s.y0, t = ((x - s.x0) * dx + (y - s.y0) * dy) / (s.len * s.len);
      if (t < -0.03 || t > 1.03) continue;
      const tc = Math.max(0, Math.min(1, t)), px = s.x0 + dx * tc, py = s.y0 + dy * tc, d = Math.hypot(x - px, y - py);
      if (d < s.w / 2 * flare(s, tc) && (!best || d < best.d)) best = { s, t: tc, d };
    }
    if (best) best.h = (best.s.l0 + (best.s.l1 - best.s.l0) * best.t) * LH;
    return best;
  };
  /** Высота земли: склон → по склону; откос → плавно от края к середине; иначе — уровень яруса. */
  R.height = (x, y) => {
    const r = R.onRamp(x, y); if (r) return r.h;
    const i = R.regionAt(x, y); if (i == null) return 0;
    const g = def.regions[i]; if (!g.soft) return g.lvl * LH;
    const oi = R.regionAt(x, y, i), out = oi == null ? 0 : def.regions[oi].lvl, k = sstep(polyD(x, y, g.poly) / FALL);
    return (out + (g.lvl - out) * k) * LH;
  };
  R.water = (x, y) => (def.ponds || []).some(([px, py, rx, ry]) => ((x - px) / rx) ** 2 + ((y - py) / ry) ** 2 < 1);
  /** Можно ли шагнуть: высота не прыгает больше чем на треть яруса (обрыв), откосы и склоны — плавные. */
  R.canStep = (x0, y0, x1, y1) => !R.water(x1, y1) && x1 > 20 && y1 > 20 && x1 < def.W - 20 && y1 < def.H - 20 && Math.abs(R.height(x1, y1) - R.height(x0, y0)) <= LH * 0.3;
  R.levels = [...new Set([0, ...def.regions.map(g => g.lvl)])].sort((a, b) => a - b);
  R.min = R.levels[0]; R.max = R.levels[R.levels.length - 1];
  R.below = L => { const i = R.levels.indexOf(L); return i > 0 ? R.levels[i - 1] : L; };

  // края: для каждого уровня L — куски границы «L и выше», внешняя сторона (куда ниже), откос или камень
  R.edges = {};
  for (const L of R.levels.slice(1)) {
    const E = [];
    def.regions.forEach((g) => {
      if (g.lvl < L && !(L <= 0)) return;
      const P = g.poly;
      for (let i = 0; i < P.length; i++) {
        const [ax, ay] = P[i], [bx, by] = P[(i + 1) % P.length], len = Math.hypot(bx - ax, by - ay); if (len < 0.01) continue;
        const nx = -(by - ay) / len, ny = (bx - ax) / len, mx = (ax + bx) / 2, my = (ay + by) / 2;
        const la = R.levelAt(mx + nx * 4, my + ny * 4), lb = R.levelAt(mx - nx * 4, my - ny * 4);
        let e = null;
        if (la >= L && lb < L) e = { x0: ax, y0: ay, x1: bx, y1: by, nx: -nx, ny: -ny, low: lb, high: la };
        else if (lb >= L && la < L) e = { x0: ax, y0: ay, x1: bx, y1: by, nx, ny, low: la, high: lb };
        if (e) { e.bot = Math.max(e.low, R.below(L)); e.soft = !!g.soft && (L - e.bot) <= 0.51; E.push(e); }
      }
    });
    const seen = new Set(); R.edges[L] = E.filter(e => { const k = Math.round(e.x0 * 2 + e.x1 * 2) + ',' + Math.round(e.y0 * 2 + e.y1 * 2); if (seen.has(k)) return false; seen.add(k); return true; });
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
 * Готовые слои земли: для каждого уровня — его верх, сдвинутый на высоту (трава, тени великанов, пруды).
 * ground(g, W, H) — подложка зоны. Возвращает { layers: {L: canvas}, pad } — холсты на всю поляну с запасом сверху.
 */
export function bakeLayers(R, ground, extra = () => { }) {
  const pad = (R.max + 1) * LH, W = R.W, H = R.H + pad + LH * 2;
  const base = document.createElement('canvas'); base.width = R.W; base.height = R.H; const bg = base.getContext('2d'); ground(bg, R.W, R.H);
  for (const [x, y, r] of R.hills || []) {   // пригорки светом и тенью
    let gr = bg.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r); gr.addColorStop(0, 'rgba(255,250,200,.20)'); gr.addColorStop(0.55, 'rgba(255,250,200,.05)'); gr.addColorStop(1, 'rgba(255,250,200,0)'); bg.fillStyle = gr; bg.beginPath(); bg.ellipse(x, y, r, r * 0.8, 0, 0, 7); bg.fill();
    gr = bg.createRadialGradient(x + r * 0.45, y + r * 0.4, r * 0.1, x + r * 0.2, y + r * 0.2, r * 0.95); gr.addColorStop(0, 'rgba(20,30,10,.22)'); gr.addColorStop(1, 'rgba(20,30,10,0)'); bg.fillStyle = gr; bg.beginPath(); bg.ellipse(x + r * 0.2, y + r * 0.2, r, r * 0.8, 0, 0, 7); bg.fill();
  }
  const layers = {};
  for (const L of R.levels) {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
    const dy = pad - L * LH;
    g.save(); levelPath(g, R, L, dy); g.clip('evenodd');
    g.drawImage(base, 0, dy);
    // ярус чуть другим цветом: низина сырее и темнее, высота суше и светлее, на вершине проступает камень
    const tint = L <= -1 ? 'rgba(30,50,25,.30)' : L < 0 ? 'rgba(30,50,25,.14)' : L >= 2 ? 'rgba(230,220,190,.13)' : L >= 1 ? 'rgba(255,240,180,.07)' : L > 0 ? 'rgba(255,240,180,.04)' : null;
    if (tint) { g.fillStyle = tint; g.fillRect(0, 0, W, H); }
    if (L >= 2) { const r = rnd(L * 31); for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * H; g.fillStyle = 'rgba(140,132,118,.35)'; g.beginPath(); g.ellipse(x, y, 4 + r() * 9, 2 + r() * 4, r(), 0, 7); g.fill(); } }
    if (L <= -1) { const r = rnd(77); for (let i = 0; i < 500; i++) { const x = r() * W, y = r() * H; g.fillStyle = r() < 0.5 ? 'rgba(60,50,30,.18)' : 'rgba(90,120,60,.16)'; g.beginPath(); g.ellipse(x, y, 6 + r() * 14, 2 + r() * 5, 0, 0, 7); g.fill(); } }
    // откосы в пол яруса: верх плавно светлеет к середине (свет слева сверху), к краю — тень
    for (const q of R.regions) if (q.soft && q.lvl === L) {
      const P = q.poly; let cx = 0, cy = 0; for (const p of P) { cx += p[0]; cy += p[1]; } cx /= P.length; cy /= P.length;
      g.save(); g.beginPath(); poly(g, P, dy); g.clip();
      const rr = Math.max(...P.map(p => Math.hypot(p[0] - cx, p[1] - cy)));
      const gr = g.createRadialGradient(cx - rr * 0.3, cy + dy - rr * 0.3, rr * 0.1, cx, cy + dy, rr * 1.05);
      if (L > 0) { gr.addColorStop(0, 'rgba(255,250,200,.16)'); gr.addColorStop(0.7, 'rgba(255,250,200,0)'); gr.addColorStop(1, 'rgba(20,30,10,.12)'); }
      else { gr.addColorStop(0, 'rgba(20,35,15,.16)'); gr.addColorStop(0.75, 'rgba(20,35,15,.05)'); gr.addColorStop(1, 'rgba(255,250,200,.10)'); }
      g.fillStyle = gr; g.fillRect(cx - rr * 1.2, cy + dy - rr * 1.2, rr * 2.4, rr * 2.4); g.restore();
    }
    // тень у подножия каменных обрывов уровнем выше — на этом слое
    for (const [Lk, E] of Object.entries(R.edges)) { if (+Lk <= L) continue; for (const e of E) if (!e.soft && e.bot === L && e.ny > 0.25) { const gr = g.createLinearGradient(0, e.y0 + dy, 0, e.y0 + dy + 28); gr.addColorStop(0, 'rgba(15,10,5,.38)'); gr.addColorStop(1, 'rgba(15,10,5,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(e.x0, e.y0 + dy - 2); g.lineTo(e.x1, e.y1 + dy - 2); g.lineTo(e.x1, e.y1 + dy + 28); g.lineTo(e.x0, e.y0 + dy + 28); g.closePath(); g.fill(); } }
    extra(g, L, dy);
    g.restore();
    layers[L] = cv;
  }
  return { layers, pad };
}

/**
 * Стенка под краем e уровня L. Камень (обрыв) — слои породы, трещины, кусты и глыбы у подножия;
 * откос (в пол яруса) — травяной склон без камня, светлее сверху, с дёрном по кромке.
 * Рисуется в мировых координатах (y экрана = y − h).
 */
export function drawFace(g, e, L, seed) {
  if (e.ny < -0.05) return;
  const top = L * LH, bot = e.bot * LH, H = top - bot, r = rnd(Math.abs(Math.round(seed)) + 11), dens = Math.hypot(e.x1 - e.x0, e.y1 - e.y0) / 20;
  const q = (a, b) => { g.beginPath(); g.moveTo(e.x0, e.y0 - top + a); g.lineTo(e.x1, e.y1 - top + a); g.lineTo(e.x1, e.y1 - top + b); g.lineTo(e.x0, e.y0 - top + b); g.closePath(); };
  const lit = Math.max(0, Math.min(1, 0.55 - e.nx * 0.45 + e.ny * 0.1));
  if (e.soft) {
    const c0 = [Math.round(100 + lit * 30), Math.round(142 + lit * 26), Math.round(60 + lit * 16)], c1 = c0.map(v => Math.round(v * 0.74)), c2 = c0.map(v => Math.round(v * 0.86));
    const gr = g.createLinearGradient(0, e.y0 - top, 0, e.y0 - bot); gr.addColorStop(0, `rgb(${c0})`); gr.addColorStop(0.6, `rgb(${c1})`); gr.addColorStop(1, `rgb(${c2})`);
    q(-1, H + 1.5); g.fillStyle = gr; g.fill();
    g.strokeStyle = 'rgba(40,70,20,.35)'; g.lineWidth = 1;   // травинки по откосу
    if (r() < dens * 0.6) for (let k = 0; k < 2; k++) { const t = r(), x = e.x0 + (e.x1 - e.x0) * t, y = e.y0 + (e.y1 - e.y0) * t - top + 3 + r() * (H - 6); g.beginPath(); g.moveTo(x, y + 3); g.lineTo(x - 1.5, y - 2); g.moveTo(x, y + 3); g.lineTo(x + 2, y - 1.5); g.stroke(); }
    return;
  }
  const col = [Math.round(108 + lit * 40), Math.round(98 + lit * 36), Math.round(86 + lit * 30)];
  const gr = g.createLinearGradient(0, e.y0 - top, 0, e.y0 - bot); gr.addColorStop(0, `rgb(${col})`); gr.addColorStop(1, `rgb(${col.map(v => Math.round(v * 0.62))})`);
  q(-1, H + 1); g.fillStyle = gr; g.fill();
  g.strokeStyle = 'rgba(36,24,15,.26)'; g.lineWidth = 1;
  for (let k = 0.3; k < 0.95; k += 0.3 * (H / LH > 0.9 ? 1 : 2)) { const off = (r() - 0.5) * 4; g.beginPath(); g.moveTo(e.x0, e.y0 - top + H * k + off); g.lineTo(e.x1, e.y1 - top + H * k + off + (r() - 0.5) * 3); g.stroke(); }
  if (r() < 0.45 * dens) { const x = e.x0 + (e.x1 - e.x0) * r(), y = e.y0 - top + 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 6, y + H * 0.4); g.lineTo(x + (r() - 0.5) * 8, y + H * 0.75); g.stroke(); }
  g.fillStyle = 'rgba(255,245,220,.10)'; q(0, 4); g.fill();
  // у подножия: глыбы, кусты, трава
  const x = e.x0 + (e.x1 - e.x0) * r(), y = e.y0 + (e.y1 - e.y0) * 0.5 - bot + 2, roll = r() / Math.max(0.05, dens);
  if (roll < 0.16) { const s = 4 + r() * 6; g.fillStyle = `rgb(${col.map(v => Math.round(v * 0.92))})`; g.strokeStyle = O; g.lineWidth = 1.2; g.beginPath(); g.ellipse(x, y, s, s * 0.65, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(x - s * 0.3, y - s * 0.3, s * 0.4, s * 0.25, 0, 0, 7); g.fill(); }
  else if (roll < 0.22) { for (const [dx, s, c] of [[-5, 7, '#3f6a2a'], [4, 8, '#4f7a30'], [0, 6, '#5f8a3a']]) { g.fillStyle = O; g.beginPath(); g.arc(x + dx, y - s * 0.5, s + 1.2, 0, 7); g.fill(); g.fillStyle = c; g.beginPath(); g.arc(x + dx, y - s * 0.5, s, 0, 7); g.fill(); } }
}
/** Кромка: у обрыва — обводка, свет на ребре и травяной козырёк; у откоса — мягкая светлая линия. */
export function drawRim(g, e, L) {
  const top = L * LH; g.lineCap = 'round';
  if (e.soft) { if (e.ny > -0.05) { g.strokeStyle = 'rgba(220,240,160,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(e.x0, e.y0 - top - 0.5); g.lineTo(e.x1, e.y1 - top - 0.5); g.stroke(); } return; }
  if (e.ny > -0.05) {
    g.strokeStyle = O; g.lineWidth = 3; g.beginPath(); g.moveTo(e.x0, e.y0 - top + 1); g.lineTo(e.x1, e.y1 - top + 1); g.stroke();
    g.strokeStyle = L > 1 ? '#7a8a50' : L <= 0 ? '#4e6e30' : '#5f8a3a'; g.lineWidth = 3.6; g.beginPath(); g.moveTo(e.x0, e.y0 - top - 1); g.lineTo(e.x1, e.y1 - top - 1); g.stroke();
    g.strokeStyle = 'rgba(220,240,160,.45)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(e.x0, e.y0 - top - 2.5); g.lineTo(e.x1, e.y1 - top - 2.5); g.stroke();
  } else { g.strokeStyle = 'rgba(36,24,15,.28)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(e.x0, e.y0 - top); g.lineTo(e.x1, e.y1 - top); g.stroke(); }
}

/** Ось склона плавной кривой с высотой и шириной в каждой точке: [{x,y,h,w,nx,ny}]. */
function rampLine(R, rp) {
  const P = rp.pts, out = [];
  // кривая через точки (Катмулл-Ром), чтобы повороты были плавными
  const pt = i => P[Math.max(0, Math.min(P.length - 1, i))];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = pt(i - 1), p1 = pt(i), p2 = pt(i + 1), p3 = pt(i + 2), n = Math.max(6, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 6));
    for (let k = 0; k < n + (i === P.length - 2 ? 1 : 0); k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t, cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push({ x: cr(p0[0], p1[0], p2[0], p3[0]), y: cr(p0[1], p1[1], p2[1], p3[1]), l: p1[2] + (p2[2] - p1[2]) * t });
    }
  }
  const lowFirst = P[0][2] <= P[P.length - 1][2];
  out.forEach((p, i) => {
    const a = out[Math.max(0, i - 1)], b = out[Math.min(out.length - 1, i + 1)], d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    p.nx = -(b.y - a.y) / d; p.ny = (b.x - a.x) / d; p.h = p.l * LH;
    const f = i / (out.length - 1), k = lowFirst ? 1 - f : f; p.w = rp.w / 2 * (1 + 0.5 * k * k);
  });
  return out;
}
const sidePts = (line, s, kw = 1, wob = null) => line.map((p, i) => { const w = p.w * kw * (wob ? 1 + (wob[i % wob.length] - 0.5) * 0.12 : 1); return [p.x + p.nx * w * s, p.y + p.ny * w * s - p.h]; });
function curve(g, pts, move = true) { if (move) g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; g.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); } const l = pts[pts.length - 1]; g.lineTo(l[0], l[1]); }

/** Склон или лестница целиком (вся ломаная): раструб внизу, плавные края, земляные борта, тропа или ступени из камней. */
export function drawRampWhole(g, R, rp, seed = 1) {
  const line = rampLine(R, rp), r = rnd(seed), wob = Array.from({ length: 23 }, () => r());
  const minL = Math.min(...rp.pts.map(p => p[2])), floor = minL * LH, raised = minL >= 0 && Math.max(...rp.pts.map(p => p[2])) > 0;
  const L = sidePts(line, 1, 1, wob), Rt = sidePts(line, -1, 1, wob);
  // борта насыпи: земля под травой, до уровня нижнего конца — только у насыпи над землёй
  if (raised) [[L, 1], [Rt, -1]].forEach(([S, sd]) => {
    // насыпь: борт — пологий земляной откос, к низу расходится в стороны и сливается с травой
    const base = S.map((p, i) => { const q = line[i], dh = q.h - floor; return [p[0] + q.nx * sd * dh * 0.7, p[1] + q.ny * sd * dh * 0.7 + dh]; });
    g.beginPath(); curve(g, S); const bb = [...base].reverse(); g.lineTo(bb[0][0], bb[0][1]); curve(g, bb, false); g.closePath();
    const yTop = Math.min(...S.map(p => p[1])), yBot = Math.max(...base.map(p => p[1]));
    const gr = g.createLinearGradient(0, yTop, 0, yBot); gr.addColorStop(0, '#73903f'); gr.addColorStop(0.3, '#7d6a4a'); gr.addColorStop(0.75, '#5f6e38'); gr.addColorStop(1, 'rgba(95,130,56,0)'); g.fillStyle = gr; g.fill();
    g.strokeStyle = 'rgba(70,95,35,.6)'; g.lineWidth = 1; for (let i = 2; i < base.length - 2; i += 4) { const [x, y] = base[i], [tx, ty] = S[i]; const mx = tx + (x - tx) * 0.6, my = ty + (y - ty) * 0.6; g.beginPath(); g.moveTo(mx, my); g.lineTo(mx - 2, my - 5); g.moveTo(mx, my); g.lineTo(mx + 2, my - 4); g.stroke(); }
  });
  // полотно: трава по краям
  const surf = () => { g.beginPath(); curve(g, L); const rr = [...Rt].reverse(); curve(g, rr, false); g.closePath(); };
  surf(); g.fillStyle = rp.kind === 'stairs' ? '#6f8a42' : '#6c9442'; g.fill();
  g.save(); surf(); g.clip();
  // свет слева сверху на полотне
  const yT = Math.min(...L.map(p => p[1]), ...Rt.map(p => p[1])), yB = Math.max(...L.map(p => p[1]), ...Rt.map(p => p[1]));
  if (rp.kind === 'stairs') {
    // ступени — ряды неровных камней поперёк, сверху вниз (дальние первыми)
    const n = Math.max(4, Math.round(Math.abs(line[line.length - 1].h - line[0].h) / 7 + line.length / 6));
    const idx = Array.from({ length: n }, (_, i) => Math.round(i / (n - 1) * (line.length - 1)));
    idx.sort((a, b) => (line[a].y - line[a].h) - (line[b].y - line[b].h));
    for (const i of idx) {
      const p = line[i], stones = 3 + (p.w > 30 ? 1 : 0), w = p.w * 0.86;
      for (let k = 0; k < stones; k++) {
        const t = -1 + (k + 0.5) / stones * 2, x = p.x + p.nx * w * t, y = p.y + p.ny * w * t - p.h + Math.abs(t) * 1.5, sw = w / stones * (0.95 + r() * 0.2), sh = 5 + r() * 1.5;
        g.fillStyle = 'rgba(20,12,6,.35)'; g.beginPath(); g.ellipse(x + 1, y + 2.5, sw, sh, Math.atan2(p.ny, p.nx), 0, 7); g.fill();
        const c = 150 + Math.floor(r() * 30); g.fillStyle = `rgb(${c},${c - 8},${c - 20})`; g.strokeStyle = O; g.lineWidth = 1.2; g.beginPath(); g.ellipse(x, y, sw, sh, Math.atan2(p.ny, p.nx), 0, 7); g.fill(); g.stroke();
        g.fillStyle = 'rgba(255,250,235,.35)'; g.beginPath(); g.ellipse(x - sw * 0.25, y - sh * 0.35, sw * 0.45, sh * 0.35, Math.atan2(p.ny, p.nx), 0, 7); g.fill();
      }
    }
  } else {
    // тропа посередине чуть виляет, края — трава с дёрном
    const C = line.map((p, i) => { const k = Math.sin(i / 7 + seed) * 0.12; return [p.x + p.nx * p.w * k, p.y + p.ny * p.w * k - p.h]; });
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (const [w, c] of [[1.15, 'rgba(110,85,50,.35)'], [0.95, '#a8885a'], [0.55, '#b89a6a']]) { g.strokeStyle = c; g.lineWidth = line[Math.floor(line.length / 2)].w * w; g.beginPath(); curve(g, C); g.stroke(); }
    for (let i = 0; i < 40; i++) { const j = Math.floor(r() * line.length), p = line[j], k = (r() - 0.5) * 0.9, x = p.x + p.nx * p.w * k, y = p.y + p.ny * p.w * k - p.h; g.fillStyle = r() < 0.5 ? 'rgba(80,60,35,.35)' : 'rgba(240,225,190,.35)'; g.beginPath(); g.ellipse(x, y, 1.5 + r() * 2.5, 1 + r(), 0, 0, 7); g.fill(); }
  }
  const gr = g.createLinearGradient(0, yT, 0, yB); gr.addColorStop(0, 'rgba(255,250,210,.10)'); gr.addColorStop(1, 'rgba(20,15,5,.10)'); g.fillStyle = gr; g.fillRect(-1e4, yT, 2e4, yB - yT);
  g.restore();
  // кромки: дёрн с травинками, без прямых линий
  for (const S of [L, Rt]) { g.strokeStyle = 'rgba(40,60,20,.55)'; g.lineWidth = 2; g.beginPath(); curve(g, S); g.stroke(); g.strokeStyle = '#5f8a3a'; g.lineWidth = 1.2; for (let i = 2; i < S.length - 2; i += 3) { const [x, y] = S[i]; g.beginPath(); g.moveTo(x, y + 1); g.lineTo(x - 2, y - 4); g.moveTo(x, y + 1); g.lineTo(x + 2, y - 4); g.stroke(); } }
}
