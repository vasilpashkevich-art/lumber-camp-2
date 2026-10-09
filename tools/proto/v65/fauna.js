// Эскиз v65: звери и существа в новом подробном стиле — тот же, что у героев v64 (обводка, свет слева сверху, мех и чешуя).
// beast(c, kind, view, pose): ступни/лапы на земле в (0,0); view — side (вправо) / front / back; pose = { walk, atk, hit, dead, t }.
// Масштаб — единицы мира: рост героя ≈ 41. Собака/волк 0,4–0,6 в холке, кабан/бык 0,6–0,9, ворон 0,2–0,3, квакун 0,7–0,8.
export const O = '#24180f';
const TAU = Math.PI * 2;
export const sh = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join(''); };
const rng = s => () => { s = (s * 16807) % 2147483647; return s / 2147483647; };

let c; // текущий холст
function F(fn, fill, lw = 0.8) { c.beginPath(); fn(); if (fill) { c.fillStyle = fill; c.fill(); } if (lw) { c.strokeStyle = O; c.lineWidth = lw; c.stroke(); } }
function grad(y0, y1, top, bot) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, top); g.addColorStop(1, bot); return g; }
function limb(x1, y1, x2, y2, w1, w2, col) { // сужающийся отрезок с обводкой
  const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a), ny = Math.cos(a);
  const path = () => { c.moveTo(x1 + nx * w1 / 2, y1 + ny * w1 / 2); c.lineTo(x2 + nx * w2 / 2, y2 + ny * w2 / 2); c.arc(x2, y2, w2 / 2, a + Math.PI / 2, a - Math.PI / 2, true); c.lineTo(x1 - nx * w1 / 2, y1 - ny * w1 / 2); c.arc(x1, y1, w1 / 2, a - Math.PI / 2, a + Math.PI / 2, true); c.closePath(); };
  F(path, col, 0.7);
}
function eye(x, y, r, iris, slit = false) { F(() => c.ellipse(x, y, r, r * 0.8, 0, 0, TAU), iris, 0.4); c.fillStyle = '#140c06'; c.beginPath(); slit ? c.ellipse(x + r * 0.1, y, r * 0.18, r * 0.7, 0, 0, TAU) : c.arc(x + r * 0.15, y, r * 0.48, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.arc(x - r * 0.25, y - r * 0.3, r * 0.25, 0, TAU); c.fill(); }
let DEAD = false;
function shadow(rx, ry = rx * 0.3) { if (DEAD) return; c.fillStyle = 'rgba(0,0,0,.26)'; c.beginPath(); c.ellipse(0, 0.6, rx, ry, 0, 0, TAU); c.fill(); }
function furIn(path, col, n, len, ang, seed, w = 0.35) { c.save(); c.beginPath(); path(); c.clip(); const r = rng(seed); c.strokeStyle = col; c.lineWidth = w; c.beginPath(); for (let i = 0; i < n; i++) { const x = (r() - 0.5) * 80, y = -r() * 50, a = ang + (r() - 0.5) * 0.5; c.moveTo(x, y); c.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); } c.stroke(); c.restore(); }
function shadeR(path, k = 0.22, x0 = 0) { c.save(); c.beginPath(); path(); c.clip(); c.fillStyle = `rgba(20,10,4,${k})`; c.fillRect(x0, -80, 80, 100); c.restore(); }

// ======================================================== четвероногие
export const QUAD = {
  fox:  { len: 28, h: 16, bh: 8, legW: 2.2, head: 'canine', snout: 1.25, ears: 'tall', tail: 'brush', body: '#c8642a', dark: '#7a3a18', light: '#f4e6d0', socks: '#2e1c10', eye: '#e0a030' },
  wolf: { len: 38, h: 22, bh: 11, legW: 3, head: 'canine', snout: 1.05, ears: 'tall', tail: 'canine', mane: true, body: '#8a8f96', dark: '#4e535a', light: '#dfe2e5', eye: '#d8b44a' },
  dog:  { len: 33, h: 19, bh: 10, legW: 2.8, head: 'canine', snout: 0.95, ears: 'flop', tail: 'thin', body: '#6a4a32', dark: '#3a2a1e', light: '#c9a07a', eye: '#e8b040', collar: '#8a2a2a' },
  boar: { len: 40, h: 25, bh: 16, legW: 3.6, head: 'boar', tail: 'boar', ridge: true, hoof: true, body: '#5a4030', dark: '#33241a', light: '#8a6a4a', eye: '#2a1a10' },
  bull: { len: 56, h: 34, bh: 20, legW: 5, head: 'bull', tail: 'cow', hump: true, hoof: true, body: '#4a3226', dark: '#28190f', light: '#9a7a5e', eye: '#c8323a' },
};

