// Горное дело (v61): скалы и пригорки, рудные жилы (медь, олово), блеск, выкопанная жила.
// Масштаб: 1 рост ≈ 42. Жила — выход породы 1–1,5 роста, скала у края — 2–3 роста.
const O = '#24180f';
const rnd = s => () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
function hp(g, fn, fill, lw = 1.6) { g.beginPath(); fn(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = O; g.lineWidth = lw; g.stroke(); } }
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v * k))); return '#' + ((1 << 24) | (f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1); };

/** Металлы: цвет прожилок, самородков и блеска. */
export const METAL = {
  copper: { name: 'Медь', vein: '#c8703a', hi: '#f0a060', nug: '#7fb88a', glint: '255,190,120', rock: '#8c8478' },
  tin:    { name: 'Олово', vein: '#c9ced4', hi: '#f4f8fb', nug: '#9aa6b2', glint: '230,240,255', rock: '#867f74' },
};

/** Гранёная глыба: светлый верх, тёмный правый бок. w — ширина основания, h — высота. Возвращает точки верхнего контура. */
function crag(g, w, h, base, seed) {
  const r = rnd(seed), n = 9, top = [];
  for (let k = 0; k < n; k++) { const q = k / (n - 1), x = -w / 2 + q * w, y = -h * Math.sin(Math.PI * Math.min(1, q * 1.08)) * (0.75 + r() * 0.35); top.push([x, Math.min(0, y)]); }
  g.fillStyle = 'rgba(20,12,6,.28)'; g.beginPath(); g.ellipse(w * 0.12, 3, w * 0.6, w * 0.16, 0, 0, 7); g.fill();
  const body = () => { g.moveTo(-w / 2, 0); for (const p of top) g.lineTo(p[0], p[1]); g.lineTo(w / 2, 0); g.quadraticCurveTo(0, w * 0.12, -w / 2, 0); };
  hp(g, body, base, 1.8);
  g.save(); g.beginPath(); body(); g.clip();
  // грани: светлый верх-лево, тёмный правый бок
  const peak = top.reduce((a, p) => p[1] < a[1] ? p : a, top[0]);
  g.fillStyle = shade(base, 1.2); g.beginPath(); g.moveTo(-w / 2, 0); for (const p of top) { if (p[0] > peak[0]) break; g.lineTo(p[0], p[1]); } g.lineTo(peak[0] - w * 0.05, peak[1] + h * 0.45); g.lineTo(-w * 0.32, -h * 0.05); g.closePath(); g.fill();
  g.fillStyle = shade(base, 0.74); g.beginPath(); g.moveTo(peak[0], peak[1]); for (const p of top) if (p[0] > peak[0]) g.lineTo(p[0], p[1]); g.lineTo(w / 2, 0); g.lineTo(w * 0.1, w * 0.06); g.lineTo(peak[0] + w * 0.05, peak[1] + h * 0.5); g.closePath(); g.fill();
  // трещины
  g.strokeStyle = 'rgba(36,24,15,.4)'; g.lineWidth = 1.2;
  for (let i = 0; i < 4; i++) { let x = -w * 0.35 + r() * w * 0.7, y = -h * (0.15 + r() * 0.5); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 3; k++) { x += (r() - 0.5) * 14; y += 6 + r() * 6; g.lineTo(x, y); } g.stroke(); }
  g.restore();
  hp(g, body, null, 1.8);
  return { top, peak, body };
}

