// Звери в стиле героев: тёмная обводка, 2–3 тона, мягкая тень.
// Каждая функция рисует зверя, стоящего в точке (x,y) — это земля под ним, смотрит вправо при dir=1.
// a — фаза шага (0..1 по кругу), bite — 0..1 укус/удар.
const O = '#24180f';

function hp(c, fn, fill, lw = 1.1) { c.beginPath(); fn(); c.fillStyle = fill; c.fill(); c.strokeStyle = O; c.lineWidth = lw; c.stroke(); }
function shadow(c, rx, ry) { c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, 1, rx, ry, 0, 0, 7); c.fill(); }
function legs(c, xs, top, h, w, col, a, amp = 2.5) {
  xs.forEach((x, i) => { const o = Math.sin((a + i * 0.5) * Math.PI * 2) * amp; hp(c, () => c.roundRect(x + o * 0.4 - w / 2, top, w, h + Math.min(0, o * 0.3), 1.4), col, 0.9); });
}
function eye(c, x, y, r = 1.1, col = O) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x + 0.35, y - 0.4, r * 0.35, 0, 7); c.fill(); }

/** Волк (и лиса — другой окрас, меньше). */
function canine(c, a, bite, fox, K = fox ? COL.fox : COL.wolf) {
  const body = K.body, dark = K.dark, light = K.light;
  shadow(c, 17, 4);
  const bob = Math.sin(a * Math.PI * 4) * 0.8;
  // хвост
  hp(c, () => { c.moveTo(-13, -15 + bob); c.quadraticCurveTo(-24, -18, fox ? -27 : -25, fox ? -10 : -23); c.quadraticCurveTo(-20, -15, -12, -11 + bob); c.closePath(); }, fox ? body : dark);
  if (fox) hp(c, () => { c.moveTo(-27, -10); c.quadraticCurveTo(-25, -13, -23, -14); c.quadraticCurveTo(-23, -10, -27, -10); }, '#fff', 0.7);
  legs(c, [-9, -4], -10, 10, 3.4, dark, a);
  hp(c, () => c.ellipse(0, -14 + bob, 14, 7.5, 0, 0, 7), body);
  hp(c, () => c.ellipse(2, -10.5 + bob, 9, 3, 0, 0, 7), light, 0.6);
  legs(c, [5, 10], -10, 10, 3.4, body, a + 0.25);
  // голова
  c.save(); c.translate(13, -19 + bob); c.rotate(bite ? -0.25 * bite : 0);
  hp(c, () => { c.moveTo(-1, -5); c.lineTo(-4, -13); c.lineTo(3, -7); c.closePath(); }, dark);
  hp(c, () => { c.moveTo(4, -6); c.lineTo(5, -14); c.lineTo(9, -6); c.closePath(); }, dark);
  hp(c, () => c.ellipse(2, 0, 7, 6, 0, 0, 7), body);
  hp(c, () => { c.moveTo(5, -2); c.lineTo(15, 1); c.quadraticCurveTo(15, 4, 12, 4.5); c.lineTo(4, 4); c.closePath(); }, body);
  hp(c, () => { c.moveTo(4, 2); c.lineTo(12, 4.5); c.quadraticCurveTo(8, 6, 3, 5); c.closePath(); }, light, 0.6);
  c.fillStyle = O; c.beginPath(); c.arc(14.5, 1.6, 1.4, 0, 7); c.fill();
  eye(c, 5.5, -1.5, 1.1, K.eye);
  if (K.collar) { hp(c, () => c.rect(-3, 2, 3, 5), K.collar, 0.7); }
  if (bite) { c.fillStyle = '#fff'; c.fillRect(9, 4, 1, 1.6); c.fillRect(11, 4.3, 1, 1.4); }
  c.restore();
}

export function wolf(c, a, bite) { canine(c, a, bite, false); }
export function fox(c, a, bite) { c.save(); c.scale(0.85, 0.85); canine(c, a, bite, true); c.restore(); }

