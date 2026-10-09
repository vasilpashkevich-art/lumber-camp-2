// Эскиз карты Грибного леса (зона 3, ур. 10–14) — в стиле большой карты игры (K). Сборка: node tools/proto/v65/build-map.mjs
import { lairGlyph } from '../../../src/ui/map.js';
const O = '#24180f', TAU = Math.PI * 2;
const rng = s => () => { s = (s * 16807 + 11) % 2147483647; return s / 2147483647; };

// ---------------------------------------------------------------- данные зоны (черновик для data/zones.js)
export const FOREST = {
  id: 'shroom', name: 'Грибной лес', lvl: [10, 14], W: 8000, H: 5000,
  edge: [[260, 300], [2600, 240], [5200, 330], [7740, 260], [7760, 2500], [7700, 4760], [4200, 4720], [260, 4760], [240, 2600]],
  // тропы: от входа с запада через стоянку купца на восток к Болотному краю; отвод к прудам
  roads: [
    [[300, 2500], [1300, 2420], [2200, 2640], [3000, 2560], [3900, 2320], [5000, 2520], [6200, 2760], [7700, 3000]],
    [[3000, 2560], [2900, 3200], [2500, 3700]],
    [[3900, 2320], [4200, 1600], [5100, 1300]],
  ],
  camp: { name: 'Стоянка купца', x: 3000, y: 2560, R: 260 },
  exits: [{ x: 300, y: 2500, to: 'Сосновый дол', lvl: '1–6' }, { x: 7700, y: 3000, to: 'Болотный край', lvl: '14–18' }],
  // ручей с севера в пруды и дальше на восток
  creek: [[2300, 300], [2250, 1100], [2050, 1900], [2150, 3000], [2200, 3700], [2900, 4100], [3800, 4250], [4700, 4350], [5600, 4500], [6400, 4700]],
  ponds: [[1600, 3650, 330, 200], [2700, 4050, 260, 170], [4750, 4300, 300, 180], [1150, 4200, 200, 120]],
  fog: [[2100, 3900, 800], [5900, 3600, 650], [6300, 1250, 550], [4700, 4350, 500]], // густой туман в низинах
  groves: [[3300, 850, 380], [5000, 2000, 330], [1250, 1750, 350], [6800, 4200, 300]], // рощи грибов-великанов
  logs: [[900, 2100], [1900, 2900], [3400, 1700], [4500, 2900], [5600, 2100], [6400, 3300], [3700, 3800], [7000, 1500], [2700, 1300]],
  camps: [
    { name: 'Грибной круг', lair: 'shroom', mob: 'gribo', lvl: [10, 11], x: 1700, y: 1200, r: 200 },
    { name: 'Квакушьи заводи', lair: 'frog', mob: 'kvakun', lvl: [10, 11], x: 1600, y: 3550, r: 220 },
    { name: 'Камышовое стойбище', lair: 'frog', mob: ['kvakun', 'kvak_shaman'], lvl: [11, 12], x: 2750, y: 3950, r: 220 },
    { name: 'Поляна дождевиков', lair: 'shroom', mob: ['sporo', 'gribo'], lvl: [11, 12], x: 3600, y: 1300, r: 220 },
    { name: 'Тёмные тенета', lair: 'web2', mob: 'weaver', lvl: [11, 12], x: 4300, y: 3250, r: 200 },
    { name: 'Гнилой лог', lair: 'shroom', mob: ['gribo', 'sporo'], lvl: [12, 13], x: 5400, y: 1450, r: 220 },
    { name: 'Шаманий омут', lair: 'frog', mob: ['kvak_shaman', 'kvakun'], lvl: [12, 13], x: 4750, y: 4100, r: 220 },
    { name: 'Паучье ущелье', lair: 'web2', mob: 'weaver', lvl: [12, 13], x: 6250, y: 1150, r: 210 },
    { name: 'Сырой овраг', lair: 'frog', mob: ['kvakun', 'kvak_shaman'], lvl: [13, 14], x: 5900, y: 3500, r: 220 },
    { name: 'Логово Паучихи', lair: 'brood', mob: ['broodmother', 'weaver'], lvl: [13, 14], x: 7000, y: 2050, r: 220 },
    { name: 'Логово Полоза', lair: 'snake', mob: 'snake', lvl: [14, 14], x: 6750, y: 4050, r: 120, rare: true },
  ],
  // жилы (на карте игры не видны): олово ≈ 40%, железо ≈ 60%
  ore: [
    { metal: 'tin', x: 1000, y: 800, r: 380, n: 2 }, { metal: 'tin', x: 2700, y: 1900, r: 320, n: 1 }, { metal: 'tin', x: 700, y: 4200, r: 300, n: 1 }, { metal: 'tin', x: 4300, y: 700, r: 340, n: 1 },
    { metal: 'iron', x: 4900, y: 3700, r: 330, n: 1 }, { metal: 'iron', x: 6000, y: 600, r: 380, n: 2 }, { metal: 'iron', x: 7300, y: 3300, r: 320, n: 1 }, { metal: 'iron', x: 5600, y: 2650, r: 300, n: 1 }, { metal: 'iron', x: 3400, y: 4500, r: 300, n: 1 }, { metal: 'iron', x: 7200, y: 700, r: 300, n: 1 },
  ],
};

