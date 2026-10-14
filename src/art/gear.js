// v64: снаряжение моделями (как в WoW) — оружие, шлемы, нагрудники, штаны, кольца, шеи.
// Один рисунок на всё: в руке, на теле, значок в сумке. Расцветка — от цвета вещи и её случайного «зерна».
// Единицы — как у тела героя: рост ≈ 36, хват оружия в точке (0,0), оружие смотрит вверх (−y).
export let O = '#24180f';
/** v75: мягкая обводка — полупрозрачная тёмная линия даёт тёмный тон своего цвета, а не чёрный контур. */
export const INK = 'rgba(34,18,6,.16)', INK_HARD = '#24180f';
export function setInk(v) { O = v; }
export const rng = s => { let a = (s * 2654435761) >>> 0 || 1; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
export const sh = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join(''); };
const pick = (r, a) => a[Math.floor(r() * a.length)];

/** Расцветка вещи: металл, отделка, дерево, обмотка, ткань, камень, свечение. */
export function palette(rar, seed, tier = 1) {
  const r = rng(seed * 7 + 3);
  const P = {
    start:  { metal: '#8a7a6a', acc: '#6a5a48', wood: '#7a5a38', wrap: '#6b4a2c', cloth: ['#cdbb94', '#bfae88'], leather: '#7a5230', gem: null, glow: null, etch: null },
    common: { metal: pick(r, ['#8f969b', '#868d93', '#979c9f']), acc: '#5d6369', wood: pick(r, ['#7a5230', '#6b4428', '#84603a']), wrap: pick(r, ['#5a3418', '#4a3020', '#6b4a2c']), cloth: pick(r, [['#7c6a4c', '#6a5a40'], ['#6b5a46', '#5a4a38'], ['#8a7a5a', '#766848']]), leather: pick(r, ['#7a5230', '#6b4428']), gem: null, glow: null, etch: null },
    good:   { metal: pick(r, ['#b4bdc4', '#aeb8c0']), acc: pick(r, ['#b8783a', '#c08a3e', '#a8703a']), wood: pick(r, ['#6b4428', '#5a3a22', '#7a5230']), wrap: pick(r, ['#3d6b3a', '#7a2e22', '#2e4a6e', '#5a3418']), cloth: pick(r, [['#3d6b3a', '#2e5430'], ['#7a2e22', '#5e2219'], ['#2e4a6e', '#22385a']]), leather: pick(r, ['#6b4428', '#5a3a22']), gem: null, glow: null, etch: null },
    rare:   { metal: pick(r, ['#cdd7de', '#b9c8d6', '#c4ccd2']), acc: pick(r, ['#e0b84a', '#e8eef2']), wood: pick(r, ['#3a2416', '#4a2a1a']), wrap: pick(r, ['#24406e', '#7a2222', '#2a2a40']), cloth: pick(r, [['#24406e', '#1a2f52'], ['#7a2222', '#5a1818'], ['#2a5a5a', '#1e4444']]), leather: '#4a2e1a', gem: pick(r, ['#4a9eff', '#e04848', '#3fd0a0']), glow: null, etch: '#7ec8ff' },
    epic:   { metal: pick(r, ['#5b5470', '#4e5068']), acc: '#e7c35a', wood: '#2a1a2a', wrap: pick(r, ['#3a1f5a', '#1a1a2a']), cloth: pick(r, [['#3a1f5a', '#2a1444'], ['#1e1a40', '#14122e']]), leather: '#2a1a24', gem: '#c58bff', glow: null, etch: '#d6b0ff' },
  }[rar] || {};
  P.leaf = { start: '#6b7a4a', common: pick(r, ['#5a7a46', '#6b7a4a']), good: pick(r, ['#4aa870', '#5a9a50']), rare: pick(r, ['#2f8a6a', '#3a7aa0']), epic: pick(r, ['#2a8a72', '#3a5aa0']) }[rar] || '#5a7a46';
  P.orb = P.gem || { start: '#c8b070', common: '#9ad0ff', good: '#9affc8' }[rar] || '#9ad0ff';
  P.edge = sh(P.metal || '#999999', 0.45); P.dark = sh(P.metal || '#999999', -0.35); P.rar = rar; P.tier = tier;
  return P;
}

function F(c, fn, fill, lw = 0.7) { c.beginPath(); fn(); if (fill) { c.fillStyle = fill; c.fill(); } if (lw) { c.strokeStyle = O; c.lineWidth = lw; c.stroke(); } }
function line(c, pts, col, w) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); }
/** Металл с бликом слева и тенью справа; свечение у фиолетовых. */
function metal(c, fn, P, col = P.metal) {
  if (P.glow) { c.save(); c.shadowColor = P.glow; c.shadowBlur = 4; F(c, fn, col, 0); c.restore(); }
  const g = c.createLinearGradient(-7, 0, 9, 0); g.addColorStop(0, sh(col, 0.22)); g.addColorStop(0.45, col); g.addColorStop(1, sh(col, -0.3));
  F(c, fn, g, 0.7);
}
function gem(c, x, y, r, col) { if (!col) return; F(c, () => { c.moveTo(x, y - r); c.lineTo(x + r, y); c.lineTo(x, y + r); c.lineTo(x - r, y); c.closePath(); }, col, 0.5); c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(x - r * 0.45, y - r * 0.55, r * 0.4, r * 0.4); }
function rivet(c, x, y, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y, 0.42, 0, 7); c.fill(); c.strokeStyle = O; c.lineWidth = 0.25; c.stroke(); }
/** Древко: снизу b до верха top, толщина w; обмотка от w0 до w1. */
function haft(c, b, top, w, P, w0 = 2.4, w1 = -2.4, metalHaft = false) {
  F(c, () => c.roundRect(-w / 2, top, w, b - top, w / 2), metalHaft ? P.dark : P.wood, 0.7);
  line(c, [[-w / 2 + 0.45, b - 0.4], [-w / 2 + 0.45, top + 0.4]], 'rgba(255,240,210,.35)', 0.4);
  if (w0 > w1) { F(c, () => c.rect(-w / 2 - 0.15, w1, w + 0.3, w0 - w1), P.wrap, 0.5); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 0.3; for (let y = w1 + 0.7; y < w0; y += 0.9) { c.beginPath(); c.moveTo(-w / 2, y); c.lineTo(w / 2, y - 0.6); c.stroke(); } }
}
function runes(c, P, pts) { if (!P.etch) return; c.save(); c.strokeStyle = P.etch; c.lineWidth = 0.35; if (P.glow) { c.shadowColor = P.glow; c.shadowBlur = 2; } for (const [x, y] of pts) { c.beginPath(); c.moveTo(x - 0.4, y - 0.6); c.lineTo(x, y + 0.6); c.lineTo(x + 0.4, y - 0.3); c.stroke(); } c.restore(); }
const edgeHi = (c, P, pts) => line(c, pts, P.edge, 0.55);


// свет на вершине посоха: всегда слабо, при заклинании (o.glow) — ярко
function tipGlow(c, x, y, r, P, o, lamp) {
  const k = (o && o.glow) || 0, R = r * (1.6 + k * 1.6), col = P.glow || P.orb;
  if (P.rar === 'start' && !k) return;
  const g = c.createRadialGradient(x, y, 0.3, x, y, R); g.addColorStop(0, col + (k > 0.3 || P.glow ? 'cc' : '88')); g.addColorStop(1, col + '00'); c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, 7); c.fill();
}
function orbBall(c, x, y, r, col) { F(c, () => c.arc(x, y, r, 0, 7), col, 0.6); c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.arc(x - r * 0.35, y - r * 0.35, r * 0.32, 0, 7); c.fill(); }
// лук: bh — половина высоты, kind — форма плеч
function bowDraw(c, P, o = {}, bh, kind) {
  const pull = o.pull || 0, col = [P.wood, P.wood, sh(P.wood, -0.1), P.wood, '#d8c8a0', sh(P.wood, -0.25), P.leaf][kind];
  const limb = (s) => { // s: −1 верхнее, 1 нижнее
    c.beginPath(); c.moveTo(0.4, 0);
    if (kind === 2 || kind === 6) { c.quadraticCurveTo(4.6, s * bh * 0.45, 1.4, s * bh * 0.9); c.quadraticCurveTo(0.2, s * bh * 1.02, 1.6, s * bh); }
    else c.quadraticCurveTo(4.6 + (kind === 5 ? 0.6 : 0), s * bh * 0.55, -2.6, s * bh);
  };
  const tips = (kind === 2 || kind === 6) ? 1.6 : -2.6;
  // тетива
  const sx = tips - pull * 8; c.strokeStyle = '#efe6d0'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(tips, -bh); c.lineTo(sx, 0); c.lineTo(tips, bh); c.stroke();
  for (const s of [-1, 1]) { limb(s); c.strokeStyle = O; c.lineWidth = kind === 5 ? 3.2 : 2.6; c.stroke(); limb(s); c.strokeStyle = col; c.lineWidth = kind === 5 ? 2 : 1.5; c.stroke();
    if (kind === 4) { limb(s); c.strokeStyle = '#3a2a1a'; c.lineWidth = 0.5; c.setLineDash([1.2, 1.4]); c.stroke(); c.setLineDash([]); }
    if (kind === 5 || kind >= 3) F(c, () => c.arc(tips, s * bh, 0.65, 0, 7), kind === 5 ? P.metal : P.acc, 0.35);
    if (kind === 6) { c.save(); c.strokeStyle = P.etch || P.orb; c.lineWidth = 0.4; if (P.glow) { c.shadowColor = P.glow; c.shadowBlur = 3; } limb(s); c.stroke(); c.restore(); } }
  F(c, () => c.roundRect(-0.4, -2.2, 2.2, 4.4, 0.6), kind === 0 ? sh(P.wood, -0.2) : P.wrap, 0.5);
  if (kind >= 5 && P.gem) gem(c, 2.4, 0, 0.8, P.gem);
  if (o.arrow && pull > 0.05) { c.strokeStyle = O; c.lineWidth = 1.2; c.beginPath(); c.moveTo(sx, 0); c.lineTo(8, 0); c.stroke(); c.strokeStyle = '#c9b48a'; c.lineWidth = 0.6; c.stroke(); F(c, () => { c.moveTo(10.4, 0); c.lineTo(7.8, -1.2); c.lineTo(7.8, 1.2); c.closePath(); }, '#cfd8de', 0.35); F(c, () => { c.moveTo(sx, 0); c.lineTo(sx + 1.8, -1); c.lineTo(sx + 1.8, 1); c.closePath(); }, '#d84040', 0.3); }
}

