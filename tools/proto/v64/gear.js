// Эскиз v64: снаряжение моделями (как в WoW) — оружие, шлемы, нагрудники, штаны, кольца, шеи.
// Один рисунок на всё: в руке, на теле, значок в сумке. Расцветка — от цвета вещи и её случайного «зерна».
// Единицы — как у тела героя: рост ≈ 36, хват оружия в точке (0,0), оружие смотрит вверх (−y).
export const O = '#24180f';
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
    epic:   { metal: pick(r, ['#5b5470', '#4e5068']), acc: '#e7c35a', wood: '#2a1a2a', wrap: pick(r, ['#3a1f5a', '#1a1a2a']), cloth: pick(r, [['#3a1f5a', '#2a1444'], ['#1e1a40', '#14122e']]), leather: '#2a1a24', gem: '#c58bff', glow: '#b46aff', etch: '#d6b0ff' },
  }[rar] || {};
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

// ------------------------------------------------------------------ оружие Воина
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
  }
}

// ------------------------------------------------------------------ нагрудники и штаны Воина
export const CHESTS = [
  { id: 'shirt', name: 'Рубаха', tiers: [0], base: 'shirt', pauld: null, sleeve: 'cloth' },
  { id: 'gambeson', name: 'Стёганка', tiers: [1], base: 'gambeson', pauld: null, sleeve: 'cloth' },
  { id: 'jerkin', name: 'Кожаная куртка', tiers: [1, 2], base: 'leather', pauld: 'leather', sleeve: 'cloth' },
  { id: 'hauberk', name: 'Кольчуга', tiers: [2, 3], base: 'mail', pauld: null, sleeve: 'mail' },
  { id: 'scale', name: 'Чешуйчатый доспех', tiers: [2, 3], base: 'scale', pauld: 'scale', sleeve: 'mail' },
  { id: 'brig', name: 'Бригантина с накидкой', tiers: [3], base: 'mail', tabard: true, pauld: 'plate', sleeve: 'mail' },
  { id: 'cuirass', name: 'Кираса', tiers: [3, 4], base: 'plate', pauld: 'plate', sleeve: 'plate' },
  { id: 'plate', name: 'Латы', tiers: [4], base: 'plate', pauld: 'big', sleeve: 'plate', cape: true },
];
export const C_BY = Object.fromEntries(CHESTS.map(h => [h.id, h]));
export const LEGS = [
  { id: 'trousers', name: 'Холщовые штаны', tiers: [0, 1], base: 'cloth', boots: 'shoe' },
  { id: 'leggings', name: 'Кожаные штаны', tiers: [1, 2], base: 'leather', boots: 'boot' },
  { id: 'chausses', name: 'Кольчужные поножи', tiers: [2, 3], base: 'mail', boots: 'boot', knee: true },
  { id: 'greaves', name: 'Латные поножи', tiers: [3, 4], base: 'plate', boots: 'sabaton', knee: true },
];
export const L_BY = Object.fromEntries(LEGS.map(h => [h.id, h]));

/** Ткань/металл по месту: заливка, узор, тень справа. view — чтобы узор лёг по-разному. */
export function fillMat(c, fn, base, P, col) {
  const fill = col || (base === 'shirt' ? P.cloth[0] : base === 'gambeson' ? P.cloth[1] : base === 'leather' ? P.leather : base === 'cloth' ? P.cloth[1] : P.metal);
  if (P.glow && (base === 'plate' || base === 'scale')) { c.save(); c.shadowColor = P.glow; c.shadowBlur = 3; F(c, fn, fill, 0); c.restore(); }
  F(c, fn, fill, 0.7);
  c.save(); c.beginPath(); fn(); c.clip();
  if (base === 'gambeson') { c.strokeStyle = sh(fill, -0.3); c.lineWidth = 0.3; for (let x = -8; x <= 8; x += 1.3) { c.beginPath(); c.moveTo(x, -14); c.lineTo(x, 14); c.stroke(); } for (let y = -12; y < 14; y += 2.6) { c.beginPath(); c.moveTo(-8, y); c.lineTo(8, y); c.stroke(); } }
  if (base === 'leather') { c.strokeStyle = sh(fill, -0.4); c.lineWidth = 0.3; c.setLineDash([0.5, 0.5]); for (const x of [-3.2, 3.2]) { c.beginPath(); c.moveTo(x, -13); c.lineTo(x * 1.1, 3); c.stroke(); } c.setLineDash([]); }
  if (base === 'mail') { c.strokeStyle = sh(fill, -0.38); c.lineWidth = 0.22; for (let y = -14, r = 0; y < 14; y += 0.75, r++) for (let x = -9; x < 9; x += 0.85) { c.beginPath(); c.arc(x + (r % 2 ? 0.42 : 0), y, 0.36, 0, Math.PI); c.stroke(); } }
  if (base === 'scale') { for (let y = -14, r = 0; y < 14; y += 1.3, r++) for (let x = -9; x < 9; x += 1.5) { const xx = x + (r % 2 ? 0.75 : 0); F(c, () => { c.moveTo(xx - 0.75, y); c.quadraticCurveTo(xx - 0.75, y + 1.5, xx, y + 1.7); c.quadraticCurveTo(xx + 0.75, y + 1.5, xx + 0.75, y); }, (r + Math.round(x)) % 3 ? fill : sh(fill, 0.15), 0.22); } }
  if (base === 'plate') { c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(-5, -14, 1.3, 28); }
  c.fillStyle = 'rgba(30,18,10,.2)'; c.fillRect(1.5, -20, 20, 40);
  c.restore();
}