function quadSide(S, p, W, bite, t) {
  const L = S.len, H = S.h, B = S.bh, bob = W ? -Math.abs(Math.sin(p * TAU)) * 0.9 : Math.sin(t * 2) * 0.2, top = -H + bob, bot = top + B;
  const lunge = bite * 3.5; c.translate(lunge, 0);
  shadow(L * 0.55);
  // ноги: перед и зад, дальние темнее; диагональная походка
  const legF = (x, ph, col, far) => { const a1 = W ? Math.sin(ph * TAU) * 0.42 : 0, bend = W ? Math.max(0, Math.cos(ph * TAU)) * 0.9 : 0, u = (H - B * 0.4);
    const y0 = top + B * 0.62, ex = x + Math.sin(a1) * u * 0.48, ey = y0 + Math.cos(a1) * u * 0.48, a2 = a1 - bend * 0.8, wx = ex + Math.sin(a2) * u * 0.42, wy = ey + Math.cos(a2) * u * 0.42, a3 = a2 + bend * 0.9, px = wx + Math.sin(a3) * u * 0.12, py = Math.min(-0.2, wy + Math.cos(a3) * u * 0.12);
    limb(x, y0, ex, ey, S.legW * 1.5, S.legW * 1.05, col); limb(ex, ey, wx, wy, S.legW * 1.05, S.legW * 0.85, col); paw(wx, wy, px, py, col, far); };
  const legB = (x, ph, col, far) => { const a1 = W ? Math.sin(ph * TAU) * 0.4 : 0, bend = W ? Math.max(0, Math.cos(ph * TAU)) * 0.7 : 0, u = H - B * 0.3;
    const y0 = top + B * 0.5, kx = x + Math.sin(a1 + 0.35) * u * 0.42, ky = y0 + Math.cos(a1 + 0.35) * u * 0.42, a2 = a1 - 0.6 - bend * 0.4, hx = kx + Math.sin(a2) * u * 0.36, hy = ky + Math.cos(a2) * u * 0.36, a3 = a1 + 0.1 - bend * 0.3, px = hx + Math.sin(a3) * u * 0.26, py = Math.min(-0.2, hy + Math.cos(a3) * u * 0.26);
    limb(x, y0, kx, ky, S.legW * 2.1, S.legW * 1.2, col); limb(kx, ky, hx, hy, S.legW * 1.15, S.legW * 0.8, col); paw(hx, hy, px, py, col, far); };
  const paw = (x1, y1, x2, y2, col, far) => { limb(x1, y1, x2, y2, S.legW * 0.8, S.legW * 0.75, S.socks && !far ? S.socks : col);
    if (S.hoof) F(() => { c.moveTo(x2 - S.legW * 0.55, y2 - S.legW * 0.5); c.lineTo(x2 + S.legW * 0.6, y2 - S.legW * 0.5); c.lineTo(x2 + S.legW * 0.75, y2 + 0.3); c.lineTo(x2 - S.legW * 0.6, y2 + 0.3); c.closePath(); }, '#1e140c', 0.5);
    else F(() => c.ellipse(x2 + S.legW * 0.35, y2 - 0.1, S.legW * 0.75, S.legW * 0.45, 0, 0, TAU), S.socks && !far ? S.socks : sh(col, -0.15), 0.5); };
  const xF = L * 0.3, xB = -L * 0.32, farC = sh(S.body, -0.32);
  tail(S, L, top, B, p, W, t, 'side');
  legF(xF - 1.2, p + 0.5, farC, true); legB(xB - 1.2, p, farC, true);
  // туловище
  const body = () => { const hu = S.hump ? 0.22 : S.ridge ? 0.14 : 0.04;
    c.moveTo(L * 0.46, top + B * 0.42); c.quadraticCurveTo(L * 0.42, top - B * (0.12 + hu), L * 0.24, top - B * hu * 0.8);
    c.bezierCurveTo(L * 0.05, top + B * 0.02, -L * 0.15, top + B * 0.04, -L * 0.34, top + B * 0.0);
    c.quadraticCurveTo(-L * 0.53, top + B * 0.08, -L * 0.48, top + B * 0.62); c.quadraticCurveTo(-L * 0.45, bot + B * 0.04, -L * 0.3, bot - B * 0.04);
    c.bezierCurveTo(-L * 0.06, bot + B * 0.06, L * 0.14, bot + B * 0.12, L * 0.3, bot - B * 0.04); c.quadraticCurveTo(L * 0.47, bot - B * 0.06, L * 0.46, top + B * 0.42); c.closePath(); };
  F(body, grad(top, bot, sh(S.body, 0.12), sh(S.body, -0.15)), 0.8);
  c.save(); c.beginPath(); body(); c.clip(); F(() => c.ellipse(L * 0.02, bot + B * 0.05, L * 0.34, B * 0.32, 0, 0, TAU), S.light, 0); c.fillStyle = sh(S.dark, 0) + '66'; c.beginPath(); c.ellipse(-L * 0.02, top - B * 0.05, L * 0.46, B * 0.35, 0, 0, TAU); c.fill(); c.restore();
  furIn(body, sh(S.dark, -0.1) + 'aa', 90, 1.6, 2.2, 7);
  if (S.ridge) { c.fillStyle = S.dark; c.beginPath(); c.moveTo(L * 0.34, top - B * 0.1); for (let i = 0; i <= 12; i++) { const x = L * 0.34 - i * L * 0.055, y = top - B * 0.1 + i * B * 0.012; c.lineTo(x + 0.6, y - 2.6 - (i % 2) * 1.4); c.lineTo(x - L * 0.027, y); } c.lineTo(-L * 0.32, top + B * 0.1); c.lineTo(L * 0.3, top + B * 0.08); c.closePath(); c.fill(); c.strokeStyle = O; c.lineWidth = 0.4; c.stroke(); }
  // плечо и бедро — мышцы
  F(() => c.ellipse(-L * 0.3, top + B * 0.45, L * 0.15, B * 0.42, 0.2, 0, TAU), null, 0); c.strokeStyle = sh(S.dark, -0.1) + '88'; c.lineWidth = 0.5; c.beginPath(); c.ellipse(-L * 0.3, top + B * 0.45, L * 0.14, B * 0.4, 0.2, -1.2, 1.6); c.stroke(); c.beginPath(); c.ellipse(L * 0.3, top + B * 0.45, L * 0.11, B * 0.36, -0.2, 1.2, 4); c.stroke();
  legB(xB + 0.6, p + 0.5, S.body, false); legF(xF + 0.6, p, S.body, false);
  if (S.mane) F(() => { c.moveTo(L * 0.18, top - 1); for (let i = 0; i <= 8; i++) { const a = -0.4 + i * 0.36; c.lineTo(L * 0.33 + Math.cos(a) * B * 0.62 + (i % 2) * 1.2, top + B * 0.3 + Math.sin(a) * B * 0.75); } c.closePath(); }, sh(S.body, 0.15), 0.6);
  headSide(S, L, top, B, bite, t);
}
function tail(S, L, top, B, p, W, t, view) {
  const sw = Math.sin(t * 3 + p * TAU) * (W ? 1.5 : 0.8), x0 = -L * 0.46, y0 = top + B * 0.2;
  if (S.tail === 'brush') { const fn = () => { c.moveTo(x0 + 1, y0 - 1); c.bezierCurveTo(x0 - 8, y0 - 4 + sw, x0 - 15, y0 + 3 + sw, x0 - 13, y0 + 9 + sw); c.quadraticCurveTo(x0 - 6, y0 + 9, x0, y0 + 3.5); c.closePath(); }; F(fn, grad(y0 - 4, y0 + 9, S.body, S.dark), 0.7); furIn(fn, S.dark, 25, 1.6, 2.6, 3); F(() => c.ellipse(x0 - 13, y0 + 8 + sw, 2.8, 2.2, -0.5, 0, TAU), '#f6f0e4', 0.6); return; }
  if (S.tail === 'canine') { F(() => { c.moveTo(x0 + 1, y0); c.bezierCurveTo(x0 - 6, y0 + 1 + sw, x0 - 10, y0 + 8 + sw, x0 - 9, y0 + 14 + sw); c.quadraticCurveTo(x0 - 5, y0 + 9, x0, y0 + 4); c.closePath(); }, grad(y0, y0 + 14, S.body, S.dark), 0.7); return; }
  if (S.tail === 'thin') { c.strokeStyle = O; c.lineWidth = 3; c.beginPath(); c.moveTo(x0 + 1, y0 + 1); c.quadraticCurveTo(x0 - 6, y0 - 4 + sw, x0 - 5, y0 - 9 + sw); c.stroke(); c.strokeStyle = S.body; c.lineWidth = 1.8; c.stroke(); return; }
  if (S.tail === 'boar') { c.strokeStyle = O; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x0 + 1, y0 + 2); c.bezierCurveTo(x0 - 3, y0, x0 - 4, y0 + 4, x0 - 2.4, y0 + 4); c.stroke(); c.strokeStyle = S.body; c.lineWidth = 0.8; c.stroke(); F(() => c.ellipse(x0 - 2.6, y0 + 5, 0.9, 1.6, 0.3, 0, TAU), S.dark, 0.4); return; }
  if (S.tail === 'cow') { c.strokeStyle = O; c.lineWidth = 2; c.beginPath(); c.moveTo(x0 + 1, y0); c.quadraticCurveTo(x0 - 3 + sw, y0 + 10, x0 - 1 + sw * 1.4, y0 + 20); c.stroke(); c.strokeStyle = S.body; c.lineWidth = 1; c.stroke(); F(() => c.ellipse(x0 - 1 + sw * 1.4, y0 + 22, 1.6, 3, 0, 0, TAU), S.dark, 0.5); }
}
function headSide(S, L, top, B, bite, t) {
  if (S.head === 'canine') {
    const s = B / 10, hx = L * 0.47, hy = top - B * 0.28 + bite * 2.5, sn = S.snout;
    // шея
    F(() => { c.moveTo(L * 0.18, top - 0.5); c.quadraticCurveTo(hx - 3 * s, hy - 3 * s, hx + 1 * s, hy - 2.6 * s); c.lineTo(hx + 2 * s, hy + 3 * s); c.quadraticCurveTo(L * 0.44, top + B * 0.7, L * 0.38, top + B * 0.7); c.closePath(); }, grad(top - 4, top + B, sh(S.body, 0.1), S.body), 0.7);
    if (S.collar) F(() => c.roundRect(hx - 1.6 * s, hy + 1.6 * s, 2.6 * s, 4.2 * s, 1), S.collar, 0.5);
    // уши
    if (S.ears === 'flop') F(() => { c.moveTo(hx - 1.4 * s, hy - 3 * s); c.quadraticCurveTo(hx - 4.6 * s, hy - 2 * s, hx - 3.6 * s, hy + 3 * s); c.quadraticCurveTo(hx - 1.4 * s, hy + 1.6 * s, hx + 0.2 * s, hy - 2.4 * s); c.closePath(); }, S.dark, 0.6);
    else { const eh = S.ears === 'tall' ? 7.4 : 6; F(() => { c.moveTo(hx - 2.2 * s, hy - 2.4 * s); c.lineTo(hx - 1.4 * s, hy - eh * s); c.lineTo(hx + 1.2 * s, hy - 2.8 * s); c.closePath(); }, S.dark, 0.6); F(() => { c.moveTo(hx - 1.4 * s, hy - 3.2 * s); c.lineTo(hx - 1.2 * s, hy - (eh - 1.4) * s); c.lineTo(hx + 0.2 * s, hy - 3.2 * s); c.closePath(); }, '#d89a8a', 0); }
    // нижняя челюсть
    const jaw = bite * 0.45;
    c.save(); c.translate(hx + 1.5 * s, hy + 1.6 * s); c.rotate(jaw); F(() => { c.moveTo(0, 0); c.lineTo(6.8 * s * sn, 0.4 * s); c.quadraticCurveTo(6.6 * s * sn, 1.6 * s, 5 * s * sn, 1.6 * s); c.lineTo(-0.6 * s, 1.8 * s); c.closePath(); }, S.light, 0.6); if (bite > 0.2) { c.fillStyle = '#f6f0e4'; for (let i = 0; i < 3; i++) c.fillRect((2 + i * 1.5) * s * sn, -0.4 * s, 0.5, 0.9); } c.restore();
    // череп и морда
    const head = () => { c.moveTo(hx - 3 * s, hy + 2.2 * s); c.bezierCurveTo(hx - 4 * s, hy - 3.6 * s, hx + 2 * s, hy - 4.2 * s, hx + 3.2 * s, hy - 1.8 * s); c.lineTo(hx + 8.6 * s * sn, hy + 0.2 * s); c.quadraticCurveTo(hx + 9.6 * s * sn, hy + 1.4 * s, hx + 8.4 * s * sn, hy + 2 * s); c.lineTo(hx + 2 * s, hy + 2.6 * s); c.quadraticCurveTo(hx - 1 * s, hy + 3.6 * s, hx - 3 * s, hy + 2.2 * s); c.closePath(); };
    F(head, grad(hy - 4 * s, hy + 3 * s, sh(S.body, 0.15), S.body), 0.7);
    c.save(); c.beginPath(); head(); c.clip(); F(() => c.ellipse(hx + 4 * s * sn, hy + 2.6 * s, 5 * s * sn, 1.6 * s, 0, 0, TAU), S.light, 0); c.restore();
    furIn(head, S.dark + '88', 18, 1, 2.8, 11, 0.3);
    F(() => c.ellipse(hx + 8.7 * s * sn, hy + 0.6 * s, 1.1 * s, 0.9 * s, 0, 0, TAU), '#1a120c', 0.4);
    c.strokeStyle = O; c.lineWidth = 0.4; c.beginPath(); c.moveTo(hx + 8.2 * s * sn, hy + 2 * s); c.lineTo(hx + 2.4 * s, hy + 2.5 * s); c.stroke();
    eye(hx + 2 * s, hy - 1 * s, 0.85 * s, S.eye); c.strokeStyle = sh(S.dark, -0.2); c.lineWidth = 0.5; c.beginPath(); c.moveTo(hx + 0.8 * s, hy - 2 * s); c.lineTo(hx + 3.2 * s, hy - 1.7 * s); c.stroke();
    return;
  }
  if (S.head === 'boar') {
    const s = B / 16, hx = L * 0.44, hy = top + B * 0.38 + bite * 2;
    const head = () => { c.moveTo(hx - 4 * s, hy - 7 * s); c.quadraticCurveTo(hx + 6 * s, hy - 6 * s, hx + 13 * s, hy + 1 * s); c.lineTo(hx + 13.6 * s, hy + 5 * s); c.quadraticCurveTo(hx + 8 * s, hy + 8 * s, hx + 1 * s, hy + 7 * s); c.quadraticCurveTo(hx - 5 * s, hy + 4 * s, hx - 4 * s, hy - 7 * s); c.closePath(); };
    F(head, grad(hy - 7 * s, hy + 7 * s, sh(S.body, 0.1), sh(S.body, -0.1)), 0.8); furIn(head, S.dark, 30, 1.4, 0.4, 5);
    F(() => c.ellipse(hx + 13.4 * s, hy + 3 * s, 1.4 * s, 2.4 * s, 0, 0, TAU), '#c98a7a', 0.6); c.fillStyle = '#4a2a1a'; c.beginPath(); c.ellipse(hx + 13.6 * s, hy + 2.4 * s, 0.4 * s, 0.6 * s, 0, 0, TAU); c.ellipse(hx + 13.6 * s, hy + 3.8 * s, 0.4 * s, 0.6 * s, 0, 0, TAU); c.fill();
    F(() => { c.moveTo(hx + 8 * s, hy + 5.6 * s); c.quadraticCurveTo(hx + 12 * s, hy + 5 * s, hx + 11 * s, hy + (1 - bite) * s); c.quadraticCurveTo(hx + 10.6 * s, hy + 4 * s, hx + 7.6 * s, hy + 4.4 * s); c.closePath(); }, '#f4ecd8', 0.5);
    F(() => { c.moveTo(hx - 2 * s, hy - 5.6 * s); c.lineTo(hx - 1 * s, hy - 10 * s); c.lineTo(hx + 2 * s, hy - 6 * s); c.closePath(); }, S.dark, 0.6);
    eye(hx + 4 * s, hy - 2.6 * s, 0.9 * s, '#3a2010'); return;
  }
  if (S.head === 'bull') {
    const s = B / 15, hx = L * 0.44, hy = top + B * 0.3 + bite * 4;
    F(() => { c.moveTo(L * 0.3, bot(S, top) - 2); c.quadraticCurveTo(L * 0.42, bot(S, top) + 4, L * 0.48, top + B * 0.9); c.lineTo(L * 0.44, top + B * 0.5); c.closePath(); }, sh(S.body, -0.1), 0.6); // подгрудок
    const head = () => { c.moveTo(hx - 2 * s, hy - 7 * s); c.quadraticCurveTo(hx + 8 * s, hy - 9 * s, hx + 11 * s, hy - 2 * s); c.lineTo(hx + 13 * s, hy + 8 * s); c.quadraticCurveTo(hx + 10 * s, hy + 12 * s, hx + 5 * s, hy + 10 * s); c.quadraticCurveTo(hx - 3 * s, hy + 6 * s, hx - 2 * s, hy - 7 * s); c.closePath(); };
    // рога
    F(() => { c.moveTo(hx + 2 * s, hy - 6 * s); c.quadraticCurveTo(hx - 4 * s, hy - 14 * s, hx + 6 * s, hy - 17 * s); c.quadraticCurveTo(hx + 0.6 * s, hy - 12 * s, hx + 5 * s, hy - 6.4 * s); c.closePath(); }, '#ece2c8', 0.6);
    F(head, grad(hy - 9 * s, hy + 10 * s, sh(S.body, 0.12), S.body), 0.8); furIn(head, S.dark, 30, 1.2, 1.2, 8);
    F(() => c.ellipse(hx + 11 * s, hy + 7 * s, 3.4 * s, 3 * s, 0.3, 0, TAU), S.light, 0.6); c.fillStyle = '#2a1a10'; c.beginPath(); c.ellipse(hx + 12.6 * s, hy + 6.4 * s, 0.7 * s, 1 * s, 0.4, 0, TAU); c.fill();
    c.strokeStyle = '#d8b44a'; c.lineWidth = 0.9; c.beginPath(); c.arc(hx + 12 * s, hy + 9.4 * s, 1.6 * s, -0.4, 2.4); c.stroke();
    F(() => c.ellipse(hx + 1 * s, hy - 4 * s, 2 * s, 1.1 * s, -0.5, 0, TAU), S.dark, 0.5);
    eye(hx + 5.4 * s, hy - 2.6 * s, 0.95 * s, S.eye);
  }
}
const bot = (S, top) => top + S.bh;