// ------------------------------------------------------------------ оружие
// size: длина от хвата до верха; hands: 2 — двуручное (вторая кисть ниже хвата)
export const WEAPONS = [
  { id: 'hatchet', name: 'Топорик', tiers: [0, 1, 2], hands: 1, box: [-3, -16, 7, 5], draw(c, P) {
    haft(c, 4.2, -14.6, 1.7, P, 2.2, -1.8);
    metal(c, () => { c.moveTo(0.7, -14.6); c.lineTo(3.8, -15.6); c.quadraticCurveTo(5.9, -12.2, 4.3, -8.4); c.lineTo(0.7, -10.6); c.closePath(); }, P);
    edgeHi(c, P, [[4.1, -15.1], [5.1, -12.2], [4.2, -9]]);
    F(c, () => c.rect(-1.8, -14.2, 1.4, 3), P.dark, 0.6);
  } },
  { id: 'bearded', name: 'Бородовидный топор', tiers: [2, 3], hands: 1, box: [-3, -18, 8, 5], draw(c, P) {
    haft(c, 4.4, -16.4, 1.8, P, 2.4, -2);
    metal(c, () => { c.moveTo(0.8, -16.2); c.lineTo(5, -17.2); c.quadraticCurveTo(7.2, -13, 6.6, -7.6); c.lineTo(5.2, -6.8); c.quadraticCurveTo(3.4, -10, 0.8, -11.2); c.closePath(); }, P);
    edgeHi(c, P, [[5.3, -16.6], [6.6, -12.6], [6.1, -8]]);
    F(c, () => c.rect(-1.2, -16.6, 2.4, 6), P.acc, 0.5); rivet(c, 0, -15.4, P.edge); rivet(c, 0, -12.2, P.edge);
    runes(c, P, [[3.2, -13.6], [4.4, -12.1], [3.6, -10.4]]);
  } },
  { id: 'battleaxe', name: 'Боевой топор', tiers: [2, 3], hands: 1, box: [-6, -21, 10, 5], draw(c, P) {
    haft(c, 4.4, -18.2, 1.9, P, 2.4, -2.2);
    F(c, () => { c.moveTo(-0.9, -18.2); c.lineTo(0, -21.2); c.lineTo(0.9, -18.2); c.closePath(); }, P.edge, 0.5);
    metal(c, () => { c.moveTo(0.9, -17.6); c.quadraticCurveTo(4.2, -17.8, 6.6, -20.4); c.quadraticCurveTo(9.4, -14, 6.6, -7.8); c.quadraticCurveTo(4, -10.6, 0.9, -11); c.closePath(); }, P);
    edgeHi(c, P, [[6.9, -19.6], [8.6, -14], [6.9, -8.6]]);
    metal(c, () => { c.moveTo(-0.9, -16.6); c.lineTo(-4.2, -16); c.lineTo(-4.6, -13.6); c.lineTo(-0.9, -12.4); c.closePath(); }, P, P.dark);
    F(c, () => c.rect(-1.25, -17.8, 2.5, 7.4), P.acc, 0.5); gem(c, 0, -14.2, 0.9, P.gem);
    runes(c, P, [[3.6, -15.6], [4.8, -14], [4.2, -12.2]]);
  } },
  { id: 'crescent', name: 'Секира', tiers: [3, 4], hands: 2, box: [-4, -29, 14, 8], draw(c, P) {
    haft(c, 7.4, -24.6, 2, P, 2.4, -2.4); F(c, () => c.rect(-1.3, 3.6, 2.6, 3.8), P.wrap, 0.5);
    F(c, () => c.roundRect(-1.4, 7, 2.8, 1.6, 0.6), P.acc, 0.5);
    metal(c, () => { c.moveTo(0.9, -23.6); c.quadraticCurveTo(6, -23.6, 9.4, -28.4); c.quadraticCurveTo(14.4, -19.6, 9.4, -9.6); c.quadraticCurveTo(6, -14.6, 0.9, -15); c.closePath(); }, P);
    edgeHi(c, P, [[9.8, -27.4], [12.6, -19.4], [9.8, -10.6]]);
    F(c, () => c.arc(5.4, -19.4, 1.6, 0, 7), 'rgba(0,0,0,0)', 0.5);
    F(c, () => c.rect(-1.3, -24.6, 2.6, 10.8), P.acc, 0.5); rivet(c, 0, -22.8, P.edge); rivet(c, 0, -16, P.edge); gem(c, 0, -19.4, 1.1, P.gem);
    runes(c, P, [[7, -22], [8.4, -19.4], [7, -16.8]]);
  } },
  { id: 'double', name: 'Двойная секира', tiers: [4], hands: 2, box: [-12, -31, 12, 8], draw(c, P) {
    haft(c, 7.6, -26.4, 2.1, P, 2.6, -2.6); F(c, () => c.roundRect(-1.5, 7.2, 3, 1.8, 0.6), P.acc, 0.5);
    F(c, () => { c.moveTo(-1, -26.2); c.lineTo(0, -30.6); c.lineTo(1, -26.2); c.closePath(); }, P.edge, 0.5);
    for (const s of [1, -1]) { c.save(); c.scale(s, 1);
      metal(c, () => { c.moveTo(1, -24.6); c.quadraticCurveTo(5.4, -25, 8.4, -28.6); c.quadraticCurveTo(12.6, -21, 8.4, -12.8); c.quadraticCurveTo(5.4, -16.4, 1, -16.6); c.closePath(); }, P);
      edgeHi(c, P, [[8.8, -27.6], [11.2, -21], [8.8, -13.8]]); runes(c, P, [[5.6, -22.4], [6.8, -20.4], [5.6, -18.6]]); c.restore(); }
    F(c, () => c.rect(-1.5, -26, 3, 11), P.acc, 0.5); gem(c, 0, -20.6, 1.3, P.gem || P.acc);
  } },
  { id: 'shortsword', name: 'Короткий меч', tiers: [0, 1, 2], hands: 1, box: [-4, -17, 4, 5], draw(c, P) {
    F(c, () => c.arc(0, 3.4, 1.1, 0, 7), P.acc, 0.6);
    haft(c, 2.6, -2.2, 1.5, P, 2.6, -2.2);
    F(c, () => c.roundRect(-3.4, -3.2, 6.8, 1.2, 0.5), P.acc, 0.6);
    metal(c, () => { c.moveTo(-1.2, -3.2); c.lineTo(-1.1, -14); c.lineTo(0, -16.2); c.lineTo(1.1, -14); c.lineTo(1.2, -3.2); c.closePath(); }, P);
    line(c, [[0, -4], [0, -13.4]], P.dark, 0.35); edgeHi(c, P, [[-0.7, -4], [-0.65, -13.8]]);
  } },
  { id: 'sword', name: 'Меч', tiers: [2, 3], hands: 1, box: [-5, -21, 5, 5], draw(c, P) {
    F(c, () => c.arc(0, 3.6, 1.25, 0, 7), P.acc, 0.6); gem(c, 0, 3.6, 0.6, P.gem);
    haft(c, 2.7, -2.4, 1.5, P, 2.7, -2.4);
    F(c, () => { c.moveTo(-4.6, -2.1); c.quadraticCurveTo(-2, -3.6, 0, -3.4); c.quadraticCurveTo(2, -3.6, 4.6, -2.1); c.lineTo(4.4, -3.3); c.quadraticCurveTo(2, -4.6, 0, -4.4); c.quadraticCurveTo(-2, -4.6, -4.4, -3.3); c.closePath(); }, P.acc, 0.55);
    metal(c, () => { c.moveTo(-1.3, -4.2); c.lineTo(-1.15, -17.6); c.lineTo(0, -20.2); c.lineTo(1.15, -17.6); c.lineTo(1.3, -4.2); c.closePath(); }, P);
    line(c, [[0, -5], [0, -16.6]], P.dark, 0.4); edgeHi(c, P, [[-0.75, -5], [-0.7, -17.4]]); runes(c, P, [[0, -7], [0, -9], [0, -11]]);
  } },
  { id: 'falchion', name: 'Палаш', tiers: [2, 3], hands: 1, box: [-4, -20, 6, 5], draw(c, P) {
    F(c, () => c.arc(0, 3.4, 1.1, 0, 7), P.acc, 0.6);
    haft(c, 2.6, -2.2, 1.5, P, 2.6, -2.2);
    F(c, () => c.roundRect(-3.2, -3.2, 6.4, 1.2, 0.5), P.acc, 0.6);
    F(c, () => { c.moveTo(-3.2, -2.6); c.quadraticCurveTo(-4.6, -1, -3.6, 1.4); }, null, 0.6);
    metal(c, () => { c.moveTo(-1.1, -3.2); c.lineTo(-1.1, -16.4); c.quadraticCurveTo(0, -19.2, 2.6, -18.8); c.quadraticCurveTo(3.4, -13, 1.4, -3.2); c.closePath(); }, P);
    edgeHi(c, P, [[2.3, -18.2], [2.8, -13.2], [1.3, -4]]); line(c, [[-0.4, -4], [-0.4, -15.6]], P.dark, 0.35); runes(c, P, [[0.6, -8], [0.8, -10.4], [1, -12.8]]);
  } },
  { id: 'broadsword', name: 'Широкий меч', tiers: [3, 4], hands: 1, box: [-6, -22, 6, 6], draw(c, P) {
    F(c, () => { c.moveTo(0, 2.6); c.lineTo(1.4, 3.8); c.lineTo(0, 5.2); c.lineTo(-1.4, 3.8); c.closePath(); }, P.acc, 0.6); gem(c, 0, 3.9, 0.55, P.gem);
    haft(c, 2.8, -2.4, 1.6, P, 2.8, -2.4);
    F(c, () => { c.moveTo(-5.6, -1.4); c.quadraticCurveTo(-5, -3.4, -2.6, -3); c.lineTo(2.6, -3); c.quadraticCurveTo(5, -3.4, 5.6, -1.4); c.quadraticCurveTo(4.6, -2.2, 3, -1.8); c.lineTo(-3, -1.8); c.quadraticCurveTo(-4.6, -2.2, -5.6, -1.4); c.closePath(); }, P.acc, 0.55);
    gem(c, 0, -2.4, 0.8, P.gem || P.acc);
    metal(c, () => { c.moveTo(-1.9, -3); c.lineTo(-1.6, -18.4); c.lineTo(0, -21.6); c.lineTo(1.6, -18.4); c.lineTo(1.9, -3); c.closePath(); }, P);
    line(c, [[0, -4], [0, -17.4]], P.dark, 0.6); edgeHi(c, P, [[-1.15, -4], [-1, -18.2]]); runes(c, P, [[0, -6], [0, -8.4], [0, -10.8], [0, -13.2]]);
  } },
  { id: 'greatsword', name: 'Двуручный меч', tiers: [4], hands: 2, box: [-7, -30, 7, 9], draw(c, P) {
    F(c, () => c.arc(0, 7.6, 1.4, 0, 7), P.acc, 0.6); gem(c, 0, 7.6, 0.7, P.gem);
    haft(c, 6.6, -2.6, 1.7, P, 6.4, -2.6);
    F(c, () => { c.moveTo(-6.6, -2.4); c.lineTo(-6.6, -4); c.lineTo(6.6, -4); c.lineTo(6.6, -2.4); c.closePath(); }, P.acc, 0.6);
    for (const s of [-1, 1]) F(c, () => c.arc(s * 6.9, -3.2, 0.9, 0, 7), P.acc, 0.5);
    metal(c, () => { c.moveTo(-1.6, -4); c.lineTo(-1.6, -7); c.lineTo(-2.1, -7.6); c.lineTo(-1.8, -26); c.lineTo(0, -29.6); c.lineTo(1.8, -26); c.lineTo(2.1, -7.6); c.lineTo(1.6, -7); c.lineTo(1.6, -4); c.closePath(); }, P);
    line(c, [[0, -8], [0, -25]], P.dark, 0.55); edgeHi(c, P, [[-1.3, -8], [-1.15, -25.6]]); runes(c, P, [[0, -10], [0, -12.6], [0, -15.2], [0, -17.8], [0, -20.4]]);
  } },
  { id: 'mace', name: 'Булава', tiers: [0, 1, 2], hands: 1, box: [-4, -17, 4, 5], draw(c, P) {
    haft(c, 4.2, -11, 1.8, P, 2.4, -2);
    metal(c, () => c.ellipse(0, -13.4, 2.8, 3, 0, 0, 7), P);
    for (const [x, y] of [[-2.6, -13.4], [2.6, -13.4], [0, -16.3], [-1.6, -15.6], [1.6, -15.6]]) F(c, () => c.arc(x, y, 0.7, 0, 7), P.dark, 0.4);
    F(c, () => c.rect(-1.3, -11.2, 2.6, 1), P.acc, 0.5);
  } },
  { id: 'flanged', name: 'Шестопёр', tiers: [2, 3], hands: 1, box: [-5, -19, 5, 5], draw(c, P) {
    haft(c, 4.2, -12, 1.6, P, 2.6, -2.4, true);
    F(c, () => c.arc(0, 4.6, 0.9, 0, 7), P.acc, 0.5);
    metal(c, () => { c.moveTo(-0.9, -11.6); c.lineTo(-4.2, -13.4); c.lineTo(-4.2, -16.6); c.lineTo(-0.9, -18.2); c.closePath(); }, P);
    metal(c, () => { c.moveTo(0.9, -11.6); c.lineTo(4.2, -13.4); c.lineTo(4.2, -16.6); c.lineTo(0.9, -18.2); c.closePath(); }, P, P.dark);
    metal(c, () => { c.moveTo(-1.1, -11.4); c.lineTo(1.1, -11.4); c.lineTo(1.2, -18.6); c.lineTo(0, -19.4); c.lineTo(-1.2, -18.6); c.closePath(); }, P, P.edge);
    F(c, () => c.rect(-1.3, -11.8, 2.6, 1), P.acc, 0.5); gem(c, 0, -15, 0.7, P.gem);
  } },
  { id: 'morning', name: 'Моргенштерн', tiers: [3, 4], hands: 1, box: [-6, -21, 6, 5], draw(c, P) {
    haft(c, 4.4, -11.6, 1.9, P, 2.6, -2.2);
    F(c, () => c.rect(-1.4, -12.4, 2.8, 1.4), P.acc, 0.5);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, x = Math.cos(a), y = Math.sin(a); F(c, () => { c.moveTo(x * 2.6 - y * 0.8, -15.4 + y * 2.6 + x * 0.8); c.lineTo(x * 5.4, -15.4 + y * 5.4); c.lineTo(x * 2.6 + y * 0.8, -15.4 + y * 2.6 - x * 0.8); c.closePath(); }, P.edge, 0.45); }
    metal(c, () => c.arc(0, -15.4, 3.3, 0, 7), P); gem(c, 0, -15.4, 0.9, P.gem);
    c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.arc(-1.2, -16.6, 0.9, 0, 7); c.fill();
  } },
  { id: 'warhammer', name: 'Боевой молот', tiers: [2, 3], hands: 1, box: [-6, -20, 6, 5], draw(c, P) {
    haft(c, 4.4, -16, 1.8, P, 2.6, -2.2, P.rar !== 'common');
    metal(c, () => { c.moveTo(-0.6, -18.4); c.lineTo(-5.6, -16.6); c.lineTo(-0.6, -14.8); c.closePath(); }, P, P.dark);
    metal(c, () => c.roundRect(-1.6, -19.2, 6.4, 5.2, 0.6), P);
    F(c, () => c.rect(4.2, -19.6, 1.2, 6), P.edge, 0.5);
    F(c, () => { c.moveTo(-0.9, -19.2); c.lineTo(0, -21); c.lineTo(0.9, -19.2); c.closePath(); }, P.edge, 0.45);
    F(c, () => c.rect(-1.6, -17, 6.4, 0.9), P.acc, 0.4); gem(c, 1.6, -16.6, 0.8, P.gem);
  } },
  { id: 'maul', name: 'Кувалда', tiers: [4], hands: 2, box: [-7, -28, 7, 8], draw(c, P) {
    haft(c, 7.4, -20.4, 2.1, P, 2.6, -2.6, true); F(c, () => c.roundRect(-1.5, 7, 3, 1.8, 0.6), P.acc, 0.5);
    metal(c, () => c.roundRect(-6, -27.2, 12, 7.4, 1.2), P);
    for (const x of [-6.2, 5]) F(c, () => c.rect(x, -27.6, 1.2, 8.2), P.acc, 0.5);
    F(c, () => c.rect(-1.6, -20.4, 3.2, 2.6), P.acc, 0.5);
    gem(c, 0, -23.5, 1.4, P.gem || P.acc); runes(c, P, [[-3.4, -23.5], [3.4, -23.5]]);
    c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(-5.2, -26.6, 9.6, 1);
  } },

  // ---------------------------------------------------------------- Маг: посохи и жезлы (вершина — tip, туда собирается свет при заклинании)
  { id: 'stick', name: 'Палка', cls: ['mage'], tiers: [0, 1], hands: 1, swing: 'cast', tip: [0.6, -23], draw(c, P, o) {
    F(c, () => { c.moveTo(-0.9, 10); c.quadraticCurveTo(-1.6, -6, 0, -22.6); c.lineTo(1.4, -22.4); c.quadraticCurveTo(0.2, -6, 0.9, 10); c.closePath(); }, P.wood, 0.7);
    for (const y of [-4, -12, 4]) F(c, () => c.ellipse(-0.6, y, 0.9, 0.6, 0.3, 0, 7), sh(P.wood, -0.25), 0.4);
    F(c, () => c.ellipse(2.4, -19.6, 1.6, 0.8, -0.6, 0, 7), '#5a8a3a', 0.4); F(c, () => c.ellipse(-1.6, -17.6, 1.4, 0.7, 0.6, 0, 7), '#6a9a44', 0.4);
    tipGlow(c, 0.6, -23, 2, P, o);
  } },
  { id: 'wand', name: 'Жезл', cls: ['mage'], tiers: [1, 2], hands: 1, swing: 'cast', tip: [0, -13.4], draw(c, P, o) {
    haft(c, 3.2, -10.6, 1.3, P, 3.2, -1.8);
    F(c, () => c.rect(-1.1, -11.4, 2.2, 1.2), P.acc, 0.45);
    F(c, () => { c.moveTo(-1, -11.4); c.lineTo(0, -15); c.lineTo(1, -11.4); c.closePath(); }, P.orb, 0.5);
    tipGlow(c, 0, -13.4, 1.8, P, o);
  } },
  { id: 'crook', name: 'Посох-клюка', cls: ['mage'], tiers: [1, 2], hands: 1, swing: 'cast', tip: [4, -24.6], draw(c, P, o) {
    F(c, () => { c.moveTo(-0.8, 10); c.lineTo(-0.8, -22); c.quadraticCurveTo(-0.8, -27.6, 3.6, -27.4); c.quadraticCurveTo(6.6, -27, 6, -23.4); c.lineTo(4.6, -23.6); c.quadraticCurveTo(5, -26, 3.4, -26); c.quadraticCurveTo(0.8, -26, 0.8, -22); c.lineTo(0.8, 10); c.closePath(); }, P.wood, 0.7);
    F(c, () => c.rect(-1.1, -6, 2.2, 3), P.wrap, 0.45);
    F(c, () => { c.moveTo(5.3, -23.4); c.lineTo(5.3, -21.8); }, null, 0.5); F(c, () => c.roundRect(4.2, -21.8, 2.2, 2.8, 0.6), P.acc, 0.45);
    tipGlow(c, 5.3, -20.4, 1.8, P, o, true);
  } },
  { id: 'orb', name: 'Посох с кристаллом', cls: ['mage'], tiers: [2, 3], hands: 1, swing: 'cast', tip: [0, -25.6], draw(c, P, o) {
    haft(c, 10, -21.6, 1.7, P, 1.6, -3);
    F(c, () => c.rect(-1.2, -22.2, 2.4, 1.2), P.acc, 0.45);
    for (const s of [-1, 0, 1]) F(c, () => { c.moveTo(s * 0.6, -21.4); c.quadraticCurveTo(s * 3.4, -24, s * 2, -28.4); c.lineTo(s * 1.6, -27.6); c.quadraticCurveTo(s * 2.4, -24.4, s * 0.1 - 0.3 * s, -21.6); c.closePath(); }, P.acc, 0.4);
    tipGlow(c, 0, -25.6, 2.5, P, o); orbBall(c, 0, -25.6, 2.2, P.orb);
  } },
  { id: 'serpent', name: 'Змеиный посох', cls: ['mage'], tiers: [2, 3], hands: 1, swing: 'cast', tip: [3.4, -27.6], draw(c, P, o) {
    c.strokeStyle = O; c.lineWidth = 2.6; c.beginPath(); for (let y = 10; y >= -24; y -= 1) c.lineTo(Math.sin(y * 0.45) * 0.9, y); c.stroke();
    c.strokeStyle = P.wood; c.lineWidth = 1.5; c.stroke();
    c.strokeStyle = P.leaf; c.lineWidth = 1; c.beginPath(); for (let y = 6; y >= -22; y -= 0.5) c.lineTo(Math.sin(y * 0.45 + 1.6) * 1.4, y); c.stroke();
    F(c, () => { c.moveTo(-0.4, -24); c.quadraticCurveTo(-1, -28.6, 2.4, -28.8); c.quadraticCurveTo(5.4, -28.6, 5.2, -26.8); c.quadraticCurveTo(3.4, -26.6, 2.2, -26.8); c.quadraticCurveTo(1.2, -26, 1.2, -24); c.closePath(); }, P.leaf, 0.55);
    c.fillStyle = P.orb; c.beginPath(); c.arc(2.6, -27.9, 0.45, 0, 7); c.fill();
    c.strokeStyle = '#c84040'; c.lineWidth = 0.35; c.beginPath(); c.moveTo(5.2, -27); c.lineTo(6.4, -26.6); c.moveTo(5.9, -26.8); c.lineTo(6.5, -27.4); c.stroke();
    tipGlow(c, 3.4, -27.6, 2, P, o);
  } },
  { id: 'rune', name: 'Рунный посох', cls: ['mage'], tiers: [3, 4], hands: 1, swing: 'cast', tip: [0, -28.4], draw(c, P, o) {
    haft(c, 10, -23.4, 1.8, P, 1.8, -3); for (const y of [-20, -10, 4]) F(c, () => c.rect(-1.2, y, 2.4, 1), P.acc, 0.4);
    F(c, () => { c.moveTo(-1.2, -23.4); c.lineTo(-2.6, -24.6); c.moveTo(1.2, -23.4); c.lineTo(2.6, -24.6); }, null, 0.6);
    const fy = -28.4 + (o && o.t ? Math.sin(o.t * 2) * 0.4 : 0);
    tipGlow(c, 0, fy, 3, P, o);
    F(c, () => { c.moveTo(0, fy - 3); c.lineTo(1.5, fy); c.lineTo(0, fy + 2.4); c.lineTo(-1.5, fy); c.closePath(); }, '#8a8a9a', 0.55);
    runes(c, { ...P, etch: P.etch || P.orb }, [[0, fy - 0.6]]);
  } },
  { id: 'moon', name: 'Посох полумесяца', cls: ['mage'], tiers: [3, 4], hands: 1, swing: 'cast', tip: [0, -26.6], draw(c, P, o) {
    haft(c, 10, -22, 1.7, P, 1.6, -3, P.rar === 'epic');
    metal(c, () => { c.moveTo(-0.8, -22); c.quadraticCurveTo(-5.6, -23, -4.6, -29.6); c.quadraticCurveTo(-3.4, -25.2, 0, -24.4); c.quadraticCurveTo(3.4, -25.2, 4.6, -29.6); c.quadraticCurveTo(5.6, -23, 0.8, -22); c.closePath(); }, P, P.acc);
    tipGlow(c, 0, -27.4, 2.6, P, o); orbBall(c, 0, -27.4, 1.6, P.orb);
  } },
  { id: 'root', name: 'Посох друида', cls: ['mage'], tiers: [3, 4], hands: 1, swing: 'cast', tip: [0, -25], draw(c, P, o) {
    for (const k of [-1, 1, 0]) { c.strokeStyle = O; c.lineWidth = 1.9; c.beginPath(); for (let y = 10; y >= -22; y -= 1) c.lineTo(Math.sin(y * 0.32 + k * 2.1) * 1.1, y); c.stroke(); c.strokeStyle = sh(P.wood, k * 0.12); c.lineWidth = 1; c.stroke(); }
    tipGlow(c, 0, -25, 2.8, P, o); orbBall(c, 0, -25, 1.8, P.orb);
    for (const s of [-1, 1]) { c.strokeStyle = O; c.lineWidth = 1.5; c.beginPath(); c.moveTo(s * 0.8, -21.6); c.quadraticCurveTo(s * 3.2, -24.6, s * 1.2, -28); c.stroke(); c.strokeStyle = P.wood; c.lineWidth = 0.8; c.stroke(); }
    F(c, () => c.ellipse(2.8, -21.4, 1.4, 0.7, -0.5, 0, 7), P.leaf, 0.35);
  } },
  { id: 'arch', name: 'Посох Архимага', cls: ['mage'], tiers: [4], hands: 1, swing: 'cast', tip: [0, -28.6], draw(c, P, o) {
    haft(c, 10.4, -23, 1.9, P, 1.8, -3.2, true); for (const y of [-14, -4, 6]) F(c, () => c.rect(-1.3, y, 2.6, 1.1), P.acc, 0.4);
    for (const s of [-1, 1]) F(c, () => { c.moveTo(s * 1, -23); c.quadraticCurveTo(s * 5.4, -23.6, s * 6.4, -28.4); c.quadraticCurveTo(s * 4.2, -26.4, s * 3.2, -26.8); c.quadraticCurveTo(s * 3.8, -25, s * 1, -24.8); c.closePath(); }, P.acc, 0.5);
    tipGlow(c, 0, -28.6, 3.4, P, o); gemBig(c, 0, -28.6, 2.2, P.orb);
  } },
  // ---------------------------------------------------------------- Лучник: луки (хват в (0,0), плечи вверх-вниз, тетива слева; o.pull — натяжение)
  { id: 'shortbow', name: 'Короткий лук', cls: ['archer'], tiers: [0, 1], swing: 'bow', draw(c, P, o) { bowDraw(c, P, o, 12, 0) } },
  { id: 'hunt', name: 'Охотничий лук', cls: ['archer'], tiers: [1, 2], swing: 'bow', draw(c, P, o) { bowDraw(c, P, o, 14, 1) } },
  { id: 'recurve', name: 'Изогнутый лук', cls: ['archer'], tiers: [2, 3], swing: 'bow', draw(c, P, o) { bowDraw(c, P, o, 14.5, 2) } },
  { id: 'long', name: 'Длинный лук', cls: ['archer'], tiers: [2, 3], swing: 'bow', draw(c, P, o) { bowDraw(c, P, o, 18, 3) } },
  { id: 'horn', name: 'Роговой лук', cls: ['archer'], tiers: [3], swing: 'bow', draw(c, P, o) { bowDraw(c, P, o, 14, 4) } },
  { id: 'war', name: 'Боевой лук', cls: ['archer'], tiers: [3, 4], swing: 'bow', draw(c, P, o) { bowDraw(c, P, o, 16.5, 5) } },
  { id: 'wind', name: 'Лук ветра', cls: ['archer'], tiers: [4], swing: 'bow', draw(c, P, o) { bowDraw(c, P, o, 16, 6) } },
  // ---------------------------------------------------------------- v92: фиолетовые (героические) — только ярус 5, свой облик и расцветка (theme), живой эффект (fx)
  { id: 'flameblade', name: 'Клинок Пламени', tiers: [5], hands: 1, box: [-7, -27, 7, 6], fx: 'fire', theme: { metal: '#8a8490', acc: '#e8b040', cloth: ['#8a1a14', '#5a120e'], gem: '#ff6a2a', etch: '#ff8a3a', wrap: '#5a120e' }, draw(c, P) {
    F(c, () => c.arc(0, 4, 1.5, 0, 7), P.acc, 0.6); gemBig(c, 0, 4, 0.9, P.gem);
    haft(c, 3, -2.6, 1.6, P, 3, -2.6);
    for (const s of [-1, 1]) F(c, () => { c.moveTo(0, -2.6); c.quadraticCurveTo(s * 3.4, -2.2, s * 6.6, -5.6); c.quadraticCurveTo(s * 5, -3.4, s * 6.2, -2.6); c.quadraticCurveTo(s * 3, -1.4, 0, -1.4); c.closePath(); }, P.acc, 0.6);
    const blade = () => { c.moveTo(-1.8, -3.4); for (let y = -3.4; y > -22; y -= 1) c.lineTo(-1.8 - Math.sin(y * 0.55) * 0.55 + (y < -18 ? (y + 18) * 0.12 : 0), y); c.quadraticCurveTo(-0.6, -25, 0, -27); c.quadraticCurveTo(0.6, -25, 1.8 - 0.5, -22); for (let y = -22; y < -3.4; y += 1) c.lineTo(1.8 + Math.sin(y * 0.55 + 1.6) * 0.55 + (y < -18 ? -(y + 18) * 0.12 : 0), y); c.closePath(); };
    metal(c, blade, P);
    c.save(); c.beginPath(); blade(); c.clip(); const g = c.createLinearGradient(0, -4, 0, -27); g.addColorStop(0, 'rgba(255,90,30,.15)'); g.addColorStop(1, 'rgba(255,200,120,.25)'); c.fillStyle = g; c.fillRect(-3, -27, 6, 24); c.strokeStyle = '#ff6a1a'; c.lineWidth = 0.7; c.beginPath(); blade(); c.stroke(); c.restore();
    line(c, [[0, -4.6], [0, -21]], P.etch, 0.55); edgeHi(c, P, [[-1.2, -5], [-1.1, -20.4]]);
    F(c, () => c.rect(-1.5, -4, 3, 1.4), P.acc, 0.5); gemBig(c, 0, -3.3, 0.8, P.gem);
  } },
  { id: 'runeaxe', name: 'Секира Рунного Короля', tiers: [5], hands: 2, box: [-14, -34, 14, 9], fx: 'rune', theme: { metal: '#5a6274', acc: '#e0b84a', cloth: ['#1e3050', '#14203a'], gem: '#6ad0ff', etch: '#7ee0ff', wrap: '#1e3050', wood: '#2a2028' }, draw(c, P) {
    haft(c, 8, -28, 2.2, P, 3, -3, true); F(c, () => c.roundRect(-1.7, 7.6, 3.4, 2.2, 0.8), P.acc, 0.5); gemBig(c, 0, 8.7, 0.8, P.gem);
    F(c, () => { c.moveTo(-1.1, -28); c.lineTo(0, -34); c.lineTo(1.1, -28); c.closePath(); }, P.acc, 0.5);
    for (const s of [1, -1]) { c.save(); c.scale(s, 1);
      metal(c, () => { c.moveTo(1.1, -27); c.lineTo(5, -29.6); c.quadraticCurveTo(8.6, -31.4, 10.4, -32.6); c.quadraticCurveTo(15.6, -23, 10.6, -12.4); c.quadraticCurveTo(8.4, -14.4, 5, -15); c.lineTo(1.1, -16.4); c.closePath(); }, P);
      F(c, () => { c.moveTo(10.4, -32.6); c.lineTo(12.4, -34.6); c.lineTo(11.2, -30.8); c.closePath(); }, P.edge, 0.4);
      edgeHi(c, P, [[11, -31.4], [13.6, -22.6], [11, -13.4]]);
      F(c, () => { c.moveTo(2, -26.4); c.lineTo(6.4, -28); c.lineTo(6.4, -16.6); c.lineTo(2, -17.4); c.closePath(); }, P.acc, 0.45);
      c.strokeStyle = P.etch; c.lineWidth = 0.55; c.beginPath(); c.moveTo(8.6, -27.6); c.lineTo(10.2, -25); c.lineTo(8.8, -22.4); c.lineTo(10.4, -19.6); c.lineTo(8.8, -17); c.stroke();
      c.restore(); }
    F(c, () => c.rect(-1.7, -28, 3.4, 13.4), P.acc, 0.5); gemBig(c, 0, -22, 1.5, P.gem);
  } },
  { id: 'thunder', name: 'Молот Грома', tiers: [5], hands: 2, box: [-9, -32, 9, 9], fx: 'spark', theme: { metal: '#6a7484', acc: '#e0b84a', cloth: ['#24406e', '#1a2e50'], gem: '#5ab0ff', etch: '#bfe6ff', wrap: '#24406e', wood: '#3a2416' }, draw(c, P) {
    haft(c, 8, -22, 2.2, P, 3, -3); F(c, () => c.roundRect(-1.7, 7.6, 3.4, 2.2, 0.8), P.acc, 0.5);
    metal(c, () => c.roundRect(-8.4, -31.6, 16.8, 10.4, 1.4), P);
    for (const x of [-8.4, 6.6]) F(c, () => c.rect(x, -31.6, 1.8, 10.4), P.acc, 0.45);
    F(c, () => c.rect(-1.9, -32.4, 3.8, 12), P.acc, 0.5);
    for (const s of [-1, 1]) F(c, () => { c.moveTo(s * 8.4, -28.6); c.lineTo(s * 11, -26.4); c.lineTo(s * 8.4, -24.2); c.closePath(); }, P.edge, 0.4);
    c.strokeStyle = P.etch; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-5.6, -29.6); c.lineTo(-4.2, -27); c.lineTo(-5.4, -26.6); c.lineTo(-3.8, -23.4); c.moveTo(5.6, -29.6); c.lineTo(4.2, -27); c.lineTo(5.4, -26.6); c.lineTo(3.8, -23.4); c.stroke();
    gemBig(c, 0, -26.4, 2, P.gem); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(-7.6, -30.8, 14, 1);
  } },
  { id: 'starfall', name: 'Посох Звездопада', cls: ['mage'], tiers: [5], hands: 1, swing: 'cast', tip: [0, -29], fx: 'arcane', theme: { metal: '#5b5470', acc: '#e7c35a', wood: '#2a1a3a', cloth: ['#3a1f5a', '#2a1444'], gem: '#c8a0ff', orb: '#c8a0ff', etch: '#d8b8ff', wrap: '#3a1f5a' }, draw(c, P, o) {
    haft(c, 10.4, -23.6, 1.9, P, 1.8, -3.2, true); for (const y of [-16, -6, 5]) F(c, () => c.rect(-1.3, y, 2.6, 1.1), P.acc, 0.4);
    for (const s of [-1, 1]) F(c, () => { c.moveTo(s * 0.9, -23.4); c.quadraticCurveTo(s * 5, -24.6, s * 4.8, -29.4); c.quadraticCurveTo(s * 4.2, -33.4, s * 0.8, -34.4); c.lineTo(s * 0.6, -33.4); c.quadraticCurveTo(s * 3.4, -32.4, s * 3.6, -29.4); c.quadraticCurveTo(s * 3.8, -25.4, s * 0.9, -24.8); c.closePath(); }, P.acc, 0.5);
    const fy = -29 + (o && o.t ? Math.sin(o.t * 2.2) * 0.6 : 0);
    tipGlow(c, 0, fy, 3.2, P, o);
    F(c, () => { for (let i = 0; i < 10; i++) { const r = i % 2 ? 1.1 : 2.8, a = i * Math.PI / 5 - Math.PI / 2; c.lineTo(Math.cos(a) * r, fy + Math.sin(a) * r); } c.closePath(); }, '#f4e8ff', 0.5);
    F(c, () => c.arc(0, fy, 0.9, 0, 7), P.orb, 0.3);
  } },
  { id: 'phoenix', name: 'Посох Феникса', cls: ['mage'], tiers: [5], hands: 1, swing: 'cast', tip: [0, -28], fx: 'fire', theme: { metal: '#6a3a2a', acc: '#e8b040', wood: '#4a1e14', cloth: ['#8a1a14', '#5a120e'], gem: '#ff7a2a', orb: '#ffb347', etch: '#ff8a3a', wrap: '#8a1a14' }, draw(c, P, o) {
    haft(c, 10.4, -22.6, 1.9, P, 1.8, -3.2); for (const y of [-12, 2]) F(c, () => c.rect(-1.3, y, 2.6, 1.1), P.acc, 0.4);
    for (const s of [-1, 1]) { F(c, () => { c.moveTo(s * 0.8, -22.4); c.quadraticCurveTo(s * 4, -23, s * 8.4, -30.4); c.quadraticCurveTo(s * 6.8, -29.4, s * 6.6, -27.8); c.quadraticCurveTo(s * 5.4, -28.4, s * 5.4, -26.4); c.quadraticCurveTo(s * 4, -26.6, s * 3.8, -25); c.quadraticCurveTo(s * 2.4, -24.6, s * 0.8, -24.4); c.closePath(); }, P.acc, 0.5);
      c.strokeStyle = sh(P.acc, -0.35); c.lineWidth = 0.3; c.beginPath(); c.moveTo(s * 2.2, -23.6); c.lineTo(s * 6.6, -28.8); c.stroke(); }
    const t = (o && o.t) || 0, f = Math.sin(t * 9) * 0.5;
    tipGlow(c, 0, -28, 3.4, P, o);
    for (const [col, w, h] of [['#ff5a1a', 2.6, 7.4], ['#ffa030', 1.8, 5.4], ['#fff2a0', 0.9, 3.2]]) { c.fillStyle = col; c.beginPath(); c.moveTo(-w, -25); c.quadraticCurveTo(-w * 1.1, -25 - h * 0.6, f * 0.5, -25 - h - f); c.quadraticCurveTo(w * 1.1, -25 - h * 0.6, w, -25); c.closePath(); c.fill(); }
  } },
  { id: 'glacier', name: 'Ледяной скипетр', cls: ['mage'], tiers: [5], hands: 1, swing: 'cast', tip: [0, -29], fx: 'frost', theme: { metal: '#b8c8d8', acc: '#e8f4ff', wood: '#4a5a70', cloth: ['#2a4a6e', '#1a3050'], gem: '#bfe6ff', orb: '#bfe6ff', etch: '#e8f8ff', wrap: '#2a4a6e' }, draw(c, P, o) {
    haft(c, 10.4, -22.6, 1.8, P, 1.8, -3.2, true); for (const y of [-14, -4, 6]) F(c, () => c.rect(-1.25, y, 2.5, 1.1), P.acc, 0.4);
    tipGlow(c, 0, -28, 3.4, P, o);
    const cr = (x, y, a, L, w, col) => { c.save(); c.translate(x, y); c.rotate(a); F(c, () => { c.moveTo(0, 0); c.lineTo(w, -L * 0.3); c.lineTo(0, -L); c.lineTo(-w, -L * 0.3); c.closePath(); }, col, 0.5); c.fillStyle = 'rgba(255,255,255,.65)'; c.beginPath(); c.moveTo(-w * 0.5, -L * 0.3); c.lineTo(0, -L * 0.9); c.lineTo(0, -L * 0.3); c.closePath(); c.fill(); c.restore(); };
    cr(-1, -22.6, -0.55, 6, 1.3, '#9ad0f0'); cr(1, -22.6, 0.55, 6, 1.3, '#9ad0f0'); cr(-0.6, -22.8, -0.22, 8.6, 1.6, '#bfe6ff'); cr(0.6, -22.8, 0.22, 8.6, 1.6, '#bfe6ff'); cr(0, -23, 0, 11.4, 2, '#e0f4ff');
    F(c, () => c.rect(-1.6, -23.4, 3.2, 1.4), P.acc, 0.45);
  } },
  { id: 'stagbow', name: 'Лук Белого Оленя', cls: ['archer'], tiers: [5], swing: 'bow', fx: 'leaf', theme: { metal: '#c8b890', acc: '#e0b84a', wood: '#ece2c8', cloth: ['#2f6a3a', '#1e4a28'], leather: '#4a3a24', gem: '#5fd38a', leaf: '#4aa870', wrap: '#2f6a3a' }, draw(c, P, o) {
    bowDraw(c, P, o, 17.5, 3);
    for (const s of [-1, 1]) for (const [x, y, a] of [[3.4, 0.45, -0.9], [2.4, 0.7, -0.6], [0.4, 0.9, -0.35]]) { const px = x, py = s * 17.5 * y; c.strokeStyle = O; c.lineWidth = 1.4; c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo(px + 2.6, py + s * a * 1.4, px + 3.6, py + s * a * 3.6); c.stroke(); c.strokeStyle = '#ece2c8'; c.lineWidth = 0.7; c.stroke(); }
    for (const s of [-1, 1]) F(c, () => c.ellipse(1.6, s * 3.2, 1.6, 0.8, s * 0.5, 0, 7), P.leaf, 0.35);
    gemBig(c, 2.4, 0, 1, P.gem);
  } },
  { id: 'sunbow', name: 'Солнечный лук', cls: ['archer'], tiers: [5], swing: 'bow', fx: 'spark', theme: { metal: '#d8a838', acc: '#fff0a0', wood: '#d8a838', cloth: ['#8a2a14', '#5a1a0e'], leather: '#5a3418', gem: '#ffd34a', leaf: '#e8c040', wrap: '#8a2a14' }, draw(c, P, o) {
    bowDraw(c, P, o, 17, 5);
    c.save(); c.translate(3, 0); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; F(c, () => { c.moveTo(Math.cos(a - 0.12) * 2.6, Math.sin(a - 0.12) * 2.6); c.lineTo(Math.cos(a) * (i % 2 ? 4 : 5), Math.sin(a) * (i % 2 ? 4 : 5)); c.lineTo(Math.cos(a + 0.12) * 2.6, Math.sin(a + 0.12) * 2.6); c.closePath(); }, P.acc, 0.3); }
    F(c, () => c.arc(0, 0, 2.8, 0, 7), P.metal, 0.55); gemBig(c, 0, 0, 1.6, P.gem); c.restore();
  } },
  { id: 'nightbow', name: 'Лук Ночной Тени', cls: ['archer'], tiers: [5], swing: 'bow', fx: 'arcane', theme: { metal: '#4a4058', acc: '#b47aff', wood: '#2a2236', cloth: ['#2a1444', '#1a0e2e'], leather: '#24182e', gem: '#c8a0ff', leaf: '#6a4a9a', wrap: '#2a1444' }, draw(c, P, o) {
    bowDraw(c, P, o, 16.5, 2);
    for (const s of [-1, 1]) { F(c, () => { c.moveTo(1.6, s * 16.5); c.quadraticCurveTo(5.4, s * 14.4, 6.6, s * 9.6); c.quadraticCurveTo(4.6, s * 12.6, 2.4, s * 13.4); c.closePath(); }, '#8a8aa0', 0.5); edgeHi(c, P, [[5.6, s * 11], [6.2, s * 9.8]]); }
    F(c, () => c.roundRect(-0.6, -3, 2.6, 6, 0.8), P.acc, 0.45); gemBig(c, 2.8, 0, 1.2, P.gem);
  } },
  // ---------------------------------------------------------------- инструменты и оружие жителей
  { id: 'pick', name: 'Кирка', npc: true, hands: 1, draw(c, P) {
    haft(c, 5, -20.6, 1.7, P, 2.4, -1.8);
    metal(c, () => { c.moveTo(-10.6, -15.4); c.quadraticCurveTo(-5, -23.4, 0, -23.2); c.quadraticCurveTo(5, -23.4, 11.4, -15.8); c.lineTo(10.6, -15); c.quadraticCurveTo(5, -19.8, 0, -19.6); c.quadraticCurveTo(-5, -19.8, -9.8, -14.4); c.closePath(); }, { ...P, metal: '#a8b0b6' });
    F(c, () => c.rect(-1.6, -24, 3.2, 5.4), '#6a7076', 0.5);
  } },
  { id: 'torch', name: 'Факел', npc: true, hands: 1, draw(c, P, o) {
    haft(c, 5, -14, 1.6, P, 2.4, -1.4);
    F(c, () => c.rect(-1.6, -16.4, 3.2, 2.6), '#5a3a1c', 0.5);
    const t = (o && o.t) || 0, f = Math.sin(t * 14) * 0.8, g = c.createRadialGradient(0, -20, 0.5, 0, -20, 8); g.addColorStop(0, 'rgba(255,200,90,.7)'); g.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, -20, 8, 0, 7); c.fill();
    for (const [col, w, h] of [['#ff6a2a', 3, 8], ['#ffb347', 2, 5.6], ['#fff2a0', 1, 3.2]]) { c.fillStyle = col; c.beginPath(); c.moveTo(-w, -16.4); c.quadraticCurveTo(-w, -16.4 - h * 0.6, f * 0.4, -16.4 - h - f); c.quadraticCurveTo(w, -16.4 - h * 0.6, w, -16.4); c.closePath(); c.fill(); }
  } },
  { id: 'sickle', name: 'Серп колдуна', npc: true, hands: 1, swing: 'cast', tip: [6, -25], draw(c, P, o) {
    F(c, () => { c.moveTo(-0.8, 10); c.quadraticCurveTo(0.4, -6, -0.6, -22); c.lineTo(0.8, -22); c.quadraticCurveTo(1.8, -6, 0.8, 10); c.closePath(); }, '#5a3e24', 0.6);
    tipGlow(c, 5, -25, 3.4, { ...P, glow: '#78ffaa', orb: '#9affc8' }, o);
    F(c, () => { c.moveTo(-0.4, -21.6); c.quadraticCurveTo(4.6, -30, 11.6, -26); c.quadraticCurveTo(13.4, -23, 11.4, -19.6); c.quadraticCurveTo(11, -24, 6, -24.6); c.quadraticCurveTo(2.4, -24.2, 1, -20.4); c.closePath(); }, '#cfd8de', 0.6);
  } },
  // только у стражи — копьё
  { id: 'spear', name: 'Копьё', tiers: [], npc: true, hands: 2, box: [-3, -34, 3, 10], draw(c, P) {
    haft(c, 10, -27, 1.6, P, 1.6, -2.2);
    metal(c, () => { c.moveTo(-0.8, -27); c.lineTo(-1.8, -30); c.lineTo(0, -34.4); c.lineTo(1.8, -30); c.lineTo(0.8, -27); c.closePath(); }, P);
    F(c, () => c.rect(-1.1, -27.6, 2.2, 1.6), P.acc, 0.5); edgeHi(c, P, [[-0.9, -29.8], [-0.2, -33.4]]);
  } },
  { id: 'cleaver', name: 'Тесак', tiers: [], npc: true, hands: 1, box: [-3, -15, 5, 5], draw(c, P) {
    haft(c, 2.6, -2, 1.5, P, 2.6, -2);
    metal(c, () => { c.moveTo(-1, -2.2); c.lineTo(-1, -13.4); c.lineTo(3.4, -14.6); c.quadraticCurveTo(3.8, -8, 2, -2.2); c.closePath(); }, P);
    edgeHi(c, P, [[3, -14], [3.2, -8.6], [1.9, -3]]);
  } },
];
export const W_BY = Object.fromEntries(WEAPONS.map(w => [w.id, w]));

