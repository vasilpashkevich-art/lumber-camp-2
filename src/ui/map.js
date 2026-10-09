// Карта зоны: одна отрисовка для большой карты (K) и мини-карты.
// Логова показываются областью с названием и уровнями; самих мобов на карте нет.
import { lvlColor } from '../../data/balance.js';
import { modal } from './dom.js';

const O = '#24180f';
// цвет области логова по виду
const TINT = { den: '217,120,58', wolf: '150,150,160', boar: '140,95,55', web: '200,200,215', bandit: '200,60,50', ataman: '255,180,60',
  kennel: '150,100,60', crowfield: '70,60,90', scarefield: '220,190,90', pasture: '120,80,60', burned: '240,110,40', mill: '120,255,170' };

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
  else { p(Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? 3.4 : 8, a = i * Math.PI / 5 - Math.PI / 2; return [Math.cos(a) * r, Math.sin(a) * r]; }), '#ffb347'); }
  g.restore();
}

/** Подложка зоны: суша, дороги, деревья, столица, кладбище, выходы. k — масштаб. */
function base(g, W, k, big, q = 1) {
  g.fillStyle = '#1c2a1a'; g.fillRect(0, 0, W.W * k + 2, W.H * k + 2);
  g.beginPath(); W.edge.forEach((p, i) => i ? g.lineTo(p[0] * k, p[1] * k) : g.moveTo(p[0] * k, p[1] * k)); g.closePath(); g.fillStyle = W.Z.ground === 'z3' ? '#a8a058' : '#5d8a42'; g.fill();
  if (big) { g.strokeStyle = '#3a5a2a'; g.lineWidth = 2; g.stroke(); }
  const FC = { wheat: '#d8b44a', sun: '#c9b030', cabbage: '#7ab04a', pasture: '#9aaa52', orchard: '#6a8a3a' };
  for (const F of W.fields) { g.save(); g.translate(F.x * k, F.y * k); g.rotate(F.a || 0); g.fillStyle = FC[F.crop]; g.globalAlpha = 0.85; g.fillRect(-F.w * k / 2, -F.h * k / 2, F.w * k, F.h * k); g.restore(); }
  g.globalAlpha = 1;
  g.fillStyle = big ? '#3e6a2c' : '#4c7a36'; const ts = big ? 4 : 2 * q; for (const t of W.trees) if (!t.edge) g.fillRect(t.x * k - ts / 2, t.y * k - ts / 2, ts, ts);
  g.strokeStyle = '#c9b48a'; g.lineWidth = big ? 4 : 2 * q; g.lineCap = 'round'; g.lineJoin = 'round';
  for (const rd of W.roads) { g.beginPath(); rd.forEach((p, i) => i ? g.lineTo(p[0] * k, p[1] * k) : g.moveTo(p[0] * k, p[1] * k)); g.stroke(); }
  if (W.river) { g.beginPath(); W.river.pts.forEach(([x, y], i) => i ? g.lineTo(x * k, y * k) : g.moveTo(x * k, y * k)); g.strokeStyle = '#3f7a92'; g.lineWidth = Math.max(2 * q, W.river.w * k + (big ? 3 : 1)); g.stroke();
    for (const b of W.river.bridgeAt) { g.save(); g.translate(b.x * k, b.y * k); g.rotate(b.ra - Math.PI / 2); g.fillStyle = '#8a6a42'; g.strokeStyle = O; g.lineWidth = 1; const bw = big ? 5 : 2.5 * q, bh = big ? 9 : 4.5 * q; g.fillRect(-bw, -bh, bw * 2, bh * 2); if (big) g.strokeRect(-bw, -bh, bw * 2, bh * 2); g.restore(); } }
  for (const f of W.Z.farmsteads || []) { const x = f.x * k, y = f.y * k, s = big ? 1 : 0.5 * q; g.fillStyle = f.burned ? '#4a3a32' : '#c98a4a'; g.beginPath(); g.moveTo(x - 6 * s, y + 4 * s); g.lineTo(x - 6 * s, y - 2 * s); g.lineTo(x, y - 7 * s); g.lineTo(x + 6 * s, y - 2 * s); g.lineTo(x + 6 * s, y + 4 * s); g.closePath(); g.fill(); }
  if (W.town) { g.fillStyle = W.cap ? '#d9c79a' : 'rgba(217,199,154,.8)'; g.strokeStyle = '#4a3a24'; g.lineWidth = big ? 3 : 1.5 * q; g.beginPath(); g.arc(W.town.x * k, W.town.y * k, W.town.R * k, 0, 7); g.fill(); if (W.cap) g.stroke(); }
  if (W.castle) { const K = W.castle; g.fillStyle = '#c9bfa4'; g.strokeStyle = O; g.lineWidth = 1; g.fillRect((K.x - K.w / 2) * k, (K.y - 300) * k, K.w * k, 300 * k); if (big) g.strokeRect((K.x - K.w / 2) * k, (K.y - 300) * k, K.w * k, 300 * k); g.fillStyle = '#2f5d9a'; for (const sd of [-1, 0, 1]) { g.beginPath(); g.arc((K.x + sd * K.w * 0.4) * k, (K.y - 150) * k, (big ? 6 : 2.5 * q) * (sd ? 1 : 1.4), 0, 7); g.fill(); } }
  if (W.cap && W.cap.fountain) { g.fillStyle = '#4f8fb0'; g.beginPath(); g.arc(W.cap.x * k, W.cap.y * k, Math.max(2, W.cap.fountain.r * k), 0, 7); g.fill(); }
  const gx = W.graveyard.x * k, gy = W.graveyard.y * k, cs = big ? 2.2 : q;
  g.fillStyle = '#eee'; g.fillRect(gx - 1 * cs, gy - 4 * cs, 2 * cs, 8 * cs); g.fillRect(gx - 3 * cs, gy - 2 * cs, 6 * cs, 2 * cs);
  for (const e of W.exits) { g.fillStyle = '#ffd34d'; g.strokeStyle = O; g.lineWidth = 1; g.beginPath(); g.arc(e.x * k, e.y * k, big ? 7 : 3 * q, 0, 7); g.fill(); if (big) g.stroke(); }
}

