// v114: неровная граница зоны по карте континента (эскиз tools/proto/continent). Печатает shape — точки границы против часовой.
// Вдоль каждой стороны отступ внутрь зависит от рода берега (море — заливы и мысы глубже, обрыв — средне, лес — мелко)
// и не подходит к важному (логова, дороги, выходы, посёлки, поля, жители, места заданий) ближе запаса.
// Запуск: node tools/shape.mjs [зона] — вставить вывод в data/zones.js (Z.shape).
import { ZONES } from '../data/zones.js';
import { NPCS, QUESTS } from '../data/quests.js';
import { rng } from '../src/engine/util.js';
const id = process.argv[2] || 'pine', Z = ZONES[id], C = Z.coast;
const items = [];   // [x, y, запас]
const add = (x, y, m) => items.push([x, y, m]);
for (const c of Z.camps) add(c.x, c.y, c.r + 260);
for (const rd of Z.roads) for (let i = 0; i < rd.length - 1; i++) for (let t = 0; t <= 1; t += 0.05) add(rd[i][0] + (rd[i + 1][0] - rd[i][0]) * t, rd[i][1] + (rd[i + 1][1] - rd[i][1]) * t, 170);
for (const e of Z.exits) if (!e.temple) add(e.x, e.y, 70); else add(e.x, e.y, 500);
if (Z.capital) add(Z.capital.x, Z.capital.y, 1500);
if (Z.village) add(Z.village.x, Z.village.y, Z.village.R + 250);
for (const f of Z.fields || []) add(f.x, f.y, Math.hypot(f.w, f.h) / 2 + 150);
for (const f of Z.farmsteads || []) add(f.x, f.y, 330);
if (Z.mill) add(Z.mill.x, Z.mill.y, 300);
add(Z.graveyard.x, Z.graveyard.y, 300);
for (const n of Object.values(NPCS)) if (n.zone === id) add(n.x, n.y, 260);
for (const q of Object.values(QUESTS)) if (q.zone === id) for (const g of q.goals) { for (const s of g.spots || []) add(s[0], s[1], 200); if (g.k === 'explore') add(g.x, g.y, g.r + 150); }
for (const a of [...(Z.ore || []), ...(Z.herbs || [])]) add(a.x, a.y, a.r * 0.55 + 80);
for (const p of Z.ponds || []) add(p[0], p[1], Math.max(p[2], p[3]) + 160);
if (Z.temple) add(Z.temple.x, Z.temple.y, 600);
for (const g of (Z.relief && Z.relief.giants) || []) add(g.x, g.y, 250);
const r = rng(Z.seed + 4242);
// плавный шум по стороне: сумма синусов со случайной фазой
const noise = (len) => { const ph = [r() * 6.28, r() * 6.28, r() * 6.28], f = [2 + r() * 1.5, 4.5 + r() * 2, 9 + r() * 3]; return t => (Math.sin(t * f[0] + ph[0]) * 0.55 + Math.sin(t * f[1] + ph[1]) * 0.3 + Math.sin(t * f[2] + ph[2]) * 0.15) * 0.5 + 0.5; };
const KIND = { sea: [260, 620], cliff: [240, 380], forest: [220, 140], swamp: [240, 300] };
const W = Z.W, H = Z.H, STEP = 260, RC = 900;
// обход скруглённого прямоугольника (радиус углов RC) по часовой на экране: точка, нормаль внутрь, сторона
const path = [];
const corner = (cx, cy, a0, side1, side2) => { for (let k = 1; k < 6; k++) { const a = a0 + k / 6 * Math.PI / 2, x = cx + Math.cos(a) * RC, y = cy + Math.sin(a) * RC; path.push({ x, y, n: [-Math.cos(a), -Math.sin(a)], s: k < 3 ? side1 : side2, cor: true }); } };
const line = (x0, y0, x1, y1, n, sd) => { const L = Math.hypot(x1 - x0, y1 - y0), m = Math.max(1, Math.round(L / STEP)); for (let k = 0; k <= m; k++) path.push({ x: x0 + (x1 - x0) * k / m, y: y0 + (y1 - y0) * k / m, n, s: sd, t: k / m }); };
line(RC, 0, W - RC, 0, [0, 1], 'north'); corner(W - RC, RC, -Math.PI / 2, 'north', 'east');
line(W, RC, W, H - RC, [-1, 0], 'east'); corner(W - RC, H - RC, 0, 'east', 'south');
line(W - RC, H, RC, H, [0, -1], 'south'); corner(RC, H - RC, Math.PI / 2, 'south', 'west');
line(0, H - RC, 0, RC, [1, 0], 'west'); corner(RC, RC, Math.PI, 'west', 'north');
const NZ = { north: noise(), east: noise(), south: noise(), west: noise() };
// нарушает ли точка границы запас у важного: важное должно остаться внутри и не ближе запаса к границе
const bad = (x, y, n) => items.some(([ix, iy, mg]) => { const dx = ix - x, dy = iy - y, along = dx * n[0] + dy * n[1], lat = Math.abs(-dx * n[1] + dy * n[0]); return Math.hypot(dx, dy) < mg || (lat < mg && along < 0); });
const out = [];
path.forEach((P, i) => {
  const [base, amp] = KIND[C[P.s]], q = i / path.length;
  let d = base + amp * NZ[P.s](q * 4 % 1);
  // граница не может уйти внутрь дальше важного: уменьшаем отступ; и наружу не дальше нынешней кромки (≈ 230)
  while (d > 0 && bad(P.x + P.n[0] * d, P.y + P.n[1] * d, P.n)) d -= 20;
  d = Math.max(230, d);
  out.push([Math.round(P.x + P.n[0] * d), Math.round(P.y + P.n[1] * d)]);
});
console.log(JSON.stringify(out));