// ------------------------------------------------------------------ шлемы Воина (рисуются на голове: центр головы (0,-18.2), r≈3.4×4.1)
// view: front / side / back. Каждая модель знает, закрывает ли волосы и лицо.
export const HELMS = [
  { id: 'cap', name: 'Кожаная шапка', tiers: [1], hair: 'top' },
  { id: 'coif', name: 'Стёганый подшлемник', tiers: [1, 2], hair: 'all' },
  { id: 'nasal', name: 'Шлем с наносником', tiers: [2, 3], hair: 'top' },
  { id: 'mailcoif', name: 'Кольчужный капюшон', tiers: [2], hair: 'all' },
  { id: 'kettle', name: 'Шапель', tiers: [2, 3], hair: 'top' },
  { id: 'spangen', name: 'Шишак с бармицей', tiers: [3], hair: 'all' },
  { id: 'horned', name: 'Рогатый шлем', tiers: [3, 4], hair: 'top' },
  { id: 'great', name: 'Топфхельм', tiers: [4], hair: 'all', face: true },
  { id: 'winged', name: 'Крылатый шлем', tiers: [4], hair: 'all' },
  // Маг
  { id: 'mhood', name: 'Холщовый капюшон', cls: ['mage'], tiers: [1, 2], hair: 'all' },
  { id: 'circlet', name: 'Обруч', cls: ['mage'], tiers: [1, 2, 3], hair: 'none' },
  { id: 'wizard', name: 'Шляпа ученика', cls: ['mage'], tiers: [2, 3], hair: 'top' },
  { id: 'cowl', name: 'Глубокий капюшон', cls: ['mage'], tiers: [3, 4], hair: 'all' },
  { id: 'starhat', name: 'Звёздная шляпа', cls: ['mage'], tiers: [3, 4], hair: 'top' },
  { id: 'crown', name: 'Венец Архимага', cls: ['mage'], tiers: [4], hair: 'none' },
  // Лучник
  { id: 'lhood', name: 'Кожаный капюшон', cls: ['archer'], tiers: [1, 2], hair: 'all' },
  { id: 'huntcap', name: 'Шапка охотника', cls: ['archer'], tiers: [1, 2], hair: 'top' },
  { id: 'fhood', name: 'Капюшон с пером', cls: ['archer'], tiers: [2, 3], hair: 'all' },
  { id: 'ranger', name: 'Шляпа следопыта', cls: ['archer'], tiers: [3, 4], hair: 'top' },
  { id: 'mantle', name: 'Капюшон Следопыта', cls: ['archer'], tiers: [4], hair: 'all' },
  // v92: фиолетовые (героические)
  { id: 'warlord', name: 'Шлем Полководца', tiers: [5], hair: 'all', fx: 'rune', theme: { metal: '#5a6274', acc: '#e0b84a', cloth: ['#1e3050', '#14203a'], gem: '#6ad0ff', etch: '#7ee0ff' } },
  { id: 'dragonhelm', name: 'Драконий шлем', tiers: [5], hair: 'all', fx: 'fire', theme: { metal: '#4a4048', acc: '#e8b040', cloth: ['#8a1a14', '#5a120e'], gem: '#ff6a2a', etch: '#ff8a3a' } },
  { id: 'astral', name: 'Венец Звездочёта', cls: ['mage'], tiers: [5], hair: 'none', fx: 'arcane', theme: { metal: '#5b5470', acc: '#e7c35a', cloth: ['#3a1f5a', '#2a1444'], gem: '#c8a0ff', etch: '#d8b8ff' } },
  { id: 'frostcowl', name: 'Капюшон Инея', cls: ['mage'], tiers: [5], hair: 'all', fx: 'frost', theme: { metal: '#b8c8d8', acc: '#e8f4ff', cloth: ['#2a4a6e', '#1a3050'], gem: '#bfe6ff', etch: '#e8f8ff' } },
  { id: 'staghood', name: 'Капюшон Белого Оленя', cls: ['archer'], tiers: [5], hair: 'all', fx: 'leaf', theme: { metal: '#c8b890', acc: '#e0b84a', cloth: ['#2f6a3a', '#1e4a28'], leather: '#2f6a3a', gem: '#5fd38a', leaf: '#4aa870' } },
  { id: 'hawkmask', name: 'Маска Ястреба', cls: ['archer'], tiers: [5], hair: 'top', fx: 'spark', theme: { metal: '#d8a838', acc: '#fff0a0', cloth: ['#8a2a14', '#5a1a0e'], leather: '#5a3418', gem: '#ffd34a' } },
  // жители и разбойники
  { id: 'straw', name: 'Соломенная шляпа', npc: true, hair: 'top' },
  { id: 'band', name: 'Повязка', npc: true, hair: 'none' },
];
export const H_BY = Object.fromEntries(HELMS.map(h => [h.id, h]));