/** Области логов. heroL — для цвета уровней. */
function lairs(g, W, k, big, q = 1) {
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

function heroMark(g, P, k, s) {
  g.save(); g.translate(P.x * k, P.y * k); g.scale(s, s);
  g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(0, 0, 9, 0, 7); g.fill();
  g.rotate(P.dir < 0 ? Math.PI : 0); g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 1.4;
  g.beginPath(); g.moveTo(7, 0); g.lineTo(-5, -5); g.lineTo(-2.5, 0); g.lineTo(-5, 5); g.closePath(); g.fill(); g.stroke(); g.restore();
}

/** Мини-карта: вся зона, области логов, рядом с героем — название ближайшего логова. */
export function drawMini(cv, G, cache) {
  const c = cv.getContext('2d'), W = G.W, w = cv.width, h = cv.height, k = Math.min(w / W.W, h / W.H), q = w / 200;
  if (!cache.mini) {
    const b = document.createElement('canvas'); b.width = w; b.height = h; const g = b.getContext('2d');
    base(g, W, k, false, q); lairs(g, W, k, false, q); cache.mini = b;
  }
  c.drawImage(cache.mini, 0, 0);
  const P = G.P;
  // ближайшее логово — подпись
  let near = null, nd = 900; for (const cp of W.camps) { const d = Math.hypot(cp.x - P.x, cp.y - P.y) - cp.r; if (d < nd) { nd = d; near = cp; } }
  if (near) { const tx = Math.max(40 * q, Math.min(w - 40 * q, near.x * k)), ty = Math.max(11 * q, near.y * k - 8 * q); text(c, near.name, tx, ty, lvlColor(near.lvl[1], G.hero.lvl), 10 * q); }
  heroMark(c, P, k, 0.7 * q);
  c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = q; const vw = 1150 * k, vh = vw * innerHeight / innerWidth; c.strokeRect(P.x * k - vw / 2, P.y * k - vh / 2, vw, vh);
}

/** Большая карта зоны поверх игры. Закрывается по K, Esc или кнопке. */
export function openMap(G) {
  const W = G.W, CW = 1100, CH = Math.round(CW * W.H / W.W);
  const m = modal(`<h2>${W.Z.name} <small style="font-size:15px;color:#a89878">ур. ${W.Z.lvl[0]}–${W.Z.lvl[1]}</small></h2><canvas width="${CW * 2}" height="${CH * 2}"></canvas><p class="hint">Цвет подписи — насколько опасно для вас: зелёный — легко, жёлтый — по силам, оранжевый и красный — опасно. Жёлтые кружки на краю — дороги в другие края.</p><div class="row"><button class="btn main" data-x="ok">Закрыть (K)</button></div>`, 'map');
  const cv = m.querySelector('canvas'), g = cv.getContext('2d'), k = CW / W.W;
  const draw = () => {
    g.setTransform(2, 0, 0, 2, 0, 0); g.clearRect(0, 0, CW, CH);
    base(g, W, k, true); lairs(g, W, k, true);
    // подписи логов
    for (const cp of W.camps) {
      const x = cp.x * k, y = cp.y * k, r = Math.max(18, (cp.r + 90) * k), col = lvlColor(cp.lvl[1], G.hero.lvl);
      const below = y + r + 16 < CH - 4, ty = below ? y + r + 14 : y - r - 18;
      text(g, cp.name, x, ty, '#fff2d8', 14); text(g, lvTxt(cp), x, ty + 15, col, 12);
    }
    const c = W.town; if (c) text(g, c.name, c.x * k, c.y * k + 5, '#ffe9a8', W.cap ? 17 : 15);
    text(g, W.graveyard.name, W.graveyard.x * k, W.graveyard.y * k + 22, '#e8e0cc', 12, false);
    for (const e of W.exits) { const ex = Math.min(CW - 70, e.x * k), ey = Math.min(CH - 24, e.y * k - 12); text(g, `${e.to} · ${e.lvl}`, ex, ey, '#ffd34d', 12); }
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
