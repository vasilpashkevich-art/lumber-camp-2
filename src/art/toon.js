// v97: мультяшная кукла для всех людей — герой, разбойники, стража, купец, жители (утверждённый эскиз v97, проба 4).
// Объёмная кукла: у каждой части своё место в теле (l — вбок, к левой руке; f — вперёд; y — вниз, как на экране),
// при повороте на угол a: x = l·cos a + f·sin a, глубина (кто ближе) = −l·sin a + f·cos a; части рисуются по глубине.
// Голова — шар: волосы, лицо, борода, капюшоны и шлемы — «шапочки» на шаре (cap), видимые с любой стороны;
// глаза, брови, рот, забрала — «наклейки» (decal), сжимаются, когда сторона уходит от нас.
// Единицы куклы: ступни на 0, рост ≈ 41; в мире — как прежнее тело: ступни на +12,6, масштаб RIG.K (рост ≈ 37).
// Вещи — по моделям gear.js (основа, наплечники, рукава, сапоги, расцветка); оружие — прежними моделями в руке.
import { W_BY, H_BY, C_BY, L_BY, palette, sh } from './gear.js';
const TAU = Math.PI * 2, LW = 0.75;
export const RIG = { K: 0.9, FOOT: 12.6 };
const VIEW_A = { front: 0, fs: 45, side: 90, bs: 135, back: 180 };
const SKIN = '#e6b48a';
const NAKED = palette('start', 1, 0);
const ink = col => sh(col, -0.6);
const isHex = s => typeof s === 'string' && s[0] === '#' && s.length === 7;
const hx6 = (s, d = '#888888') => isHex(s) ? s : d;

// ---------------------------------------------------------------- кисти
function paint(g, fill, lw = LW, y0, y1) {
  fill = hx6(fill);
  if (y0 != null) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, sh(fill, 0.16)); gr.addColorStop(1, sh(fill, -0.16)); g.fillStyle = gr; } else g.fillStyle = fill;
  g.fill(); if (lw) { g.strokeStyle = ink(fill); g.lineWidth = lw; g.stroke(); }
}
/** Глянцевая пластина: светлый верх, тёмный низ, обводка, блик. Путь уже построен. */
function plate(g, col, y0, y1, gx, gy, gw = 1, gh = 2) {
  col = hx6(col); const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, sh(col, 0.34)); gr.addColorStop(0.5, col); gr.addColorStop(1, sh(col, -0.3)); g.fillStyle = gr; g.fill();
  g.strokeStyle = ink(col); g.lineWidth = LW; g.stroke();
  if (gx != null) { g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(gx, gy, gw, gh, -0.35, 0, TAU); g.fill(); }
}
function capsule(g, x1, y1, x2, y2, w, col) {
  col = hx6(col); g.lineCap = 'round'; g.strokeStyle = ink(col); g.lineWidth = w + LW * 2; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
  g.strokeStyle = col; g.lineWidth = w; g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = w * 0.26; g.beginPath(); g.moveTo(x1 - w * 0.22, y1 + 0.3); g.lineTo(x2 - w * 0.22, y2 - 0.3); g.stroke();
}
const blob = (g, x, y, rx, ry, col, lw = LW) => { g.beginPath(); g.ellipse(x, y, Math.max(0.05, rx), Math.max(0.05, ry), 0, 0, TAU); paint(g, col, lw, y - ry, y + ry); };
const shine = (g, x, y, rx, ry, a = 0.32) => { g.fillStyle = `rgba(255,255,255,${a})`; g.beginPath(); g.ellipse(x, y, Math.max(0.05, rx), Math.max(0.05, ry), -0.4, 0, TAU); g.fill(); };
const trimLine = (g, col, w = 0.8) => { col = hx6(col); g.strokeStyle = ink(col); g.lineWidth = w + 0.55; g.stroke(); g.strokeStyle = col; g.lineWidth = w; g.stroke(); };
const rivet = (g, x, y, r = 0.42, col = '#e8ecf2') => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); };
function gemD(g, x, y, r, col) { if (!col) return; g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r, y); g.lineTo(x, y + r); g.lineTo(x - r, y); g.closePath(); paint(g, col, 0.45); shine(g, x - r * 0.25, y - r * 0.3, r * 0.22, r * 0.18, 0.85); }
function star(g, x, y, r, col) { g.fillStyle = col; g.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.38 : r, a = i * Math.PI / 4 - Math.PI / 2; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); }
/** Ткань по материалу: узор поверх уже залитого пути (клип). */
function texture(g, kind, col, x0, y0, x1, y1) {
  g.save(); g.clip();
  if (kind === 'mail') { g.strokeStyle = sh(col, -0.42); g.lineWidth = 0.24; for (let y = y0, r = 0; y < y1; y += 0.85, r++) for (let x = x0; x < x1; x += 0.95) { g.beginPath(); g.arc(x + (r % 2 ? 0.48 : 0), y, 0.4, 0, Math.PI); g.stroke(); } }
  else if (kind === 'scale') { for (let y = y0, r = 0; y < y1; y += 1.35, r++) for (let x = x0; x < x1; x += 1.6) { const xx = x + (r % 2 ? 0.8 : 0); g.beginPath(); g.moveTo(xx - 0.8, y); g.quadraticCurveTo(xx - 0.8, y + 1.5, xx, y + 1.75); g.quadraticCurveTo(xx + 0.8, y + 1.5, xx + 0.8, y); g.fillStyle = sh(col, r % 2 ? 0.08 : -0.04); g.fill(); g.strokeStyle = sh(col, -0.4); g.lineWidth = 0.25; g.stroke(); } }
  else if (kind === 'quilt') { g.strokeStyle = sh(col, -0.28); g.lineWidth = 0.32; for (let y = y0 + 1.4; y < y1; y += 2.4) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); } g.setLineDash([0.6, 0.7]); for (let x = x0; x < x1; x += 2.2) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); } g.setLineDash([]); }
  else if (kind === 'fur') { g.strokeStyle = sh(col, -0.32); g.lineWidth = 0.4; for (let y = y0; y < y1; y += 1.3) for (let x = x0; x < x1; x += 1.5) { const o = (y * 3.7) % 1.4; g.beginPath(); g.moveTo(x + o, y); g.quadraticCurveTo(x + o + 0.5, y + 0.6, x + o + 0.2, y + 1.2); g.stroke(); } }
  else if (kind === 'robe') { g.strokeStyle = sh(col, -0.2); g.lineWidth = 0.35; for (let x = x0 + 2; x < x1; x += 3) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x + (x - (x0 + x1) / 2) * 0.12, y1); g.stroke(); } }
  // объём: правая сторона в тени
  g.fillStyle = 'rgba(20,10,4,.13)'; g.fillRect((x0 + x1) / 2 + (x1 - x0) * 0.18, y0 - 2, (x1 - x0), y1 - y0 + 4);
  g.restore();
}

// ---------------------------------------------------------------- поза
const KCHOP = [[0, 0.3, 3.25], [0.3, 2.65, 4.05], [0.42, 3.0, 4.3], [0.58, 1.6, 2.05], [0.76, 0.8, 1.25], [1, 0.3, 3.25]];
function keyed(K, k) { let i = 0; while (i < K.length - 2 && k > K[i + 1][0]) i++; const a = K[i], b = K[i + 1], q = Math.min(1, Math.max(0, (k - a[0]) / (b[0] - a[0]))), e = q * q * (3 - 2 * q); return a.map((v, j) => v + (b[j] - v) * e); }
// оружие в покое: по стороне взгляда — чтобы не закрывало лицо (спереди — вверх и наружу, боком — вперёд-вверх)
const REST = { front: [3.0, 0.55], fs: [3.45, 0.75], side: [2.35, 0], bs: [3.1, 0.55], back: [3.0, 0.55] };
const REST_CAST = { front: [2.98, 0.12], fs: [3.12, 0.5], side: [2.98, 0], bs: [3.0, 0.3], back: [2.98, 0.12] };
function poseRig(pose, style, view) {
  const [rw, rl] = REST[view] || REST.front;
  const t = pose.t || 0, R = { bob: Math.sin(t * 2.2) * 0.2, foot: [0, 0], lift: [0, 0], armL: 0.12, armR: view === 'side' ? 0.45 : 0.25, bendR: 0.35, w: rw, lt: rl, lean: 0, atk: 0, glow: 0, pull: 0, bow: false, trail: 0 };
  if (style === 'cast') { [R.w, R.lt] = REST_CAST[view] || REST_CAST.front; R.armR = 0.2; R.bendR = 0.25; }
  if (style === 'bow') { R.armR = 0.15; R.armL = 0.15; }
  if (pose.walk >= 0) { const w = pose.walk * TAU; R.foot = [Math.sin(w) * 4.4, -Math.sin(w) * 4.4]; R.lift = [Math.max(0, Math.cos(w)) * 1.8, Math.max(0, -Math.cos(w)) * 1.8]; R.bob = -Math.abs(Math.sin(w)) * 0.7;
    R.armL = 0.12 - Math.sin(w) * 0.42; R.armR += Math.sin(w) * 0.28; if (style === 'chop') R.w += Math.sin(w) * 0.15; }
  const A = pose.atk >= 0 ? pose.atk : -1;
  if (A >= 0) {
    if (style === 'cast') { const k = A < 0.5 ? A / 0.5 : 1 - (A - 0.5) / 0.5, e = k * k * (3 - 2 * k); R.armR = 0.2 + e * 1.35; R.bendR = 0.25 - e * 0.25; const [cw, cl] = REST_CAST[view] || REST_CAST.front; R.w = cw - e * 0.5; R.lt = cl * (1 - e); R.glow = k; R.lean = e * 0.6; }
    else if (style === 'bow') { const k = A < 0.6 ? A / 0.6 : 1 - (A - 0.6) / 0.4; R.bow = Math.min(1, k * 1.8); R.pull = A < 0.6 ? Math.min(1, k * 1.2) : 0; }
    else { const K = KCHOP.map((k, i) => i === 0 || i === KCHOP.length - 1 ? [k[0], k[1], rw] : k), [, ar, w] = keyed(K, A); R.armR = ar; R.w = w; R.bendR = ar > 1.5 ? -0.45 : 0.3; R.atk = Math.min(1, Math.sin(Math.PI * Math.min(1, A * 1.15)) * 1.6); R.lt = rl * (1 - R.atk); R.lean = A > 0.5 && A < 0.92 ? 1.1 : 0; R.foot = [A > 0.5 ? 2.2 : 0, A > 0.5 ? -1.4 : 0]; R.trail = A > 0.42 && A < 0.66 ? 0.55 : 0; }
  }
  return R;
}

// ---------------------------------------------------------------- шар головы: шапочки и наклейки
/** Видимая часть «шапочки» на шаре (все точки с углом к оси n не больше al), в долях радиуса; null — не видно. */
function capPts(ca, sa, n, al) {
  const nn = Math.hypot(n[0], n[1], n[2]) || 1, nl = n[0] / nn, nf = n[1] / nn, nu = n[2] / nn;
  const v = [nl * ca + nf * sa, -nu, -nl * sa + nf * ca];   // экран x, экран y (вниз), глубина
  const cosA = Math.cos(al), sinA = Math.sin(al), inCap = p => p[0] * v[0] + p[1] * v[1] + p[2] * v[2] >= cosA - 1e-6;
  let e1 = [v[1], -v[0], 0]; let l1 = Math.hypot(e1[0], e1[1]); if (l1 < 1e-4) { e1 = [1, 0, 0]; l1 = 1; } e1 = e1.map(q => q / l1);
  const e2 = [v[1] * e1[2] - v[2] * e1[1], v[2] * e1[0] - v[0] * e1[2], v[0] * e1[1] - v[1] * e1[0]];
  const N = 56, P = [];
  for (let i = 0; i < N; i++) { const th = i / N * TAU, c = Math.cos(th) * sinA, s = Math.sin(th) * sinA; P.push([v[0] * cosA + e1[0] * c + e2[0] * s, v[1] * cosA + e1[1] * c + e2[1] * s, v[2] * cosA + e1[2] * c + e2[2] * s]); }
  const vis = P.map(p => p[2] >= 0), nv = vis.filter(Boolean).length;
  const circle = () => Array.from({ length: 48 }, (_, i) => [Math.cos(i / 48 * TAU), Math.sin(i / 48 * TAU)]);
  if (nv === N) { const pts = P.map(p => [p[0], p[1]]); if (inCap([0, 0, 1])) return pts;
    // шапочка смотрит от нас, а край весь виден: видно всё, кроме «окна» (лицо в капюшоне) — круг с дыркой
    let ar = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; ar += p[0] * q[1] - q[0] * p[1]; }
    const hole = ar > 0 ? pts.slice().reverse() : pts; const c = circle(); c.hole = hole; return c; }
  if (nv === 0) return inCap([0, 0, 1]) ? circle() : null;
  let s = 0; while (!(vis[s] && !vis[(s - 1 + N) % N])) s++;
  const cross = (a, b) => { const q = a[2] / (a[2] - b[2]), x = a[0] + (b[0] - a[0]) * q, y = a[1] + (b[1] - a[1]) * q, l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
  const out = [cross(P[(s - 1 + N) % N], P[s])]; let i = s; while (vis[i % N]) { out.push([P[i % N][0], P[i % N][1]]); i++; }
  const qe = cross(P[(i - 1) % N], P[i % N]), qs = out[0]; out.push(qe);
  const fe = Math.atan2(qe[1], qe[0]), fs = Math.atan2(qs[1], qs[0]); let d = fs - fe; while (d <= 0) d += TAU;
  const mid = fe + d / 2; if (!inCap([Math.cos(mid), Math.sin(mid), 0])) d -= TAU;
  const steps = Math.max(2, Math.ceil(Math.abs(d) / 0.12)); for (let k = 1; k < steps; k++) { const f = fe + d * k / steps; out.push([Math.cos(f), Math.sin(f)]); }
  return out;
}

