// Рельеф (v71): ярусы земли, склоны, проходимость и поиск пути. Без рисования — его гоняют тесты и автоигрок.
// Уровни: равнина 0, низина −1, возвышенность 1; мелкий рельеф в пол яруса (soft) — травяной откос, проходим везде.
// Высота яруса LH ≈ рост героя. Через каменный обрыв не пройти — только по склону, лестнице или дороге.
import { segDist } from '../engine/util.js';

export const LH = 46;
export const STEP = LH * 0.3;          // больше этого за шаг — обрыв
const FALL = 38;                       // откос: на сколько шагов от края растёт высота
const rnd = s => () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
const sstep = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);

/** Срезать углы: замкнутая ломаная → плавная (метод Чайкина). */
export function smooth(P, it = 3) {
  for (let k = 0; k < it; k++) { const Q = []; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; Q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); } P = Q; }
  return P;
}
/** Край без прямых: замкнутая ломаная гуще (каждые 70 шагов) и чуть волнится поперёк (до ±amp). */
export function organic(P, seed = 1, amp = 34) {
  const r = rnd(seed * 31 + 7), ph = [r() * 6, r() * 6], out = []; let s = 0;
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length], len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(len / 70)), nx = -(b[1] - a[1]) / (len || 1), ny = (b[0] - a[0]) / (len || 1);
    for (let k = 0; k < n; k++) { const t = k / n, w = k === 0 ? 0 : amp * (0.6 * Math.sin(s * 0.011 + ph[0]) + 0.4 * Math.sin(s * 0.027 + ph[1])); out.push([a[0] + (b[0] - a[0]) * t + nx * w, a[1] + (b[1] - a[1]) * t + ny * w]); s += len / n; }
  }
  return out;
}
/** Неровный круг со скруглёнными краями. */
export function blob(cx, cy, rx, ry, seed = 1, n = 16, rough = 0.12) {
  const r = rnd(seed * 97 + 13), ph = [r() * 6, r() * 6, r() * 6], P = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, k = 1 + rough * (Math.sin(a * 2 + ph[0]) * 0.5 + Math.sin(a * 3 + ph[1]) * 0.35 + Math.sin(a * 5 + ph[2]) * 0.25); P.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
  return smooth(P, 3);
}
/** Полоса по ломаной (долина, овраг): точки оси и ширина (числом или у каждой точки третьим числом); концы полукругом.
 *  Ось гуще (каждые 60 шагов) и ширина дышит — края не прямые. */
export function band(pts0, w, seed = 1) {
  const r = rnd(seed), ph = [r() * 6, r() * 6, r() * 6], pts = [];
  for (let i = 0; i < pts0.length - 1; i++) { const a = pts0[i], b = pts0[i + 1], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 60)); for (let k = 0; k < n; k++) { const t = k / n; pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, (a[2] || w) + ((b[2] || w) - (a[2] || w)) * t]); } }
  const last = pts0[pts0.length - 1]; pts.push([last[0], last[1], last[2] || w]);
  const nrm = i => { const [ax, ay] = pts[Math.max(0, i - 1)], [bx, by] = pts[Math.min(pts.length - 1, i + 1)], d = Math.hypot(bx - ax, by - ay) || 1; return [-(by - ay) / d, (bx - ax) / d]; };
  const wob = (i, s) => 1 + 0.13 * Math.sin(i * 0.55 + ph[0] + s) + 0.07 * Math.sin(i * 1.3 + ph[1] + s * 2) + 0.04 * Math.sin(i * 2.9 + ph[2]);
  const L = [], R = [], WL = [], WR = [];
  for (let i = 0; i < pts.length; i++) { const [x, y, ww] = pts[i], [nx, ny] = nrm(i), wl = ww / 2 * wob(i, 0), wr = ww / 2 * wob(i, 2.1); WL.push(wl); WR.push(wr); L.push([x + nx * wl, y + ny * wl]); R.push([x - nx * wr, y - ny * wr]); }
  const cap = (i, dir, W0, W1) => { const [x, y] = pts[i], [nx, ny] = nrm(i), j = i + dir, d = Math.hypot(pts[j][0] - x, pts[j][1] - y) || 1, fx = (x - pts[j][0]) / d, fy = (y - pts[j][1]) / d, out = []; for (let a = 1; a < 6; a++) { const t = a / 6 * Math.PI, s = dir < 0 ? 1 : -1, wv = W0 + (W1 - W0) * a / 6; out.push([x + nx * Math.cos(t) * wv * s + fx * Math.sin(t) * wv, y + ny * Math.cos(t) * wv * s + fy * Math.sin(t) * wv]); } return out; };
  const n = pts.length - 1;
  return smooth([...L, ...cap(n, -1, WL[n], WR[n]), ...R.reverse(), ...cap(0, 1, WR[0], WL[0])], 2);
}