export function boar(c, a, bite) {
  shadow(c, 19, 5);
  const bob = Math.sin(a * Math.PI * 4) * 0.7, body = '#6b4a32', dark = '#4a3020', light = '#8a6a4a';
  legs(c, [-10, -4], -9, 9, 4, dark, a, 2);
  hp(c, () => c.ellipse(0, -14 + bob, 17, 11, 0, 0, 7), body, 1.2);
  // щетина по хребту
  c.fillStyle = dark; c.beginPath(); c.moveTo(-14, -18 + bob);
  for (let i = 0; i <= 8; i++) { const x = -14 + i * 3.6; c.lineTo(x, -25 + bob + (i % 2) * 3); }
  c.lineTo(14, -18 + bob); c.closePath(); c.fill(); c.strokeStyle = O; c.lineWidth = 1; c.stroke();
  hp(c, () => c.ellipse(-2, -9 + bob, 11, 4, 0, 0, 7), light, 0.6);
  legs(c, [6, 11], -9, 9, 4, body, a + 0.25, 2);
  // голова
  c.save(); c.translate(15, -14 + bob); c.rotate(bite ? 0.3 * bite : 0);
  hp(c, () => { c.moveTo(-2, -8); c.lineTo(1, -14); c.lineTo(4, -7); c.closePath(); }, dark);
  hp(c, () => c.ellipse(3, 0, 9, 8, 0, 0, 7), body, 1.2);
  hp(c, () => c.ellipse(11, 2, 4, 4.5, 0, 0, 7), '#c98a7a', 1);
  c.fillStyle = '#6a3a2a'; c.beginPath(); c.arc(11, 1, 0.9, 0, 7); c.arc(12.4, 3.4, 0.9, 0, 7); c.fill();
  hp(c, () => { c.moveTo(7, 5); c.quadraticCurveTo(10, 9, 13, 4); c.quadraticCurveTo(10, 7, 8, 3.5); c.closePath(); }, '#f4ecd8', 0.8);
  eye(c, 5, -2.5, 1.1);
  c.restore();
}

export function spider(c, a, bite) {
  shadow(c, 18, 5);
  const bob = Math.sin(a * Math.PI * 6) * 0.6, body = '#3a2a3a', leg = '#2a1e2a';
  // ноги: по 4 с каждой стороны, суставы
  for (let side of [-1, 1]) for (let i = 0; i < 4; i++) {
    const ph = Math.sin((a * 2 + i * 0.25 + (side > 0 ? 0.5 : 0)) * Math.PI * 2) * 2.5;
    const bx = -2 + i * 4, by = -11, kx = bx + (i - 1.5) * 6, ky = -20 + ph + (side > 0 ? 2 : 0), fx = bx + (i - 1.5) * 10 + ph, fy = 0;
    c.strokeStyle = O; c.lineWidth = 3.2; c.beginPath(); c.moveTo(bx, by); c.lineTo(kx, ky); c.lineTo(fx, fy); c.stroke();
    c.strokeStyle = side > 0 ? '#4a3a4a' : leg; c.lineWidth = 1.6; c.stroke();
  }
  hp(c, () => c.ellipse(-7, -13 + bob, 11, 9, -0.15, 0, 7), body, 1.2);
  // красный знак на брюшке
  hp(c, () => { c.moveTo(-9, -18 + bob); c.lineTo(-6, -14 + bob); c.lineTo(-9, -10 + bob); c.lineTo(-12, -14 + bob); c.closePath(); }, '#c8323a', 0.6);
  c.fillStyle = 'rgba(255,255,255,.15)'; c.beginPath(); c.ellipse(-9, -18 + bob, 4, 2, -0.3, 0, 7); c.fill();
  hp(c, () => c.ellipse(6, -11 + bob, 6.5, 5.5, 0, 0, 7), '#4a3a4a', 1.1);
  for (const [x, y] of [[8, -13], [10.5, -12], [9, -10.5]]) { c.fillStyle = '#ff4a3a'; c.beginPath(); c.arc(x, y + bob, 0.9, 0, 7); c.fill(); }
  // жвала
  const j = bite ? 2 : 0;
  hp(c, () => { c.moveTo(10, -9 + bob); c.quadraticCurveTo(14 + j, -8 + bob, 12, -5 + bob); c.lineTo(10.5, -7 + bob); c.closePath(); }, '#d8c8a4', 0.6);
}

export function dog(c, a, bite) { c.save(); c.scale(0.95, 0.95); canine(c, a, bite, false, COL.dog); c.restore(); }