// ------------------------------------------------------------------ кольца и шеи (только значки)
export const RINGS = [
  { id: 'band', name: 'Кольцо' }, { id: 'twist', name: 'Витое кольцо' }, { id: 'signet', name: 'Перстень-печатка' },
  { id: 'solitaire', name: 'Перстень с камнем' }, { id: 'trio', name: 'Перстень с тремя камнями' }, { id: 'claw', name: 'Когтистый перстень' },
];
export const NECKS = [
  { id: 'fang', name: 'Клык на шнурке' }, { id: 'disk', name: 'Оберег' }, { id: 'medal', name: 'Медальон' },
  { id: 'chain', name: 'Цепь с подвеской' }, { id: 'torc', name: 'Гривна' }, { id: 'rune', name: 'Рунный камень' },
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
  if (id === 'medal') { F(c, () => c.arc(0, 6.4, 4.6, 0, 7), m, 0.7); F(c, () => c.arc(0, 6.4, 3.4, 0, 7), sh(m, -0.2), 0.4); gemBig(c, 0, 6.4, 2.2, g); }
  if (id === 'chain') { F(c, () => { c.moveTo(0, 2.4); c.lineTo(3, 6.6); c.lineTo(0, 12); c.lineTo(-3, 6.6); c.closePath(); }, m, 0.6); gemBig(c, 0, 7, 2, g); }
  if (id === 'rune') { F(c, () => { c.moveTo(-3, 3); c.lineTo(3.4, 2.4); c.lineTo(4, 9); c.lineTo(0, 11.2); c.lineTo(-3.8, 8.6); c.closePath(); }, '#8a8478', 0.7); c.save(); c.strokeStyle = P.etch || '#7ec8ff'; c.lineWidth = 0.7; if (P.glow || P.etch) { c.shadowColor = P.glow || '#4a9eff'; c.shadowBlur = 3; } c.beginPath(); c.moveTo(-1, 4.4); c.lineTo(-1, 9.4); c.moveTo(-1, 5.4); c.lineTo(1.6, 6.8); c.lineTo(-1, 8); c.stroke(); c.restore(); }
  if (P.glow) { c.save(); c.globalCompositeOperation = 'lighter'; const gr = c.createRadialGradient(0, 6, 0.5, 0, 6, 9); gr.addColorStop(0, P.glow + '88'); gr.addColorStop(1, P.glow + '00'); c.fillStyle = gr; c.beginPath(); c.arc(0, 6, 9, 0, 7); c.fill(); c.restore(); }
}

// ------------------------------------------------------------------ вещь → облик
/** Ярус облика 0..4 (как visTier в игре). */
export const visTier = (ilvl, rar) => rar === 'start' ? 0 : Math.max(1, Math.min(4, { common: 0, good: 1, rare: 2, epic: 3 }[rar] + Math.floor(ilvl / 8)));
/** Модель и расцветка вещи: по ярусу — подходящие модели, выбор по зерну вещи. */
export function itemLook(it) {
  const tier = visTier(it.ilvl, it.rar), r = rng(it.seed);
  const list = { weapon: WEAPONS, head: HELMS, chest: CHESTS, legs: LEGS, ring: RINGS, neck: NECKS }[it.slot];
  const pool = list.filter(m => !m.npc && (!m.tiers || m.tiers.includes(tier)));
  const m = (pool.length ? pool : list.filter(m => !m.npc))[Math.floor(r() * (pool.length || 1))];
  return { m: m.id, name: m.name, P: palette(it.rar, it.seed, tier), tier };
}
