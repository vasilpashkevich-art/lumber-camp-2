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
  const W = {
    Z, edge, W: Z.W, H: Z.H, cap,
    roads: Z.roads, roadD,
    trees: [], grid: new Map(),
    camps: [], graveyard: Z.graveyard, exits: Z.exits,
    tufts: [],
  };
  const inside = (x, y, pad = 0) => inPoly(x, y, edge) && (pad <= 0 || edgeDist(x, y) > pad);
  const edgeDist = (x, y) => { let m = 1e9; for (let i = 0; i < edge.length; i++) { const a = edge[i], b = edge[(i + 1) % edge.length]; m = Math.min(m, segDist(x, y, a[0], a[1], b[0], b[1])); } return m; };
  W.inside = inside; W.edgeDist = edgeDist;

  // лагеря и точки появления мобов
  Z.camps.forEach((c, ci) => {
    const camp = { ...c, i: ci, spawns: [] };
    for (let k = 0; k < c.n; k++) {
      const a = k / c.n * Math.PI * 2 + r() * 0.8, d = c.n === 1 ? 0 : c.r * (0.35 + r() * 0.6);
      const kind = Array.isArray(c.mob) ? c.mob[k % c.mob.length] : c.mob;
      const lvl = c.lvl[0] + Math.floor(r() * (c.lvl[1] - c.lvl[0] + 1));
      camp.spawns.push({ key: ci + ':' + k, kind, lvl, x: c.x + Math.cos(a) * d, y: c.y + Math.sin(a) * d });
    }
    W.camps.push(camp);
  });

  // деревья: не на дорогах, не в столице, не в центре лагерей, не у кладбища
  const T = Z.trees; let tries = 0;
  while (W.trees.length < T.count && tries++ < T.count * 20) {
    const x = r() * Z.W, y = r() * Z.H;
    if (!inside(x, y, 40)) continue;
    if (dist(x, y, cap.x, cap.y) < cap.R + 120) continue;
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

/** Куда можно сдвинуться из (x,y) в (nx,ny): граница зоны и стена столицы. */
export function moveTo(W, x, y, nx, ny, r = 12) {
  // граница зоны
  if (!W.inside(nx, ny)) {
    if (W.inside(nx, y)) ny = y; else if (W.inside(x, ny)) nx = x; else { nx = x; ny = y; }
  }
  // стена столицы: кольцо толщиной 36, проходы в воротах
  const c = W.cap, d0 = dist(x, y, c.x, c.y), d1 = dist(nx, ny, c.x, c.y), wall = c.R, th = 26;
  if (Math.abs(d1 - wall) < th + r || (d0 - wall) * (d1 - wall) < 0) {
    const a = Math.atan2(ny - c.y, nx - c.x);
    if (!inGate(c, a)) {
      // остаться по свою сторону стены
      const side = d0 < wall ? -1 : 1, rr = wall + side * (th + r);
      nx = c.x + Math.cos(a) * rr; ny = c.y + Math.sin(a) * rr;
    }
  }
  // постройки: эллипс под основанием
  const blocked = (x, y) => c.buildings.some(b => { const bx = c.x + b.dx, by = c.y + b.dy - 22, rx = b.col || 80, ry = rx * 0.42; return ((x - bx) / rx) ** 2 + ((y - by) / ry) ** 2 < 1; });
  if (d1 < wall && blocked(nx, ny)) {
    if (!blocked(nx, y)) ny = y; else if (!blocked(x, ny)) nx = x; else { nx = x; ny = y; }
  }
  return [nx, ny];
}

export const GATE_W = 0.15; // полуширина ворот в радианах
export function inGate(c, a) {
  for (const g of c.gates) { let d = Math.abs(((a - g + Math.PI * 3) % (Math.PI * 2)) - Math.PI); if (d < GATE_W) return true; }
  return false;
}

export const inCity = (W, x, y) => dist(x, y, W.cap.x, W.cap.y) < W.cap.R;
export const clampW = (W, x, y) => [clamp(x, 0, W.W), clamp(y, 0, W.H)];
