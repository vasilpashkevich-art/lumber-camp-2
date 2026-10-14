// v98: оружие в мультяшном стиле (STYLE.md) — пухлые формы, толстые древки и обухи, цветная обводка, глянец и блик.
// Те же модели и размеры, что в gear.js: хват в (0,0), оружие смотрит вверх (−y), лук — плечи вверх-вниз, тетива слева.
// Одна функция на всё: в руке, значок в сумке, окно героя. P — расцветка вещи (palette/theme), o — { t, glow, pull, arrow }.
const sh = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join(''); };
const TAU = Math.PI * 2, LW = 0.85;
const hex = (s, d = '#8a8a8a') => typeof s === 'string' && s[0] === '#' && s.length === 7 ? s : d;
const ink = col => sh(hex(col), -0.6);

// ---------------------------------------------------------------- кисти
function fill(c, path, col, lw = LW) { col = hex(col); c.beginPath(); path(); c.fillStyle = col; c.fill(); if (lw) { c.strokeStyle = ink(col); c.lineWidth = lw; c.lineJoin = 'round'; c.stroke(); } }
/** Глянцевый металл: свет слева сверху, тень справа снизу, обводка тоном металла. */
function metal(c, path, col, x0 = -4, y0 = -8, x1 = 5, y1 = 2) {
  col = hex(col); const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, sh(col, 0.42)); g.addColorStop(0.45, col); g.addColorStop(1, sh(col, -0.32));
  c.beginPath(); path(); c.fillStyle = g; c.fill(); c.strokeStyle = ink(col); c.lineWidth = LW; c.lineJoin = 'round'; c.stroke();
}
const shine = (c, x, y, rx, ry, a = 0.5, rot = -0.4) => { c.fillStyle = `rgba(255,255,255,${a})`; c.beginPath(); c.ellipse(x, y, Math.max(0.05, rx), Math.max(0.05, ry), rot, 0, TAU); c.fill(); };
const streak = (c, pts, w = 0.5, a = 0.6) => { c.strokeStyle = `rgba(255,255,255,${a})`; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); };
const edge = (c, pts, col, w = 0.75) => { c.strokeStyle = sh(hex(col), 0.55); c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); };
function rivet(c, x, y, r = 0.55, col = '#d8dce4') { fill(c, () => c.arc(x, y, r, 0, TAU), col, 0.35); shine(c, x - r * 0.3, y - r * 0.3, r * 0.3, r * 0.3, 0.9); }
/** Самоцвет: круглый, грани светлее сверху, блик. */
function gem(c, x, y, r, col) {
  if (!col) return; col = hex(col);
  const g = c.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r); g.addColorStop(0, sh(col, 0.55)); g.addColorStop(0.6, col); g.addColorStop(1, sh(col, -0.35));
  c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = g; c.fill(); c.strokeStyle = ink(col); c.lineWidth = 0.45; c.stroke(); shine(c, x - r * 0.35, y - r * 0.38, r * 0.32, r * 0.2, 0.95);
}
/** Древко: от низа b до верха top, толщина w; обмотка от w0 до w1; набалдашник снизу. */
function haft(c, b, top, w, P, w0, w1, metalHaft = false, knob = true) {
  w *= 1.12;
  const col = hex(metalHaft ? sh(hex(P.metal), -0.2) : P.wood, '#7a5230');
  const g = c.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, sh(col, 0.28)); g.addColorStop(0.5, col); g.addColorStop(1, sh(col, -0.28));
  c.beginPath(); c.roundRect(-w / 2, top, w, b - top, w / 2); c.fillStyle = g; c.fill(); c.strokeStyle = ink(col); c.lineWidth = LW; c.stroke();
  streak(c, [[-w * 0.2, b - 0.8], [-w * 0.2, top + 0.8]], w * 0.18, 0.35);
  if (w0 != null && w0 > w1) { const wc = hex(P.wrap, '#5a3418'); fill(c, () => c.roundRect(-w / 2 - 0.25, w1, w + 0.5, w0 - w1, 0.5), wc, 0.5); c.strokeStyle = sh(wc, -0.35); c.lineWidth = 0.35; for (let y = w1 + 0.8; y < w0 - 0.2; y += 1) { c.beginPath(); c.moveTo(-w / 2, y + 0.4); c.lineTo(w / 2, y - 0.3); c.stroke(); } }
  if (knob) { fill(c, () => c.ellipse(0, b + 0.2, w * 0.7, w * 0.55, 0, 0, TAU), hex(P.acc, '#8a7a5a'), 0.5); shine(c, -w * 0.2, b - 0.05, w * 0.2, w * 0.14, 0.7); }
}
/** Обойма-кольцо на древке. */
const band = (c, y, w, h, col) => { fill(c, () => c.roundRect(-w / 2, y, w, h, Math.min(h, w) / 2.2), hex(col, '#b89a50'), 0.5); shine(c, -w * 0.22, y + h * 0.3, w * 0.18, h * 0.2, 0.6, 0); };
/** Свет на вершине посоха (как раньше): слабо всегда, ярко — при заклинании. */
function tipGlow(c, x, y, r, P, o) {
  const k = (o && o.glow) || 0, R = r * (1.6 + k * 1.6), col = hex(P.glow || P.orb || P.gem, '#9ad0ff');
  if (P.rar === 'start' && !k) return;
  const g = c.createRadialGradient(x, y, 0.3, x, y, R); g.addColorStop(0, col + (k > 0.3 ? 'cc' : '77')); g.addColorStop(1, col + '00'); c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
}
/** Шар-кристалл навершия. */
function orb(c, x, y, r, col) { gem(c, x, y, r, col); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 0.35; c.beginPath(); c.arc(x, y, r * 0.62, 2.4, 4.2); c.stroke(); }
/** Рукоять меча: обмотка, гарда, навершие. */
function hilt(c, P, len, guardW, guard = 'bar', pommel = 'ball') {
  const acc = hex(P.acc, '#b89a50');
  if (pommel === 'ball') gem(c, 0, len + 1.1, 1.35, acc); else fill(c, () => { c.moveTo(0, len - 0.2); c.lineTo(1.5, len + 1.2); c.lineTo(0, len + 2.6); c.lineTo(-1.5, len + 1.2); c.closePath(); }, acc, 0.5);
  haft(c, len, -1.8, 1.8, P, len, -1.8, false, false);
  if (guard === 'bar') { fill(c, () => c.roundRect(-guardW, -3.4, guardW * 2, 1.9, 0.95), acc, 0.55); for (const s of [-1, 1]) gem(c, s * guardW, -2.45, 1.05, acc); }
  else if (guard === 'wing') fill(c, () => { c.moveTo(-guardW, -1.6); c.quadraticCurveTo(-guardW * 0.8, -3.9, -1.4, -3.4); c.lineTo(1.4, -3.4); c.quadraticCurveTo(guardW * 0.8, -3.9, guardW, -1.6); c.quadraticCurveTo(guardW * 0.5, -2.2, 0, -2); c.quadraticCurveTo(-guardW * 0.5, -2.2, -guardW, -1.6); c.closePath(); }, acc, 0.55);
  shine(c, -guardW * 0.5, -2.9, guardW * 0.25, 0.3, 0.55, 0);
}
/** Клинок: ширина w у гарды, длина до острия tip; fuller — дол посередине. */
function blade(c, P, w, tip, opt = {}) {
  w *= 1.22;
  const m = hex(P.metal), bend = opt.bend || 0;
  const path = () => { c.moveTo(-w, -3.4); c.lineTo(-w * 0.94, tip + w * 2.4); c.quadraticCurveTo(-w * 0.6 + bend, tip + w * 0.6, bend, tip); c.quadraticCurveTo(w * 0.6 + bend, tip + w * 0.6, w * 0.94 + bend * 0.6, tip + w * 2.4); c.lineTo(w, -3.4); c.closePath(); };
  metal(c, path, m, -w, 0, w, 0);
  if (opt.fuller !== false) { c.strokeStyle = sh(m, -0.3); c.lineWidth = Math.max(0.5, w * 0.35); c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -4.4); c.lineTo(bend * 0.4, tip + w * 3.4); c.stroke(); c.strokeStyle = sh(m, 0.3); c.lineWidth = 0.3; c.beginPath(); c.moveTo(-w * 0.18, -4.4); c.lineTo(-w * 0.18 + bend * 0.4, tip + w * 3.4); c.stroke(); }
  streak(c, [[-w * 0.62, -4.6], [-w * 0.58, tip + w * 2.6]], 0.55, 0.65);
  if (P.etch && opt.runes !== false) { c.strokeStyle = P.etch; c.lineWidth = 0.4; for (let y = -6.4; y > tip + w * 4; y -= 2.6) { c.beginPath(); c.moveTo(-0.45, y - 0.6); c.lineTo(0, y + 0.6); c.lineTo(0.45, y - 0.3); c.stroke(); } }
  return path;
}
/** Лезвие топора на +x: от обуха (x0) до выпуклого края; top/bot — по высоте, R — вынос. */
function axeHead(c, P, x0, top, bot, R, beard = 0) {
  R *= 1.08;
  const m = hex(P.metal), mid = (top + bot) / 2, h = bot - top;
  const path = () => { c.moveTo(x0, top + h * 0.12); c.quadraticCurveTo(x0 + R * 0.45, top + h * 0.05, x0 + R * 0.9, top - h * 0.12); c.quadraticCurveTo(x0 + R * 1.22, mid, x0 + R * 0.9 - beard * 0.3, bot + h * 0.12 + beard); c.quadraticCurveTo(x0 + R * 0.5, bot - h * 0.05, x0, bot - h * 0.12); c.closePath(); };
  metal(c, path, m, x0, top, x0 + R, bot);
  edge(c, [[x0 + R * 0.88, top - h * 0.06], [x0 + R * 1.12, mid], [x0 + R * 0.86 - beard * 0.3, bot + h * 0.06 + beard]], m, 0.8);
  shine(c, x0 + R * 0.4, top + h * 0.3, R * 0.16, h * 0.12, 0.5);
  if (P.etch) { c.strokeStyle = P.etch; c.lineWidth = 0.4; c.beginPath(); c.moveTo(x0 + R * 0.4, mid - 1.4); c.lineTo(x0 + R * 0.55, mid); c.lineTo(x0 + R * 0.4, mid + 1.4); c.stroke(); }
}
/** Лук: bh — половина высоты, kind — форма плеч (0 простой … 6 ветер). */
function bow(c, P, o = {}, bh, kind) {
  const pull = o.pull || 0, col = hex([P.wood, P.wood, sh(hex(P.wood), -0.1), P.wood, '#d8c8a0', sh(hex(P.wood), -0.25), P.leaf][kind], '#7a5230');
  const recurve = kind === 2 || kind === 6, tipX = recurve ? 1.6 : -2.2, thick = kind === 5 ? 3.1 : kind === 3 ? 2.5 : 2.7;
  const limb = s => { c.beginPath(); c.moveTo(0.6, 0); if (recurve) { c.quadraticCurveTo(5, s * bh * 0.45, 1.6, s * bh * 0.9); c.quadraticCurveTo(0.4, s * bh * 1.02, tipX, s * bh); } else c.quadraticCurveTo(5 + (kind === 5 ? 0.8 : 0), s * bh * 0.55, tipX, s * bh); };
  const sx = tipX - pull * 8;
  c.strokeStyle = '#f2ead6'; c.lineWidth = 0.45; c.beginPath(); c.moveTo(tipX, -bh); c.lineTo(sx, 0); c.lineTo(tipX, bh); c.stroke();
  for (const s of [-1, 1]) {
    limb(s); c.lineCap = 'round'; c.strokeStyle = ink(col); c.lineWidth = thick + 1.2; c.stroke();
    limb(s); c.strokeStyle = col; c.lineWidth = thick; c.stroke();
    limb(s); c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = thick * 0.3; c.stroke();
    if (kind === 4) { limb(s); c.strokeStyle = 'rgba(60,40,20,.45)'; c.lineWidth = 0.5; c.setLineDash([1.2, 1.4]); c.stroke(); c.setLineDash([]); }
    if (kind === 6) { limb(s); c.strokeStyle = hex(P.etch || P.orb, '#bfe6ff'); c.lineWidth = 0.45; c.stroke(); }
    if (kind >= 3) gem(c, tipX, s * bh, 0.8, kind === 5 ? P.metal : P.acc);
    else fill(c, () => c.arc(tipX, s * bh, 0.6, 0, TAU), sh(col, -0.25), 0.35);
  }
  fill(c, () => c.roundRect(-0.6, -2.6, 2.8, 5.2, 1.1), kind === 0 ? sh(col, -0.2) : hex(P.wrap, '#5a3418'), 0.5);
  c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 0.3; for (let y = -1.8; y < 2.4; y += 1) { c.beginPath(); c.moveTo(-0.5, y); c.lineTo(2.1, y - 0.5); c.stroke(); }
  if (kind >= 5 && P.gem) gem(c, 2.8, 0, 0.9, P.gem);
  if (o.arrow && pull > 0.05) { c.strokeStyle = '#5a3a1c'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(sx, 0); c.lineTo(8.2, 0); c.stroke(); c.strokeStyle = '#d8c090'; c.lineWidth = 0.7; c.stroke();
    metal(c, () => { c.moveTo(11, 0); c.lineTo(8, -1.4); c.lineTo(8.6, 0); c.lineTo(8, 1.4); c.closePath(); }, '#cfd8de'); fill(c, () => { c.moveTo(sx, 0); c.lineTo(sx + 2, -1.2); c.lineTo(sx + 2.4, 0); c.lineTo(sx + 2, 1.2); c.closePath(); }, '#d84a3a', 0.35); }
}