export function drawHelm(c, id, P, view) {
  const hy = -18.2, side = view === 'side', back = view === 'back', fx = side ? 0.4 : 0;
  const dome = (r, y0, col) => metal(c, () => { c.moveTo(fx - r, y0); c.bezierCurveTo(fx - r, hy - 7.2, fx + r, hy - 7.2, fx + r, y0); c.closePath(); }, P, col);
  const mail = (fn, col) => { F(c, fn, col, 0.6); c.save(); c.beginPath(); fn(); c.clip(); c.strokeStyle = sh(col, -0.35); c.lineWidth = 0.25; for (let y = -26; y < -8; y += 0.8) for (let x = -6; x < 6; x += 0.9) { c.beginPath(); c.arc(x + ((y * 1.25) % 2 ? 0.45 : 0), y, 0.38, 0, Math.PI); c.stroke(); } c.restore(); };
  switch (id) {
    case 'cap': {
      F(c, () => { c.moveTo(fx - 3.8, hy - 1.2); c.bezierCurveTo(fx - 3.8, hy - 6.6, fx + 3.8, hy - 6.6, fx + 3.8, hy - 1.2); c.closePath(); }, P.leather, 0.7);
      F(c, () => c.roundRect(fx - 3.9, hy - 1.9, 7.8, 1.3, 0.5), sh(P.leather, -0.25), 0.5);
      line(c, [[fx, hy - 1.9], [fx, hy - 5.8]], sh(P.leather, -0.35), 0.35); break; }
    case 'coif': case 'mailcoif': {
      const col = id === 'coif' ? P.cloth[0] : P.metal;
      const hole = () => { if (back) return; c.moveTo(fx + (side ? 4.6 : 2.7), hy + 0.7); side ? c.ellipse(fx + 2.6, hy + 0.7, 2, 3.3, 0, 0, 7, true) : c.ellipse(fx, hy + 0.7, 2.7, 3.3, 0, 0, 7, true); };
      const fn = () => { c.moveTo(fx - 4.2, hy + 4.6); c.lineTo(fx - 4.3, hy - 1); c.bezierCurveTo(fx - 4.3, hy - 6.8, fx + 4.3, hy - 6.8, fx + 4.3, hy - 1); c.lineTo(fx + 4.2, hy + 4.6); c.quadraticCurveTo(fx, hy + 6.2, fx - 4.2, hy + 4.6); c.closePath(); hole(); };
      if (id === 'coif') { F(c, fn, col, 0.7); c.save(); c.beginPath(); fn(); c.clip(); c.strokeStyle = sh(col, -0.25); c.lineWidth = 0.3; for (let x = -4; x <= 4; x += 1.4) { c.beginPath(); c.moveTo(fx + x, hy - 6); c.lineTo(fx + x, hy + 6); c.stroke(); } c.restore(); }
      else mail(fn, col);
      break; }
    case 'nasal': {
      metal(c, () => { c.moveTo(fx - 3.9, hy - 1.4); c.quadraticCurveTo(fx - 3.6, hy - 6, fx, hy - 7.6); c.quadraticCurveTo(fx + 3.6, hy - 6, fx + 3.9, hy - 1.4); c.closePath(); }, P);
      F(c, () => c.roundRect(fx - 4.1, hy - 2.2, 8.2, 1.3, 0.4), P.acc, 0.5);
      if (!back) { if (side) F(c, () => c.rect(fx + 3.2, hy - 1.2, 0.9, 3.4), P.acc, 0.45); else F(c, () => c.rect(fx - 0.45, hy - 1.2, 0.9, 3.6), P.acc, 0.45); }
      line(c, [[fx, hy - 7.2], [fx, hy - 2.4]], P.dark, 0.3); break; }
    case 'kettle': {
      dome(3.8, hy - 1.6, P.metal);
      F(c, () => c.ellipse(fx, hy - 1.6, 6.2, side ? 1.4 : 1.6, 0, 0, 7), P.metal, 0.6);
      c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.ellipse(fx - 2, hy - 1.9, 3, 0.5, 0, 0, 7); c.fill();
      F(c, () => c.rect(fx - 3.8, hy - 2.8, 7.6, 0.9), P.acc, 0.4); break; }
    case 'spangen': {
      mail(() => { c.moveTo(fx - 4.4, hy - 1.4); c.lineTo(fx - 4.6, hy + 4.4); c.quadraticCurveTo(fx, hy + (back ? 6.4 : 5.4), fx + 4.6, hy + 4.4); c.lineTo(fx + 4.4, hy - 1.4); c.closePath(); if (!back) { c.moveTo(fx + (side ? 4.4 : 2.6), hy + 0.9); side ? c.ellipse(fx + 2.6, hy + 0.9, 1.8, 3, 0, 0, 7, true) : c.ellipse(fx, hy + 0.9, 2.6, 3, 0, 0, 7, true); } }, P.metal);
      metal(c, () => { c.moveTo(fx - 4, hy - 1.2); c.quadraticCurveTo(fx - 3.8, hy - 6.4, fx, hy - 8); c.quadraticCurveTo(fx + 3.8, hy - 6.4, fx + 4, hy - 1.2); c.closePath(); }, P);
      for (const x of side ? [-1, 1.8] : [-2.2, 0, 2.2]) line(c, [[fx + x * 0.9, hy - 1.6], [fx + x * 0.3, hy - 7.4]], P.acc, 0.6);
      F(c, () => c.roundRect(fx - 4.2, hy - 2, 8.4, 1.3, 0.4), P.acc, 0.45); F(c, () => c.arc(fx, hy - 8.2, 0.6, 0, 7), P.acc, 0.4); break; }
    case 'horned': {
      for (const s of side ? [1] : [-1, 1]) { const x0 = side ? fx - 1 : fx + s * 3.2; F(c, () => { c.moveTo(x0, hy - 3.4); c.quadraticCurveTo(x0 + s * 4.2, hy - 4, x0 + s * 4.6, hy - 9.4); c.quadraticCurveTo(x0 + s * 2.6, hy - 6.4, x0 - s * 0.4, hy - 5.6); c.closePath(); }, '#ece2c8', 0.6); line(c, [[x0 + s * 3.4, hy - 5.6], [x0 + s * 4, hy - 6.4]], '#b8a888', 0.35); }
      dome(4, hy - 1.2, P.metal); F(c, () => c.roundRect(fx - 4.2, hy - 2, 8.4, 1.4, 0.4), P.acc, 0.5);
      if (!back && !side) F(c, () => { c.moveTo(fx - 0.5, hy - 1); c.lineTo(fx + 0.5, hy - 1); c.lineTo(fx + 0.3, hy + 2.4); c.lineTo(fx - 0.3, hy + 2.4); c.closePath(); }, P.acc, 0.4);
      gem(c, fx, hy - 4.8, 0.7, back ? null : P.gem); break; }
    case 'great': {
      metal(c, () => { c.moveTo(fx - 4.2, hy + 4.4); c.lineTo(fx - 4.3, hy - 3.6); c.quadraticCurveTo(fx, hy - 7.4, fx + 4.3, hy - 3.6); c.lineTo(fx + 4.2, hy + 4.4); c.quadraticCurveTo(fx, hy + 5.4, fx - 4.2, hy + 4.4); c.closePath(); }, P);
      if (!back) {
        const ex = side ? [fx + 1.4, fx + 4.3] : [fx - 3.8, fx + 3.8];
        F(c, () => c.rect(ex[0], hy - 1.4, ex[1] - ex[0], 0.9), '#14100b', 0.3);
        if (!side) { F(c, () => c.rect(fx - 0.5, hy - 4.6, 1, 8.8), P.acc, 0.4); F(c, () => c.rect(fx - 3, hy + 0.2, 6, 0.8), P.acc, 0.4); for (const x of [-2.4, -1.4, 1.4, 2.4]) { c.fillStyle = '#14100b'; c.fillRect(fx + x - 0.2, hy + 2.2, 0.4, 0.4); c.fillRect(fx + x - 0.2, hy + 3.2, 0.4, 0.4); } }
        else F(c, () => c.rect(fx + 3.4, hy - 4.4, 0.8, 8.4), P.acc, 0.4);
      }
      c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(fx - 3.4, hy - 3.8, 0.9, 7); break; }
    case 'winged': {
      for (const s of side ? [-1] : [-1, 1]) { const x0 = side ? fx - 2.4 : fx + s * 3.8; F(c, () => { c.moveTo(x0, hy - 2); c.quadraticCurveTo(x0 + s * 3, hy - 9, x0 + s * 6.4, hy - 10.4); c.quadraticCurveTo(x0 + s * 4.4, hy - 7.6, x0 + s * 5.4, hy - 6.6); c.quadraticCurveTo(x0 + s * 3.4, hy - 5.6, x0 + s * 4.2, hy - 4); c.quadraticCurveTo(x0 + s * 2, hy - 4, x0, hy - 0.6); c.closePath(); }, '#f2ede2', 0.55); line(c, [[x0 + s * 1.4, hy - 3], [x0 + s * 4.4, hy - 8.6]], '#c8c0b0', 0.3); }
      metal(c, () => { c.moveTo(fx - 4.1, hy + 3.6); c.lineTo(fx - 4.2, hy - 1.6); c.bezierCurveTo(fx - 4.2, hy - 7.4, fx + 4.2, hy - 7.4, fx + 4.2, hy - 1.6); c.lineTo(fx + 4.1, hy + 3.6); c.lineTo(fx + (side ? 2.4 : 2.6), hy + 3.8); c.lineTo(fx + (side ? 2.6 : 2.6), hy - 0.4); c.lineTo(fx - (side ? -0.4 : 2.6), hy - 0.4); c.lineTo(fx - (side ? -0.4 : 2.6), hy + 3.8); c.closePath(); }, P);
      if (back) metal(c, () => c.rect(fx - 4, hy - 1, 8, 4.6), P);
      F(c, () => c.roundRect(fx - 4.3, hy - 1.8, 8.6, 1.2, 0.4), P.acc, 0.45);
      F(c, () => { c.moveTo(fx - 0.6, hy - 6.2); c.quadraticCurveTo(fx - 1.6, hy - 9.6, fx + (side ? -3.6 : 0), hy - 10.4); c.quadraticCurveTo(fx + 1.2, hy - 9, fx + 0.6, hy - 6.2); c.closePath(); }, P.cloth[0], 0.5);
      gem(c, fx, hy - 3.4, 0.8, back || side ? null : P.gem); break; }

    case 'warlord': {   // v92: топфхельм с золотым гребнем, рогами-завитками и рунами
      for (const s of side ? [-1] : [-1, 1]) { const x0 = side ? fx - 2.6 : fx + s * 3.6; F(c, () => { c.moveTo(x0, hy - 3.6); c.bezierCurveTo(x0 + s * 5.4, hy - 4.6, x0 + s * 6.4, hy - 9.6, x0 + s * 3.4, hy - 11.4); c.quadraticCurveTo(x0 + s * 4.4, hy - 8.4, x0 + s * 2.2, hy - 6.6); c.quadraticCurveTo(x0 + s * 1, hy - 5.6, x0, hy - 5.8); c.closePath(); }, P.acc, 0.55); line(c, [[x0 + s * 3.2, hy - 6], [x0 + s * 4.4, hy - 8.6]], sh(P.acc, -0.35), 0.35); }
      metal(c, () => { c.moveTo(fx - 4.4, hy + 4.8); c.lineTo(fx - 4.5, hy - 3.6); c.quadraticCurveTo(fx, hy - 8, fx + 4.5, hy - 3.6); c.lineTo(fx + 4.4, hy + 4.8); c.quadraticCurveTo(fx, hy + 6, fx - 4.4, hy + 4.8); c.closePath(); }, P);
      F(c, () => { c.moveTo(fx - 1, hy - 7.4); c.quadraticCurveTo(fx + (side ? -6 : 0), hy - 12.6, fx + (side ? -6.6 : 0), hy - 13.4); c.quadraticCurveTo(fx + (side ? -2 : 1.6), hy - 10.6, fx + 1, hy - 7.4); c.closePath(); }, P.acc, 0.5);
      if (!back) { const ex = side ? [fx + 1.4, fx + 4.5] : [fx - 3.8, fx + 3.8]; F(c, () => c.rect(ex[0], hy - 1.4, ex[1] - ex[0], 1), '#0a0c12', 0.3);
        if (!side) { F(c, () => { c.moveTo(fx - 0.7, hy - 6.8); c.lineTo(fx + 0.7, hy - 6.8); c.lineTo(fx + 0.6, hy + 4.4); c.lineTo(fx - 0.6, hy + 4.4); c.closePath(); }, P.acc, 0.4); gem(c, fx, hy - 4.6, 0.9, P.gem); c.strokeStyle = P.etch; c.lineWidth = 0.45; for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(fx + sx * 2, hy + 1); c.lineTo(fx + sx * 3, hy + 2.2); c.lineTo(fx + sx * 2.2, hy + 3.4); c.stroke(); } } }
      F(c, () => c.roundRect(fx - 4.6, hy + 3.8, 9.2, 1.2, 0.4), P.acc, 0.45); c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(fx - 3.6, hy - 3.8, 0.9, 7); break; }
    case 'dragonhelm': {   // v92: шлем-драконья голова: гребень шипами, щёки-чешуя, рога назад
      for (const s of side ? [-1] : [-1, 1]) { const x0 = side ? fx - 3 : fx + s * 3.4; F(c, () => { c.moveTo(x0, hy - 3.4); c.bezierCurveTo(x0 + s * 3.6, hy - 4.2, x0 + s * 6.4, hy - 4.6, x0 + s * 7.4, hy - 8.2); c.quadraticCurveTo(x0 + s * 5, hy - 3.6, x0, hy - 1.2); c.closePath(); }, P.acc, 0.5); line(c, [[x0 + s * 2.6, hy - 3.2], [x0 + s * 5.4, hy - 4.8]], sh(P.acc, -0.35), 0.35); }
      metal(c, () => { c.moveTo(fx - 4.3, hy + 4.4); c.lineTo(fx - 4.4, hy - 2); c.bezierCurveTo(fx - 4.4, hy - 7.8, fx + 4.4, hy - 7.8, fx + 4.4, hy - 2); c.lineTo(fx + 4.3, hy + 4.4); c.lineTo(fx + 2.6, hy + 3.6); c.lineTo(fx + 2.6, hy - 0.4); c.lineTo(fx - 2.6, hy - 0.4); c.lineTo(fx - 2.6, hy + 3.6); c.closePath(); }, P);
      if (back) metal(c, () => c.rect(fx - 4.2, hy - 1, 8.4, 5), P);
      for (let i = 0; i < 5; i++) { const y = hy - 6.6 + i * 1.6, x = fx + (side ? -1.8 - i * 0.9 : 0); F(c, () => { c.moveTo(x - 0.8, y + 0.4); c.lineTo(x + (side ? -2.6 : 0), y - 2.6 + i * 0.2); c.lineTo(x + 0.8, y + 0.4); c.closePath(); }, '#c83a1a', 0.4); if (!side) break; }
      if (!side) for (const x of [-1.8, 0, 1.8]) F(c, () => { c.moveTo(fx + x - 0.7, hy - 6.2); c.lineTo(fx + x * 1.3, hy - 9.6 - (x === 0 ? 1.4 : 0)); c.lineTo(fx + x + 0.7, hy - 6.2); c.closePath(); }, '#c83a1a', 0.4);
      F(c, () => c.roundRect(fx - 4.5, hy - 1.8, 9, 1.3, 0.4), P.acc, 0.45);
      if (!back && !side) { gem(c, fx - 1.6, hy + 0.6, 0.5, P.gem); gem(c, fx + 1.6, hy + 0.6, 0.5, P.gem); }
      c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(fx - 3.4, hy - 4, 0.8, 6); break; }
    case 'astral': {   // v92: высокий венец с лучами и парящим камнем
      F(c, () => c.roundRect(fx - 4, hy - 3.8, 8, 1.5, 0.5), P.acc, 0.5);
      for (const x of side ? [-2, 0.4, 2.8] : [-3.2, -1.6, 0, 1.6, 3.2]) { const h = x === 0 ? 5.8 : Math.abs(x) > 2.5 ? 2.6 : 4; F(c, () => { c.moveTo(fx + x - 0.75, hy - 3.6); c.quadraticCurveTo(fx + x * 1.15, hy - 3.6 - h * 0.6, fx + x * 1.25, hy - 3.6 - h); c.quadraticCurveTo(fx + x * 1.05 + 0.2, hy - 3.6 - h * 0.5, fx + x + 0.75, hy - 3.6); c.closePath(); }, P.acc, 0.4); }
      if (!back && !side) gem(c, fx, hy - 3, 0.9, P.gem);
      F(c, () => { for (let i = 0; i < 8; i++) { const r = i % 2 ? 0.7 : 1.7, a = i * Math.PI / 4 - Math.PI / 2; c.lineTo(fx + Math.cos(a) * r, hy - 12.6 + Math.sin(a) * r); } c.closePath(); }, '#f4e8ff', 0.4);
      F(c, () => c.arc(fx, hy - 12.6, 0.6, 0, 7), P.gem, 0.3); break; }
    case 'frostcowl': {   // v92: капюшон с ледяными шипами на макушке и инеем по кромке
      const col = P.cloth[0];
      const hole = () => { if (back) return; c.moveTo(fx + (side ? 4.4 : 2.6), hy + 0.7); side ? c.ellipse(fx + 2.6, hy + 0.7, 1.9, 3.2, 0, 0, 7, true) : c.ellipse(fx, hy + 0.9, 2.6, 3.3, 0, 0, 7, true); };
      const fn = () => { c.moveTo(fx - 4.4, hy + 4.6); c.lineTo(fx - 4.5, hy - 0.6); c.bezierCurveTo(fx - 4.5, hy - 6.4, fx + 4.5, hy - 6.4, fx + 4.5, hy - 0.6); c.lineTo(fx + 4.4, hy + 4.6); c.quadraticCurveTo(fx, hy + 6.2, fx - 4.4, hy + 4.6); c.closePath(); hole(); };
      F(c, fn, col, 0.7); c.save(); c.beginPath(); fn(); c.clip(); c.fillStyle = 'rgba(10,20,40,.25)'; c.fillRect(fx + 1, hy - 9, 6, 16); c.restore();
      if (!back) { c.save(); c.beginPath(); side ? c.ellipse(fx + 2.6, hy + 0.7, 1.9, 3.2, 0, 0, 7) : c.ellipse(fx, hy + 0.9, 2.6, 3.3, 0, 0, 7); c.clip(); const g = c.createLinearGradient(0, hy - 2.6, 0, hy + 2.4); g.addColorStop(0, 'rgba(10,16,30,.8)'); g.addColorStop(1, 'rgba(10,16,30,0)'); c.fillStyle = g; c.fillRect(fx - 4, hy - 3, 8, 6); c.restore();
        c.strokeStyle = '#e8f8ff'; c.lineWidth = 0.6; c.beginPath(); side ? c.ellipse(fx + 2.6, hy + 0.7, 2.1, 3.4, 0, 0, 7) : c.ellipse(fx, hy + 0.9, 2.8, 3.5, 0, 0, 7); c.stroke(); }
      for (const [x, L, a] of side ? [[-1.4, 4.4, -0.5], [0.8, 3.4, -0.2]] : [[-2.2, 3.4, -0.45], [0, 4.8, 0], [2.2, 3.4, 0.45]]) { c.save(); c.translate(fx + x, hy - 5); c.rotate(a); F(c, () => { c.moveTo(-0.9, 0.4); c.lineTo(0, -L); c.lineTo(0.9, 0.4); c.closePath(); }, '#cfeaff', 0.4); c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(-0.35, -L * 0.7, 0.35, L * 0.6); c.restore(); }
      break; }
    case 'staghood': {   // v92: зелёный капюшон с оленьими рогами
      for (const s of side ? [-1, 1] : [-1, 1]) { const x0 = fx + s * (side ? 0.8 : 2.2), y0 = hy - 5.4; c.strokeStyle = O; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 + s * 2, y0 - 3, x0 + s * 1.4, y0 - 7.4); c.moveTo(x0 + s * 1.2, y0 - 3); c.lineTo(x0 + s * 4, y0 - 4.8); c.moveTo(x0 + s * 1.7, y0 - 5.2); c.lineTo(x0 + s * 3.6, y0 - 7.6); c.stroke(); c.strokeStyle = '#ece2c8'; c.lineWidth = 0.75; c.stroke(); }
      const col = P.leather;
      const hole = () => { if (back) return; c.moveTo(fx + (side ? 4.4 : 2.6), hy + 0.7); side ? c.ellipse(fx + 2.6, hy + 0.7, 1.9, 3.2, 0, 0, 7, true) : c.ellipse(fx, hy + 0.9, 2.6, 3.3, 0, 0, 7, true); };
      const fn = () => { c.moveTo(fx - 4.3, hy + 4.4); c.lineTo(fx - 4.4, hy - 0.6); c.bezierCurveTo(fx - 4.4, hy - 6.4, fx + 4.4, hy - 6.4, fx + 4.4, hy - 0.6); c.lineTo(fx + 4.3, hy + 4.4); c.quadraticCurveTo(fx, hy + 6, fx - 4.3, hy + 4.4); c.closePath(); hole(); };
      F(c, fn, col, 0.7); c.save(); c.beginPath(); fn(); c.clip(); c.fillStyle = 'rgba(10,20,10,.25)'; c.fillRect(fx + 1, hy - 9, 6, 16); c.restore();
      if (!back) { c.save(); c.beginPath(); side ? c.ellipse(fx + 2.6, hy + 0.7, 1.9, 3.2, 0, 0, 7) : c.ellipse(fx, hy + 0.9, 2.6, 3.3, 0, 0, 7); c.clip(); const g = c.createLinearGradient(0, hy - 2.6, 0, hy + 1); g.addColorStop(0, 'rgba(6,12,6,.75)'); g.addColorStop(1, 'rgba(6,12,6,0)'); c.fillStyle = g; c.fillRect(fx - 4, hy - 3, 8, 6); c.restore();
        c.strokeStyle = P.acc; c.lineWidth = 0.5; c.beginPath(); side ? c.ellipse(fx + 2.6, hy + 0.7, 2.1, 3.4, 0, 0, 7) : c.ellipse(fx, hy + 0.9, 2.8, 3.5, 0, 0, 7); c.stroke(); }
      for (const [x, y, a] of side ? [[-3.6, -1, 0.4]] : [[-3.8, -0.6, 0.6], [3.8, -0.6, -0.6]]) F(c, () => c.ellipse(fx + x, hy + y, 1.6, 0.8, a, 0, 7), P.leaf, 0.35);
      break; }
    case 'hawkmask': {   // v92: золотая маска-клюв с перьями
      F(c, () => { c.moveTo(fx - 3.8, hy - 2.6); c.quadraticCurveTo(fx - 3.6, hy - 7.4, fx, hy - 7.2); c.quadraticCurveTo(fx + 3.6, hy - 7.4, fx + 3.8, hy - 2.6); c.closePath(); }, P.leather, 0.6);
      for (let i = 0; i < 5; i++) { const a = -1.1 + i * 0.55, x0 = fx + (side ? -2 : Math.sin(a) * 2.6), cols = ['#8a2a14', '#e8c040', '#f4ead0', '#e8c040', '#8a2a14']; c.save(); c.translate(x0, hy - 6); c.rotate(side ? -0.9 + i * 0.12 : a * 0.7); F(c, () => { c.moveTo(-0.7, 0); c.quadraticCurveTo(-1.1, -3.4, 0, -5.6 - (i === 2 ? 1.4 : 0)); c.quadraticCurveTo(1.1, -3.4, 0.7, 0); c.closePath(); }, cols[i], 0.4); c.restore(); if (side && i > 2) break; }
      if (!back) { metal(c, () => { if (side) { c.moveTo(fx + 0.6, hy - 3); c.lineTo(fx + 4.4, hy - 2.4); c.quadraticCurveTo(fx + 6.6, hy - 1.4, fx + 5.4, hy + 0.8); c.lineTo(fx + 3.6, hy + 0.2); c.lineTo(fx + 0.8, hy); c.closePath(); } else { c.moveTo(fx - 4, hy - 3.2); c.lineTo(fx + 4, hy - 3.2); c.lineTo(fx + 3.4, hy - 0.6); c.lineTo(fx + 0.9, hy - 0.2); c.lineTo(fx, hy + 2.2); c.lineTo(fx - 0.9, hy - 0.2); c.lineTo(fx - 3.4, hy - 0.6); c.closePath(); } }, P, P.metal);
        if (!side) for (const sx of [-1.8, 1.8]) F(c, () => c.ellipse(fx + sx, hy - 1.9, 0.9, 0.5, 0, 0, 7), '#0a0806', 0.2); else F(c, () => c.ellipse(fx + 2.6, hy - 1.6, 0.7, 0.5, 0, 0, 7), '#0a0806', 0.2);
        gem(c, fx + (side ? 1.4 : 0), hy - 3.6, 0.6, P.gem); }
      break; }
    case 'mhood': case 'cowl': case 'lhood': case 'fhood': case 'mantle': {
      const col = id === 'lhood' || id === 'fhood' ? P.leather : id === 'mantle' ? P.leaf : P.cloth[0];
      if (id === 'mantle') F(c, () => { c.moveTo(fx - (side ? 3 : 6.4), hy + 3.6); c.quadraticCurveTo(fx, hy + (back ? 9.4 : 7.4), fx + (side ? 4 : 6.4), hy + 3.6); c.lineTo(fx + 3.6, hy + 2); c.lineTo(fx - 3.6, hy + 2); c.closePath(); }, sh(col, -0.1), 0.6);
      const tipx = side ? fx - 5.6 : fx, tipy = side ? hy - 2.6 : hy - 7.6;
      const hole = () => { if (back) return; c.moveTo(fx + (side ? 4.4 : 2.6), hy + 0.7); side ? c.ellipse(fx + 2.6, hy + 0.7, 1.9, 3.2, 0, 0, 7, true) : c.ellipse(fx, hy + 0.9, 2.6, 3.3, 0, 0, 7, true); };
      const fn = () => { c.moveTo(fx - 4.3, hy + 4.4); c.lineTo(fx - 4.4, hy - 0.6); c.bezierCurveTo(fx - 4.4, hy - 6, fx - 1, hy - 7, tipx, tipy); c.bezierCurveTo(fx + 1.4, hy - 7, fx + 4.4, hy - 6, fx + 4.4, hy - 0.6); c.lineTo(fx + 4.3, hy + 4.4); c.quadraticCurveTo(fx, hy + 6, fx - 4.3, hy + 4.4); c.closePath(); hole(); };
      F(c, fn, col, 0.7); c.save(); c.beginPath(); fn(); c.clip(); c.fillStyle = 'rgba(30,18,10,.2)'; c.fillRect(fx + 1, hy - 9, 6, 16); c.restore();
      if (!back) { c.save(); c.beginPath(); side ? c.ellipse(fx + 2.6, hy + 0.7, 1.9, 3.2, 0, 0, 7) : c.ellipse(fx, hy + 0.9, 2.6, 3.3, 0, 0, 7); c.clip(); const g = c.createLinearGradient(0, hy - 2.6, 0, hy + (id === 'cowl' ? 2.4 : 0.4)); g.addColorStop(0, 'rgba(10,6,4,.75)'); g.addColorStop(1, 'rgba(10,6,4,0)'); c.fillStyle = g; c.fillRect(fx - 4, hy - 3, 8, 6); c.restore(); }
      if (id === 'cowl' && !back) { c.strokeStyle = P.acc; c.lineWidth = 0.5; c.beginPath(); side ? c.ellipse(fx + 2.6, hy + 0.7, 2.1, 3.4, 0, 0, 7) : c.ellipse(fx, hy + 0.9, 2.8, 3.5, 0, 0, 7); c.stroke(); }
      if (id === 'fhood') { const x0 = side ? fx - 2 : fx + 2.6; F(c, () => { c.moveTo(x0, hy - 3); c.quadraticCurveTo(x0 + 2.6, hy - 9, x0 + 1, hy - 12); c.quadraticCurveTo(x0 + 0.2, hy - 7, x0 - 0.6, hy - 3.4); c.closePath(); }, P.rar === 'start' || P.rar === 'common' ? '#e8e0cc' : P.gem || '#d84040', 0.45); }
      break; }
    case 'circlet': case 'crown': case 'band': {
      if (id === 'band') { F(c, () => c.roundRect(fx - 3.9, hy - 3.4, 7.8, 1.5, 0.6), P.cloth[0], 0.5); if (back) F(c, () => { c.moveTo(fx, hy - 2.6); c.lineTo(fx - 1.6, hy + 2.4); c.lineTo(fx + 0.2, hy + 1.6); c.lineTo(fx + 1.2, hy + 2.6); c.closePath(); }, P.cloth[0], 0.4); else if (side) F(c, () => { c.moveTo(fx - 3.6, hy - 2.6); c.lineTo(fx - 5.6, hy); c.lineTo(fx - 4.2, hy - 0.4); c.closePath(); }, P.cloth[0], 0.4); break; }
      F(c, () => c.roundRect(fx - 3.8, hy - 3.6, 7.6, 1.2, 0.5), P.acc, 0.5);
      if (id === 'crown') { for (const x of side ? [-1.6, 0.8, 3] : [-3, -1.5, 0, 1.5, 3]) F(c, () => { c.moveTo(fx + x - 0.7, hy - 3.4); c.lineTo(fx + x, hy - 6.4 - (x === 0 ? 1.6 : 0)); c.lineTo(fx + x + 0.7, hy - 3.4); c.closePath(); }, P.acc, 0.4); if (P.glow) { const g = c.createRadialGradient(fx, hy - 9.6, 0.3, fx, hy - 9.6, 3.4); g.addColorStop(0, P.glow + 'cc'); g.addColorStop(1, P.glow + '00'); c.fillStyle = g; c.beginPath(); c.arc(fx, hy - 9.6, 3.4, 0, 7); c.fill(); gem(c, fx, hy - 9.6, 0.9, P.gem); } }
      if (!back && !side) gem(c, fx, hy - 3, 0.8, P.gem || '#4a9eff'); break; }
    case 'wizard': case 'starhat': {
      const col = P.cloth[0], tall = id === 'starhat' ? 1.25 : 1;
      F(c, () => c.ellipse(fx, hy - 2.6, side ? 6 : 6.4, side ? 1.5 : 1.7, 0, 0, 7), sh(col, -0.25), 0.6);
      const bend = side ? -3.4 : 2.6;
      F(c, () => { c.moveTo(fx - 3.6, hy - 2.8); c.quadraticCurveTo(fx - 2.6, hy - 7 * tall, fx + bend * 0.6, hy - 10 * tall); c.quadraticCurveTo(fx + bend, hy - 11.4 * tall, fx + bend * 1.4, hy - 10 * tall); c.quadraticCurveTo(fx + 0.6, hy - 8 * tall, fx + 3.6, hy - 2.8); c.closePath(); }, col, 0.6);
      F(c, () => c.rect(fx - 3.6, hy - 4.2, 7.2, 1.3), P.acc, 0.45);
      if (id === 'starhat') { c.fillStyle = '#f4e8a0'; for (const [x, y] of [[-1.2, -6.4], [1, -8.6], [0.4, -5.6]]) { c.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 0.25 : 0.65, a = i * Math.PI / 4; c.lineTo(fx + x + Math.cos(a) * r, hy + y + Math.sin(a) * r); } c.fill(); } }
      if (!back && P.gem) gem(c, fx, hy - 3.6, 0.6, P.gem); break; }
    case 'huntcap': case 'ranger': case 'straw': {
      const col = id === 'straw' ? '#d8b44a' : id === 'ranger' ? sh(P.leather, -0.1) : P.leaf, wide = id === 'huntcap' ? 4.6 : id === 'ranger' ? 7 : 7.4;
      F(c, () => c.ellipse(fx, hy - 2.4, side ? wide * 0.9 : wide, side ? 1.3 : 1.6, 0, 0, 7), sh(col, -0.12), 0.6);
      if (id === 'huntcap') F(c, () => { c.moveTo(fx - 3.8, hy - 2.6); c.quadraticCurveTo(fx - 3, hy - 7, fx + 1, hy - 6.6); c.quadraticCurveTo(fx + (side ? -5.6 : 4.6), hy - 5.6, fx + 3.8, hy - 2.6); c.closePath(); }, col, 0.6);
      else F(c, () => { c.moveTo(fx - 3.7, hy - 2.6); c.quadraticCurveTo(fx - 3.6, hy - 7.4, fx, hy - 7.2); c.quadraticCurveTo(fx + 3.6, hy - 7.4, fx + 3.7, hy - 2.6); c.closePath(); }, col, 0.6);
      F(c, () => c.rect(fx - 3.7, hy - 3.8, 7.4, 1.1), id === 'straw' ? '#5a3a1c' : sh(col, -0.4), 0.4);
      if (id === 'straw') { c.strokeStyle = '#b8942e'; c.lineWidth = 0.3; for (let i = -6; i <= 6; i += 1.5) { c.beginPath(); c.moveTo(fx + i * (side ? 0.9 : 1), hy - 1.6); c.lineTo(fx + i * 1.1, hy - 3); c.stroke(); } }
      if (id !== 'straw') { const x0 = side ? fx - 3 : fx + 2.4; F(c, () => { c.moveTo(x0, hy - 3.6); c.quadraticCurveTo(x0 + (side ? -4 : 3.4), hy - 7.4, x0 + (side ? -5.6 : 4.4), hy - 10); c.quadraticCurveTo(x0 + (side ? -2.4 : 1.6), hy - 7.4, x0 - 0.4, hy - 3.4); c.closePath(); }, P.gem || (P.rar === 'good' ? '#5fd35f' : '#d84040'), 0.4); }
      break; }
  }
}