/** Рудная жила. metal — copper/tin. left — сколько ударов осталось (0 — выкопана, остаётся щебень). */
export function vein(g, metal, seed = 3, left = 1) {
  const M = METAL[metal], r = rnd(seed + 11), w = 78, h = 50;
  if (left <= 0) { // выкопанная: щебень на месте
    g.fillStyle = 'rgba(20,12,6,.2)'; g.beginPath(); g.ellipse(4, 2, 40, 10, 0, 0, 7); g.fill();
    for (let i = 0; i < 14; i++) { const x = (r() - 0.5) * 70, y = (r() - 0.5) * 14, s = 3 + r() * 5; hp(g, () => g.ellipse(x, y, s, s * 0.7, 0, 0, 7), i % 3 ? shade(M.rock, 0.95) : shade(M.rock, 1.15), 1); }
    return;
  }
  const { body } = crag(g, w, h, M.rock, seed);
  // прожилки металла — внутри камня, ломаными линиями по склону
  g.save(); g.beginPath(); body(); g.clip(); g.lineCap = 'round'; g.lineJoin = 'round';
  for (let i = 0; i < 3; i++) {
    let x = -w * 0.38 + i * w * 0.18 + r() * 8, y = -h * (0.12 + r() * 0.2); const pts = [[x, y]];
    for (let k = 0; k < 4; k++) { x += 7 + r() * 8; y -= 3 + r() * 7; pts.push([x, y]); }
    for (const [lw, col] of [[4.2, shade(M.vein, 0.55)], [2.6, M.vein], [0.9, M.hi]]) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); pts.forEach((p, k) => k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); }
  }
  // самородки
  for (let i = 0; i < 4; i++) { const x = -w * 0.25 + r() * w * 0.5, y = -h * (0.12 + r() * 0.45), s = 2.6 + r() * 2.4;
    hp(g, () => { g.moveTo(x - s, y); g.lineTo(x - s * 0.3, y - s); g.lineTo(x + s, y - s * 0.4); g.lineTo(x + s * 0.6, y + s * 0.7); g.closePath(); }, i % 2 ? M.vein : M.nug, 1);
    g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(x - s * 0.4, y - s * 0.6, 1.4, 1.4); }
  g.restore();
  // мелкие камни у подножия
  for (let i = 0; i < 5; i++) { const x = (r() - 0.5) * w * 1.1, y = 2 + r() * 6, s = 2.5 + r() * 3; hp(g, () => g.ellipse(x, y, s, s * 0.7, 0, 0, 7), shade(M.rock, 1.05), 1); }
}

/** Блеск жилы — рисуется поверх каждый кадр (видно издалека, если присмотреться). */
export function glint(g, metal, t, seed = 0) {
  const M = METAL[metal], q = (t * 0.6 + seed * 0.37) % 1; if (q > 0.35) return;
  const a = Math.sin(q / 0.35 * Math.PI), x = -14 + (seed * 13 % 28), y = -32 + (seed * 7 % 12), s = 7 * a;
  g.fillStyle = `rgba(${M.glint},${0.9 * a})`;
  g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s * 0.22, y - s * 0.22); g.lineTo(x + s, y); g.lineTo(x + s * 0.22, y + s * 0.22); g.lineTo(x, y + s); g.lineTo(x - s * 0.22, y + s * 0.22); g.lineTo(x - s, y); g.lineTo(x - s * 0.22, y - s * 0.22); g.closePath(); g.fill();
}

/** Скала или пригорок у края зоны: 2–3 роста, несколько глыб, мох; в ней может сидеть жила. */
export function outcrop(g, w = 170, h = 110, seed = 5, moss = true) {
  const r = rnd(seed);
  g.save(); g.translate(w * 0.28, 6); crag(g, w * 0.55, h * 0.55, '#7f786c', seed + 3); g.restore();
  const { top } = crag(g, w, h, '#8a8276', seed);
  g.save(); g.translate(-w * 0.34, 10); crag(g, w * 0.4, h * 0.4, '#857d70', seed + 7); g.restore();
  if (moss) { g.fillStyle = 'rgba(96,130,60,.75)'; for (let i = 0; i < 5; i++) { const p = top[1 + Math.floor(r() * 5)]; g.beginPath(); g.ellipse(p[0] + (r() - 0.5) * 10, p[1] + 4, 9 + r() * 8, 3.5, (r() - 0.5) * 0.4, 0, 7); g.fill(); } }
  for (let i = 0; i < 8; i++) { const x = (r() - 0.5) * w * 1.2, y = 8 + r() * 10, s = 3 + r() * 4; hp(g, () => g.ellipse(x, y, s, s * 0.7, 0, 0, 7), '#958d80', 1); }
}