// ---------------------------------------------------------------- рисование
const TINT = { shroom: '220,80,60', frog: '90,180,90', web2: '160,110,230', brood: '200,60,60', snake: '255,180,60' };
function glyph(g, kind, x, y, s) {
  if (kind === 'snake') return lairGlyph(g, 'star', x, y, s);
  g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round';
  g.fillStyle = 'rgba(20,14,8,.75)'; g.beginPath(); g.arc(0, 0, 9, 0, TAU); g.fill(); g.strokeStyle = O; g.lineWidth = 1.2;
  const P = (fn, fill) => { g.beginPath(); fn(); g.fillStyle = fill; g.fill(); g.stroke(); };
  if (kind === 'shroom') { P(() => { g.moveTo(-7, 0); g.quadraticCurveTo(0, -11, 7, 0); g.closePath(); }, '#c8382a'); P(() => g.rect(-2, 0, 4, 6), '#efe6d2'); g.fillStyle = '#fff'; for (const [a, b] of [[-3, -3], [2, -4], [0, -1]]) { g.beginPath(); g.arc(a, b, 1, 0, TAU); g.fill(); } }
  if (kind === 'frog') { P(() => g.ellipse(0, 1.5, 7, 5, 0, 0, TAU), '#5a9a4a'); for (const sx of [-1, 1]) { P(() => g.arc(sx * 3.6, -3.4, 2.6, 0, TAU), '#5a9a4a'); g.fillStyle = '#e8c040'; g.beginPath(); g.arc(sx * 3.6, -3.4, 1.4, 0, TAU); g.fill(); g.fillStyle = O; g.fillRect(sx * 3.6 - 0.4, -4.2, 0.8, 1.6); } g.beginPath(); g.moveTo(-4.4, 2.6); g.quadraticCurveTo(0, 4.8, 4.4, 2.6); g.stroke(); }
  if (kind === 'web2' || kind === 'brood') { g.strokeStyle = '#e8e0f0'; g.lineWidth = 0.9; for (let i = 0; i < 4; i++) { const a = -0.9 + i * 0.6; g.beginPath(); g.moveTo(0, 0); g.lineTo(-Math.cos(a) * 8, Math.sin(a) * 6); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 8, Math.sin(a) * 6); g.stroke(); } g.strokeStyle = O; P(() => g.ellipse(0, 0, 3.4, 4, 0, 0, TAU), kind === 'brood' ? '#a82a2a' : '#5a3a8a'); if (kind === 'brood') { g.fillStyle = '#ffd34d'; g.beginPath(); g.arc(0, -6.4, 1.6, 0, TAU); g.fill(); } }
  g.restore();
}
function text(g, s, x, y, col, size, bold = true) { g.font = `${bold ? 'bold ' : ''}${size}px Georgia, serif`; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = Math.max(3, size / 4); g.strokeStyle = 'rgba(20,14,8,.92)'; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y); }
const lvTxt = cp => cp.lvl[0] === cp.lvl[1] ? `ур. ${cp.lvl[0]}` : `ур. ${cp.lvl[0]}–${cp.lvl[1]}`;
const LVCOL = l => l <= 11 ? '#5fd35f' : l <= 12 ? '#ffe066' : l <= 13 ? '#ff9a3a' : '#ff5a4a'; // цвет — как для героя 12-го уровня