// ------------------------------------------------------------------ нагрудники и штаны Воина
export const CHESTS = [
  { id: 'shirt', name: 'Рубаха', cls: ['warrior', 'mage', 'archer'], tiers: [0], base: 'shirt', pauld: null, sleeve: 'cloth' },
  { id: 'gambeson', name: 'Стёганка', tiers: [1], base: 'gambeson', pauld: null, sleeve: 'cloth' },
  { id: 'jerkin', name: 'Кожаная куртка', cls: ['warrior', 'archer'], tiers: [1, 2], base: 'leather', pauld: 'leather', sleeve: 'cloth' },
  { id: 'hauberk', name: 'Кольчуга', tiers: [2, 3], base: 'mail', pauld: null, sleeve: 'mail' },
  { id: 'scale', name: 'Чешуйчатый доспех', tiers: [2, 3], base: 'scale', pauld: 'scale', sleeve: 'mail' },
  { id: 'brig', name: 'Бригантина с накидкой', tiers: [3], base: 'mail', tabard: true, pauld: 'plate', sleeve: 'mail' },
  { id: 'cuirass', name: 'Кираса', tiers: [3, 4], base: 'plate', pauld: 'plate', sleeve: 'plate' },
  { id: 'plate', name: 'Латы', tiers: [4], base: 'plate', pauld: 'big', sleeve: 'plate', cape: true },
  // Маг: мантии до пят (ноги под ними видны только ступнями)
  { id: 'robe', name: 'Роба', cls: ['mage'], tiers: [1, 2], base: 'robe', sleeve: 'robe', rope: true },
  { id: 'robe_emb', name: 'Расшитая роба', cls: ['mage'], tiers: [2, 3], base: 'robe', sleeve: 'robe', trim: true, panel: true },
  { id: 'robe_battle', name: 'Боевая мантия', cls: ['mage'], tiers: [2, 3], base: 'robe', sleeve: 'robe', pauld: 'leather', trim: true, belt: true },
  { id: 'robe_star', name: 'Звёздная мантия', cls: ['mage'], tiers: [3, 4], base: 'robe', sleeve: 'robe', trim: true, stars: true },
  { id: 'robe_arch', name: 'Мантия Архимага', cls: ['mage'], tiers: [4], base: 'robe', sleeve: 'robe', trim: true, panel: true, pauld: 'mantle', cape: true },
  // Лучник
  { id: 'furs', name: 'Шкуры', cls: ['archer'], tiers: [2], base: 'fur', pauld: 'fur', sleeve: 'cloth' },
  { id: 'studded', name: 'Клёпаная куртка', cls: ['archer'], tiers: [2, 3], base: 'leather', studs: true, pauld: 'leather', sleeve: 'leather' },
  { id: 'scale_a', name: 'Чешуйчатая куртка', cls: ['archer'], tiers: [3], base: 'scale', col: 'leaf', pauld: 'leather', sleeve: 'leather' },
  { id: 'ranger', name: 'Доспех Следопыта', cls: ['archer'], tiers: [4], base: 'scale', col: 'leaf', pauld: 'scale', sleeve: 'leather', cape: 'leaf' },
  // v92: фиолетовые (героические)
  { id: 'warlord', name: 'Латы Полководца', tiers: [5], base: 'plate', pauld: 'hero', sleeve: 'plate', cape: true, gorget: true, filigree: true, fx: 'rune', theme: { metal: '#5a6274', acc: '#e0b84a', cloth: ['#1e3050', '#14203a'], leather: '#2a2028', gem: '#6ad0ff', etch: '#7ee0ff' } },
  { id: 'ember', name: 'Латы Пламени', tiers: [5], base: 'plate', pauld: 'spike', sleeve: 'plate', cape: true, gorget: true, flames: true, fx: 'fire', theme: { metal: '#4a4048', acc: '#e8b040', cloth: ['#8a1a14', '#5a120e'], leather: '#2a1a14', gem: '#ff6a2a', etch: '#ff8a3a' } },
  { id: 'astralrobe', name: 'Мантия Звездочёта', cls: ['mage'], tiers: [5], base: 'robe', sleeve: 'robe', trim: true, stars: true, panel: true, pauld: 'wing', cape: true, fx: 'arcane', theme: { metal: '#5b5470', acc: '#e7c35a', cloth: ['#3a1f5a', '#2a1444'], leather: '#24182e', gem: '#c8a0ff', etch: '#d8b8ff' } },
  { id: 'flamerobe', name: 'Мантия Феникса', cls: ['mage'], tiers: [5], base: 'robe', sleeve: 'robe', trim: true, belt: true, pauld: 'wing', cape: true, flames: true, fx: 'fire', theme: { metal: '#6a3a2a', acc: '#e8b040', cloth: ['#8a1a14', '#5a120e'], leather: '#3a1a10', gem: '#ff7a2a', etch: '#ff8a3a' } },
  { id: 'stagarmor', name: 'Доспех Белого Оленя', cls: ['archer'], tiers: [5], base: 'scale', col: 'leaf', pauld: 'antler', sleeve: 'leather', cape: 'leaf', gorget: true, fx: 'leaf', theme: { metal: '#c8b890', acc: '#e0b84a', cloth: ['#2f6a3a', '#1e4a28'], leather: '#4a3a24', gem: '#5fd38a', leaf: '#3f8a52' } },
  { id: 'nightleather', name: 'Кожа Ночной Тени', cls: ['archer'], tiers: [5], base: 'leather', studs: true, pauld: 'spike', sleeve: 'leather', cape: true, fx: 'arcane', theme: { metal: '#4a4058', acc: '#b47aff', cloth: ['#2a1444', '#1a0e2e'], leather: '#2a2236', gem: '#c8a0ff', leaf: '#4a3a6a' } },
];
export const C_BY = Object.fromEntries(CHESTS.map(h => [h.id, h]));
export const LEGS = [
  { id: 'trousers', name: 'Холщовые штаны', cls: ['warrior', 'mage', 'archer'], tiers: [0, 1], base: 'cloth', boots: 'shoe' },
  { id: 'leggings', name: 'Кожаные штаны', cls: ['warrior', 'archer'], tiers: [1, 2], base: 'leather', boots: 'boot' },
  { id: 'chausses', name: 'Кольчужные поножи', tiers: [2, 3], base: 'mail', boots: 'boot', knee: true },
  { id: 'greaves', name: 'Латные поножи', tiers: [3, 4], base: 'plate', boots: 'sabaton', knee: true },
  { id: 'silk', name: 'Расшитые штаны', cls: ['mage'], tiers: [1, 2, 3], base: 'cloth', boots: 'boot' },
  { id: 'starleg', name: 'Звёздные шаровары', cls: ['mage'], tiers: [3, 4], base: 'cloth', boots: 'slipper' },
  { id: 'furleg', name: 'Меховые штаны', cls: ['archer'], tiers: [2, 3], base: 'leather', boots: 'fur' },
  { id: 'scaleleg', name: 'Чешуйчатые штаны', cls: ['archer'], tiers: [3, 4], base: 'scale', col: 'leaf', boots: 'boot', knee: true },
  // v92: фиолетовые (героические)
  { id: 'warlordleg', name: 'Поножи Полководца', tiers: [5], base: 'plate', boots: 'sabaton', knee: true, spikeKnee: true, theme: { metal: '#5a6274', acc: '#e0b84a', cloth: ['#1e3050', '#14203a'], leather: '#2a2028', gem: '#6ad0ff', etch: '#7ee0ff' } },
  { id: 'emberleg', name: 'Поножи Пламени', tiers: [5], base: 'plate', boots: 'sabaton', knee: true, spikeKnee: true, theme: { metal: '#4a4048', acc: '#e8b040', cloth: ['#8a1a14', '#5a120e'], leather: '#2a1a14', gem: '#ff6a2a', etch: '#ff8a3a' } },
  { id: 'astralleg', name: 'Шаровары Звездочёта', cls: ['mage'], tiers: [5], base: 'cloth', boots: 'slipper', theme: { metal: '#5b5470', acc: '#e7c35a', cloth: ['#3a1f5a', '#2a1444'], leather: '#24182e', gem: '#c8a0ff', etch: '#d8b8ff' } },
  { id: 'flameleg', name: 'Шаровары Феникса', cls: ['mage'], tiers: [5], base: 'cloth', boots: 'slipper', theme: { metal: '#6a3a2a', acc: '#e8b040', cloth: ['#8a1a14', '#5a120e'], leather: '#3a1a10', gem: '#ff7a2a', etch: '#ff8a3a' } },
  { id: 'stagleg', name: 'Поножи Белого Оленя', cls: ['archer'], tiers: [5], base: 'scale', col: 'leaf', boots: 'boot', knee: true, theme: { metal: '#c8b890', acc: '#e0b84a', cloth: ['#2f6a3a', '#1e4a28'], leather: '#4a3a24', gem: '#5fd38a', leaf: '#3f8a52' } },
  { id: 'nightleg', name: 'Штаны Ночной Тени', cls: ['archer'], tiers: [5], base: 'leather', boots: 'boot', knee: true, theme: { metal: '#4a4058', acc: '#b47aff', cloth: ['#2a1444', '#1a0e2e'], leather: '#2a2236', gem: '#c8a0ff', leaf: '#4a3a6a' } },
];
export const L_BY = Object.fromEntries(LEGS.map(h => [h.id, h]));