/**
 * Рельеф зоны из данных: Z.relief = { regions: [{ lvl, soft, blob:[cx,cy,rx,ry,seed] | band:[pts], w | poly }], ramps: [{ kind, w, pts:[[x,y,lvl]] }] }.
 * Склоны там, где дорога пересекает край яруса, добавляются сами. Возвращает null, если у зоны рельефа нет.
 */
export function buildRelief(Z) {
  const D = Z.relief; if (!D) return null;
  const regions = D.regions.map((g, i) => ({ lvl: g.lvl, soft: !!g.soft, rock: !g.soft, name: g.name, kind: g.blob ? 'blob' : g.band ? 'band' : 'poly', poly: g.poly ? smooth(organic(g.poly, i + 5), 2) : g.blob ? blob(...g.blob) : band(g.band, g.w, g.seed || i + 3) }));
  regions.forEach(prep);
  const R = { W: Z.W, H: Z.H, regions, ramps: [], LH };
  R.regionAt = (x, y, upTo = regions.length) => { let g = -1; for (let i = 0; i < upTo; i++) if (inReg(regions[i], x, y)) g = i; return g; };
  R.levelAt = (x, y) => { const i = R.regionAt(x, y); return i < 0 ? 0 : regions[i].lvl; };
  // склоны «от точки до края»: auto [x, y, dx, dy] — идти от точки, пока не сменится ярус; склон ставится поперёк края
  for (const r0 of D.ramps || []) {
    if (!r0.auto) { R.ramps.push({ ...r0 }); continue; }
    const [x, y, dx0, dy0] = r0.auto, dl = Math.hypot(dx0, dy0), dx = dx0 / dl, dy = dy0 / dl, L0 = R.levelAt(x, y);
    let t = 0; while (t < 3000 && R.levelAt(x + dx * t, y + dy * t) === L0) t += 3;
    const ex = x + dx * t, ey = y + dy * t, L1 = R.levelAt(ex + dx * 6, ey + dy * 6), len = Math.abs(L1 - L0) * (r0.kind === 'stairs' ? 130 : 180);
    const a = L1 > L0 ? len * 0.6 : len * 0.5, b = len - a;
    R.ramps.push({ kind: r0.kind, w: r0.w, pts: [[ex - dx * a, ey - dy * a, L0], [ex + dx * b, ey + dy * b, L1]] });
  }
  // дороги: где пересекают край яруса — плавный съезд шириной с дорогу (дорога не ломается ступенькой)
  for (const rd of Z.roads || []) for (let i = 0; i < rd.length - 1; i++) {
    const [ax, ay] = rd[i], [bx, by] = rd[i + 1], len = Math.hypot(bx - ax, by - ay), n = Math.ceil(len / 8);
    let prev = R.regionAt(ax, ay);
    for (let k = 1; k <= n; k++) {
      const t = k / n, x = ax + (bx - ax) * t, y = ay + (by - ay) * t, gi = R.regionAt(x, y);
      if (gi !== prev) {
        const a = prev < 0 ? null : regions[prev], b = gi < 0 ? null : regions[gi], la = a ? a.lvl : 0, lb = b ? b.lvl : 0;
        if (la !== lb) { const ux = (bx - ax) / len, uy = (by - ay) / len, s = 56 * Math.abs(lb - la) + 20; R.ramps.push({ kind: 'road', w: 100, pts: [[x - ux * s, y - uy * s, la], [x + ux * s, y + uy * s, lb]] }); }
        prev = gi;
      }
    }
  }
  return finish(R);
}
// Быстрые проверки области: рёбра по полосам (точка внутри) и по клеткам (расстояние до края для откоса).
const ROW = 64;
function prep(g) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of g.poly) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } g.bb = [x0, y0, x1, y1];
  const P = g.poly, rows = new Map(), cells = new Map();
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length];
    for (let r = Math.floor(Math.min(a[1], b[1]) / ROW); r <= Math.floor(Math.max(a[1], b[1]) / ROW); r++) { let l = rows.get(r); if (!l) rows.set(r, l = []); l.push(i); }
    for (let cx = Math.floor((Math.min(a[0], b[0]) - FALL * 2) / ROW); cx <= Math.floor((Math.max(a[0], b[0]) + FALL * 2) / ROW); cx++)
      for (let cy = Math.floor((Math.min(a[1], b[1]) - FALL * 2) / ROW); cy <= Math.floor((Math.max(a[1], b[1]) + FALL * 2) / ROW); cy++) { const k = cx * 65536 + cy; let l = cells.get(k); if (!l) cells.set(k, l = []); l.push(i); }
  }
  g.rows = rows; g.cells = cells;
}
function inReg(g, x, y) {
  const b = g.bb; if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) return false;
  const l = g.rows.get(Math.floor(y / ROW)); if (!l) return false;
  const P = g.poly; let c = false;
  for (const i of l) { const [xi, yi] = P[i], [xj, yj] = P[(i + 1) % P.length]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; }
  return c;
}
/** Расстояние до края области, но не больше 2·FALL (дальше — неважно). */
function edgeD(g, x, y) {
  const l = g.cells.get(Math.floor(x / ROW) * 65536 + Math.floor(y / ROW)); if (!l) return FALL * 2;
  const P = g.poly; let d = FALL * 2;
  for (const i of l) { const a = P[i], b = P[(i + 1) % P.length]; const v = segDist(x, y, a[0], a[1], b[0], b[1]); if (v < d) d = v; }
  return d;
}
/** Готовая модель из списка областей (для эскизов и тестов). */
export function makeRelief(def) {
  const regions = def.regions.map(g => ({ ...g, rock: !g.soft }));
  regions.forEach(prep);
  const R = { ...def, regions, ramps: def.ramps.map(r => ({ ...r })), LH };
  R.regionAt = (x, y, upTo = regions.length) => { let g = -1; for (let i = 0; i < upTo; i++) if (inReg(regions[i], x, y)) g = i; return g; };
  R.levelAt = (x, y) => { const i = R.regionAt(x, y); return i < 0 ? 0 : regions[i].lvl; };
  return finish(R);
}