function quadFB(S, p, W, bite, t, back) {
  const H = S.h, B = S.bh, w = B * (S.head === 'bull' ? 1.05 : 0.92), bob = W ? -Math.abs(Math.sin(p * TAU)) * 0.9 : Math.sin(t * 2) * 0.2, top = -H + bob;
  shadow(w * 1.3, w * 0.5);
  const leg = (x, ph, col, h0, wd) => { const lift = W ? Math.max(0, Math.sin(ph * TAU)) * 2.2 : 0; limb(x, top + h0, x * 1.02, -lift - S.legW * 0.6, wd, wd * 0.7, col); if (S.hoof) F(() => c.roundRect(x * 1.02 - wd * 0.42, -lift - S.legW * 0.9, wd * 0.84, S.legW * 0.9, 0.4), '#1e140c', 0.5); else F(() => c.ellipse(x * 1.02, -lift - 0.3, wd * 0.5, wd * 0.32, 0, 0, TAU), S.socks || sh(col, -0.15), 0.5); };
  const farC = sh(S.body, -0.3);
  if (!back) {
    tailFB(S, w, top, B, p, W, t, false);
    F(() => c.ellipse(0, top + B * 0.2, w * 0.82, B * 0.5, 0, 0, TAU), grad(top - B * 0.3, top + B * 0.7, sh(S.body, 0.1), S.dark), 0.7); // спина за грудью
    leg(-w * 0.45, p + 0.5, farC, B * 0.5, S.legW * 1.2); leg(w * 0.45, p, farC, B * 0.5, S.legW * 1.2);
    const chest = () => c.ellipse(0, top + B * 0.55, w * 0.72, B * 0.62, 0, 0, TAU);
    F(chest, grad(top, top + B * 1.2, sh(S.body, 0.12), sh(S.body, -0.1)), 0.8); c.save(); c.beginPath(); chest(); c.clip(); F(() => c.ellipse(0, top + B * 0.95, w * 0.35, B * 0.5, 0, 0, TAU), S.light, 0); c.restore(); furIn(chest, S.dark + 'aa', 50, 1.4, 1.5, 9);
    leg(-w * 0.42, p, S.body, B * 0.8, S.legW * 1.5); leg(w * 0.42, p + 0.5, S.body, B * 0.8, S.legW * 1.5);
    headFront(S, w, top, B, bite);
  } else {
    headBack(S, w, top, B);
    leg(-w * 0.4, p, farC, B * 0.6, S.legW * 1.3); leg(w * 0.4, p + 0.5, farC, B * 0.6, S.legW * 1.3);
    const rump = () => c.ellipse(0, top + B * 0.5, w * 0.82, B * 0.68, 0, 0, TAU);
    F(rump, grad(top - B * 0.2, top + B * 1.2, sh(S.body, 0.12), sh(S.body, -0.12)), 0.8); furIn(rump, S.dark + 'aa', 50, 1.4, 1.6, 4);
    if (S.ridge) { c.fillStyle = S.dark; c.beginPath(); for (let i = 0; i <= 6; i++) { const x = -w * 0.4 + i * w * 0.13; c.lineTo(x, top - B * 0.14 - (i % 2) * 2); } c.lineTo(w * 0.4, top + B * 0.1); c.lineTo(-w * 0.4, top + B * 0.1); c.closePath(); c.fill(); }
    for (const sx of [-1, 1]) { c.strokeStyle = sh(S.dark, 0) + '99'; c.lineWidth = 0.5; c.beginPath(); c.ellipse(sx * w * 0.42, top + B * 0.65, w * 0.32, B * 0.45, 0, sx > 0 ? -1.4 : 1.7, sx > 0 ? 1.4 : 4.6); c.stroke(); }
    leg(-w * 0.48, p + 0.5, S.body, B * 0.95, S.legW * 1.7); leg(w * 0.48, p, S.body, B * 0.95, S.legW * 1.7);
    tailFB(S, w, top, B, p, W, t, true);
  }
}
function tailFB(S, w, top, B, p, W, t, back) {
  const sw = Math.sin(t * 3 + p * TAU) * 1.5;
  if (!back) { if (S.tail === 'brush' || S.tail === 'canine') F(() => c.ellipse(w * 0.7 + sw * 0.3, top - B * 0.2, 2.4, 3.4, 0.4, 0, TAU), S.tail === 'brush' ? S.body : S.dark, 0.6); return; }
  if (S.tail === 'brush') { const fn = () => { c.moveTo(-1.6, top + B * 0.1); c.bezierCurveTo(-4 + sw, top + B * 0.7, -2 + sw, top + B * 1.4, 0 + sw, top + B * 1.7); c.bezierCurveTo(3 + sw, top + B * 1.3, 4 + sw, top + B * 0.6, 1.6, top + B * 0.1); c.closePath(); }; F(fn, grad(top, top + B * 1.7, S.body, S.dark), 0.7); F(() => c.ellipse(sw, top + B * 1.65, 1.8, 1.6, 0, 0, TAU), '#f6f0e4', 0.5); return; }
  if (S.tail === 'canine') { F(() => { c.moveTo(-1.6, top + B * 0.1); c.quadraticCurveTo(-3 + sw, top + B * 1, sw, top + B * 1.5); c.quadraticCurveTo(3 + sw, top + B * 1, 1.6, top + B * 0.1); c.closePath(); }, grad(top, top + B * 1.5, S.body, S.dark), 0.7); return; }
  if (S.tail === 'cow') { c.strokeStyle = O; c.lineWidth = 2; c.beginPath(); c.moveTo(0, top + B * 0.2); c.quadraticCurveTo(sw, top + B * 0.9, sw * 1.2, top + B * 1.4); c.stroke(); c.strokeStyle = S.body; c.lineWidth = 1; c.stroke(); F(() => c.ellipse(sw * 1.2, top + B * 1.5, 1.4, 2.4, 0, 0, TAU), S.dark, 0.5); return; }
  if (S.tail === 'thin') { c.strokeStyle = O; c.lineWidth = 2.6; c.beginPath(); c.moveTo(0, top + B * 0.2); c.quadraticCurveTo(sw * 0.6, top - 3, sw, top - 6); c.stroke(); c.strokeStyle = S.body; c.lineWidth = 1.5; c.stroke(); return; }
  if (S.tail === 'boar') { c.strokeStyle = O; c.lineWidth = 1.4; c.beginPath(); c.arc(0, top + B * 0.2, 1.6, 0, 5); c.stroke(); }
}
function headFront(S, w, top, B, bite) {
  if (S.head === 'canine') {
    const s = B / 10, hy = top - B * 0.15 + bite * 2;
    if (S.mane) F(() => { for (let i = 0; i <= 14; i++) { const a = Math.PI * (0.05 + i / 14 * 0.9), r = (i % 2 ? 7.4 : 8.6) * s; c.lineTo(Math.cos(a) * r, hy + 2 * s + Math.sin(a) * r * 0.8); } c.closePath(); }, sh(S.body, 0.15), 0.6);
    if (S.collar) F(() => c.ellipse(0, hy + 4.4 * s, 4 * s, 1.4 * s, 0, 0, TAU), S.collar, 0.5);
    for (const sx of [-1, 1]) { if (S.ears === 'flop') F(() => { c.moveTo(sx * 2.4 * s, hy - 3 * s); c.quadraticCurveTo(sx * 6 * s, hy - 2.4 * s, sx * 5.4 * s, hy + 2.6 * s); c.quadraticCurveTo(sx * 3.6 * s, hy + 1 * s, sx * 2.6 * s, hy - 1.2 * s); c.closePath(); }, S.dark, 0.6);
      else { const eh = S.ears === 'tall' ? 8 : 6.4; F(() => { c.moveTo(sx * 1.4 * s, hy - 3 * s); c.lineTo(sx * 3.6 * s, hy - eh * s); c.lineTo(sx * 4.2 * s, hy - 1.6 * s); c.closePath(); }, S.dark, 0.6); F(() => { c.moveTo(sx * 2.2 * s, hy - 3.2 * s); c.lineTo(sx * 3.5 * s, hy - (eh - 1.6) * s); c.lineTo(sx * 3.7 * s, hy - 2 * s); c.closePath(); }, '#d89a8a', 0); } }
    const head = () => { c.moveTo(-4 * s, hy - 1 * s); c.bezierCurveTo(-4.4 * s, hy - 5 * s, 4.4 * s, hy - 5 * s, 4 * s, hy - 1 * s); c.quadraticCurveTo(3.6 * s, hy + 3 * s, 1.6 * s, hy + 4.4 * s); c.lineTo(-1.6 * s, hy + 4.4 * s); c.quadraticCurveTo(-3.6 * s, hy + 3 * s, -4 * s, hy - 1 * s); c.closePath(); };
    F(head, grad(hy - 5 * s, hy + 4 * s, sh(S.body, 0.15), S.body), 0.7);
    F(() => c.ellipse(0, hy + 2.4 * s * S.snout, 2.4 * s, 2.2 * s * S.snout, 0, 0, TAU), S.light, 0.5);
    F(() => c.ellipse(0, hy + 1.6 * s * S.snout, 1.2 * s, 0.9 * s, 0, 0, TAU), '#1a120c', 0.4);
    if (bite > 0.2) F(() => c.ellipse(0, hy + 3.8 * s, 1.4 * s, 1 * s * bite, 0, 0, TAU), '#7a2a22', 0.4);
    for (const sx of [-1, 1]) eye(sx * 1.9 * s, hy - 1.4 * s, 0.75 * s, S.eye);
    return;
  }
  if (S.head === 'boar') {
    const s = B / 16, hy = top + B * 0.35 + bite * 2;
    for (const sx of [-1, 1]) F(() => { c.moveTo(sx * 4 * s, hy - 6 * s); c.lineTo(sx * 8 * s, hy - 11 * s); c.lineTo(sx * 7.4 * s, hy - 4 * s); c.closePath(); }, S.dark, 0.6);
    const head = () => c.ellipse(0, hy, 7.4 * s, 7.6 * s, 0, 0, TAU); F(head, grad(hy - 8 * s, hy + 8 * s, sh(S.body, 0.1), S.body), 0.8); furIn(head, S.dark, 26, 1.3, 1.5, 6);
    F(() => c.ellipse(0, hy + 4.6 * s, 3.6 * s, 2.8 * s, 0, 0, TAU), '#c98a7a', 0.6); c.fillStyle = '#4a2a1a'; c.beginPath(); c.ellipse(-1.2 * s, hy + 4.6 * s, 0.6 * s, 0.9 * s, 0, 0, TAU); c.ellipse(1.2 * s, hy + 4.6 * s, 0.6 * s, 0.9 * s, 0, 0, TAU); c.fill();
    for (const sx of [-1, 1]) F(() => { c.moveTo(sx * 3 * s, hy + 6 * s); c.quadraticCurveTo(sx * 7 * s, hy + 6 * s, sx * 6.4 * s, hy + (1 - bite) * s); c.quadraticCurveTo(sx * 5.6 * s, hy + 4.4 * s, sx * 2.8 * s, hy + 4.8 * s); c.closePath(); }, '#f4ecd8', 0.5);
    for (const sx of [-1, 1]) eye(sx * 3 * s, hy - 2.4 * s, 0.8 * s, '#3a2010'); return;
  }
  if (S.head === 'bull') {
    const s = B / 15, hy = top + B * 0.2 + bite * 3;
    for (const sx of [-1, 1]) F(() => { c.moveTo(sx * 4 * s, hy - 6 * s); c.quadraticCurveTo(sx * 15 * s, hy - 8 * s, sx * 15 * s, hy - 17 * s); c.quadraticCurveTo(sx * 11 * s, hy - 10 * s, sx * 4 * s, hy - 3 * s); c.closePath(); }, '#ece2c8', 0.6);
    for (const sx of [-1, 1]) F(() => c.ellipse(sx * 8.4 * s, hy - 4 * s, 3 * s, 1.4 * s, sx * 0.4, 0, TAU), S.dark, 0.5);
    const head = () => { c.moveTo(-7 * s, hy - 6 * s); c.quadraticCurveTo(0, hy - 9 * s, 7 * s, hy - 6 * s); c.lineTo(5.4 * s, hy + 8 * s); c.quadraticCurveTo(0, hy + 11 * s, -5.4 * s, hy + 8 * s); c.closePath(); };
    F(head, grad(hy - 9 * s, hy + 10 * s, sh(S.body, 0.12), S.body), 0.8); furIn(head, S.dark, 30, 1.2, 1.5, 3);
    F(() => c.ellipse(0, hy + 7 * s, 4.6 * s, 3.4 * s, 0, 0, TAU), S.light, 0.6); c.fillStyle = '#2a1a10'; c.beginPath(); c.ellipse(-1.8 * s, hy + 7 * s, 0.8 * s, 1.1 * s, 0, 0, TAU); c.ellipse(1.8 * s, hy + 7 * s, 0.8 * s, 1.1 * s, 0, 0, TAU); c.fill();
    c.strokeStyle = '#d8b44a'; c.lineWidth = 0.9; c.beginPath(); c.arc(0, hy + 9.6 * s, 1.8 * s, 0.2, 2.9); c.stroke();
    for (const sx of [-1, 1]) eye(sx * 3.6 * s, hy - 1.6 * s, 0.95 * s, S.eye);
  }
}
function headBack(S, w, top, B) {
  const s = S.head === 'bull' ? B / 20 : S.head === 'boar' ? B / 16 : B / 10, hy = top - B * 0.05;
  if (S.head === 'bull') for (const sx of [-1, 1]) F(() => { c.moveTo(sx * 4 * s, hy - 4 * s); c.quadraticCurveTo(sx * 15 * s, hy - 6 * s, sx * 15 * s, hy - 15 * s); c.quadraticCurveTo(sx * 11 * s, hy - 8 * s, sx * 4 * s, hy - 1 * s); c.closePath(); }, '#ece2c8', 0.6);
  else for (const sx of [-1, 1]) { const eh = S.ears === 'flop' ? 2 : S.head === 'boar' ? 9 : 7.6; F(() => { c.moveTo(sx * 1.4 * s, hy - 1 * s); c.lineTo(sx * 3.4 * s, hy - eh * s); c.lineTo(sx * 4.2 * s, hy); c.closePath(); }, S.dark, 0.6); }
  F(() => c.ellipse(0, hy - 0.5 * s, (S.head === 'canine' ? 4 : 6) * s, (S.head === 'canine' ? 3.4 : 5) * s, 0, Math.PI, 0), sh(S.body, 0.08), 0.6);
}