/** Ткань/металл по месту: заливка, узор, тень справа. view — чтобы узор лёг по-разному. */
export function fillMat(c, fn, base, P, col) {
  const fill = col || (base === 'shirt' ? P.cloth[0] : base === 'gambeson' ? P.cloth[1] : base === 'leather' ? P.leather : base === 'cloth' ? P.cloth[1] : base === 'robe' ? P.cloth[0] : base === 'fur' ? '#7a5a3a' : P.metal);
  if (P.glow && (base === 'plate' || base === 'scale')) { c.save(); c.shadowColor = P.glow; c.shadowBlur = 3; F(c, fn, fill, 0); c.restore(); }
  F(c, fn, fill, 0.7);
  c.save(); c.beginPath(); fn(); c.clip();
  if (base === 'gambeson') { c.strokeStyle = sh(fill, -0.3); c.lineWidth = 0.3; for (let x = -8; x <= 8; x += 1.3) { c.beginPath(); c.moveTo(x, -14); c.lineTo(x, 14); c.stroke(); } for (let y = -12; y < 14; y += 2.6) { c.beginPath(); c.moveTo(-8, y); c.lineTo(8, y); c.stroke(); } }
  if (base === 'leather') { c.strokeStyle = sh(fill, -0.4); c.lineWidth = 0.3; c.setLineDash([0.5, 0.5]); for (const x of [-3.2, 3.2]) { c.beginPath(); c.moveTo(x, -13); c.lineTo(x * 1.1, 3); c.stroke(); } c.setLineDash([]); }
  if (base === 'mail') { c.strokeStyle = sh(fill, -0.38); c.lineWidth = 0.22; for (let y = -14, r = 0; y < 14; y += 0.75, r++) for (let x = -9; x < 9; x += 0.85) { c.beginPath(); c.arc(x + (r % 2 ? 0.42 : 0), y, 0.36, 0, Math.PI); c.stroke(); } }
  if (base === 'scale') { for (let y = -14, r = 0; y < 14; y += 1.3, r++) for (let x = -9; x < 9; x += 1.5) { const xx = x + (r % 2 ? 0.75 : 0); F(c, () => { c.moveTo(xx - 0.75, y); c.quadraticCurveTo(xx - 0.75, y + 1.5, xx, y + 1.7); c.quadraticCurveTo(xx + 0.75, y + 1.5, xx + 0.75, y); }, (r + Math.round(x)) % 3 ? fill : sh(fill, 0.15), 0.22); } }
  if (base === 'plate') { c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(-5, -14, 1.3, 28); }
  if (base === 'fur') { c.strokeStyle = sh(fill, -0.35); c.lineWidth = 0.35; for (let y = -14; y < 14; y += 1.1) for (let x = -8; x < 8; x += 1.4) { c.beginPath(); c.moveTo(x + (y * 3 % 1.4), y); c.lineTo(x + (y * 3 % 1.4) + 0.3, y + 0.9); c.stroke(); } }
  if (base === 'robe') { c.strokeStyle = sh(fill, -0.22); c.lineWidth = 0.3; for (const x of [-2.6, 2.6]) { c.beginPath(); c.moveTo(x, -12); c.lineTo(x * 1.6, 14); c.stroke(); } }
  c.fillStyle = 'rgba(30,18,10,.2)'; c.fillRect(1.5, -20, 20, 40);
  c.restore();
}