function finish(R) {
  const regions = R.regions;
  R.segs = []; R.ramps.forEach((rp, k) => { rp.k = k; });
  for (const rp of R.ramps) {
    const tot = rp.pts.reduce((s, p, i) => i ? s + Math.hypot(p[0] - rp.pts[i - 1][0], p[1] - rp.pts[i - 1][1]) : 0, 0); let acc = 0;
    rp.lowFirst = rp.pts[0][2] <= rp.pts[rp.pts.length - 1][2];
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (let i = 0; i < rp.pts.length - 1; i++) { const [ax, ay, l0] = rp.pts[i], [bx, by, l1] = rp.pts[i + 1], len = Math.hypot(bx - ax, by - ay); R.segs.push({ x0: ax, y0: ay, l0, x1: bx, y1: by, l1, w: rp.w, len, a0: acc / tot, a1: (acc + len) / tot, rp }); acc += len; }
    for (const [x, y] of rp.pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } rp.bb = [x0 - rp.w * 1.6, y0 - rp.w * 1.6, x1 + rp.w * 1.6, y1 + rp.w * 1.6];
  }
  // ширина склона: внизу шире (выходит из земли раструбом); у съездов дорог — ровная
  R.flare = (s, t) => { if (s.rp.kind === 'road') return 1; const a = s.a0 + (s.a1 - s.a0) * t, k = s.rp.lowFirst ? 1 - a : a; return 1 + 0.5 * k * k; };
  R.onRamp = (x, y) => {
    let best = null;
    for (const s of R.segs) {
      const b = s.rp.bb; if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) continue;
      const dx = s.x1 - s.x0, dy = s.y1 - s.y0, t = ((x - s.x0) * dx + (y - s.y0) * dy) / (s.len * s.len);
      if (t < -0.03 || t > 1.03) continue;
      const tc = Math.max(0, Math.min(1, t)), px = s.x0 + dx * tc, py = s.y0 + dy * tc, d = Math.hypot(x - px, y - py);
      if (d < s.w / 2 * R.flare(s, tc) && (!best || d < best.d)) best = { s, t: tc, d };
    }
    if (best) best.h = (best.s.l0 + (best.s.l1 - best.s.l0) * best.t) * LH;
    return best;
  };
  /** Высота земли: склон → по склону; откос → плавно от края к середине; иначе — уровень яруса. */
  R.height = (x, y) => {
    const r = R.onRamp(x, y); if (r) return r.h;
    const i = R.regionAt(x, y); if (i < 0) return 0;
    const g = regions[i]; if (!g.soft) return g.lvl * LH;
    const d = edgeD(g, x, y); if (d >= FALL * 2) return g.lvl * LH;
    const oi = R.regionAt(x, y, i), out = oi < 0 ? 0 : regions[oi].lvl, fall = FALL * Math.max(1, Math.min(2, Math.abs(g.lvl - out) / 0.5)), k = sstep(d / fall);   // перепад в целый ярус — откос вдвое шире
    return (out + (g.lvl - out) * k) * LH;
  };
  /** Можно ли шагнуть: высота не прыгает больше чем на STEP за 10 шагов пути (с промежуточными точками). */
  R.canStep = (x0, y0, x1, y1) => {
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 10)); let h = R.height(x0, y0);
    for (let i = 1; i <= n; i++) { const t = i / n, h2 = R.height(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t); if (Math.abs(h2 - h) > STEP) return false; h = h2; }
    return true;
  };
  R.levels = [...new Set([0, ...regions.map(g => g.lvl)])].sort((a, b) => a - b);
  R.min = R.levels[0]; R.max = R.levels[R.levels.length - 1];
  R.below = L => { const i = R.levels.indexOf(L); return i > 0 ? R.levels[i - 1] : L; };
  // края: для каждого уровня L — куски границы «L и выше» с внешней стороной (куда ниже); откос или камень
  R.edges = {};
  for (const L of R.levels.slice(1)) {
    const E = [];
    for (const g of regions) {
      if (g.lvl < L && L > 0) continue;
      const P = g.poly;
      for (let i = 0; i < P.length; i++) {
        const [ax, ay] = P[i], [bx, by] = P[(i + 1) % P.length], len = Math.hypot(bx - ax, by - ay); if (len < 0.01) continue;
        const nx = -(by - ay) / len, ny = (bx - ax) / len, mx = (ax + bx) / 2, my = (ay + by) / 2;
        const la = R.levelAt(mx + nx * 4, my + ny * 4), lb = R.levelAt(mx - nx * 4, my - ny * 4);
        let e = null;
        if (la >= L && lb < L) e = { x0: ax, y0: ay, x1: bx, y1: by, nx: -nx, ny: -ny, low: lb };
        else if (lb >= L && la < L) e = { x0: ax, y0: ay, x1: bx, y1: by, nx, ny, low: la };
        if (e) { const rock = [4, 16, 40].some(k => [1, -1].some(sd => { const ri = R.regionAt(mx + nx * k * sd, my + ny * k * sd); return ri >= 0 && regions[ri].rock && regions[ri].lvl !== L; }));   // рядом камень — край каменный
          e.bot = Math.max(e.low, R.below(L)); e.soft = g.soft && !rock && (L - e.bot) <= 0.51; e.ym = Math.max(ay, by); E.push(e); }
      }
    }
    const seen = new Set(); R.edges[L] = E.filter(e => { const k = Math.round(e.x0 * 2 + e.x1 * 2) + ',' + Math.round(e.y0 * 2 + e.y1 * 2); if (seen.has(k)) return false; seen.add(k); return true; });
  }
  let n = 0; for (const L of R.levels) for (const e of R.edges[L] || []) e.seed = n++;
  /** Рядом с краем яруса или склоном (для расстановки деревьев, камней, жил): d — на каком расстоянии. */
  R.nearEdge = (x, y, d, rockOnly = false) => {
    const i0 = R.regionAt(x, y), l = i0 < 0 ? 0 : regions[i0].lvl;
    for (let a = 0; a < 6.28; a += 0.785) for (const k of [0.5, 1]) {
      const px = x + Math.cos(a) * d * k, py = y + Math.sin(a) * d * k, j = R.regionAt(px, py);
      if (j === i0) continue; const l2 = j < 0 ? 0 : regions[j].lvl; if (l2 === l) continue;
      if (!rockOnly || (j >= 0 && regions[j].rock) || (i0 >= 0 && regions[i0].rock)) return true;
    }
    return false;
  };
  R.nearRamp = (x, y, d) => R.ramps.some(rp => { const b = rp.bb; return x > b[0] - d && x < b[2] + d && y > b[1] - d && y < b[3] + d && rp.pts.some((p, i) => i && segDist(x, y, rp.pts[i - 1][0], rp.pts[i - 1][1], p[0], p[1]) < rp.w * 0.8 + d); });
  return R;
}