export function drawMap(g, Z, k, showOre) {
  const r = rng(5);
  g.fillStyle = '#16200f'; g.fillRect(0, 0, Z.W * k + 2, Z.H * k + 2);
  const edge = () => { g.beginPath(); Z.edge.forEach((p, i) => i ? g.lineTo(p[0] * k, p[1] * k) : g.moveTo(p[0] * k, p[1] * k)); g.closePath(); };
  edge(); g.fillStyle = '#3e5a2c'; g.fill(); g.strokeStyle = '#2a3e1e'; g.lineWidth = 2; g.stroke();
  g.save(); edge(); g.clip();
  for (let i = 0; i < 260; i++) { const x = r() * Z.W * k, y = r() * Z.H * k, s = 6 + r() * 20; g.fillStyle = r() < 0.5 ? 'rgba(90,124,58,.35)' : 'rgba(40,58,28,.35)'; g.beginPath(); g.ellipse(x, y, s, s * 0.6, 0, 0, TAU); g.fill(); }
  // лес точками, гуще к краям
  g.fillStyle = '#2a4a20'; for (let i = 0; i < 1600; i++) { const x = r() * Z.W, y = r() * Z.H; const nearRoad = Z.roads.some(rd => rd.some(([a, b]) => Math.hypot(a - x, b - y) < 260)); if (nearRoad && r() < 0.8) continue; g.fillRect(x * k - 2, y * k - 2, 4, 4); }
  // ручей и пруды
  g.strokeStyle = '#2f6a7a'; g.lineWidth = 5; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); Z.creek.forEach(([x, y], i) => i ? g.lineTo(x * k, y * k) : g.moveTo(x * k, y * k)); g.stroke();
  for (const [x, y, rx, ry] of Z.ponds) { g.fillStyle = '#2f6a7a'; g.beginPath(); g.ellipse(x * k, y * k, rx * k, ry * k, 0, 0, TAU); g.fill(); g.strokeStyle = '#4a6a3a'; g.lineWidth = 2; g.stroke(); }
  // рощи грибов-великанов
  for (const [x, y, R] of Z.groves) for (let i = 0; i < 7; i++) { const a = r() * TAU, d = r() * R * k, px = x * k + Math.cos(a) * d, py = y * k + Math.sin(a) * d * 0.7; g.fillStyle = '#efe6d2'; g.fillRect(px - 1, py, 2, 4); g.fillStyle = ['#c8382a', '#8a6a4a', '#4a6aa8'][i % 3]; g.beginPath(); g.ellipse(px, py, 5, 3.4, 0, Math.PI, 0); g.fill(); g.strokeStyle = O; g.lineWidth = 0.8; g.stroke(); }
  // поваленные стволы
  for (const [x, y] of Z.logs) { g.save(); g.translate(x * k, y * k); g.rotate((x * 7 % 10) / 10 - 0.5); g.fillStyle = '#6a4a2c'; g.strokeStyle = O; g.lineWidth = 1; g.beginPath(); g.roundRect(-10, -2.4, 20, 4.8, 2); g.fill(); g.stroke(); g.restore(); }
  // тропы
  g.strokeStyle = '#a89068'; g.lineWidth = 4; for (const rd of Z.roads) { g.beginPath(); rd.forEach(([x, y], i) => i ? g.lineTo(x * k, y * k) : g.moveTo(x * k, y * k)); g.stroke(); }
  g.restore();
  // жилы (для обсуждения)
  if (showOre) for (const A of Z.ore) { g.setLineDash([4, 4]); g.strokeStyle = A.metal === 'iron' ? '#e8904a' : '#dfe5ea'; g.lineWidth = 1.6; g.beginPath(); g.arc(A.x * k, A.y * k, A.r * k, 0, TAU); g.stroke(); g.setLineDash([]); text(g, A.metal === 'iron' ? 'железо' : 'олово', A.x * k, A.y * k + 4, A.metal === 'iron' ? '#e8904a' : '#dfe5ea', 11, false); }
  // логова
  for (const cp of Z.camps) { const col = TINT[cp.lair]; g.fillStyle = `rgba(${col},.22)`; g.beginPath(); g.arc(cp.x * k, cp.y * k, Math.max(18, (cp.r + 90) * k), 0, TAU); g.fill(); g.setLineDash([6, 5]); g.strokeStyle = `rgba(${col},.9)`; g.lineWidth = 1.8; g.stroke(); g.setLineDash([]); }
  for (const cp of Z.camps) glyph(g, cp.lair, cp.x * k, cp.y * k, 1.25);
  // туман поверх
  for (const [x, y, R] of Z.fog) { const gr = g.createRadialGradient(x * k, y * k, 4, x * k, y * k, R * k); gr.addColorStop(0, 'rgba(230,236,232,.5)'); gr.addColorStop(1, 'rgba(230,236,232,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x * k, y * k, R * k, R * k * 0.7, 0, 0, TAU); g.fill(); }
  // стоянка купца
  { const x = Z.camp.x * k, y = Z.camp.y * k; g.fillStyle = 'rgba(217,199,154,.85)'; g.strokeStyle = '#4a3a24'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, Z.camp.R * k, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = '#efe6d2'; g.strokeStyle = O; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 9, y + 2); g.quadraticCurveTo(x - 9, y - 10, x, y - 10); g.quadraticCurveTo(x + 9, y - 10, x + 9, y + 2); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#6a4a2c'; g.fillRect(x - 10, y + 1, 20, 4); g.strokeRect(x - 10, y + 1, 20, 4); g.beginPath(); g.arc(x - 4, y + 7, 3, 0, TAU); g.fill(); g.stroke(); }
  for (const e of Z.exits) { g.fillStyle = '#ffd34d'; g.strokeStyle = O; g.lineWidth = 1; g.beginPath(); g.arc(e.x * k, e.y * k, 7, 0, TAU); g.fill(); g.stroke(); }
  // подписи
  for (const cp of Z.camps) { const y = cp.y * k - Math.max(18, (cp.r + 90) * k) - 6; text(g, (cp.rare ? '★ ' : '') + cp.name, cp.x * k, y - 13, cp.rare ? '#ffd34d' : '#f4ead2', 13); text(g, lvTxt(cp), cp.x * k, y + 1, LVCOL(cp.lvl[1]), 12); }
  text(g, Z.camp.name, Z.camp.x * k, Z.camp.y * k + Z.camp.R * k + 16, '#ffe9a8', 13);
  text(g, 'купец, отдых, возрождение', Z.camp.x * k, Z.camp.y * k + Z.camp.R * k + 30, '#d8c8a0', 11, false);
  for (const e of Z.exits) text(g, `${e.to} · ${e.lvl}`, e.x * k + (e.x < 1000 ? 50 : -50), e.y * k - 12, '#ffd34d', 12);
  text(g, 'Квакушкин ручей', 2050 * k + 70, 1500 * k, '#9ad0e0', 12, false);
  text(g, 'Грибной лес', Z.W * k / 2, 28, '#ffe9a8', 24); text(g, 'уровни 10–14 · запад → восток сложнее', Z.W * k / 2, 46, '#d8c8a0', 13, false);
}