// ======================================================== паук (лесной, тенепряд, паучиха-мать)
export const SPIDER = {
  spider:  { s: 1, body: '#3a2a3a', dark: '#22182a', mark: '#c8a040', eye: '#ff4a3a' },
  weaver:  { s: 1.3, body: '#1e1a2a', dark: '#100c18', mark: '#9a6aff', eye: '#c890ff', glow: true },
  broodmother: { s: 1.75, body: '#2a2228', dark: '#160f14', mark: '#c84040', eye: '#ff6a4a', sac: true, hair: true },
};
function spiderSide(S, p, W, bite, t) {
  const k = S.s, bob = W ? Math.sin(p * TAU * 2) * 0.5 : Math.sin(t * 3) * 0.2; shadow(16 * k, 4 * k);
  const leg = (i, near) => { const base = [4, 2, 0, -2][i] * k, ph = p + i * 0.25 + (near ? 0 : 0.5), lift = W ? Math.max(0, Math.sin(ph * TAU)) * 2.5 : 0, sw = W ? Math.cos(ph * TAU) * 2 : 0;
    const tipX = ([17, 10, -6, -14][i] + sw) * k + (near ? 0 : -2 * k), kneeX = ([10, 6, -2, -9][i]) * k + sw * k * 0.5, kneeY = (-15 - (i === 0 ? 2 : 0)) * k - lift * 0.5 + bob;
    const col = near ? S.body : S.dark;
    limb(base, -8 * k + bob, kneeX, kneeY, 1.6 * k, 1.2 * k, col); limb(kneeX, kneeY, tipX, -lift, 1.2 * k, 0.6 * k, col);
    if (S.hair) { c.strokeStyle = O; c.lineWidth = 0.3; for (let j = 1; j < 4; j++) { const x = kneeX + (tipX - kneeX) * j / 4, y = kneeY + (-lift - kneeY) * j / 4; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 1, y - 0.8); c.stroke(); } } };
  for (let i = 0; i < 4; i++) leg(i, false);
  if (S.sac) F(() => c.ellipse(-15 * k, -4 * k + bob, 4.5 * k, 3.6 * k, 0, 0, TAU), '#e8e0c8', 0.6);
  const abd = () => c.ellipse(-6 * k, -10 * k + bob, 8.4 * k, 6.8 * k, -0.15, 0, TAU);
  F(abd, grad(-17 * k, -3 * k, sh(S.body, 0.2), S.dark), 0.8);
  c.save(); c.beginPath(); abd(); c.clip(); c.fillStyle = S.mark; if (S.glow) { c.shadowColor = S.mark; c.shadowBlur = 4; } for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo((-11 + i * 3.4) * k, (-15 + i * 0.4) * k + bob); c.lineTo((-9.4 + i * 3.4) * k, (-12 + i * 0.4) * k + bob); c.lineTo((-12.6 + i * 3.4) * k, (-12 + i * 0.4) * k + bob); c.closePath(); c.fill(); } c.restore();
  furIn(abd, '#ffffff22', 40, 1, -1.2, 4, 0.3);
  const ceph = () => c.ellipse(3.4 * k, -8 * k + bob, 4.8 * k, 3.6 * k, 0.1, 0, TAU); F(ceph, grad(-12 * k, -4 * k, sh(S.body, 0.25), S.body), 0.7);
  for (const [x, y, r] of [[6.6, -9.4, 0.7], [7.4, -8.4, 0.55], [5.6, -10.2, 0.45]]) { c.fillStyle = S.eye; c.save(); c.shadowColor = S.eye; c.shadowBlur = 3; c.beginPath(); c.arc(x * k, y * k + bob, r * k, 0, TAU); c.fill(); c.restore(); }
  // хелицеры и клыки
  const open = bite * 0.5; for (const dy of [0, 0.8]) { c.save(); c.translate(7.6 * k, (-6.6 + dy) * k + bob); c.rotate(0.6 + open * (dy ? 1 : -0.4)); F(() => { c.moveTo(0, -0.8 * k); c.lineTo(2.4 * k, 0); c.lineTo(0, 0.8 * k); c.closePath(); }, S.dark, 0.5); F(() => { c.moveTo(2 * k, -0.3 * k); c.quadraticCurveTo(3.4 * k, 0.6 * k, 2.4 * k, 1.6 * k); c.lineTo(2.2 * k, 0.4 * k); c.closePath(); }, '#e8e0c8', 0.3); c.restore(); }
  for (let i = 0; i < 4; i++) leg(i, true);
}
function spiderFB(S, p, W, bite, t, back) {
  const k = S.s, bob = W ? Math.sin(p * TAU * 2) * 0.5 : 0; shadow(17 * k, 6 * k);
  const legs = (near) => { for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { const ph = p + i * 0.25 + (sx > 0 ? 0.5 : 0), lift = W ? Math.max(0, Math.sin(ph * TAU)) * 2 : 0;
    const by = (back ? [-11, -9, -7, -5] : [-5, -7, -9, -11])[i] * k, tipY = (back ? [-14, -6, 1, 4] : [4, 1, -6, -14])[i] * k * (near ? 1 : 1) + 2 * k, kx = sx * (8 + i * 0.6) * k, ky = by - 7 * k - lift, tx = sx * (16 - Math.abs(i - 1.5) * 1.6) * k;
    if (near !== (i < 2 !== back)) continue; limb(sx * 2.4 * k, by + bob, kx, ky + bob, 1.6 * k, 1.2 * k, near ? S.body : S.dark); limb(kx, ky + bob, tx, tipY - lift, 1.2 * k, 0.6 * k, near ? S.body : S.dark); } };
  legs(false);
  if (!back) { F(() => c.ellipse(0, -14 * k + bob, 7 * k, 6 * k, 0, 0, TAU), grad(-20 * k, -8 * k, sh(S.body, 0.15), S.dark), 0.8); const ceph = () => c.ellipse(0, -7 * k + bob, 4.4 * k, 3.8 * k, 0, 0, TAU); F(ceph, grad(-11 * k, -3 * k, sh(S.body, 0.25), S.body), 0.7);
    c.save(); c.shadowColor = S.eye; c.shadowBlur = 3; c.fillStyle = S.eye; for (const [x, y, r] of [[-1.4, -8.6, 0.7], [1.4, -8.6, 0.7], [-2.6, -9.4, 0.5], [2.6, -9.4, 0.5], [-0.6, -9.8, 0.4], [0.6, -9.8, 0.4]]) { c.beginPath(); c.arc(x * k, y * k + bob, r * k, 0, TAU); c.fill(); } c.restore();
    for (const sx of [-1, 1]) F(() => { c.moveTo(sx * 0.6 * k, -5 * k + bob); c.lineTo(sx * (1.4 + bite) * k, -1.6 * k + bob); c.lineTo(sx * 0.2 * k, -3 * k + bob); c.closePath(); }, '#e8e0c8', 0.4); }
  else { const ceph = () => c.ellipse(0, -9 * k + bob, 4.2 * k, 3.6 * k, 0, 0, TAU); F(ceph, S.body, 0.7); if (S.sac) F(() => c.ellipse(0, -2 * k + bob, 4.4 * k, 3.4 * k, 0, 0, TAU), '#e8e0c8', 0.6); const abd = () => c.ellipse(0, -10 * k + bob, 7.4 * k, 7 * k, 0, 0, TAU); F(abd, grad(-17 * k, -3 * k, sh(S.body, 0.2), S.dark), 0.8);
    c.save(); c.fillStyle = S.mark; if (S.glow) { c.shadowColor = S.mark; c.shadowBlur = 4; } c.beginPath(); c.moveTo(0, -15 * k + bob); c.lineTo(2 * k, -11 * k + bob); c.lineTo(0, -6 * k + bob); c.lineTo(-2 * k, -11 * k + bob); c.closePath(); c.fill(); c.restore(); }
  legs(true);
}