// ---------------------------------------------------------------- поиск пути (сетка, A*)
const CELL = 40;
/** Сетка проходимости: ok(x,y) — можно стоять; между соседями — можно пройти (без обрыва). Строится один раз на зону. */
export function buildNav(W) {
  const R = W.relief, nx = Math.ceil(W.W / CELL), ny = Math.ceil(W.H / CELL), N = nx * ny;
  const ok = new Uint8Array(N), link = new Uint8Array(N);   // link: биты 8 направлений
  const cx = i => (i % nx) * CELL + CELL / 2, cy = i => Math.floor(i / nx) * CELL + CELL / 2;
  const free = W.navOk || W.walkable;
  for (let i = 0; i < N; i++) ok[i] = free(cx(i), cy(i)) ? 1 : 0;
  // клетки у краёв ярусов и склонов: только там высота меняется — там и проверять шаг
  const mark = new Uint8Array(N), at = (x, y) => { const X = Math.floor(x / CELL), Y = Math.floor(y / CELL); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const u = X + a, v = Y + b; if (u >= 0 && v >= 0 && u < nx && v < ny) mark[v * nx + u] = 1; } };
  if (R) {
    for (const L of R.levels) for (const e of R.edges[L] || []) { const n = Math.ceil(Math.hypot(e.x1 - e.x0, e.y1 - e.y0) / 20); for (let k = 0; k <= n; k++) at(e.x0 + (e.x1 - e.x0) * k / n, e.y0 + (e.y1 - e.y0) * k / n); }
    for (const rp of R.ramps) for (let x = rp.bb[0]; x <= rp.bb[2] + CELL; x += CELL) for (let y = rp.bb[1]; y <= rp.bb[3] + CELL; y += CELL) at(Math.min(x, rp.bb[2]), Math.min(y, rp.bb[3]));
  }
  const D = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  for (let i = 0; i < N; i++) {
    if (!ok[i]) continue; const x = i % nx, y = Math.floor(i / nx);
    for (let d = 0; d < 4; d++) {   // половина направлений, вторая — зеркально
      const X = x + D[d][0], Y = y + D[d][1]; if (X < 0 || Y < 0 || X >= nx || Y >= ny) continue; const j = Y * nx + X; if (!ok[j]) continue;
      if (R && (mark[i] || mark[j])) {   // у обрыва — с запасом: и соседние линии в 12 шагах по бокам без обрыва
        const L = Math.hypot(cx(j) - cx(i), cy(j) - cy(i)), ox = -(cy(j) - cy(i)) / L * 12, oy = (cx(j) - cx(i)) / L * 12;
        if (!R.canStep(cx(i), cy(i), cx(j), cy(j)) || !R.canStep(cx(i) + ox, cy(i) + oy, cx(j) + ox, cy(j) + oy) || !R.canStep(cx(i) - ox, cy(i) - oy, cx(j) - ox, cy(j) - oy)) continue;
      }
      { let ok2 = true; for (let q = 1; q < 4 && ok2; q++) { const x = cx(i) + (cx(j) - cx(i)) * q / 4, y = cy(i) + (cy(j) - cy(i)) * q / 4; if (!free(x, y)) ok2 = false; } if (!ok2) continue; }   // бревно, камень поперёк
      if (d % 2 === 1) { const a = y * nx + X, b = Y * nx + x; if (!ok[a] || !ok[b]) continue; }   // по диагонали — только если оба боковых свободны
      link[i] |= 1 << d; link[j] |= 1 << (d + 4);
    }
  }
  return { nx, ny, ok, link, D, cx, cy, cell: CELL };
}
/** Путь от (x0,y0) до (x1,y1): точки, по которым идти (без начальной), или null, если не дойти. */
export function findPath(W, x0, y0, x1, y1, maxNodes = 30000) {
  const N = W.nav || (W.nav = buildNav(W)), { nx, ny, ok, link, D, cx, cy } = N;
  const near = (x, y) => { const X = Math.max(0, Math.min(nx - 1, Math.floor(x / CELL))), Y = Math.max(0, Math.min(ny - 1, Math.floor(y / CELL))); let best = -1, bd = 1e9; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const a = X + dx, b = Y + dy; if (a < 0 || b < 0 || a >= nx || b >= ny) continue; const j = b * nx + a; if (!ok[j] || !link[j]) continue; const d = Math.hypot(cx(j) - x, cy(j) - y) + (W.relief && !W.relief.canStep(x, y, cx(j), cy(j)) ? 500 : 0); if (d < bd) { bd = d; best = j; } } return best; };
  const s = near(x0, y0), t = near(x1, y1); if (s < 0 || t < 0) return null;
  const g = new Float32Array(nx * ny).fill(Infinity), from = new Int32Array(nx * ny).fill(-1), closed = new Uint8Array(nx * ny);
  const heap = [], push = (f, i) => { heap.push([f, i]); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = k * 2 + 1, r = l + 1; let m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
  const tx = t % nx, ty = Math.floor(t / nx), hEst = i => Math.hypot(i % nx - tx, Math.floor(i / nx) - ty);
  g[s] = 0; push(hEst(s), s); let n = 0;
  while (heap.length && n++ < maxNodes) {
    const [, i] = pop(); if (closed[i]) continue; closed[i] = 1; if (i === t) break;
    const x = i % nx, y = Math.floor(i / nx);
    for (let d = 0; d < 8; d++) { if (!(link[i] & (1 << d))) continue; const j = (y + D[d][1]) * nx + x + D[d][0], c = g[i] + (d % 2 ? 1.414 : 1); if (c < g[j]) { g[j] = c; from[j] = i; push(c + hEst(j), j); } }
  }
  if (from[t] < 0 && s !== t) return null;
  const cells = []; for (let i = t; i !== s && i >= 0; i = from[i]) cells.push(i); cells.reverse();
  // сгладить: пропускать точки, если к следующей можно пройти напрямую
  const pts = cells.map(i => [cx(i), cy(i)]); pts.push([x1, y1]);
  // напрямик — только с запасом: соседние линии в 14 шагах по бокам тоже проходимы (не жаться к обрыву и брёвнам)
  const direct = (a, b) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, n = Math.ceil(L / 8), ox = -(b[1] - a[1]) / L * 14, oy = (b[0] - a[0]) / L * 14;
    for (const s of [0, 1, -1]) { for (let k = 1; k <= n; k++) { const x = a[0] + (b[0] - a[0]) * k / n + ox * s, y = a[1] + (b[1] - a[1]) * k / n + oy * s; if (!(W.navOk || W.walkable)(x, y)) return false; } if (W.relief && !W.relief.canStep(a[0] + ox * s, a[1] + oy * s, b[0] + ox * s, b[1] + oy * s)) return false; }
    return true; };
  const out = []; let cur = [x0, y0], k = 0;
  if (!pts.length) return out;
  while (k < pts.length) { let far = k; for (let m = Math.min(pts.length - 1, k + 12); m > k; m--) if (direct(cur, pts[m])) { far = m; break; } out.push(pts[far]); cur = pts[far]; k = far + 1; }
  return out;
}
/** Следующая точка пути: пройденные сбрасываются; к следующей — только если до неё прямо можно пройти. */
export function nextWaypoint(W, x, y, path) {
  while (path.length > 1) {
    const [px, py] = path[0], d = Math.hypot(px - x, py - y);
    if (d < 8 || (d < 40 && W.stepOk(x, y, path[1][0], path[1][1]) && lineFree(W, x, y, path[1][0], path[1][1]))) path.shift(); else break;
  }
  return path[0];
}
function lineFree(W, x0, y0, x1, y1) { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 10); for (let k = 1; k <= n; k++) if (!(W.navOk || W.walkable)(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n)) return false; return true; }