// ================================================================ человек
/** Нарисовать человека: L — облик (как раньше), view — front/fs/side/bs/back, pose — {walk, atk, hit, dead, t}. */
export function person(c, L, view, pose = {}) {
  const g = c, a = (VIEW_A[view] ?? 0) * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), Aca = Math.abs(ca), Asa = Math.abs(sa);
  const X = (l, f) => l * ca + f * sa, Z = (l, f) => -l * sa + f * ca, vis = phi => Math.cos(a + phi), tx = f => f * sa;
  const t = pose.t || 0, part = L.part;
  const ch = L.chest && C_BY[L.chest.m], chP = L.chest ? L.chest.P : NAKED;
  const lg = L.legs && L_BY[L.legs.m], lgP = L.legs ? L.legs.P : NAKED;
  const hm = L.head && H_BY[L.head.m], hmP = L.head ? L.head.P : null;
  const wp = !part && L.weapon && W_BY[L.weapon.m], wpP = L.weapon ? L.weapon.P : null;
  const style = L.swing || (wp && wp.swing) || 'chop';
  const PR = poseRig(pose, style, view), lean = PR.lean;
  const skin = L.skin || SKIN, hair = L.hair || '#b8642a', bw = L.broad || 1;
  const SW = 5.4 * bw, HW = 4.3, TOP = -29.6, HIP = -18.6, HEADY = -35.4, HR = 5.1, TD = 3.6;
  const robe = !!ch && ch.base === 'robe';
  const items = [], add = (z, fn) => items.push({ z, fn });

  // ---- цвета
  const chCol = !ch ? skin : ch.col ? chP[ch.col] : ch.base === 'shirt' ? chP.cloth[0] : ch.base === 'gambeson' ? chP.cloth[1] : ch.base === 'leather' ? chP.leather : ch.base === 'robe' ? chP.cloth[0] : ch.base === 'fur' ? '#7a5a3a' : chP.metal;
  const legCol = !lg ? skin : lg.col ? lgP[lg.col] : lg.base === 'cloth' ? lgP.cloth[1] : lg.base === 'leather' ? lgP.leather : lg.base === 'mail' ? sh(lgP.metal, -0.06) : lgP.metal;
  const bootCol = !lg ? sh(skin, -0.08) : lg.boots === 'sabaton' ? lgP.metal : lg.boots === 'shoe' ? '#5a3a22' : lg.boots === 'slipper' ? lgP.cloth[0] : lg.boots === 'fur' ? '#7a5a3a' : sh(lgP.leather, -0.22);
  const sleeve = !ch ? skin : ch.sleeve === 'cloth' ? (ch.base === 'gambeson' ? chP.cloth[1] : ch.base === 'fur' ? '#8a6a48' : chP.cloth[0]) : ch.sleeve === 'robe' ? chP.cloth[0] : ch.sleeve === 'leather' ? chP.leather : ch.sleeve === 'mail' ? sh(chP.metal, -0.06) : chP.metal;
  const glove = !ch ? skin : ch.sleeve === 'plate' ? sh(chP.metal, -0.08) : ch.base === 'leather' || ch.sleeve === 'mail' || ch.sleeve === 'leather' ? sh(chP.leather, -0.12) : skin;
  const acc = chP.acc || '#c9a050';
  const metalCh = ch && (ch.base === 'plate');

  g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  if (!part) {
    g.translate(0, RIG.FOOT); g.scale(RIG.K, RIG.K);
    const hit = pose.hit || 0, dead = pose.dead || 0;
    if (dead > 0) { const q = Math.min(1, dead * 1.6); g.translate(0, -6 * q); g.rotate((view === 'side' || view === 'fs' ? -1 : 1) * q * Math.PI / 2); }
    if (hit) { g.translate(-hit * 2.4 * sa, -hit * 1.2 * Aca); if (Asa > 0.5) g.rotate(-hit * 0.14); }
    g.translate(0, PR.bob);
  } else if (part === 'chest') g.translate(0, 18);   // значок: середина груди около нуля
  else if (part === 'legs') g.translate(0, 9);

  // ================================================================ плащ
  if (ch && ch.cape && !part) add(Z(0, -4), () => {
    const col = ch.cape === 'leaf' ? chP.leaf : chP.cloth[0], sw = Math.abs(PR.foot[0]) * 0.2, bot = robe ? -0.4 : -1.6;
    const pts = [[-SW + 0.2, -3, TOP + 1], [SW - 0.2, -3, TOP + 1], [SW + 1.4, -5 - sw, bot], [-SW - 1.4, -5 - sw, bot]].map(([l, f, y]) => [X(l, f + lean * 0.5), y]);
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); g.lineTo(pts[1][0], pts[1][1]); g.quadraticCurveTo(pts[2][0] + 0.8 * Math.sign(pts[2][0] - pts[3][0] || 1), (pts[1][1] + pts[2][1]) / 2, pts[2][0], pts[2][1]);
    g.quadraticCurveTo((pts[2][0] + pts[3][0]) / 2, pts[2][1] + 1.2, pts[3][0], pts[3][1]); g.quadraticCurveTo(pts[3][0] - 0.8 * Math.sign(pts[2][0] - pts[3][0] || 1), (pts[0][1] + pts[3][1]) / 2, pts[0][0], pts[0][1]); g.closePath();
    paint(g, ca < 0 ? col : sh(col, -0.22), LW, TOP, 0);
    if (ca < -0.3) { g.strokeStyle = sh(col, -0.25); g.lineWidth = 0.4; for (const l of [-2.6, 0, 2.6]) { g.beginPath(); g.moveTo(X(l * 0.6, -3), TOP + 3); g.lineTo(X(l, -5), bot - 1); g.stroke(); } g.beginPath(); g.moveTo(pts[3][0], pts[3][1] - 0.6); g.quadraticCurveTo((pts[2][0] + pts[3][0]) / 2, pts[2][1] + 0.6, pts[2][0], pts[2][1] - 0.6); trimLine(g, acc, 0.5); }
  });
  // колчан
  if ((L.quiver ?? L.cls === 'archer') && part !== 'chest' && part !== 'legs') add(Z(1.2, -4.4) + 0.1, () => {
    const col = chP.rar === 'epic' || chP.rar === 'rare' ? '#4a2c18' : '#7a5230', bx = X(1.2, -4.4 + lean * 0.4), y = TOP + 3;
    g.save(); g.translate(bx, y); g.rotate(0.32 * (ca >= 0 ? 1 : -1) * (Asa > 0.9 ? 0.4 : 1));
    for (let i = 0; i < 4; i++) { const x = -1.3 + i * 0.86; g.strokeStyle = '#c9b48a'; g.lineWidth = 0.45; g.beginPath(); g.moveTo(x, -7); g.lineTo(x, -9.6); g.stroke(); g.beginPath(); g.moveTo(x - 0.55, -9.4); g.lineTo(x, -11); g.lineTo(x + 0.55, -9.4); g.closePath(); g.fillStyle = i % 2 ? '#ece4d0' : '#d04a3a'; g.fill(); }
    g.beginPath(); g.roundRect(-2.1, -7.6, 4.2, 13, 1.6); paint(g, col, LW, -7.6, 5.4); g.beginPath(); g.roundRect(-2.3, -7.8, 4.6, 1.6, 0.7); paint(g, sh(col, -0.25), 0.5);
    g.restore();
  });

  // ================================================================ ноги
  const legItems = () => { for (const [i, l] of [[0, 2.7], [1, -2.7]]) {
    const fF = PR.foot[i], lift = PR.lift[i], kF = fF * 0.45 + 0.9, ky = -10.2 - lift * 0.4;
    add(Z(l, fF * 0.5) - 0.5, () => {
      const hx = X(l, lean * 0.3), kx = X(l, kF), ax = X(l, fF), ay = -2.6 - lift, near = Z(l, 0) >= -0.1, shade = near ? 0 : -0.12;
      const lc = sh(hx6(legCol), shade);
      if (!robe || part === 'legs') {
        capsule(g, hx, HIP + 1, kx, ky, 4.3, lc); capsule(g, kx, ky, ax, ay - 1, 3.7, lc);
        if (lg && lg.base === 'mail') { g.save(); g.beginPath(); g.moveTo(hx - 2, HIP + 1); g.lineTo(hx + 2, HIP + 1); g.lineTo(ax + 1.8, ay); g.lineTo(ax - 1.8, ay); g.closePath(); g.fillStyle = 'rgba(0,0,0,0)'; g.fill(); texture(g, 'mail', lc, Math.min(hx, ax) - 3, HIP, Math.max(hx, ax) + 3, ay); g.restore(); }
        if (lg && lg.base === 'scale') { g.save(); g.beginPath(); g.moveTo(hx - 2, HIP + 1); g.lineTo(hx + 2, HIP + 1); g.lineTo(kx + 1.9, ky); g.lineTo(kx - 1.9, ky); g.closePath(); texture(g, 'scale', lc, Math.min(hx, kx) - 3, HIP, Math.max(hx, kx) + 3, ky); g.restore(); }
        if (lg && lg.base === 'plate') {   // поножь
          g.save(); g.translate(kx, ky); const sx = ax - kx, sy = ay - ky, len = Math.hypot(sx, sy), ang = Math.atan2(sx, sy); g.rotate(-ang);
          g.beginPath(); g.moveTo(-2.2, 0.6); g.quadraticCurveTo(-2.7, len * 0.6, -2.5, len - 1); g.lineTo(2.5, len - 1); g.quadraticCurveTo(2.7, len * 0.6, 2.2, 0.6); g.closePath(); plate(g, sh(lgP.metal, shade), 0, len, -0.9, len * 0.4, 0.5, 1.3); g.restore();
          g.beginPath(); g.moveTo(hx - 2.3, HIP + 1.5); g.quadraticCurveTo(hx - 2.6, (HIP + ky) / 2, kx - 2.1, ky - 1); g.lineTo(kx + 2.1, ky - 1); g.quadraticCurveTo(hx + 2.6, (HIP + ky) / 2, hx + 2.3, HIP + 1.5); g.closePath(); plate(g, sh(lgP.metal, shade - 0.04), HIP, ky, null);
        }
        if (lg && (lg.knee || lg.base === 'plate')) { g.beginPath(); g.ellipse(kx + tx(0.6), ky, 2.6, 2.2, 0, 0, TAU); const kc = lg.base === 'plate' || lg.base === 'mail' ? lgP.metal : lg.col ? lgP[lg.col] : lgP.leather; plate(g, sh(kc, shade), ky - 2.2, ky + 2.2, kx + tx(0.6) - 0.8, ky - 0.8, 0.7, 0.5);
          if (vis(0) > 0.1 && lgP.acc) { g.beginPath(); g.ellipse(kx + tx(1.5), ky, 0.9 * Math.max(0.3, vis(0)), 0.9, 0, 0, TAU); g.fillStyle = lg.spikeKnee ? lgP.gem || lgP.acc : lgP.acc; g.fill(); }
          if (lg.spikeKnee) { g.beginPath(); g.moveTo(kx + tx(0.8) - 0.7, ky - 1.2); g.lineTo(kx + tx(2.6), ky - 4); g.lineTo(kx + tx(0.8) + 0.7, ky - 1.2); g.closePath(); paint(g, lgP.acc, 0.45); } }
      }
      // обувь: носок вперёд
      const toe = X(l, fF + 2.2), heel = X(l, fF - 1.4), wid = 2.3 * Aca + 0.6, x0 = Math.min(toe, heel) - wid, x1 = Math.max(toe, heel) + wid, mx = (toe + heel) / 2, bc = sh(hx6(bootCol), shade);
      const B = lg ? lg.boots : null;
      if (B === 'boot' || B === 'fur' || B === 'sabaton') {   // голенище
        const top = B === 'sabaton' ? ky + 1.6 : ay - 5.4;
        g.beginPath(); g.roundRect(ax - 2.1, top, 4.2, ay - top + 0.4, 1.1); if (B === 'sabaton') plate(g, bc, top, ay, ax - 1, top + 1.4, 0.4, 1.1); else paint(g, bc, LW, top, ay);
        if (B === 'sabaton') { g.strokeStyle = sh(bc, -0.4); g.lineWidth = 0.3; for (let y = top + 1.6; y < ay - 0.6; y += 1.4) { g.beginPath(); g.moveTo(ax - 1.8, y); g.lineTo(ax + 1.8, y); g.stroke(); } }
        else if (B === 'fur') { g.beginPath(); g.roundRect(ax - 2.5, top - 0.8, 5, 2.2, 1); paint(g, '#c8b090', 0.5); texture(g, 'fur', '#c8b090', ax - 3, top - 1, ax + 3, top + 2); }
        else { g.beginPath(); g.roundRect(ax - 2.2, top - 0.2, 4.4, 1.1, 0.5); paint(g, sh(bc, -0.25), 0.4); }
      }
      g.beginPath();
      if (B === 'slipper') { g.moveTo(x0, ay + 0.2); g.quadraticCurveTo(x0, ay - 2.4, mx, ay - 2.4); g.quadraticCurveTo(x1, ay - 2.2, x1 + 0.9 * (sa > 0.3 ? 1 : 0), ay - 0.8 - (sa > 0.3 ? 0.6 : 0)); g.quadraticCurveTo(mx, ay + 1.2, x0, ay + 0.2); g.closePath(); paint(g, bc, LW, ay - 2.4, ay + 1); }
      else { const h = B === 'shoe' || !B ? 2.4 : 3.4; g.moveTo(x0, ay + 0.2); g.quadraticCurveTo(x0, ay - h, mx, ay - h - 0.2); g.quadraticCurveTo(x1, ay - h, x1 + 0.3 * (sa > 0.3 ? 1 : 0), ay + 0.2); g.quadraticCurveTo(mx, ay + 1.3, x0, ay + 0.2); g.closePath();
        if (B === 'sabaton') plate(g, bc, ay - h, ay + 1, mx - 1, ay - h + 1.2, 0.8, 0.45); else paint(g, bc, LW, ay - h, ay + 1); }
    });
  } };
  if (part !== 'chest') legItems();
  // таз (штаны или исподнее) — поверх верха бёдер
  if (part !== 'chest' && !robe) add(2, () => {
    const W = HW * 2 * Aca + 7.4 * Asa, bx = X(0, lean * 0.3), col = lg ? legCol : '#ece6da';
    g.beginPath(); g.moveTo(bx - W / 2, HIP - 1.2); g.lineTo(bx + W / 2, HIP - 1.2); g.quadraticCurveTo(bx + W / 2 + 0.4, HIP + 2.4, bx + W / 2 - 0.4, HIP + 3.6); g.quadraticCurveTo(bx, HIP + 4.4, bx - W / 2 + 0.4, HIP + 3.6); g.quadraticCurveTo(bx - W / 2 - 0.4, HIP + 2.4, bx - W / 2, HIP - 1.2); g.closePath();
    if (lg && lg.base === 'plate') plate(g, col, HIP - 1, HIP + 4, null); else paint(g, col, LW, HIP - 1, HIP + 4);
    if (lg && (lg.base === 'mail' || lg.base === 'scale')) texture(g, lg.base, col, bx - W, HIP - 2, bx + W, HIP + 5);
    if (part === 'legs') { g.beginPath(); g.roundRect(bx - W / 2 - 0.2, HIP - 2.2, W + 0.4, 2, 0.9); paint(g, lg && lg.base === 'plate' ? lgP.acc || '#c9a050' : sh(lgP.leather || '#5a3a1c', -0.3), 0.5); }
  });
  if (part === 'legs') return finish();

  // ================================================================ корпус
  const bx = X(0, lean * 0.6), FD = TD + 0.6;
  const Wt = SW * 2 * Aca + 10 * Asa, Wh = HW * 2 * Aca + 7.6 * Asa, fx = bx + tx(1.4);
  const torsoPath = (grow = 0, bot = HIP + 0.4) => { g.beginPath(); g.moveTo(bx - Wt / 2 - 0.5 - grow, TOP + 1.2); g.quadraticCurveTo(bx - Wt / 2 - 1.1 - grow, TOP + 8, fx - Wh / 2 - grow, bot); g.quadraticCurveTo(fx, bot + 0.9, fx + Wh / 2 + grow, bot); g.quadraticCurveTo(bx + Wt / 2 + 1.1 + grow, TOP + 8, bx + Wt / 2 + 0.5 + grow, TOP + 1.2); g.quadraticCurveTo(bx, TOP - 0.7, bx - Wt / 2 - 0.5 - grow, TOP + 1.2); g.closePath(); };
  // наклейка на грудь (сторона phi, глубина f): видна, когда сторона к нам
  const front = (fn, phi = 0, f = FD) => { const v = vis(phi); if (v <= 0.06) return; g.save(); g.translate(bx + X(Math.sin(phi) * f, Math.cos(phi) * f) - X(0, 0), 0); g.scale(v, 1); fn(v); g.restore(); };
  add(0, () => {
    const base = ch ? ch.base : 'skin';
    torsoPath(base === 'mail' || base === 'fur' ? 0.3 : 0);
    if (base === 'plate') plate(g, chCol, TOP, HIP, fx - Wt * 0.24, TOP + 3.8, 1.1, 2.4);
    else paint(g, chCol, LW, TOP, HIP);
    const tex = { gambeson: 'quilt', mail: 'mail', scale: 'scale', fur: 'fur', robe: 'robe' }[base];
    if (tex) { torsoPath(); texture(g, tex, chCol, bx - Wt, TOP - 1, bx + Wt, HIP + 2); }
    else if (base !== 'plate') { torsoPath(); texture(g, 'none', chCol, bx - Wt, TOP - 1, bx + Wt, HIP + 2); }
    // лицевая сторона
    if (!ch) front(() => { g.strokeStyle = 'rgba(140,70,40,.45)'; g.lineWidth = 0.45; g.beginPath(); g.moveTo(-4, TOP + 5); g.quadraticCurveTo(-2, TOP + 7, -0.3, TOP + 5.6); g.moveTo(0.3, TOP + 5.6); g.quadraticCurveTo(2, TOP + 7, 4, TOP + 5); g.moveTo(0, TOP + 8); g.lineTo(0, HIP - 1); g.moveTo(-1.6, TOP + 10.4); g.lineTo(1.6, TOP + 10.4); g.stroke(); });
    if (base === 'shirt') front(() => { g.strokeStyle = sh(chCol, -0.38); g.lineWidth = 0.5; g.beginPath(); g.moveTo(-1.8, TOP + 0.4); g.lineTo(0, TOP + 3.2); g.lineTo(1.8, TOP + 0.4); g.stroke(); });
    if (base === 'leather') front(v => { g.beginPath(); g.moveTo(-SW + 0.6, TOP + 1.6); g.lineTo(-SW + 2.4, TOP + 0.8); g.lineTo(SW - 0.4, HIP - 1.4); g.lineTo(SW - 2.2, HIP - 0.8); g.closePath(); paint(g, sh(chP.leather, -0.35), 0.45); if (ch.studs) for (let y = TOP + 3; y < HIP - 1; y += 2.4) for (const x of [-3.4, -1.2, 1.2, 3.4]) rivet(g, x, y, 0.38, acc); });
    if (base === 'gambeson' || base === 'fur') front(() => { g.beginPath(); g.ellipse(0, TOP + 0.6, 3.8, 1.5, 0, 0, TAU); paint(g, base === 'fur' ? '#c8b090' : chP.cloth[0], 0.5); if (base === 'fur') texture(g, 'fur', '#c8b090', -4, TOP - 1, 4, TOP + 2.2); });
    if (base === 'plate') {
      front(v => { g.strokeStyle = 'rgba(255,255,255,.32)'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(0, TOP + 1.4); g.quadraticCurveTo(0.3, TOP + 6, 0, HIP - 1.4); g.stroke(); g.strokeStyle = ink(chCol); g.lineWidth = 0.4; g.beginPath(); g.moveTo(0.45, TOP + 1.4); g.quadraticCurveTo(0.75, TOP + 6, 0.45, HIP - 1.4); g.stroke();
        g.beginPath(); g.moveTo(-3.6, TOP + 1.6); g.quadraticCurveTo(0, TOP + 0.8, 3.6, TOP + 1.6); g.quadraticCurveTo(1.4, TOP + 2.4, 0, TOP + 4.6); g.quadraticCurveTo(-1.4, TOP + 2.4, -3.6, TOP + 1.6); g.closePath(); paint(g, acc, 0.55, TOP, TOP + 4.6);
        if (chP.gem) { g.beginPath(); g.arc(0, TOP + 7.2, 1.2, 0, TAU); paint(g, chP.gem, 0.5); shine(g, -0.4, TOP + 6.8, 0.4, 0.3, 0.75); } });
      front(() => { for (let i = 0; i < 4; i++) { g.beginPath(); g.roundRect(-1.4, TOP + 2 + i * 2.4, 2.8, 2, 0.8); plate(g, sh(chCol, 0.06), TOP, HIP, null); } }, Math.PI, FD - 0.6);
    }
    if (ch && ch.filigree) front(() => { g.strokeStyle = acc; g.lineWidth = 0.45; for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(sx * 1.4, TOP + 4.6); g.bezierCurveTo(sx * 4.2, TOP + 4.6, sx * 4.8, TOP + 7.4, sx * 3, TOP + 8.6); g.bezierCurveTo(sx * 2, TOP + 9.4, sx * 2.8, TOP + 10.6, sx * 4, TOP + 10.2); g.stroke(); } });
    if (ch && ch.flames) { torsoPath(); g.save(); g.clip(); for (let i = 0; i < 8; i++) { const x = bx - Wt / 2 + (i + 0.5) * Wt / 8, h = 2.6 + (i % 2) * 1.8; for (const [col, k] of [['#c83a1a', 1], ['#ff8a2a', 0.65], ['#ffd060', 0.35]]) { g.fillStyle = col; g.beginPath(); g.moveTo(x - 1 * k, HIP + 0.6); g.quadraticCurveTo(x - 0.6 * k, HIP - h * k * 0.6, x, HIP - h * k); g.quadraticCurveTo(x + 0.6 * k, HIP - h * k * 0.6, x + 1 * k, HIP + 0.6); g.closePath(); g.fill(); } } g.restore(); }
    if (robe) {
      front(() => { if (ch.panel) { g.beginPath(); g.roundRect(-1.7, TOP + 3, 3.4, HIP - TOP - 1.6, 0.6); paint(g, chP.cloth[1], 0.45); g.strokeStyle = acc; g.lineWidth = 0.4; g.stroke(); }
        g.beginPath(); g.moveTo(-2.4, TOP + 0.3); g.lineTo(0, TOP + 4.6); g.lineTo(2.4, TOP + 0.3); trimLine(g, ch.trim ? acc : sh(chCol, -0.3), 0.6); });
      if (ch.stars) { torsoPath(); g.save(); g.clip(); for (const [x, y] of [[-3, TOP + 4], [2.8, TOP + 6.5], [-1, TOP + 9], [3.6, TOP + 2.6]]) star(g, bx + x * Math.max(0.5, Aca), y, 0.7, chP.rar === 'epic' ? '#e8d8ff' : '#f4e8a0'); g.restore(); }
    }
    // накидка поверх кольчуги
    if (ch && ch.tabard) for (const phi of [0, Math.PI]) front(() => { g.beginPath(); g.moveTo(-3, TOP + 0.6); g.lineTo(3, TOP + 0.6); g.lineTo(3.3, HIP + 5); g.lineTo(0, HIP + 6.2); g.lineTo(-3.3, HIP + 5); g.closePath(); paint(g, chP.cloth[0], LW, TOP, HIP + 6); g.beginPath(); g.moveTo(-3, HIP + 4.4); g.lineTo(0, HIP + 5.6); g.lineTo(3, HIP + 4.4); trimLine(g, acc, 0.5);
      if (phi === 0) { g.beginPath(); g.moveTo(-1.8, TOP + 4); g.lineTo(1.8, TOP + 4); g.lineTo(1.8, TOP + 6.4); g.quadraticCurveTo(1.6, TOP + 8.2, 0, TOP + 9); g.quadraticCurveTo(-1.6, TOP + 8.2, -1.8, TOP + 6.4); g.closePath(); paint(g, acc, 0.45); g.beginPath(); g.moveTo(0, TOP + 5); g.lineTo(0.9, TOP + 6.5); g.lineTo(0, TOP + 7.9); g.lineTo(-0.9, TOP + 6.5); g.closePath(); g.fillStyle = chP.cloth[0]; g.fill(); } }, phi, FD + 0.1);
    // пояс
    const beltOn = ch && ch.base !== 'shirt' && (!robe || ch.belt);
    if (beltOn || metalCh) { const bc = metalCh ? acc : sh(chP.leather, -0.3); g.beginPath(); g.roundRect(fx - Wh / 2 - 0.3, HIP - 2.2, Wh + 0.6, 2.2, 1); paint(g, bc, 0.55, HIP - 2.2, HIP); front(v => { g.beginPath(); g.roundRect(-1.3, HIP - 2.5, 2.6, 2.8, 0.6); paint(g, metalCh ? sh(acc, -0.25) : acc, 0.45); }); }
    if (ch && (ch.base === 'shirt' || ch.rope)) { g.beginPath(); g.moveTo(fx - Wh / 2, HIP - 1); g.quadraticCurveTo(fx, HIP - 0.2, fx + Wh / 2, HIP - 1); trimLine(g, ch.rope ? '#c8a868' : '#8a6a3a', 0.8); if (ch.rope) front(() => { g.beginPath(); g.moveTo(1.2, HIP - 0.6); g.lineTo(1.6, HIP + 3.6); g.moveTo(2, HIP - 0.6); g.lineTo(2.6, HIP + 3); trimLine(g, '#c8a868', 0.5); }); }
    // ворот
    if (ch && ch.gorget) { g.beginPath(); g.ellipse(bx, TOP + 0.3, 3.9 * Aca + 3 * Asa, 1.8, 0, 0, TAU); plate(g, ch.base === 'scale' ? chP.leaf || chP.metal : chP.metal, TOP - 1.8, TOP + 2, null); g.beginPath(); g.ellipse(bx, TOP + 0.6, 3.5 * Aca + 2.6 * Asa, 1.3, 0, 0.15, Math.PI - 0.15); trimLine(g, acc, 0.45); }
    else if (ch && ch.base !== 'shirt' && ch.base !== 'robe' && ch.base !== 'gambeson' && ch.base !== 'fur') { g.beginPath(); g.ellipse(bx, TOP + 0.2, 3.4 * Aca + 2.6 * Asa, 1.4, 0, 0, TAU); paint(g, sh(chCol, 0.12), 0.55); }
  });
  // ---- подол: юбка куртки, пластины лат, мантия
  if (ch && !part || (part === 'chest' && ch)) {
    if (ch.base === 'plate') for (let i = 0; i < 8; i++) {
      const phi = i / 8 * TAU, l = Math.sin(phi) * 5, f = Math.cos(phi) * 3.5, v = vis(phi);
      if (v < -0.15) continue;
      add(Z(l, f) + 0.1, () => { const x = X(l, f) + tx(lean * 0.4), w = 4.2 * Math.max(0.25, v), h = 5.4 + (Math.abs(Math.cos(phi)) > 0.7 ? 0.8 : 0);
        g.beginPath(); g.moveTo(x - w / 2, HIP - 0.6); g.lineTo(x + w / 2, HIP - 0.6); g.quadraticCurveTo(x + w / 2 + 0.3, HIP + h * 0.7, x, HIP + h); g.quadraticCurveTo(x - w / 2 - 0.3, HIP + h * 0.7, x - w / 2, HIP - 0.6); g.closePath();
        plate(g, chCol, HIP, HIP + h, x - w * 0.18, HIP + h * 0.35, 0.4 * Math.max(0.4, v), h * 0.2);
        g.beginPath(); g.moveTo(x - w / 2 + 0.3, HIP + 0.4); g.lineTo(x + w / 2 - 0.3, HIP + 0.4); g.strokeStyle = acc; g.lineWidth = 0.65; g.stroke(); });
    }
    else if (robe) add(3.5, () => {
      const sw = PR.foot[0] * 0.18, W0 = HW * 2 * Aca + 7.6 * Asa, W1 = (SW + 2.4) * 2 * Aca + 11 * Asa, x0 = X(0, lean * 0.4), x1 = X(0, sw), bot = -1.2;
      const path = () => { g.beginPath(); g.moveTo(x0 - W0 / 2, HIP - 1.4); g.quadraticCurveTo(x0 - W0 / 2 - 1, -9, x1 - W1 / 2, bot); g.quadraticCurveTo(x1, bot + 1.2, x1 + W1 / 2, bot); g.quadraticCurveTo(x0 + W0 / 2 + 1, -9, x0 + W0 / 2, HIP - 1.4); g.closePath(); };
      path(); paint(g, chCol, LW, HIP, 0); path(); texture(g, 'robe', chCol, x1 - W1, HIP - 2, x1 + W1, 1);
      if (ch.stars) { path(); g.save(); g.clip(); for (const [x, y] of [[-3.6, -12], [3, -8.6], [-1, -5.6], [4.4, -3.4], [-4.8, -4.2], [1.6, -14]]) star(g, x1 + x * Math.max(0.45, Aca), y, 0.75, chP.rar === 'epic' ? '#e8d8ff' : '#f4e8a0'); g.restore(); }
      if (ch.flames) { path(); g.save(); g.clip(); for (let i = 0; i < 9; i++) { const x = x1 - W1 / 2 + (i + 0.5) * W1 / 9, h = 3.6 + (i % 3) * 1.6; for (const [col, k] of [['#c83a1a', 1], ['#ff8a2a', 0.7], ['#ffd060', 0.4]]) { g.fillStyle = col; g.beginPath(); g.moveTo(x - 1.2 * k, bot + 1); g.quadraticCurveTo(x - 0.8 * k, bot - h * k * 0.6, x, bot - h * k); g.quadraticCurveTo(x + 0.8 * k, bot - h * k * 0.6, x + 1.2 * k, bot + 1); g.closePath(); g.fill(); } } g.restore(); }
      const v = vis(0); if (v > 0.06 && ch.panel) { g.save(); g.translate(X(0, FD + 1.2) + x1 - X(0, 0), 0); g.scale(v, 1); g.beginPath(); g.moveTo(-1.7, HIP - 1); g.lineTo(1.7, HIP - 1); g.lineTo(2.6, bot - 0.2); g.lineTo(-2.6, bot - 0.2); g.closePath(); paint(g, chP.cloth[1], 0.45); g.strokeStyle = acc; g.lineWidth = 0.4; g.stroke(); g.restore(); }
      g.beginPath(); g.moveTo(x1 - W1 / 2 + 0.4, bot - 0.9); g.quadraticCurveTo(x1, bot + 0.3, x1 + W1 / 2 - 0.4, bot - 0.9); trimLine(g, ch.trim ? acc : sh(chCol, -0.3), 0.7);
    });
    else if (ch.base !== 'shirt') add(3.5, () => {
      const W = HW * 2 * Aca + 7.6 * Asa, x = X(0, lean * 0.3), col = ch.base === 'mail' ? sh(chP.metal, -0.04) : ch.base === 'leather' ? chP.leather : ch.base === 'fur' ? '#6e5034' : ch.base === 'scale' ? chCol : chP.cloth[1];
      const path = () => { g.beginPath(); g.moveTo(x - W / 2 - 0.2, HIP - 0.8); g.lineTo(x + W / 2 + 0.2, HIP - 0.8); g.quadraticCurveTo(x + W / 2 + 1, HIP + 2.4, x + W / 2 + 0.8, HIP + 4.4); g.quadraticCurveTo(x, HIP + 5.2, x - W / 2 - 0.8, HIP + 4.4); g.quadraticCurveTo(x - W / 2 - 1, HIP + 2.4, x - W / 2 - 0.2, HIP - 0.8); g.closePath(); };
      path(); paint(g, col, LW, HIP, HIP + 5); const tex = { mail: 'mail', scale: 'scale', fur: 'fur', gambeson: 'quilt' }[ch.base]; if (tex) { path(); texture(g, tex, col, x - W, HIP - 1, x + W, HIP + 6); }
      const v = vis(0); if (v > 0.2 && ch.base !== 'mail') { g.strokeStyle = ink(col); g.lineWidth = 0.45; g.beginPath(); g.moveTo(x + tx(FD), HIP); g.lineTo(x + tx(FD), HIP + 4.6); g.stroke(); }
      // пояс поверх юбки (у кожи, кольчуги, меха)
      g.beginPath(); g.roundRect(x - W / 2 - 0.3, HIP - 2, W + 0.6, 2.1, 1); paint(g, sh(chP.leather, -0.3), 0.5, HIP - 2, HIP);
      if (v > 0.2) { g.save(); g.translate(x + tx(FD), 0); g.scale(v, 1); g.beginPath(); g.roundRect(-1.2, HIP - 2.3, 2.4, 2.6, 0.6); paint(g, acc, 0.45); g.restore(); }
    });
  }

  // ================================================================ руки
  const shY = TOP + 2.2;
  const armPts = (l, th, bend, out = 0) => { const sF = lean * 0.6, ex = Math.sin(th) * 6, ey = Math.cos(th) * 6, t2 = th + bend; return { s: [l, sF, shY], e: [l + out * 0.5 * Math.sign(l), sF + ex, shY + ey], h: [l + out * Math.sign(l), sF + ex + Math.sin(t2) * 5.8, shY + ey + Math.cos(t2) * 5.8] }; };
  const P2 = p => [X(p[0], p[1]), p[2]];
  const drawArm = (A, near) => {
    const s = P2(A.s), e = P2(A.e), h = P2(A.h), shade = near ? 0 : -0.12, sc = sh(hx6(sleeve), shade), wide = ch && ch.sleeve === 'robe';
    capsule(g, s[0], s[1], e[0], e[1], wide ? 3.9 : 3.5, sc);
    const ang = Math.atan2(h[0] - e[0], h[1] - e[1]), len = Math.hypot(h[0] - e[0], h[1] - e[1]);
    g.save(); g.translate(e[0], e[1]); g.rotate(-ang);
    if (ch && ch.sleeve === 'plate') { g.beginPath(); g.moveTo(-1.8, 0.4); g.lineTo(-2.2, len - 1.8); g.quadraticCurveTo(0, len - 0.6, 2.2, len - 1.8); g.lineTo(1.8, 0.4); g.closePath(); plate(g, sh(chP.metal, shade), 0, len, -0.7, len * 0.4, 0.42, 1.1); g.beginPath(); g.ellipse(0, len - 1.6, 2.3, 0.75, 0, 0, TAU); paint(g, acc, 0.45); }
    else if (wide) { g.beginPath(); g.moveTo(-1.8, 0); g.lineTo(-3, len - 1.2); g.quadraticCurveTo(0, len, 3, len - 1.2); g.lineTo(1.8, 0); g.closePath(); paint(g, sc, LW, 0, len); g.beginPath(); g.moveTo(-3, len - 1.3); g.quadraticCurveTo(0, len - 0.1, 3, len - 1.3); trimLine(g, ch.trim ? acc : sh(sc, -0.3), 0.55); }
    else { capsule(g, 0, 0, 0, len, 3.1, sc); if (ch && (ch.sleeve === 'leather' || ch.base === 'leather') ) { g.beginPath(); g.roundRect(-1.9, len - 4, 3.8, 2.8, 0.9); paint(g, sh(chP.leather, -0.25 + shade), 0.45); } if (ch && ch.sleeve === 'mail') { g.beginPath(); g.roundRect(-1.6, 0, 3.2, len - 1, 1.5); texture(g, 'mail', sc, -2, 0, 2, len); } }
    g.restore();
    if (ch && ch.sleeve === 'plate') { g.beginPath(); g.ellipse(e[0], e[1], 2, 1.8, 0, 0, TAU); plate(g, sh(chP.metal, shade), e[1] - 2, e[1] + 2, e[0] - 0.6, e[1] - 0.6, 0.55, 0.45); }
    blob(g, h[0], h[1], 1.85, 1.75, sh(hx6(glove), shade));
    return h;
  };
  // правая рука (оружие) — l < 0, левая — l > 0
  const lR = -(SW + 1), lL = SW + 1;
  let AR = armPts(lR, PR.armR, PR.bendR, 0.4), AL = armPts(lL, PR.armL, -0.22, 0.3);
  if (part === 'chest') { AR = armPts(lR, 0.06, 0.06, 0.9); AL = armPts(lL, 0.06, 0.06, 0.9); }
  // оружие: хват в правой кисти, направление w в плоскости «вперёд-вниз» (0 — вниз, π — вверх) с наклоном наружу lt
  const two = wp && wp.hands === 2 && style === 'chop';
  const isBow = wp && wp.swing === 'bow';
  let wpn = null;
  if (wp && !isBow) {
    const H = AR.h, d = [-PR.lt, Math.sin(PR.w), Math.cos(PR.w)];
    wpn = { H, d, tip: [H[0] + d[0] * 16, H[1] + d[1] * 16, H[2] + d[2] * 16] };
    if (two) { const g2 = [H[0] - d[0] * 3.6, H[1] - d[1] * 3.6, H[2] - d[2] * 3.6], s = AL.s, m = [(s[0] + g2[0]) / 2 + 1.2, (s[1] + g2[1]) / 2 - 0.6, (s[2] + g2[2]) / 2 + 1.6]; AL = { s, e: m, h: g2 }; }
  }
  if (isBow) {
    if (PR.bow > 0) { const k = PR.bow, hand = [SW * 0.5, 10.5 * k + 1.6 * (1 - k), shY + 1 + (1 - k) * 9];
      AL = { s: AL.s, e: [lL + 0.6, (AL.s[1] + hand[1]) / 2, (shY + hand[2]) / 2 + 0.6], h: hand };
      const rh = [SW * 0.3, hand[1] - 2.2 - PR.pull * 8, hand[2]]; AR = { s: AR.s, e: [lR - 1.6, rh[1] - 3, shY + 0.8], h: rh }; }
    wpn = { H: PR.bow > 0 ? AL.h : AR.h, bow: true, hand: PR.bow > 0 ? AL : AR };   // в покое лук в правой руке (ближней сбоку), в выстреле — в левой
  }
  const zArm = A => Z(A.e[0], (A.e[1] + A.h[1]) / 2);
  add(zArm(AL) + 0.2, () => drawArm(AL, Z(lL, 0) >= -0.1 || Asa < 0.3));
  add(zArm(AR) + 0.2, () => drawArm(AR, Z(lR, 0) >= -0.1 || Asa < 0.3));
  if (wpn && !part) {
    const zw = wpn.bow ? Z(wpn.H[0], wpn.H[1]) + 0.3 : (Z(wpn.H[0], wpn.H[1]) + Z(wpn.tip[0], wpn.tip[1])) / 2 + 0.3;
    add(zw, () => drawWeapon());
  }
  function drawWeapon() {
    const s = 1.05, o = { t, glow: PR.glow, pull: PR.pull, arrow: isBow && PR.bow > 0.3 };
    g.save();
    if (wpn.bow) { const h = P2(wpn.H), fx2 = sa >= 0 ? Math.max(0.28, Asa) : -Math.max(0.28, Asa); g.transform(fx2 * s, 0, 0, s, h[0], h[1]); }
    else {
      const h = P2(wpn.H), dx = X(wpn.d[0], wpn.d[1]), dy = wpn.d[2], ln = Math.hypot(dx, dy) || 1, ux = dx / ln, uy = dy / ln, fl = Math.max(0.4, ln);
      let px = -uy, py = ux; const out = Math.sign(h[0] - bx) || -1;
      if (Asa > 0.35 ? px * sa < 0 : px * out < 0) { px = -px; py = -py; }
      const fk = 0.62 + 0.38 * Asa;
      g.transform(px * s * fk, py * s * fk, -ux * s * fl, -uy * s * fl, h[0], h[1]);
    }
    g.lineJoin = 'round'; g.lineCap = 'round'; wp.draw(g, wpP, o); g.restore();
    blob(g, ...P2(wpn.bow ? wpn.H : AR.h), 1.85, 1.75, hx6(glove));   // кисть поверх рукояти
    if (two) { const q = P2(AL.h); blob(g, q[0], q[1], 1.8, 1.7, hx6(glove)); }
    if (PR.trail) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(255,240,210,${PR.trail})`; g.lineWidth = 2.4; g.beginPath(); for (let k = 0; k <= 10; k++) { const th = 3.9 - k * 0.24, F = AR.s[1] + Math.sin(th) * 17, y = AR.s[2] + Math.cos(th) * 17; k ? g.lineTo(X(lR, F), y) : g.moveTo(X(lR, F), y); } g.stroke(); g.restore(); }
  }

  // ================================================================ наплечники
  if (ch && ch.pauld) for (const l of [lL - 0.6, lR + 0.6]) add(Z(l, 0) + 0.8, () => pauldron(X(l, lean * 0.6), TOP + 1.6, Math.sign(X(l, 0)) || Math.sign(l), Z(l, 0) >= -0.1 || Asa < 0.3));
  function pauldron(x, y, out, near) {
    const k = ch.pauld, P = chP, shade = near ? 0 : -0.12, M = sh(hx6(P.metal), shade);
    if (k === 'leather') { g.beginPath(); g.ellipse(x, y + 0.6, 3, 2.3, 0, Math.PI, 0); g.quadraticCurveTo(x, y + 2.2, x - 3, y + 0.6); g.closePath(); paint(g, sh(P.leather, shade), LW, y - 2, y + 2); return; }
    if (k === 'fur') { blob(g, x, y + 0.4, 3.4, 2.4, '#c8b090'); g.beginPath(); g.ellipse(x, y + 0.4, 3.4, 2.4, 0, 0, TAU); texture(g, 'fur', '#c8b090', x - 4, y - 2.4, x + 4, y + 3); return; }
    if (k === 'mantle') { g.beginPath(); g.moveTo(x - out * 2.6, y - 1.8); g.quadraticCurveTo(x + out * 2.8, y - 2.8, x + out * 3.8, y + 2.8); g.lineTo(x - out * 0.6, y + 3.2); g.closePath(); paint(g, P.cloth[1], LW, y - 2.8, y + 3.2); g.beginPath(); g.moveTo(x + out * 3.6, y + 2.6); g.lineTo(x - out * 0.6, y + 3); trimLine(g, P.acc, 0.5); return; }
    if (k === 'scale') { const col = ch.col ? P[ch.col] : P.metal; g.beginPath(); g.ellipse(x, y + 0.6, 3.3, 2.8, 0, Math.PI, 0); g.closePath(); paint(g, sh(col, shade), LW, y - 2.2, y + 0.6); g.beginPath(); g.ellipse(x, y + 0.6, 3.3, 2.8, 0, Math.PI, 0); g.closePath(); texture(g, 'scale', col, x - 4, y - 3, x + 4, y + 1); return; }
    if (k === 'wing') { for (let i = 0; i < 4; i++) { const yy = y - 1.4 + i * 1.4, Lw = 5 - i * 0.55; g.beginPath(); g.moveTo(x - out * 1.4, yy); g.quadraticCurveTo(x + out * Lw * 0.6, yy - 2.6 + i * 0.3, x + out * Lw, yy - 3 + i * 0.6); g.quadraticCurveTo(x + out * Lw * 0.7, yy + 0.4, x - out * 0.8, yy + 1.5); g.closePath(); paint(g, sh(P.cloth[0], 0.12 - i * 0.08 + shade), 0.5); g.beginPath(); g.moveTo(x - out * 0.6, yy + 0.2); g.quadraticCurveTo(x + out * Lw * 0.6, yy - 1.7 + i * 0.3, x + out * Lw * 0.95, yy - 2.8 + i * 0.6); g.strokeStyle = P.acc; g.lineWidth = 0.35; g.stroke(); } gemD(g, x, y - 1.4, 0.7, P.gem); return; }
    if (k === 'antler') { for (let i = 2; i >= 0; i--) { g.beginPath(); g.ellipse(x + out * i * 0.6, y + i * 0.9, 3.3 - i * 0.3, 2, out * (0.35 + i * 0.1), 0, TAU); paint(g, sh(P.leaf, -0.08 * i + shade), 0.5); }
      g.beginPath(); g.moveTo(x + out * 1.6, y - 1); g.quadraticCurveTo(x + out * 3.8, y - 3, x + out * 3.2, y - 5.8); g.moveTo(x + out * 2.9, y - 2.5); g.lineTo(x + out * 4.9, y - 3.6); trimLine(g, '#ece2c8', 0.6); gemD(g, x, y - 0.4, 0.6, P.gem); return; }
    // металл: plate — средний купол; big / hero / spike — огромные, в два слоя
    const big = k === 'big' || k === 'hero' || k === 'spike', R = big ? 4.8 : 3.6;
    if (big) { g.beginPath(); g.moveTo(x - R, y + 1.4); g.quadraticCurveTo(x - R - 0.4, y + 4.2, x, y + 4.4); g.quadraticCurveTo(x + R + 0.4, y + 4.2, x + R, y + 1.4); g.closePath(); plate(g, M, y, y + 4.4, null);
      g.beginPath(); g.moveTo(x - R + 0.2, y + 3.4); g.quadraticCurveTo(x, y + 5.2, x + R - 0.2, y + 3.4); trimLine(g, P.acc, 0.7); }
    g.beginPath(); g.moveTo(x - R - 0.3, y + 1.6); g.bezierCurveTo(x - R - 0.6, y - R * 0.9, x + R + 0.6, y - R * 0.9, x + R + 0.3, y + 1.6); g.quadraticCurveTo(x, y + 3.4, x - R - 0.3, y + 1.6); g.closePath(); plate(g, M, y - R, y + 2.4, x - 1.3, y - R * 0.4, big ? 1.4 : 1, 0.8);
    g.beginPath(); g.moveTo(x - R, y + 1.7); g.quadraticCurveTo(x, y + 3.4, x + R, y + 1.7); trimLine(g, P.acc, big ? 0.9 : 0.6);
    if (k === 'plate') for (const q of [-0.45, 0.45]) rivet(g, x + q * R, y + 1.9, 0.38);
    if (k === 'big') for (const q of [-0.3, 0.3]) { g.beginPath(); g.moveTo(x + q * R * 1.4 - 0.7, y - R * 0.6); g.lineTo(x + q * R * 1.4 + out * 1, y - R * 0.6 - 2.8); g.lineTo(x + q * R * 1.4 + 0.7, y - R * 0.6); g.closePath(); paint(g, P.edge || '#d8dce4', 0.45); }
    if (k === 'spike') for (const q of [-0.4, 0, 0.4]) { g.beginPath(); g.moveTo(x + q * R * 1.3 - 0.8, y - R * 0.62); g.lineTo(x + q * R * 1.6 + out * 1.2, y - R * 0.62 - 3.6 - (q === 0 ? 0.8 : 0)); g.lineTo(x + q * R * 1.3 + 0.8, y - R * 0.62); g.closePath(); paint(g, '#2a2226', 0.45); }
    if (k === 'hero') { g.beginPath(); g.moveTo(x + out * 1, y - R + 1); g.bezierCurveTo(x + out * 3.4, y - R - 1, x + out * 5.6, y - R, x + out * 4.8, y - R - 3.2); g.quadraticCurveTo(x + out * 4.2, y - R - 1.4, x + out * 2.6, y - R - 0.4); g.lineTo(x + out * 1.8, y - R + 1.4); g.closePath(); paint(g, P.acc, 0.5); }
    if (big) gemD(g, x, y - R * 0.3, 0.85, P.gem);
  }

  // ================================================================ голова
  if (part === 'chest') return finish();
  const hF = lean * 0.8, hcx = X(0, hF), hcy = HEADY;
  // длинные волосы спадают на спину
  const hideHair = hm && hm.hair === 'all' || !!L.hood;
  if (L.hairStyle === 'long' && !hideHair) add(Z(0, -2.6) + 0.05, () => { const W0 = HR * (1.7 * Aca + 0.95 * Asa), W1 = HR * (1.3 * Aca + 0.8 * Asa), x = X(0, -0.4 * HR + hF), x2 = X(0, -3.2 + lean * 0.5), y1 = TOP + 5.5;
    g.beginPath(); g.moveTo(x - W0 / 2, hcy - 1); g.quadraticCurveTo(x2 - W1 / 2 - 0.8, TOP, x2 - W1 / 2, y1 - 1.2); g.quadraticCurveTo(x2, y1 + 1.6, x2 + W1 / 2, y1 - 1.2); g.quadraticCurveTo(x2 + W1 / 2 + 0.8, TOP, x + W0 / 2, hcy - 1); g.closePath(); paint(g, hair, LW, hcy, y1); g.strokeStyle = sh(hair, -0.2); g.lineWidth = 0.35; for (const k of [-0.22, 0, 0.22]) { g.beginPath(); g.moveTo(x2 + k * W1, TOP - 3); g.lineTo(x2 + k * W1 * 1.1, y1 - 0.5); g.stroke(); } });
  // шея
  add(1.2, () => capsule(g, X(0, hF * 0.6), hcy + HR * 0.6, bx, TOP + 0.6, HR * 0.62, sh(skin, -0.06)));
  add(1.5, () => drawHead());
  if (part === 'head') { items.length = 0; add(0, () => drawHead()); }
  return finish();

  function finish() { items.sort((p, q) => p.z - q.z); for (const it of items) it.fn(); g.restore(); }

  // ---------------------------------------------------------------- голова: шар, лицо, волосы, шлем
  function drawHead() {
    const R = HR, KY = 1.06, cx = hcx, cy = hcy, E = [];   // E — части головы по глубине (0 — сама голова)
    const P3 = (l, f, u) => [cx + l * ca + f * sa, cy - u];
    const D3 = (l, f) => -l * sa + f * ca;
    const capPath = (n, al, r = R, ky = KY, dy = 0) => { const pts = capPts(ca, sa, n, al); if (!pts) return false; g.beginPath(); for (const ring of pts.hole ? [pts, pts.hole] : [pts]) { ring.forEach((p, i) => i ? g.lineTo(cx + p[0] * r, cy + dy + p[1] * r * ky) : g.moveTo(cx + p[0] * r, cy + dy + p[1] * r * ky)); g.closePath(); } return true; };
    const decal = (th, u, fn, r = R) => { const v = Math.cos(th + a); if (v <= 0.05) return; const k = Math.max(0, 1 - (u / (r * KY)) ** 2), rr = r * Math.sqrt(k); g.save(); g.translate(cx + rr * Math.sin(th + a), cy - u); g.scale(v, 1); fn(v); g.restore(); };
    const headPath = (r = R) => { g.beginPath(); g.ellipse(cx, cy, r, r * KY, 0, 0, TAU); };
    const hideFace = hm && (hm.id === 'great' || hm.id === 'warlord');
    const hairTop = hm && hm.hair === 'top', noHair = hideHair;
    const helmEls = hm ? helmet(hm.id, hmP) : L.hood ? helmet('mhood', { cloth: [L.hood, sh(L.hood, -0.2)], leather: L.hood, metal: L.hood, acc: sh(L.hood, 0.25), leaf: L.hood }) : [];
    const under = helmEls.filter(e => e.z < 0), over = helmEls.filter(e => e.z >= 0);
    under.sort((p, q) => p.z - q.z); over.sort((p, q) => p.z - q.z);
    if (part === 'head') { for (const e of under) e.fn(); for (const e of over) e.fn(); return; }
    // хвост и пышность волос — за головой
    if (!noHair) {
      if (L.hairStyle === 'tail') E.push({ z: D3(0, -R), fn: () => { const p0 = P3(0, -0.85 * R, 0.25 * R), p1 = P3(0, -1.35 * R, -0.6 * R), p2 = P3(0, -1.2 * R, -1.5 * R); g.beginPath(); g.moveTo(p0[0] - 0.9, p0[1]); g.quadraticCurveTo(p1[0] - 1.6, p1[1], p2[0], p2[1]); g.quadraticCurveTo(p1[0] + 1.6, p1[1], p0[0] + 0.9, p0[1]); g.closePath(); paint(g, hair, LW, p0[1], p2[1]); blob(g, p0[0], p0[1] + 0.6, 1.1, 0.8, '#7a2a20', 0.45); } });
      if (!hairTop) E.push({ z: -0.4, fn: () => { const x = cx - tx(0.12 * R); g.beginPath(); g.ellipse(x, cy - 0.16 * R, R * 1.04, R * 0.98, 0, 0, TAU); paint(g, hair, LW, cy - R, cy + R * 0.6); } });
    }
    // уши
    for (const s of [-1, 1]) { const th = s * Math.PI / 2, d = R * Math.cos(th + a); E.push({ z: d > 0.3 * R ? 0.1 : -0.3, fn: () => { const p = P3(s * R * 0.97, 0, -0.08 * R), w = R * (0.14 + 0.1 * Math.abs(Math.sin(th + a))); if (noHair && d < 0.3 * R) return; blob(g, p[0], p[1], w, R * 0.24, skin, 0.6); } }); }
    // сама голова
    E.push({ z: 0, fn: () => {
      headPath(); paint(g, skin, LW, cy - R, cy + R);
      g.save(); headPath(); g.clip();
      g.fillStyle = 'rgba(120,60,30,.14)'; g.beginPath(); g.ellipse(cx + R * 0.55, cy + R * 0.2, R * 0.6, R * 1.2, 0, 0, TAU); g.fill();   // тень справа
      if (!noHair) {   // волосы — всё, кроме лица
        g.fillStyle = hair; g.fillRect(cx - R * 1.2, cy - R * 1.3, R * 2.4, R * 2.6);
        if (capPath([0, 0.72, -0.7], 1.36)) { g.fillStyle = skin; g.fill(); g.fillStyle = 'rgba(120,60,30,.12)'; g.fill(); g.strokeStyle = sh(hair, -0.3); g.lineWidth = 0.5; g.stroke(); }
        shine(g, cx - R * 0.35 - tx(0.2 * R), cy - R * 0.78, R * 0.3, R * 0.11, 0.28);
      }
      if (L.cls === 'archer' && !L.beard) { if (capPath([0, 0.5, -0.86], 0.85)) { g.fillStyle = 'rgba(60,36,20,.22)'; g.fill(); } }
      g.restore();
      headPath(); g.strokeStyle = ink(skin); g.lineWidth = LW; g.stroke();
    } });
    // лицо
    if (!hideFace) E.push({ z: 0.05, fn: () => face() });
    // борода
    if (L.beard && !hideFace) {
      const bc = L.beard === 'grey' ? '#d8d2c8' : sh(hair, -0.05), long = L.beard === 'grey' && L.hairStyle === 'long';
      E.push({ z: D3(0, 0.55 * R) * 0.5 + 0.06, fn: () => {
        if (capPath([0, 0.48, -0.88], 0.95)) paint(g, bc, 0.55, cy, cy + R);
        const p = P3(0, 0.5 * R, long ? -1.25 * R : -0.9 * R), rx = R * (0.72 * Aca + 0.48 * Asa), ry = R * (long ? 0.75 : 0.42);
        if (vis(0) > -0.2) { g.beginPath(); g.moveTo(p[0] - rx, p[1] - ry * 1.3); g.quadraticCurveTo(p[0] - rx, p[1] + ry * 0.7, p[0] + tx(0.3 * R), p[1] + ry); g.quadraticCurveTo(p[0] + rx, p[1] + ry * 0.7, p[0] + rx, p[1] - ry * 1.3); g.closePath(); paint(g, bc, 0.55, p[1] - ry, p[1] + ry);
          g.strokeStyle = sh(bc, -0.22); g.lineWidth = 0.4; for (const k of [-0.45, 0, 0.45]) { g.beginPath(); g.moveTo(p[0] + k * rx, p[1] - ry * 0.6); g.lineTo(p[0] + k * rx * 0.8, p[1] + ry * 0.7); g.stroke(); } }
        // усы и рот
        decal(0, -0.38 * R, () => { g.beginPath(); g.moveTo(-R * 0.48, R * 0.12); g.quadraticCurveTo(-R * 0.22, -R * 0.1, 0, -R * 0.02); g.quadraticCurveTo(R * 0.22, -R * 0.1, R * 0.48, R * 0.12); g.quadraticCurveTo(0, R * 0.06, -R * 0.48, R * 0.12); g.closePath(); paint(g, sh(bc, -0.1), 0.45); g.strokeStyle = '#5a2a1a'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(-R * 0.15, R * 0.22); g.lineTo(R * 0.15, R * 0.22); g.stroke(); });
      } });
    }
    if (L.mask && !hideFace) E.push({ z: 0.08, fn: () => { if (capPath([0, 0.62, -0.78], 0.84, R * 1.02)) paint(g, L.mask, 0.55, cy, cy + R); } });
    for (const e of under) E.push({ z: -10 + e.z, fn: e.fn });
    for (const e of over) E.push({ z: 10 + e.z, fn: e.fn });
    E.sort((p, q) => p.z - q.z); for (const e of E) e.fn();

    function face() {
      for (const s of [-1, 1]) {
        const th = s * 0.42;
        decal(th, 0.04 * R, () => {   // глаз под тяжёлой бровью
          const blink = (t % 4.1) < 0.1;
          if (L.patch && s < 0) { g.beginPath(); g.ellipse(0, 0, R * 0.26, R * 0.22, 0, 0, TAU); paint(g, '#1c1410', 0.4); return; }
          if (blink) { g.strokeStyle = '#2a1a10'; g.lineWidth = 0.55; g.beginPath(); g.moveTo(-R * 0.17, 0); g.lineTo(R * 0.17, 0); g.stroke(); }
          else { g.fillStyle = '#f4efe6'; g.beginPath(); g.moveTo(-R * 0.21, R * 0.02); g.quadraticCurveTo(0, -R * 0.15, R * 0.21, 0); g.quadraticCurveTo(0, R * 0.12, -R * 0.21, R * 0.02); g.closePath(); g.fill();
            g.fillStyle = L.eyes || '#3a2a1a'; g.beginPath(); g.arc(R * 0.02 * s, 0, R * 0.095, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.arc(-R * 0.02, -R * 0.03, R * 0.03, 0, TAU); g.fill();
            g.strokeStyle = '#3a2214'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(-R * 0.22, R * 0.02); g.quadraticCurveTo(0, -R * 0.17, R * 0.22, 0); g.stroke(); }
          const bc = sh(L.beard === 'grey' ? '#a8a29a' : hair, -0.3);
          g.fillStyle = bc; g.beginPath(); g.moveTo(-s * R * 0.3, -R * 0.2); g.quadraticCurveTo(0, -R * 0.32, s * R * 0.1, -R * 0.24); g.lineTo(s * R * 0.22, -R * 0.12); g.quadraticCurveTo(0, -R * 0.22, -s * R * 0.3, -R * 0.14); g.closePath(); g.fill();
        });
      }
      decal(0, 0.22 * R, () => { g.strokeStyle = 'rgba(110,50,24,.5)'; g.lineWidth = 0.4; g.beginPath(); g.moveTo(-R * 0.06, -R * 0.06); g.lineTo(-R * 0.03, R * 0.05); g.moveTo(R * 0.06, -R * 0.06); g.lineTo(R * 0.03, R * 0.05); g.stroke(); });
      // нос — объёмный клин: сбоку выступает за щёку
      { const pt = [P3(0, 0.96 * R, 0.1 * R), P3(-0.17 * R, 1.1 * R, -0.2 * R), P3(0, 1.16 * R, -0.24 * R), P3(0.17 * R, 1.1 * R, -0.2 * R)];
        if (vis(0) > -0.35) { g.beginPath(); g.moveTo(pt[0][0], pt[0][1]); g.quadraticCurveTo(Math.min(pt[1][0], pt[3][0]) - 0.1, pt[1][1], pt[2][0], pt[2][1] + 0.35); g.quadraticCurveTo(Math.max(pt[1][0], pt[3][0]) + 0.1, pt[3][1], pt[0][0], pt[0][1]); g.closePath(); g.fillStyle = sh(skin, -0.06); g.fill(); g.strokeStyle = sh(skin, -0.4); g.lineWidth = 0.45; g.stroke(); } }
      if (!L.beard) decal(0, -0.5 * R, () => { g.strokeStyle = '#7a3a26'; g.lineWidth = 0.55; g.beginPath(); g.moveTo(-R * 0.2, 0); g.quadraticCurveTo(0, -R * 0.04, R * 0.2, R * 0.02); g.stroke(); g.strokeStyle = 'rgba(120,60,30,.3)'; g.beginPath(); g.moveTo(-R * 0.12, R * 0.14); g.lineTo(R * 0.12, R * 0.14); g.stroke(); });
      if (L.cls === 'warrior') decal(-0.5, 0.2 * R, () => { g.strokeStyle = 'rgba(150,60,50,.7)'; g.lineWidth = 0.45; g.beginPath(); g.moveTo(-R * 0.1, -R * 0.3); g.lineTo(R * 0.08, R * 0.32); g.stroke(); });
      if (L.patch) { const p = P3(-0.4 * R, 0.9 * R, 0.04 * R); if (vis(-0.42) > 0.05) { g.strokeStyle = '#1c1410'; g.lineWidth = 0.4; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(...P3(0.6 * R, 0.7 * R, 0.55 * R)); g.stroke(); } }
    }

    // ---------------------------------------------------------------- шлемы и головные уборы: список частей { z, fn } (z < 0 — за головой)
    function helmet(id, P) {
      const out = [], put = (z, fn) => out.push({ z, fn });
      const Rh = R * 1.1, metal = P.metal || '#8a929e';
      const shell = (n, al, col, isMetal, r = Rh, dy = 0) => { if (!capPath(n, al, r, KY, dy)) return; if (isMetal) plate(g, col, cy - r, cy + r * 0.3, cx - r * 0.35 - tx(0.2 * r), cy - r * 0.62, r * 0.17, r * 0.1); else paint(g, col, LW, cy - r, cy + r * 0.4); };
      const band = (u, h, col, r = Rh, isMetal = false) => { const y = cy - u; g.beginPath(); g.moveTo(cx - r, y); g.quadraticCurveTo(cx, y + r * 0.34, cx + r, y); g.lineTo(cx + r, y - h); g.quadraticCurveTo(cx, y - h + r * 0.34, cx - r, y - h); g.closePath(); if (isMetal) plate(g, col, y - h, y, null); else paint(g, col, 0.55, y - h, y); };
      const brim = (u, rx, col, ry = 0.3) => { g.beginPath(); g.ellipse(cx, cy - u, rx, rx * ry, 0, 0, TAU); paint(g, col, LW, cy - u - rx * ry, cy - u + rx * ry); shine(g, cx - rx * 0.4, cy - u - rx * ry * 0.3, rx * 0.35, rx * ry * 0.22, 0.2); };
      const ribbon = (pts, w, col) => { const S = pts.map(([l, f, u]) => P3(l, f, u)); g.beginPath(); S.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.strokeStyle = ink(col); g.lineWidth = w + 1.1; g.stroke(); g.strokeStyle = col; g.lineWidth = w; g.stroke(); };
      // капюшон / наголовник: всё, кроме лица (ось назад-вверх), шире головы
      const hood = (col, kind, tip, r = R * 1.16) => {
        put(-5, () => { g.beginPath(); g.ellipse(cx, cy, r, r * KY, 0, 0, TAU); g.fillStyle = '#1a120c'; g.fill(); });
        put(-4, () => { const w = r * (1.15 * Aca + 0.95 * Asa), y0 = cy + R * 0.5, y1 = TOP + 2.4; g.beginPath(); g.moveTo(cx - w * 0.7, y0); g.quadraticCurveTo(cx - w * 1.3, y1 - 1, bx - Wt * 0.48, y1); g.quadraticCurveTo(bx, y1 + 2.4, bx + Wt * 0.48, y1); g.quadraticCurveTo(cx + w * 1.3, y1 - 1, cx + w * 0.7, y0); g.closePath(); paint(g, sh(col, -0.08), LW, y0, y1 + 2); if (kind === 'mail') texture(g, 'mail', sh(col, -0.08), cx - w * 2, y0 - 2, cx + w * 2, y1 + 3); });
        put(1, () => {
          if (tip) { const p = P3(0, -1.25 * r, 0.75 * r); if (ca < 0.95) { g.beginPath(); g.moveTo(cx - r * 0.5, cy - r * 0.7); g.quadraticCurveTo(p[0] + 0.3, p[1] - 1.2, p[0], p[1]); g.quadraticCurveTo(p[0] + 1.8, p[1] + 2.2, cx + r * 0.5, cy - r * 0.2); g.closePath(); paint(g, col, LW, p[1], cy); } }
          if (capPath([0, -0.95, 0.32], 2.08, r)) { paint(g, col, LW, cy - r, cy + r); if (kind === 'mail') { capPath([0, -0.95, 0.32], 2.08, r); texture(g, 'mail', col, cx - r, cy - r * 1.2, cx + r, cy + r * 1.2); } else if (kind === 'quilt') { capPath([0, -0.95, 0.32], 2.08, r); texture(g, 'quilt', col, cx - r, cy - r * 1.2, cx + r, cy + r * 1.2); }
            g.save(); capPath([0, -0.95, 0.32], 2.08, r); g.clip(); g.fillStyle = 'rgba(20,10,4,.16)'; g.fillRect(cx + r * 0.25, cy - r * 1.3, r * 2, r * 2.6); g.restore(); }
          // тень под краем на лице
          if (vis(0) > 0.1) { g.save(); headPath(); g.clip(); const gr = g.createLinearGradient(0, cy - R * 0.75, 0, cy + R * 0.1); gr.addColorStop(0, 'rgba(15,8,4,.55)'); gr.addColorStop(1, 'rgba(15,8,4,0)'); g.fillStyle = gr; g.fillRect(cx - R, cy - R, 2 * R, R * 1.1); g.restore(); }
        });
      };
      const opening = (col, w = 0.6) => put(2, () => { const pts = capPts(ca, sa, [0, 0.95, -0.32], 1.06); if (!pts) return; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(cx + p[0] * R * 1.16, cy + p[1] * R * 1.16 * KY) : g.moveTo(cx + p[0] * R * 1.16, cy + p[1] * R * 1.16 * KY)); if (pts.length < 56) { g.closePath(); } else g.closePath(); trimLine(g, col, w); });
      // рог (3D): основание у виска, загиб наружу-вверх; s — сторона
      const horn = (s, col, pts, w = 1.6) => { const S = pts.map(([l, f, u]) => P3(s * l * R, f * R, u * R)); const z = D3(s * pts[0][0] * R, pts[0][1] * R); put(z < 0 ? -2 : 3, () => {
        g.beginPath(); g.moveTo(S[0][0] - w * 0.5, S[0][1] + w * 0.6); g.bezierCurveTo(S[1][0] - w * 0.4, S[1][1] + w * 0.5, S[2][0], S[2][1] + w * 0.3, S[3][0], S[3][1]); g.bezierCurveTo(S[2][0] + w * 0.6, S[2][1] - w * 0.2, S[1][0] + w * 0.5, S[1][1] - w * 0.6, S[0][0] + w * 0.5, S[0][1] - w * 0.6); g.closePath(); plate(g, col, S[3][1], S[0][1], null);
        g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 0.45; g.beginPath(); g.moveTo(S[1][0], S[1][1]); g.quadraticCurveTo(S[2][0], S[2][1], S[3][0], S[3][1] + 0.5); g.stroke(); }); };
      const wing = (s, col) => { const z = D3(s * R, -0.3 * R); put(z < 0 ? -2 : 3, () => { for (let i = 0; i < 4; i++) { const b = P3(s * R * 0.95, -0.2 * R, 0.35 * R - i * 0.12 * R), tip = P3(s * R * (1.5 + 0.35 * i * 0) + s * R * 0.6, -R * (0.9 + i * 0.25), R * (1.7 - i * 0.32)); g.beginPath(); g.moveTo(b[0], b[1]); g.quadraticCurveTo((b[0] + tip[0]) / 2, Math.min(b[1], tip[1]) - 0.6, tip[0], tip[1]); g.quadraticCurveTo((b[0] + tip[0]) / 2 + 0.6, (b[1] + tip[1]) / 2 + 1.2, b[0], b[1] + 1.4); g.closePath(); paint(g, sh(col, -i * 0.06), 0.55); } }); };
      const spikesRing = (u, n, len, col, r = Rh, tall = null) => { for (let i = 0; i < n; i++) { const th = (i / n) * TAU, d = Math.cos(th + a); const L2 = tall ? tall(i) : len; put(d < -0.05 ? -1.5 : 4 + d, () => { const p = [cx + r * Math.sin(th + a), cy - u], v = Math.max(0.3, Math.abs(d)); g.beginPath(); g.moveTo(p[0] - 0.75 * v, p[1]); g.lineTo(p[0], p[1] - L2); g.lineTo(p[0] + 0.75 * v, p[1]); g.closePath(); paint(g, d < 0 ? sh(col, -0.2) : col, 0.45); }); } };
      const crest = (col, hgt = 1.0, back = 1.0) => put(5, () => { const pts = []; for (let k = 0; k <= 8; k++) { const q = k / 8, ang = -0.3 + q * 2.0, rr = Rh + Math.sin(q * Math.PI) * R * 0.75 * hgt; pts.push(P3(0, Math.cos(ang) * rr * (q > 0.5 ? back : 1), Math.sin(ang) * rr + R * 0.15)); } g.beginPath(); const w = 1.1 * Aca + 0.2; pts.forEach((p, i) => i ? g.lineTo(p[0] - w, p[1]) : g.moveTo(p[0] - w, p[1])); for (let i = pts.length - 1; i >= 0; i--) g.lineTo(pts[i][0] + w, pts[i][1] + (Asa > 0.5 ? 1.6 : 0)); g.closePath(); paint(g, col, 0.55); });
      const closed = (col, accent) => {   // глухой шлем: силуэт цилиндром, забрало спереди, назатыльник сзади
        put(1, () => { const r = R * 1.16, top = cy - r * 1.08, bot = cy + r * 0.92; g.beginPath(); g.moveTo(cx - r, bot); g.lineTo(cx - r, cy - r * 0.15); g.bezierCurveTo(cx - r, top - r * 0.12, cx + r, top - r * 0.12, cx + r, cy - r * 0.15); g.lineTo(cx + r, bot); g.quadraticCurveTo(cx, bot + r * 0.3, cx - r, bot); g.closePath(); plate(g, col, top, bot, cx - r * 0.45 - tx(0.25 * r), cy - r * 0.5, r * 0.17, r * 0.32);
          decal(0, 0.05 * R, v => { g.fillStyle = '#0e0c12'; g.beginPath(); g.roundRect(-r * 0.66, -r * 0.08, r * 1.32, r * 0.2, r * 0.08); g.fill(); g.beginPath(); g.moveTo(-0.5, -r * 0.95); g.lineTo(0.5, -r * 0.95); g.lineTo(0.5, r * 0.85); g.lineTo(-0.5, r * 0.85); g.closePath(); paint(g, accent, 0.4); g.fillStyle = '#0e0c12'; for (const k of [-0.32, -0.16, 0.16, 0.32]) for (const yy of [0.3, 0.5]) { g.beginPath(); g.arc(r * k, r * yy, 0.32, 0, TAU); g.fill(); } }, r);
          decal(Math.PI, 0, () => { for (let i = 0; i < 3; i++) { g.beginPath(); g.roundRect(-r * 0.7 + i * 0.3, r * 0.15 + i * 1.3, r * 1.4 - i * 0.6, 1.3, 0.6); plate(g, sh(col, -0.05 * i), 0, 4, null); } }, r);
          g.beginPath(); g.moveTo(cx - r, bot - 0.4); g.quadraticCurveTo(cx, bot + r * 0.3 - 0.4, cx + r, bot - 0.4); trimLine(g, accent, 0.6); });
      };
      switch (id) {
        case 'cap': put(1, () => { shell([0, -0.12, 1], 1.08, P.leather, false); band(R * 0.32, 1.3, sh(P.leather, -0.25)); }); break;
        case 'coif': hood(P.cloth[0], 'quilt', false); break;
        case 'mailcoif': hood(P.metal, 'mail', false); break;
        case 'nasal': put(1, () => { shell([0, -0.08, 1], 1.15, metal, true); band(R * 0.36, 1.3, P.acc, Rh, true); decal(0, 0.15 * R, () => { g.beginPath(); g.roundRect(-0.5, -R * 0.2, 1, R * 0.62, 0.3); paint(g, P.acc, 0.45); }, Rh); }); break;
        case 'kettle': put(1, () => { brim(R * 0.42, R * 1.62, metal, 0.3); shell([0, 0, 1], 1.02, metal, true, Rh, -R * 0.1); band(R * 0.55, 1.1, P.acc, Rh * 0.92); }); break;
        case 'spangen': hood(P.metal, 'mail', false); put(3, () => { shell([0, -0.05, 1], 1.0, metal, true, Rh * 1.04, -R * 0.12); for (const th of [0, 1.1, -1.1, Math.PI]) { const d = Math.cos(th + a); if (d < 0.05) continue; g.beginPath(); for (let k = 0; k <= 6; k++) { const el = 0.5 + k / 6 * 1.0, rr = Rh * 1.04; const p = [cx + rr * Math.cos(el) * Math.sin(th + a), cy - R * 0.12 - rr * Math.sin(el) * KY]; k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } trimLine(g, P.acc, 0.5); } band(R * 0.45, 1.3, P.acc, Rh * 1.04, true); blob(g, cx, cy - R * 1.32, 0.7, 0.7, P.acc, 0.4); }); break;
        case 'horned': for (const s of [-1, 1]) horn(s, '#ece2c8', [[0.85, 0, 0.45], [1.6, 0.05, 0.75], [1.75, -0.05, 1.5], [1.45, -0.1, 2.05]], 1.7); put(1, () => { shell([0, -0.08, 1], 1.15, metal, true); band(R * 0.36, 1.4, P.acc, Rh, true); decal(0, 0.15 * R, () => { g.beginPath(); g.roundRect(-0.5, -R * 0.2, 1, R * 0.6, 0.3); paint(g, P.acc, 0.4); }, Rh); decal(0, 0.82 * R, () => gemD(g, 0, 0, 0.7, P.gem), Rh); }); break;
        case 'great': closed(metal, P.acc); break;
        case 'warlord': for (const s of [-1, 1]) horn(s, P.acc, [[0.9, -0.1, 0.3], [1.65, -0.2, 0.7], [1.7, -0.45, 1.5], [1.15, -0.75, 1.95]], 1.6); closed(metal, P.acc); crest(P.acc, 0.7); put(6, () => decal(0, 0.55 * R, () => gemD(g, 0, 0, 0.85, P.gem), R * 1.16)); break;
        case 'winged': hood(metal, 'metal', false, R * 1.12); for (const s of [-1, 1]) wing(s, '#f2eee4'); put(3, () => { shell([0, -0.05, 1], 1.1, metal, true, R * 1.15); band(R * 0.36, 1.2, P.acc, R * 1.15, true); decal(0, 0.62 * R, () => gemD(g, 0, 0, 0.8, P.gem), R * 1.15); }); break;
        case 'dragonhelm': hood(metal, 'metal', false, R * 1.14); for (const s of [-1, 1]) horn(s, P.acc, [[0.75, -0.3, 0.55], [1.25, -0.85, 0.8], [1.35, -1.35, 1.0], [1.15, -1.85, 1.45]], 1.5); put(3, () => { shell([0, -0.1, 1], 1.1, metal, true, R * 1.17); band(R * 0.38, 1.3, P.acc, R * 1.17, true); decal(0, 0.15 * R, () => { gemD(g, -1.6, 0, 0.5, P.gem); gemD(g, 1.6, 0, 0.5, P.gem); }, R * 1.17); }); spikesRing(R * 1.0, 0, 0, '#c83a1a'); crest('#c83a1a', 0.55, 1.15); break;
        case 'mhood': case 'cowl': case 'lhood': case 'fhood': case 'mantle': {
          const col = id === 'lhood' || id === 'fhood' ? P.leather : id === 'mantle' ? P.leaf : P.cloth[0];
          hood(col, 'cloth', true); if (id === 'cowl') opening(P.acc, 0.6);
          if (id === 'fhood') put(4, () => { const b = P3(0.7 * R, -0.3 * R, 0.8 * R), tp = P3(1.0 * R, -1.0 * R, 2.2 * R); g.beginPath(); g.moveTo(b[0] - 0.6, b[1]); g.quadraticCurveTo(tp[0] + 1.6, (b[1] + tp[1]) / 2, tp[0], tp[1]); g.quadraticCurveTo(tp[0] - 0.4, (b[1] + tp[1]) / 2, b[0] + 0.6, b[1]); g.closePath(); paint(g, P.rar === 'start' || P.rar === 'common' ? '#e8e0cc' : P.gem || '#d84040', 0.45); });
          if (id === 'mantle') put(-3.5, () => { const w = Wt * 0.62, y = TOP + 1; g.beginPath(); g.moveTo(cx - R, cy + R * 0.5); g.quadraticCurveTo(bx - w * 1.4, y, bx - w, y + 4); g.quadraticCurveTo(bx, y + 7, bx + w, y + 4); g.quadraticCurveTo(bx + w * 1.4, y, cx + R, cy + R * 0.5); g.closePath(); paint(g, sh(col, -0.1), LW, y - 3, y + 7); });
          break; }
        case 'frostcowl': hood(P.cloth[0], 'cloth', false); opening('#e8f8ff', 0.7); spikesRing(R * 1.0, 5, 0, '#cfeaff', R * 0.95, i => [3.4, 4.6, 3.2, 2.6, 2.6][i]); break;
        case 'staghood': hood(P.leather, 'cloth', false); opening(P.acc, 0.5); for (const s of [-1, 1]) { const z = D3(s * 0.5 * R, -0.2 * R); put(z < 0 ? -2 : 4, () => { const b = P3(s * 0.55 * R, -0.1 * R, 1.0 * R), m = P3(s * 0.9 * R, -0.3 * R, 1.7 * R), tp = P3(s * 0.75 * R, -0.45 * R, 2.5 * R), br = P3(s * 1.45 * R, -0.35 * R, 2.05 * R); g.beginPath(); g.moveTo(b[0], b[1]); g.quadraticCurveTo(m[0], m[1], tp[0], tp[1]); g.moveTo(m[0], m[1]); g.lineTo(br[0], br[1]); trimLine(g, '#ece2c8', 1.1); }); } put(4, () => { for (const s of [-1, 1]) { if (vis(s * 1.2) < -0.2) continue; const p = P3(s * 1.0 * R, 0.1 * R, -0.1 * R); g.beginPath(); g.ellipse(p[0], p[1], 1.5, 0.75, s * 0.6, 0, TAU); paint(g, P.leaf, 0.4); } }); break;
        case 'circlet': case 'band': put(2, () => { band(R * 0.5, id === 'band' ? 1.6 : 1.0, id === 'band' ? P.cloth[0] : P.acc, R * 1.04, id !== 'band'); if (id === 'circlet') decal(0, 0.52 * R, () => gemD(g, 0, -0.3, 0.75, P.gem || '#4a9eff'), R * 1.04); });
          if (id === 'band') put(-1, () => { const k = P3(0, -1.04 * R, 0.4 * R); if (vis(Math.PI) < -0.5) return; for (const s of [-1, 1]) { const e = [k[0] + s * 1.4 + tx(-1.2), k[1] + 3.2]; g.beginPath(); g.moveTo(k[0], k[1]); g.lineTo(e[0] - 0.6, e[1]); g.lineTo(e[0] + 0.6, e[1] + 0.4); g.closePath(); paint(g, P.cloth[0], 0.45); } }); break;
        case 'crown': put(2, () => band(R * 0.5, 1.3, P.acc, R * 1.04, true)); spikesRing(R * 0.5 + 1.2, 7, 2.6, P.acc, R * 1.0, i => i === 0 ? 3.8 : 2.4); put(6, () => decal(0, 0.55 * R, () => gemD(g, 0, -0.2, 0.8, P.gem || '#4a9eff'), R * 1.04)); break;
        case 'astral': put(2, () => band(R * 0.52, 1.4, P.acc, R * 1.04, true)); spikesRing(R * 0.52 + 1.3, 7, 3, P.acc, R * 1.0, i => [5.6, 3.8, 2.4, 2, 2, 2.4, 3.8][i]); put(7, () => { const y = cy - R * 2.5 + Math.sin(t * 2) * 0.4; star(g, cx, y, 1.8, '#f4e8ff'); g.beginPath(); g.arc(cx, y, 0.6, 0, TAU); g.fillStyle = P.gem; g.fill(); decal(0, 0.55 * R, () => gemD(g, 0, -0.2, 0.85, P.gem), R * 1.04); }); break;
        case 'wizard': case 'starhat': {
          const col = P.cloth[0], tall = id === 'starhat' ? 1.25 : 1;
          put(1, () => { brim(R * 0.42, R * 1.55, sh(col, -0.2), 0.28); const tip = P3(0, -1.1 * R, (2.8 * tall) * R), b0 = cy - R * 0.4, rc = R * 0.92; g.beginPath(); g.moveTo(cx - rc, b0); g.quadraticCurveTo(cx - rc * 0.6, cy - R * 1.7 * tall, tip[0], tip[1]); g.quadraticCurveTo(cx + rc * 0.5, cy - R * 1.4 * tall, cx + rc, b0); g.quadraticCurveTo(cx, b0 + R * 0.3, cx - rc, b0); g.closePath(); paint(g, col, LW, tip[1], b0);
            band(R * 0.55, 1.4, P.acc, rc); if (id === 'starhat') for (const [x, y] of [[-0.3, 1.2], [0.25, 1.9], [0.05, 0.95]]) star(g, cx + x * R * Math.max(0.5, Aca), cy - y * R * tall, 0.7, '#f4e8a0');
            if (P.gem) decal(0, 0.58 * R, () => gemD(g, 0, -0.3, 0.6, P.gem), rc); });
          break; }
        case 'huntcap': put(1, () => { shell([0, -0.12, 1], 1.1, P.leaf, false); decal(0, 0.35 * R, () => { g.beginPath(); g.ellipse(0, 0.3, R * 0.8, R * 0.22, 0, 0, Math.PI); g.closePath(); paint(g, sh(P.leaf, -0.2), 0.5); }, Rh); band(R * 0.35, 1.0, sh(P.leaf, -0.4)); }); put(4, () => feather(P.gem || (P.rar === 'good' ? '#5fd35f' : '#d84040'))); break;
        case 'ranger': case 'straw': {
          const col = id === 'straw' ? '#d8b44a' : sh(P.leather, -0.08);
          put(1, () => { brim(R * 0.42, R * (id === 'straw' ? 1.75 : 1.6), sh(col, -0.1), 0.3); shell([0, 0, 1], 1.02, col, false, Rh * 0.95, -R * 0.2); band(R * 0.62, 1.1, id === 'straw' ? '#5a3a1c' : sh(col, -0.45), Rh * 0.92);
            if (id === 'straw') { g.strokeStyle = '#b8942e'; g.lineWidth = 0.35; for (let i = -6; i <= 6; i++) { g.beginPath(); g.moveTo(cx + i * R * 0.24, cy - R * 0.42 + Math.abs(i) * 0.05); g.lineTo(cx + i * R * 0.27, cy - R * 0.42 + 1.1); g.stroke(); } } });
          if (id === 'ranger') put(4, () => feather(P.gem || '#d84040'));
          break; }
        case 'hawkmask': for (let i = 0; i < 5; i++) { const th = Math.PI + (i - 2) * 0.45, d = Math.cos(th + a); put(d < 0 ? -1.5 : 3, () => { const b = P3(Math.sin(th) * R * 0.8, Math.cos(th) * R * 0.8, R * 0.7), tp = P3(Math.sin(th) * R * 1.4, Math.cos(th) * R * 1.4 - R * 0.3, R * (2.2 - Math.abs(i - 2) * 0.35)); const cols = ['#8a2a14', '#e8c040', '#f4ead0', '#e8c040', '#8a2a14']; g.beginPath(); g.moveTo(b[0] - 0.8, b[1]); g.quadraticCurveTo(tp[0] - 1, (b[1] + tp[1]) / 2, tp[0], tp[1]); g.quadraticCurveTo(tp[0] + 1, (b[1] + tp[1]) / 2, b[0] + 0.8, b[1]); g.closePath(); paint(g, cols[i], 0.45); }); }
          put(1, () => { shell([0, -0.1, 1], 1.1, P.leather, false); }); put(6, () => decal(0, 0.12 * R, () => { g.beginPath(); g.moveTo(-R * 0.95, -R * 0.38); g.lineTo(R * 0.95, -R * 0.38); g.lineTo(R * 0.82, R * 0.12); g.lineTo(R * 0.22, R * 0.2); g.lineTo(0, R * 0.62); g.lineTo(-R * 0.22, R * 0.2); g.lineTo(-R * 0.82, R * 0.12); g.closePath(); plate(g, P.metal, -R * 0.4, R * 0.6, -R * 0.4, -R * 0.2, R * 0.2, R * 0.06); g.fillStyle = '#0a0806'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * R * 0.42, -R * 0.08, R * 0.2, R * 0.1, 0, 0, TAU); g.fill(); } gemD(g, 0, -R * 0.3, 0.6, P.gem); }, R * 1.04)); break;
        default: put(1, () => shell([0, -0.1, 1], 1.1, metal, true));
      }
      return out;
      function feather(col) { const b = P3(0.75 * R, -0.25 * R, 0.85 * R), tp = P3(1.15 * R, -1.1 * R, 2.3 * R); if (D3(0.75 * R, -0.25 * R) < -0.5 * R && ca < -0.6) return; g.beginPath(); g.moveTo(b[0] - 0.6, b[1]); g.quadraticCurveTo(tp[0] + 1.8, (b[1] + tp[1]) / 2, tp[0], tp[1]); g.quadraticCurveTo(tp[0] - 0.6, (b[1] + tp[1]) / 2, b[0] + 0.6, b[1]); g.closePath(); paint(g, col, 0.45); }
    }
  }
}

/** Цвет штанин (для сидящего героя). */
export function legColor(L) { const lg = L.legs && L_BY[L.legs.m], P = L.legs && L.legs.P; return !lg ? (L.skin || SKIN) : lg.col ? P[lg.col] : lg.base === 'cloth' ? P.cloth[1] : lg.base === 'leather' ? P.leather : lg.base === 'mail' ? sh(P.metal, -0.08) : P.metal; }
