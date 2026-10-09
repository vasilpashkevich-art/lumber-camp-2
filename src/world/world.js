// Мир зоны: граница, деревья, дороги, лагеря, столица. Строится из данных зоны и её зерна —
// у всех одинаковый, от сохранения не зависит.
import { rng, inPoly, segDist, dist, clamp } from '../engine/util.js';

const CELL = 400; // ячейка сетки для быстрого поиска деревьев рядом с экраном

export function buildWorld(Z) {
  const r = rng(Z.seed);
  // неровная граница
  const edge = [];
  for (let i = 0; i < Z.edge.length; i++) {
    const [ax, ay] = Z.edge[i], [bx, by] = Z.edge[(i + 1) % Z.edge.length];
    const n = Math.max(2, Math.round(Math.hypot(bx - ax, by - ay) / 160));
    for (let k = 0; k < n; k++) {
      const t = k / n, j = k === 0 ? 0 : 70;
      edge.push([ax + (bx - ax) * t + (r() - 0.5) * j, ay + (by - ay) * t + (r() - 0.5) * j]);
    }
  }
  const cap = Z.capital;
  const roadD = (x, y) => {
    let m = 1e9;
    for (const rd of Z.roads) for (let i = 0; i < rd.length - 1; i++) m = Math.min(m, segDist(x, y, rd[i][0], rd[i][1], rd[i + 1][0], rd[i + 1][1]));
    for (const [px, py, pr] of Z.plazas || []) m = Math.min(m, Math.max(0, Math.hypot(x - px, (y - py) / 0.72) - pr));
    return m;
  };
  // безопасное место зоны: столица со стеной или посёлок без стены (мобы не заходят, отдых быстрее)
  const town = cap ? { x: cap.x, y: cap.y, R: cap.R, name: cap.name } : Z.village ? { x: Z.village.x, y: Z.village.y, R: Z.village.R, name: Z.village.name } : null;
  const W = {
    Z, edge, W: Z.W, H: Z.H, cap, town, village: Z.village || null,
    roads: Z.roads, roadD,
    trees: [], grid: new Map(),
    camps: [], graveyard: Z.graveyard, exits: Z.exits,
    tufts: [], blocks: [], props: [], river: Z.river || null, fields: Z.fields || [],
  };
  // постройки, у которых можно что-то сделать (E): столичные и посёлка, с координатами
  const T0 = cap || Z.village;
  W.houses = T0 ? T0.buildings.map(b => ({ ...b, x: T0.x + b.dx, y: T0.y + b.dy })) : [];
  // препятствия: эллипс под основанием построек (столица, посёлок, хутора, мельница)
  const block = (x, y, rx) => W.blocks.push({ x, y: y - 22, rx, ry: rx * 0.42 });
  if (cap) for (const b of cap.buildings) if (b.col) block(cap.x + b.dx, cap.y + b.dy, b.col);
  // дворец, терраса с лестницей, фонтан: прямоугольники и эллипс
  const rect = (x0, y0, x1, y1) => W.blocks.push({ rect: true, x0, y0, x1, y1 });
  if (cap && cap.castle) {
    const K = cap.castle, fy = cap.y + K.dy, cx = cap.x, T = K.terrace, sw = K.stairs + 36;
    rect(cx - K.w / 2, cap.y - Math.sqrt(cap.R ** 2 - (K.w / 2) ** 2) - 5, cx + K.w / 2, fy);   // сам дворец до северной стены (только внутри стены)
    rect(cx - T, fy + 56, cx - sw, fy + K.front); rect(cx + sw, fy + 56, cx + T, fy + K.front);   // подпорная стенка террасы
    rect(cx - T - 14, fy - 10, cx - T + 8, fy + K.front); rect(cx + T - 8, fy - 10, cx + T + 14, fy + K.front);   // торцы террасы
    rect(cx - T, fy - 10, cx - K.w / 2, fy + 4); rect(cx + K.w / 2, fy - 10, cx + T, fy + 4);   // за террасой к стене не уйти
    W.castle = { x: cx, y: fy, ...K };
  }
  if (cap && cap.fountain) W.blocks.push({ x: cap.x, y: cap.y - 18, rx: cap.fountain.r + 8, ry: (cap.fountain.r + 8) * 0.55 });
  if (Z.village) { for (const b of Z.village.buildings) block(Z.village.x + b.dx, Z.village.y + b.dy, b.col || 70); if (Z.village.well !== false) block(Z.village.x, Z.village.y + 10, 26); }
  for (const f of Z.farmsteads || []) block(f.x + (f.burned ? 20 : 50), f.y, f.burned ? 80 : 128);
  if (Z.mill) block(Z.mill.x, Z.mill.y, 58);
  // плиточные дорожки столицы (для травы и проверок)
  W.onPave = (x, y) => {
    if (!cap || !cap.ring) return false;
    const dx = x - cap.x, dy = y - cap.y, d = Math.hypot(dx, dy);
    if (d < cap.fountain.plaza || Math.abs(d - cap.ring.r) < cap.ring.w / 2) return true;
    for (const p of cap.paths) { const u = dx * Math.cos(p.a) + dy * Math.sin(p.a), v = -dx * Math.sin(p.a) + dy * Math.cos(p.a); if (u > 0 && u < p.to && Math.abs(v) < p.w / 2) return true; }
    return false;
  };
  const inside = (x, y, pad = 0) => inPoly(x, y, edge) && (pad <= 0 || edgeDist(x, y) > pad);
  // река: вода по ломаной, мосты — проходы
  const R = W.river;
  // мост — там, где дорога пересекает реку (ближе всего к заданной точке); a — угол реки, ra — угол дороги
  const cross = (p, q, u, v) => { const d = (q[0] - p[0]) * (v[1] - u[1]) - (q[1] - p[1]) * (v[0] - u[0]); if (!d) return null; const t = ((u[0] - p[0]) * (v[1] - u[1]) - (u[1] - p[1]) * (v[0] - u[0])) / d, w = ((u[0] - p[0]) * (q[1] - p[1]) - (u[1] - p[1]) * (q[0] - p[0])) / d; return t >= 0 && t <= 1 && w >= 0 && w <= 1 ? [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t] : null; };
  if (R) R.bridgeAt = R.bridges.map(bx => {
    let best = null;
    for (const rd of Z.roads) for (let i = 0; i < rd.length - 1; i++) for (let k = 0; k < R.pts.length - 1; k++) {
      const P = cross(rd[i], rd[i + 1], R.pts[k], R.pts[k + 1]); if (!P || (best && Math.abs(best.x - bx) < Math.abs(P[0] - bx))) continue;
      best = { x: P[0], y: P[1], a: Math.atan2(R.pts[k + 1][1] - R.pts[k][1], R.pts[k + 1][0] - R.pts[k][0]), ra: Math.atan2(rd[i + 1][1] - rd[i][1], rd[i + 1][0] - rd[i][0]) };
    }
    if (best) best.len = R.w / Math.max(0.5, Math.abs(Math.sin(best.ra - best.a))) + 70;   // настил длиннее, если река наискось
    return best;
  }).filter(Boolean);
  W.riverD = (x, y) => { if (!R) return 1e9; let m = 1e9; for (let i = 0; i < R.pts.length - 1; i++) m = Math.min(m, segDist(x, y, R.pts[i][0], R.pts[i][1], R.pts[i + 1][0], R.pts[i + 1][1])); return m; };
  // пруды Грибного леса (v65): вода-эллипс, обходить
  const PONDS = Z.ponds || [];
  W.ponds = PONDS; W.creek = Z.creek || null;
  const inPond = (x, y, pad) => PONDS.some(([px, py, rx, ry]) => ((x - px) / (rx + pad)) ** 2 + ((y - py) / (ry + pad * 0.6)) ** 2 < 1);
  W.water = (x, y, pad = 0) => (PONDS.length && inPond(x, y, pad)) || R && W.riverD(x, y) < R.w / 2 + pad && !R.bridgeAt.some(b => { const dx = x - b.x, dy = y - b.y, u = -dx * Math.sin(b.ra) + dy * Math.cos(b.ra), l = dx * Math.cos(b.ra) + dy * Math.sin(b.ra); return Math.abs(u) < 36 && Math.abs(l) < b.len / 2; });
  W.blocked = (x, y) => W.blocks.some(b => b.rect ? x > b.x0 && x < b.x1 && y > b.y0 && y < b.y1 : Math.abs(x - b.x) < b.rx && ((x - b.x) / b.rx) ** 2 + ((y - b.y) / b.ry) ** 2 < 1);
  /** Можно ли стоять здесь мобу: внутри зоны, не в воде, не в постройке. */
  W.walkable = (x, y) => inside(x, y) && !W.water(x, y) && !W.blocked(x, y);
  const inField = (x, y, pad) => W.fields.some(F => { const dx = x - F.x, dy = y - F.y, c = Math.cos(-(F.a || 0)), s = Math.sin(-(F.a || 0)), u = dx * c - dy * s, v = dx * s + dy * c; return Math.abs(u) < F.w / 2 + pad && Math.abs(v) < F.h / 2 + pad; });
  W.inField = inField;
  const edgeDist = (x, y) => { let m = 1e9; for (let i = 0; i < edge.length; i++) { const a = edge[i], b = edge[(i + 1) % edge.length]; m = Math.min(m, segDist(x, y, a[0], a[1], b[0], b[1])); } return m; };
  W.inside = inside; W.edgeDist = edgeDist;

  // лагеря и точки появления мобов
  Z.camps.forEach((c, ci) => {
    const camp = { ...c, i: ci, spawns: [] };
    for (let k = 0; k < c.n; k++) {
      const a = k / c.n * Math.PI * 2 + r() * 0.8, d = c.n === 1 ? 0 : c.r * (0.35 + r() * 0.6);
      const kind = Array.isArray(c.mob) ? c.mob[k % c.mob.length] : c.mob;
      const lvl = c.lvl[0] + Math.floor(r() * (c.lvl[1] - c.lvl[0] + 1));
      // ключ моба: в Сосновом доле — как раньше (старые сохранения), в других зонах — с именем зоны
      camp.spawns.push({ key: (Z.id === 'pine' ? '' : Z.id + ':') + ci + ':' + k, kind, lvl, x: c.x + Math.cos(a) * d, y: c.y + Math.sin(a) * d });
    }
    W.camps.push(camp);
  });

  // точка появления в постройке или в воде — сдвинуть по кругу на свободное место (без зерна: старые точки не меняются)
  for (const c of W.camps) for (const sp of c.spawns) {
    if (W.walkable(sp.x, sp.y)) continue;
    const a0 = Math.atan2(sp.y - c.y, sp.x - c.x), d0 = Math.hypot(sp.x - c.x, sp.y - c.y);
    search: for (let dd = 0; dd < 6; dd++) for (let k = 1; k < 12; k++) { const a = a0 + k * 0.5, d = Math.max(20, d0 - dd * 30), x = c.x + Math.cos(a) * d, y = c.y + Math.sin(a) * d; if (W.walkable(x, y)) { sp.x = x; sp.y = y; break search; } }
  }
  // деревья: не на дорогах, не в столице, не в центре лагерей, не у кладбища
  const T = Z.trees; let tries = 0;
  while (W.trees.length < T.count && tries++ < T.count * 20) {
    const x = r() * Z.W, y = r() * Z.H;
    if (!inside(x, y, 40)) continue;
    if (town && dist(x, y, town.x, town.y) < town.R + 120) continue;
    if (R && W.riverD(x, y) < R.w / 2 + 50) continue;
    if (PONDS.length && inPond(x, y, 60)) continue;
    if (inField(x, y, 30)) continue;
    if (W.blocks.some(b => !b.rect && dist(x, y, b.x, b.y) < b.rx + 60)) continue;
    if (roadD(x, y) < 70) continue;
    if (W.camps.some(c => dist(x, y, c.x, c.y) < c.r * 0.7 + 30)) continue;
    if (dist(x, y, Z.graveyard.x, Z.graveyard.y) < 180) continue;
    if (W.trees.some(t => Math.abs(t.x - x) < 46 && Math.abs(t.y - y) < 46)) continue;
    // деревья гуще у краёв зоны
    if (edgeDist(x, y) > 700 && r() < 0.45) continue;
    const kind = T.kinds[Math.floor(r() * T.kinds.length)];
    addTree(W, { x, y, kind, s: 0.85 + r() * 0.35, v: r() });
  }
  // плотный лес вдоль края (за ним — горы)
  for (let i = 0; i < edge.length; i++) {
    const [ax, ay] = edge[i], [bx, by] = edge[(i + 1) % edge.length];
    const n = Math.round(Math.hypot(bx - ax, by - ay) / 70);
    for (let k = 0; k < n; k++) {
      const t = k / n, x = ax + (bx - ax) * t + (r() - 0.5) * 40, y = ay + (by - ay) * t + (r() - 0.5) * 40;
      if (Z.exits.some(e => dist(x, y, e.x, e.y) < 260)) continue;
      addTree(W, { x, y, kind: 2, s: 1 + r() * 0.3, v: r(), edge: true });
    }
  }
  // деревья в столице — по списку (не из зерна, старые деревья не сдвигаются)
  if (cap && cap.trees) for (const [dx, dy, kind] of cap.trees) addTree(W, { x: cap.x + dx, y: cap.y + dy, kind, s: 0.95, v: ((dx * 7 + dy * 3) % 100 + 100) % 100 / 100, town: true });
  // стога у полей и плетни вдоль них — отдельным зерном, чтобы деревья не сдвигались
  const r2 = rng(Z.seed + 500);
  for (const F of W.fields) {
    if (F.crop === 'pasture' || F.crop === 'orchard') continue;
    const n = 1 + Math.floor(r2() * 2);
    for (let i = 0; i < n; i++) { const c = Math.cos(F.a || 0), s = Math.sin(F.a || 0), u = (r2() - 0.5) * F.w * 0.9, v = F.h / 2 + 45 + r2() * 30, x = F.x + u * c - v * s, y = F.y + u * s + v * c;
      if (inside(x, y, 60) && !W.water(x, y, 40) && roadD(x, y) > 60) { W.props.push({ kind: 'hay', x, y }); W.blocks.push({ x, y: y - 6, rx: 26, ry: 11 }); } }
  }
  // скалы и пригорки (v61): у края зоны и кое-где посреди — отдельным зерном, остальное не сдвигается
  const r3 = rng(Z.seed + 700); W.rocks = [];
  const rockOk = (x, y, rr) => inside(x, y, 30) && roadD(x, y) > rr + 50 && !(town && dist(x, y, town.x, town.y) < town.R + rr + 140)
    && !W.camps.some(c => dist(x, y, c.x, c.y) < c.r + rr + 60) && !inField(x, y, rr + 20) && !(R && W.riverD(x, y) < R.w / 2 + rr + 30)
    && !Z.exits.some(e => dist(x, y, e.x, e.y) < 300) && dist(x, y, Z.graveyard.x, Z.graveyard.y) > 260
    && !W.blocks.some(b => !b.rect && dist(x, y, b.x, b.y) < b.rx + rr + 30) && !W.rocks.some(o => dist(x, y, o.x, o.y) < o.w * 0.5 + rr + 40);
  for (let i = 0, tries = 0; i < 26 && tries < 2000; tries++) {
    const e = edge[Math.floor(r3() * edge.length)], cx = Z.W / 2, cy = Z.H / 2, a = Math.atan2(cy - e[1], cx - e[0]), d = 110 + r3() * 200;
    const x = e[0] + Math.cos(a) * d, y = e[1] + Math.sin(a) * d, w = 130 + r3() * 90;
    if (!rockOk(x, y, w * 0.5)) continue; W.rocks.push({ x, y, w, h: w * (0.55 + r3() * 0.15), s: Math.floor(r3() * 1000) }); i++;
  }
  for (let i = 0, tries = 0; i < 9 && tries < 2000; tries++) {
    const x = 400 + r3() * (Z.W - 800), y = 400 + r3() * (Z.H - 800), w = 90 + r3() * 60;
    if (!rockOk(x, y, w * 0.5) || edgeDist(x, y) < 500) continue; W.rocks.push({ x, y, w, h: w * (0.55 + r3() * 0.15), s: Math.floor(r3() * 1000) }); i++;
  }
  for (const o of W.rocks) W.blocks.push({ x: o.x, y: o.y - 4, rx: o.w * 0.48, ry: o.w * 0.16 });
  // Грибной лес (v65): поваленные стволы (обходить), рощи грибов-великанов, папоротники, светящиеся грибочки, камыш у прудов — отдельным зерном
  if (Z.moss) {
    const r4 = rng(Z.seed + 900), free = (x, y, rr) => inside(x, y, 40) && roadD(x, y) > rr + 30 && !W.water(x, y, rr * 0.4) && !(town && dist(x, y, town.x, town.y) < town.R + rr + 40) && !W.camps.some(c => dist(x, y, c.x, c.y) < c.r * 0.6 + rr) && !Z.exits.some(e => dist(x, y, e.x, e.y) < 260);
    for (const [lx, ly] of Z.logs || []) { const len = 80 + r4() * 40; if (!free(lx, ly, 60)) continue; W.props.push({ kind: 'log', x: lx, y: ly, len, s: Math.floor(r4() * 1000) }); W.blocks.push({ rect: true, x0: lx - len / 2 - 4, y0: ly - 14, x1: lx + len / 2 + 4, y1: ly + 2 }); }
    for (const [gx, gy, gr] of Z.groves || []) for (let i = 0; i < 6; i++) { const a = r4() * 6.283, d = Math.sqrt(r4()) * gr, x = gx + Math.cos(a) * d, y = gy + Math.sin(a) * d * 0.8; if (!free(x, y, 40) || W.trees.some(t => Math.abs(t.x - x) < 50 && Math.abs(t.y - y) < 40)) continue; addTree(W, { x, y, kind: 'gshroom', s: 0.8 + r4() * 0.5, v: r4() }); }
    for (let i = 0; i < 260; i++) { const x = r4() * Z.W, y = r4() * Z.H; if (!free(x, y, 16) || W.blocked(x, y)) continue; W.props.push({ kind: r4() < 0.75 ? 'fern' : 'glow', x, y, s: Math.floor(r4() * 1000), k: 0.8 + r4() * 0.5 }); }
    for (const [px, py, rx, ry] of PONDS) for (let i = 0; i < 9; i++) { const a = r4() * 6.283, x = px + Math.cos(a) * (rx + 14), y = py + Math.sin(a) * (ry + 10); if (Math.sin(a) < -0.2 && r4() < 0.5) continue; W.props.push({ kind: 'reeds', x, y, s: Math.floor(r4() * 1000) }); }
  }
  if (W.rocks.length) { W.trees = W.trees.filter(t => !W.rocks.some(o => Math.abs(t.x - o.x) < o.w * 0.6 && Math.abs(t.y - o.y) < o.w * 0.3)); W.grid.clear(); const all = W.trees; W.trees = []; for (const t of all) addTree(W, t); }
  return W;
}