// ======================================================== ворон (летает)
function crow(view, p, W, bite, t) {
  const fl = Math.sin(t * 9 + p * TAU), body = '#1e1e28', dark = '#0e0e16', sheen = '#4a5a9a';
  c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(0, 0.5, 6, 1.8, 0, 0, TAU); c.fill(); // тень на земле (сам — выше)
  c.save(); c.translate(0, -16 + Math.sin(t * 2) * 1.2);
  if (view === 'side') {
    const wing = (far) => F(() => { c.moveTo(-1, -2); c.quadraticCurveTo(-6, -10 * fl - 2, -12, -9 * fl - 3); c.lineTo(-9, -6 * fl); c.lineTo(-11, -5 * fl + 1); c.quadraticCurveTo(-6, -1, -1, 1.4); c.closePath(); }, far ? dark : body, 0.6);
    wing(true);
    F(() => { c.moveTo(-6, -0.6); c.lineTo(-11, -1.6); c.lineTo(-11.4, 1.4); c.lineTo(-6, 1.2); c.closePath(); }, dark, 0.5);
    const b = () => c.ellipse(-1, 0, 6.4, 3.2, -0.1, 0, TAU); F(b, grad(-3, 3, sh(body, 0.25), body), 0.6); furIn(b, sheen + '66', 12, 1.2, 3, 2, 0.3);
    F(() => c.arc(5.2, -2, 2.6, 0, TAU), body, 0.6);
    F(() => { c.moveTo(7.2, -2.8); c.lineTo(11 + bite * 1.5, -1.6); c.lineTo(7.4, -0.8); c.closePath(); }, '#3a3a3a', 0.5); if (bite) F(() => { c.moveTo(7.4, -1); c.lineTo(10.4, -0.2 + bite * 1.4); c.lineTo(7.2, -0.2); c.closePath(); }, '#2a2a2a', 0.4);
    eye(5.8, -2.6, 0.6, '#d84a2a');
    c.strokeStyle = '#4a3a2a'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(0, 3); c.lineTo(1, 5); c.moveTo(-1.6, 3); c.lineTo(-1, 5); c.stroke();
    wing(false);
  } else {
    for (const sx of [-1, 1]) F(() => { c.moveTo(sx * 1.6, -1); c.quadraticCurveTo(sx * 7, -6 * fl - 3, sx * 13, -7 * fl - 2); c.lineTo(sx * 11, -4 * fl); c.lineTo(sx * 12, -3 * fl + 2); c.quadraticCurveTo(sx * 6, 2, sx * 1.6, 2); c.closePath(); }, view === 'back' ? body : dark, 0.6);
    F(() => c.ellipse(0, 0.6, 3.4, 4.6, 0, 0, TAU), grad(-4, 5, sh(body, 0.25), body), 0.6);
    if (view === 'front') { F(() => c.arc(0, -3.6, 2.6, 0, TAU), body, 0.6); F(() => { c.moveTo(-0.9, -3); c.lineTo(0, 0.4 + bite); c.lineTo(0.9, -3); c.closePath(); }, '#3a3a3a', 0.4); eye(-1.1, -4.2, 0.5, '#d84a2a'); eye(1.1, -4.2, 0.5, '#d84a2a'); }
    else { F(() => { c.moveTo(-1.6, 4); c.lineTo(0, 9); c.lineTo(1.6, 4); c.closePath(); }, dark, 0.5); F(() => c.arc(0, -3.6, 2.6, 0, TAU), body, 0.6); }
  }
  c.restore();
}