// бешеный бык: большой, рога, кольцо в носу
export function bull(c, a, bite) {
  const K = COL.bull; shadow(c, 24, 6);
  const bob = Math.sin(a * Math.PI * 4) * 0.8;
  legs(c, [-14, -7], -12, 12, 5, K.dark, a, 2.5);
  hp(c, () => { c.moveTo(-20, -14 + bob); c.quadraticCurveTo(-26, -6, -24, 2 + bob); c.lineTo(-22, 2 + bob); c.quadraticCurveTo(-23, -6, -18, -12 + bob); c.closePath(); }, K.dark, 0.9);
  hp(c, () => c.ellipse(0, -19 + bob, 21, 12, 0, 0, 7), K.body, 1.3);
  hp(c, () => c.ellipse(4, -27 + bob, 10, 5, 0.1, 0, 7), K.body, 0);   // холка
  c.fillStyle = K.light; c.beginPath(); c.ellipse(-6, -21 + bob, 6, 4, 0.3, 0, 7); c.fill();
  legs(c, [7, 13], -12, 12, 5, K.body, a + 0.25, 2.5);
  c.save(); c.translate(19, -20 + bob); c.rotate(bite ? 0.35 * bite : 0.1);
  for (const [sx, col] of [[-1, '#d8cfb8'], [1, '#ece2c8']]) hp(c, () => { c.moveTo(-1, -7 + sx); c.quadraticCurveTo(-4, -16, 3 + sx * 2, -17); c.quadraticCurveTo(0, -12, 2, -6 + sx); c.closePath(); }, col, 0.9);
  hp(c, () => c.ellipse(4, 0, 9, 8, 0.2, 0, 7), K.body, 1.2);
  hp(c, () => c.ellipse(11, 4, 5, 4.5, 0, 0, 7), K.light, 1);
  c.fillStyle = '#3a2418'; c.beginPath(); c.arc(11, 3, 0.9, 0, 7); c.arc(13.4, 5, 0.9, 0, 7); c.fill();
  c.strokeStyle = '#d8b44a'; c.lineWidth = 1.2; c.beginPath(); c.arc(13.5, 7.2, 2, 0.3, 3); c.stroke();
  eye(c, 5, -2.5, 1.2, '#c8323a');
  c.restore();
}

// ворона: летит над землёй, тень внизу; a — взмах крыльев
export function crow(c, a, bite) {
  const fly = -26 + Math.sin(a * Math.PI * 2) * 2.5, flap = Math.sin(a * Math.PI * 4);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0, 1, 9, 2.6, 0, 0, 7); c.fill();
  c.save(); c.translate(bite * 5, fly + bite * 10);
  hp(c, () => { c.moveTo(-3, -1); c.quadraticCurveTo(-6, -12 - flap * 6, -16, -10 - flap * 8); c.quadraticCurveTo(-8, -4, -2, 2); c.closePath(); }, '#2a2630', 0.9); // дальнее крыло
  hp(c, () => { c.moveTo(-8, 0); c.lineTo(-15, -3); c.lineTo(-15, 3); c.closePath(); }, '#1e1a24', 0.8);           // хвост
  hp(c, () => c.ellipse(0, 0, 8, 4.6, 0, 0, 7), '#2e2a36', 1);
  hp(c, () => c.arc(7, -2.5, 3.6, 0, 7), '#2e2a36', 1);
  hp(c, () => { c.moveTo(9.5, -3.5); c.lineTo(15, -1.5 + bite); c.lineTo(9.8, -0.6); c.closePath(); }, '#c9a24a', 0.8);
  c.fillStyle = '#ffd34d'; c.beginPath(); c.arc(8, -3.4, 0.9, 0, 7); c.fill();
  hp(c, () => { c.moveTo(-2, -1); c.quadraticCurveTo(-2, -12 - flap * 9, 6, -14 - flap * 10); c.quadraticCurveTo(2, -4, 3, 1); c.closePath(); }, '#3a3644', 0.9);   // ближнее крыло
  c.restore();
}