function addTree(W, t) {
  W.trees.push(t);
  const k = Math.floor(t.x / CELL) + ',' + Math.floor(t.y / CELL);
  let a = W.grid.get(k); if (!a) W.grid.set(k, a = []); a.push(t);
}

/** Деревья в прямоугольнике (для рисования). */
export function treesIn(W, x0, y0, x1, y1) {
  const out = [];
  for (let i = Math.floor(x0 / CELL); i <= Math.floor(x1 / CELL); i++)
    for (let j = Math.floor(y0 / CELL); j <= Math.floor(y1 / CELL); j++) {
      const a = W.grid.get(i + ',' + j); if (a) for (const t of a) out.push(t);
    }
  return out;
}

/** Куда можно сдвинуться из (x,y) в (nx,ny): граница зоны, вода, стена столицы, постройки. */
export function moveTo(W, x, y, nx, ny, r = 12) {
  const bad = (a, b) => !W.inside(a, b) || W.water(a, b, 4) || W.blocked(a, b);
  if (bad(nx, ny)) { if (!bad(nx, y)) ny = y; else if (!bad(x, ny)) nx = x; else { nx = x; ny = y; } }
  // стена столицы: кольцо, проходы в воротах
  const c = W.cap;
  if (c) {
    const d0 = dist(x, y, c.x, c.y), d1 = dist(nx, ny, c.x, c.y), wall = c.R, th = 26;
    if (Math.abs(d1 - wall) < th + r || (d0 - wall) * (d1 - wall) < 0) {
      const a = Math.atan2(ny - c.y, nx - c.x);
      if (!inGate(c, a)) { const side = d0 < wall ? -1 : 1, rr = wall + side * (th + r); nx = c.x + Math.cos(a) * rr; ny = c.y + Math.sin(a) * rr; }
    }
  }
  return [nx, ny];
}

export const GATE_W = 0.15; // полуширина ворот в радианах
export function inGate(c, a) {
  for (const g of c.gates) { let d = Math.abs(((a - g + Math.PI * 3) % (Math.PI * 2)) - Math.PI); if (d < (c.gateW || GATE_W)) return true; }
  return false;
}

/** В столице или посёлке: мобы сюда не заходят, здоровье восстанавливается быстро. */
export const inCity = (W, x, y) => !!W.town && dist(x, y, W.town.x, W.town.y) < W.town.R;
export const clampW = (W, x, y) => [clamp(x, 0, W.W), clamp(y, 0, W.H)];
