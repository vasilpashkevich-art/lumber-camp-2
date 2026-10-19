// Карта зоны: одна отрисовка для большой карты (K) и мини-карты.
// Логова показываются областью с названием и уровнями; самих мобов на карте нет.
import { qState, qAreas, npcMark, npcsOf, QUESTS } from '../systems/quests.js';
import { boardMark, oAreas } from '../systems/orders.js';
import { TOUCH } from './dom.js';
import { lvlColor } from '../../data/balance.js';
import { modal } from './dom.js';
import { MOBS } from '../../data/mobs.js';

const O = '#24180f';
// цвет области логова по виду
const TINT = { den: '217,120,58', wolf: '150,150,160', boar: '140,95,55', web: '200,200,215', bandit: '200,60,50', ataman: '255,180,60',
  kennel: '150,100,60', crowfield: '70,60,90', scarefield: '220,190,90', pasture: '120,80,60', burned: '240,110,40', mill: '120,255,170',
  shroom: '220,80,60', frog: '90,180,90', web2: '160,110,230', brood: '200,60,60', snake: '255,180,60' };

/** Значок логова: голова лисы, волка, кабана, паук, шатёр, звезда атамана. */
export function lairGlyph(g, kind, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round'; g.lineWidth = 1.4 / s * Math.min(1, s); g.strokeStyle = O;
  const p = (pts, fill) => { g.beginPath(); pts.forEach(([a, b], i) => i ? g.lineTo(a, b) : g.moveTo(a, b)); g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 1.2; g.stroke(); };
  g.fillStyle = 'rgba(20,14,8,.75)'; g.beginPath(); g.arc(0, 0, 9, 0, 7); g.fill();
  if (kind === 'den') { p([[-7, -6], [-3, -2], [3, -2], [7, -6], [6, 2], [0, 7], [-6, 2]], '#e0803a'); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-2, 4); g.lineTo(0, 7); g.lineTo(2, 4); g.fill(); }
  else if (kind === 'wolf') { p([[-7, -7], [-3, -2], [3, -2], [7, -7], [6, 1], [2, 7], [-2, 7], [-6, 1]], '#a8a8b0'); g.fillStyle = O; g.fillRect(-3, 0, 1.6, 1.6); g.fillRect(1.4, 0, 1.6, 1.6); }
  else if (kind === 'boar') { p([[-7, -4], [0, -7], [7, -4], [7, 3], [0, 7], [-7, 3]], '#8a5a34'); g.fillStyle = '#f0e8d0'; g.beginPath(); g.moveTo(-4, 3); g.lineTo(-6, -1); g.lineTo(-3, 2); g.moveTo(4, 3); g.lineTo(6, -1); g.lineTo(3, 2); g.fill(); }
  else if (kind === 'web') { g.strokeStyle = '#e8e8f0'; g.lineWidth = 1.1; for (let i = 0; i < 4; i++) { const a = -0.9 + i * 0.6; g.beginPath(); g.moveTo(0, 0); g.lineTo(-Math.cos(a) * 8, Math.sin(a) * 6); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 8, Math.sin(a) * 6); g.stroke(); } g.fillStyle = '#2a2230'; g.beginPath(); g.arc(0, 0, 3.6, 0, 7); g.fill(); g.fillStyle = '#c8323a'; g.fillRect(-0.8, -1.5, 1.6, 3); }
  else if (kind === 'bandit') { p([[-7, 6], [0, -7], [7, 6]], '#c8504a'); g.fillStyle = O; g.beginPath(); g.moveTo(-2, 6); g.lineTo(0, 1); g.lineTo(2, 6); g.fill(); }
  else if (kind === 'kennel') { p([[-7, -4], [-4, -7], [4, -7], [7, -4], [6, 3], [0, 7], [-6, 3]], '#7a5232'); g.fillStyle = '#2a1a10'; g.beginPath(); g.ellipse(0, 3, 2, 1.4, 0, 0, 7); g.fill(); g.fillStyle = '#e8b040'; g.fillRect(-3.4, -2, 1.6, 1.6); g.fillRect(1.8, -2, 1.6, 1.6); }
  else if (kind === 'crowfield') { p([[-8, -1], [-3, -5], [0, -2], [3, -5], [8, -1], [3, 0], [0, 4], [-3, 0]], '#3a3444'); g.fillStyle = '#c9a24a'; g.beginPath(); g.moveTo(0, 1); g.lineTo(2, 3); g.lineTo(0, 4); g.fill(); }
  else if (kind === 'scarefield') { p([[-8, -1], [8, -1], [4, -3], [-4, -3]], '#d8b44a'); p([[-3, -3], [-2, -8], [2, -8], [3, -3]], '#e8c860'); g.fillStyle = '#d8c49a'; g.beginPath(); g.arc(0, 3, 4, 0, 7); g.fill(); g.fillStyle = '#2a1a10'; g.fillRect(-2.2, 2, 1.4, 1.4); g.fillRect(0.8, 2, 1.4, 1.4); }
  else if (kind === 'pasture') { p([[-7, -2], [7, -2], [5, 6], [-5, 6]], '#5a3a28'); for (const sx of [-1, 1]) p([[sx * 4, -2], [sx * 9, -8], [sx * 6, -1]], '#ece2c8'); }
  else if (kind === 'burned') { p([[-5, 6], [-6, 0], [-2, -3], [-1, -8], [3, -3], [6, 0], [5, 6]], '#ff7a2a'); p([[-2, 6], [-2, 2], [0, -1], [2, 2], [2, 6]], '#ffd34d'); }
  else if (kind === 'mill') { g.strokeStyle = '#e8e0cc'; g.lineWidth = 2; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; g.beginPath(); g.moveTo(0, -1); g.lineTo(Math.cos(a) * 8, -1 + Math.sin(a) * 8); g.stroke(); } p([[-3, 7], [-2, -1], [2, -1], [3, 7]], '#8a6a4a'); g.fillStyle = '#9affc8'; g.beginPath(); g.arc(0, -1, 1.6, 0, 7); g.fill(); }
  else if (kind === 'shroom') { p([[-7, 0], [-5, -5], [0, -7], [5, -5], [7, 0]], '#c8382a'); p([[-2, 0], [2, 0], [2, 6], [-2, 6]], '#efe6d2'); g.fillStyle = '#fff'; for (const [a, b] of [[-3, -3], [2, -4], [0, -1]]) { g.beginPath(); g.arc(a, b, 1, 0, 7); g.fill(); } }
  else if (kind === 'frog') { g.beginPath(); g.ellipse(0, 1.5, 7, 5, 0, 0, 7); g.fillStyle = '#5a9a4a'; g.fill(); g.lineWidth = 1.2; g.stroke(); for (const sx of [-1, 1]) { g.beginPath(); g.arc(sx * 3.6, -3.4, 2.6, 0, 7); g.fillStyle = '#5a9a4a'; g.fill(); g.stroke(); g.fillStyle = '#e8c040'; g.beginPath(); g.arc(sx * 3.6, -3.4, 1.4, 0, 7); g.fill(); g.fillStyle = O; g.fillRect(sx * 3.6 - 0.4, -4.2, 0.8, 1.6); } g.beginPath(); g.moveTo(-4.4, 2.6); g.quadraticCurveTo(0, 4.8, 4.4, 2.6); g.stroke(); }
  else if (kind === 'web2' || kind === 'brood') { g.strokeStyle = '#e8e0f0'; g.lineWidth = 0.9; for (let i = 0; i < 4; i++) { const a = -0.9 + i * 0.6; g.beginPath(); g.moveTo(0, 0); g.lineTo(-Math.cos(a) * 8, Math.sin(a) * 6); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 8, Math.sin(a) * 6); g.stroke(); } g.strokeStyle = O; g.beginPath(); g.ellipse(0, 0, 3.4, 4, 0, 0, 7); g.fillStyle = kind === 'brood' ? '#a82a2a' : '#5a3a8a'; g.fill(); g.lineWidth = 1.2; g.stroke(); if (kind === 'brood') { g.fillStyle = '#ffd34d'; g.beginPath(); g.arc(0, -6.4, 1.6, 0, 7); g.fill(); } }
  else { p(Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? 3.4 : 8, a = i * Math.PI / 5 - Math.PI / 2; return [Math.cos(a) * r, Math.sin(a) * r]; }), '#ffb347'); }
  g.restore();
}