// пугало: на жерди, прыгает; соломенная шляпа, мешок-голова со швами, руки-палки
export function scarecrow(c, a, bite, view = 'side') {
  const hop = -Math.abs(Math.sin(a * Math.PI * 2)) * 5, sw = Math.sin(a * Math.PI * 2) * 0.12, front = view === 'front', back = view === 'back';
  c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, 1, 11 + hop * 0.6, 3.5, 0, 0, 7); c.fill();
  c.save(); c.translate(0, hop); c.rotate(sw);
  // жердь
  c.strokeStyle = O; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -34); c.stroke(); c.strokeStyle = '#7a5530'; c.lineWidth = 2.4; c.stroke();
  // руки-палки (при ударе — взмах)
  const r = bite * 0.9;
  c.save(); c.translate(0, -27); c.rotate(-r);
  c.strokeStyle = O; c.lineWidth = 3.6; c.beginPath(); c.moveTo(-17, 1); c.lineTo(17, -1); c.stroke(); c.strokeStyle = '#8a6a3a'; c.lineWidth = 2; c.stroke();
  c.strokeStyle = '#e8c860'; c.lineWidth = 1.2; for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(sx * 17, 0); c.lineTo(sx * (20 + i), -3 + i * 3); c.stroke(); }
  c.restore();
  // рубаха в заплатах
  hp(c, () => { c.moveTo(-9, -31); c.lineTo(9, -31); c.lineTo(11, -12); c.lineTo(6, -9); c.lineTo(3, -12); c.lineTo(0, -8); c.lineTo(-3, -12); c.lineTo(-6, -9); c.lineTo(-11, -12); c.closePath(); }, '#6a7a4a');
  c.fillStyle = '#8a5a3a'; c.fillRect(-6, -24, 5, 5); c.fillStyle = '#c9a24a'; c.fillRect(2, -19, 4, 4);
  c.strokeStyle = 'rgba(36,24,15,.6)'; c.lineWidth = 0.6; c.strokeRect(-6, -24, 5, 5); c.strokeRect(2, -19, 4, 4);
  c.strokeStyle = '#e8c860'; c.lineWidth = 1.2; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-8 + i * 4, -11); c.lineTo(-9 + i * 4.4, -6); c.stroke(); }
  hp(c, () => c.rect(-9, -16, 18, 2.4), '#5a3a1c', 0.7);
  // голова-мешок
  hp(c, () => c.ellipse(0, -38, 7.5, 7, 0, 0, 7), '#d8c49a');
  if (!back) {
    const ex = front ? [-2.8, 2.8] : [1.5, 5]; c.fillStyle = '#1a1010'; for (const x of ex) { c.beginPath(); c.moveTo(x - 1.6, -40); c.lineTo(x + 1.6, -40); c.lineTo(x, -37.6); c.closePath(); c.fill(); }
    const g = c.createRadialGradient(ex[1], -39, 0.2, ex[1], -39, 4); g.addColorStop(0, 'rgba(255,170,60,.7)'); g.addColorStop(1, 'rgba(255,170,60,0)'); c.fillStyle = g; c.beginPath(); c.arc(ex[1], -39, 4, 0, 7); c.fill();
    c.strokeStyle = '#3a2418'; c.lineWidth = 0.8; c.beginPath(); const mx = front ? 0 : 3; c.moveTo(mx - 3.5, -34.5); for (let i = 0; i <= 6; i++) c.lineTo(mx - 3.5 + i * 1.2, -34.5 + (i % 2 ? 1 : -0.6)); c.stroke();
  } else { c.strokeStyle = '#a8916a'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-5, -38); c.lineTo(5, -36); c.stroke(); }
  // соломенная шляпа
  hp(c, () => c.ellipse(0, -44, 11, 3, 0, 0, 7), '#d8b44a');
  hp(c, () => { c.moveTo(-6, -44); c.quadraticCurveTo(-5, -51, 0, -52); c.quadraticCurveTo(5, -51, 6, -44); c.closePath(); }, '#e8c860');
  hp(c, () => c.rect(-6, -46.5, 12, 2), '#8a3a2a', 0.6);
  c.restore();
}

export const BEASTS = { wolf, fox, boar, spider, dog, bull, crow, scarecrow };