// ======================================================== пугало
function scarecrow(view, p, W, bite, t) {
  const hop = W ? Math.abs(Math.sin(p * TAU)) * 3 : 0, sw = W ? Math.sin(p * TAU) * 0.06 : Math.sin(t * 1.4) * 0.03; shadow(8, 2.6);
  c.save(); c.translate(0, -hop); c.rotate(sw);
  const pole = '#7a5a36', cloth = '#6a7a8a', patch = '#a85a3a', straw = '#d8b85a', sack = '#c8b088', side = view === 'side', back = view === 'back';
  limb(0, 0.6, 0, -34, 2.2, 1.8, pole);
  if (!side) limb(-15, -24, 15, -24, 1.8, 1.8, pole); else limb(-2, -24, 3, -24, 1.8, 1.8, pole);
  // рубаха с рукавами
  const shirt = () => { if (side) { c.moveTo(-3.4, -27); c.lineTo(3.4, -27); c.lineTo(4.4, -11); c.lineTo(2, -12.4); c.lineTo(0, -10.6); c.lineTo(-2.4, -12.6); c.lineTo(-4.2, -11); c.closePath(); return; }
    c.moveTo(-14, -26.4); c.lineTo(-5.6, -27.6); c.lineTo(5.6, -27.6); c.lineTo(14, -26.4); c.lineTo(14.6, -21.6); c.lineTo(6, -21.4); c.lineTo(6.6, -10); c.lineTo(3.4, -11.6); c.lineTo(1, -9.6); c.lineTo(-1.6, -11.8); c.lineTo(-4.4, -9.8); c.lineTo(-6.4, -11); c.lineTo(-6, -21.4); c.lineTo(-14.6, -21.6); c.closePath(); };
  F(shirt, grad(-28, -10, sh(cloth, 0.12), sh(cloth, -0.15)), 0.7);
  if (!side) { F(() => c.rect(-4.6 + (back ? 6 : 0), -20, 3.6, 3.4), patch, 0.5); c.strokeStyle = '#f0e6d0'; c.lineWidth = 0.3; c.setLineDash([0.6, 0.6]); c.strokeRect(-4.6 + (back ? 6 : 0), -20, 3.6, 3.4); c.setLineDash([]); }
  c.strokeStyle = '#5a3a1c'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(side ? -3.8 : -6.2, -16.6); c.lineTo(side ? 3.8 : 6.2, -16.6); c.stroke();
  // солома из рукавов и ворота
  c.strokeStyle = straw; c.lineWidth = 0.6; for (const sx of side ? [] : [-1, 1]) for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(sx * 14.4, -24 + i * 0.6); c.lineTo(sx * (17 + i * 0.3), -25 + i * 1.2); c.stroke(); }
  for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-2 + i * 0.8, -11); c.lineTo(-2.6 + i * 1.1, -7.6 - (i % 2)); c.stroke(); }
  // голова-мешок
  const hx = side ? 0.6 : 0, head = () => c.ellipse(hx, -31, side ? 4.2 : 4.8, 4.6, 0, 0, TAU);
  F(head, grad(-36, -26, sh(sack, 0.1), sh(sack, -0.15)), 0.7);
  c.strokeStyle = '#8a6a3a'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(hx - 4, -27.6); c.quadraticCurveTo(hx, -26.4, hx + 4, -27.6); c.stroke();
  if (!back) { const ex = side ? [2.4] : [-1.8, 1.8], glowE = bite > 0 || W; for (const x of ex) { c.fillStyle = glowE ? '#ffb030' : '#2a1a10'; if (glowE) { c.save(); c.shadowColor = '#ff9020'; c.shadowBlur = 4; } c.beginPath(); c.arc(hx + x, -31.6, 0.9, 0, TAU); c.fill(); if (glowE) c.restore(); }
    c.strokeStyle = '#2a1a10'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(hx + (side ? 1 : -2.4), -28.8); for (let i = 0; i <= 4; i++) c.lineTo(hx + (side ? 1 + i * 0.7 : -2.4 + i * 1.2), -28.8 + (i % 2) * 0.6); c.stroke(); }
  // соломенная шляпа
  F(() => c.ellipse(hx, -34.4, side ? 6 : 7.2, 1.6, side ? -0.1 : 0, 0, TAU), sh(straw, -0.1), 0.6);
  F(() => { c.moveTo(hx - 3.6, -34.6); c.quadraticCurveTo(hx - 3, -39, hx + 0.4, -38.8); c.quadraticCurveTo(hx + 3.6, -38.6, hx + 3.6, -34.6); c.closePath(); }, straw, 0.6);
  c.restore();
}