// ---------------------------------------------------------------- модели (id → рисунок)
export const TOON_WEAPONS = {
  // --- Воин: топоры
  hatchet(c, P) { haft(c, 4.6, -15, 2.1, P, 2.4, -1.6); axeHead(c, P, 0.9, -15.6, -9.6, 5.2); metal(c, () => c.roundRect(-2.3, -15.2, 1.9, 4, 0.8), sh(hex(P.metal), -0.25)); band(c, -15.8, 2.8, 1.2, P.acc); },
  bearded(c, P) { haft(c, 4.8, -17, 2.2, P, 2.6, -1.8); axeHead(c, P, 1, -17.4, -10.6, 6.2, 3.2); band(c, -17.6, 2.9, 6.6, P.acc); rivet(c, 0, -16.2); rivet(c, 0, -12.2); },
  battleaxe(c, P) { haft(c, 4.8, -18.6, 2.3, P, 2.6, -2); metal(c, () => { c.moveTo(-1, -18.6); c.quadraticCurveTo(-0.6, -21, 0, -22.2); c.quadraticCurveTo(0.6, -21, 1, -18.6); c.closePath(); }, P.metal);
    axeHead(c, P, 1, -19.4, -10.6, 7.8); metal(c, () => { c.moveTo(-1, -17.2); c.quadraticCurveTo(-3.4, -17, -5, -14.8); c.quadraticCurveTo(-3.4, -13.4, -1, -12.8); c.closePath(); }, sh(hex(P.metal), -0.15));
    band(c, -18.6, 3, 7.6, P.acc); gem(c, 0, -14.8, 1.05, P.gem); },
  crescent(c, P) { haft(c, 7.8, -25, 2.4, P, 2.6, -2.6); band(c, 3.6, 2.9, 1.6, P.acc);
    axeHead(c, P, 1, -27.6, -11.4, 11.2);
    band(c, -25.2, 3.1, 11.6, P.acc); rivet(c, 0, -23.4); rivet(c, 0, -15.4); gem(c, 0, -19.4, 1.25, P.gem); },
  double(c, P) { haft(c, 8, -26.6, 2.5, P, 2.8, -2.8); metal(c, () => { c.moveTo(-1.1, -26.4); c.quadraticCurveTo(-0.7, -29.6, 0, -31); c.quadraticCurveTo(0.7, -29.6, 1.1, -26.4); c.closePath(); }, P.metal);
    for (const s of [1, -1]) { c.save(); c.scale(s, 1); axeHead(c, P, 1.1, -28.4, -13.4, 9.8); c.restore(); }
    band(c, -26.4, 3.3, 11.6, P.acc); gem(c, 0, -20.6, 1.45, P.gem || P.acc); },
  // --- мечи
  shortsword(c, P) { hilt(c, P, 2.6, 3.6); blade(c, P, 1.55, -16.4, { fuller: false }); },
  sword(c, P) { hilt(c, P, 2.8, 4.6, 'wing'); blade(c, P, 1.65, -20.6); gem(c, 0, -2.6, 0.8, P.gem); },
  falchion(c, P) { hilt(c, P, 2.6, 3.6); const m = hex(P.metal);
    metal(c, () => { c.moveTo(-1.3, -3.4); c.lineTo(-1.3, -16.4); c.quadraticCurveTo(-0.4, -19.8, 3, -19.4); c.quadraticCurveTo(4.2, -12.6, 1.8, -3.4); c.closePath(); }, m, -1.3, 0, 3.6, 0);
    edge(c, [[2.8, -18.8], [3.4, -12.8], [1.8, -4.2]], m, 0.8); streak(c, [[-0.7, -4.4], [-0.7, -15.8]], 0.5, 0.6); },
  broadsword(c, P) { hilt(c, P, 2.8, 5.6, 'wing', 'diamond'); blade(c, P, 2.1, -22); gem(c, 0, -2.6, 0.95, P.gem || P.acc); },
  greatsword(c, P) { hilt(c, P, 6.8, 6.8); band(c, 1.8, 2.4, 1.2, P.acc);
    const m = hex(P.metal); metal(c, () => { c.moveTo(-1.7, -3.4); c.lineTo(-1.7, -6.6); c.quadraticCurveTo(-2.9, -7.2, -2.2, -8.2); c.lineTo(-2.1, -25.6); c.quadraticCurveTo(-1.2, -28.6, 0, -30); c.quadraticCurveTo(1.2, -28.6, 2.1, -25.6); c.lineTo(2.2, -8.2); c.quadraticCurveTo(2.9, -7.2, 1.7, -6.6); c.lineTo(1.7, -3.4); c.closePath(); }, m, -2.2, 0, 2.2, 0);
    c.strokeStyle = sh(m, -0.3); c.lineWidth = 0.75; c.beginPath(); c.moveTo(0, -8.4); c.lineTo(0, -25); c.stroke(); streak(c, [[-1.4, -8.6], [-1.3, -25.4]], 0.55, 0.65);
    if (P.etch) { c.strokeStyle = P.etch; c.lineWidth = 0.4; for (let y = -10; y > -22; y -= 2.6) { c.beginPath(); c.moveTo(-0.45, y - 0.6); c.lineTo(0, y + 0.6); c.lineTo(0.45, y - 0.3); c.stroke(); } } },
  // --- булавы и молоты
  mace(c, P) { haft(c, 4.6, -11.4, 2.1, P, 2.6, -1.8); band(c, -11.8, 2.8, 1.3, P.acc);
    for (const [x, y] of [[-3, -13.8], [3, -13.8], [0, -17.2], [-2.1, -16.2], [2.1, -16.2]]) metal(c, () => c.arc(x, y, 1.05, 0, TAU), sh(hex(P.metal), -0.1));
    metal(c, () => c.ellipse(0, -13.8, 3.2, 3.4, 0, 0, TAU), P.metal, -3, -17, 3, -10); shine(c, -1.1, -15.1, 1, 0.65, 0.55); },
  flanged(c, P) { haft(c, 4.6, -12.2, 1.9, P, 2.8, -2.4, true); band(c, -12.6, 2.8, 1.3, P.acc);
    for (const s of [-1, 1]) metal(c, () => { c.moveTo(s * 0.9, -12); c.quadraticCurveTo(s * 4.6, -13, s * 4.6, -15.4); c.quadraticCurveTo(s * 4.6, -18, s * 0.9, -19); c.closePath(); }, s < 0 ? P.metal : sh(hex(P.metal), -0.18));
    metal(c, () => { c.moveTo(-1.2, -11.8); c.lineTo(1.2, -11.8); c.lineTo(1.3, -18.8); c.quadraticCurveTo(0, -20.6, -1.3, -18.8); c.closePath(); }, sh(hex(P.metal), 0.15)); gem(c, 0, -15.3, 0.85, P.gem); },
  morning(c, P) { haft(c, 4.8, -11.8, 2.2, P, 2.8, -2); band(c, -12.8, 3, 1.5, P.acc);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, x = Math.cos(a), y = Math.sin(a); metal(c, () => { c.moveTo(x * 3 - y * 1, -15.6 + y * 3 + x * 1); c.quadraticCurveTo(x * 5, -15.6 + y * 5, x * 5.8, -15.6 + y * 5.8); c.quadraticCurveTo(x * 5, -15.6 + y * 5, x * 3 + y * 1, -15.6 + y * 3 - x * 1); c.closePath(); }, sh(hex(P.metal), 0.2)); }
    metal(c, () => c.arc(0, -15.6, 3.6, 0, TAU), P.metal, -3.6, -19, 3.6, -12); shine(c, -1.3, -16.9, 1.1, 0.7, 0.55); gem(c, 0, -15.6, 1, P.gem); },
  warhammer(c, P) { haft(c, 4.8, -16.4, 2.1, P, 2.8, -2, P.rar !== 'common');
    metal(c, () => { c.moveTo(-0.8, -18.8); c.quadraticCurveTo(-3.6, -18.4, -6, -16.8); c.quadraticCurveTo(-3.6, -15.4, -0.8, -15); c.closePath(); }, sh(hex(P.metal), -0.18));
    metal(c, () => c.roundRect(-1.8, -20, 7.2, 6, 1.6), P.metal, -2, -20, 5.4, -14); fill(c, () => c.roundRect(4.4, -20.4, 1.6, 6.8, 0.8), sh(hex(P.metal), 0.2), 0.5);
    metal(c, () => { c.moveTo(-0.9, -20); c.quadraticCurveTo(-0.5, -21.6, 0, -22.2); c.quadraticCurveTo(0.5, -21.6, 0.9, -20); c.closePath(); }, P.metal);
    fill(c, () => c.roundRect(-1.8, -17.6, 7.2, 1.2, 0.5), hex(P.acc), 0.45); shine(c, 0.6, -18.9, 1.8, 0.45, 0.55, 0); gem(c, 1.8, -17, 0.9, P.gem); },
  maul(c, P) { haft(c, 7.8, -20.6, 2.5, P, 2.8, -2.8, true); band(c, 3.4, 3, 1.8, P.acc);
    metal(c, () => c.roundRect(-6.4, -28, 12.8, 8.2, 2.4), P.metal, -6.4, -28, 6.4, -20); for (const x of [-6.6, 5.2]) fill(c, () => c.roundRect(x, -28.4, 1.6, 9, 0.8), hex(P.acc), 0.5);
    band(c, -20.8, 3.6, 2.6, P.acc); shine(c, -2.4, -26.6, 3, 0.7, 0.5, 0); gem(c, 0, -23.9, 1.5, P.gem || P.acc); },

  // --- Маг: посохи и жезлы (вершина — tip, туда собирается свет)
  stick(c, P, o) { const w = hex(P.wood, '#7a5230');
    metal(c, () => { c.moveTo(-1.1, 10); c.quadraticCurveTo(-1.9, -6, -0.2, -22.6); c.quadraticCurveTo(0.7, -23.6, 1.6, -22.4); c.quadraticCurveTo(0.4, -6, 1.1, 10); c.quadraticCurveTo(0, 10.8, -1.1, 10); c.closePath(); }, w, -1.6, 0, 1.6, 0);
    for (const y of [-4, -12, 4]) fill(c, () => c.ellipse(-0.6, y, 1, 0.7, 0.3, 0, TAU), sh(w, -0.22), 0.4);
    for (const [x, y, a, col] of [[2.6, -19.6, -0.6, '#5a9a3a'], [-1.8, -17.6, 0.6, '#6aaa44']]) { fill(c, () => c.ellipse(x, y, 1.9, 1, a, 0, TAU), col, 0.45); shine(c, x - 0.5, y - 0.3, 0.6, 0.3, 0.5, a); }
    tipGlow(c, 0.6, -23, 2, P, o); },
  wand(c, P, o) { haft(c, 3.4, -10.8, 1.6, P, 3.4, -1.6); band(c, -11.8, 2.6, 1.4, P.acc);
    metal(c, () => { c.moveTo(-1.2, -11.6); c.quadraticCurveTo(-1.4, -13.6, 0, -15.6); c.quadraticCurveTo(1.4, -13.6, 1.2, -11.6); c.closePath(); }, P.orb || P.gem || '#9ad0ff'); tipGlow(c, 0, -13.6, 1.8, P, o); },
  crook(c, P, o) { const w = hex(P.wood, '#7a5230');
    fill(c, () => { c.moveTo(-1, 10); c.lineTo(-1, -22); c.quadraticCurveTo(-1, -28, 3.6, -27.8); c.quadraticCurveTo(7, -27.4, 6.4, -23.2); c.lineTo(4.6, -23.4); c.quadraticCurveTo(5, -25.8, 3.4, -25.8); c.quadraticCurveTo(1, -25.8, 1, -22); c.lineTo(1, 10); c.quadraticCurveTo(0, 10.8, -1, 10); c.closePath(); }, w, LW);
    streak(c, [[-0.4, 8], [-0.4, -22], [1.6, -26.6]], 0.4, 0.35); fill(c, () => c.roundRect(-1.3, -6, 2.6, 3, 0.8), hex(P.wrap), 0.5);
    c.strokeStyle = ink(w); c.lineWidth = 0.5; c.beginPath(); c.moveTo(5.5, -23.2); c.lineTo(5.5, -21.8); c.stroke(); fill(c, () => c.roundRect(4.2, -21.9, 2.6, 3.2, 1), hex(P.acc), 0.5); gem(c, 5.5, -20.3, 0.8, P.orb); tipGlow(c, 5.5, -20.3, 1.8, P, o); },
  orb(c, P, o) { haft(c, 10.4, -21.8, 2, P, 1.6, -3); band(c, -22.6, 2.8, 1.4, P.acc);
    for (const s of [-1, 0, 1]) fill(c, () => { c.moveTo(s * 0.7, -21.6); c.quadraticCurveTo(s * 3.8, -24, s * 2.4, -28.8); c.lineTo(s * 1.8, -28.2); c.quadraticCurveTo(s * 2.6, -24.4, s * 0.1 - 0.3 * s, -21.8); c.closePath(); }, hex(P.acc), 0.4);
    tipGlow(c, 0, -25.6, 2.5, P, o); orb(c, 0, -25.6, 2.5, P.orb); },
  serpent(c, P, o) { const w = hex(P.wood, '#6a4428'), lf = hex(P.leaf, '#5a8a3a');
    const path = () => { c.beginPath(); for (let y = 10; y >= -24; y -= 1) c.lineTo(Math.sin(y * 0.45) * 0.9, y); };
    path(); c.strokeStyle = ink(w); c.lineWidth = 3.2; c.lineCap = 'round'; c.stroke(); path(); c.strokeStyle = w; c.lineWidth = 2; c.stroke();
    c.beginPath(); for (let y = 6; y >= -22; y -= 0.5) c.lineTo(Math.sin(y * 0.45 + 1.6) * 1.5, y); c.strokeStyle = ink(lf); c.lineWidth = 1.7; c.stroke(); c.strokeStyle = lf; c.lineWidth = 1.05; c.stroke();
    fill(c, () => { c.moveTo(-0.6, -24); c.quadraticCurveTo(-1.4, -29.2, 2.4, -29.4); c.quadraticCurveTo(6, -29.2, 5.8, -27); c.quadraticCurveTo(3.6, -26.6, 2.2, -26.8); c.quadraticCurveTo(1.2, -26, 1.4, -24); c.closePath(); }, lf, 0.55);
    gem(c, 2.8, -28.2, 0.55, P.orb); c.strokeStyle = '#d04040'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(5.8, -27.2); c.lineTo(7, -26.8); c.moveTo(6.5, -27); c.lineTo(7.1, -27.6); c.stroke();
    tipGlow(c, 3.4, -27.6, 2, P, o); },
  rune(c, P, o) { haft(c, 10.4, -23.4, 2.1, P, 1.8, -3); for (const y of [-20, -10, 4]) band(c, y, 2.9, 1.2, P.acc);
    for (const s of [-1, 1]) { c.strokeStyle = ink(hex(P.acc)); c.lineWidth = 1.4; c.beginPath(); c.moveTo(s * 1.1, -23.4); c.quadraticCurveTo(s * 3, -24.4, s * 2.6, -26.4); c.stroke(); c.strokeStyle = hex(P.acc); c.lineWidth = 0.8; c.stroke(); }
    const fy = -28.4 + (o && o.t ? Math.sin(o.t * 2) * 0.4 : 0); tipGlow(c, 0, fy, 3, P, o);
    metal(c, () => { c.moveTo(0, fy - 3.4); c.quadraticCurveTo(1.6, fy - 1.4, 1.7, fy); c.quadraticCurveTo(1.2, fy + 1.8, 0, fy + 2.6); c.quadraticCurveTo(-1.2, fy + 1.8, -1.7, fy); c.quadraticCurveTo(-1.6, fy - 1.4, 0, fy - 3.4); c.closePath(); }, '#8a8a9e', -1.7, fy - 3, 1.7, fy + 2);
    c.strokeStyle = hex(P.etch || P.orb, '#9ad0ff'); c.lineWidth = 0.45; c.beginPath(); c.moveTo(-0.5, fy - 1.2); c.lineTo(0, fy + 0.4); c.lineTo(0.5, fy - 0.8); c.stroke(); },
  moon(c, P, o) { haft(c, 10.4, -22, 2, P, 1.6, -3, P.rar === 'epic');
    metal(c, () => { c.moveTo(-1, -22); c.quadraticCurveTo(-6.2, -23, -5, -30); c.quadraticCurveTo(-3.6, -25.6, 0, -24.6); c.quadraticCurveTo(3.6, -25.6, 5, -30); c.quadraticCurveTo(6.2, -23, 1, -22); c.quadraticCurveTo(0, -21.4, -1, -22); c.closePath(); }, P.acc, -5, -30, 5, -22);
    tipGlow(c, 0, -27.6, 2.6, P, o); orb(c, 0, -27.6, 1.8, P.orb); },
  root(c, P, o) { const w = hex(P.wood, '#6a4428');
    for (const k of [-1, 1, 0]) { c.beginPath(); for (let y = 10; y >= -22; y -= 1) c.lineTo(Math.sin(y * 0.32 + k * 2.1) * 1.2, y); c.lineCap = 'round'; c.strokeStyle = ink(w); c.lineWidth = 2.3; c.stroke(); c.strokeStyle = sh(w, k * 0.12); c.lineWidth = 1.3; c.stroke(); }
    tipGlow(c, 0, -25, 2.8, P, o); orb(c, 0, -25, 2, P.orb);
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 0.8, -21.6); c.quadraticCurveTo(s * 3.6, -24.6, s * 1.3, -28.4); c.strokeStyle = ink(w); c.lineWidth = 1.9; c.stroke(); c.strokeStyle = w; c.lineWidth = 1.1; c.stroke(); }
    for (const [x, y, a] of [[3, -21.4, -0.5], [-2.8, -19, 0.6]]) fill(c, () => c.ellipse(x, y, 1.7, 0.85, a, 0, TAU), hex(P.leaf, '#5a9a3a'), 0.4); },
  arch(c, P, o) { haft(c, 10.8, -23, 2.2, P, 1.8, -3.2, true); for (const y of [-14, -4, 6]) band(c, y, 3, 1.2, P.acc);
    for (const s of [-1, 1]) fill(c, () => { c.moveTo(s * 1.1, -23); c.quadraticCurveTo(s * 6, -23.6, s * 6.8, -28.8); c.quadraticCurveTo(s * 4.4, -26.8, s * 3.4, -27.2); c.quadraticCurveTo(s * 4, -25.2, s * 1.1, -25); c.closePath(); }, hex(P.acc), 0.5);
    tipGlow(c, 0, -28.6, 3.4, P, o); orb(c, 0, -28.6, 2.5, P.orb); },

  // --- Лучник
  shortbow(c, P, o) { bow(c, P, o, 12, 0); }, hunt(c, P, o) { bow(c, P, o, 14, 1); }, recurve(c, P, o) { bow(c, P, o, 14.5, 2); },
  long(c, P, o) { bow(c, P, o, 18, 3); }, horn(c, P, o) { bow(c, P, o, 14, 4); }, war(c, P, o) { bow(c, P, o, 16.5, 5); }, wind(c, P, o) { bow(c, P, o, 16, 6); },

  // --- героические (фиолетовые)
  flameblade(c, P) { hilt(c, P, 3, 6.4, 'wing'); const m = hex(P.metal);
    const path = () => { c.moveTo(-2.1, -3.4); for (let y = -3.4; y > -22; y -= 1) c.lineTo(-2.1 - Math.sin(y * 0.55) * 0.6 + (y < -18 ? (y + 18) * 0.14 : 0), y); c.quadraticCurveTo(-0.8, -25.2, 0, -27.4); c.quadraticCurveTo(0.8, -25.2, 1.6, -22); for (let y = -22; y < -3.4; y += 1) c.lineTo(2.1 + Math.sin(y * 0.55 + 1.6) * 0.6 + (y < -18 ? -(y + 18) * 0.14 : 0), y); c.closePath(); };
    metal(c, path, m, -2, 0, 2, 0); c.save(); c.beginPath(); path(); c.clip(); const g = c.createLinearGradient(0, -4, 0, -27); g.addColorStop(0, 'rgba(255,90,30,.2)'); g.addColorStop(1, 'rgba(255,210,120,.35)'); c.fillStyle = g; c.fillRect(-3, -27.5, 6, 24); c.restore();
    c.beginPath(); path(); c.strokeStyle = '#ff6a1a'; c.lineWidth = 0.55; c.stroke();
    c.strokeStyle = hex(P.etch, '#ff8a3a'); c.lineWidth = 0.7; c.beginPath(); c.moveTo(0, -4.8); c.lineTo(0, -21); c.stroke(); streak(c, [[-1.3, -5], [-1.2, -20.4]], 0.5, 0.6);
    band(c, -4.4, 3.6, 1.6, P.acc); gem(c, 0, -3.6, 1, P.gem); },
  runeaxe(c, P) { haft(c, 8.4, -28, 2.6, P, 3, -3, true); band(c, 7, 3.6, 2.2, P.acc); gem(c, 0, 8.1, 0.85, P.gem);
    metal(c, () => { c.moveTo(-1.2, -28); c.quadraticCurveTo(-0.8, -32, 0, -34.4); c.quadraticCurveTo(0.8, -32, 1.2, -28); c.closePath(); }, P.acc);
    for (const s of [1, -1]) { c.save(); c.scale(s, 1); axeHead(c, { ...P, etch: null }, 1.2, -32, -13.6, 12.6);
      fill(c, () => { c.moveTo(2.2, -26.6); c.quadraticCurveTo(4.6, -27.6, 6.6, -27.6); c.lineTo(6.6, -17); c.quadraticCurveTo(4.6, -17, 2.2, -18); c.closePath(); }, hex(P.acc), 0.45);
      c.strokeStyle = hex(P.etch, '#7ee0ff'); c.lineWidth = 0.6; c.beginPath(); c.moveTo(9, -27.6); c.lineTo(10.6, -25); c.lineTo(9.2, -22.4); c.lineTo(10.8, -19.6); c.lineTo(9.2, -17); c.stroke(); c.restore(); }
    band(c, -28.2, 3.8, 13.8, P.acc); gem(c, 0, -22, 1.7, P.gem); },
  thunder(c, P) { haft(c, 8.4, -22, 2.6, P, 3, -3); band(c, 7, 3.6, 2.2, P.acc);
    metal(c, () => c.roundRect(-8.8, -32, 17.6, 11.2, 2.6), P.metal, -8.8, -32, 8.8, -21); for (const x of [-9, 6.8]) fill(c, () => c.roundRect(x, -32.4, 2.2, 12, 1), hex(P.acc), 0.5);
    band(c, -32.8, 4.2, 12.8, P.acc);
    for (const s of [-1, 1]) metal(c, () => { c.moveTo(s * 9, -29); c.quadraticCurveTo(s * 11.2, -27.6, s * 11.6, -26.4); c.quadraticCurveTo(s * 11.2, -25.2, s * 9, -23.8); c.closePath(); }, sh(hex(P.metal), 0.2));
    c.strokeStyle = hex(P.etch, '#bfe6ff'); c.lineWidth = 0.65; c.beginPath(); for (const s of [-1, 1]) { c.moveTo(s * 5.6, -30); c.lineTo(s * 4.2, -27.2); c.lineTo(s * 5.4, -26.8); c.lineTo(s * 3.8, -23.4); } c.stroke();
    shine(c, -4.6, -30.4, 2.6, 0.7, 0.5, 0); gem(c, 0, -26.4, 2.1, P.gem); },
  starfall(c, P, o) { haft(c, 10.8, -23.6, 2.2, P, 1.8, -3.2, true); for (const y of [-16, -6, 5]) band(c, y, 3, 1.2, P.acc);
    for (const s of [-1, 1]) fill(c, () => { c.moveTo(s * 1, -23.4); c.quadraticCurveTo(s * 5.4, -24.6, s * 5.2, -29.4); c.quadraticCurveTo(s * 4.6, -33.8, s * 0.8, -34.8); c.lineTo(s * 0.6, -33.6); c.quadraticCurveTo(s * 3.6, -32.6, s * 3.8, -29.4); c.quadraticCurveTo(s * 4, -25.6, s * 1, -25); c.closePath(); }, hex(P.acc), 0.5);
    const fy = -29 + (o && o.t ? Math.sin(o.t * 2.2) * 0.6 : 0); tipGlow(c, 0, fy, 3.2, P, o);
    fill(c, () => { for (let i = 0; i < 10; i++) { const r = i % 2 ? 1.2 : 3, a = i * Math.PI / 5 - Math.PI / 2; c.lineTo(Math.cos(a) * r, fy + Math.sin(a) * r); } c.closePath(); }, '#f4e8ff', 0.5); gem(c, 0, fy, 1, P.orb); },
  phoenix(c, P, o) { haft(c, 10.8, -22.6, 2.2, P, 1.8, -3.2); for (const y of [-12, 2]) band(c, y, 3, 1.2, P.acc);
    for (const s of [-1, 1]) fill(c, () => { c.moveTo(s * 0.9, -22.4); c.quadraticCurveTo(s * 4.4, -23, s * 8.8, -30.6); c.quadraticCurveTo(s * 7, -29.6, s * 6.8, -28); c.quadraticCurveTo(s * 5.6, -28.6, s * 5.6, -26.6); c.quadraticCurveTo(s * 4.2, -26.8, s * 4, -25.2); c.quadraticCurveTo(s * 2.4, -24.8, s * 0.9, -24.6); c.closePath(); }, hex(P.acc), 0.5);
    const t = (o && o.t) || 0, f = Math.sin(t * 9) * 0.5; tipGlow(c, 0, -28, 3.4, P, o);
    for (const [col, w, h] of [['#ff5a1a', 2.8, 7.6], ['#ffa030', 1.9, 5.6], ['#fff2a0', 1, 3.3]]) { c.fillStyle = col; c.beginPath(); c.moveTo(-w, -25); c.quadraticCurveTo(-w * 1.1, -25 - h * 0.6, f * 0.5, -25 - h - f); c.quadraticCurveTo(w * 1.1, -25 - h * 0.6, w, -25); c.quadraticCurveTo(0, -24.2, -w, -25); c.closePath(); c.fill(); } },
  glacier(c, P, o) { haft(c, 10.8, -22.6, 2.1, P, 1.8, -3.2, true); for (const y of [-14, -4, 6]) band(c, y, 2.9, 1.2, P.acc); tipGlow(c, 0, -28, 3.4, P, o);
    const cr = (x, y, a, L, w, col) => { c.save(); c.translate(x, y); c.rotate(a); metal(c, () => { c.moveTo(0, 0); c.quadraticCurveTo(w * 1.1, -L * 0.25, w, -L * 0.35); c.lineTo(0, -L); c.lineTo(-w, -L * 0.35); c.quadraticCurveTo(-w * 1.1, -L * 0.25, 0, 0); c.closePath(); }, col, -w, -L, w, 0); streak(c, [[-w * 0.4, -L * 0.3], [0, -L * 0.85]], 0.4, 0.75); c.restore(); };
    cr(-1, -22.6, -0.55, 6.4, 1.5, '#9ad0f0'); cr(1, -22.6, 0.55, 6.4, 1.5, '#9ad0f0'); cr(-0.6, -22.8, -0.22, 9, 1.8, '#bfe6ff'); cr(0.6, -22.8, 0.22, 9, 1.8, '#bfe6ff'); cr(0, -23, 0, 12, 2.2, '#e0f4ff');
    band(c, -23.6, 3.6, 1.6, P.acc); },
  stagbow(c, P, o) { bow(c, P, o, 17.5, 3);
    for (const s of [-1, 1]) for (const [x, y, a] of [[3.4, 0.45, -0.9], [2.4, 0.7, -0.6], [0.4, 0.9, -0.35]]) { const py = s * 17.5 * y; c.beginPath(); c.moveTo(x, py); c.quadraticCurveTo(x + 2.6, py + s * a * 1.4, x + 3.8, py + s * a * 3.8); c.lineCap = 'round'; c.strokeStyle = '#7a6a4a'; c.lineWidth = 1.8; c.stroke(); c.strokeStyle = '#f0e6cc'; c.lineWidth = 1; c.stroke(); }
    for (const s of [-1, 1]) fill(c, () => c.ellipse(1.8, s * 3.4, 1.8, 0.9, s * 0.5, 0, TAU), hex(P.leaf), 0.4); gem(c, 2.8, 0, 1.1, P.gem); },
  sunbow(c, P, o) { bow(c, P, o, 17, 5); c.save(); c.translate(3.2, 0);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, L = i % 2 ? 4.2 : 5.4; fill(c, () => { c.moveTo(Math.cos(a - 0.16) * 2.8, Math.sin(a - 0.16) * 2.8); c.quadraticCurveTo(Math.cos(a) * L * 0.8, Math.sin(a) * L * 0.8, Math.cos(a) * L, Math.sin(a) * L); c.quadraticCurveTo(Math.cos(a) * L * 0.8, Math.sin(a) * L * 0.8, Math.cos(a + 0.16) * 2.8, Math.sin(a + 0.16) * 2.8); c.closePath(); }, hex(P.acc), 0.35); }
    metal(c, () => c.arc(0, 0, 3, 0, TAU), P.metal, -3, -3, 3, 3); gem(c, 0, 0, 1.7, P.gem); c.restore(); },
  nightbow(c, P, o) { bow(c, P, o, 16.5, 2);
    for (const s of [-1, 1]) metal(c, () => { c.moveTo(1.6, s * 16.5); c.quadraticCurveTo(5.8, s * 14.6, 7, s * 9.4); c.quadraticCurveTo(5, s * 12.6, 2.4, s * 13.2); c.closePath(); }, '#9a9ab4', 1.6, s * 16, 7, s * 9);
    fill(c, () => c.roundRect(-0.7, -3.2, 3, 6.4, 1.2), hex(P.acc), 0.5); gem(c, 3, 0, 1.3, P.gem); },

  // --- инструменты и оружие жителей
  pick(c, P) { haft(c, 5.2, -20.6, 2.1, P, 2.6, -1.6);
    metal(c, () => { c.moveTo(-11, -15.2); c.quadraticCurveTo(-5.4, -23.8, 0, -23.6); c.quadraticCurveTo(5.4, -23.8, 11.8, -15.6); c.quadraticCurveTo(11.6, -14.8, 11, -14.8); c.quadraticCurveTo(5.2, -19.6, 0, -19.4); c.quadraticCurveTo(-5.2, -19.6, -10.2, -14.2); c.quadraticCurveTo(-10.8, -14.4, -11, -15.2); c.closePath(); }, '#a8b0b6', -11, -24, 11, -14);
    metal(c, () => c.roundRect(-1.9, -24.4, 3.8, 5.8, 1.2), '#6a7076'); streak(c, [[-6, -19.6], [0, -22.4], [6, -19.8]], 0.5, 0.55); },
  torch(c, P, o) { haft(c, 5.2, -14.2, 2, P, 2.6, -1.4);
    fill(c, () => c.roundRect(-2, -16.8, 4, 3, 1), '#5a3a1c', 0.5); c.strokeStyle = '#3a2410'; c.lineWidth = 0.35; c.beginPath(); c.moveTo(-1.8, -15.4); c.lineTo(1.8, -15.6); c.stroke();
    const t = (o && o.t) || 0, f = Math.sin(t * 14) * 0.8, g = c.createRadialGradient(0, -20, 0.5, 0, -20, 8); g.addColorStop(0, 'rgba(255,200,90,.7)'); g.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, -20, 8, 0, TAU); c.fill();
    for (const [col, w, h] of [['#ff6a2a', 3.2, 8.4], ['#ffb347', 2.1, 5.8], ['#fff2a0', 1.1, 3.4]]) { c.fillStyle = col; c.beginPath(); c.moveTo(-w, -16.8); c.quadraticCurveTo(-w * 1.1, -16.8 - h * 0.6, f * 0.4, -16.8 - h - f); c.quadraticCurveTo(w * 1.1, -16.8 - h * 0.6, w, -16.8); c.quadraticCurveTo(0, -16, -w, -16.8); c.closePath(); c.fill(); } },
  sickle(c, P, o) { fill(c, () => { c.moveTo(-1, 10); c.quadraticCurveTo(0.2, -6, -0.8, -22); c.quadraticCurveTo(0, -22.8, 1, -22); c.quadraticCurveTo(2, -6, 1, 10); c.quadraticCurveTo(0, 10.8, -1, 10); c.closePath(); }, '#5a3e24', LW);
    tipGlow(c, 5, -25, 3.4, { ...P, glow: '#78ffaa', orb: '#9affc8' }, o);
    metal(c, () => { c.moveTo(-0.6, -21.6); c.quadraticCurveTo(4.6, -30.4, 11.8, -26.2); c.quadraticCurveTo(13.8, -23, 11.6, -19.4); c.quadraticCurveTo(11, -24.2, 6, -24.8); c.quadraticCurveTo(2.4, -24.4, 1.2, -20.4); c.closePath(); }, '#cfd8de', 0, -30, 12, -19);
    edge(c, [[11.4, -25.6], [12.6, -22.6], [11.4, -20.2]], '#cfd8de', 0.6); },
  spear(c, P) { haft(c, 10.4, -27, 1.9, P, 1.6, -2.4);
    metal(c, () => { c.moveTo(-0.9, -27); c.quadraticCurveTo(-2.4, -29.4, -1.9, -30.6); c.quadraticCurveTo(-1, -33, 0, -35); c.quadraticCurveTo(1, -33, 1.9, -30.6); c.quadraticCurveTo(2.4, -29.4, 0.9, -27); c.closePath(); }, P.metal, -2, -35, 2, -27);
    c.strokeStyle = sh(hex(P.metal), -0.3); c.lineWidth = 0.45; c.beginPath(); c.moveTo(0, -27.6); c.lineTo(0, -33.4); c.stroke(); band(c, -28, 2.6, 1.8, P.acc); },
  cleaver(c, P) { haft(c, 2.8, -2.2, 1.8, P, 2.8, -2.2, false, true);
    metal(c, () => { c.moveTo(-1.2, -2.4); c.lineTo(-1.2, -13.4); c.quadraticCurveTo(-1, -14.4, 0, -14.4); c.lineTo(3.4, -15); c.quadraticCurveTo(4.4, -8.4, 2.2, -2.4); c.closePath(); }, P.metal, -1.2, 0, 4, 0);
    edge(c, [[3.2, -14.4], [3.7, -8.6], [2.1, -3.2]], P.metal, 0.75); rivet(c, 0.4, -4.4, 0.5); },
};