// ------------------------------------------------------------------ кольца и шеи (только значки)
export const RINGS = [
  { id: 'band', name: 'Кольцо' }, { id: 'twist', name: 'Витое кольцо' }, { id: 'signet', name: 'Перстень-печатка' },
  { id: 'solitaire', name: 'Перстень с камнем' }, { id: 'trio', name: 'Перстень с тремя камнями' }, { id: 'claw', name: 'Когтистый перстень' },
  { id: 'crownring', name: 'Королевский перстень', epic: true, theme: { gem: '#c8a0ff' } }, { id: 'dragonring', name: 'Перстень Дракона', epic: true, theme: { gem: '#ff5a2a' } },   // v92
];
export const NECKS = [
  { id: 'fang', name: 'Клык на шнурке' }, { id: 'disk', name: 'Оберег' }, { id: 'medal', name: 'Медальон' },
  { id: 'chain', name: 'Цепь с подвеской' }, { id: 'torc', name: 'Гривна' }, { id: 'rune', name: 'Рунный камень' },
  { id: 'sunamulet', name: 'Амулет Солнца', epic: true, theme: { gem: '#ffb030' } }, { id: 'dragoneye', name: 'Око Дракона', epic: true, theme: { gem: '#5ad0ff' } },   // v92
];
const JMET = { start: '#b07a4a', common: '#b07a4a', good: '#c8ccd0', rare: '#e0b84a', epic: '#e7c35a' };
/** Кольцо на значке: в центре (0,0), размер ~ 20. */
export function drawRing(c, id, P) {
  const m = JMET[P.rar] || '#c8ccd0', g = P.gem || (P.rar === 'good' ? '#5fd35f' : null);
  c.save(); if (P.glow) { c.shadowColor = P.glow; c.shadowBlur = 5; }
  const band = (w) => { F(c, () => { c.ellipse(0, 3, 8, 5.4, 0, 0, 7); c.moveTo(6, 3); c.ellipse(0, 3, 6 - w * 0.3, 3.8 - w * 0.2, 0, 0, 7, true); }, m, 0.8); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 0.7; c.beginPath(); c.ellipse(0, 3, 7, 4.7, 0, Math.PI * 1.05, Math.PI * 1.55); c.stroke(); };
  c.restore();
  band(id === 'band' ? 2 : 3);
  if (id === 'twist') { c.strokeStyle = sh(m, -0.35); c.lineWidth = 0.6; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, x = Math.cos(a) * 7, y = 3 + Math.sin(a) * 4.6; c.beginPath(); c.moveTo(x - 0.5, y - 0.7); c.lineTo(x + 0.5, y + 0.7); c.stroke(); } }
  if (id === 'signet') { F(c, () => c.ellipse(0, -2, 4.4, 2.8, 0, 0, 7), m, 0.8); F(c, () => c.ellipse(0, -2.4, 3.2, 1.9, 0, 0, 7), sh(m, -0.25), 0.5); c.strokeStyle = sh(m, 0.4); c.lineWidth = 0.6; c.beginPath(); c.moveTo(-1.4, -2.4); c.lineTo(1.4, -2.4); c.moveTo(0, -3.6); c.lineTo(0, -1.2); c.stroke(); }
  if (id === 'solitaire' || id === 'claw') { if (id === 'claw') for (const x of [-2.2, 0, 2.2]) F(c, () => { c.moveTo(x - 0.6, -0.6); c.lineTo(x * 1.3, -6.4); c.lineTo(x + 0.6, -0.6); c.closePath(); }, m, 0.5); F(c, () => c.roundRect(-2.6, -2.2, 5.2, 2.2, 0.6), m, 0.6); gemBig(c, 0, -4.4, 3, g || '#e04848'); }
  if (id === 'crownring') { F(c, () => c.roundRect(-4.6, -2.6, 9.2, 2.6, 0.8), m, 0.6); for (const x of [-3.6, -1.8, 0, 1.8, 3.6]) F(c, () => { c.moveTo(x - 0.8, -2.4); c.lineTo(x, -6 - (x === 0 ? 1.8 : Math.abs(x) < 2 ? 0.8 : 0)); c.lineTo(x + 0.8, -2.4); c.closePath(); }, m, 0.4); gemBig(c, 0, -4, 2.4, g || '#c8a0ff'); gemBig(c, -3.4, -1.6, 1, '#ffffff'); gemBig(c, 3.4, -1.6, 1, '#ffffff'); }
  if (id === 'dragonring') { c.strokeStyle = O; c.lineWidth = 2.6; c.beginPath(); c.ellipse(0, 3, 7.6, 5, 0, 0, 7); c.stroke(); c.strokeStyle = '#3a2a2a'; c.lineWidth = 1.6; c.stroke(); c.strokeStyle = m; c.lineWidth = 0.5; c.setLineDash([0.8, 0.8]); c.stroke(); c.setLineDash([]);
    F(c, () => { c.moveTo(-5, -1); c.quadraticCurveTo(-4, -8, 0, -8.4); c.quadraticCurveTo(4, -8, 5, -1); c.quadraticCurveTo(0, -3.4, -5, -1); c.closePath(); }, '#3a2a2a', 0.6); for (const sx of [-1, 1]) F(c, () => { c.moveTo(sx * 2.4, -7.6); c.lineTo(sx * 4.6, -10.6); c.lineTo(sx * 3.6, -6.8); c.closePath(); }, m, 0.4); gemBig(c, 0, -4.6, 2.2, g || '#ff5a2a'); }
  if (id === 'trio') { F(c, () => c.roundRect(-5, -2.2, 10, 2.2, 0.8), m, 0.6); gemBig(c, -3.2, -3.4, 1.7, g || '#4a9eff'); gemBig(c, 3.2, -3.4, 1.7, g || '#4a9eff'); gemBig(c, 0, -4.2, 2.4, g || '#4a9eff'); }
  if (P.glow) { c.save(); c.globalCompositeOperation = 'lighter'; const gr = c.createRadialGradient(0, -3, 0.5, 0, -3, 9); gr.addColorStop(0, P.glow + '88'); gr.addColorStop(1, P.glow + '00'); c.fillStyle = gr; c.beginPath(); c.arc(0, -3, 9, 0, 7); c.fill(); c.restore(); }
}
function gemBig(c, x, y, r, col) {
  F(c, () => { for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.PI / 8; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.85); } c.closePath(); }, col, 0.6);
  F(c, () => { for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.PI / 8; c.lineTo(x + Math.cos(a) * r * 0.5, y - r * 0.1 + Math.sin(a) * r * 0.42); } c.closePath(); }, sh(col, 0.3), 0.3);
  c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.arc(x - r * 0.35, y - r * 0.35, r * 0.2, 0, 7); c.fill();
}
/** Шея на значке: шнурок/цепь сверху, подвеска внизу. */
export function drawNeck(c, id, P) {
  const m = JMET[P.rar] || '#c8ccd0', g = P.gem || (P.rar === 'good' ? '#5fd35f' : '#e04848');
  // шнурок или цепь дугой
  if (id === 'chain' || id === 'medal') { for (let i = 0; i <= 18; i++) { const a = Math.PI * (0.04 + i / 18 * 0.92), x = Math.cos(a) * 8, y = -3 + Math.sin(a) * 6.4; F(c, () => c.ellipse(x, y, 0.95, 0.6, a + Math.PI / 2 + (i % 2) * 0.6, 0, 7), m, 0.35); } }
  else if (id === 'torc') { F(c, () => { c.ellipse(0, -2, 8.6, 6.4, 0, Math.PI * 0.82, Math.PI * 2.18); c.ellipse(0, -2, 7, 5, 0, Math.PI * 2.18, Math.PI * 0.82, true); c.closePath(); }, m, 0.7); c.strokeStyle = sh(m, -0.3); c.lineWidth = 0.4; for (let i = 0; i < 16; i++) { const a = Math.PI * (0.85 + i / 16 * 1.3), x = Math.cos(a) * 7.8, y = -2 + Math.sin(a) * 5.7; c.beginPath(); c.moveTo(x - 0.4, y - 0.6); c.lineTo(x + 0.4, y + 0.6); c.stroke(); } for (const s of [-1, 1]) F(c, () => c.arc(s * 6.6, 2.2, 1.5, 0, 7), m, 0.6); }
  else { c.strokeStyle = O; c.lineWidth = 1.5; c.beginPath(); c.ellipse(0, -3, 8, 6.4, 0, Math.PI * 1.02, Math.PI * 1.98, true); c.stroke(); c.strokeStyle = id === 'fang' ? '#8a6a3a' : '#5a3a1c'; c.lineWidth = 0.8; c.stroke(); }
  if (id === 'fang') { F(c, () => c.rect(-1.4, 2.4, 2.8, 1.6), '#5a3a1c', 0.5); F(c, () => { c.moveTo(-1.6, 4); c.quadraticCurveTo(-1.8, 8.6, 1.4, 11.4); c.quadraticCurveTo(0.4, 7.4, 1.6, 4); c.closePath(); }, '#efe6d0', 0.6); for (const x of [-4, 4]) F(c, () => c.arc(x, 2.4, 0.9, 0, 7), m, 0.4); }
  if (id === 'disk') { F(c, () => c.arc(0, 6, 4.2, 0, 7), m, 0.7); c.strokeStyle = sh(m, -0.35); c.lineWidth = 0.5; c.beginPath(); c.arc(0, 6, 3, 0, 7); c.stroke(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; c.beginPath(); c.moveTo(0, 6); c.lineTo(Math.cos(a) * 2.8, 6 + Math.sin(a) * 2.8); c.stroke(); } }
  if (id === 'sunamulet') { for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; F(c, () => { c.moveTo(Math.cos(a - 0.15) * 4.4, 6.6 + Math.sin(a - 0.15) * 4.4); c.lineTo(Math.cos(a) * (i % 2 ? 6 : 7.6), 6.6 + Math.sin(a) * (i % 2 ? 6 : 7.6)); c.lineTo(Math.cos(a + 0.15) * 4.4, 6.6 + Math.sin(a + 0.15) * 4.4); c.closePath(); }, m, 0.3); } F(c, () => c.arc(0, 6.6, 4.6, 0, 7), m, 0.7); F(c, () => c.arc(0, 6.6, 3.4, 0, 7), sh(m, -0.2), 0.4); gemBig(c, 0, 6.6, 2.6, g || '#ffb030'); }
  if (id === 'dragoneye') { F(c, () => { c.moveTo(-6.4, 6.4); c.quadraticCurveTo(0, -0.6, 6.4, 6.4); c.quadraticCurveTo(0, 13.4, -6.4, 6.4); c.closePath(); }, m, 0.7); F(c, () => { c.moveTo(-4.6, 6.4); c.quadraticCurveTo(0, 1.6, 4.6, 6.4); c.quadraticCurveTo(0, 11.2, -4.6, 6.4); c.closePath(); }, g || '#5ad0ff', 0.5); F(c, () => c.ellipse(0, 6.4, 0.9, 3.4, 0, 0, 7), '#0a0806', 0.3); c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.arc(-1.6, 4.8, 0.7, 0, 7); c.fill(); for (const sx of [-1, 1]) F(c, () => { c.moveTo(sx * 6.4, 6.4); c.lineTo(sx * 9, 4); c.lineTo(sx * 8.4, 7.4); c.closePath(); }, m, 0.4); }
  if (id === 'medal') { F(c, () => c.arc(0, 6.4, 4.6, 0, 7), m, 0.7); F(c, () => c.arc(0, 6.4, 3.4, 0, 7), sh(m, -0.2), 0.4); gemBig(c, 0, 6.4, 2.2, g); }
  if (id === 'chain') { F(c, () => { c.moveTo(0, 2.4); c.lineTo(3, 6.6); c.lineTo(0, 12); c.lineTo(-3, 6.6); c.closePath(); }, m, 0.6); gemBig(c, 0, 7, 2, g); }
  if (id === 'rune') { F(c, () => { c.moveTo(-3, 3); c.lineTo(3.4, 2.4); c.lineTo(4, 9); c.lineTo(0, 11.2); c.lineTo(-3.8, 8.6); c.closePath(); }, '#8a8478', 0.7); c.save(); c.strokeStyle = P.etch || '#7ec8ff'; c.lineWidth = 0.7; if (P.glow || P.etch) { c.shadowColor = P.glow || '#4a9eff'; c.shadowBlur = 3; } c.beginPath(); c.moveTo(-1, 4.4); c.lineTo(-1, 9.4); c.moveTo(-1, 5.4); c.lineTo(1.6, 6.8); c.lineTo(-1, 8); c.stroke(); c.restore(); }
  if (P.glow) { c.save(); c.globalCompositeOperation = 'lighter'; const gr = c.createRadialGradient(0, 6, 0.5, 0, 6, 9); gr.addColorStop(0, P.glow + '88'); gr.addColorStop(1, P.glow + '00'); c.fillStyle = gr; c.beginPath(); c.arc(0, 6, 9, 0, 7); c.fill(); c.restore(); }
}