// ---------------------------------------------------------------- три вида: сбоку, спереди (идёт вниз), сзади (идёт вверх)
// pose = { walk: фаза 0..1 или -1, atk: -1 или 0..1 (укус), hit: 0..1, dead: 0..1, t }
const COL = {
  wolf: { body: '#8a8f96', dark: '#5e636a', light: '#c9cdd2', eye: '#d8b44a', s: 1 },
  fox: { body: '#d9783a', dark: '#a8542a', light: '#f4e6d0', eye: '#3a2410', s: 0.85 },
  dog: { body: '#6a4a32', dark: '#3a2a1e', light: '#c9a07a', eye: '#e8b040', s: 0.95, collar: '#8a2a2a' },
  bull: { body: '#4a3226', dark: '#2a1c14', light: '#8a6a52', eye: '#c8323a', s: 1 },
  boar: { body: '#6b4a32', dark: '#4a3020', light: '#8a6a4a', eye: O, s: 1 },
  spider: { body: '#3a2a3a', dark: '#2a1e2a', light: '#4a3a4a', eye: '#ff4a3a', s: 1 },
};
export function beast(c, kind, view, pose = {}) {
  const W = pose.walk >= 0, p = W ? pose.walk : 0, bite = pose.atk >= 0 ? Math.sin(Math.min(1, pose.atk) * Math.PI) : 0, hit = pose.hit || 0, dead = pose.dead || 0;
  c.save();
  if (dead > 0) { const k = Math.min(1, dead * 1.6); c.translate(0, -13); c.rotate(k * Math.PI * (view === 'back' ? -1 : 1)); c.translate(0, 13 - 10 * k); } // переворачивается на спину, лапы вверх
  if (hit) c.translate(view === 'side' ? -hit * 3 : 0, view === 'front' ? -hit * 2 : view === 'back' ? hit * 2 : 0);
  if (view === 'side') { const lunge = bite * 4; c.translate(lunge, 0); BEASTS[kind](c, W ? p : (pose.t || 0) * 0.05 % 1 * 0, bite); if (!W && !bite) { /* стоит */ } }
  else (view === 'front' ? FRONT : BACK)[kind](c, p, W, bite, COL[kind], pose.t || 0);
  c.restore();
}

const legPair = (c, xs, top, h, w, col, p, W, amp = 2.2) => xs.forEach((x, i) => { const lift = W ? Math.max(0, Math.sin((p + i * 0.5) * Math.PI * 2)) * amp : 0; hp(c, () => c.roundRect(x - w / 2, top - lift, w, h, 1.6), col, 0.9); });