// ======================================================== квакуны (лягушачий народ)
export const KVAK = {
  kvakun: { skin: '#5a9a4a', dark: '#2e5a28', belly: '#e0d89a', spot: '#2a4a24', fin: '#c8642a', weapon: 'spear', cloth: '#8a6a3a' },
  kvak_shaman: { skin: '#4a8a8a', dark: '#245050', belly: '#d8e0b0', spot: '#1e4040', fin: '#8a4ac8', weapon: 'staff', cloth: '#5a3a6a', mask: true },
};
function kvakun(K, view, p, W, bite, t) {
  const hop = W ? Math.abs(Math.sin(p * TAU)) * 1.8 : 0, bob = Math.sin(t * 2.4) * 0.3, side = view === 'side', back = view === 'back';
  shadow(9, 3);
  c.save(); c.translate(0, -hop + bob);
  // ноги: согнутые, длинные стопы с перепонками
  const legF = (sx, ph, col) => { const sw = W ? Math.sin(ph * TAU) * 3 : 0; if (side) { const hx = sx * 0.6, kx = 4 + sw, ky = -6, fx = -1 + sw * 0.6; limb(hx, -10, kx, ky, 4, 2.6, col); limb(kx, ky, fx, -1.2, 2.6, 1.8, col); F(() => { c.moveTo(fx - 1, -1.6); c.lineTo(fx + 6, -0.6); c.lineTo(fx + 6.4, 0.4); c.lineTo(fx - 1.6, 0.4); c.closePath(); }, col, 0.5); }
    else { const x = sx * 4, kx = sx * 7, lift = W ? Math.max(0, Math.sin(ph * TAU)) * 2 : 0; limb(x, -9, kx, -5 - lift, 4, 2.8, col); limb(kx, -5 - lift, sx * 4.6, -1 - lift, 2.8, 2, col); F(() => { c.moveTo(sx * 3, -1 - lift); for (let i = 0; i < 3; i++) { c.lineTo(sx * (3.6 + i * 1.4), 0.6 - lift); c.lineTo(sx * (4.2 + i * 1.4), -0.4 - lift); } c.lineTo(sx * 7.8, -1 - lift); c.closePath(); }, col, 0.5); } };
  legF(-1, p + 0.5, sh(K.skin, -0.2)); legF(1, p, K.skin);
  // тело-груша
  const body = side ? () => { c.moveTo(-4.6, -20); c.bezierCurveTo(-7, -14, -6, -8, -2, -7.4); c.lineTo(3.6, -7.6); c.bezierCurveTo(6.4, -9, 6.8, -16, 4.2, -21); c.closePath(); }
    : () => { c.moveTo(-5.6, -21); c.bezierCurveTo(-8.6, -15, -7.6, -8, -3, -7.2); c.lineTo(3, -7.2); c.bezierCurveTo(7.6, -8, 8.6, -15, 5.6, -21); c.closePath(); };
  F(body, grad(-21, -7, sh(K.skin, 0.1), K.dark), 0.8);
  if (!back) { c.save(); c.beginPath(); body(); c.clip(); F(() => c.ellipse(side ? 2.6 : 0, -12, side ? 3.2 : 4.4, 5.6, 0, 0, TAU), K.belly, 0); c.strokeStyle = sh(K.belly, -0.2); c.lineWidth = 0.3; for (let y = -16; y < -8; y += 1.4) { c.beginPath(); c.moveTo(side ? 0 : -3.6, y); c.lineTo(side ? 5 : 3.6, y); c.stroke(); } c.restore(); }
  { const r = rng(K.skin.length * 31 + 5); c.save(); c.beginPath(); body(); c.clip(); c.fillStyle = K.spot; for (let i = 0; i < 10; i++) { const x = (r() - 0.5) * 12, y = -20 + r() * 12; if (!back && Math.abs(x - (side ? 2.6 : 0)) < 3.6) continue; c.beginPath(); c.ellipse(x, y, 0.8 + r() * 0.8, 0.6 + r() * 0.5, r(), 0, TAU); c.fill(); } c.restore(); }
  // пояс с ракушками и юбка из травы
  F(() => { c.moveTo(side ? -5.6 : -7, -10.6); c.lineTo(side ? 5.4 : 7, -10.6); c.lineTo(side ? 5.8 : 7.4, -6); c.lineTo(side ? -6 : -7.4, -6); c.closePath(); }, K.cloth, 0.5); c.strokeStyle = sh(K.cloth, -0.35); c.lineWidth = 0.35; for (let x = -7; x <= 7; x += 1) { c.beginPath(); c.moveTo(side ? x * 0.8 : x, -9.6); c.lineTo(side ? x * 0.85 : x * 1.05, -6.2); c.stroke(); }
  if (!back) for (const x of side ? [3] : [-3.6, 0, 3.6]) F(() => { c.moveTo(x - 0.9, -10.8); c.quadraticCurveTo(x, -12.4, x + 0.9, -10.8); c.lineTo(x, -9.8); c.closePath(); }, '#f0e2d0', 0.35);
  // руки и оружие
  const wpn = (hx, hy, rot) => { c.save(); c.translate(hx, hy); c.rotate(rot); if (K.weapon === 'spear') { limb(0, 8, 0, -20, 1.2, 1.2, '#8a6a42'); F(() => { c.moveTo(-0.9, -20); c.lineTo(0, -25); c.lineTo(0.9, -20); c.closePath(); }, '#e8e0cc', 0.5); for (const s of [-1, 1]) F(() => { c.moveTo(s * 0.4, -20); c.lineTo(s * 2.2, -22.6); c.lineTo(s * 1.2, -20); c.closePath(); }, '#e8e0cc', 0.4); F(() => c.rect(-1, -19.6, 2, 1.4), '#c8642a', 0.3); }
    else { limb(0, 8, 0, -18, 1.2, 1.4, '#6a4a2c'); for (let i = 0; i < 3; i++) F(() => c.ellipse(-1.6 + i * 1.6, -19, 0.9, 2, (i - 1) * 0.5, 0, TAU), ['#c84a4a', '#e8c040', '#4a8ac8'][i], 0.3); const g = c.createRadialGradient(0, -21, 0.3, 0, -21, 4 + bite * 4); g.addColorStop(0, 'rgba(160,240,220,.9)'); g.addColorStop(1, 'rgba(160,240,220,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, -21, 4 + bite * 4, 0, TAU); c.fill(); F(() => c.arc(0, -21, 1.4, 0, TAU), '#a0f0dc', 0.4); }
    c.restore(); };
  const armSw = W ? Math.sin(p * TAU) * 0.3 : 0, thrust = bite;
  if (side) { limb(-1, -18, -3 + armSw * 3, -11, 2, 1.6, sh(K.skin, -0.2)); }
  else { limb(back ? -6 : 6, -18, back ? -8 : 8, -11, 2, 1.6, K.skin); F(() => c.arc(back ? -8 : 8, -10.6, 1.4, 0, TAU), K.skin, 0.4); }
  // голова: широкий рот, глаза сверху, гребень
  const hy = -21;
  if (side) {
    F(() => { c.moveTo(-3.4, hy + 1); c.quadraticCurveTo(-6, hy - 2, -5, hy - 6); c.lineTo(-2, hy - 3); c.closePath(); }, K.fin, 0.5);
    const head = () => { c.moveTo(-4.6, hy + 2); c.bezierCurveTo(-5.4, hy - 6, 4, hy - 7, 7.4, hy - 1.6); c.quadraticCurveTo(8.4, hy + 1.6, 6, hy + 2.6); c.quadraticCurveTo(0, hy + 4, -4.6, hy + 2); c.closePath(); };
    F(head, grad(hy - 6, hy + 3, sh(K.skin, 0.12), K.skin), 0.7);
    c.strokeStyle = O; c.lineWidth = 0.5; c.beginPath(); c.moveTo(7.6, hy + 0.4 + thrust * 0.6); c.quadraticCurveTo(3, hy + 1.6 + thrust, -1.6, hy + 0.4); c.stroke();
    F(() => c.ellipse(3, hy + 3 + Math.sin(t * 5) * 0.4, 2.4, 1.6 + Math.max(0, Math.sin(t * 5)) * 0.6, 0, 0, TAU), sh(K.belly, -0.08), 0.5);
    F(() => c.arc(3.4, hy - 4.4, 2, 0, TAU), K.skin, 0.6); eye(3.8, hy - 4.4, 1.4, '#e8c040', true);
    if (K.mask) F(() => { c.moveTo(1, hy - 3); c.lineTo(6.4, hy - 2.6); c.lineTo(5.6, hy - 1.2); c.lineTo(1.6, hy - 1.6); c.closePath(); }, '#e8e0cc', 0.4);
  } else {
    if (back) F(() => { c.moveTo(-1.4, hy + 2); c.quadraticCurveTo(0, hy - 10, 1.4, hy + 2); c.closePath(); }, K.fin, 0.5);
    const head = () => { c.moveTo(-7.4, hy + 1.6); c.bezierCurveTo(-8, hy - 6, 8, hy - 6, 7.4, hy + 1.6); c.quadraticCurveTo(0, hy + 4.4, -7.4, hy + 1.6); c.closePath(); };
    F(head, grad(hy - 6, hy + 3, sh(K.skin, 0.12), K.skin), 0.7);
    for (const sx of [-1, 1]) { F(() => c.arc(sx * 4, hy - 4.4, 2.2, 0, TAU), K.skin, 0.6); if (!back) eye(sx * 4, hy - 4.6, 1.5, '#e8c040', true); }
    if (!back) { c.strokeStyle = O; c.lineWidth = 0.5; c.beginPath(); c.moveTo(-6.6, hy + 0.8); c.quadraticCurveTo(0, hy + 2.8 + thrust * 1.6, 6.6, hy + 0.8); c.stroke(); F(() => c.ellipse(0, hy + 3.6, 3.4, 1.4 + Math.max(0, Math.sin(t * 5)) * 0.6, 0, 0, TAU), sh(K.belly, -0.08), 0.5); c.fillStyle = K.dark; c.beginPath(); c.arc(-1, hy - 1.4, 0.35, 0, TAU); c.arc(1, hy - 1.4, 0.35, 0, TAU); c.fill(); }
    if (K.mask && !back) F(() => { c.moveTo(-6.6, hy - 2.4); c.lineTo(6.6, hy - 2.4); c.lineTo(5, hy - 0.6); c.lineTo(-5, hy - 0.6); c.closePath(); }, '#e8e0cc', 0.4);
    if (K.mask) for (let i = 0; i < 5; i++) F(() => { const a = -2.4 + i * 0.36; c.moveTo(Math.cos(a) * 5, hy - 5 + Math.sin(a) * 3); c.lineTo(Math.cos(a) * 9, hy - 9 + Math.sin(a) * 5); c.lineTo(Math.cos(a + 0.12) * 5, hy - 5 + Math.sin(a + 0.12) * 3); c.closePath(); }, ['#c84a4a', '#e8c040', '#4a8ac8', '#e8c040', '#c84a4a'][i], 0.3);
  }
  // ближняя рука с оружием
  if (side) { const a = -0.3 + armSw - thrust * 1.2, hx = 2 + Math.sin(-a) * -5 + thrust * 4, hy2 = -12 - thrust * 3; wpn(hx, hy2, K.weapon === 'spear' ? 0.25 + thrust * 1.2 : 0.1); limb(1, -18, hx, hy2, 2, 1.6, K.skin); F(() => c.arc(hx, hy2, 1.4, 0, TAU), K.skin, 0.4); }
  else { const hx = back ? 8 : -8, hy2 = -11 - thrust * 4; wpn(hx, hy2, (back ? 0.2 : -0.2) * (1 - thrust)); limb(back ? 6 : -6, -18, hx, hy2, 2, 1.6, K.skin); F(() => c.arc(hx, hy2, 1.4, 0, TAU), K.skin, 0.4); }
  c.restore();
}

// ======================================================== грибоеды (грибной народ)
export const SHROOM = {
  gribo: { cap: '#b8382a', spots: '#f4ecd8', stem: '#e8dcc0', gill: '#d8c8a8', moss: '#6a8a3a', s: 1 },
  sporo: { cap: '#8a6a9a', spots: '#d8c8e8', stem: '#e2dacb', gill: '#c8b8d0', moss: '#5a7a5a', s: 1.05, puff: true },
};
function shroom(S, view, p, W, bite, t) {
  const k = S.s, wob = W ? Math.sin(p * TAU) * 0.08 : Math.sin(t * 1.6) * 0.03, hop = W ? Math.abs(Math.sin(p * TAU)) * 1.4 : 0, side = view === 'side', back = view === 'back';
  shadow(10 * k, 3 * k); c.save(); c.scale(k, k); c.translate(0, -hop); c.rotate(wob);
  // ножки-корни
  for (const sx of [-1, 1]) { const ph = p + (sx > 0 ? 0.5 : 0), lift = W ? Math.max(0, Math.sin(ph * TAU)) * 2 : 0; limb(sx * 3, -6, sx * (side ? 1 : 4.4), -1 - lift, 3.4, 2.6, sh(S.stem, -0.2)); F(() => { c.moveTo(sx * 2.4, -1.4 - lift); c.lineTo(sx * 6.4, 0 - lift); c.lineTo(sx * 2, 0.4 - lift); c.closePath(); }, sh(S.stem, -0.3), 0.4); }
  // тело-ножка гриба
  const stem = S.puff ? () => c.ellipse(0, -10.4, 8.4, 7.4, 0, 0, TAU) : () => { c.moveTo(-5, -4); c.bezierCurveTo(-7, -10, -5.4, -16, -4, -18); c.lineTo(4, -18); c.bezierCurveTo(5.4, -16, 7, -10, 5, -4); c.quadraticCurveTo(0, -2.6, -5, -4); c.closePath(); };
  F(stem, grad(-18, -3, sh(S.stem, 0.08), sh(S.stem, -0.2)), 0.7);
  c.save(); c.beginPath(); stem(); c.clip(); c.fillStyle = S.moss + 'cc'; const r = rng(7); for (let i = 0; i < 8; i++) { c.beginPath(); c.ellipse((r() - 0.5) * 10, -4 - r() * 4, 1.6 + r(), 0.9, 0, 0, TAU); c.fill(); } c.restore();
  if (S.puff) { c.fillStyle = sh(S.stem, -0.15); const r2 = rng(3); for (let i = 0; i < 14; i++) { c.beginPath(); c.arc((r2() - 0.5) * 11, -10 + (r2() - 0.5) * 9, 0.4, 0, TAU); c.fill(); } }
  // руки-веточки
  for (const sx of side ? [1] : [-1, 1]) { const a = (W ? Math.sin(p * TAU + (sx > 0 ? 0 : Math.PI)) * 0.4 : 0) - bite * 1.4 * (sx > 0 ? 1 : 0); const sx0 = side ? 2 : sx * 5.4, ex = sx0 + Math.sin(sx * 0.9 + a) * 5, ey = -12 + Math.cos(0.9 + a) * 5; limb(sx0, -13, ex, ey, 1.6, 1.1, sh(S.stem, -0.25)); for (const d of [-0.6, 0.6]) limb(ex, ey, ex + Math.sin(sx * 0.9 + a + d) * 1.8, ey + Math.cos(0.9 + a + d) * 1.8, 0.8, 0.5, sh(S.stem, -0.25)); }
  // лицо
  if (!back) { const fx = side ? 3 : 0; for (const x of side ? [fx] : [-1.8, 1.8]) { c.fillStyle = '#1e140c'; c.beginPath(); c.ellipse(x, -12.6, 0.8, 1.1, 0, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x - 0.25, -13, 0.3, 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(220,120,110,.45)'; for (const x of side ? [fx + 0.4] : [-3.2, 3.2]) { c.beginPath(); c.arc(x, -10.8, 0.9, 0, TAU); c.fill(); }
    c.strokeStyle = '#3a2418'; c.lineWidth = 0.4; c.beginPath(); bite > 0.2 ? c.ellipse(fx, -9.6, 1.2, 0.9 * bite, 0, 0, TAU) : c.arc(fx, -10.4, 1, 0.3, 2.8); c.stroke(); }
  // шляпка
  const capY = S.puff ? -15.4 : -17.4, cw = S.puff ? 7.4 : 12.4;
  if (!back) F(() => c.ellipse(side ? 0.6 : 0, capY + 0.8, cw * 0.86, 1.8, 0, 0, TAU), S.gill, 0.5);
  if (!back) { c.strokeStyle = sh(S.gill, -0.25); c.lineWidth = 0.25; for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(i * cw / 7.2, capY + 0.4); c.lineTo(i * cw / 9, capY + 1.8); c.stroke(); } }
  const cap = () => { c.moveTo(-cw, capY + 0.6); c.bezierCurveTo(-cw * 0.95, capY - cw * 0.85, cw * 0.95, capY - cw * 0.85, cw, capY + 0.6); c.quadraticCurveTo(0, capY + 2, -cw, capY + 0.6); c.closePath(); };
  F(cap, grad(capY - cw * 0.8, capY + 1, sh(S.cap, 0.18), sh(S.cap, -0.2)), 0.8);
  c.save(); c.beginPath(); cap(); c.clip(); c.fillStyle = S.spots; const r3 = rng(S.cap.length * 13); for (let i = 0; i < (S.puff ? 6 : 9); i++) { c.beginPath(); c.ellipse((r3() - 0.5) * cw * 1.6, capY - r3() * cw * 0.6, 1 + r3() * 1.2, 0.7 + r3() * 0.8, 0, 0, TAU); c.fill(); } c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(-cw * 0.35, capY - cw * 0.45, cw * 0.35, cw * 0.15, -0.4, 0, TAU); c.fill(); c.restore();
  // споры при ударе
  if (bite > 0.1 || S.puff) { const n = S.puff ? 8 : 5; c.fillStyle = `rgba(220,240,160,${0.35 + bite * 0.4})`; for (let i = 0; i < n; i++) { const a = i / n * TAU + t, rr = 6 + bite * 8 + Math.sin(t * 2 + i) * 2; c.beginPath(); c.arc(Math.cos(a) * rr, capY - 4 + Math.sin(a) * rr * 0.5, 0.7 + bite * 0.6, 0, TAU); c.fill(); } }
  c.restore();
}

// ======================================================== Великий Полоз (редкий вожак)
const SNAKE = { body: '#4a6a3a', dark: '#26381e', belly: '#d8c890', mark: '#c8a040', eye: '#f0c030' };
function snakeSpine(view, p, W, bite, t) { // точки позвоночника от хвоста к голове
  const pts = [], n = 44, wave = W ? p * TAU : t * 0.8;
  if (view === 'side') { for (let i = 0; i <= n; i++) { const q = i / n; pts.push([-92 + q * 108, -3.5 - Math.sin(q * 10 - wave) * (1 - q) * 6]); }
    const L = bite * 16; return pts.concat([[20, -6], [25 + L * 0.3, -15], [28 + L * 0.6, -26 + bite * 6], [31 + L, -36 + bite * 14], [34 + L * 1.1, -43 + bite * 18]]); }
  for (let i = 0; i <= n; i++) { const q = i / n, a = q * TAU * 2.1 + 0.4, r = 27 - q * 13; pts.push([Math.cos(a) * r, -4 - Math.sin(a) * r * 0.32 - q * 9]); }
  return pts.concat([[0, -16], [0, -26 + bite * 2], [0, -36 + bite * 4], [0, -44 + bite * 6]]);
}
function snake(view, p, W, bite, t) {
  const pts = snakeSpine(view, p, W, bite, t), N = pts.length, w = i => 2.2 + Math.min(1, i / (N * 0.35)) * 6.4 - Math.max(0, i - N + 3) * 0.4;
  shadow(view === 'side' ? 56 : 30, view === 'side' ? 6 : 10);
  const idx = [...pts.keys()]; if (view !== 'side') { const body = idx.slice(0, N - 4).sort((a, b) => pts[a][1] - pts[b][1]); idx.splice(0, N - 4, ...body); }
  for (const i of idx) { const [x, y] = pts[i], r = w(i); F(() => c.arc(x, y, r, 0, TAU), grad(y - r, y + r, sh(SNAKE.body, 0.18), SNAKE.dark), 0.55);
    if (i % 2 === 0) F(() => { c.moveTo(x, y - r * 0.85); c.lineTo(x + r * 0.45, y - r * 0.3); c.lineTo(x, y + r * 0.1); c.lineTo(x - r * 0.45, y - r * 0.3); c.closePath(); }, i % 4 ? SNAKE.mark : sh(SNAKE.mark, -0.25), 0.25);
    if (view === 'side' || i > N - 6) { c.strokeStyle = SNAKE.belly; c.lineWidth = r * 0.45; c.beginPath(); c.arc(x, y, r * 0.72, 0.5, 2.6); c.stroke(); c.strokeStyle = sh(SNAKE.belly, -0.3); c.lineWidth = 0.25; c.beginPath(); c.moveTo(x - r * 0.4, y + r * 0.55); c.lineTo(x + r * 0.4, y + r * 0.55); c.stroke(); } }
  const [hx, hy] = pts[N - 1], [px, py] = pts[N - 2], a = Math.atan2(hy - py, hx - px);
  c.save(); c.translate(hx, hy); c.scale(1.7, 1.7);
  if (view === 'side') { c.rotate(a + Math.PI / 2 - 0.15 - bite * 0.4);
    const open = bite * 0.7;
    c.save(); c.rotate(open); F(() => { c.moveTo(-2, 1); c.lineTo(10, 2); c.quadraticCurveTo(9, 4, 6, 4); c.lineTo(-2, 4); c.closePath(); }, SNAKE.belly, 0.6); if (bite > 0.2) { c.fillStyle = '#f6f0e4'; c.beginPath(); c.moveTo(7, 2); c.lineTo(7.6, 0); c.lineTo(8.2, 2); c.fill(); } c.restore();
    if (bite > 0.2) F(() => { c.moveTo(-1, 1.4); c.lineTo(9.6, 1.8); c.lineTo(8, 3.4); c.lineTo(-1, 3.4); c.closePath(); }, '#8a2a2a', 0);
    F(() => { c.moveTo(-4, -3); c.quadraticCurveTo(4, -6.4, 11, -1); c.quadraticCurveTo(11.6, 1.4, 9.6, 2); c.lineTo(-3, 3.6); c.closePath(); }, grad(-6, 3, sh(SNAKE.body, 0.2), SNAKE.body), 0.6);
    if (bite > 0.2) { c.fillStyle = '#f6f0e4'; c.beginPath(); c.moveTo(7, 2); c.lineTo(7.6, 4.6); c.lineTo(8.2, 2); c.fill(); }
    F(() => c.ellipse(1.6, -3.4, 3, 1, 0.05, 0, TAU), sh(SNAKE.dark, 0.1), 0.3);
    eye(4.6, -2.2, 1.1, SNAKE.eye, true);
    c.fillStyle = '#1a120c'; c.beginPath(); c.arc(9.4, -1.2, 0.3, 0, TAU); c.fill();
    c.strokeStyle = '#c83030'; c.lineWidth = 0.4; const tg = Math.max(0, Math.sin(t * 6)); if (tg > 0.4 && !bite) { c.beginPath(); c.moveTo(11, 0.6); c.lineTo(13 + tg, 0.4); c.lineTo(14 + tg, -0.4); c.moveTo(13 + tg, 0.4); c.lineTo(14 + tg, 1.2); c.stroke(); }
  } else {
    const back = view === 'back';
    F(() => { c.moveTo(-5.4, 2); c.quadraticCurveTo(-6.4, -6, 0, -8.4); c.quadraticCurveTo(6.4, -6, 5.4, 2); c.quadraticCurveTo(0, 5.2, -5.4, 2); c.closePath(); }, grad(-8, 4, sh(SNAKE.body, 0.2), SNAKE.body), 0.6);
    if (!back) { for (const sx of [-1, 1]) { F(() => c.ellipse(sx * 3, -3.2, 2, 0.8, sx * 0.3, 0, TAU), sh(SNAKE.dark, 0.1), 0.3); eye(sx * 3, -2.2, 1.1, SNAKE.eye, true); } c.fillStyle = '#1a120c'; c.beginPath(); c.arc(-0.8, 1.6, 0.3, 0, TAU); c.arc(0.8, 1.6, 0.3, 0, TAU); c.fill(); if (bite > 0.2) { F(() => c.ellipse(0, 3.6, 3.2, 2.2 * bite, 0, 0, TAU), '#8a2a2a', 0.5); c.fillStyle = '#f6f0e4'; for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 1.6, 2.4); c.lineTo(sx * 1.4, 4); c.lineTo(sx * 1, 2.4); c.fill(); } } }
    else F(() => { c.moveTo(0, -7.4); c.lineTo(2, -2.4); c.lineTo(0, 1); c.lineTo(-2, -2.4); c.closePath(); }, SNAKE.mark, 0.4);
  }
  c.restore();
}

// ======================================================== общий вход
export const KINDS = ['fox', 'wolf', 'dog', 'boar', 'bull', 'spider', 'crow', 'scarecrow', 'kvakun', 'kvak_shaman', 'gribo', 'sporo', 'weaver', 'broodmother', 'snake'];
export function beast(ctx, kind, view, pose = {}) {
  c = ctx; const W = pose.walk >= 0, p = W ? pose.walk : 0, bite = pose.atk >= 0 ? Math.sin(Math.min(1, pose.atk) * Math.PI) : 0, hit = pose.hit || 0, dead = pose.dead || 0, t = pose.t || 0;
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round'; DEAD = dead > 0;
  if (dead > 0) { const R = QUAD[kind] ? QUAD[kind].len * 0.5 : SPIDER[kind] ? 14 * SPIDER[kind].s : kind === 'snake' ? 40 : 9; c.fillStyle = 'rgba(0,0,0,.24)'; c.beginPath(); c.ellipse(0, 0.6, R, R * 0.3, 0, 0, TAU); c.fill(); }
  if (dead > 0) { const k = Math.min(1, dead * 1.6); if (QUAD[kind] || SPIDER[kind]) { c.translate(0, -12); c.rotate(k * Math.PI * (view === 'back' ? -1 : 1)); c.translate(0, 12 - 9 * k); } else if (kind !== 'snake') { c.rotate(k * Math.PI / 2 * (view === 'side' ? -1 : 1)); } else { c.translate(0, 0); c.scale(1, 1 - 0.5 * k); } }
  if (hit) c.translate(view === 'side' ? -hit * 3 : 0, view === 'front' ? -hit * 2 : view === 'back' ? hit * 2 : 0);
  if (QUAD[kind]) view === 'side' ? quadSide(QUAD[kind], p, W, bite, t) : quadFB(QUAD[kind], p, W, bite, t, view === 'back');
  else if (SPIDER[kind]) view === 'side' ? spiderSide(SPIDER[kind], p, W, bite, t) : spiderFB(SPIDER[kind], p, W, bite, t, view === 'back');
  else if (kind === 'crow') crow(view, p, W, bite, t);
  else if (kind === 'scarecrow') scarecrow(view, p, W, bite, t);
  else if (KVAK[kind]) kvakun(KVAK[kind], view, p, W, bite, t);
  else if (SHROOM[kind]) shroom(SHROOM[kind], view, p, W, bite, t);
  else if (kind === 'snake') snake(view, p, W, bite, t);
  c.restore();
}
export const NAMES = { fox: 'Лиса', wolf: 'Волк', dog: 'Дикий пёс', boar: 'Кабан', bull: 'Бешеный бык', spider: 'Лесной паук', crow: 'Ворона', scarecrow: 'Пугало', kvakun: 'Квакун-копейщик', kvak_shaman: 'Квакун-шаман', gribo: 'Грибоед', sporo: 'Споровик', weaver: 'Тенепряд', broodmother: 'Паучиха-мать', snake: 'Великий Полоз' };