// ------------------------------------------------------------------ вещь → облик
/** Ярус облика 0..4 (как visTier в игре). */
export const visTier = (ilvl, rar) => rar === 'start' ? 0 : rar === 'epic' ? 5 : Math.max(1, Math.min(4, { common: 0, good: 1, rare: 2 }[rar] + Math.floor(ilvl / 8)));   // v92: фиолетовые — свой ярус 5
/** Зерно вещи: из id (старые вещи) или своё. */
export function seedOf(it) { if (it.seed) return it.seed; let h = 7; for (const ch of String(it.id || 'x')) h = (h * 31 + ch.charCodeAt(0)) % 2147483647; return h || 7; }
const LIST = { weapon: () => WEAPONS, head: () => HELMS, chest: () => CHESTS, legs: () => LEGS, ring: () => RINGS, neck: () => NECKS };
/** Какую модель взять для новой вещи: по классу и ярусу, выбор по зерну. */
export function pickModel(slot, cls, tier, seed) {
  const all = LIST[slot]().filter(m => !m.npc && (slot === 'ring' || slot === 'neck' || (m.cls || ['warrior']).includes(cls)) && (slot === 'ring' || slot === 'neck' ? !!m.epic === (tier === 5) : true));
  const pool = all.filter(m => !m.tiers || m.tiers.includes(tier));
  const L = pool.length ? pool : all; return L[Math.floor(rng(seed)() * L.length)].id;
}
const BY = { weapon: W_BY, head: H_BY, chest: C_BY, legs: L_BY, ring: Object.fromEntries(RINGS.map(m => [m.id, m])), neck: Object.fromEntries(NECKS.map(m => [m.id, m])) };
export const modelOf = (slot, id) => BY[slot] && BY[slot][id];
/** Облик вещи: модель (сохранена в вещи или подобрана) и расцветка. */
export function itemLook(it, cls = it.cls || 'warrior') {
  const tier = visTier(it.ilvl || 1, it.rar), seed = seedOf(it);
  const m = it.m && modelOf(it.slot, it.m) && isEpicModel(it.slot, it.m) === (it.rar === 'epic') ? it.m : pickModel(it.slot, cls, tier, seed);
  return { m, P: themed(palette(it.rar, seed, tier), modelOf(it.slot, m)), tier, key: it.slot + ':' + m + ':' + it.rar + ':' + seed };
}
/** v92: у фиолетовой модели своя расцветка (theme) поверх общей. */
export function themed(P, md) {
  if (!md || !md.theme) return P; const Q = { ...P, ...md.theme };
  if (md.theme.gem && !md.theme.orb) Q.orb = md.theme.gem; Q.edge = sh(Q.metal || '#999999', 0.45); Q.dark = sh(Q.metal || '#999999', -0.35); return Q;
}
/** Модель — из героического набора (ярус 5)? */
export const isEpicModel = (slot, id) => { const md = modelOf(slot, id); return !!md && (!!md.epic || !!(md.tiers && md.tiers.includes(5))); };
/** Живой эффект вещи (огонь, иней, руны, листья, искры, звёзды) — у героических моделей. */
export const fxOf = (slot, id) => { const md = modelOf(slot, id); return md && md.fx || null; };