const FRONT = {
  dog: (c, p, W, bite, K) => { c.save(); c.scale(K.s, K.s); canineFront(c, p, W, bite, K, false); c.restore(); },
  bull(c, p, W, bite, K) {
    shadow(c, 18, 6); const bob = W ? Math.sin(p * Math.PI * 4) * 0.8 : 0;
    legPair(c, [-9, 9], -12, 12, 5, K.dark, p, W, 2.4);
    hp(c, () => c.ellipse(0, -19 + bob, 16, 13, 0, 0, 7), K.body, 1.3);
    legPair(c, [-5, 5], -11, 11, 5, K.body, p + 0.25, W, 2.4);
    const hy = -16 + bob + bite * 3;
    for (const sx of [-1, 1]) hp(c, () => { c.moveTo(sx * 6, hy - 6); c.quadraticCurveTo(sx * 16, hy - 8, sx * 17, hy - 17); c.quadraticCurveTo(sx * 12, hy - 11, sx * 4, hy - 9); c.closePath(); }, '#ece2c8', 0.9);
    hp(c, () => c.ellipse(0, hy, 9, 9, 0, 0, 7), K.body, 1.2);
    hp(c, () => c.ellipse(0, hy + 5, 6, 4.2, 0, 0, 7), K.light, 1);
    c.fillStyle = '#3a2418'; c.beginPath(); c.arc(-2, hy + 5, 1, 0, 7); c.arc(2, hy + 5, 1, 0, 7); c.fill();
    c.strokeStyle = '#d8b44a'; c.lineWidth = 1.3; c.beginPath(); c.arc(0, hy + 8, 2.2, 0.2, 2.9); c.stroke();
    eye(c, -4, hy - 2.5, 1.2, '#c8323a'); eye(c, 4, hy - 2.5, 1.2, '#c8323a');
  },
  crow: (c, p, W, bite) => crowFB(c, p, bite, true),
  scarecrow: (c, p, W, bite) => scarecrow(c, W ? p : 0, bite, 'front'),
  wolf: (c, p, W, bite, K) => canineFront(c, p, W, bite, K, false),
  fox: (c, p, W, bite, K) => { c.save(); c.scale(K.s, K.s); canineFront(c, p, W, bite, K, true); c.restore(); },
  boar(c, p, W, bite, K) {
    shadow(c, 15, 5); const bob = W ? Math.sin(p * Math.PI * 4) * 0.7 : 0;
    legPair(c, [-8, 8], -10, 10, 4.4, K.dark, p, W, 2);
    hp(c, () => c.ellipse(0, -15 + bob, 14, 11, 0, 0, 7), K.body, 1.2);
    c.fillStyle = K.dark; c.beginPath(); for (let i = 0; i <= 6; i++) { const x = -9 + i * 3; c.lineTo(x, -25 + bob + (i % 2) * 3); } c.lineTo(9, -22 + bob); c.lineTo(-9, -22 + bob); c.fill();
    legPair(c, [-4.5, 4.5], -9, 9, 4.4, K.body, p + 0.25, W, 2);
    // голова к нам
    const hy = -12 + bob + bite * 2;
    for (const sx of [-1, 1]) hp(c, () => { c.moveTo(sx * 6, hy - 6); c.lineTo(sx * 10, hy - 12); c.lineTo(sx * 3, hy - 8); c.closePath(); }, K.dark);
    hp(c, () => c.ellipse(0, hy, 9, 8, 0, 0, 7), K.body, 1.2);
    hp(c, () => c.ellipse(0, hy + 4, 5, 4, 0, 0, 7), '#c98a7a', 1);
    c.fillStyle = '#6a3a2a'; c.beginPath(); c.arc(-1.8, hy + 4, 1, 0, 7); c.arc(1.8, hy + 4, 1, 0, 7); c.fill();
    for (const sx of [-1, 1]) hp(c, () => { c.moveTo(sx * 4, hy + 6); c.quadraticCurveTo(sx * 8, hy + 6, sx * 7.5, hy + 1 - bite * 2); c.quadraticCurveTo(sx * 6.5, hy + 4, sx * 3.5, hy + 4.5); c.closePath(); }, '#f4ecd8', 0.8);
    eye(c, -3.6, hy - 2.5); eye(c, 3.6, hy - 2.5);
  },
  spider(c, p, W, bite, K) { spiderTop(c, p, W, bite, K, true); },
};
const BACK = {
  dog: (c, p, W, bite, K) => { c.save(); c.scale(K.s, K.s); canineBack(c, p, W, K, false); c.restore(); },
  bull(c, p, W, bite, K) {
    shadow(c, 18, 6); const bob = W ? Math.sin(p * Math.PI * 4) * 0.8 : 0;
    for (const sx of [-1, 1]) hp(c, () => { c.moveTo(sx * 6, -30 + bob); c.quadraticCurveTo(sx * 16, -32 + bob, sx * 17, -40 + bob); c.quadraticCurveTo(sx * 12, -35 + bob, sx * 4, -33 + bob); c.closePath(); }, '#ece2c8', 0.9);
    legPair(c, [-5, 5], -11, 11, 5, K.dark, p + 0.25, W, 2.4);
    hp(c, () => c.ellipse(0, -19 + bob, 16, 13, 0, 0, 7), K.body, 1.3);
    legPair(c, [-9, 9], -12, 12, 5.4, K.body, p, W, 2.4);
    c.strokeStyle = O; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -18 + bob); c.quadraticCurveTo(3 * Math.sin(p * 18), -9, 1, -4 + bob); c.stroke();
    c.fillStyle = K.dark; c.beginPath(); c.ellipse(1, -3 + bob, 2, 2.6, 0, 0, 7); c.fill();
  },
  crow: (c, p, W, bite) => crowFB(c, p, bite, false),
  scarecrow: (c, p, W, bite) => scarecrow(c, W ? p : 0, bite, 'back'),
  wolf: (c, p, W, bite, K) => canineBack(c, p, W, K, false),
  fox: (c, p, W, bite, K) => { c.save(); c.scale(K.s, K.s); canineBack(c, p, W, K, true); c.restore(); },
  boar(c, p, W, bite, K) {
    shadow(c, 15, 5); const bob = W ? Math.sin(p * Math.PI * 4) * 0.7 : 0;
    // уши и холка за спиной
    for (const sx of [-1, 1]) hp(c, () => { c.moveTo(sx * 5, -22 + bob); c.lineTo(sx * 9, -28 + bob); c.lineTo(sx * 2, -24 + bob); c.closePath(); }, K.dark);
    legPair(c, [-4.5, 4.5], -9, 9, 4.4, K.dark, p + 0.25, W, 2);
    hp(c, () => c.ellipse(0, -14 + bob, 14, 11, 0, 0, 7), K.body, 1.2);
    c.fillStyle = K.dark; c.beginPath(); for (let i = 0; i <= 6; i++) { const x = -9 + i * 3; c.lineTo(x, -24 + bob + (i % 2) * 3); } c.lineTo(9, -18 + bob); c.lineTo(-9, -18 + bob); c.fill();
    legPair(c, [-8, 8], -10, 10, 4.6, K.body, p, W, 2);
    c.strokeStyle = O; c.lineWidth = 1.6; c.beginPath(); c.moveTo(0, -12 + bob); c.quadraticCurveTo(3 * Math.sin(p * 20), -7, 1, -5 + bob); c.stroke();
  },
  spider(c, p, W, bite, K) { spiderTop(c, p, W, bite, K, false); },
};

