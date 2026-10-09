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
  if (cap) for (const b of cap.buildings) block(cap.x + b.dx, cap.y + b.dy, b.col || 80);
  if (Z.village) { for (const b of Z.village.buildings) block(Z.village.x + b.dx, Z.village.y + b.dy, b.col || 70); block(Z.village.x, Z.village.y + 10, 26); }
  for (const f of Z.farmsteads || []) block(f.x, f.y, 70);
  if (Z.mill) block(Z.mill.x, Z.mill.y, 40);
  const inside = (x, y, pad = 0) => inPoly(x, y, edge) && (pad <= 0 || edgeDist(x, y) > pad);
  // река: вода по ломаной, мосты — проходы
  const R = W.river;
  if (R) R.bridgeAt = R.bridges.map(bx => { for (let i = 0; i < R.pts.length - 1; i++) { const [ax, ay] = R.pts[i], [cx, cy] = R.pts[i + 1]; if (bx >= ax && bx <= cx) { const k = (bx - ax) / (cx - ax); return { x: bx, y: ay + (cy - ay) * k, a: Math.atan2(cy - ay, cx - ax) }; } } return null; }).filter(Boolean);
  W.riverD = (x, y) => { if (!R) return 1e9; let m = 1e9; for (let i = 0; i < R.pts.length - 1; i++) m = Math.min(m, segDist(x, y, R.pts[i][0], R.pts[i][1], R.pts[i + 1][0], R.pts[i + 1][1])); return m; };
  W.water = (x, y, pad = 0) => R && W.riverD(x, y) < R.w / 2 + pad && !R.bridgeAt.some(b => { const dx = x - b.x, dy = y - b.y, ca = Math.cos(b.a), sa = Math.sin(b.a), u = dx * ca + dy * sa; return Math.abs(u) < 36; });
  W.blocked = (x, y) => W.blocks.some(b => Math.abs(x - b.x) < b.rx && ((x - b.x) / b.rx) ** 2 + ((y - b.y) / b.ry) ** 2 < 1);
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
    if (inField(x, y, 30)) continue;
    if (W.blocks.some(b => dist(x, y, b.x, b.y) < b.rx + 60)) continue;
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
  // стога у полей и плетни вдоль них — отдельным зерном, чтобы деревья не сдвигались
  const r2 = rng(Z.seed + 500);
  for (const F of W.fields) {
    if (F.crop === 'pasture' || F.crop === 'orchard') continue;
    const n = 1 + Math.floor(r2() * 2);
    for (let i = 0; i < n; i++) { const c = Math.cos(F.a || 0), s = Math.sin(F.a || 0), u = (r2() - 0.5) * F.w * 0.9, v = F.h / 2 + 45 + r2() * 30, x = F.x + u * c - v * s, y = F.y + u * s + v * c;
      if (inside(x, y, 60) && !W.water(x, y, 40) && roadD(x, y) > 60) { W.props.push({ kind: 'hay', x, y }); W.blocks.push({ x, y: y - 6, rx: 26, ry: 11 }); } }
  }
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
  for (const g of c.gates) { let d = Math.abs(((a - g + Math.PI * 3) % (Math.PI * 2)) - Math.PI); if (d < GATE_W) return true; }
  return false;
}

/** В столице или посёлке: мобы сюда не заходят, здоровье восстанавливается быстро. */
export const inCity = (W, x, y) => !!W.town && dist(x, y, W.town.x, W.town.y) < W.town.R;
export const clampW = (W, x, y) => [clamp(x, 0, W.W), clamp(y, 0, W.H)];