/** Подложка зоны: суша, дороги, деревья, столица, кладбище, выходы. k — масштаб. */
function base(g, W, k, big, q = 1) {
  if (W.rooms) {   // v77: подземелье — комнаты на тёмной скале, проёмы, костёр
    g.fillStyle = '#121612'; g.fillRect(0, 0, W.W * k + 2, W.H * k + 2);
    for (const r of W.rooms) { g.fillStyle = '#6a7462'; g.fillRect(r.x0 * k, r.y0 * k, (r.x1 - r.x0) * k, (r.y1 - r.y0) * k); }
    if (big) { g.strokeStyle = '#2a3026'; g.lineWidth = 3; for (const r of W.rooms) g.strokeRect(r.x0 * k, r.y0 * k, (r.x1 - r.x0) * k, (r.y1 - r.y0) * k); g.fillStyle = '#6a7462'; for (const r of W.rooms) g.fillRect(r.x0 * k + 1.5, r.y0 * k + 1.5, (r.x1 - r.x0) * k - 3, (r.y1 - r.y0) * k - 3); }
    if (W.town) { g.fillStyle = 'rgba(217,199,154,.35)'; g.beginPath(); if (W.town.rect) { const R = W.town.rect; g.rect(R[0] * k, R[1] * k, (R[2] - R[0]) * k, (R[3] - R[1]) * k); } else g.arc(W.town.x * k, W.town.y * k, W.town.R * k, 0, 7); g.fill(); }
    const gy = W.graveyard; if (gy.fire) { g.fillStyle = '#ff9a3a'; g.beginPath(); g.arc(gy.x * k, gy.y * k, big ? 6 : 3 * q, 0, 7); g.fill(); }
    for (const e of W.exits) { g.fillStyle = e.temple ? '#d0bc68' : '#ffd34d'; g.strokeStyle = O; g.lineWidth = 1; g.beginPath(); g.arc(e.x * k, e.y * k, big ? 7 : 3 * q, 0, 7); g.fill(); if (big) g.stroke(); }
    return;
  }
  g.fillStyle = '#1c2a1a'; g.fillRect(0, 0, W.W * k + 2, W.H * k + 2);
  if (W.Z.coast) {   // v114: за краем — море, скалы, топь или лес (по карте континента)
    const cx = W.W / 2 * k, cy = W.H / 2 * k, F = { sea: '#4f8da0', cliff: '#5e5446', swamp: '#3e4a2e', forest: '#1c2a1a' };
    const far = (x, y) => [cx + (x * k - cx) * 4, cy + (y * k - cy) * 4];
    const C = { north: [far(0, 0), far(W.W, 0)], east: [far(W.W, 0), far(W.W, W.H)], south: [far(W.W, W.H), far(0, W.H)], west: [far(0, W.H), far(0, 0)] };
    for (const [sd, [a, b]] of Object.entries(C)) { g.fillStyle = F[W.Z.coast[sd]] || F.forest; g.beginPath(); g.moveTo(cx, cy); g.lineTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.closePath(); g.fill(); }
    g.save(); g.beginPath(); W.edge.forEach((p, i) => i ? g.lineTo(p[0] * k, p[1] * k) : g.moveTo(p[0] * k, p[1] * k)); g.closePath(); g.lineJoin = 'round'; g.strokeStyle = '#d8c38c'; g.lineWidth = Math.max(2, 120 * k);
    for (const [sd, [a, b]] of Object.entries(C)) if (W.Z.coast[sd] === 'sea') { g.save(); g.beginPath(); g.moveTo(cx, cy); g.lineTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.closePath(); g.clip(); g.beginPath(); W.edge.forEach((p, i) => i ? g.lineTo(p[0] * k, p[1] * k) : g.moveTo(p[0] * k, p[1] * k)); g.closePath(); g.stroke(); g.restore(); }
    g.restore();
  }
  g.beginPath(); W.edge.forEach((p, i) => i ? g.lineTo(p[0] * k, p[1] * k) : g.moveTo(p[0] * k, p[1] * k)); g.closePath(); g.fillStyle = W.Z.ground === 'z3' ? '#a8a058' : W.Z.moss ? '#3e5a2c' : '#5d8a42'; g.fill();
  if (big) { g.strokeStyle = '#3a5a2a'; g.lineWidth = 2; g.stroke(); }
  // рельеф (v71): низины темнее, холмы светлее; каменные края — обводкой
  if (W.relief) { g.save(); g.clip();
    for (const rg of W.relief.regions) { g.beginPath(); rg.poly.forEach(([x, y], i) => i ? g.lineTo(x * k, y * k) : g.moveTo(x * k, y * k)); g.closePath();
      g.fillStyle = rg.lvl <= -1 ? 'rgba(12,24,10,.32)' : rg.lvl < 0 ? 'rgba(12,24,10,.22)' : rg.lvl >= 1 ? 'rgba(220,210,170,.30)' : 'rgba(230,240,180,.14)'; g.fill();
      if (rg.rock) { g.strokeStyle = 'rgba(40,30,20,.75)'; g.lineWidth = big ? 2 : 1 * q; g.stroke(); } }
    g.restore(); }
  const FC = { wheat: '#d8b44a', sun: '#c9b030', cabbage: '#7ab04a', pasture: '#9aaa52', orchard: '#6a8a3a' };
  for (const F of W.fields) { g.save(); g.translate(F.x * k, F.y * k); g.rotate(F.a || 0); g.fillStyle = FC[F.crop]; g.globalAlpha = 0.85; g.fillRect(-F.w * k / 2, -F.h * k / 2, F.w * k, F.h * k); g.restore(); }
  g.globalAlpha = 1;
  g.fillStyle = big ? '#3e6a2c' : '#4c7a36'; const ts = big ? 4 : 2 * q; for (const t of W.trees) if (!t.edge) g.fillRect(t.x * k - ts / 2, t.y * k - ts / 2, ts, ts);
  g.strokeStyle = '#c9b48a'; g.lineWidth = big ? 4 : 2 * q; g.lineCap = 'round'; g.lineJoin = 'round';
  for (const rd of W.roads) { g.beginPath(); rd.forEach((p, i) => i ? g.lineTo(p[0] * k, p[1] * k) : g.moveTo(p[0] * k, p[1] * k)); g.stroke(); }
  if (W.creek) { g.beginPath(); W.creek.pts.forEach(([x, y], i) => i ? g.lineTo(x * k, y * k) : g.moveTo(x * k, y * k)); g.strokeStyle = '#2f6a7a'; g.lineWidth = Math.max(1.5 * q, W.creek.w * k + (big ? 2 : 0.5)); g.stroke(); }
  for (const [x, y, rx, ry] of W.ponds || []) { g.fillStyle = '#2f6a7a'; g.beginPath(); g.ellipse(x * k, y * k, rx * k, ry * k, 0, 0, 7); g.fill(); }
  if (W.Z.fog && big) for (const [x, y, R] of W.Z.fog) { const gr = g.createRadialGradient(x * k, y * k, 4, x * k, y * k, R * k); gr.addColorStop(0, 'rgba(230,236,232,.4)'); gr.addColorStop(1, 'rgba(230,236,232,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x * k, y * k, R * k, R * k * 0.7, 0, 0, 7); g.fill(); }
  if (W.river) { g.beginPath(); W.river.pts.forEach(([x, y], i) => i ? g.lineTo(x * k, y * k) : g.moveTo(x * k, y * k)); g.strokeStyle = '#3f7a92'; g.lineWidth = Math.max(2 * q, W.river.w * k + (big ? 3 : 1)); g.stroke();
    for (const b of W.river.bridgeAt) { g.save(); g.translate(b.x * k, b.y * k); g.rotate(b.ra - Math.PI / 2); g.fillStyle = '#8a6a42'; g.strokeStyle = O; g.lineWidth = 1; const bw = big ? 5 : 2.5 * q, bh = big ? 9 : 4.5 * q; g.fillRect(-bw, -bh, bw * 2, bh * 2); if (big) g.strokeRect(-bw, -bh, bw * 2, bh * 2); g.restore(); } }
  for (const f of W.Z.farmsteads || []) { const x = f.x * k, y = f.y * k, s = big ? 1 : 0.5 * q; g.fillStyle = f.burned ? '#4a3a32' : '#c98a4a'; g.beginPath(); g.moveTo(x - 6 * s, y + 4 * s); g.lineTo(x - 6 * s, y - 2 * s); g.lineTo(x, y - 7 * s); g.lineTo(x + 6 * s, y - 2 * s); g.lineTo(x + 6 * s, y + 4 * s); g.closePath(); g.fill(); }
  if (W.town) { g.fillStyle = W.cap ? '#d9c79a' : 'rgba(217,199,154,.8)'; g.strokeStyle = '#4a3a24'; g.lineWidth = big ? 3 : 1.5 * q; g.beginPath(); if (W.town.rect) { const R = W.town.rect; g.rect(R[0] * k, R[1] * k, (R[2] - R[0]) * k, (R[3] - R[1]) * k); } else g.arc(W.town.x * k, W.town.y * k, W.town.R * k, 0, 7); g.fill(); if (W.cap) g.stroke(); }
  if (W.castle) { const K = W.castle; g.fillStyle = '#c9bfa4'; g.strokeStyle = O; g.lineWidth = 1; g.fillRect((K.x - K.w / 2) * k, (K.y - 300) * k, K.w * k, 300 * k); if (big) g.strokeRect((K.x - K.w / 2) * k, (K.y - 300) * k, K.w * k, 300 * k); g.fillStyle = '#2f5d9a'; for (const sd of [-1, 0, 1]) { g.beginPath(); g.arc((K.x + sd * K.w * 0.4) * k, (K.y - 150) * k, (big ? 6 : 2.5 * q) * (sd ? 1 : 1.4), 0, 7); g.fill(); } }
  if (W.cap && W.cap.fountain) { g.fillStyle = '#4f8fb0'; g.beginPath(); g.arc((W.cap.x + (W.cap.fountain.x || 0)) * k, (W.cap.y + (W.cap.fountain.y || 0)) * k, Math.max(2, W.cap.fountain.r * k), 0, 7); g.fill(); }
  if (W.yard) {   // v121: Конный двор — светлая площадка, загон, конюшня и подкова
    const Y = W.yard, P0 = Y.paddock; g.fillStyle = 'rgba(217,199,154,.35)'; g.beginPath(); g.arc(Y.x * k, Y.y * k, Y.R * k, 0, 7); g.fill();
    g.strokeStyle = '#8a6a3a'; g.lineWidth = big ? 1.5 : 0.8 * q; g.strokeRect(P0.x0 * k, P0.y0 * k, (P0.x1 - P0.x0) * k, (P0.y1 - P0.y0) * k);
    g.fillStyle = '#7a4a28'; g.fillRect((Y.x + Y.stable.dx - 180) * k, (Y.y + Y.stable.dy - 60) * k, 360 * k, 60 * k);
    const hx = Y.x * k, hy = (Y.y + 40) * k, hs = big ? 7 : 3.2 * q; g.lineCap = 'round'; g.strokeStyle = '#3a2410'; g.lineWidth = hs * 0.75; g.beginPath(); g.arc(hx, hy, hs, Math.PI * 0.8, Math.PI * 2.2); g.stroke(); g.strokeStyle = '#e8c25a'; g.lineWidth = hs * 0.45; g.stroke(); g.lineCap = 'butt';
  }
  const gx = W.graveyard.x * k, gy = W.graveyard.y * k, cs = big ? 2.2 : q;
  if (!W.graveyard.hidden) { g.fillStyle = '#eee'; g.fillRect(gx - 1 * cs, gy - 4 * cs, 2 * cs, 8 * cs); g.fillRect(gx - 3 * cs, gy - 2 * cs, 6 * cs, 2 * cs); }
  for (const e of W.exits) { g.fillStyle = '#ffd34d'; g.strokeStyle = O; g.lineWidth = 1; g.beginPath(); g.arc(e.x * k, e.y * k, big ? 7 : 3 * q, 0, 7); g.fill(); if (big) g.stroke(); }
}

/** Области логов. heroL — для цвета уровней. */
// v117: в подземелье у обычных групп — только круг (без значка), у боссов — звезда; убитый босс — тусклая
const bossOf = cp => (Array.isArray(cp.mob) ? cp.mob : [cp.mob]).find(id => MOBS[id] && MOBS[id].boss);
function lairs(g, W, k, big, q = 1, dead = null) {
  if (W.rooms) {
    for (const cp of W.camps) {
      const b = bossOf(cp), x = cp.x * k, y = cp.y * k;
      if (!b) { const r = Math.max(big ? 18 : 5 * q, (cp.r + 90) * k); g.fillStyle = `rgba(220,120,90,${big ? 0.2 : 0.3})`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.setLineDash(big ? [6, 5] : []); g.strokeStyle = 'rgba(230,140,100,.85)'; g.lineWidth = big ? 1.6 : q; g.stroke(); g.setLineDash([]); continue; }
      g.save(); if (dead && dead[b]) g.globalAlpha = 0.35; lairGlyph(g, 'star', x, y, big ? 1.5 : 0.8 * q); g.restore();
    }
    return;
  }
  for (const cp of W.camps) {
    const x = cp.x * k, y = cp.y * k, r = Math.max(big ? 18 : 5 * q, (cp.r + 90) * k), col = TINT[cp.lair] || '255,255,255';
    g.fillStyle = `rgba(${col},${big ? 0.22 : 0.35})`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    g.setLineDash(big ? [6, 5] : []); g.strokeStyle = `rgba(${col},.9)`; g.lineWidth = big ? 1.8 : q; g.stroke(); g.setLineDash([]);
  }
  for (const cp of W.camps) lairGlyph(g, cp.lair, cp.x * k, cp.y * k, big ? 1.25 : 0.62 * q);
}

function text(g, s, x, y, col, size, bold = true) {
  g.font = `${bold ? 'bold ' : ''}${size}px Georgia, serif`; g.textAlign = 'center'; g.lineJoin = 'round';
  g.lineWidth = Math.max(3, size / 4); g.strokeStyle = 'rgba(20,14,8,.92)'; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y);
}
const lvTxt = cp => cp.lvl[0] === cp.lvl[1] ? `ур. ${cp.lvl[0]}` : `ур. ${cp.lvl[0]}–${cp.lvl[1]}`;

// v95: задания на карте — области целей (золотая штриховка) и знаки жителей
function questLayer(g, G, k, big, q = 1) {
  const S = qState(G.hero), W = G.W;
  for (const id of Object.keys(S.act)) for (const a of qAreas(W, G.hero, id)) {
    if (a.npc) continue; const x = a.x * k, y = a.y * k, r = Math.max(big ? 14 : 5 * q, a.r * k);
    g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = 'rgba(255,210,60,.16)'; g.fill(); g.clip();
    g.strokeStyle = 'rgba(255,214,90,.45)'; g.lineWidth = big ? 1.5 : q; for (let d = -r * 2; d < r * 2; d += big ? 7 : 4 * q) { g.beginPath(); g.moveTo(x + d - r, y - r); g.lineTo(x + d + r, y + r); g.stroke(); }
    g.restore(); g.strokeStyle = 'rgba(255,214,90,.8)'; g.lineWidth = big ? 1.6 : q; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
    if (big) text(g, QUESTS[id].name, x, y - r - 4, '#ffd96a', 12);
  }
  for (const a of oAreas(W, G.hero)) {   // v129: где выполнять заказы — голубая штриховка
    const x = a.x * k, y = a.y * k, r = Math.max(big ? 14 : 5 * q, a.r * k);
    g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = 'rgba(90,184,255,.14)'; g.fill(); g.clip();
    g.strokeStyle = 'rgba(120,200,255,.45)'; g.lineWidth = big ? 1.5 : q; for (let d = -r * 2; d < r * 2; d += big ? 7 : 4 * q) { g.beginPath(); g.moveTo(x + d + r, y - r); g.lineTo(x + d - r, y + r); g.stroke(); }
    g.restore(); g.strokeStyle = 'rgba(120,200,255,.8)'; g.lineWidth = big ? 1.6 : q; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
    if (big && !a.board) text(g, a.name, x, y - r - 4, '#8ad0ff', 12);
  }
  for (const bd of W.boards || []) { const mk = boardMark(G.hero, bd.zone); if (!mk) continue; text(g, mk, bd.x * k, bd.y * k + (big ? 6 : 4 * q), '#5ab8ff', big ? 20 : 13 * q); if (big) text(g, 'Доска заказов', bd.x * k, bd.y * k + 20, '#d8f2ff', 11, false); }   // v128
  for (const n of npcsOf(W.Z.id)) { const mk = npcMark(G.hero, n.id); if (!mk) continue; const gold = mk === '!' || mk === '?'; text(g, mk === '?' || mk === 'wait' ? '?' : '!', n.x * k, n.y * k + (big ? 6 : 4 * q), gold ? '#ffd23a' : '#b8b0a0', big ? 20 : 13 * q); if (big) text(g, n.name, n.x * k, n.y * k + 20, '#fff2d8', 11, false); }
}

function heroMark(g, P, k, s) {
  g.save(); g.translate(P.x * k, P.y * k); g.scale(s, s);
  g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(0, 0, 9, 0, 7); g.fill();
  g.rotate(P.mvx || P.mvy ? Math.atan2(P.mvy || 0, P.mvx || 0) : P.dir < 0 ? Math.PI : 0); g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 1.4;
  g.beginPath(); g.moveTo(7, 0); g.lineTo(-5, -5); g.lineTo(-2.5, 0); g.lineTo(-5, 5); g.closePath(); g.fill(); g.stroke(); g.restore();
}

/** Мини-карта (v67 — с приближением): вся зона или ближе к герою; области логов, рядом — название ближайшего логова. */
export const MINI_Z = [1, 1.8, 3, 4.5];
let miniZ = 0; try { const v = +localStorage.getItem('lumber-camp2-minizoom'); if (v >= 0 && v < MINI_Z.length) miniZ = v; } catch (_) { }
/** Шаг приближения мини-карты: +1 ближе, −1 дальше. Возвращает новый шаг. */
export function miniZoom(d) { miniZ = Math.max(0, Math.min(MINI_Z.length - 1, miniZ + d)); try { localStorage.setItem('lumber-camp2-minizoom', String(miniZ)); } catch (_) { } return miniZ; }
export const miniZoomLevel = () => miniZ;
export function drawMini(cv, G, cache) {
  const c = cv.getContext('2d'), W = G.W, w = cv.width, h = cv.height, mz = MINI_Z[miniZ], k = Math.min(w / W.W, h / W.H) * mz, q = w / 200;
  const key = W.Z.id + ':' + miniZ + (G.dg ? ':' + Object.keys(G.dg.bosses).length : '');
  if (cache.miniKey !== key) {   // подложка — один раз на край и шаг приближения
    const b = document.createElement('canvas'); b.width = Math.ceil(W.W * k); b.height = Math.ceil(W.H * k); const g = b.getContext('2d');
    base(g, W, k, false, q); lairs(g, W, k, false, q * Math.min(1.6, Math.sqrt(mz)), G.dg && G.dg.bosses); cache.mini = b; cache.miniKey = key;
  }
  const P = G.P, B = cache.mini;
  // сдвиг: герой в середине, но край зоны не уходит внутрь рамки
  const ox = B.width <= w ? (w - B.width) / 2 : Math.max(w - B.width, Math.min(0, w / 2 - P.x * k));
  const oy = B.height <= h ? (h - B.height) / 2 : Math.max(h - B.height, Math.min(0, h / 2 - P.y * k));
  c.fillStyle = '#1c2a1a'; c.fillRect(0, 0, w, h); c.drawImage(B, ox, oy);
  c.save(); c.translate(ox, oy);
  // ближайшее логово — подпись
  let near = null, nd = 900; for (const cp of W.camps) { const d = Math.hypot(cp.x - P.x, cp.y - P.y) - cp.r; if (d < nd) { nd = d; near = cp; } }
  if (near) { const tx = Math.max(40 * q - ox, Math.min(w - 40 * q - ox, near.x * k)), ty = Math.max(11 * q - oy, near.y * k - 8 * q * Math.min(2, mz)); text(c, near.name, tx, ty, lvlColor(near.lvl[1], G.hero.lvl), 10 * q); }
  questLayer(c, G, k, false, q);
  heroMark(c, P, k, 0.7 * q);
  const V = G.view || { w: 1150, h: 1150 * innerHeight / innerWidth };
  c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = q; c.strokeRect(P.x * k - V.w * k / 2, P.y * k - V.h * k / 2, V.w * k, V.h * k);
  c.restore();
}

/** Большая карта зоны поверх игры. Закрывается по K, Esc или кнопке. */
export function openMap(G) {
  const W = G.W, CW = 1100, CH = Math.round(CW * W.H / W.W);
  const m = modal(`<h2>${W.Z.name} <small style="font-size:15px;color:#a89878">ур. ${W.Z.lvl[0]}–${W.Z.lvl[1]}</small></h2><canvas width="${CW * 2}" height="${CH * 2}"></canvas><p class="hint">Цвет подписи — насколько опасно для вас: зелёный — легко, жёлтый — по силам, оранжевый и красный — опасно. Жёлтые кружки на краю — дороги в другие края. Золотая штриховка — где искать цели ваших заданий, «!» и «?» — жители с заданиями; голубые знак и штриховка — доска заказов и где их выполнять.</p><div class="row"><button class="btn main" data-x="ok">Закрыть${TOUCH ? '' : ' (K)'}</button></div>`, 'map');
  const cv = m.querySelector('canvas'), g = cv.getContext('2d'), k = CW / W.W;
  const draw = () => {
    g.setTransform(2, 0, 0, 2, 0, 0); g.clearRect(0, 0, CW, CH);
    base(g, W, k, true); lairs(g, W, k, true, 1, G.dg && G.dg.bosses);
    // подписи логов
    for (const cp of W.camps) {
      const x = cp.x * k, y = cp.y * k, r = Math.max(18, (cp.r + 90) * k), col = lvlColor(cp.lvl[1], G.hero.lvl);
      const below = y + r + 16 < CH - 4, ty = below ? y + r + 14 : y - r - 18;
      text(g, cp.name, x, ty, '#fff2d8', 14); text(g, lvTxt(cp), x, ty + 15, col, 12);
    }
    const c = W.town; if (c) text(g, c.name, c.x * k, c.y * k + 5, '#ffe9a8', W.cap ? 17 : 15);
    if (!W.graveyard.hidden) text(g, W.graveyard.name, W.graveyard.x * k, W.graveyard.y * k + 22, '#e8e0cc', 12, false);
    if (W.yard) text(g, W.yard.name, W.yard.x * k, (W.yard.y + 40) * k + 22, '#ffe9a8', 13);
    for (const e of W.exits) { const ex = Math.min(CW - 70, e.x * k), ey = Math.min(CH - 24, e.y * k - 12); text(g, `${e.to} · ${e.lvl}`, ex, ey, '#ffd34d', 12); }
    questLayer(g, G, k, true);
    heroMark(g, G.P, k, 1.6); text(g, 'Вы', G.P.x * k, G.P.y * k - 16, '#fff', 12);
  };
  draw();
  m.querySelector('[data-x=ok]').onclick = () => m.close();
  const onKey = e => { if (e.code === 'KeyK') { e.preventDefault(); e.stopPropagation(); m.close(); } };
  addEventListener('keydown', onKey, true);
  const oc = () => removeEventListener('keydown', onKey, true); m.onclose = oc;
  m.isMap = true;
  return m;
}