function canineFront(c, p, W, bite, K, fox) {
  shadow(c, 12, 4); const bob = W ? Math.sin(p * Math.PI * 4) * 0.8 : 0;
  // хвост виден из-за спины
  hp(c, () => { c.moveTo(6, -18 + bob); c.quadraticCurveTo(14, -26, fox ? 13 : 11, fox ? -30 : -29); c.quadraticCurveTo(10, -22, 4, -16 + bob); c.closePath(); }, fox ? K.body : K.dark);
  legPair(c, [-5, 5], -9, 9, 3.6, K.dark, p + 0.25, W);
  hp(c, () => c.ellipse(0, -13 + bob, 9, 8, 0, 0, 7), K.body);
  hp(c, () => c.ellipse(0, -9.5 + bob, 5, 4.5, 0, 0, 7), K.light, 0.6);
  legPair(c, [-3.2, 3.2], -8, 8, 3.6, K.body, p, W);
  // голова к нам
  const hy = -19 + bob + bite * 1.5;
  for (const sx of [-1, 1]) hp(c, () => { c.moveTo(sx * 2, hy - 4); c.lineTo(sx * 6.5, hy - 12); c.lineTo(sx * 7, hy - 2); c.closePath(); }, K.dark);
  hp(c, () => c.ellipse(0, hy, 7, 6.2, 0, 0, 7), K.body);
  hp(c, () => { c.moveTo(-3.6, hy + 1); c.quadraticCurveTo(0, hy + 9 + bite * 2, 3.6, hy + 1); c.closePath(); }, K.light, 0.7);
  c.fillStyle = O; c.beginPath(); c.ellipse(0, hy + 3.2, 1.6, 1.2, 0, 0, 7); c.fill();
  if (bite) { c.fillStyle = '#5a1a1a'; c.beginPath(); c.ellipse(0, hy + 6.5, 2.4, 1.6 * bite, 0, 0, 7); c.fill(); c.fillStyle = '#fff'; c.fillRect(-1.8, hy + 5.4, 0.9, 1.4); c.fillRect(0.9, hy + 5.4, 0.9, 1.4); }
  eye(c, -2.8, hy - 1.5, 1.1, K.eye); eye(c, 2.8, hy - 1.5, 1.1, K.eye);
}
function canineBack(c, p, W, K, fox) {
  shadow(c, 12, 4); const bob = W ? Math.sin(p * Math.PI * 4) * 0.8 : 0;
  // голова за телом: уши и макушка
  for (const sx of [-1, 1]) hp(c, () => { c.moveTo(sx * 2, -25 + bob); c.lineTo(sx * 6, -33 + bob); c.lineTo(sx * 6.5, -23 + bob); c.closePath(); }, K.dark);
  hp(c, () => c.ellipse(0, -23 + bob, 6, 4.5, 0, 0, 7), K.body);
  legPair(c, [-3.2, 3.2], -8, 8, 3.6, K.dark, p, W);
  hp(c, () => c.ellipse(0, -13 + bob, 9.5, 8.5, 0, 0, 7), K.body);
  c.fillStyle = K.dark; c.beginPath(); c.ellipse(0, -18 + bob, 3, 5, 0, 0, 7); c.fill();
  legPair(c, [-6, 6], -9, 9, 3.8, K.body, p + 0.25, W);
  // хвост машет
  const sw = Math.sin(p * Math.PI * 2 + 1) * (W ? 4 : 1.5);
  hp(c, () => { c.moveTo(-2, -12 + bob); c.quadraticCurveTo(sw, -2, sw * 1.3, fox ? 2 : -1); c.quadraticCurveTo(sw * 0.4 + 2, -4, 2, -12 + bob); c.closePath(); }, fox ? K.body : K.dark);
  if (fox) hp(c, () => c.ellipse(sw * 1.3, fox ? 1.5 : -1, 2, 1.6, 0, 0, 7), '#fff', 0.7);
}
// паук сверху-спереди/сзади: брюшко, головогрудь, 8 ног веером
function spiderTop(c, p, W, bite, K, front) {
  shadow(c, 18, 6); const bob = W ? Math.sin(p * Math.PI * 6) * 0.6 : 0;
  for (const side of [-1, 1]) for (let i = 0; i < 4; i++) {
    const ph = W ? Math.sin((p * 2 + i * 0.25 + (side > 0 ? 0.5 : 0)) * Math.PI * 2) * 2.5 : 0;
    const bx = side * 3, by = -11, ang = (front ? -0.5 : 0.5) + i * (front ? 0.45 : -0.45);
    const kx = side * (8 + i * 1.2), ky = -19 + i * 3 + ph * (front ? 1 : -1), fx = side * (14 + i * 0.8) + ph * side * 0.5, fy = -4 + i * 2.6;
    c.strokeStyle = O; c.lineWidth = 3.2; c.beginPath(); c.moveTo(bx, by); c.lineTo(kx, ky); c.lineTo(fx, fy); c.stroke();
    c.strokeStyle = K.dark; c.lineWidth = 1.6; c.stroke(); void ang;
  }
  if (front) {
    hp(c, () => c.ellipse(0, -15 + bob, 10, 8, 0, 0, 7), K.body, 1.2);
    hp(c, () => c.ellipse(0, -9 + bob, 7, 5.5, 0, 0, 7), K.light, 1.1);
    for (const [x, y, r] of [[-2.4, -11, 1.1], [2.4, -11, 1.1], [-1, -9, 0.8], [1, -9, 0.8], [-3.6, -9.4, 0.7], [3.6, -9.4, 0.7]]) { c.fillStyle = K.eye; c.beginPath(); c.arc(x, y + bob, r, 0, 7); c.fill(); }
    const j = bite * 1.6; for (const sx of [-1, 1]) hp(c, () => { c.moveTo(sx * 1.5, -5.5 + bob); c.quadraticCurveTo(sx * (3 + j), -2 + bob, sx * 1, -1.5 + bob); c.closePath(); }, '#d8c8a4', 0.6);
  } else {
    hp(c, () => c.ellipse(0, -9 + bob, 6.5, 5, 0, 0, 7), K.light, 1.1);
    hp(c, () => c.ellipse(0, -16 + bob, 11, 9.5, 0, 0, 7), K.body, 1.2);
    hp(c, () => { c.moveTo(0, -21 + bob); c.lineTo(3, -16 + bob); c.lineTo(0, -11 + bob); c.lineTo(-3, -16 + bob); c.closePath(); }, '#c8323a', 0.6);
    c.fillStyle = 'rgba(255,255,255,.15)'; c.beginPath(); c.ellipse(-3, -20 + bob, 4, 2, -0.3, 0, 7); c.fill();
  }
}

// ворона спереди и сзади: крылья в стороны
function crowFB(c, p, bite, front) {
  const fly = -26 + Math.sin(p * Math.PI * 2) * 2.5, flap = Math.sin(p * Math.PI * 4);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0, 1, 9, 2.6, 0, 0, 7); c.fill();
  c.save(); c.translate(0, fly + bite * 10);
  for (const sx of [-1, 1]) hp(c, () => { c.moveTo(sx * 3, -2); c.quadraticCurveTo(sx * 10, -8 - flap * 7, sx * 18, -4 - flap * 9); c.quadraticCurveTo(sx * 10, 0, sx * 3, 3); c.closePath(); }, '#2e2a36', 0.9);
  if (!front) hp(c, () => { c.moveTo(-3, 4); c.lineTo(0, 10); c.lineTo(3, 4); c.closePath(); }, '#1e1a24', 0.8);
  hp(c, () => c.ellipse(0, 0, 5, 6, 0, 0, 7), '#2e2a36', 1);
  hp(c, () => c.arc(0, -6, 4, 0, 7), '#2e2a36', 1);
  if (front) { hp(c, () => { c.moveTo(-1.6, -5); c.lineTo(0, 0 + bite * 2); c.lineTo(1.6, -5); c.closePath(); }, '#c9a24a', 0.8); c.fillStyle = '#ffd34d'; for (const x of [-1.8, 1.8]) { c.beginPath(); c.arc(x, -7, 0.9, 0, 7); c.fill(); } }
  c.restore();
}
